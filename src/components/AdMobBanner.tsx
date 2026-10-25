import React, { useState } from 'react';
import { admob } from '../game/ads/admobService';
import { Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface AdMobBannerProps {
  className?: string;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({ className = '' }) => {
  const config = admob.getConfig();
  const [closed, setClosed] = useState(false);

  if (closed || !config.enabled) return null;

  return (
    <div className={`w-full py-1.5 px-3 select-none ${className}`}>
      <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-md flex items-center justify-between p-2">
        {/* Left: Google AdMob Badge & Info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-[10px] shadow-sm shrink-0">
            Ad
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-white truncate font-display">
                Google AdMob
              </span>
              <span className="text-[8px] font-mono px-1 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                {config.testMode ? 'TEST AD' : 'SPONSORED'}
              </span>
            </div>
            <div className="text-[9px] text-slate-400 truncate">
              Cyber Strike 3D · Play Free Now
            </div>
          </div>
        </div>

        {/* Right: CTA button */}
        <div className="flex items-center gap-1 shrink-0">
          <a
            href="https://admob.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300 font-bold transition-colors"
          >
            <span>Learn</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
