import React from 'react';
import { sounds } from '../game/audio/soundEngine';
import { Play, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
  version?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart, version = '1.0.0' }) => {
  return (
    <div
      onClick={() => {
        sounds.playButtonClick();
        onStart();
      }}
      className="relative flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 cursor-pointer select-none overflow-hidden"
    >
      {/* Background Animated Dots Aura */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-dots" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="1.5" fill="#38BDF8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-dots)" />
        </svg>
      </div>

      <div className="w-full flex justify-end">
        <span className="text-[11px] font-mono text-slate-500">v{version}</span>
      </div>

      {/* Center Hero Badge */}
      <div className="flex flex-col items-center text-center my-auto z-10">
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
          <img
            src="/icon.svg"
            alt="Dots & Boxes Pro"
            className="relative w-28 h-28 drop-shadow-2xl rounded-2xl transform transition-transform hover:scale-105"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
          DOTS & BOXES <span className="text-cyan-400">PRO</span>
        </h1>
        <p className="text-xs text-slate-400 max-w-xs font-medium leading-relaxed">
          Premium strategic mobile game with intelligent AI, real-time multiplayer & tactical puzzles.
        </p>

        {/* Start Button */}
        <div className="mt-8 flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 animate-bounce">
          <Play className="w-4 h-4 fill-slate-950" />
          <span>TAP TO ENTER ARENA</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-500 z-10">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Authoritative Logic · Real-time Online · Offline Play</span>
      </div>
    </div>
  );
};
