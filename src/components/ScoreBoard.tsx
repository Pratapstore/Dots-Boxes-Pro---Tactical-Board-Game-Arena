import React from 'react';
import { GameState, PlayerId } from '../game/engine/types';
import { BOARD_THEMES, BoardThemeId } from '../game/state/settings';
import { Bot, User, Zap } from 'lucide-react';

interface ScoreBoardProps {
  gameState: GameState;
  player1Name: string;
  player2Name: string;
  player1Avatar: string;
  player2Avatar: string;
  isP2AI?: boolean;
  themeId: BoardThemeId;
  clientRole?: PlayerId;
  timerSeconds?: number;
  entryFee?: number;
  prizePool?: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  gameState,
  player1Name,
  player2Name,
  isP2AI = false,
  themeId,
  clientRole,
  timerSeconds = 0,
  entryFee = 100,
  prizePool = 200,
}) => {
  const theme = BOARD_THEMES[themeId] || BOARD_THEMES.neon_cyber;
  const isP1Turn = gameState.currentPlayer === 'player1';
  const isP2Turn = gameState.currentPlayer === 'player2';

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.min(
    100,
    Math.round((gameState.completedBoxesCount / Math.max(1, gameState.totalBoxes)) * 100)
  );

  return (
    <div className="w-full flex flex-col gap-2 px-3 py-1">
      {/* Players Header Grid */}
      <div className="grid grid-cols-2 gap-3 items-center">
        {/* Player 1 Card */}
        <div
          className={`relative flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 ${
            isP1Turn
              ? 'bg-slate-900/90 border-sky-500 shadow-md shadow-sky-500/20 ring-1 ring-sky-400'
              : 'bg-slate-900/50 border-slate-800 opacity-80'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-inner"
              style={{ backgroundColor: theme.p1Color }}
            >
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {player1Name}
                </span>
                {clientRole === 'player1' && (
                  <span className="text-[10px] text-sky-400 font-medium">(You)</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                {isP1Turn ? (
                  <span className="text-sky-400 font-semibold flex items-center gap-0.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                    Turn
                  </span>
                ) : (
                  <span>Waiting</span>
                )}
              </div>
            </div>
          </div>

          {/* Score Counter */}
          <div className="text-right pl-2">
            <div
              className="text-2xl font-bold font-mono tracking-tight"
              style={{ color: theme.p1Light }}
            >
              {gameState.scores.player1}
            </div>
          </div>
        </div>

        {/* Player 2 Card */}
        <div
          className={`relative flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 ${
            isP2Turn
              ? 'bg-slate-900/90 border-amber-500 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
              : 'bg-slate-900/50 border-slate-800 opacity-80'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-inner"
              style={{ backgroundColor: theme.p2Color }}
            >
              {isP2AI ? (
                <Bot className="w-4 h-4 text-slate-950 font-bold" />
              ) : (
                <User className="w-4 h-4 text-slate-950" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-100 truncate">
                  {player2Name}
                </span>
                {clientRole === 'player2' && (
                  <span className="text-[10px] text-amber-400 font-medium">(You)</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                {isP2Turn ? (
                  <span className="text-amber-400 font-semibold flex items-center gap-0.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Turn
                  </span>
                ) : (
                  <span>Waiting</span>
                )}
              </div>
            </div>
          </div>

          {/* Score Counter */}
          <div className="text-right pl-2">
            <div
              className="text-2xl font-bold font-mono tracking-tight"
              style={{ color: theme.p2Light }}
            >
              {gameState.scores.player2}
            </div>
          </div>
        </div>
      </div>

      {/* Match Status Bar & Progress */}
      <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span>
            Boxes: <strong className="text-slate-200">{gameState.completedBoxesCount}</strong>/
            {gameState.totalBoxes}
          </span>
          {gameState.extraTurnAwarded && (
            <span className="flex items-center gap-1 text-emerald-400 font-semibold animate-pulse">
              <Zap className="w-3 h-3" /> Extra Turn!
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span>Moves: {gameState.moves.length}</span>
          {timerSeconds > 0 && <span>{formatTimer(timerSeconds)}</span>}
        </div>
      </div>

      {/* Match Stakes Banner */}
      {entryFee > 0 && (
        <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] font-mono">
          <div className="flex items-center gap-1 text-amber-300 font-semibold">
            <span>🪙 Entry:</span>
            <span className="font-bold text-white">{entryFee}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <span>🏆 Winner Prize:</span>
            <span className="text-emerald-300 font-black">+{prizePool} Coins</span>
          </div>
        </div>
      )}

      {/* Visual Board Fill Progress Bar */}
      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-amber-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
