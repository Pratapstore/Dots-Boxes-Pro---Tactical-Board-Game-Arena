import React, { useState } from 'react';
import { AVATAR_OPTIONS, getCurrentLevelBaseXP, getNextLevelXP, MatchHistoryItem, PlayerProfile, saveProfile } from '../game/state/playerProfile';
import { sounds } from '../game/audio/soundEngine';
import { ArrowLeft, Check, Edit2, Play, Trash2, User, Trophy, Flame, Shield, RotateCcw } from 'lucide-react';

interface ProfileScreenProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onOpenReplay: (item: MatchHistoryItem) => void;
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onUpdateProfile,
  onOpenReplay,
  onBack,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const baseXP = getCurrentLevelBaseXP(profile.level);
  const nextXP = getNextLevelXP(profile.level);
  const levelXPProgress = Math.max(0, profile.xp - baseXP);
  const levelXPTarget = Math.max(1, nextXP - baseXP);
  const levelPercent = Math.min(100, Math.round((levelXPProgress / levelXPTarget) * 100));

  const winRate =
    profile.totalMatches > 0
      ? Math.round((profile.wins / profile.totalMatches) * 100)
      : 0;

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    sounds.playButtonClick();
    const updated = { ...profile, username: nameInput.trim() };
    saveProfile(updated);
    onUpdateProfile(updated);
    setIsEditingName(false);
  };

  const handleSelectAvatar = (avId: string) => {
    sounds.playButtonClick();
    setSelectedAvatar(avId);
    const updated = { ...profile, avatar: avId };
    saveProfile(updated);
    onUpdateProfile(updated);
  };

  const handleResetData = () => {
    sounds.playButtonClick();
    localStorage.removeItem('dots_boxes_pro_profile');
    window.location.reload();
  };

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

        <h2 className="text-base font-black text-white tracking-tight">PLAYER PROFILE</h2>
        <div className="w-10"></div>
      </div>

      {/* Profile Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-cyan-500/20">
              {profile.username.charAt(0).toUpperCase()}
            </div>

            <div>
              {isEditingName ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="px-2 py-1 rounded-lg bg-slate-950 border border-cyan-400 text-xs text-white font-bold max-w-[140px]"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 rounded-lg bg-cyan-500 text-slate-950"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-white">{profile.username}</h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Rating ELO: <span className="text-cyan-400 font-bold">{profile.ratingElo}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-xs font-mono inline-block">
              LEVEL {profile.level}
            </div>
          </div>
        </div>

        {/* XP Level Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Progress to Level {profile.level + 1}</span>
            <span>
              {levelXPProgress} / {levelXPTarget} XP
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-amber-500 transition-all duration-300"
              style={{ width: `${levelPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Avatar Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Select Commander Avatar
        </label>
        <div className="grid grid-cols-4 gap-2">
          {AVATAR_OPTIONS.map((av) => (
            <button
              key={av.id}
              onClick={() => handleSelectAvatar(av.id)}
              className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                selectedAvatar === av.id
                  ? 'bg-sky-950/80 border-cyan-400 ring-1 ring-cyan-400/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white mb-1 shadow-sm"
                style={{ backgroundColor: av.color }}
              >
                <User className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-300">{av.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Career Statistics Grid */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Career Records
        </label>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Matches</div>
            <div className="text-lg font-black font-mono text-white mt-0.5">
              {profile.totalMatches}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Wins</div>
            <div className="text-lg font-black font-mono text-emerald-400 mt-0.5">
              {profile.wins}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Win Rate</div>
            <div className="text-lg font-black font-mono text-cyan-400 mt-0.5">
              {winRate}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Losses</div>
            <div className="text-lg font-black font-mono text-rose-400 mt-0.5">
              {profile.losses}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Current Streak</div>
            <div className="text-lg font-black font-mono text-amber-400 mt-0.5">
              {profile.currentStreak}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Best Streak</div>
            <div className="text-lg font-black font-mono text-amber-400 mt-0.5">
              {profile.bestStreak}
            </div>
          </div>
        </div>
      </div>

      {/* Match History & Replay */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Recent Match History
        </label>

        {profile.matchHistory.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-center text-xs text-slate-500">
            No matches recorded yet. Play a game to view match replays!
          </div>
        ) : (
          <div className="space-y-2">
            {profile.matchHistory.slice(0, 10).map((m) => {
              const isWin = m.result === 'VICTORY';
              const isDraw = m.result === 'DRAW';

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800/80"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-8 rounded-full ${
                        isWin ? 'bg-emerald-400' : isDraw ? 'bg-amber-400' : 'bg-rose-500'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>vs {m.opponentName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({m.boardSize}×{m.boardSize})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Score: {m.playerScore} - {m.opponentScore} · {m.result}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playButtonClick();
                      onOpenReplay(m);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-slate-200" />
                    <span>Replay</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reset Account Data */}
      <div className="pt-2">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-1.5 text-xs text-rose-400/80 hover:text-rose-300 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset Local Profile & Game Data</span>
        </button>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold mb-2">Reset Player Profile?</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              This will erase your statistics, rank, level, and match replays. This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-600/20"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
