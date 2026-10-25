/**
 * Dots & Boxes Pro — Game Engine Debug & ASCII Grid Inspector
 * Diagnostic utility to inspect edge ownership, box completions, and render an ASCII visual board
 */

import { GameState, Edge, Box } from './types';

export interface BoardDebugReport {
  timestamp: string;
  boardSize: number;
  totalEdges: number;
  drawnEdgesCount: number;
  unownedEdgesCount: number;
  player1EdgesCount: number;
  player2EdgesCount: number;
  totalBoxes: number;
  completedBoxesCount: number;
  player1Score: number;
  player2Score: number;
  currentPlayer: string;
  lastMoveEdgeId: string | null;
  drawnEdges: Array<{
    id: string;
    orientation: 'H' | 'V';
    from: string;
    to: string;
    owner: string;
  }>;
  asciiGrid: string;
}

/**
 * Generates an ASCII visual representation of the current board state
 */
export function renderAsciiBoard(state: GameState): string {
  const { rows, cols, edges, boxes } = state;
  const lines: string[] = [];

  for (let r = 0; r <= rows; r++) {
    // 1. Horizontal edges row: dots and horizontal edges
    let hLine = '';
    for (let c = 0; c < cols; c++) {
      hLine += '+'; // dot
      const hEdge = edges[`h_${r}_${c}`];
      if (hEdge && hEdge.owner === 'player1') {
        hLine += '==='; // Player 1
      } else if (hEdge && hEdge.owner === 'player2') {
        hLine += '---'; // Player 2
      } else {
        hLine += ' · '; // Unowned edge
      }
    }
    hLine += '+'; // Last dot in row
    lines.push(hLine);

    // 2. Vertical edges & box cells row (if not past last row of boxes)
    if (r < rows) {
      let vLine = '';
      for (let c = 0; c <= cols; c++) {
        // Vertical edge
        const vEdge = edges[`v_${r}_${c}`];
        if (vEdge && vEdge.owner === 'player1') {
          vLine += '║'; // Player 1 vertical
        } else if (vEdge && vEdge.owner === 'player2') {
          vLine += '|'; // Player 2 vertical
        } else {
          vLine += '·'; // Unowned vertical
        }

        // Box cell content between vertical lines
        if (c < cols) {
          const box: Box | undefined = boxes[`b_${r}_${c}`];
          if (box && box.owner === 'player1') {
            vLine += ' 1 ';
          } else if (box && box.owner === 'player2') {
            vLine += ' 2 ';
          } else {
            vLine += '   ';
          }
        }
      }
      lines.push(vLine);
    }
  }

  return lines.join('\n');
}

/**
 * Inspects all edges and returns metrics on drawn vs unowned lines
 */
export function inspectEdges(state: GameState) {
  const edgeList = Object.values(state.edges);
  const drawnEdges: Edge[] = [];
  let p1Drawn = 0;
  let p2Drawn = 0;

  for (const edge of edgeList) {
    if (edge.owner !== null) {
      drawnEdges.push(edge);
      if (edge.owner === 'player1') p1Drawn++;
      if (edge.owner === 'player2') p2Drawn++;
    }
  }

  return {
    total: edgeList.length,
    drawn: drawnEdges.length,
    unowned: edgeList.length - drawnEdges.length,
    player1Drawn: p1Drawn,
    player2Drawn: p2Drawn,
    drawnEdges,
  };
}

/**
 * Diagnostic tool: inspects the board edge state and prints a formatted debug log to the console
 */
export function debugInspectBoardState(
  state: GameState,
  logToConsole: boolean = true
): BoardDebugReport {
  const edgeMetrics = inspectEdges(state);
  const asciiGrid = renderAsciiBoard(state);

  const drawnDetails = edgeMetrics.drawnEdges.map((e) => ({
    id: e.id,
    orientation: e.orientation,
    from: `(${e.r1}, ${e.c1})`,
    to: `(${e.r2}, ${e.c2})`,
    owner: e.owner || 'unowned',
  }));

  const report: BoardDebugReport = {
    timestamp: new Date().toISOString(),
    boardSize: state.boardSize,
    totalEdges: edgeMetrics.total,
    drawnEdgesCount: edgeMetrics.drawn,
    unownedEdgesCount: edgeMetrics.unowned,
    player1EdgesCount: edgeMetrics.player1Drawn,
    player2EdgesCount: edgeMetrics.player2Drawn,
    totalBoxes: state.totalBoxes,
    completedBoxesCount: state.completedBoxesCount,
    player1Score: state.scores.player1,
    player2Score: state.scores.player2,
    currentPlayer: state.currentPlayer,
    lastMoveEdgeId: state.lastMoveEdgeId,
    drawnEdges: drawnDetails,
    asciiGrid,
  };

  if (logToConsole) {
    console.group(`[Dots & Boxes Engine Debug] ${state.boardSize}x${state.boardSize} Board Inspection`);
    console.log(
      `%cCurrent Player: %c${state.currentPlayer} %c| Score: P1=${state.scores.player1} P2=${state.scores.player2} | Drawn Lines: ${edgeMetrics.drawn}/${edgeMetrics.total}`,
      'font-weight: bold; color: #94a3b8;',
      'font-weight: bold; color: #38bdf8;',
      'color: #e2e8f0;'
    );
    console.log(`Last Move Edge ID: ${state.lastMoveEdgeId || 'None'}`);
    console.log('\n--- ASCII BOARD STATE ---');
    console.log(asciiGrid);
    console.log('Legend: === (P1 Horizontal), --- (P2 Horizontal), ║ (P1 Vertical), | (P2 Vertical), · (Unowned)\n');

    if (drawnDetails.length > 0) {
      console.log('--- ACTIVE DRAWN EDGES ---');
      console.table(drawnDetails);
    } else {
      console.log('%cNo edges have been drawn yet (Empty Board).', 'color: #f59e0b;');
    }
    console.groupEnd();
  }

  return report;
}
