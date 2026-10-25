import React, { useState } from 'react';
import { PlayerProfile } from '../game/state/playerProfile';
import { sounds } from '../game/audio/soundEngine';
import { DailyMissionsCard } from '../components/DailyMissionsCard';
import { AdMobBanner } from '../components/AdMobBanner';
import {
  Bot,
  Users,
  Globe,
  Puzzle,
  Trophy,
  Medal,
  BookOpen,
  ArrowRight,
  Flame,
  ChevronRight,
  Sparkles,
  Gamepad2,
} from 'lucide-react';

interface HomeScreenProps {
  profile: PlayerProfile;
  onProfileUpdated: (updated: PlayerProfile) => void;
  onQuickPlay: () => void;
  onSelectMode: (mode: 'vs_ai' | 'local_pass_and_play' | 'online_lobby' | 'challenge' | 'practice') => void;
  onPlayConnectFour: () => void;
  onPlayTicTacToe: () => void;
  onPlayMemoryMatch: () => void;
  onOpenWatchAds: () => void;
  onOpenLeaderboard: () => void;
  onOpenAchievements: () => void;
  onOpenProfile: () => void;
  onOpenTutorial: () => void;
  onOpenAndroidGuide: () => void;
  onOpenCoinVault: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onProfileUpdated,
  onQuickPlay,
  onSelectMode,
  onPlayConnectFour,
  onPlayTicTacToe,
  onPlayMemoryMatch,
  onOpenWatchAds,
  onOpenLeaderboard,
  onOpenAchievements,
  onOpenProfile,
  onOpenTutorial,
  onOpenCoinVault,
}) => {
  const [activeGameCategory, setActiveGameCategory] = useState<'all' | 'dots' | 'classics'>('all');

  const winRate =
    profile.totalMatches > 0
      ? Math.round((profile.wins / profile.totalMatches) * 100)
      : 0;

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 space-y-4 select-none overflow-y-auto">
      {/* 1. Header Profile & Wallet Cards */}
      <div className="grid grid-cols-5 gap-2">
        <div
          onClick={() => {
            sounds.playButtonClick();
            onOpenProfile();
          }}
          className="col-span-3 flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-800 shadow-md cursor-pointer hover:border-slate-700 transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-cyan-500/20">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-amber-500 rounded-md text-[8px] font-black text-slate-950 font-mono">
                L{profile.level}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white truncate">{profile.username}</span>
                {profile.currentStreak >= 2 && (
                  <span className="flex items-center text-[9px] text-amber-400 font-bold shrink-0">
                    <Flame className="w-2.5 h-2.5 fill-amber-400" />
                    {profile.currentStreak}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Elo {profile.ratingElo} · {winRate}% Win
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
        </div>

        {/* Pro Coin Wallet Quick Box */}
        <div
          onClick={() => {
            sounds.playCoinCollect();
            onOpenCoinVault();
          }}
          className="col-span-2 flex flex-col justify-between p-2.5 rounded-2xl bg-gradient-to-br from-amber-950/70 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-md cursor-pointer hover:border-amber-400 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Wallet</span>
            <span className="text-xs">🪙</span>
          </div>
          <div className="text-sm font-black font-mono text-white tracking-tight">
            {profile.coins.toLocaleString()}
          </div>
          <div className="text-[9px] text-amber-300 font-bold flex items-center justify-between">
            <span>24h Bonus & Ads</span>
            <span className="px-1 rounded bg-amber-400/20 text-amber-300 text-[8px] font-black">+</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Quick Play Ranked Banner */}
      <button
        onClick={() => {
          sounds.playButtonClick();
          onQuickPlay();
        }}
        className="w-full relative overflow-hidden flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-500 text-white font-bold shadow-lg shadow-cyan-600/25 active:scale-[0.99] transition-all hover:brightness-105 group border border-sky-400/30"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <div className="flex items-center gap-3.5 z-10 text-left">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-base font-black tracking-tight flex items-center gap-2 font-display">
              <span>RANKED QUICK DUEL</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black font-mono shadow-sm">
                100 🪙 STAKE
              </span>
            </div>
            <div className="text-xs text-sky-100 font-medium">
              Dots & Boxes 4×4 · Winner Takes 200 🪙 Pot
            </div>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center z-10 group-hover:translate-x-1 transition-transform">
          <ArrowRight className="w-5 h-5 text-white" />
        </div>
      </button>

      {/* Free Coins & Ads Quick Claim Banner */}
      <button
        onClick={() => {
          sounds.playButtonClick();
          onOpenWatchAds();
        }}
        className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/50 border border-amber-500/50 hover:border-amber-400 shadow-md active:scale-[0.99] transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
            📺
          </div>
          <div className="text-left">
            <div className="text-xs font-black text-white flex items-center gap-1.5 font-display">
              <span>WATCH ADS & EARN COINS</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                +50 to +250 🪙
              </span>
            </div>
            <div className="text-[10px] text-amber-300/90 font-medium">
              Watch short sponsored video ads to earn free coins!
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* 2.5 DAILY MISSIONS SYSTEM (USER REQUIREMENT) */}
      <DailyMissionsCard
        profile={profile}
        onProfileUpdated={onProfileUpdated}
        onQuickPlay={onQuickPlay}
        onOpenWatchAds={onOpenWatchAds}
      />

      {/* 3. MULTIPLE GAME OPTIONS HUB (USER REQUIREMENT) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 font-display">
              Multiple Game Arena
            </h3>
          </div>
          <span className="text-[10px] font-mono text-amber-400 font-bold">
            100 🪙 Entry · Win 200 🪙
          </span>
        </div>

        {/* Game Category Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              sounds.playButtonClick();
              setActiveGameCategory('all');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all ${
              activeGameCategory === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All (4)
          </button>
          <button
            onClick={() => {
              sounds.playButtonClick();
              setActiveGameCategory('dots');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all ${
              activeGameCategory === 'dots'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dots & Boxes
          </button>
          <button
            onClick={() => {
              sounds.playButtonClick();
              setActiveGameCategory('classics');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all ${
              activeGameCategory === 'classics'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Classics & Arcade
          </button>
        </div>

        {/* 4 Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* GAME 1: DOTS & BOXES PRO */}
          {(activeGameCategory === 'all' || activeGameCategory === 'dots') && (
            <div
              onClick={() => {
                sounds.playButtonClick();
                onSelectMode('vs_ai');
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/50 cursor-pointer active:scale-[0.98] transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform text-lg">
                  ⊡
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  100 🪙 → 200 🪙
                </span>
              </div>
              <div>
                <div className="text-xs font-black text-white font-display">Dots & Boxes Pro</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  3×3 Blitz to 10×10 Grandmaster arena
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-cyan-400 font-semibold">Custom Grid & Stakes</span>
                <span className="text-slate-400 group-hover:text-white transition-colors">Play →</span>
              </div>
            </div>
          )}

          {/* GAME 2: CONNECT FOUR (NEW GAME) */}
          {(activeGameCategory === 'all' || activeGameCategory === 'classics') && (
            <div
              onClick={() => {
                sounds.playButtonClick();
                onPlayConnectFour();
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/50 cursor-pointer active:scale-[0.98] transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform text-lg">
                  🟡
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  100 🪙 → 200 🪙
                </span>
              </div>
              <div>
                <div className="text-xs font-black text-white font-display">Connect 4 Arena</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Drop discs & connect 4-in-a-row to win
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-amber-400 font-semibold">Classic Vertical Drop</span>
                <span className="text-slate-400 group-hover:text-white transition-colors">Play →</span>
              </div>
            </div>
          )}

          {/* GAME 3: TIC TAC TOE BLITZ & GOMOKU (NEW GAME) */}
          {(activeGameCategory === 'all' || activeGameCategory === 'classics') && (
            <div
              onClick={() => {
                sounds.playButtonClick();
                onPlayTicTacToe();
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/50 cursor-pointer active:scale-[0.98] transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform text-lg font-black">
                  ✕◯
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  100 🪙 → 200 🪙
                </span>
              </div>
              <div>
                <div className="text-xs font-black text-white font-display">Tic-Tac-Toe & Gomoku</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  3×3 Rapid Strike & 10×10 Five-in-a-row
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-semibold">3×3 & 10×10 Dual Modes</span>
                <span className="text-slate-400 group-hover:text-white transition-colors">Play →</span>
              </div>
            </div>
          )}

          {/* GAME 4: MEMORY MATCH DUEL (NEW GAME) */}
          {(activeGameCategory === 'all' || activeGameCategory === 'classics') && (
            <div
              onClick={() => {
                sounds.playButtonClick();
                onPlayMemoryMatch();
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-purple-500/50 cursor-pointer active:scale-[0.98] transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform text-lg">
                  🃏
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  100 🪙 → 200 🪙
                </span>
              </div>
              <div>
                <div className="text-xs font-black text-white font-display">Memory Cards Clash</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Turn-based symbol matching card duel
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-purple-400 font-semibold">16 Symbol Pair Hunt</span>
                <span className="text-slate-400 group-hover:text-white transition-colors">Play →</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Special Modes Row: Online Multiplayer & Puzzle Bounty */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => {
            sounds.playButtonClick();
            onSelectMode('online_lobby');
          }}
          className="flex flex-col text-left p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
              100 🪙
            </span>
          </div>
          <span className="text-xs font-bold text-white">Online Ranked Duel</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Live Matchmaking & Rooms</span>
        </button>

        <button
          onClick={() => {
            sounds.playButtonClick();
            onSelectMode('challenge');
          }}
          className="flex flex-col text-left p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Puzzle className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Free 🪙
            </span>
          </div>
          <span className="text-xs font-bold text-white">Tactical Puzzles</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Solve traps & earn coins</span>
        </button>
      </div>

      {/* 5. Shortcuts Row: Leaderboard, Badges, Tutorial */}
      <div className="grid grid-cols-3 gap-2 py-1">
        <button
          onClick={() => {
            sounds.playButtonClick();
            onOpenLeaderboard();
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <Trophy className="w-4 h-4 text-amber-400 mb-1" />
          <span className="text-[11px] font-semibold text-slate-200">Rankings</span>
        </button>

        <button
          onClick={() => {
            sounds.playButtonClick();
            onOpenAchievements();
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <Medal className="w-4 h-4 text-cyan-400 mb-1" />
          <span className="text-[11px] font-semibold text-slate-200">Badges</span>
        </button>

        <button
          onClick={() => {
            sounds.playButtonClick();
            onOpenTutorial();
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <BookOpen className="w-4 h-4 text-emerald-400 mb-1" />
          <span className="text-[11px] font-semibold text-slate-200">Tutorial</span>
        </button>
      </div>

      {/* Google AdMob Connected Banner */}
      <AdMobBanner className="pt-2 pb-1" />
    </div>
  );
};

