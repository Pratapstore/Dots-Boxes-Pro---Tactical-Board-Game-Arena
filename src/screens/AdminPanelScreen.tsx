import React, { useState } from 'react';
import { admob, AdMobConfig } from '../game/ads/admobService';
import { sounds } from '../game/audio/soundEngine';
import {
  ShieldCheck,
  ArrowLeft,
  Save,
  Radio,
  Tv,
  Coins,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Layers,
  Sliders,
  Play,
  Key,
} from 'lucide-react';

interface AdminPanelScreenProps {
  onExit: () => void;
  onTestRewardedAd?: () => void;
}

export const AdminPanelScreen: React.FC<AdminPanelScreenProps> = ({
  onExit,
  onTestRewardedAd,
}) => {
  const [config, setConfig] = useState<AdMobConfig>(() => admob.getConfig());

  // Form State
  const [enabled, setEnabled] = useState(config.enabled);
  const [testMode, setTestMode] = useState(config.testMode);
  const [appId, setAppId] = useState(config.appId);
  const [rewardedId, setRewardedId] = useState(config.rewardedId);
  const [bannerId, setBannerId] = useState(config.bannerId);
  const [interstitialId, setInterstitialId] = useState(config.interstitialId);
  const [publisherId, setPublisherId] = useState(config.publisherId);
  const [rewardAmount, setRewardAmount] = useState(config.rewardAmount);
  const [cooldownSec, setCooldownSec] = useState(config.interstitialCooldownSec);

  const [savedToast, setSavedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'admob' | 'economy' | 'test'>('admob');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playCoinCollect();

    const updated: Partial<AdMobConfig> = {
      enabled,
      testMode,
      appId: appId.trim(),
      rewardedId: rewardedId.trim(),
      bannerId: bannerId.trim(),
      interstitialId: interstitialId.trim(),
      publisherId: publisherId.trim(),
      rewardAmount: Number(rewardAmount) || 100,
      interstitialCooldownSec: Number(cooldownSec) || 60,
    };

    admob.saveConfig(updated);
    setConfig(admob.getConfig());
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleResetDefaults = () => {
    sounds.playButtonClick();
    setEnabled(true);
    setTestMode(true);
    setAppId('ca-app-pub-3940256099942544~3347511713');
    setRewardedId('ca-app-pub-3940256099942544/5224354917');
    setBannerId('ca-app-pub-3940256099942544/6300978111');
    setInterstitialId('ca-app-pub-3940256099942544/1033173712');
    setPublisherId('ca-pub-3986932799330524');
    setRewardAmount(100);
    setCooldownSec(60);
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 space-y-4 select-none overflow-y-auto bg-slate-950 text-slate-100 font-sans">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sounds.playButtonClick();
              onExit();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95 group"
            title="Return to Game"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
          <div>
            <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2 font-display">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>ADMIN & MONETIZATION BACKEND</span>
            </h2>
            <div className="text-[11px] text-slate-400">
              Manage Google AdMob Integration, Ad Units, Rewards & App Settings
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-emerald-300">ADMIN ACCESS</span>
        </div>
      </div>

      {/* Success Notification */}
      {savedToast && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>✓ AdMob & Backend Configuration Successfully Saved and Synced!</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('admob')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'admob'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Google AdMob</span>
        </button>
        <button
          onClick={() => setActiveTab('economy')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'economy'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Coin Economy</span>
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'test'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Ad Sandbox Test</span>
        </button>
      </div>

      {/* Main Admin Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* TAB 1: GOOGLE ADMOB CONFIGURATION */}
        {activeTab === 'admob' && (
          <div className="space-y-3.5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider font-display">
                Google AdMob SDK & Unit IDs
              </span>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset to Google Test IDs</span>
              </button>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">AdMob Integration Status</span>
                <span className="text-[10px] text-slate-400">
                  Enable or disable all ads across mobile & web instantly
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  enabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Test Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">Test Mode / Production Mode</span>
                <span className="text-[10px] text-slate-400">
                  {testMode
                    ? 'Using official Google Test Ad Unit IDs (no risk of policy violations)'
                    : 'Using your Live Production Ad Unit IDs'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTestMode(!testMode)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  testMode ? 'bg-amber-500' : 'bg-sky-500'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    testMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* AdMob App ID */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">
                Google AdMob App ID:
              </label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="ca-app-pub-3940256099942544~3347511713"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Official Test: ca-app-pub-3940256099942544~3347511713
              </span>
            </div>

            {/* Rewarded Video ID */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">
                Rewarded Video Ad Unit ID:
              </label>
              <input
                type="text"
                value={rewardedId}
                onChange={(e) => setRewardedId(e.target.value)}
                placeholder="ca-app-pub-3940256099942544/5224354917"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Official Test: ca-app-pub-3940256099942544/5224354917
              </span>
            </div>

            {/* Banner Ad Unit ID */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">
                Banner Ad Unit ID:
              </label>
              <input
                type="text"
                value={bannerId}
                onChange={(e) => setBannerId(e.target.value)}
                placeholder="ca-app-pub-3940256099942544/6300978111"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Official Test: ca-app-pub-3940256099942544/6300978111
              </span>
            </div>

            {/* Interstitial Ad Unit ID */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">
                Interstitial Ad Unit ID:
              </label>
              <input
                type="text"
                value={interstitialId}
                onChange={(e) => setInterstitialId(e.target.value)}
                placeholder="ca-app-pub-3940256099942544/1033173712"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Official Test: ca-app-pub-3940256099942544/1033173712
              </span>
            </div>

            {/* Google Publisher ID */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">
                Google Publisher ID (AdSense / AdMob):
              </label>
              <input
                type="text"
                value={publisherId}
                onChange={(e) => setPublisherId(e.target.value)}
                placeholder="ca-pub-3986932799330524"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {/* TAB 2: COIN REWARDS & ECONOMY */}
        {activeTab === 'economy' && (
          <div className="space-y-3.5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider font-display block border-b border-slate-800 pb-2">
              Game Economy & Video Ad Rewards
            </span>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">
                Base Rewarded Video Coin Reward:
              </label>
              <input
                type="number"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-400">
                Default: 100 Coins for standard 15s Ad
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">
                Interstitial Cooldown Time (seconds):
              </label>
              <input
                type="number"
                value={cooldownSec}
                onChange={(e) => setCooldownSec(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-slate-400">
                Minimum seconds between full-screen interstitial ads (default: 60s)
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: AD SANDBOX & TESTING */}
        {activeTab === 'test' && (
          <div className="space-y-3.5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider font-display block border-b border-slate-800 pb-2">
              Live AdMob Testing & Sandbox
            </span>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Test Rewarded Video Ad</span>
                  <span className="text-[10px] text-slate-400">
                    Triggers a video ad with countdown and reward
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playButtonClick();
                    onTestRewardedAd?.();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Launch Test Ad
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Test Interstitial Ad</span>
                  <span className="text-[10px] text-slate-400">
                    Triggers interstitial full-screen cooldown test
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playButtonClick();
                    const shown = admob.showInterstitial();
                    alert(shown ? 'Interstitial Ad triggered successfully!' : 'Cooldown active! Wait before triggering again.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                >
                  Test Interstitial
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Changes Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 active:scale-[0.98] text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 fill-slate-950" />
            <span>SAVE & SYNC BACKEND ADMOB SETTINGS</span>
          </button>
        </div>
      </form>
    </div>
  );
};
