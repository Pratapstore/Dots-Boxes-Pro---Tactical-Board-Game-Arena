/**
 * WebSocket Multiplayer Client
 */

import { BoardDimension, GameState, PlayerId } from '../engine/types';

export interface OpponentInfo {
  name: string;
  avatar: string;
  rating: number;
  isConnected: boolean;
}

export interface NetworkCallbacks {
  onRoomCreated?: (data: { roomCode: string; role: PlayerId; boardSize: BoardDimension; gameState: GameState }) => void;
  onRoomJoined?: (data: { roomCode: string; role: PlayerId; boardSize: BoardDimension; gameState: GameState; opponent: OpponentInfo }) => void;
  onOpponentJoined?: (data: { opponent: OpponentInfo; gameState: GameState }) => void;
  onMatchFound?: (data: { roomCode: string; role: PlayerId; boardSize: BoardDimension; gameState: GameState; opponent: OpponentInfo }) => void;
  onMoveAccepted?: (data: { edgeId: string; player: PlayerId; completedBoxIds: string[]; awardedExtraTurn: boolean; isGameOver: boolean; gameState: GameState }) => void;
  onMoveRejected?: (error: string) => void;
  onRematchVote?: (player: PlayerId) => void;
  onMatchRestarted?: (gameState: GameState) => void;
  onPlayerDisconnected?: (role: PlayerId) => void;
  onPlayerReconnected?: (role: PlayerId) => void;
  onOpponentLeft?: () => void;
  onError?: (message: string) => void;
  onConnectionChange?: (connected: boolean) => void;
}

class NetworkClient {
  private ws: WebSocket | null = null;
  private callbacks: NetworkCallbacks = {};
  private pingInterval: number | null = null;
  private isConnected: boolean = false;
  private reconnectTimeout: number | null = null;
  private activeRoomCode: string | null = null;
  private activeUserId: string | null = null;
  private activeUserName: string = 'Player';
  private activeAvatar: string = 'tactician';
  private activeRating: number = 1200;

  public connect(callbacks: NetworkCallbacks) {
    this.callbacks = callbacks;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.callbacks.onConnectionChange?.(true);

        // Auto rejoin room if reconnecting
        if (this.activeRoomCode && this.activeUserId) {
          this.send({
            type: 'JOIN_ROOM',
            roomCode: this.activeRoomCode,
            userId: this.activeUserId,
            userName: this.activeUserName,
            avatar: this.activeAvatar,
            rating: this.activeRating,
          });
        }

        // Keep-alive heartbeat every 12 seconds
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = window.setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 12000);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (err) {
          console.error('Failed to parse WebSocket message', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.callbacks.onConnectionChange?.(false);
        if (this.pingInterval) clearInterval(this.pingInterval);

        // Auto-reconnect if match was active
        if (this.activeRoomCode && !this.reconnectTimeout) {
          this.reconnectTimeout = window.setTimeout(() => {
            this.reconnectTimeout = null;
            this.connect(this.callbacks);
          }, 1500);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket connection event', err);
      };
    } catch (err) {
      console.error('Failed to instantiate WebSocket', err);
      this.callbacks.onError?.('Could not establish real-time connection.');
    }
  }

  private handleMessage(msg: Record<string, unknown>) {
    switch (msg.type) {
      case 'PONG':
        // Heartbeat confirmed
        break;
      case 'ROOM_CREATED':
        if ((msg as any).roomCode) this.activeRoomCode = (msg as any).roomCode;
        this.callbacks.onRoomCreated?.(msg as unknown as Parameters<NonNullable<NetworkCallbacks['onRoomCreated']>>[0]);
        break;
      case 'ROOM_JOINED':
      case 'ROOM_RECONNECTED':
        if ((msg as any).roomCode) this.activeRoomCode = (msg as any).roomCode;
        this.callbacks.onRoomJoined?.(msg as unknown as Parameters<NonNullable<NetworkCallbacks['onRoomJoined']>>[0]);
        break;
      case 'OPPONENT_JOINED':
        this.callbacks.onOpponentJoined?.(msg as unknown as Parameters<NonNullable<NetworkCallbacks['onOpponentJoined']>>[0]);
        break;
      case 'MATCH_FOUND':
        if ((msg as any).roomCode) this.activeRoomCode = (msg as any).roomCode;
        this.callbacks.onMatchFound?.(msg as unknown as Parameters<NonNullable<NetworkCallbacks['onMatchFound']>>[0]);
        break;
      case 'MOVE_ACCEPTED':
        this.callbacks.onMoveAccepted?.(msg as unknown as Parameters<NonNullable<NetworkCallbacks['onMoveAccepted']>>[0]);
        break;
      case 'MOVE_REJECTED':
        this.callbacks.onMoveRejected?.((msg.error as string) || 'Move rejected by server');
        break;
      case 'REMATCH_VOTE':
        this.callbacks.onRematchVote?.(msg.player as PlayerId);
        break;
      case 'MATCH_RESTARTED':
        this.callbacks.onMatchRestarted?.(msg.gameState as GameState);
        break;
      case 'PLAYER_DISCONNECTED':
        this.callbacks.onPlayerDisconnected?.(msg.role as PlayerId);
        break;
      case 'PLAYER_RECONNECTED':
        this.callbacks.onPlayerReconnected?.(msg.role as PlayerId);
        break;
      case 'OPPONENT_LEFT':
        this.callbacks.onOpponentLeft?.();
        break;
      case 'ERROR':
        this.callbacks.onError?.((msg.message as string) || 'Unknown server error');
        break;
    }
  }

  public createRoom(userId: string, userName: string, avatar: string, boardSize: BoardDimension, rating: number) {
    this.activeUserId = userId;
    this.activeUserName = userName;
    this.activeAvatar = avatar;
    this.activeRating = rating;
    this.send({
      type: 'CREATE_ROOM',
      userId,
      userName,
      avatar,
      boardSize,
      rating,
    });
  }

  public joinRoom(roomCode: string, userId: string, userName: string, avatar: string, rating: number) {
    this.activeRoomCode = roomCode;
    this.activeUserId = userId;
    this.activeUserName = userName;
    this.activeAvatar = avatar;
    this.activeRating = rating;
    this.send({
      type: 'JOIN_ROOM',
      roomCode,
      userId,
      userName,
      avatar,
      rating,
    });
  }

  public joinQueue(userId: string, userName: string, avatar: string, boardSize: BoardDimension, rating: number) {
    this.activeUserId = userId;
    this.activeUserName = userName;
    this.activeAvatar = avatar;
    this.activeRating = rating;
    this.send({
      type: 'JOIN_QUEUE',
      userId,
      userName,
      avatar,
      boardSize,
      rating,
    });
  }

  public leaveQueue() {
    this.send({ type: 'LEAVE_QUEUE' });
  }

  public makeMove(edgeId: string) {
    this.send({
      type: 'MAKE_MOVE',
      edgeId,
    });
  }

  public requestRematch() {
    this.send({ type: 'REQUEST_REMATCH' });
  }

  public leaveRoom() {
    this.activeRoomCode = null;
    this.send({ type: 'LEAVE_ROOM' });
  }

  public disconnect() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  private send(payload: Record<string, unknown>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }
}

export const networkClient = new NetworkClient();
