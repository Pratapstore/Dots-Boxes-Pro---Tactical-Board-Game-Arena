import React, { useState, useEffect } from 'react';
import { PlayerProfile } from '../game/state/playerProfile';
import { sounds } from '../game/audio/soundEngine';
import { ArrowLeft, Trophy, Medal, User } from 'lucide-react';

interface LeaderboardScreenProps {
  profile: PlayerProfile;
  onBack: () => void;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  rating: number;
  wins: number;
  level: number;
  isSelf?: boolean;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ profile, onBack }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data: LeaderboardEntry[]) => {
        // Insert player into the leaderboard dynamically based on their ELO rating
        const all = [...data];
        const selfEntry: LeaderboardEntry = {
          rank: 0,
          name: profile.username,
          avatar: profile.avatar,
          rating: profile.ratingElo,
          wins: profile.wins,
          level: profile.level,
          isSelf: true,
        };

        all.push(selfEntry);
        all.sort((a, b) => b.rating - a.rating);
        const ranked = all.map((item, idx) => ({ ...item, rank: idx + 1 }));
        setEntries(ranked);
        setLoading(false);
      })
      .catch(() => {
        // Fallback local list
        setEntries([
          {
            rank: 1,
            name: profile.username,
            avatar: profile.avatar,
            rating: profile.ratingElo,
            wins: profile.wins,
            level: profile.level,
            isSelf: true,
          },
        ]);
        setLoading(false);
      });
  }, [profile]);

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 select-none overflow-y-auto">
      {/* Top Header */}
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

        <h2 className="text-base font-black text-white tracking-tight">GLOBAL RANKINGS</h2>
        <div className="w-10"></div>
      </div>

      {/* Player Standing Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 to-slate-900 border border-cyan-500/40 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-cyan-300 font-semibold uppercase tracking-wider">
              Your Standing
            </div>
            <div className="text-sm font-bold text-white mt-0.5">{profile.username}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl font-black font-mono text-cyan-400 tabular-nums">
            {profile.ratingElo}
          </div>
          <div className="text-[10px] text-slate-400 uppercase font-mono">ELO Rating</div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          <span>Rank & Player</span>
          <div className="flex items-center gap-6">
            <span>Wins</span>
            <span>Rating</span>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading live rankings...</div>
        ) : (
          entries.map((entry) => {
            const isTop3 = entry.rank <= 3;

            return (
              <div
                key={`${entry.name}_${entry.rank}`}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  entry.isSelf
                    ? 'bg-sky-950/70 border-cyan-400/80 ring-1 ring-cyan-400/30'
                    : 'bg-slate-900/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 text-center font-mono font-bold text-xs ${
                      entry.rank === 1
                        ? 'text-amber-400'
                        : entry.rank === 2
                        ? 'text-slate-300'
                        : entry.rank === 3
                        ? 'text-amber-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {isTop3 ? (
                      <Medal className="w-4 h-4 mx-auto" />
                    ) : (
                      <span>{entry.rank}</span>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                    <User className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{entry.name}</span>
                      {entry.isSelf && (
                        <span className="text-[10px] text-cyan-400 font-mono">(You)</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Level {entry.level}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-xs">
                  <span className="text-slate-400 tabular-nums">{entry.wins}</span>
                  <span
                    className={`font-bold tabular-nums ${
                      entry.isSelf ? 'text-cyan-400' : 'text-slate-200'
                    }`}
                  >
                    {entry.rating}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
