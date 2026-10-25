import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PlayerId } from '../game/engine/types';
import { sounds } from '../game/audio/soundEngine';
import { Trophy, RotateCcw, Home, Play, Share2, Sparkles, Award } from 'lucide-react';
import { ACHIEVEMENTS } from '../game/state/achievements';

interface GameOverModalProps {
  winner: PlayerId | 'DRAW' | null;
  player1Score: number;
  player2Score: number;
  player1Name: string;
  player2Name: string;
  clientRole?: PlayerId;
  xpGained: number;
  coinsGained?: number;
  entryFee?: number;
  perWinBonus?: number;
  milestoneBonus?: number;
  milestoneLabel?: string;
  newAchievements: string[];
  onRematch: () => void;
  onWatchReplay: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  player1Score,
  player2Score,
  player1Name,
  player2Name,
  clientRole = 'player1',
  xpGained,
  coinsGained = 0,
  entryFee = 100,
  perWinBonus = 100,
  milestoneBonus = 0,
  milestoneLabel,
  newAchievements,
  onRematch,
  onWatchReplay,
  onHome,
}) => {
  const isDraw = winner === 'DRAW';
  const isClientWinner = winner === clientRole;

  useEffect(() => {
    if (isClientWinner) {
      sounds.playVictory();
      if (coinsGained > 0) {
        setTimeout(() => sounds.playCoinCollect(), 400);
      }
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#38BDF8', '#F59E0B', '#10B981', '#A855F7', '#FBBF24'],
        });
      } catch {
        // Safe fallback
      }
    } else if (isDraw) {
      sounds.playBoxComplete();
      sounds.playCoinCollect();
    } else {
      sounds.playDefeat();
    }
  }, [isClientWinner, isDraw, coinsGained]);

  const handleShare = async () => {
    sounds.playButtonClick();
    const text = `I just finished a strategic Dots & Boxes Pro match! Final Score: ${player1Score} - ${player2Score}. Play now!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dots & Boxes Pro Match Result',
          text,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      alert('Match result copied to clipboard!');
    }
  };

  const unlockedList = ACHIEVEMENTS.filter((a) => newAchievements.includes(a.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Crown / Trophy Icon */}
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Trophy className="w-8 h-8 text-slate-950" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white tracking-tight">
          {isDraw
            ? 'TACTICAL DRAW'
            : isClientWinner
            ? 'VICTORY!'
            : 'MATCH CONCLUDED'}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {isDraw
            ? 'Both players claimed equal territory'
            : isClientWinner
            ? `Outstanding performance, ${player1Name}!`
            : `${winner === 'player1' ? player1Name : player2Name} takes the victory!`}
        </p>

        {/* Final Score Table */}
        <div className="w-full my-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 flex items-center justify-around">
          <div className="text-center">
            <div className="text-xs font-bold text-sky-400 truncate max-w-[100px]">
              {player1Name}
            </div>
            <div className="text-3xl font-black font-mono text-white mt-0.5">
              {player1Score}
            </div>
          </div>

          <div className="text-xs font-mono font-bold text-slate-600 px-2">VS</div>

          <div className="text-center">
            <div className="text-xs font-bold text-amber-400 truncate max-w-[100px]">
              {player2Name}
            </div>
            <div className="text-3xl font-black font-mono text-white mt-0.5">
              {player2Score}
            </div>
          </div>
        </div>

        {/* Coin Payout Reward Banner with Bonus Breakdown */}
        {isClientWinner && coinsGained > 0 && (
          <div className="w-full mb-3 p-3 rounded-2xl bg-gradient-to-r from-amber-950/80 via-amber-900/40 to-slate-900 border border-amber-500/50 shadow-lg shadow-amber-500/10 space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">🪙</span>
                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Total Winnings
                  </div>
                  <div className="text-sm font-black text-white">
                    Victory Prize & Bonuses
                  </div>
                </div>
              </div>
              <span className="text-xl font-black font-mono text-amber-300">
                +{coinsGained} 🪙
              </span>
            </div>

            <div className="pt-1.5 border-t border-slate-800/80 grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-300">
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-950/60">
                <span className="text-slate-400">Match Pot:</span>
                <span className="text-amber-300 font-bold">+{entryFee * 2} 🪙</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-950/60">
                <span className="text-slate-400">Win Bonus:</span>
                <span className="text-emerald-400 font-bold">+{perWinBonus} 🪙</span>
              </div>
              {milestoneBonus > 0 && (
                <div className="col-span-2 flex items-center justify-between px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                  <span>{milestoneLabel || 'Milestone Bonus'}:</span>
                  <span>+{milestoneBonus} 🪙</span>
                </div>
              )}
            </div>
          </div>
        )}

        {isDraw && entryFee > 0 && (
          <div className="w-full mb-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-300">Match Draw Refund:</span>
            <span className="font-bold text-amber-400 font-mono">+{entryFee} Coins Refunded</span>
          </div>
        )}

        {/* XP Gained Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>+{xpGained} Experience XP Gained</span>
        </div>

        {/* Unlocked Achievements list if any */}
        {unlockedList.length > 0 && (
          <div className="w-full mb-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-left">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Award className="w-3.5 h-3.5" />
              Achievement Unlocked!
            </div>
            {unlockedList.map((a) => (
              <div key={a.id} className="text-xs font-semibold text-slate-200">
                ⭐ {a.title} (+{a.xpReward} XP)
              </div>
            ))}
          </div>
        )}

        {/* Buttons Grid */}
        <div className="w-full flex flex-col gap-2 mt-2">
          <button
            onClick={() => {
              sounds.playButtonClick();
              onRematch();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-black text-sm shadow-md active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4 fill-slate-950" />
            <span>PLAY AGAIN</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sounds.playButtonClick();
                onWatchReplay();
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Review Replay</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Result</span>
            </button>
          </div>

          <button
            onClick={() => {
              sounds.playButtonClick();
              onHome();
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors mt-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Arena Hub</span>
          </button>
        </div>
      </div>
    </div>
  );
};
