import React, { useState, useEffect } from 'react';
import {
  Wifi,
  BatteryMedium,
  Signal,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Sparkles,
  Gamepad2,
  ShieldCheck,
  Flame,
  ChevronLeft,
} from 'lucide-react';
import { sounds } from '../game/audio/soundEngine';

interface MobileFrameProps {
  children: React.ReactNode;
  simulateMobile: boolean;
  onToggleSimulateMobile?: () => void;
  isMuted?: boolean;
  onToggleSound?: () => void;
  coins?: number;
  onOpenVault?: () => void;
  onOpenAds?: () => void;
  onNavigateHome?: () => void;
  onBack?: () => void;
  onOpenSettings?: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  simulateMobile,
  onToggleSimulateMobile,
  isMuted = false,
  onToggleSound,
  coins,
  onOpenVault,
  onOpenAds,
  onNavigateHome,
  onBack,
  onOpenSettings,
}) => {
  // Live clock updating automatically
  const [currentTime, setCurrentTime] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  });

  const [islandExpanded, setIslandExpanded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  if (!simulateMobile) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
        {/* Fullscreen Web View Container */}
        <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col shadow-2xl relative">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 flex flex-col items-center justify-center relative overflow-hidden select-none font-sans">
      {/* Background Ambient Cyber Grid & Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-Left Ambient Orb */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-600/15 blur-3xl" />
        {/* Bottom-Right Ambient Orb */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-cyan-600/15 blur-3xl" />
        {/* Center Accent Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[120px]" />
        {/* Subtle Cyber Grid */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Desktop Top Header Bar (Ambient Web Companion) */}
      <header className="hidden lg:flex items-center justify-between w-full max-w-6xl px-6 py-2.5 z-30 mb-1 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md rounded-2xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-cyan-500/25">
            ⊡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white font-display">
                DOTS & BOXES PRO
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                WEB & MOBILE ARENA
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Multiplayer Strategy & Casual Board Games</p>
          </div>
        </div>

        {/* Center Live Status Ticker */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] text-emerald-300 font-mono">Live Matchmaking Ready</span>
          </div>

          {typeof coins === 'number' && (
            <button
              onClick={() => {
                sounds.playCoinCollect();
                onOpenVault?.();
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all font-mono text-[11px] font-bold"
            >
              <span>🪙</span>
              <span>{coins.toLocaleString()} Coins</span>
              <span className="text-[9px] px-1 bg-amber-500/30 rounded">+</span>
            </button>
          )}
        </div>

        {/* Right Tools & Viewport Mode */}
        <div className="flex items-center gap-2">
          {onToggleSound && (
            <button
              onClick={() => {
                sounds.playButtonClick();
                onToggleSound();
              }}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
          )}

          {onToggleSimulateMobile && (
            <button
              onClick={() => {
                sounds.playButtonClick();
                onToggleSimulateMobile();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs font-medium transition-all"
              title="Switch to wide desktop view"
            >
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px]">Wide Mode</span>
            </button>
          )}
        </div>
      </header>

      {/* Titanium Mobile Device Simulation Wrapper */}
      <div className="relative flex items-center justify-center p-0 sm:p-2 z-20">
        {/* Hardware Side Buttons (Simulated on desktop) */}
        <div className="hidden sm:block absolute -left-2 top-24 w-1.5 h-7 bg-slate-700 rounded-l-md shadow-sm" title="Action Button" />
        <div className="hidden sm:block absolute -left-2 top-36 w-1.5 h-11 bg-slate-700 rounded-l-md shadow-sm" title="Volume Up" />
        <div className="hidden sm:block absolute -left-2 top-52 w-1.5 h-11 bg-slate-700 rounded-l-md shadow-sm" title="Volume Down" />
        <div className="hidden sm:block absolute -right-2 top-32 w-1.5 h-14 bg-slate-700 rounded-r-md shadow-sm" title="Power Button" />

        {/* Smartphone Hardware Frame */}
        <div className="relative w-full max-w-[440px] h-[100dvh] sm:h-[90vh] sm:max-h-[890px] bg-slate-950 sm:rounded-[46px] sm:border-[8px] sm:border-slate-800/95 shadow-2xl flex flex-col overflow-hidden sm:ring-1 sm:ring-slate-700/60 titanium-frame">
          
          {/* Top Speaker Ear-piece (Hardware slit) */}
          <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1 bg-slate-800 rounded-full z-50 pointer-events-none" />

          {/* Interactive Dynamic Island & Status Bar */}
          <div className="flex items-center justify-between px-5 pt-3 pb-2 bg-slate-950/95 text-slate-300 text-[11px] font-mono select-none shrink-0 border-b border-slate-900/80 z-40">
            {/* Left: Real Local Time */}
            <span className="font-bold tracking-tight text-slate-200">{currentTime}</span>

            {/* Center: Dynamic Island */}
            <div 
              onClick={() => setIslandExpanded(!islandExpanded)}
              className={`transition-all duration-300 ease-out cursor-pointer flex items-center justify-center ${
                islandExpanded 
                  ? 'px-3 py-1 bg-slate-900 border border-cyan-500/40 rounded-full shadow-lg shadow-cyan-500/20' 
                  : 'w-24 h-5 bg-black rounded-full'
              }`}
            >
              {islandExpanded ? (
                <div className="flex items-center gap-2 text-[10px] text-cyan-300 font-sans">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>Arena Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-800 inline-block"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 inline-block"></span>
                </div>
              )}
            </div>

            {/* Right: Network & Battery */}
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-[10px] font-bold text-slate-300 hidden xs:inline">5G</span>
              <Signal className="w-3 h-3 text-slate-300" />
              <Wifi className="w-3 h-3 text-slate-300" />
              <div className="flex items-center gap-0.5">
                <span className="text-[9px] font-bold text-slate-300">88%</span>
                <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Inner App Container with Smooth Momentum Scrolling */}
          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative bg-slate-950">
            {children}
          </div>

          {/* Bottom Interactive Android Navigation Bar with Back Button */}
          <div className="flex items-center justify-around px-8 py-2 bg-slate-950 border-t border-slate-900/90 shrink-0 select-none z-30">
            {/* 1. Android Back Button */}
            <button
              onClick={() => {
                sounds.playButtonClick();
                onBack?.();
              }}
              className="p-2 rounded-xl hover:bg-slate-800/80 active:scale-90 text-slate-400 hover:text-cyan-400 transition-all flex items-center justify-center group"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5 text-slate-300 group-hover:text-cyan-400 transition-colors" />
            </button>

            {/* 2. Android Home Button */}
            <button
              onClick={() => {
                sounds.playButtonClick();
                onNavigateHome?.();
              }}
              className="p-2 rounded-xl hover:bg-slate-800/80 active:scale-90 text-slate-400 hover:text-white transition-all flex items-center justify-center group"
              title="Home Screen"
            >
              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 group-hover:border-cyan-400 transition-colors" />
            </button>

            {/* 3. Android Recents / Settings Button */}
            <button
              onClick={() => {
                sounds.playButtonClick();
                onOpenSettings?.();
              }}
              className="p-2 rounded-xl hover:bg-slate-800/80 active:scale-90 text-slate-400 hover:text-white transition-all flex items-center justify-center group"
              title="Settings & Menu"
            >
              <div className="w-3 h-3 rounded-sm border-2 border-slate-400 group-hover:border-cyan-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Quick Dock / Footer Info */}
      <footer className="hidden lg:flex items-center justify-between w-full max-w-4xl px-4 py-2 mt-2 text-xs text-slate-500 z-20">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Fair-Play Verified AI • Instant WebSocket Rooms • Google AdMob Monetization</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Watch Ads & Earn Coins</span>
          <span>•</span>
          <span>Tactical Multi-Game Arena</span>
          <span>•</span>
          <span className="text-slate-400 font-mono">v2.5.0</span>
        </div>
      </footer>
    </div>
  );
};
