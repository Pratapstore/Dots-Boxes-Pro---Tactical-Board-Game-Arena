import { PuzzleDefinition } from './types';

export const CHALLENGE_PUZZLES: PuzzleDefinition[] = [
  {
    id: 'puzzle_chain_intro',
    title: '1. The Domino Chain',
    subtitle: 'Chain Captures',
    difficulty: 'Beginner',
    boardSize: 3,
    startingPlayer: 'player1',
    // 3x3 board has 9 boxes: b_0_0 to b_2_2
    // Setup a 3-box chain ready to be completed in one sequence
    preDrawnEdgeIds: [
      'h_0_0', 'v_0_0', 'v_0_1', // b_0_0 needs h_1_0
      'v_1_0', 'v_1_1',          // b_1_0 needs h_2_0
      'v_2_0', 'v_2_1', 'h_3_0', // b_2_0 has 3 edges
      'h_0_1', 'h_0_2', 'v_0_3', 'h_1_2', 'v_1_3', 'h_2_2', 'v_2_3', 'h_3_1', 'h_3_2'
    ],
    targetWinScore: 5,
    hint: 'Completing a box gives you an extra turn! Look for the box with 3 existing edges to start the chain reaction.',
    description: 'Find the entry point to initiate an unbroken chain capture across multiple boxes.',
  },
  {
    id: 'puzzle_double_cross',
    title: '2. The Double Cross',
    subtitle: 'Chain Control',
    difficulty: 'Intermediate',
    boardSize: 3,
    startingPlayer: 'player1',
    preDrawnEdgeIds: [
      'h_0_0', 'v_0_0', 'h_1_0',
      'h_0_1', 'v_0_2', 'h_1_1',
      'v_1_0', 'h_2_0', 'v_1_1',
      'v_1_2', 'h_2_1',
      'h_3_0', 'v_2_0', 'v_2_1',
      'h_3_1', 'v_2_2', 'h_3_2', 'v_2_3'
    ],
    targetWinScore: 5,
    hint: 'Do not trigger traps. Look for a move that closes a box without opening a free pathway for the opponent.',
    description: 'A classic endgame scenario where drawing the wrong dividing line gifts victory to your rival.',
  },
  {
    id: 'puzzle_the_corridor',
    title: '3. The Long Corridor',
    subtitle: 'Endgame Sweep',
    difficulty: 'Intermediate',
    boardSize: 4,
    startingPlayer: 'player1',
    preDrawnEdgeIds: [
      'h_0_0', 'h_0_1', 'h_0_2', 'h_0_3',
      'v_0_0', 'v_1_0', 'v_2_0', 'v_3_0',
      'h_4_0', 'h_4_1', 'h_4_2', 'h_4_3',
      'v_0_4', 'v_1_4', 'v_2_4', 'v_3_4',
      'h_1_0', 'h_1_1', 'h_1_2',
      'h_2_1', 'h_2_2', 'h_2_3',
      'h_3_0', 'h_3_1', 'h_3_2',
      'v_0_1', 'v_0_2', 'v_1_1', 'v_2_2', 'v_2_3', 'v_3_1', 'v_3_2'
    ],
    targetWinScore: 9,
    hint: 'Navigate the corridor of boxes by taking each box and utilizing the extra turn rule.',
    description: 'A labyrinth of connected cells awaits. Execute the sequence with flawless precision.',
  },
  {
    id: 'puzzle_sacrifice_play',
    title: '4. The Tactical Sacrifice',
    subtitle: 'Sacrifice Strategy',
    difficulty: 'Master',
    boardSize: 3,
    startingPlayer: 'player1',
    preDrawnEdgeIds: [
      'h_0_0', 'v_0_0', 'v_0_1',
      'h_1_1', 'v_1_1', 'h_2_1', 'v_1_2',
      'h_3_0', 'v_2_0', 'h_3_1', 'v_2_1',
      'h_0_2', 'v_0_3', 'h_1_2', 'v_1_3',
      'h_2_2', 'v_2_3', 'h_3_2'
    ],
    targetWinScore: 5,
    hint: 'Sometimes conceding 1 small box allows you to sweep the remaining 4 boxes on the board.',
    description: 'Calculate two moves ahead to gain terminal tempo and dominate the final score.',
  },
  {
    id: 'puzzle_pincer_trap',
    title: '5. The Pincer Squeeze',
    subtitle: 'Territory Control',
    difficulty: 'Master',
    boardSize: 4,
    startingPlayer: 'player1',
    preDrawnEdgeIds: [
      'h_0_0', 'v_0_0', 'h_1_0', 'v_0_1',
      'h_0_3', 'v_0_4', 'h_1_3', 'v_0_3',
      'h_4_0', 'v_3_0', 'h_3_0', 'v_3_1',
      'h_4_3', 'v_3_4', 'h_3_3', 'v_3_3',
      'h_0_1', 'h_0_2', 'h_4_1', 'h_4_2',
      'v_1_0', 'v_2_0', 'v_1_4', 'v_2_4',
      'h_2_1', 'h_2_2', 'v_1_2', 'v_2_2'
    ],
    targetWinScore: 9,
    hint: 'The corners are already locked. Direct the central flow toward safe borders.',
    description: 'The four corners of the grid have been sealed. Squeeze the opponent into a forced surrender.',
  },
];
