import React, { useState, useEffect } from 'react';
import { PlayerProfile, DailyMission, claimDailyMission } from '../game/state/playerProfile';
import { sounds } from '../game/audio/soundEngine';
import confetti from 'canvas-confetti';
import {
  Target,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  Gift,
  Coins,
  ArrowRight,
} from 'lucide-react';

interface DailyMissionsCardProps {
  profile: PlayerProfile;
  onProfileUpdated: (updated: PlayerProfile) => void;
  onQuickPlay: () => void;
  onOpenWatchAds: () => void;
}

export const DailyMissionsCard: React.FC<DailyMissionsCardProps> = ({
  profile,
  onProfileUpdated,
  onQuickPlay,
  onOpenWatchAds,
}) => {
  const missions = profile.dailyMissions?.missions || [];
  const [claimToast, setClaimToast] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Calculate time remaining until midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeLeft('Resetting...');
        return;
      }
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${mins}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  const completedCount = missions.filter((m) => m.completed).length;
  const claimedCount = missions.filter((m) => m.claimed).length;
  const totalMissions = missions.length;
  const hasUnclaimed = missions.some((m) => m.completed && !m.claimed);

  const handleClaim = (mission: DailyMission) => {
    if (!mission.completed || mission.claimed) return;

    sounds.playCoinCollect();
    setTimeout(() => sounds.playVictory(), 200);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#10B981', '#38BDF8'],
      });
    } catch {}

    const res = claimDailyMission(profile, mission.id);
    onProfileUpdated(res.updatedProfile);

    if (res.allMissionsBonus > 0) {
      setClaimToast(`🎉 +${res.rewardCoins} 🪙 + ${res.allMissionsBonus} 🪙 All-Missions Bonus!`);
    } else {
      setClaimToast(`🎉 Claimed +${res.rewardCoins} 🪙 Coins for ${mission.title}!`);
    }

    setTimeout(() => setClaimToast(null), 3000);
  };

  if (missions.length === 0) return null;

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-black">
            <Target className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Daily Missions
              </h3>
              <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[9px] font-bold font-mono">
                EXTRA COINS
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Complete daily tasks to earn bonus rewards</p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 justify-end">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{timeLeft}</span>
          </div>
          <div className="text-[9px] font-bold text-amber-300 font-mono">
            {claimedCount}/{totalMissions} Claimed
          </div>
        </div>
      </div>

      {/* Claim Toast Notice */}
      {claimToast && (
        <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{claimToast}</span>
        </div>
      )}

      {/* Missions List */}
      <div className="space-y-2">
        {missions.map((mission) => {
          const progressPercent = Math.min(100, Math.round((mission.progress / mission.target) * 100));

          return (
            <div
              key={mission.id}
              className={`p-2.5 rounded-xl border transition-all ${
                mission.claimed
                  ? 'bg-slate-950/60 border-slate-800/80 opacity-75'
                  : mission.completed
                  ? 'bg-amber-950/30 border-amber-500/40 shadow-sm'
                  : 'bg-slate-950/80 border-slate-800'
              } flex items-center justify-between gap-3`}
            >
              {/* Icon & Mission Info */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-base shrink-0 shadow-inner">
                  {mission.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-white truncate">{mission.title}</span>
                    <span className="text-[10px] font-mono font-bold text-amber-300 shrink-0">
                      +{mission.rewardCoins} 🪙
                    </span>
                  </div>

                  {/* Progress Bar & Subtitle */}
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          mission.completed
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-cyan-500 to-sky-400'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 shrink-0">
                      {mission.progress}/{mission.target}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0">
                {mission.claimed ? (
                  <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Done</span>
                  </span>
                ) : mission.completed ? (
                  <button
                    onClick={() => handleClaim(mission)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all animate-pulse"
                  >
                    CLAIM
                  </button>
                ) : mission.type === 'WATCH_AD' ? (
                  <button
                    onClick={() => {
                      sounds.playButtonClick();
                      onOpenWatchAds();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-colors"
                  >
                    WATCH
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sounds.playButtonClick();
                      onQuickPlay();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-colors"
                  >
                    PLAY
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Bonus Status */}
      {claimedCount === totalMissions && (
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 border border-amber-500/30 text-center flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px] font-bold text-amber-200">
            🎉 All daily missions completed! +250 🪙 Mastery Bonus rewarded.
          </span>
        </div>
      )}
    </div>
  );
};
