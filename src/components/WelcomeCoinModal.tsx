import React from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../game/audio/soundEngine';
import { Sparkles, Trophy, ArrowRight } from 'lucide-react';

interface WelcomeCoinModalProps {
  isOpen: boolean;
  onClaim: () => void;
}

export const WelcomeCoinModal: React.FC<WelcomeCoinModalProps> = ({ isOpen, onClaim }) => {
  if (!isOpen) return null;

  const handleClaim = () => {
    sounds.playCoinCollect();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#38BDF8', '#10B981'],
      });
    } catch {}
    onClaim();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-amber-500/60 p-6 text-center text-slate-100 shadow-2xl relative flex flex-col items-center">
        {/* Animated Coins Icon */}
        <div className="relative my-2">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 animate-bounce">
            🪙
          </div>
          <div className="absolute -top-1 -right-1 p-1 rounded-full bg-cyan-500 text-white">
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight mt-2">
          WELCOME BONUS!
        </h2>
        <p className="text-xs text-amber-300 font-semibold mt-1">
          Here is your free starting capital to play!
        </p>

        {/* 1,000 Coins Badge */}
        <div className="my-5 w-full p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-950 to-amber-950/80 border border-amber-500/40">
          <div className="text-4xl font-black font-mono tracking-tight text-amber-400 flex items-center justify-center gap-2">
            <span>+1,000</span>
            <span className="text-3xl">🪙</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
            Free Game Coins Added
          </div>
        </div>

        {/* Rules note */}
        <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-5 text-left space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Coin Economy Rules:</span>
          </div>
          <div className="text-[11px] text-slate-400">
            • <strong className="text-amber-300">100 Coins</strong> Entry Fee per match
          </div>
          <div className="text-[11px] text-slate-400">
            • <strong className="text-emerald-400">200 Coins</strong> Winner Takes All Prize!
          </div>
          <div className="text-[11px] text-slate-400">
            • Free refills and daily login bonuses anytime!
          </div>
        </div>

        {/* Claim Action */}
        <button
          onClick={handleClaim}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:brightness-110 active:scale-[0.99] text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all"
        >
          <span>CLAIM 1,000 FREE COINS & PLAY</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
