/**
 * Tic Tac Toe Blitz (3x3) & Gomoku (10x10 Five in a Row) Engine
 */

export type TTTCell = 'X' | 'O' | null;

export interface TTTWinResult {
  winner: 'X' | 'O' | 'DRAW' | null;
  winningCells: [number, number][]; // [row, col][]
}

export interface TTTState {
  size: 3 | 10;
  targetWin: 3 | 5;
  board: TTTCell[][];
  currentPlayer: 'X' | 'O';
  status: 'PLAYING' | 'FINISHED';
  winner: 'X' | 'O' | 'DRAW' | null;
  winningCells: [number, number][];
  movesCount: number;
}

export function createInitialTTTState(size: 3 | 10 = 3): TTTState {
  const targetWin = size === 3 ? 3 : 5;
  const board: TTTCell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  );

  return {
    size,
    targetWin,
    board,
    currentPlayer: 'X',
    status: 'PLAYING',
    winner: null,
    winningCells: [],
    movesCount: 0,
  };
}

export function checkTTTWin(board: TTTCell[][], targetWin: number): TTTWinResult {
  const size = board.length;

  // Directions: [dRow, dCol] -> Horizontal, Vertical, Diagonal Down-Right, Diagonal Down-Left
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const p = board[r][c];
      if (!p) continue;

      for (const [dr, dc] of directions) {
        let isMatch = true;
        const line: [number, number][] = [[r, c]];

        for (let step = 1; step < targetWin; step++) {
          const nr = r + dr * step;
          const nc = c + dc * step;

          if (nr < 0 || nr >= size || nc < 0 || nc >= size || board[nr][nc] !== p) {
            isMatch = false;
            break;
          }
          line.push([nr, nc]);
        }

        if (isMatch) {
          return { winner: p, winningCells: line };
        }
      }
    }
  }

  // Check if board full
  const hasEmpty = board.some((row) => row.some((cell) => cell === null));
  if (!hasEmpty) {
    return { winner: 'DRAW', winningCells: [] };
  }

  return { winner: null, winningCells: [] };
}

export function applyTTTMove(
  state: TTTState,
  row: number,
  col: number
): { valid: boolean; newState: TTTState } {
  if (state.status === 'FINISHED') return { valid: false, newState: state };
  if (row < 0 || row >= state.size || col < 0 || col >= state.size) {
    return { valid: false, newState: state };
  }
  if (state.board[row][col] !== null) {
    return { valid: false, newState: state };
  }

  const newBoard = state.board.map((r) => [...r]);
  newBoard[row][col] = state.currentPlayer;

  const winRes = checkTTTWin(newBoard, state.targetWin);
  const nextPlayer = state.currentPlayer === 'X' ? 'O' : 'X';

  const newState: TTTState = {
    ...state,
    board: newBoard,
    currentPlayer: winRes.winner ? state.currentPlayer : nextPlayer,
    status: winRes.winner ? 'FINISHED' : 'PLAYING',
    winner: winRes.winner,
    winningCells: winRes.winningCells,
    movesCount: state.movesCount + 1,
  };

  return { valid: true, newState };
}

/**
 * AI Bot Move Finder
 */
export function getTTTAIMove(state: TTTState): [number, number] | null {
  const size = state.size;
  const targetWin = state.targetWin;
  const emptyCells: [number, number][] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (state.board[r][c] === null) {
        emptyCells.push([r, c]);
      }
    }
  }

  if (emptyCells.length === 0) return null;

  // 1. Check if AI ('O') can win immediately
  for (const [r, c] of emptyCells) {
    const testBoard = state.board.map((row) => [...row]);
    testBoard[r][c] = 'O';
    if (checkTTTWin(testBoard, targetWin).winner === 'O') {
      return [r, c];
    }
  }

  // 2. Check if Human ('X') can win next turn and block
  for (const [r, c] of emptyCells) {
    const testBoard = state.board.map((row) => [...row]);
    testBoard[r][c] = 'X';
    if (checkTTTWin(testBoard, targetWin).winner === 'X') {
      return [r, c];
    }
  }

  // 3. For 3x3: Center cell is best
  if (size === 3) {
    if (state.board[1][1] === null) return [1, 1];
    const corners: [number, number][] = [
      [0, 0],
      [0, 2],
      [2, 0],
      [2, 2],
    ].filter(([r, c]) => state.board[r][c] === null) as [number, number][];
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }
  }

  // 4. For Gomoku 10x10: Pick cell closest to existing moves
  const center = Math.floor(size / 2);
  const rated = emptyCells.map(([r, c]) => {
    let score = 0;
    // proximity to center
    score += (size - Math.abs(r - center) - Math.abs(c - center));
    // adjacent pieces bonus
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (state.board[nr][nc] !== null) score += 10;
        }
      }
    }
    return { r, c, score };
  });

  rated.sort((a, b) => b.score - a.score);
  return [rated[0].r, rated[0].c];
}
