import React, { useState } from 'react';
import { PlayerProfile, claimDailyBonus } from '../game/state/playerProfile';
import { sounds } from '../game/audio/soundEngine';
import confetti from 'canvas-confetti';
import {
  X,
  Gift,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Tv,
  Trophy,
  History,
  Coins,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface CoinVaultModalProps {
  profile: PlayerProfile;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (updated: PlayerProfile) => void;
  onOpenWatchAds?: () => void;
  insufficientCoinsNotice?: boolean;
}

export const CoinVaultModal: React.FC<CoinVaultModalProps> = ({
  profile,
  isOpen,
  onClose,
  onProfileUpdated,
  onOpenWatchAds,
  insufficientCoinsNotice = false,
}) => {
  const [tab, setTab] = useState<'rewards' | 'milestones' | 'history'>('rewards');
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const lastClaim = profile.lastDailyRewardClaim || 0;
  const canClaimDaily = now - lastClaim >= ONE_DAY;

  const getRemainingHours = () => {
    const diff = ONE_DAY - (now - lastClaim);
    if (diff <= 0) return 'Ready';
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${mins}m`;
  };

  const handleClaimDaily = () => {
    sounds.playCoinCollect();
    const res = claimDailyBonus(profile);
    if (res.success) {
      onProfileUpdated(res.updatedProfile);
      setClaimSuccessMsg(`🎉 Claimed +${res.bonusCoins.toLocaleString()} Daily Coins!`);
      setTimeout(() => setClaimSuccessMsg(null), 3500);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#FBBF24', '#38BDF8'],
        });
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/40 p-5 text-slate-100 shadow-2xl relative flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playButtonClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center mt-1 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 mb-2">
            🪙
          </div>
          <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
            <span>PRO COIN WALLET</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Real coin stakes · 24h Daily Bonus · Watch Ads to Earn
          </p>
        </div>

        {/* Insufficient Coins Warning if triggered */}
        {insufficientCoinsNotice && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold text-center animate-pulse">
            ⚠️ You need more coins to enter this match! Watch a quick ad or claim your 24h bonus below.
          </div>
        )}

        {/* Success toast notice */}
        {claimSuccessMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{claimSuccessMsg}</span>
          </div>
        )}

        {/* Current Balance Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/30 flex items-center justify-between mb-3 shadow-inner">
          <div>
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Available Wallet Balance
            </div>
            <div className="text-2xl font-black font-mono tracking-tight text-white mt-0.5 flex items-center gap-1.5">
              <span>{profile.coins.toLocaleString()}</span>
              <span className="text-lg">🪙</span>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
              VIP Tier
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl mb-3 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setTab('rewards')}
            className={`py-1.5 rounded-lg transition-all ${
              tab === 'rewards'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily & Ads
          </button>
          <button
            onClick={() => setTab('milestones')}
            className={`py-1.5 rounded-lg transition-all ${
              tab === 'milestones'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Win Bonuses
          </button>
          <button
            onClick={() => setTab('history')}
            className={`py-1.5 rounded-lg transition-all ${
              tab === 'history'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Passbook
          </button>
        </div>

        {/* TAB 1: 24-HOUR DAILY BONUS & WATCH ADS */}
        {tab === 'rewards' && (
          <div className="space-y-2.5 mb-3">
            {/* Daily 24-Hour 1,000 Coins Reward */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                  🎁
                </div>
                <div>
                  <div className="text-xs font-bold text-white">24-Hour Daily Bonus</div>
                  <div className="text-[10px] text-amber-300 font-mono font-bold">
                    +1,000 Coins Free (Once / 24h)
                  </div>
                </div>
              </div>

              <button
                onClick={handleClaimDaily}
                disabled={!canClaimDaily}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  canClaimDaily
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed flex items-center gap-1 font-mono text-[11px]'
                }`}
              >
                {canClaimDaily ? (
                  'CLAIM 1,000 🪙'
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    <span>{getRemainingHours()}</span>
                  </>
                )}
              </button>
            </div>

            {/* Watch Ads & Earn Coins Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg">
                  📺
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Watch Ads to Earn Coins</span>
                  </div>
                  <div className="text-[10px] text-cyan-300 font-mono">
                    +50 to +250 Coins per Video
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playButtonClick();
                  onClose();
                  onOpenWatchAds?.();
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:brightness-110 text-slate-950 text-xs font-black active:scale-95 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1"
              >
                <span>WATCH ADS</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: WIN BONUSES & MILESTONES */}
        {tab === 'milestones' && (
          <div className="space-y-2 mb-3">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-left">
              <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1 mb-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>Win Multiplier & Streak Bonus Rules:</span>
              </div>
              <div className="text-[11px] text-slate-300 space-y-1">
                <div>• <strong className="text-white">Per Win Bonus:</strong> +100 Extra Coins on every match won!</div>
                <div>• <strong className="text-amber-300">5-Win Milestone:</strong> +500 Coins bonus cash reward!</div>
                <div>• <strong className="text-emerald-400">10-Win Milestone:</strong> +1,000 Coins grandmaster reward!</div>
              </div>
            </div>

            {/* Current Streak & Wins Status */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Current Streak</span>
                <span className="text-base font-black font-mono text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  {profile.currentStreak} Wins
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Total Wins</span>
                <span className="text-base font-black font-mono text-cyan-400 mt-0.5 block">
                  {profile.wins} Won
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COIN PASSBOOK / TRANSACTION HISTORY */}
        {tab === 'history' && (
          <div className="space-y-1.5 mb-3 max-h-52 overflow-y-auto pr-1">
            {!profile.transactions || profile.transactions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No coin transactions recorded yet.
              </div>
            ) : (
              profile.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-[11px] font-bold text-white truncate">{tx.label}</div>
                    <div className="text-[9px] text-slate-500 font-mono">
                      {new Date(tx.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <span
                    className={`font-black font-mono text-xs whitespace-nowrap ${
                      tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.amount > 0
                      ? `+${tx.amount.toLocaleString()} 🪙`
                      : `${tx.amount.toLocaleString()} 🪙`}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="mt-auto pt-2 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fair Play Stakes · 100% Free Virtual Gaming Economy</span>
        </div>
      </div>
    </div>
  );
};
