import React, { useState, useEffect, useRef } from 'react';
import {
  C4State,
  C4_COLS,
  C4_ROWS,
  createInitialC4State,
  dropToken,
  getC4AIMove,
  getLowestEmptyRow,
} from '../game/games/connectFour/connectFourEngine';
import { sounds } from '../game/audio/soundEngine';
import confetti from 'canvas-confetti';
import { RotateCcw, ArrowLeft, Bot, Users, Trophy, Sparkles } from 'lucide-react';

interface ConnectFourScreenProps {
  player1Name: string;
  entryFee?: number;
  onDeductStake?: (stake: number) => boolean;
  onMatchComplete: (data: {
    result: 'VICTORY' | 'DEFEAT' | 'DRAW';
    entryFee: number;
    gameName: string;
  }) => { coinsGained: number };
  onExit: () => void;
}

export const ConnectFourScreen: React.FC<ConnectFourScreenProps> = ({
  player1Name,
  entryFee = 100,
  onDeductStake,
  onMatchComplete,
  onExit,
}) => {
  const [state, setState] = useState<C4State>(createInitialC4State);
  const [mode, setMode] = useState<'vs_ai' | 'pass_and_play'>('vs_ai');
  const [aiDifficulty, setAIDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [hasReportedResult, setHasReportedResult] = useState(false);
  const [hasDeductedStake, setHasDeductedStake] = useState(false);
  const [coinsWon, setCoinsWon] = useState<number | null>(null);
  const aiThinkingRef = useRef(false);

  const [currentStake, setCurrentStake] = useState<number>(entryFee);
  const stakeOptions = [50, 100, 250, 500, 1000];

  // Check Game Over
  useEffect(() => {
    if (state.status === 'FINISHED' && !hasReportedResult) {
      setHasReportedResult(true);
      let result: 'VICTORY' | 'DEFEAT' | 'DRAW' = 'DRAW';

      if (state.winner === 'P1') {
        result = 'VICTORY';
        sounds.playVictory();
        setTimeout(() => sounds.playCoinCollect(), 300);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#06B6D4', '#F59E0B', '#10B981'],
          });
        } catch {}
      } else if (state.winner === 'P2') {
        result = mode === 'vs_ai' ? 'DEFEAT' : 'VICTORY';
        if (mode === 'vs_ai') sounds.playDefeat();
        else sounds.playVictory();
      } else {
        result = 'DRAW';
        sounds.playBoxComplete();
      }

      const res = onMatchComplete({
        result,
        entryFee: currentStake,
        gameName: 'Connect 4',
      });
      setCoinsWon(res.coinsGained);
    }
  }, [state.status, state.winner, hasReportedResult, mode, currentStake, onMatchComplete]);

  // AI Turn Loop
  useEffect(() => {
    if (
      mode === 'vs_ai' &&
      state.status === 'PLAYING' &&
      state.currentPlayer === 'P2' &&
      !aiThinkingRef.current
    ) {
      aiThinkingRef.current = true;
      const delay = Math.floor(450 + Math.random() * 300);

      const tId = window.setTimeout(() => {
        try {
          const chosenCol = getC4AIMove(state, aiDifficulty);
          const res = dropToken(state, chosenCol);
          if (res.valid) {
            sounds.playEdgeDraw();
            setState(res.newState);
          }
        } finally {
          aiThinkingRef.current = false;
        }
      }, delay);

      return () => {
        clearTimeout(tId);
        aiThinkingRef.current = false;
      };
    }
  }, [state, mode, aiDifficulty]);

  const handleColumnClick = (col: number) => {
    if (state.status === 'FINISHED') return;
    if (mode === 'vs_ai' && state.currentPlayer !== 'P1') return;

    if (!hasDeductedStake) {
      if (onDeductStake && !onDeductStake(currentStake)) {
        return;
      }
      setHasDeductedStake(true);
    }

    const res = dropToken(state, col);
    if (res.valid) {
      sounds.playEdgeDraw();
      setState(res.newState);
    } else {
      sounds.playError();
    }
  };

  const handleReset = () => {
    sounds.playButtonClick();
    setState(createInitialC4State());
    setHasReportedResult(false);
    setCoinsWon(null);
    setHasDeductedStake(false);
  };

  const isCellWinning = (r: number, c: number) => {
    return state.winningCells.some(([wr, wc]) => wr === r && wc === c);
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 space-y-3 select-none overflow-y-auto">
      {/* Top Header / Mode Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playButtonClick();
              onExit();
            }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <span>CONNECT 4 ARENA</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {currentStake} 🪙 STAKE
              </span>
            </h2>
            <div className="text-[11px] text-slate-400">
              Win Pot: {currentStake * 2} 🪙 (+100 Win Bonus)
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => {
              sounds.playButtonClick();
              setMode('vs_ai');
              handleReset();
            }}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              mode === 'vs_ai' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vs Bot
          </button>
          <button
            onClick={() => {
              sounds.playButtonClick();
              setMode('pass_and_play');
              handleReset();
            }}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              mode === 'pass_and_play' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2P Local
          </button>
        </div>
      </div>

      {/* Multiple Entry Price Stakes Selector Chips */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Stake Price:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {stakeOptions.map((stk) => (
            <button
              key={stk}
              disabled={state.status === 'PLAYING' && state.movesCount > 0}
              onClick={() => {
                sounds.playButtonClick();
                setCurrentStake(stk);
              }}
              className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold transition-all ${
                currentStake === stk
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {stk} 🪙
            </button>
          ))}
        </div>
      </div>

      {/* Players Turn Status Banner */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
            state.currentPlayer === 'P1' && state.status === 'PLAYING'
              ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900/80 border-slate-800/80 opacity-70'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></div>
            <div>
              <div className="text-xs font-bold text-white truncate max-w-[100px]">{player1Name}</div>
              <div className="text-[9px] text-cyan-300 font-mono">Cyan Disc</div>
            </div>
          </div>
          {state.currentPlayer === 'P1' && state.status === 'PLAYING' && (
            <span className="text-[10px] font-black text-cyan-400 animate-pulse">TURN</span>
          )}
        </div>

        <div
          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
            state.currentPlayer === 'P2' && state.status === 'PLAYING'
              ? 'bg-amber-950/70 border-amber-400 shadow-md shadow-amber-500/10'
              : 'bg-slate-900/80 border-slate-800/80 opacity-70'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></div>
            <div>
              <div className="text-xs font-bold text-white truncate max-w-[100px]">
                {mode === 'vs_ai' ? `Bot (${aiDifficulty})` : 'Player 2'}
              </div>
              <div className="text-[9px] text-amber-300 font-mono">Gold Disc</div>
            </div>
          </div>
          {state.currentPlayer === 'P2' && state.status === 'PLAYING' && (
            <span className="text-[10px] font-black text-amber-400 animate-pulse">
              {mode === 'vs_ai' ? 'THINKING' : 'TURN'}
            </span>
          )}
        </div>
      </div>

      {/* Connect Four Vertical Cabinet Grid */}
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <div className="w-full max-w-sm p-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-800 shadow-2xl relative">
          {/* Top Drop Hover Guide Arrows */}
          <div className="grid grid-cols-7 gap-1.5 mb-2 px-1">
            {Array.from({ length: C4_COLS }).map((_, c) => {
              const rowTarget = getLowestEmptyRow(state.board, c);
              const isColAvailable = rowTarget !== -1 && state.status === 'PLAYING';
              return (
                <button
                  key={c}
                  disabled={!isColAvailable}
                  onMouseEnter={() => setHoverCol(c)}
                  onMouseLeave={() => setHoverCol(null)}
                  onClick={() => handleColumnClick(c)}
                  className={`h-6 rounded-md flex items-center justify-center transition-all ${
                    isColAvailable
                      ? 'bg-slate-800/60 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 cursor-pointer active:scale-95'
                      : 'opacity-0 cursor-default'
                  }`}
                >
                  <span className="text-[10px] font-bold">↓</span>
                </button>
              );
            })}
          </div>

          {/* 7 Columns x 6 Rows Board Matrix */}
          <div className="grid grid-cols-7 gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800/90 shadow-inner">
            {state.board.map((rowArr, r) =>
              rowArr.map((cell, c) => {
                const isWinning = isCellWinning(r, c);
                const isHoverTarget = hoverCol === c && getLowestEmptyRow(state.board, c) === r;

                return (
                  <div
                    key={`${r}_${c}`}
                    onClick={() => handleColumnClick(c)}
                    className="aspect-square rounded-full flex items-center justify-center relative cursor-pointer group"
                  >
                    {/* Empty Slot Socket */}
                    <div className="w-full h-full rounded-full bg-slate-900 border border-slate-800/80 shadow-inner flex items-center justify-center">
                      {cell === 'P1' && (
                        <div
                          className={`w-[85%] h-[85%] rounded-full bg-gradient-to-br from-cyan-400 to-sky-600 shadow-md ${
                            isWinning
                              ? 'ring-4 ring-white animate-pulse scale-105'
                              : 'shadow-cyan-500/30'
                          }`}
                        />
                      )}

                      {cell === 'P2' && (
                        <div
                          className={`w-[85%] h-[85%] rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-md ${
                            isWinning
                              ? 'ring-4 ring-white animate-pulse scale-105'
                              : 'shadow-amber-500/30'
                          }`}
                        />
                      )}

                      {!cell && isHoverTarget && state.status === 'PLAYING' && (
                        <div className="w-[70%] h-[70%] rounded-full border-2 border-dashed border-cyan-400/50 opacity-60 animate-ping" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Outcome Banner & Play Again */}
      {state.status === 'FINISHED' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border border-amber-500/40 text-center animate-in zoom-in-95">
          <div className="text-sm font-black text-white mb-1 flex items-center justify-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>
              {state.winner === 'DRAW'
                ? 'MATCH DRAW'
                : state.winner === 'P1'
                ? `${player1Name.toUpperCase()} WON!`
                : mode === 'vs_ai'
                ? 'AI BOT WON!'
                : 'PLAYER 2 WON!'}
            </span>
          </div>

          {state.winner === 'P1' && (
            <div className="text-xs text-amber-300 font-bold font-mono">
              🎉 Pot Claimed: +200 🪙 Winner Prize Added!
            </div>
          )}

          {state.winner === 'DRAW' && (
            <div className="text-xs text-slate-300 font-medium">
              100 🪙 Entry Refunded to your balance.
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 text-xs font-black shadow-md active:scale-95 transition-all"
            >
              PLAY AGAIN (100 🪙)
            </button>
            <button
              onClick={onExit}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
