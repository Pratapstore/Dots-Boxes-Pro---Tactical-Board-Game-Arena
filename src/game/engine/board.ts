import { BoardDimension, Box, Edge, GameState, PlayerId } from './types';

/**
 * Creates an empty game board of dimension N x N boxes
 */
export function createInitialGameState(boardSize: BoardDimension = 4): GameState {
  const rows = boardSize;
  const cols = boardSize;
  const edges: Record<string, Edge> = {};
  const boxes: Record<string, Box> = {};

  // 1. Generate Horizontal Edges: (rows + 1) rows, cols edges per row
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `h_${r}_${c}`;
      edges[id] = {
        id,
        orientation: 'H',
        r1: r,
        c1: c,
        r2: r,
        c2: c + 1,
        owner: null,
      };
    }
  }

  // 2. Generate Vertical Edges: rows rows, (cols + 1) edges per row
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const id = `v_${r}_${c}`;
      edges[id] = {
        id,
        orientation: 'V',
        r1: r,
        c1: c,
        r2: r + 1,
        c2: c,
        owner: null,
      };
    }
  }

  // 3. Generate Boxes
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
    scores: {
      player1: 0,
      player2: 0,
    },
    moves: [],
    status: 'PLAYING',
    winner: null,
    lastMoveEdgeId: null,
    extraTurnAwarded: false,
    totalBoxes: rows * cols,
    completedBoxesCount: 0,
  };
}

/**
 * Returns all boxes that border a given edge
 */
export function getAdjacentBoxIds(edgeId: string, rows: number, cols: number): string[] {
  const parts = edgeId.split('_');
  const type = parts[0]; // 'h' or 'v'
  const r = parseInt(parts[1], 10);
  const c = parseInt(parts[2], 10);
  const adjacent: string[] = [];

  if (type === 'h') {
    // Edge is horizontal
    // Box above: (r - 1, c)
    if (r > 0) {
      adjacent.push(`b_${r - 1}_${c}`);
    }
    // Box below: (r, c)
    if (r < rows) {
      adjacent.push(`b_${r}_${c}`);
    }
  } else if (type === 'v') {
    // Edge is vertical
    // Box left: (r, c - 1)
    if (c > 0) {
      adjacent.push(`b_${r}_${c - 1}`);
    }
    // Box right: (r, c)
    if (c < cols) {
      adjacent.push(`b_${r}_${c}`);
    }
  }

  return adjacent;
}

/**
 * Returns the number of edges already drawn for a box
 */
export function getBoxDrawnEdgeCount(box: Box, edges: Record<string, Edge>): number {
  let count = 0;
  if (edges[box.topEdgeId]?.owner !== null) count++;
  if (edges[box.rightEdgeId]?.owner !== null) count++;
  if (edges[box.bottomEdgeId]?.owner !== null) count++;
  if (edges[box.leftEdgeId]?.owner !== null) count++;
  return count;
}

/**
 * Returns the unowned edges of a box
 */
export function getBoxUnclaimedEdges(box: Box, edges: Record<string, Edge>): string[] {
  const unclaimed: string[] = [];
  if (edges[box.topEdgeId]?.owner === null) unclaimed.push(box.topEdgeId);
  if (edges[box.rightEdgeId]?.owner === null) unclaimed.push(box.rightEdgeId);
  if (edges[box.bottomEdgeId]?.owner === null) unclaimed.push(box.bottomEdgeId);
  if (edges[box.leftEdgeId]?.owner === null) unclaimed.push(box.leftEdgeId);
  return unclaimed;
}

/**
 * Returns list of all legal moves (edges that have owner === null)
 */
export function getLegalMoves(state: GameState): string[] {
  const legal: string[] = [];
  for (const edgeId in state.edges) {
    if (state.edges[edgeId].owner === null) {
      legal.push(edgeId);
    }
  }
  return legal;
}
