/**
 * Connect Four Engine — 7 Columns x 6 Rows
 * Professional rules, gravity physics calculation & AI Bot
 */

export const C4_ROWS = 6;
export const C4_COLS = 7;

export type C4Cell = 'P1' | 'P2' | null;
export type C4Board = C4Cell[][]; // [row][col], row 0 is top, row 5 is bottom

export interface C4WinResult {
  winner: 'P1' | 'P2' | 'DRAW' | null;
  winningCells: [number, number][]; // [row, col][]
}

export interface C4State {
  board: C4Board;
  currentPlayer: 'P1' | 'P2';
  status: 'PLAYING' | 'FINISHED';
  winner: 'P1' | 'P2' | 'DRAW' | null;
  winningCells: [number, number][];
  lastMove: { row: number; col: number } | null;
  movesCount: number;
}

export function createInitialC4State(): C4State {
  const board: C4Board = Array.from({ length: C4_ROWS }, () =>
    Array.from({ length: C4_COLS }, () => null)
  );

  return {
    board,
    currentPlayer: 'P1',
    status: 'PLAYING',
    winner: null,
    winningCells: [],
    lastMove: null,
    movesCount: 0,
  };
}

/**
 * Find lowest empty row in a column (gravity)
 */
export function getLowestEmptyRow(board: C4Board, col: number): number {
  for (let r = C4_ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) {
      return r;
    }
  }
  return -1; // Column full
}

export function getValidColumns(board: C4Board): number[] {
  const cols: number[] = [];
  for (let c = 0; c < C4_COLS; c++) {
    if (board[0][c] === null) {
      cols.push(c);
    }
  }
  return cols;
}

/**
 * Check if the board has a 4-in-a-row winner
 */
export function checkC4Win(board: C4Board): C4WinResult {
  // 1. Horizontal
  for (let r = 0; r < C4_ROWS; r++) {
    for (let c = 0; c <= C4_COLS - 4; c++) {
      const p = board[r][c];
      if (p && p === board[r][c + 1] && p === board[r][c + 2] && p === board[r][c + 3]) {
        return {
          winner: p,
          winningCells: [
            [r, c],
            [r, c + 1],
            [r, c + 2],
            [r, c + 3],
          ],
        };
      }
    }
  }

  // 2. Vertical
  for (let c = 0; c < C4_COLS; c++) {
    for (let r = 0; r <= C4_ROWS - 4; r++) {
      const p = board[r][c];
      if (p && p === board[r + 1][c] && p === board[r + 2][c] && p === board[r + 3][c]) {
        return {
          winner: p,
          winningCells: [
            [r, c],
            [r + 1, c],
            [r + 2, c],
            [r + 3, c],
          ],
        };
      }
    }
  }

  // 3. Diagonal Down-Right
  for (let r = 0; r <= C4_ROWS - 4; r++) {
    for (let c = 0; c <= C4_COLS - 4; c++) {
      const p = board[r][c];
      if (p && p === board[r + 1][c + 1] && p === board[r + 2][c + 2] && p === board[r + 3][c + 3]) {
        return {
          winner: p,
          winningCells: [
            [r, c],
            [r + 1, c + 1],
            [r + 2, c + 2],
            [r + 3, c + 3],
          ],
        };
      }
    }
  }

  // 4. Diagonal Up-Right
  for (let r = 3; r < C4_ROWS; r++) {
    for (let c = 0; c <= C4_COLS - 4; c++) {
      const p = board[r][c];
      if (p && p === board[r - 1][c + 1] && p === board[r - 2][c + 2] && p === board[r - 3][c + 3]) {
        return {
          winner: p,
          winningCells: [
            [r, c],
            [r - 1, c + 1],
            [r - 2, c + 2],
            [r - 3, c + 3],
          ],
        };
      }
    }
  }

  // Check if board full -> DRAW
  const isFull = board[0].every((cell) => cell !== null);
  if (isFull) {
    return { winner: 'DRAW', winningCells: [] };
  }

  return { winner: null, winningCells: [] };
}

/**
 * Drop a token into column
 */
export function dropToken(state: C4State, col: number): { valid: boolean; newState: C4State } {
  if (state.status === 'FINISHED') return { valid: false, newState: state };
  if (col < 0 || col >= C4_COLS) return { valid: false, newState: state };

  const row = getLowestEmptyRow(state.board, col);
  if (row === -1) return { valid: false, newState: state };

  // Clone board
  const newBoard = state.board.map((r) => [...r]);
  newBoard[row][col] = state.currentPlayer;

  const winRes = checkC4Win(newBoard);
  const nextPlayer = state.currentPlayer === 'P1' ? 'P2' : 'P1';

  const newState: C4State = {
    board: newBoard,
    currentPlayer: winRes.winner ? state.currentPlayer : nextPlayer,
    status: winRes.winner ? 'FINISHED' : 'PLAYING',
    winner: winRes.winner,
    winningCells: winRes.winningCells,
    lastMove: { row, col },
    movesCount: state.movesCount + 1,
  };

  return { valid: true, newState };
}

/**
 * Intelligent Connect Four Bot
 */
export function getC4AIMove(state: C4State, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): number {
  const validCols = getValidColumns(state.board);
  if (validCols.length === 0) return 0;

  // 1. Check for immediate winning move
  for (const c of validCols) {
    const row = getLowestEmptyRow(state.board, c);
    const testBoard = state.board.map((r) => [...r]);
    testBoard[row][c] = 'P2';
    if (checkC4Win(testBoard).winner === 'P2') {
      return c;
    }
  }

  // 2. Check for blocking opponent immediate win (Medium & Hard)
  if (difficulty !== 'easy') {
    for (const c of validCols) {
      const row = getLowestEmptyRow(state.board, c);
      const testBoard = state.board.map((r) => [...r]);
      testBoard[row][c] = 'P1';
      if (checkC4Win(testBoard).winner === 'P1') {
        return c;
      }
    }
  }

  if (difficulty === 'easy') {
    return validCols[Math.floor(Math.random() * validCols.length)];
  }

  // 3. Column preference: Center (col 3) is strategically best, then 2 & 4, then 1 & 5, then 0 & 6
  const colOrder = [3, 2, 4, 1, 5, 0, 6];
  const sorted = colOrder.filter((c) => validCols.includes(c));

  // Avoid moves that give opponent an immediate win above
  const safeCols: number[] = [];
  for (const c of sorted) {
    const row = getLowestEmptyRow(state.board, c);
    if (row > 0) {
      const testBoard = state.board.map((r) => [...r]);
      testBoard[row][c] = 'P2';
      testBoard[row - 1][c] = 'P1';
      if (checkC4Win(testBoard).winner === 'P1') {
        continue; // Trap! Don't let opponent win right above us
      }
    }
    safeCols.push(c);
  }

  if (safeCols.length > 0) {
    return safeCols[0];
  }

  return sorted[0] ?? validCols[0];
}
