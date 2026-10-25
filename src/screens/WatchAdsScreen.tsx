import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile, claimAdReward } from '../game/state/playerProfile';
import { sounds } from '../game/audio/soundEngine';
import { admob } from '../game/ads/admobService';
import confetti from 'canvas-confetti';
import {
  Tv,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Play,
  Volume2,
  VolumeX,
  ShieldCheck,
  ExternalLink,
  Coins,
  Flame,
  X,
  Star,
  Download,
} from 'lucide-react';

interface WatchAdsScreenProps {
  profile: PlayerProfile;
  onProfileUpdated: (updated: PlayerProfile) => void;
  onExit: () => void;
}

interface AdOption {
  id: string;
  title: string;
  sponsorName: string;
  sponsorCategory: string;
  duration: number; // in seconds
  rewardCoins: number;
  icon: string;
  badge: string;
  gradient: string;
  videoUrl: string;
}

const AD_TIERS: AdOption[] = [
  {
    id: 'quick_ad',
    title: '5s Blitz Video Ad',
    sponsorName: 'Cyber Strike 3D: Mobile War',
    sponsorCategory: 'Action & Tactical RPG',
    duration: 5,
    rewardCoins: 50,
    icon: '⚡',
    badge: 'Quick +50 🪙',
    gradient: 'from-amber-600/30 to-yellow-500/20',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'standard_video',
    title: '15s Standard Commercial',
    sponsorName: 'Royal Castle Empire',
    sponsorCategory: 'Strategy & Puzzle Game',
    duration: 15,
    rewardCoins: 100,
    icon: '🎬',
    badge: 'Popular +100 🪙',
    gradient: 'from-cyan-600/30 to-blue-500/20',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  {
    id: 'mega_sponsor',
    title: '30s Super Reward Video',
    sponsorName: 'Neon Racing Masters',
    sponsorCategory: 'High-Octane Mobile Racing',
    duration: 30,
    rewardCoins: 250,
    icon: '💎',
    badge: 'High Pot +250 🪙',
    gradient: 'from-purple-600/30 to-fuchsia-500/20',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
];

export const WatchAdsScreen: React.FC<WatchAdsScreenProps> = ({
  profile,
  onProfileUpdated,
  onExit,
}) => {
  const [activeAd, setActiveAd] = useState<AdOption | null>(null);
  const [adTimer, setAdTimer] = useState<number>(0);
  const [isAdFinished, setIsAdFinished] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [isAdMuted, setIsAdMuted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Handle countdown during active ad playback
  useEffect(() => {
    let interval: number | null = null;
    if (activeAd && adTimer > 0) {
      interval = window.setInterval(() => {
        setAdTimer((prev) => {
          if (prev <= 1) {
            setIsAdFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeAd, adTimer]);

  // Handle native video auto-play
  useEffect(() => {
    if (activeAd && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Auto-play might be restricted without mute in some browsers
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsAdMuted(true);
          videoRef.current.play().catch(() => setVideoError(true));
        }
      });
    }
  }, [activeAd]);

  const handleStartWatchAd = (ad: AdOption) => {
    sounds.playButtonClick();
    setActiveAd(ad);
    setAdTimer(ad.duration);
    setIsAdFinished(false);
    setRewardClaimed(false);
    setVideoError(false);
  };

  const handleClaimAdReward = () => {
    if (!activeAd || rewardClaimed) return;
    setRewardClaimed(true);

    sounds.playVictory();
    setTimeout(() => sounds.playCoinCollect(), 300);

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#06B6D4', '#10B981'],
      });
    } catch {}

    const updated = claimAdReward(profile, activeAd.rewardCoins, activeAd.title);
    onProfileUpdated(updated);

    setSuccessToast(`🎉 +${activeAd.rewardCoins} Coins added to your Wallet!`);
    setTimeout(() => {
      setActiveAd(null);
      setSuccessToast(null);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 space-y-4 select-none overflow-y-auto bg-slate-950 font-sans">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sounds.playButtonClick();
              onExit();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95 group"
            title="Go Back"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
          <div>
            <h2 className="text-base font-black text-white tracking-tight flex items-center gap-1.5 font-display">
              <span>WATCH VIDEO ADS & EARN COINS</span>
            </h2>
            <div className="text-[11px] text-slate-400">
              Watch real sponsored video ads to get up to 250 free coins!
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ADS READY</span>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Wallet Balance Summary Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border border-amber-500/30 flex items-center justify-between shadow-inner">
        <div>
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-display">
            Your Wallet Balance
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-white mt-0.5 flex items-center gap-1.5">
            <span>{profile.coins.toLocaleString()}</span>
            <span className="text-lg">🪙</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono text-emerald-400 font-bold block">
            Instant Coin Credit
          </span>
          <span className="text-[9px] text-slate-400">Coins add immediately after watching</span>
        </div>
      </div>

      {/* Rewarded Video Ad Options List */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-display">
          <Tv className="w-4 h-4 text-cyan-400" />
          <span>Select Video Commercial to Watch</span>
        </label>

        <div className="grid grid-cols-1 gap-2.5">
          {AD_TIERS.map((ad) => (
            <div
              key={ad.id}
              className={`p-3.5 rounded-2xl bg-gradient-to-r ${ad.gradient} border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-all`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center text-2xl shadow-md shrink-0">
                  {ad.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white font-display">{ad.title}</span>
                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {ad.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5 font-medium">
                    {ad.sponsorName}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span>{ad.duration}s HD Commercial</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-semibold font-mono">
                      Reward: +{ad.rewardCoins} Coins
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartWatchAd(ad)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>WATCH</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FULLSCREEN REAL HTML5 VIDEO AD VIEWER MODAL */}
      {activeAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md animate-in fade-in select-none">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-amber-500/60 p-4 shadow-2xl relative flex flex-col text-slate-100 overflow-hidden">
            
            {/* Top Bar: Ad Status & Countdown Badge */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-black font-display uppercase tracking-wider">
                  AdMob
                </span>
                <span className="text-xs font-bold text-slate-200 font-display">
                  {activeAd.sponsorName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = !isAdMuted;
                    setIsAdMuted(next);
                    if (videoRef.current) videoRef.current.muted = next;
                  }}
                  className="p-1 rounded-md bg-slate-800 text-slate-300 hover:text-white"
                  title={isAdMuted ? 'Unmute' : 'Mute'}
                >
                  {isAdMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                </button>

                <div className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300">
                  {isAdFinished ? '✓ Ready' : `Reward in ${adTimer}s`}
                </div>
              </div>
            </div>

            {/* REAL HTML5 VIDEO PLAYER CONTAINER */}
            <div className="w-full aspect-video rounded-2xl bg-black border border-slate-800 relative overflow-hidden flex items-center justify-center shadow-inner mb-3">
              {!videoError ? (
                <video
                  ref={videoRef}
                  src={activeAd.videoUrl}
                  playsInline
                  autoPlay
                  loop
                  muted={isAdMuted}
                  className="w-full h-full object-cover"
                  onError={() => setVideoError(true)}
                />
              ) : (
                /* Interactive Fallback Playable Trailer if Video stream is blocked */
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 text-center">
                  <div className="text-4xl mb-2 animate-bounce">{activeAd.icon}</div>
                  <div className="text-sm font-black text-white font-display">
                    {activeAd.sponsorName}
                  </div>
                  <div className="text-[10px] text-cyan-300 mt-1">
                    ⭐⭐⭐⭐⭐ 4.9 · 10M+ Global Players
                  </div>
                </div>
              )}

              {/* Progress Bar at the bottom of the video */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-1000"
                  style={{
                    width: `${Math.min(
                      100,
                      ((activeAd.duration - adTimer) / activeAd.duration) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Sponsor Commercial App Card (Real AdMob Look & Feel) */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-xl shadow-md shrink-0">
                  {activeAd.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white truncate font-display">
                    {activeAd.sponsorName}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span className="flex text-amber-400">★★★★★</span>
                    <span>4.9</span>
                    <span>·</span>
                    <span className="truncate">{activeAd.sponsorCategory}</span>
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30 shrink-0">
                Free Install
              </span>
            </div>

            {/* Reward Summary */}
            <div className="text-center p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 mb-3">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wide font-display">
                Guaranteed Coins Reward
              </div>
              <div className="text-xl font-black font-mono text-white mt-0.5">
                +{activeAd.rewardCoins} 🪙 Coins
              </div>
            </div>

            {/* Claim Reward Button */}
            {isAdFinished ? (
              <button
                disabled={rewardClaimed}
                onClick={handleClaimAdReward}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 fill-slate-950" />
                <span>CLAIM +{activeAd.rewardCoins} COINS NOW</span>
              </button>
            ) : (
              <div className="w-full py-3 rounded-2xl bg-slate-800/80 text-slate-400 text-center font-bold text-xs flex items-center justify-center gap-2">
                <span>Please watch {adTimer}s to unlock reward</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
