import React from 'react';
import { Volume2, VolumeX, Settings as SettingsIcon, ArrowLeft, Smartphone, Monitor } from 'lucide-react';
import { sounds } from '../game/audio/soundEngine';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  onOpenSettings?: () => void;
  onOpenProfile?: () => void;
  onOpenCoinVault?: () => void;
  onOpenWatchAds?: () => void;
  coins?: number;
  isMuted: boolean;
  onToggleSound: () => void;
  simulateMobile: boolean;
  onToggleSimulateMobile: () => void;
  userLevel?: number;
  userAvatar?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  onOpenSettings,
  onOpenProfile,
  onOpenCoinVault,
  onOpenWatchAds,
  coins,
  isMuted,
  onToggleSound,
  simulateMobile,
  onToggleSimulateMobile,
  userLevel = 1,
}) => {
  return (
    <header className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md sticky top-0 z-40 select-none">
      {/* Zone 1: Brand title or back button */}
      <div className="flex items-center gap-2">
        {onBack ? (
          <button
            onClick={() => {
              sounds.playButtonClick();
              onBack();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95 group shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        ) : null}

        <span className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5 truncate max-w-[140px] sm:max-w-none font-display">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shrink-0 shadow-sm shadow-cyan-400/80 animate-pulse"></span>
          <span className="truncate">{title || 'Dots & Boxes Pro'}</span>
        </span>
      </div>

      {/* Zone 2: Coins Pill & Watch Ads Button & Simulator toggle */}
      <div className="flex items-center gap-2">
        {typeof coins === 'number' && (
          <button
            onClick={() => {
              sounds.playCoinCollect();
              onOpenCoinVault?.();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-950/80 via-amber-900/50 to-slate-900 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-amber-200 transition-all shadow-sm shadow-amber-500/20 active:scale-95 group"
            title="Coin Wallet: 24h Daily Bonus & Win Multipliers"
          >
            <span className="text-xs group-hover:scale-110 transition-transform">🪙</span>
            <span className="text-xs font-black font-mono tracking-tight text-amber-300">
              {coins.toLocaleString()}
            </span>
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold flex items-center justify-center leading-none">
              +
            </span>
          </button>
        )}

        {onOpenWatchAds && (
          <button
            onClick={() => {
              sounds.playButtonClick();
              onOpenWatchAds();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-black transition-all active:scale-95"
            title="Watch Ads & Earn Coins"
          >
            <span>📺</span>
            <span className="text-[10px] hidden sm:inline">Ads</span>
          </button>
        )}

        <button
          onClick={onToggleSimulateMobile}
          className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded-md hover:bg-slate-800/60"
          title="Toggle Mobile Viewport Simulator"
        >
          {simulateMobile ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Zone 3: Actions (Sound, Settings, Profile Avatar) */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            onToggleSound();
            sounds.playButtonClick();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {onOpenSettings && (
          <button
            onClick={() => {
              sounds.playButtonClick();
              onOpenSettings();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        )}

        {onOpenProfile && (
          <button
            onClick={() => {
              sounds.playButtonClick();
              onOpenProfile();
            }}
            className="flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 hover:border-slate-500 transition-all text-xs font-semibold text-slate-200"
            title="Player Profile"
          >
            <span className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-[10px] text-white font-bold">
              {userLevel}
            </span>
            <span className="text-[11px] font-mono">LVL</span>
          </button>
        )}
      </div>
    </header>
  );
};
