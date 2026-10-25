import React, { useMemo } from 'react';
import { GameState } from '../game/engine/types';
import { BOARD_THEMES, BoardThemeId } from '../game/state/settings';

interface GameBoardProps {
  gameState: GameState;
  onEdgeClick: (edgeId: string) => void;
  themeId: BoardThemeId;
  player1Name: string;
  player2Name: string;
  isInteractive: boolean;
  hintEdgeId?: string | null;
  showCoordinates?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onEdgeClick,
  themeId,
  player1Name,
  player2Name,
  isInteractive,
  hintEdgeId,
  showCoordinates = false,
}) => {
  const theme = BOARD_THEMES[themeId] || BOARD_THEMES.neon_cyber;
  const { rows, cols, edges, boxes, lastMoveEdgeId } = gameState;

  // Responsive dynamic cell size
  const cellSize = useMemo(() => {
    if (rows <= 4) return 86;
    if (rows <= 6) return 70;
    if (rows <= 8) return 54;
    return 46; // 10x10
  }, [rows]);

  const padding = showCoordinates ? 44 : 32;
  const boardWidth = cols * cellSize + padding * 2;
  const boardHeight = rows * cellSize + padding * 2;

  const dotRadius = useMemo(() => {
    if (rows <= 4) return 7;
    if (rows <= 6) return 6;
    return 5;
  }, [rows]);

  const lineWidth = useMemo(() => {
    if (rows <= 4) return 7;
    if (rows <= 6) return 6;
    return 5;
  }, [rows]);

  const hitboxSize = Math.max(38, cellSize * 0.5);

  // Precompute dot coordinates
  const dots = useMemo(() => {
    const list: Array<{ id: string; x: number; y: number; r: number; c: number }> = [];
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        list.push({
          id: `dot_${r}_${c}`,
          x: padding + c * cellSize,
          y: padding + r * cellSize,
          r,
          c,
        });
      }
    }
    return list;
  }, [rows, cols, cellSize, padding]);

  // Edges list
  const edgeList = useMemo(() => Object.values(edges), [edges]);

  // Boxes list
  const boxList = useMemo(() => Object.values(boxes), [boxes]);

  return (
    <div className="relative w-full max-w-full flex items-center justify-center p-2 select-none">
      <svg
        viewBox={`0 0 ${boardWidth} ${boardHeight}`}
        className="w-full max-h-[62vh] drop-shadow-2xl transition-all duration-300"
        style={{
          aspectRatio: `${boardWidth} / ${boardHeight}`,
          maxHeight: 'min(62vh, 520px)',
        }}
      >
        {/* Board Background Frame */}
        <rect
          x={padding - 16}
          y={padding - 16}
          width={cols * cellSize + 32}
          height={rows * cellSize + 32}
          rx={20}
          fill={theme.bgDark}
          stroke="#334155"
          strokeWidth="2.5"
        />

        {/* Coordinate Labels */}
        {showCoordinates && (
          <g className="text-[11px] font-mono fill-slate-400 font-bold" textAnchor="middle">
            {Array.from({ length: cols }).map((_, i) => (
              <text key={`col_label_${i}`} x={padding + (i + 0.5) * cellSize} y={padding - 20}>
                {String.fromCharCode(65 + i)}
              </text>
            ))}
            {Array.from({ length: rows }).map((_, i) => (
              <text key={`row_label_${i}`} x={padding - 22} y={padding + (i + 0.5) * cellSize + 4}>
                {i + 1}
              </text>
            ))}
          </g>
        )}

        {/* Completed Boxes */}
        {boxList.map((box) => {
          if (!box.owner) return null;
          const x = padding + box.col * cellSize;
          const y = padding + box.row * cellSize;
          const isP1 = box.owner === 'player1';
          const fillColor = isP1 ? theme.boxP1Bg : theme.boxP2Bg;
          const strokeColor = isP1 ? theme.p1Light : theme.p2Light;
          const initial = isP1
            ? (player1Name.charAt(0) || '1').toUpperCase()
            : (player2Name.charAt(0) || '2').toUpperCase();

          return (
            <g key={box.id}>
              <rect
                x={x + 4}
                y={y + 4}
                width={cellSize - 8}
                height={cellSize - 8}
                rx={Math.max(6, cellSize * 0.12)}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="2"
              />
              <circle
                cx={x + cellSize / 2}
                cy={y + cellSize / 2}
                r={Math.min(16, cellSize * 0.24)}
                fill={isP1 ? theme.p1Color : theme.p2Color}
                fillOpacity="0.45"
              />
              <text
                x={x + cellSize / 2}
                y={y + cellSize / 2 + Math.min(5, cellSize * 0.08)}
                textAnchor="middle"
                fontSize={Math.max(12, cellSize * 0.28)}
                fontWeight="800"
                fill="#FFFFFF"
                className="font-mono tracking-tight pointer-events-none select-none drop-shadow"
              >
                {initial}
              </text>
            </g>
          );
        })}

        {/* Available Potential Lines (Clearly visible dashed lines connecting every dot) */}
        {edgeList.map((edge) => {
          if (edge.owner !== null) return null;
          const x1 = padding + edge.c1 * cellSize;
          const y1 = padding + edge.r1 * cellSize;
          const x2 = padding + edge.c2 * cellSize;
          const y2 = padding + edge.r2 * cellSize;

          return (
            <line
              key={`guide_${edge.id}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(148, 163, 184, 0.3)"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          );
        })}

        {/* Drawn & Interactive Edges */}
        {edgeList.map((edge) => {
          const isDrawn = edge.owner !== null;
          const isLastMove = edge.id === lastMoveEdgeId;
          const isHint = edge.id === hintEdgeId;

          const x1 = padding + edge.c1 * cellSize;
          const y1 = padding + edge.r1 * cellSize;
          const x2 = padding + edge.c2 * cellSize;
          const y2 = padding + edge.r2 * cellSize;

          const isHorizontal = edge.orientation === 'H';

          // Solid line color without buggy filter
          const solidColor =
            edge.owner === 'player1'
              ? theme.p1Color
              : edge.owner === 'player2'
              ? theme.p2Color
              : '#A855F7';

          // Hitbox rectangle calculation (generous touch targets)
          const hitX = isHorizontal ? x1 : x1 - hitboxSize / 2;
          const hitY = isHorizontal ? y1 - hitboxSize / 2 : y1;
          const hitW = isHorizontal ? cellSize : hitboxSize;
          const hitH = isHorizontal ? hitboxSize : cellSize;

          return (
            <g
              key={edge.id}
              className={`group ${!isDrawn && isInteractive ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (!isDrawn && isInteractive) {
                  onEdgeClick(edge.id);
                }
              }}
            >
              {/* Invisible large touch target hitbox */}
              {!isDrawn && isInteractive && (
                <rect
                  x={hitX}
                  y={hitY}
                  width={hitW}
                  height={hitH}
                  fill="transparent"
                  className="hover:fill-sky-400/25 active:fill-sky-400/40 transition-colors duration-150"
                  rx={8}
                />
              )}

              {/* Hover / Preview line on hover */}
              {!isDrawn && isInteractive && (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(56, 189, 248, 0.85)"
                  strokeWidth={lineWidth}
                  strokeLinecap="round"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                />
              )}

              {/* Drawn Edge: Underlay glow line for reliable cross-browser neon effect */}
              {isDrawn && (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={solidColor}
                  strokeWidth={lineWidth + 6}
                  strokeLinecap="round"
                  opacity={0.35}
                />
              )}

              {/* Drawn Edge: Main Crisp Solid Line */}
              {isDrawn && (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={solidColor}
                  strokeWidth={isLastMove ? lineWidth + 1.5 : lineWidth}
                  strokeLinecap="round"
                />
              )}

              {/* Hint pulsating edge */}
              {isHint && !isDrawn && (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#C084FC"
                  strokeWidth={lineWidth}
                  strokeLinecap="round"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
              )}

              {/* Last move indicator dot */}
              {isLastMove && (
                <circle
                  cx={(x1 + x2) / 2}
                  cy={(y1 + y2) / 2}
                  r={Math.max(3.5, lineWidth * 0.65)}
                  fill="#FFFFFF"
                  stroke="#0284C7"
                  strokeWidth="1.5"
                />
              )}
            </g>
          );
        })}

        {/* Grid Dots (Rendered on top of lines so dots are always crisp and clean) */}
        {dots.map((dot) => {
          return (
            <g key={dot.id}>
              {/* Outer halo */}
              <circle
                cx={dot.x}
                cy={dot.y}
                r={dotRadius + 2}
                fill="#0B1120"
                stroke="#475569"
                strokeWidth="1.5"
              />
              {/* Core dot */}
              <circle
                cx={dot.x}
                cy={dot.y}
                r={dotRadius}
                fill={theme.dotColor}
                stroke="#64748B"
                strokeWidth="1"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
