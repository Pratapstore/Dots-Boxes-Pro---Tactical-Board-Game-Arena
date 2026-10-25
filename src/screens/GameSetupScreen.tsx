import React, { useState } from 'react';
import { AIDifficulty, BoardDimension, GameMode } from '../game/engine/types';
import { BOARD_THEMES, BoardThemeId } from '../game/state/settings';
import { sounds } from '../game/audio/soundEngine';
import { Bot, Play, Sparkles } from 'lucide-react';

interface GameSetupScreenProps {
  gameMode: GameMode;
  userCoins?: number;
  onStartMatch: (config: {
    boardSize: BoardDimension;
    aiDifficulty: AIDifficulty;
    themeId: BoardThemeId;
    entryFee: number;
  }) => void;
  onBack: () => void;
}

export const GameSetupScreen: React.FC<GameSetupScreenProps> = ({
  gameMode,
  userCoins = 1000,
  onStartMatch,
  onBack,
}) => {
  const [boardSize, setBoardSize] = useState<BoardDimension>(4);
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('medium');
  const [themeId, setThemeId] = useState<BoardThemeId>('neon_cyber');
  const [entryFee, setEntryFee] = useState<number>(gameMode === 'practice' ? 0 : 100);

  const stakeOptions = [
    { fee: 50, prize: 100, label: 'Starter Stakes', desc: '50 🪙 Entry · 100 🪙 Pot + 100 Bonus' },
    { fee: 100, prize: 200, label: 'Standard Duel', desc: '100 🪙 Entry · 200 🪙 Pot + 100 Bonus' },
    { fee: 250, prize: 500, label: 'High Stakes', desc: '250 🪙 Entry · 500 🪙 Pot + 100 Bonus' },
    { fee: 500, prize: 1000, label: 'Pro Arena', desc: '500 🪙 Entry · 1,000 🪙 Pot + 100 Bonus' },
    { fee: 1000, prize: 2000, label: 'Grandmaster', desc: '1,000 🪙 Entry · 2,000 🪙 Pot + 100 Bonus' },
    { fee: 2500, prize: 5000, label: 'High Roller', desc: '2,500 🪙 Entry · 5,000 🪙 Pot + 100 Bonus' },
    { fee: 0, prize: 0, label: 'Free Practice', desc: '0 🪙 Entry · Casual training match' },
  ];

  const boardSizes: Array<{ size: BoardDimension; label: string; desc: string }> = [
    { size: 3, label: '3×3', desc: '9 Boxes · Quick Match' },
    { size: 4, label: '4×4', desc: '16 Boxes · Classic Standard' },
    { size: 5, label: '5×5', desc: '25 Boxes · Tactical' },
    { size: 6, label: '6×6', desc: '36 Boxes · Advanced' },
    { size: 8, label: '8×8', desc: '64 Boxes · Expert Grid' },
    { size: 10, label: '10×10', desc: '100 Boxes · Grandmaster' },
  ];

  const difficulties: Array<{ level: AIDifficulty; name: string; desc: string }> = [
    { level: 'easy', name: 'Easy', desc: 'Casual bot, makes tactical errors' },
    { level: 'medium', name: 'Medium', desc: 'Takes free boxes, safe moves' },
    { level: 'hard', name: 'Hard', desc: 'Chain control, minimizes sacrifices' },
    { level: 'expert', name: 'Expert', desc: 'Minimax & Double-deal tactics' },
  ];

  const handleStart = () => {
    sounds.playButtonClick();
    onStartMatch({
      boardSize,
      aiDifficulty,
      themeId,
      entryFee,
    });
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-5 select-none overflow-y-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">MATCH SETUP</h2>
        <p className="text-xs text-slate-400">
          {gameMode === 'vs_ai'
            ? 'Challenge an AI opponent'
            : gameMode === 'practice'
            ? 'Practice mode with unlimited undo & hints'
            : 'Pass & play with a friend locally'}
        </p>
      </div>

      {/* 1. Board Size Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Grid Size
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {boardSizes.map((b) => (
            <button
              key={b.size}
              onClick={() => {
                sounds.playButtonClick();
                setBoardSize(b.size);
              }}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                boardSize === b.size
                  ? 'bg-sky-950/80 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-white">{b.label}</span>
                {boardSize === b.size && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1">{b.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. AI Difficulty (Only if vs AI) */}
      {(gameMode === 'vs_ai' || gameMode === 'practice') && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            AI Opponent Difficulty
          </label>
          <div className="grid grid-cols-2 gap-2">
            {difficulties.map((d) => (
              <button
                key={d.level}
                onClick={() => {
                  sounds.playButtonClick();
                  setAIDifficulty(d.level);
                }}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                  aiDifficulty === d.level
                    ? 'bg-sky-950/80 border-cyan-400 ring-1 ring-cyan-400/50'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{d.name}</span>
                  {d.level === 'expert' && (
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Board Theme Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Board Palette
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(Object.keys(BOARD_THEMES) as BoardThemeId[]).map((tid) => {
            const th = BOARD_THEMES[tid];
            return (
              <button
                key={tid}
                onClick={() => {
                  sounds.playButtonClick();
                  setThemeId(tid);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium whitespace-nowrap transition-all ${
                  themeId === tid
                    ? 'bg-slate-800 border-white text-white shadow-sm'
                    : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: th.p1Color }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: th.p2Color }} />
                </div>
                <span>{th.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Match Stake Selector (Coin Bet & Win Prize) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-300">
          <span className="flex items-center gap-1.5">
            <span>🪙 Match Stakes & Coin Pot</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">Balance: {userCoins.toLocaleString()} 🪙</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {stakeOptions.map((stk) => (
            <button
              key={stk.fee}
              onClick={() => {
                sounds.playButtonClick();
                setEntryFee(stk.fee);
              }}
              className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                entryFee === stk.fee
                  ? 'bg-amber-950/70 border-amber-400 ring-1 ring-amber-400/50 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white">{stk.label}</span>
                {entryFee === stk.fee && (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </div>
              <span className="text-[10px] text-amber-300/90 font-mono mt-0.5">{stk.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex items-center gap-3 mt-auto">
        <button
          onClick={() => {
            sounds.playButtonClick();
            onBack();
          }}
          className="w-1/3 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={handleStart}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/25 active:scale-[0.99] transition-all hover:brightness-105"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>START MATCH</span>
        </button>
      </div>
    </div>
  );
};
