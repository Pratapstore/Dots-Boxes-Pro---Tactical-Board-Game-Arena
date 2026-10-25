/**
 * Automated Unit Test Suite for Dots & Boxes Pro Core Engine
 */

import { createInitialGameState, getAdjacentBoxIds, getLegalMoves } from '../game/engine/board';
import { applyMove, undoLastMove } from '../game/engine/rules';
import { getAIMove } from '../game/ai/aiOpponent';
import { BoardDimension } from '../game/engine/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('--- STARTING DOTS & BOXES PRO TEST SUITE ---\n');

// 1. Test Board Dimensions & Math
console.log('Testing Board Dimensions & Edge Formulas...');
const sizes: BoardDimension[] = [3, 4, 5, 6, 8, 10];
for (const sz of sizes) {
  const state = createInitialGameState(sz);
  const expectedBoxes = sz * sz;
  const expectedEdges = 2 * sz * (sz + 1);

  assert(
    Object.keys(state.boxes).length === expectedBoxes,
    `Board size ${sz}x${sz} has ${expectedBoxes} boxes`
  );
  assert(
    Object.keys(state.edges).length === expectedEdges,
    `Board size ${sz}x${sz} has ${expectedEdges} edges`
  );
  assert(
    getLegalMoves(state).length === expectedEdges,
    `All ${expectedEdges} edges are initially legal moves`
  );
}

// 2. Turn Switching without Box Completion
console.log('\nTesting Turn Switching...');
{
  const state = createInitialGameState(3);
  assert(state.currentPlayer === 'player1', 'Initial turn is player1');

  const res1 = applyMove(state, 'h_0_0', 'player1');
  assert(res1.valid === true, 'Move h_0_0 is valid for player1');
  assert(res1.completedBoxIds.length === 0, 'No box completed on first edge');
  assert(res1.awardedExtraTurn === false, 'No extra turn awarded');
  assert(res1.newState.currentPlayer === 'player2', 'Turn switched to player2');
}

// 3. Duplicate Move Rejection
console.log('\nTesting Duplicate Move Rejection...');
{
  const state = createInitialGameState(3);
  const res1 = applyMove(state, 'h_0_0', 'player1');
  const resDuplicate = applyMove(res1.newState, 'h_0_0', 'player2');
  assert(resDuplicate.valid === false, 'Duplicate edge move was rejected');
}

// 4. Invalid Turn Rejection
console.log('\nTesting Invalid Turn Rejection...');
{
  const state = createInitialGameState(3);
  const resInvalid = applyMove(state, 'h_0_0', 'player2');
  assert(resInvalid.valid === false, 'Player2 moving out of turn was rejected');
}

// 5. Box Completion & Extra Turn Rule
console.log('\nTesting Box Completion & Extra Turn...');
{
  let state = createInitialGameState(3);
  // Box b_0_0 has edges: h_0_0, v_0_1, h_1_0, v_0_0
  state = applyMove(state, 'h_0_0', 'player1').newState; // P1
  state = applyMove(state, 'v_0_1', 'player2').newState; // P2
  state = applyMove(state, 'v_0_0', 'player1').newState; // P1
  // Now 3 edges drawn. P2 completes box b_0_0 with h_1_0
  const res4 = applyMove(state, 'h_1_0', 'player2');
  assert(res4.valid === true, 'P2 plays 4th edge');
  assert(res4.completedBoxIds.includes('b_0_0'), 'Box b_0_0 is completed');
  assert(res4.awardedExtraTurn === true, 'P2 is awarded an extra turn');
  assert(res4.newState.currentPlayer === 'player2', 'P2 retains the turn!');
  assert(res4.newState.scores.player2 === 1, 'P2 score is 1');
  assert(res4.newState.boxes['b_0_0'].owner === 'player2', 'Box b_0_0 is owned by player2');
}

// 6. Dual Box Completion with 1 Edge
console.log('\nTesting Dual Box Completion with 1 Shared Edge...');
{
  let state = createInitialGameState(3);
  // We prepare box b_0_0 and box b_0_1 so that vertical edge v_0_1 completes BOTH boxes simultaneously!
  // b_0_0: h_0_0, v_0_0, h_1_0 (needs v_0_1)
  // b_0_1: h_0_1, v_0_2, h_1_1 (needs v_0_1)

  state = applyMove(state, 'h_0_0', 'player1').newState;
  state = applyMove(state, 'v_0_0', 'player2').newState;
  state = applyMove(state, 'h_1_0', 'player1').newState;
  state = applyMove(state, 'h_0_1', 'player2').newState;
  state = applyMove(state, 'v_0_2', 'player1').newState;
  state = applyMove(state, 'h_1_1', 'player2').newState;

  // Now both boxes have 3 edges. P1 plays the shared divider v_0_1
  const resDual = applyMove(state, 'v_0_1', 'player1');
  assert(resDual.completedBoxIds.length === 2, 'Two boxes completed with one edge!');
  assert(resDual.completedBoxIds.includes('b_0_0'), 'Completed b_0_0');
  assert(resDual.completedBoxIds.includes('b_0_1'), 'Completed b_0_1');
  assert(resDual.newState.scores.player1 === 2, 'P1 received 2 points');
  assert(resDual.awardedExtraTurn === true, 'P1 retains turn after dual completion');
}

// 7. AI Legal Moves & Behavior
console.log('\nTesting AI Opponent Legal Moves...');
{
  const state = createInitialGameState(4);
  for (const diff of ['easy', 'medium', 'hard', 'expert'] as const) {
    const aiMove = getAIMove(state, diff);
    assert(aiMove !== null, `AI (${diff}) produced a move`);
    assert(state.edges[aiMove!].owner === null, `AI (${diff}) move is unowned and legal`);
  }
}

// 8. Practice Mode Undo Logic
console.log('\nTesting Undo Functionality...');
{
  let state = createInitialGameState(3);
  state = applyMove(state, 'h_0_0', 'player1').newState;
  assert(state.edges['h_0_0'].owner === 'player1', 'Edge was owned');
  assert(state.moves.length === 1, '1 move in history');

  state = undoLastMove(state);
  assert(state.edges['h_0_0'].owner === null, 'Edge is unowned after undo');
  assert(state.moves.length === 0, '0 moves after undo');
  assert(state.currentPlayer === 'player1', 'Turn returned to player1');
}

// 9. Board Debug State & ASCII Grid Inspector
console.log('\nTesting Board Debug State & ASCII Grid...');
{
  const { debugInspectBoardState, renderAsciiBoard } = await import('../game/engine/debug');
  let state = createInitialGameState(3);
  state = applyMove(state, 'h_0_0', 'player1').newState;
  state = applyMove(state, 'v_0_0', 'player2').newState;
  state = applyMove(state, 'h_1_0', 'player1').newState;
  state = applyMove(state, 'v_0_1', 'player2').newState; // Completes box b_0_0

  const report = debugInspectBoardState(state, false);
  assert(report.drawnEdgesCount === 4, 'Report identifies 4 drawn edges');
  assert(report.completedBoxesCount === 1, 'Report identifies 1 completed box');
  assert(report.player2Score === 1, 'Report identifies player2 scored 1 point');
  assert(typeof report.asciiGrid === 'string' && report.asciiGrid.includes('+==='), 'ASCII grid contains P1 horizontal line');
  console.log('Sample Debug Grid:\n' + report.asciiGrid);
}

console.log('\n🎉 ALL CORE GAME ENGINE TESTS COMPLETED SUCCESSFULLY!');
