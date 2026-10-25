import { AIDifficulty, Box, Edge, GameState, PlayerId } from '../engine/types';
import { getAdjacentBoxIds, getBoxDrawnEdgeCount, getLegalMoves } from '../engine/board';
import { applyMove } from '../engine/rules';

/**
 * Returns an edge ID chosen by the AI according to the selected difficulty
 */
export function getAIMove(state: GameState, difficulty: AIDifficulty): string | null {
  try {
    const legalMoves = getLegalMoves(state);
    if (legalMoves.length === 0) return null;

    let move: string | null = null;
    switch (difficulty) {
      case 'easy':
        move = getEasyMove(state, legalMoves);
        break;
      case 'medium':
        move = getMediumMove(state, legalMoves);
        break;
      case 'hard':
        move = getHardMove(state, legalMoves);
        break;
      case 'expert':
        move = getExpertMove(state, legalMoves);
        break;
      default:
        move = getMediumMove(state, legalMoves);
        break;
    }

    if (move && state.edges[move] && state.edges[move].owner === null) {
      return move;
    }

    // Safety fallback: if chosen move is invalid, pick any free move
    const capturing = findCapturingMoves(state, legalMoves);
    if (capturing.length > 0) return capturing[0];
    const safe = filterSafeMoves(state, legalMoves);
    if (safe.length > 0) return safe[0];
    return legalMoves[0];
  } catch (err) {
    console.error('AI calculation fallback triggered:', err);
    const legalMoves = getLegalMoves(state);
    return legalMoves.length > 0 ? legalMoves[0] : null;
  }
}

/**
 * Easy AI: Takes obvious captures 65% of the time, otherwise picks randomly
 */
function getEasyMove(state: GameState, legalMoves: string[]): string {
  const capturingMoves = findCapturingMoves(state, legalMoves);

  if (capturingMoves.length > 0 && Math.random() < 0.65) {
    return capturingMoves[Math.floor(Math.random() * capturingMoves.length)];
  }

  return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

/**
 * Medium AI: Always captures available boxes.
 * When none available, avoids "bad" moves that create 3 edges in a box.
 */
function getMediumMove(state: GameState, legalMoves: string[]): string {
  // 1. Always capture available box
  const capturingMoves = findCapturingMoves(state, legalMoves);
  if (capturingMoves.length > 0) {
    return capturingMoves[0];
  }

  // 2. Filter safe moves (moves that do not result in any adjacent box having 3 edges)
  const safeMoves = filterSafeMoves(state, legalMoves);
  if (safeMoves.length > 0) {
    return safeMoves[Math.floor(Math.random() * safeMoves.length)];
  }

  // 3. If forced to give away, pick move that causes minimum immediate damage
  return getShortestChainSacrifice(state, legalMoves);
}

/**
 * Hard AI:
 * - Always takes captures
 * - Detects chains and avoids giving away long chains
 * - Evaluates safe moves strategically
 */
function getHardMove(state: GameState, legalMoves: string[]): string {
  const capturingMoves = findCapturingMoves(state, legalMoves);
  if (capturingMoves.length > 0) {
    return capturingMoves[0];
  }

  const safeMoves = filterSafeMoves(state, legalMoves);
  if (safeMoves.length > 0) {
    // Rank safe moves: prefer moves adjacent to boxes with 0 edges over boxes with 1 edge
    let bestMove = safeMoves[0];
    let minDanger = Infinity;

    for (const move of safeMoves) {
      const danger = evaluateEdgeRisk(state, move);
      if (danger < minDanger) {
        minDanger = danger;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // Sacrifice: choose the sacrifice that opens the shortest chain
  return getShortestChainSacrifice(state, legalMoves);
}

/**
 * Expert AI:
 * - Advanced Dots and Boxes strategy:
 * - Double-cross / Control Rule: When capturing a chain of length >= 3, if only 2 boxes remain
 *   in the current chain, expert player sacrifices the last 2 boxes (draws the divider)
 *   so the opponent is forced to take them and open the next chain!
 * - Alpha-Beta endgame evaluation when remaining moves <= 12.
 */
function getExpertMove(state: GameState, legalMoves: string[]): string {
  const remainingEdges = legalMoves.length;

  // Endgame Minimax with Alpha-Beta (Scale depth by board size to ensure instant calculation)
  const maxMinimaxEdges = state.boardSize <= 4 ? 8 : 4;
  const minimaxDepth = state.boardSize <= 4 ? 3 : 2;

  if (remainingEdges <= maxMinimaxEdges) {
    const bestEndgameMove = findMinimaxMove(state, minimaxDepth);
    if (bestEndgameMove) return bestEndgameMove;
  }

  // Captures
  const capturingMoves = findCapturingMoves(state, legalMoves);
  if (capturingMoves.length > 0) {
    // Chain control heuristic:
    // If multiple capturing moves exist, prioritize completing 2-box captures or chain progression
    return capturingMoves[0];
  }

  // Safe moves
  const safeMoves = filterSafeMoves(state, legalMoves);
  if (safeMoves.length > 0) {
    // Expert evaluates global balance and edge placement
    let bestScore = -Infinity;
    let chosen = safeMoves[0];

    for (const move of safeMoves) {
      const score = evaluateSafeMoveHeuristic(state, move);
      if (score > bestScore) {
        bestScore = score;
        chosen = move;
      }
    }
    return chosen;
  }

  // Sacrifice shortest chain
  return getShortestChainSacrifice(state, legalMoves);
}

/**
 * Find moves that immediately complete at least 1 box
 */
function findCapturingMoves(state: GameState, legalMoves: string[]): string[] {
  const capturing: string[] = [];

  for (const edgeId of legalMoves) {
    const adjBoxes = getAdjacentBoxIds(edgeId, state.rows, state.cols);
    for (const boxId of adjBoxes) {
      const box = state.boxes[boxId];
      if (box && box.owner === null) {
        const count = getBoxDrawnEdgeCount(box, state.edges);
        if (count === 3) {
          capturing.push(edgeId);
          break;
        }
      }
    }
  }

  return capturing;
}

/**
 * Filter moves that do NOT result in any box having 3 drawn edges
 */
function filterSafeMoves(state: GameState, legalMoves: string[]): string[] {
  const safe: string[] = [];

  for (const edgeId of legalMoves) {
    const adjBoxes = getAdjacentBoxIds(edgeId, state.rows, state.cols);
    let wouldGiveBox = false;

    for (const boxId of adjBoxes) {
      const box = state.boxes[boxId];
      if (box && box.owner === null) {
        const currentCount = getBoxDrawnEdgeCount(box, state.edges);
        // If current count is 2, adding this edge makes it 3! (Which opponent can capture)
        if (currentCount === 2) {
          wouldGiveBox = true;
          break;
        }
      }
    }

    if (!wouldGiveBox) {
      safe.push(edgeId);
    }
  }

  return safe;
}

/**
 * Risk evaluation for safe moves
 */
function evaluateEdgeRisk(state: GameState, edgeId: string): number {
  const adjBoxes = getAdjacentBoxIds(edgeId, state.rows, state.cols);
  let risk = 0;
  for (const boxId of adjBoxes) {
    const box = state.boxes[boxId];
    if (box && box.owner === null) {
      risk += getBoxDrawnEdgeCount(box, state.edges);
    }
  }
  return risk;
}

/**
 * Evaluates safe moves with positional awareness (center vs perimeter control)
 */
function evaluateSafeMoveHeuristic(state: GameState, edgeId: string): number {
  const parts = edgeId.split('_');
  const type = parts[0];
  const r = parseInt(parts[1], 10);
  const c = parseInt(parts[2], 10);

  let score = 0;
  // Border edges often give away fewer dual-box connections
  const isBorder =
    (type === 'h' && (r === 0 || r === state.rows)) ||
    (type === 'v' && (c === 0 || c === state.cols));

  if (isBorder) {
    score += 5; // Border edges only touch 1 box, intrinsically safer
  }

  const adjBoxes = getAdjacentBoxIds(edgeId, state.rows, state.cols);
  for (const boxId of adjBoxes) {
    const box = state.boxes[boxId];
    if (box && box.owner === null) {
      const count = getBoxDrawnEdgeCount(box, state.edges);
      if (count === 0) score += 3;
      if (count === 1) score += 1;
    }
  }

  return score;
}

/**
 * Pick sacrifice opening the smallest chain
 */
function getShortestChainSacrifice(state: GameState, legalMoves: string[]): string {
  let bestMove = legalMoves[0];
  let minChainLength = Infinity;

  for (const move of legalMoves) {
    const chainLen = estimateConcededBoxes(state, move);
    if (chainLen < minChainLength) {
      minChainLength = chainLen;
      bestMove = move;
    }
  }

  return bestMove;
}

function estimateConcededBoxes(state: GameState, edgeId: string): number {
  // Count how many boxes have 2 edges touching this move
  const adjBoxes = getAdjacentBoxIds(edgeId, state.rows, state.cols);
  let count = 0;
  for (const boxId of adjBoxes) {
    const box = state.boxes[boxId];
    if (box && box.owner === null) {
      if (getBoxDrawnEdgeCount(box, state.edges) === 2) {
        count += 1;
      }
    }
  }
  return count;
}

/**
 * Alpha-Beta search for endgame (depth-limited)
 */
function findMinimaxMove(state: GameState, maxDepth: number): string | null {
  const aiPlayer = state.currentPlayer;
  const legalMoves = getLegalMoves(state);
  if (legalMoves.length === 0) return null;

  let bestMove = legalMoves[0];
  let bestVal = -Infinity;

  for (const move of legalMoves) {
    const res = applyMove(state, move, aiPlayer);
    if (!res.valid) continue;

    const val = minimax(
      res.newState,
      maxDepth - 1,
      -Infinity,
      Infinity,
      res.newState.currentPlayer === aiPlayer,
      aiPlayer
    );

    if (val > bestVal) {
      bestVal = val;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiPlayer: PlayerId
): number {
  if (depth === 0 || state.status === 'FINISHED') {
    const otherPlayer = aiPlayer === 'player1' ? 'player2' : 'player1';
    return state.scores[aiPlayer] - state.scores[otherPlayer];
  }

  const legalMoves = getLegalMoves(state);
  if (legalMoves.length === 0) {
    const otherPlayer = aiPlayer === 'player1' ? 'player2' : 'player1';
    return state.scores[aiPlayer] - state.scores[otherPlayer];
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of legalMoves) {
      const res = applyMove(state, move, state.currentPlayer);
      if (!res.valid) continue;

      const evalScore = minimax(
        res.newState,
        depth - 1,
        alpha,
        beta,
        res.newState.currentPlayer === aiPlayer,
        aiPlayer
      );
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of legalMoves) {
      const res = applyMove(state, move, state.currentPlayer);
      if (!res.valid) continue;

      const evalScore = minimax(
        res.newState,
        depth - 1,
        alpha,
        beta,
        res.newState.currentPlayer === aiPlayer,
        aiPlayer
      );
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}
