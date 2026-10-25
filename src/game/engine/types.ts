/**
 * Dots & Boxes Pro — Core Engine Types
 */

export type PlayerId = 'player1' | 'player2';

export type GameMode =
  | 'vs_ai'
  | 'local_pass_and_play'
  | 'online_custom_room'
  | 'online_matchmaking'
  | 'practice'
  | 'challenge';

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type BoardDimension = 3 | 4 | 5 | 6 | 8 | 10;

export interface Edge {
  id: string; // e.g. "h_0_0" or "v_0_0"
  orientation: 'H' | 'V';
  r1: number;
  c1: number;
  r2: number;
  c2: number;
  owner: PlayerId | null;
  timestamp?: number;
}

export interface Box {
  id: string; // e.g. "b_0_0"
  row: number;
  col: number;
  topEdgeId: string;
  rightEdgeId: string;
  bottomEdgeId: string;
  leftEdgeId: string;
  owner: PlayerId | null;
  claimedMoveIndex?: number;
}

export interface Move {
  moveIndex: number;
  player: PlayerId;
  edgeId: string;
  completedBoxIds: string[];
  timestamp: number;
}

export interface GameState {
  boardSize: BoardDimension; // e.g. 4 for 4x4 boxes (5x5 dots)
  rows: number; // boxes count vertically
  cols: number; // boxes count horizontally
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

export interface PlayerInfo {
  id: string;
  name: string;
  avatar: string;
  color: string;
  rating?: number;
  isAI?: boolean;
  aiDifficulty?: AIDifficulty;
}

export interface PuzzleDefinition {
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Master';
  boardSize: BoardDimension;
  startingPlayer: PlayerId;
  preDrawnEdgeIds: string[];
  targetWinScore: number;
  hint: string;
  description: string;
}
