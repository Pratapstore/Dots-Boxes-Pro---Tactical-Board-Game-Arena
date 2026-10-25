/**
 * Dots & Boxes Pro — Full-Stack Multiplayer Server
 * Authoritative Game Logic, Room Manager, Matchmaking & WebSockets
 * Self-contained for native Node.js 22 production execution on Cloud Run
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// Core Engine Types & Logic embedded for zero-dependency ESM resolution in Node 22
type PlayerId = 'player1' | 'player2';
type BoardDimension = 3 | 4 | 5 | 6 | 8 | 10;

interface Edge {
  id: string;
  orientation: 'H' | 'V';
  r1: number;
  c1: number;
  r2: number;
  c2: number;
  owner: PlayerId | null;
  timestamp?: number;
}

interface Box {
  id: string;
  row: number;
  col: number;
  topEdgeId: string;
  rightEdgeId: string;
  bottomEdgeId: string;
  leftEdgeId: string;
  owner: PlayerId | null;
  claimedMoveIndex?: number;
}

interface Move {
  moveIndex: number;
  player: PlayerId;
  edgeId: string;
  completedBoxIds: string[];
  timestamp: number;
}

interface GameState {
  boardSize: BoardDimension;
  rows: number;
  cols: number;
  edges: Record<string, Edge>;
  boxes: Record<string, Box>;
  currentPlayer: PlayerId;
  scores: Record<PlayerId, number>;
  moves: Move[];
  status: 'READY' | 'PLAYING' | 'FINISHED';
  winner: PlayerId | 'DRAW' | null;
  lastMoveEdgeId: string | null;
  extraTurnAwarded: boolean;
  totalBoxes: number;
  completedBoxesCount: number;
}

function createInitialGameState(boardSize: BoardDimension = 4): GameState {
  const rows = boardSize;
  const cols = boardSize;
  const edges: Record<string, Edge> = {};
  const boxes: Record<string, Box> = {};

  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `h_${r}_${c}`;
      edges[id] = { id, orientation: 'H', r1: r, c1: c, r2: r, c2: c + 1, owner: null };
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const id = `v_${r}_${c}`;
      edges[id] = { id, orientation: 'V', r1: r, c1: c, r2: r + 1, c2: c, owner: null };
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `b_${r}_${c}`;
      boxes[id] = {
        id,
        row: r,
        col: c,
        topEdgeId: `h_${r}_${c}`,
        rightEdgeId: `v_${r}_${c + 1}`,
        bottomEdgeId: `h_${r + 1}_${c}`,
        leftEdgeId: `v_${r}_${c}`,
        owner: null,
      };
    }
  }

  return {
    boardSize,
    rows,
    cols,
    edges,
    boxes,
    currentPlayer: 'player1',
    scores: { player1: 0, player2: 0 },
    moves: [],
    status: 'PLAYING',
    winner: null,
    lastMoveEdgeId: null,
    extraTurnAwarded: false,
    totalBoxes: rows * cols,
    completedBoxesCount: 0,
  };
}

function getAdjacentBoxIds(edgeId: string, rows: number, cols: number): string[] {
  const parts = edgeId.split('_');
  const type = parts[0];
  const r = parseInt(parts[1], 10);
  const c = parseInt(parts[2], 10);
  const adjacent: string[] = [];

  if (type === 'h') {
    if (r > 0) adjacent.push(`b_${r - 1}_${c}`);
    if (r < rows) adjacent.push(`b_${r}_${c}`);
  } else if (type === 'v') {
    if (c > 0) adjacent.push(`b_${r}_${c - 1}`);
    if (c < cols) adjacent.push(`b_${r}_${c}`);
  }
  return adjacent;
}

function getBoxDrawnEdgeCount(box: Box, edges: Record<string, Edge>): number {
  let count = 0;
  if (edges[box.topEdgeId]?.owner !== null) count++;
  if (edges[box.rightEdgeId]?.owner !== null) count++;
  if (edges[box.bottomEdgeId]?.owner !== null) count++;
  if (edges[box.leftEdgeId]?.owner !== null) count++;
  return count;
}

function applyMove(state: GameState, edgeId: string, player: PlayerId) {
  if (state.status !== 'PLAYING') {
    return { valid: false, error: 'Match is not in active state', newState: state, completedBoxIds: [], awardedExtraTurn: false, isGameOver: state.status === 'FINISHED' };
  }
  if (state.currentPlayer !== player) {
    return { valid: false, error: `Not ${player}'s turn. Current turn: ${state.currentPlayer}`, newState: state, completedBoxIds: [], awardedExtraTurn: false, isGameOver: false };
  }
  const targetEdge = state.edges[edgeId];
  if (!targetEdge || targetEdge.owner !== null) {
    return { valid: false, error: 'Illegal move: edge already occupied', newState: state, completedBoxIds: [], awardedExtraTurn: false, isGameOver: false };
  }

  const newEdges: Record<string, Edge> = {
    ...state.edges,
    [edgeId]: { ...targetEdge, owner: player, timestamp: Date.now() },
  };

  const newBoxes: Record<string, Box> = { ...state.boxes };
  const adjBoxIds = getAdjacentBoxIds(edgeId, state.rows, state.cols);
  const newlyCompleted: string[] = [];
  const moveIndex = state.moves.length;

  for (const bId of adjBoxIds) {
    const box = newBoxes[bId];
    if (box && box.owner === null) {
      if (getBoxDrawnEdgeCount(box, newEdges) === 4) {
        newlyCompleted.push(bId);
        newBoxes[bId] = { ...box, owner: player, claimedMoveIndex: moveIndex };
      }
    }
  }

  const awardedExtraTurn = newlyCompleted.length > 0;
  const newScores = {
    ...state.scores,
    [player]: state.scores[player] + newlyCompleted.length,
  };

  const nextPlayer: PlayerId = awardedExtraTurn
    ? player
    : player === 'player1'
    ? 'player2'
    : 'player1';

  const newCompletedCount = state.completedBoxesCount + newlyCompleted.length;
  const isGameOver = newCompletedCount >= state.totalBoxes;
  let winner: PlayerId | 'DRAW' | null = null;
  let status: 'READY' | 'PLAYING' | 'FINISHED' = state.status;

  if (isGameOver) {
    status = 'FINISHED';
    if (newScores.player1 > newScores.player2) winner = 'player1';
    else if (newScores.player2 > newScores.player1) winner = 'player2';
    else winner = 'DRAW';
  }

  const moveRecord: Move = {
    moveIndex,
    player,
    edgeId,
    completedBoxIds: newlyCompleted,
    timestamp: Date.now(),
  };

  const newState: GameState = {
    ...state,
    edges: newEdges,
    boxes: newBoxes,
    currentPlayer: nextPlayer,
    scores: newScores,
    moves: [...state.moves, moveRecord],
    status,
    winner,
    lastMoveEdgeId: edgeId,
    extraTurnAwarded: awardedExtraTurn,
    completedBoxesCount: newCompletedCount,
  };

  return { valid: true, newState, completedBoxIds: newlyCompleted, awardedExtraTurn, isGameOver };
}

// Room & Matchmaking Manager
interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  role: PlayerId;
  ws: WebSocket | null;
  isConnected: boolean;
  rating: number;
}

interface Room {
  code: string;
  boardSize: BoardDimension;
  gameState: GameState;
  players: Partial<Record<PlayerId, RoomPlayer>>;
  rematchVotes: Record<PlayerId, boolean>;
  isBotOpponent?: boolean;
  createdAt: number;
  lastActive: number;
}

interface QueuedPlayer {
  userId: string;
  userName: string;
  avatar: string;
  rating: number;
  boardSize: BoardDimension;
  ws: WebSocket;
  timeoutId?: NodeJS.Timeout;
}

const rooms = new Map<string, Room>();
const matchmakingQueue: QueuedPlayer[] = [];

function pickServerBotMove(state: GameState): string | null {
  const freeEdges: string[] = [];
  for (const id in state.edges) {
    if (state.edges[id].owner === null) {
      freeEdges.push(id);
    }
  }
  if (freeEdges.length === 0) return null;

  // 1. Immediate captures
  for (const edgeId of freeEdges) {
    const adjBoxes = getAdjacentBoxIds(edgeId, state.rows, state.cols);
    for (const bId of adjBoxes) {
      const box = state.boxes[bId];
      if (box && box.owner === null && getBoxDrawnEdgeCount(box, state.edges) === 3) {
        return edgeId;
      }
    }
  }

  // 2. Safe moves (does not create a 3rd edge in any box)
  const safeMoves: string[] = [];
  for (const edgeId of freeEdges) {
    const adjBoxes = getAdjacentBoxIds(edgeId, state.rows, state.cols);
    let wouldGiveBox = false;
    for (const bId of adjBoxes) {
      const box = state.boxes[bId];
      if (box && box.owner === null && getBoxDrawnEdgeCount(box, state.edges) === 2) {
        wouldGiveBox = true;
        break;
      }
    }
    if (!wouldGiveBox) {
      safeMoves.push(edgeId);
    }
  }

  if (safeMoves.length > 0) {
    return safeMoves[Math.floor(Math.random() * safeMoves.length)];
  }

  // 3. Fallback: pick edge opening smallest concession
  let bestEdge = freeEdges[0];
  let minDanger = Infinity;
  for (const edgeId of freeEdges) {
    const adjBoxes = getAdjacentBoxIds(edgeId, state.rows, state.cols);
    let danger = 0;
    for (const bId of adjBoxes) {
      const box = state.boxes[bId];
      if (box && box.owner === null && getBoxDrawnEdgeCount(box, state.edges) === 2) {
        danger++;
      }
    }
    if (danger < minDanger) {
      minDanger = danger;
      bestEdge = edgeId;
    }
  }

  return bestEdge;
}

function triggerServerBotTurn(room: Room) {
  if (
    !room.isBotOpponent ||
    room.gameState.status !== 'PLAYING' ||
    room.gameState.currentPlayer !== 'player2'
  ) {
    return;
  }

  const delay = Math.floor(550 + Math.random() * 350);
  setTimeout(() => {
    if (
      !rooms.has(room.code) ||
      room.gameState.status !== 'PLAYING' ||
      room.gameState.currentPlayer !== 'player2'
    ) {
      return;
    }

    const botEdge = pickServerBotMove(room.gameState);
    if (!botEdge) return;

    room.lastActive = Date.now();
    const result = applyMove(room.gameState, botEdge, 'player2');
    if (!result.valid) return;

    room.gameState = result.newState;
    broadcastRoom(room, {
      type: 'MOVE_ACCEPTED',
      edgeId: botEdge,
      player: 'player2',
      completedBoxIds: result.completedBoxIds,
      awardedExtraTurn: result.awardedExtraTurn,
      isGameOver: result.isGameOver,
      gameState: room.gameState,
    });

    if (result.awardedExtraTurn && !result.isGameOver) {
      triggerServerBotTurn(room);
    }
  }, delay);
}

// Cleanup inactive rooms
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.lastActive > 2 * 3600 * 1000) {
      rooms.delete(code);
    }
  }
}, 60 * 1000);

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'DOTS-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function broadcastRoom(room: Room, message: Record<string, unknown>) {
  const payload = JSON.stringify(message);
  for (const role of ['player1', 'player2'] as PlayerId[]) {
    const p = room.players[role];
    if (p && p.ws && p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(payload);
    }
  }
}

// Setup Express and WebSocket server
const app = express();
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  let currentRoomCode: string | null = null;
  let currentRole: PlayerId | null = null;
  let currentUserId: string | null = null;

  ws.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'PING':
          ws.send(JSON.stringify({ type: 'PONG' }));
          break;

        case 'CREATE_ROOM': {
          const boardSize: BoardDimension = msg.boardSize || 4;
          const code = generateRoomCode();
          const player: RoomPlayer = {
            id: msg.userId,
            name: msg.userName || 'Player 1',
            avatar: msg.avatar || 'tactician',
            role: 'player1',
            ws,
            isConnected: true,
            rating: msg.rating || 1200,
          };

          const room: Room = {
            code,
            boardSize,
            gameState: createInitialGameState(boardSize),
            players: { player1: player },
            rematchVotes: { player1: false, player2: false },
            createdAt: Date.now(),
            lastActive: Date.now(),
          };

          rooms.set(code, room);
          currentRoomCode = code;
          currentRole = 'player1';
          currentUserId = msg.userId;

          ws.send(
            JSON.stringify({
              type: 'ROOM_CREATED',
              roomCode: code,
              role: 'player1',
              boardSize,
              gameState: room.gameState,
            })
          );
          break;
        }

        case 'JOIN_ROOM': {
          const code = (msg.roomCode || '').toUpperCase().trim();
          const room = rooms.get(code);

          if (!room) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found. Check the code.' }));
            return;
          }

          // Reconnect logic
          if (room.players.player1 && room.players.player1.id === msg.userId) {
            room.players.player1.ws = ws;
            room.players.player1.isConnected = true;
            currentRoomCode = code;
            currentRole = 'player1';
            currentUserId = msg.userId;
            room.lastActive = Date.now();

            ws.send(
              JSON.stringify({
                type: 'ROOM_RECONNECTED',
                roomCode: code,
                role: 'player1',
                boardSize: room.boardSize,
                gameState: room.gameState,
                opponent: room.players.player2
                  ? {
                      name: room.players.player2.name,
                      avatar: room.players.player2.avatar,
                      rating: room.players.player2.rating,
                      isConnected: room.players.player2.isConnected,
                    }
                  : null,
              })
            );
            broadcastRoom(room, { type: 'PLAYER_RECONNECTED', role: 'player1' });
            return;
          }

          if (room.players.player2 && room.players.player2.id === msg.userId) {
            room.players.player2.ws = ws;
            room.players.player2.isConnected = true;
            currentRoomCode = code;
            currentRole = 'player2';
            currentUserId = msg.userId;
            room.lastActive = Date.now();

            ws.send(
              JSON.stringify({
                type: 'ROOM_RECONNECTED',
                roomCode: code,
                role: 'player2',
                boardSize: room.boardSize,
                gameState: room.gameState,
                opponent: {
                  name: room.players.player1!.name,
                  avatar: room.players.player1!.avatar,
                  rating: room.players.player1!.rating,
                  isConnected: room.players.player1!.isConnected,
                },
              })
            );
            broadcastRoom(room, { type: 'PLAYER_RECONNECTED', role: 'player2' });
            return;
          }

          if (room.players.player2) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is already full.' }));
            return;
          }

          const player2: RoomPlayer = {
            id: msg.userId,
            name: msg.userName || 'Player 2',
            avatar: msg.avatar || 'grandmaster',
            role: 'player2',
            ws,
            isConnected: true,
            rating: msg.rating || 1200,
          };

          room.players.player2 = player2;
          currentRoomCode = code;
          currentRole = 'player2';
          currentUserId = msg.userId;
          room.lastActive = Date.now();

          ws.send(
            JSON.stringify({
              type: 'ROOM_JOINED',
              roomCode: code,
              role: 'player2',
              boardSize: room.boardSize,
              gameState: room.gameState,
              opponent: {
                name: room.players.player1!.name,
                avatar: room.players.player1!.avatar,
                rating: room.players.player1!.rating,
                isConnected: true,
              },
            })
          );

          if (room.players.player1?.ws?.readyState === WebSocket.OPEN) {
            room.players.player1.ws.send(
              JSON.stringify({
                type: 'OPPONENT_JOINED',
                opponent: {
                  name: player2.name,
                  avatar: player2.avatar,
                  rating: player2.rating,
                  isConnected: true,
                },
                gameState: room.gameState,
              })
            );
          }
          break;
        }

        case 'JOIN_QUEUE': {
          const boardSize: BoardDimension = msg.boardSize || 4;
          currentUserId = msg.userId;

          const matchIdx = matchmakingQueue.findIndex(
            (q) => q.userId !== msg.userId && q.boardSize === boardSize && q.ws.readyState === WebSocket.OPEN
          );

          if (matchIdx !== -1) {
            const opp = matchmakingQueue.splice(matchIdx, 1)[0];
            if (opp.timeoutId) clearTimeout(opp.timeoutId);
            const code = generateRoomCode();

            const p1: RoomPlayer = {
              id: opp.userId,
              name: opp.userName,
              avatar: opp.avatar,
              role: 'player1',
              ws: opp.ws,
              isConnected: true,
              rating: opp.rating,
            };

            const p2: RoomPlayer = {
              id: msg.userId,
              name: msg.userName,
              avatar: msg.avatar,
              role: 'player2',
              ws,
              isConnected: true,
              rating: msg.rating || 1200,
            };

            const room: Room = {
              code,
              boardSize,
              gameState: createInitialGameState(boardSize),
              players: { player1: p1, player2: p2 },
              rematchVotes: { player1: false, player2: false },
              createdAt: Date.now(),
              lastActive: Date.now(),
            };

            rooms.set(code, room);
            currentRoomCode = code;
            currentRole = 'player2';

            p1.ws?.send(
              JSON.stringify({
                type: 'MATCH_FOUND',
                roomCode: code,
                role: 'player1',
                boardSize,
                gameState: room.gameState,
                opponent: {
                  name: p2.name,
                  avatar: p2.avatar,
                  rating: p2.rating,
                  isConnected: true,
                },
              })
            );

            p2.ws?.send(
              JSON.stringify({
                type: 'MATCH_FOUND',
                roomCode: code,
                role: 'player2',
                boardSize,
                gameState: room.gameState,
                opponent: {
                  name: p1.name,
                  avatar: p1.avatar,
                  rating: p1.rating,
                  isConnected: true,
                },
              })
            );
          } else {
            // Queue player and set a 3.5s pairing timer for instant matchmaking
            const queuedPlayer: QueuedPlayer = {
              userId: msg.userId,
              userName: msg.userName || 'Player',
              avatar: msg.avatar || 'tactician',
              rating: msg.rating || 1200,
              boardSize,
              ws,
            };

            queuedPlayer.timeoutId = setTimeout(() => {
              const qIndex = matchmakingQueue.indexOf(queuedPlayer);
              if (qIndex === -1 || ws.readyState !== WebSocket.OPEN) return;
              matchmakingQueue.splice(qIndex, 1);

              // Pair with an active AI challenger bot
              const botNames = ['ApexMaster', 'VortexPilot', 'MatrixKnight', 'GridTitan', 'CyberSlayer', 'AlphaMind', 'NeonGlider', 'HyperBoxer'];
              const botAvatars = ['grandmaster', 'tactician', 'ninja', 'titan', 'nova'];
              const botName = botNames[Math.floor(Math.random() * botNames.length)];
              const botAvatar = botAvatars[Math.floor(Math.random() * botAvatars.length)];
              const botRating = Math.max(900, queuedPlayer.rating + Math.floor(Math.random() * 50 - 25));
              const code = generateRoomCode();

              const p1: RoomPlayer = {
                id: queuedPlayer.userId,
                name: queuedPlayer.userName,
                avatar: queuedPlayer.avatar,
                role: 'player1',
                ws: queuedPlayer.ws,
                isConnected: true,
                rating: queuedPlayer.rating,
              };

              const p2: RoomPlayer = {
                id: `bot_${Date.now()}`,
                name: botName,
                avatar: botAvatar,
                role: 'player2',
                ws: null,
                isConnected: true,
                rating: botRating,
              };

              const room: Room = {
                code,
                boardSize,
                gameState: createInitialGameState(boardSize),
                players: { player1: p1, player2: p2 },
                rematchVotes: { player1: false, player2: false },
                isBotOpponent: true,
                createdAt: Date.now(),
                lastActive: Date.now(),
              };

              rooms.set(code, room);
              currentRoomCode = code;
              currentRole = 'player1';

              p1.ws?.send(
                JSON.stringify({
                  type: 'MATCH_FOUND',
                  roomCode: code,
                  role: 'player1',
                  boardSize,
                  gameState: room.gameState,
                  opponent: {
                    name: p2.name,
                    avatar: p2.avatar,
                    rating: p2.rating,
                    isConnected: true,
                  },
                })
              );
            }, 3500);

            matchmakingQueue.push(queuedPlayer);
            ws.send(JSON.stringify({ type: 'QUEUE_WAITING' }));
          }
          break;
        }

        case 'LEAVE_QUEUE': {
          const idx = matchmakingQueue.findIndex((q) => q.ws === ws);
          if (idx !== -1) {
            const [removed] = matchmakingQueue.splice(idx, 1);
            if (removed?.timeoutId) clearTimeout(removed.timeoutId);
          }
          ws.send(JSON.stringify({ type: 'QUEUE_LEFT' }));
          break;
        }

        case 'MAKE_MOVE': {
          if (!currentRoomCode || !currentRole) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          room.lastActive = Date.now();
          const result = applyMove(room.gameState, msg.edgeId, currentRole);
          if (!result.valid) {
            ws.send(JSON.stringify({ type: 'MOVE_REJECTED', error: result.error }));
            return;
          }

          room.gameState = result.newState;
          broadcastRoom(room, {
            type: 'MOVE_ACCEPTED',
            edgeId: msg.edgeId,
            player: currentRole,
            completedBoxIds: result.completedBoxIds,
            awardedExtraTurn: result.awardedExtraTurn,
            isGameOver: result.isGameOver,
            gameState: room.gameState,
          });

          // If playing against a bot and it becomes bot's turn, trigger bot play
          if (
            room.isBotOpponent &&
            room.gameState.status === 'PLAYING' &&
            room.gameState.currentPlayer === 'player2'
          ) {
            triggerServerBotTurn(room);
          }
          break;
        }

        case 'REQUEST_REMATCH': {
          if (!currentRoomCode || !currentRole) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;

          room.rematchVotes[currentRole] = true;
          broadcastRoom(room, { type: 'REMATCH_VOTE', player: currentRole });

          // If opponent is a bot, bot automatically agrees to rematch
          if (room.isBotOpponent) {
            room.rematchVotes.player2 = true;
          }

          if (room.rematchVotes.player1 && room.rematchVotes.player2) {
            room.gameState = createInitialGameState(room.boardSize);
            room.rematchVotes = { player1: false, player2: false };
            broadcastRoom(room, { type: 'MATCH_RESTARTED', gameState: room.gameState });
          }
          break;
        }

        case 'LEAVE_ROOM': {
          if (currentRoomCode) {
            const room = rooms.get(currentRoomCode);
            if (room && currentRole) {
              delete room.players[currentRole];
              broadcastRoom(room, { type: 'OPPONENT_LEFT' });
            }
          }
          currentRoomCode = null;
          currentRole = null;
          break;
        }
      }
    } catch (err) {
      console.error('Error handling WebSocket message', err);
    }
  });

  ws.on('close', () => {
    const qIdx = matchmakingQueue.findIndex((q) => q.ws === ws);
    if (qIdx !== -1) {
      const [removed] = matchmakingQueue.splice(qIdx, 1);
      if (removed?.timeoutId) clearTimeout(removed.timeoutId);
    }

    if (currentRoomCode && currentRole) {
      const room = rooms.get(currentRoomCode);
      if (room) {
        const p = room.players[currentRole];
        if (p) {
          p.isConnected = false;
          broadcastRoom(room, { type: 'PLAYER_DISCONNECTED', role: currentRole });
        }
      }
    }
  });
});

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    activeRooms: rooms.size,
    queuedPlayers: matchmakingQueue.length,
    timestamp: Date.now(),
  });
});

// ZIP Source Code & cPanel Build Download Endpoints
app.get(['/download/cpanel-build.zip', '/download/cpanel-files.zip', '/cpanel-build.zip', '/cpanel-files.zip'], (req, res) => {
  const zipPath = path.resolve(__dirname, 'public', 'cpanel-ready-build.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'cpanel-ready-build.zip');
  } else {
    res.status(404).send('cPanel build ZIP not found');
  }
});

// Direct single file downloads from dist for cPanel manual upload
app.get('/download/cpanel/:filename', (req, res) => {
  let filename = req.params.filename;
  if (filename === 'htaccess') filename = '.htaccess';
  const safeFilename = path.basename(filename);
  const filePath = path.resolve(__dirname, 'dist', safeFilename);
  if (fs.existsSync(filePath)) {
    res.download(filePath, safeFilename, { dotfiles: 'allow' });
  } else {
    res.status(404).send(`File ${safeFilename} not found in build`);
  }
});

app.get('/download/code.zip', (req, res) => {
  const zipPath = path.resolve(__dirname, 'public', 'dots-and-boxes-pro-source.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'dots-and-boxes-pro-source.zip');
  } else {
    res.status(404).send('ZIP file not found');
  }
});

app.get('/dots-and-boxes-pro-source.zip', (req, res) => {
  const zipPath = path.resolve(__dirname, 'public', 'dots-and-boxes-pro-source.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'dots-and-boxes-pro-source.zip');
  } else {
    res.status(404).send('ZIP file not found');
  }
});

app.get('/api/leaderboard', (req, res) => {
  const leaderboard = [
    { rank: 1, name: 'VortexStrategist', avatar: 'grandmaster', rating: 2180, wins: 142, level: 32 },
    { rank: 2, name: 'BoxMatrix99', avatar: 'tactician', rating: 2045, wins: 118, level: 28 },
    { rank: 3, name: 'CyberKnot', avatar: 'ninja', rating: 1980, wins: 95, level: 24 },
    { rank: 4, name: 'GridTitan', avatar: 'titan', rating: 1910, wins: 88, level: 22 },
    { rank: 5, name: 'NovaTactics', avatar: 'nova', rating: 1850, wins: 76, level: 19 },
    { rank: 6, name: 'ChainMaster', avatar: 'pilot', rating: 1790, wins: 64, level: 17 },
    { rank: 7, name: 'OracleMind', avatar: 'oracle', rating: 1720, wins: 59, level: 15 },
    { rank: 8, name: 'NeonMaverick', avatar: 'maverick', rating: 1680, wins: 51, level: 13 },
  ];
  res.json(leaderboard);
});

// Static assets and fallback
const distDir = path.resolve(__dirname, 'dist');

// Development Vite middleware or Production SPA catch-all
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite middleware could not be loaded, serving static files:', err);
    }
  } else {
    // Production: serve built static files from dist
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
    }
    app.get('*', (req, res) => {
      const indexPath = path.resolve(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.sendFile(path.resolve(__dirname, 'index.html'));
      }
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Dots & Boxes Pro server successfully listening on 0.0.0.0:${PORT} (Production: ${isProd})`);
  });
}

startServer();
