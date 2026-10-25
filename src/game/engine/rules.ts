import { Box, Edge, GameState, Move, PlayerId } from './types';
import { getAdjacentBoxIds, getBoxDrawnEdgeCount } from './board';

export interface MoveResult {
  valid: boolean;
  error?: string;
  newState: GameState;
  completedBoxIds: string[];
  awardedExtraTurn: boolean;
  isGameOver: boolean;
}

/**
 * Pure authoritative function to execute a move
 */
export function applyMove(
  state: GameState,
  edgeId: string,
  player: PlayerId
): MoveResult {
  if (state.status !== 'PLAYING') {
    return {
      valid: false,
      error: 'Game is not in active playing state',
      newState: state,
      completedBoxIds: [],
      awardedExtraTurn: false,
      isGameOver: state.status === 'FINISHED',
    };
  }

  if (state.currentPlayer !== player) {
    return {
      valid: false,
      error: `Not ${player}'s turn. Current turn: ${state.currentPlayer}`,
      newState: state,
      completedBoxIds: [],
      awardedExtraTurn: false,
      isGameOver: false,
    };
  }

  const targetEdge = state.edges[edgeId];
  if (!targetEdge) {
    return {
      valid: false,
      error: `Invalid edge ID: ${edgeId}`,
      newState: state,
      completedBoxIds: [],
      awardedExtraTurn: false,
      isGameOver: false,
    };
  }

  if (targetEdge.owner !== null) {
    return {
      valid: false,
      error: `Edge ${edgeId} is already claimed by ${targetEdge.owner}`,
      newState: state,
      completedBoxIds: [],
      awardedExtraTurn: false,
      isGameOver: false,
    };
  }

  // Clone state immutably
  const newEdges: Record<string, Edge> = {
    ...state.edges,
    [edgeId]: {
      ...targetEdge,
      owner: player,
      timestamp: Date.now(),
    },
  };

  const newBoxes: Record<string, Box> = { ...state.boxes };
  const adjacentBoxIds = getAdjacentBoxIds(edgeId, state.rows, state.cols);
  const newlyCompletedBoxIds: string[] = [];

  const moveIndex = state.moves.length;

  for (const boxId of adjacentBoxIds) {
    const box = newBoxes[boxId];
    if (box && box.owner === null) {
      const drawnCount = getBoxDrawnEdgeCount(box, newEdges);
      if (drawnCount === 4) {
        newlyCompletedBoxIds.push(boxId);
        newBoxes[boxId] = {
          ...box,
          owner: player,
          claimedMoveIndex: moveIndex,
        };
      }
    }
  }

  const awardedExtraTurn = newlyCompletedBoxIds.length > 0;
  const newScores = {
    ...state.scores,
    [player]: state.scores[player] + newlyCompletedBoxIds.length,
  };

  const nextPlayer: PlayerId = awardedExtraTurn
    ? player
    : player === 'player1'
    ? 'player2'
    : 'player1';

  const newCompletedCount = state.completedBoxesCount + newlyCompletedBoxIds.length;
  const isGameOver = newCompletedCount >= state.totalBoxes;

  let winner: PlayerId | 'DRAW' | null = null;
  let status: 'READY' | 'PLAYING' | 'FINISHED' = state.status;

  if (isGameOver) {
    status = 'FINISHED';
    if (newScores.player1 > newScores.player2) {
      winner = 'player1';
    } else if (newScores.player2 > newScores.player1) {
      winner = 'player2';
    } else {
      winner = 'DRAW';
    }
  }

  const moveRecord: Move = {
    moveIndex,
    player,
    edgeId,
    completedBoxIds: newlyCompletedBoxIds,
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

  return {
    valid: true,
    newState,
    completedBoxIds: newlyCompletedBoxIds,
    awardedExtraTurn,
    isGameOver,
  };
}

/**
 * Undo last move in practice mode
 */
export function undoLastMove(state: GameState): GameState {
  if (state.moves.length === 0) return state;

  const lastMove = state.moves[state.moves.length - 1];
  const newEdges: Record<string, Edge> = {
    ...state.edges,
    [lastMove.edgeId]: {
      ...state.edges[lastMove.edgeId],
      owner: null,
      timestamp: undefined,
    },
  };

  const newBoxes: Record<string, Box> = { ...state.boxes };
  for (const boxId of lastMove.completedBoxIds) {
    if (newBoxes[boxId]) {
      newBoxes[boxId] = {
        ...newBoxes[boxId],
        owner: null,
        claimedMoveIndex: undefined,
      };
    }
  }

  const newScores = {
    ...state.scores,
    [lastMove.player]: state.scores[lastMove.player] - lastMove.completedBoxIds.length,
  };

  const newMoves = state.moves.slice(0, -1);
  const previousMoveEdgeId = newMoves.length > 0 ? newMoves[newMoves.length - 1].edgeId : null;

  return {
    ...state,
    edges: newEdges,
    boxes: newBoxes,
    currentPlayer: lastMove.player, // Return turn to the player who made the move
    scores: newScores,
    moves: newMoves,
    status: 'PLAYING',
    winner: null,
    lastMoveEdgeId: previousMoveEdgeId,
    extraTurnAwarded: false,
    completedBoxesCount: state.completedBoxesCount - lastMove.completedBoxIds.length,
  };
}
