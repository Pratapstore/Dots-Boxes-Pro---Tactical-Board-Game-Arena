import React, { useState, useEffect, useRef } from 'react';
import {
  TTTState,
  applyTTTMove,
  createInitialTTTState,
  getTTTAIMove,
} from '../game/games/ticTacToe/ticTacToeEngine';
import { sounds } from '../game/audio/soundEngine';
import confetti from 'canvas-confetti';
import { RotateCcw, ArrowLeft, Bot, Users, Trophy, Sparkles } from 'lucide-react';

interface TicTacToeScreenProps {
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

export const TicTacToeScreen: React.FC<TicTacToeScreenProps> = ({
  player1Name,
  entryFee = 100,
  onDeductStake,
  onMatchComplete,
  onExit,
}) => {
  const [boardVariant, setBoardVariant] = useState<3 | 10>(3);
  const [state, setState] = useState<TTTState>(() => createInitialTTTState(3));
  const [mode, setMode] = useState<'vs_ai' | 'pass_and_play'>('vs_ai');
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

      if (state.winner === 'X') {
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
      } else if (state.winner === 'O') {
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
        gameName: boardVariant === 3 ? 'Tic-Tac-Toe Blitz' : 'Gomoku 10x10',
      });
      setCoinsWon(res.coinsGained);
    }
  }, [state.status, state.winner, hasReportedResult, mode, currentStake, boardVariant, onMatchComplete]);

  // AI Turn Loop
  useEffect(() => {
    if (
      mode === 'vs_ai' &&
      state.status === 'PLAYING' &&
      state.currentPlayer === 'O' &&
      !aiThinkingRef.current
    ) {
      aiThinkingRef.current = true;
      const delay = Math.floor(350 + Math.random() * 250);

      const tId = window.setTimeout(() => {
        try {
          const move = getTTTAIMove(state);
          if (move) {
            const [r, c] = move;
            const res = applyTTTMove(state, r, c);
            if (res.valid) {
              sounds.playEdgeDraw();
              setState(res.newState);
            }
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
  }, [state, mode]);

  const handleCellClick = (r: number, c: number) => {
    if (state.status === 'FINISHED') return;
    if (mode === 'vs_ai' && state.currentPlayer !== 'X') return;

    if (!hasDeductedStake) {
      if (onDeductStake && !onDeductStake(currentStake)) {
        return;
      }
      setHasDeductedStake(true);
    }

    const res = applyTTTMove(state, r, c);
    if (res.valid) {
      sounds.playEdgeDraw();
      setState(res.newState);
    } else {
      sounds.playError();
    }
  };

  const handleReset = (newSize?: 3 | 10) => {
    sounds.playButtonClick();
    const sizeToUse = newSize ?? boardVariant;
    setBoardVariant(sizeToUse);
    setState(createInitialTTTState(sizeToUse));
    setHasReportedResult(false);
    setCoinsWon(null);
    setHasDeductedStake(false);
  };

  const isCellWinning = (r: number, c: number) => {
    return state.winningCells.some(([wr, wc]) => wr === r && wc === c);
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 space-y-3 select-none overflow-y-auto">
      {/* Top Header */}
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
              <span>{boardVariant === 3 ? 'TIC-TAC-TOE BLITZ' : 'GOMOKU 10×10'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {currentStake} 🪙 STAKE
              </span>
            </h2>
            <div className="text-[11px] text-slate-400">
              Win Pot: {currentStake * 2} 🪙 (+100 Win Bonus)
            </div>
          </div>
        </div>

        {/* Board Variant Switcher (3x3 vs 10x10) */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => handleReset(3)}
            className={`px-2 py-1 rounded-md font-semibold transition-all ${
              boardVariant === 3 ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3×3
          </button>
          <button
            onClick={() => handleReset(10)}
            className={`px-2 py-1 rounded-md font-semibold transition-all ${
              boardVariant === 10 ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            10×10
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
            state.currentPlayer === 'X' && state.status === 'PLAYING'
              ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900/80 border-slate-800/80 opacity-70'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-cyan-400">✕</span>
            <div>
              <div className="text-xs font-bold text-white truncate max-w-[100px]">{player1Name}</div>
              <div className="text-[9px] text-cyan-300 font-mono">Player X</div>
            </div>
          </div>
          {state.currentPlayer === 'X' && state.status === 'PLAYING' && (
            <span className="text-[10px] font-black text-cyan-400 animate-pulse">TURN</span>
          )}
        </div>

        <div
          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
            state.currentPlayer === 'O' && state.status === 'PLAYING'
              ? 'bg-amber-950/70 border-amber-400 shadow-md shadow-amber-500/10'
              : 'bg-slate-900/80 border-slate-800/80 opacity-70'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-amber-400">◯</span>
            <div>
              <div className="text-xs font-bold text-white truncate max-w-[100px]">
                {mode === 'vs_ai' ? 'Tactical Bot' : 'Player 2'}
              </div>
              <div className="text-[9px] text-amber-300 font-mono">Player O</div>
            </div>
          </div>
          {state.currentPlayer === 'O' && state.status === 'PLAYING' && (
            <span className="text-[10px] font-black text-amber-400 animate-pulse">
              {mode === 'vs_ai' ? 'THINKING' : 'TURN'}
            </span>
          )}
        </div>
      </div>

      {/* Board Arena */}
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <div
          className={`w-full max-w-sm p-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-800 shadow-2xl relative grid gap-1.5 ${
            boardVariant === 3 ? 'grid-cols-3 aspect-square' : 'grid-cols-10 aspect-square'
          }`}
        >
          {state.board.map((rowArr, r) =>
            rowArr.map((cell, c) => {
              const isWinning = isCellWinning(r, c);

              return (
                <button
                  key={`${r}_${c}`}
                  disabled={state.status === 'FINISHED' || cell !== null}
                  onClick={() => handleCellClick(r, c)}
                  className={`rounded-xl flex items-center justify-center font-black transition-all active:scale-95 ${
                    boardVariant === 3 ? 'text-4xl' : 'text-xs'
                  } ${
                    cell === null
                      ? 'bg-slate-950/80 hover:bg-slate-850 border border-slate-800/90 text-transparent hover:text-slate-700'
                      : 'bg-slate-900 border border-slate-800 shadow-inner'
                  } ${
                    isWinning
                      ? 'ring-2 ring-white bg-gradient-to-br from-amber-500/30 to-amber-700/40 animate-pulse'
                      : ''
                  }`}
                >
                  {cell === 'X' ? (
                    <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">✕</span>
                  ) : cell === 'O' ? (
                    <span className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">◯</span>
                  ) : (
                    '·'
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Match Result Summary */}
      {state.status === 'FINISHED' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border border-amber-500/40 text-center animate-in zoom-in-95">
          <div className="text-sm font-black text-white mb-1 flex items-center justify-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>
              {state.winner === 'DRAW'
                ? 'MATCH DRAW'
                : state.winner === 'X'
                ? `${player1Name.toUpperCase()} WON!`
                : mode === 'vs_ai'
                ? 'AI BOT WON!'
                : 'PLAYER 2 WON!'}
            </span>
          </div>

          {state.winner === 'X' && (
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
              onClick={() => handleReset()}
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
