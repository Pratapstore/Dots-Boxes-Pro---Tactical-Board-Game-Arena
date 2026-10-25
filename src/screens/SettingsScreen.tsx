import React, { useState } from 'react';
import { GameSettings, BOARD_THEMES, BoardThemeId, saveSettings } from '../game/state/settings';
import { sounds } from '../game/audio/soundEngine';
import { ArrowLeft, Volume2, Vibrate, Eye, Smartphone, BookOpen, ExternalLink, ShieldCheck, FileText, Download, Package, Globe, CheckCircle2, AlertTriangle, X, Copy, Check } from 'lucide-react';
import { downloadFileWithFallback, copyToClipboard } from '../utils/downloadHelper';

interface SettingsScreenProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onOpenTutorial: () => void;
  onOpenAndroidGuide: () => void;
  onOpenAdminPanel?: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onOpenTutorial,
  onOpenAndroidGuide,
  onOpenAdminPanel,
  onBack,
}) => {
  const [showCpanelGuide, setShowCpanelGuide] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleDownloadZip = async () => {
    sounds.playCoinCollect();
    setDownloadingZip(true);
    try {
      await downloadFileWithFallback('/download/cpanel-build.zip', 'cpanel-ready-build.zip');
    } finally {
      setTimeout(() => setDownloadingZip(false), 1500);
    }
  };

  const handleCopyLink = async () => {
    sounds.playButtonClick();
    const url = `${window.location.origin}/download/cpanel-build.zip`;
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };
  const update = (partial: Partial<GameSettings>) => {
    sounds.playButtonClick();
    const updated = { ...settings, ...partial };
    saveSettings(updated);
    onUpdateSettings(updated);
  };

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

        <h2 className="text-base font-black text-white tracking-tight">GAME SETTINGS</h2>
        <div className="w-10"></div>
      </div>

      {/* 1. Theme Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Board Visual Palette
        </label>
        <div className="grid grid-cols-1 gap-2">
          {(Object.keys(BOARD_THEMES) as BoardThemeId[]).map((tid) => {
            const th = BOARD_THEMES[tid];
            const isSelected = settings.boardTheme === tid;

            return (
              <button
                key={tid}
                onClick={() => update({ boardTheme: tid })}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-sky-950/80 border-cyan-400 ring-1 ring-cyan-400/50'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: th.p1Color }} />
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: th.p2Color }} />
                  </div>
                  <span className="text-xs font-bold text-white">{th.name}</span>
                </div>

                <div
                  className="w-12 h-6 rounded-lg border border-slate-700"
                  style={{ backgroundColor: th.bgDark }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Audio & Haptics */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Audio & Feedback
        </label>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-white">Sound Effects</div>
                <div className="text-[10px] text-slate-400">Procedural game synthesis</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEffects}
              onChange={(e) => {
                const checked = e.target.checked;
                sounds.setMuted(!checked);
                update({ soundEffects: checked });
              }}
              className="w-5 h-5 accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Vibrate className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-white">Haptic Vibration</div>
                <div className="text-[10px] text-slate-400">Tactile tap feedback on mobile</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.hapticFeedback}
              onChange={(e) => {
                const checked = e.target.checked;
                sounds.setHaptics(checked);
                update({ hapticFeedback: checked });
              }}
              className="w-5 h-5 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 3. Gameplay Options */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Display & Gameplay
        </label>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-xs font-bold text-white">Show Grid Coordinates</div>
                <div className="text-[10px] text-slate-400">Display A-Z and 1-9 labels</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.showCoordinates}
              onChange={(e) => update({ showCoordinates: e.target.checked })}
              className="w-5 h-5 accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-xs font-bold text-white">Mobile Device Frame</div>
                <div className="text-[10px] text-slate-400">Simulate mobile phone viewport</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.simulateMobileDevice}
              onChange={(e) => update({ simulateMobileDevice: e.target.checked })}
              className="w-5 h-5 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Shortcuts & Help */}
      <div className="space-y-2 pt-1">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Hosting Deployment & Source Code
        </label>
        <div className="space-y-2">
          {/* cPanel Build ZIP Button (Pre-built, No Blank Screen) */}
          <button
            onClick={handleDownloadZip}
            disabled={downloadingZip}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/25 via-slate-900 to-emerald-500/10 border border-emerald-500/50 hover:border-emerald-400 active:scale-[0.99] transition-all group shadow-lg text-left disabled:opacity-75"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold group-hover:scale-105 transition-transform">
                🌐
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>cPANEL / WEB HOSTING BUILD (.ZIP)</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-400/20 text-emerald-300 font-bold">
                    FIXES BLANK PAGE
                  </span>
                </div>
                <div className="text-[10px] text-slate-300">
                  {downloadingZip ? 'Downloading ZIP file...' : 'Pre-compiled HTML + JS + CSS with .htaccess for public_html'}
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-emerald-400 shrink-0" />
          </button>

          {/* cPanel Blank Screen Troubleshooting Guide */}
          <button
            onClick={() => {
              sounds.playButtonClick();
              setShowCpanelGuide(true);
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 hover:border-amber-400 text-amber-200 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-bold block text-white">cPanel Blank Screen Guide & Solution</span>
                <span className="text-[10px] text-amber-300/80">Step-by-step Hindi & English guide to fix blank website</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
          </button>

          {/* Full Source Code ZIP (for Developers & Android Studio) */}
          <a
            href="/download/code.zip"
            download="dots-and-boxes-pro-source.zip"
            onClick={() => sounds.playCoinCollect()}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-[0.99] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-sm font-bold group-hover:scale-105 transition-transform">
                📦
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span>Full Developer Source Code (.ZIP)</span>
                  <span className="text-[8px] font-mono px-1 rounded bg-slate-800 text-slate-400 font-bold">
                    REACT / TS
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Raw project repository with Node server & build scripts
                </div>
              </div>
            </div>
            <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </a>

          <button
            onClick={() => {
              sounds.playButtonClick();
              onOpenTutorial();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Interactive Rules Tutorial</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => {
              sounds.playButtonClick();
              onOpenAndroidGuide();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">Android APK & Release Documentation</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </button>

          {/* Admin & AdMob Backend Panel Entry */}
          {onOpenAdminPanel && (
            <button
              onClick={() => {
                sounds.playButtonClick();
                onOpenAdminPanel();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 border-2 border-amber-500/50 hover:border-amber-400 active:scale-[0.99] transition-all group shadow-lg text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/25 text-amber-300 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
                  🔒
                </div>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-1.5 font-display">
                    <span>ADMIN & MONETIZATION BACKEND</span>
                    <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 font-bold">
                      SECRET PANEL
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-200/80">
                    Configure Google AdMob IDs, App ID, Unit IDs & Reward Economy
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* cPanel Guide Modal Popup */}
      {showCpanelGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">cPanel Blank Screen Solution</h3>
              </div>
              <button
                onClick={() => setShowCpanelGuide(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs text-slate-300">
              {/* Why Blank Section */}
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-red-300 text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Website Blank Kyun Dikh Raha Tha? (Reason)</span>
                </div>
                <p className="text-[11px] text-red-200/90 leading-relaxed">
                  cPanel Apache server par raw TypeScript (<code className="text-white bg-red-900/50 px-1 rounded">main.tsx</code>) run nahi hota! Agar aapne source code upload kiya tha, to browser TypeScript samajh nahi pata aur blank page show karta hai.
                </p>
              </div>

              {/* Fix Steps */}
              <div className="space-y-2">
                <div className="font-bold text-white text-[12px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sirf 3 Steps me Theek Karein:</span>
                </div>

                <div className="space-y-2 font-sans">
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <div>
                      <strong className="text-white block">cPanel Ready ZIP Download karein:</strong>
                      <span className="text-slate-400 text-[10px]">Niche diye gaye button se <code className="text-emerald-300">cpanel-ready-build.zip</code> download karein. Isme compiled HTML, JS, CSS aur .htaccess pehle se ready hain.</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <div>
                      <strong className="text-white block">cPanel File Manager me Upload & Extract:</strong>
                      <span className="text-slate-400 text-[10px]">cPanel login karein &gt; <code className="text-cyan-300">public_html</code> kholein &gt; puraani files saaf karein &gt; is ZIP ko upload karke <strong>Extract</strong> karein.</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <div>
                      <strong className="text-white block">Folder Structure Confirm karein:</strong>
                      <span className="text-slate-400 text-[10px]">Dhyan rahe ki <code className="text-white">index.html</code> aur <code className="text-white">assets/</code> seedhe <code className="text-cyan-300">public_html/</code> ke andar hone chahiye (kisi extra folder ke andar nahi).</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Download URL Box */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-200">Direct Download Link:</span>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-cyan-300 transition-colors"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono break-all select-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/download/cpanel-build.zip` : '/download/cpanel-build.zip'}
                </div>
                <p className="text-[10px] text-amber-300/90 leading-tight">
                  Iframe me download block hone par, is link ko <strong>Copy</strong> karke apne browser ke new tab me paste karein aur Enter dabayein!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleDownloadZip}
                  disabled={downloadingZip}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-center disabled:opacity-75"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingZip ? 'DOWNLOADING ZIP...' : 'DOWNLOAD CPANEL BUILD (.ZIP) NOW'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                  </button>

                  <a
                    href="/download/cpanel-build.zip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Legal & Policies (Placeholders clearly marked) */}
      <div className="pt-2 text-center space-y-2 text-[11px] text-slate-500">
        <div className="flex items-center justify-center gap-4">
          <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">
            <ShieldCheck className="w-3.5 h-3.5" />
            Privacy Policy
          </span>
          <span>·</span>
          <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer">
            <FileText className="w-3.5 h-3.5" />
            Terms of Service
          </span>
        </div>
        <div>Dots & Boxes Pro · Production Version 1.0.0</div>
      </div>
    </div>
  );
};
