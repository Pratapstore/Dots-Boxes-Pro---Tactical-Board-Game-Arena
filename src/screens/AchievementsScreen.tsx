import React, { useState } from 'react';
import { ACHIEVEMENTS } from '../game/state/achievements';
import { PlayerProfile } from '../game/state/playerProfile';
import { sounds } from '../game/audio/soundEngine';
import { ArrowLeft, CheckCircle2, Lock, Medal, Sparkles } from 'lucide-react';

interface AchievementsScreenProps {
  profile: PlayerProfile;
  onBack: () => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ profile, onBack }) => {
  const [filter, setFilter] = useState<'All' | 'Progression' | 'Mastery' | 'Special'>('All');

  const filtered = ACHIEVEMENTS.filter(
    (item) => filter === 'All' || item.category === filter
  );

  const unlockedCount = profile.unlockedAchievements.length;
  const progressPercent = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sounds.playButtonClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Arena</span>
        </button>

        <h2 className="text-base font-black text-white tracking-tight">ACHIEVEMENTS</h2>
        <div className="w-10"></div>
      </div>

      {/* Overview Progress Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Medal className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-purple-300 font-semibold uppercase tracking-wider">
                Completion
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                {unlockedCount} of {ACHIEVEMENTS.length} Badges
              </div>
            </div>
          </div>

          <div className="text-lg font-black font-mono text-purple-400 tabular-nums">
            {progressPercent}%
          </div>
        </div>

        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(['All', 'Progression', 'Mastery', 'Special'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              sounds.playButtonClick();
              setFilter(cat);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === cat
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Achievement List */}
      <div className="space-y-2.5">
        {filtered.map((item) => {
          const isUnlocked = profile.unlockedAchievements.includes(item.id);

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                isUnlocked
                  ? 'bg-slate-900/80 border-cyan-500/30 shadow-sm'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isUnlocked
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? <Sparkles className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white">{item.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 pl-2">
                  {isUnlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      +{item.xpReward} XP
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
