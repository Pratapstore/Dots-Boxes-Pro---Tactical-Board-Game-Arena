import React, { useState } from 'react';
import { sounds } from '../game/audio/soundEngine';
import { ArrowLeft, Check, Copy, Terminal, Smartphone, Shield, Download } from 'lucide-react';
import { downloadFileWithFallback } from '../utils/downloadHelper';

interface AndroidGuideScreenProps {
  onBack: () => void;
}

export const AndroidGuideScreen: React.FC<AndroidGuideScreenProps> = ({ onBack }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (key: string, text: string) => {
    sounds.playButtonClick();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-5 select-none overflow-y-auto">
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
          <span>Settings</span>
        </button>

        <h2 className="text-base font-black text-white tracking-tight">ANDROID APK GUIDE</h2>
        <div className="w-10"></div>
      </div>

      {/* Intro Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-green-950/50 to-slate-900 border border-green-900/50 text-xs text-green-200">
        <div className="flex items-center gap-2 font-bold mb-1">
          <Smartphone className="w-4 h-4 text-green-400" />
          <span>Android APK & Google Play AAB Deployment</span>
        </div>
        This application is fully optimized for cross-platform Android builds using Capacitor or React Native / Expo with offline PWA support.
      </div>

      {/* Direct Downloads */}
      <div className="space-y-2">
        <button
          onClick={() => {
            sounds.playCoinCollect();
            downloadFileWithFallback('/download/cpanel-build.zip', 'cpanel-ready-build.zip');
          }}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/25 via-slate-900 to-emerald-500/10 border border-emerald-500/50 hover:border-emerald-400 active:scale-[0.99] transition-all group shadow-md text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold group-hover:scale-105 transition-transform">
              🌐
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <span>DOWNLOAD CPANEL BUILD (.ZIP)</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-400/20 text-emerald-300 font-bold">
                  PRE-BUILT WEB
                </span>
              </div>
              <div className="text-[10px] text-slate-300">
                Ready to extract into cPanel public_html (no blank page)
              </div>
            </div>
          </div>
          <Download className="w-4 h-4 text-emerald-400 shrink-0" />
        </button>

        <button
          onClick={() => {
            sounds.playCoinCollect();
            downloadFileWithFallback('/download/code.zip', 'dots-and-boxes-pro-source.zip');
          }}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-[0.99] transition-all group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-base font-bold group-hover:scale-105 transition-transform">
              📦
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>DOWNLOAD SOURCE CODE (.ZIP)</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold">
                  FOR ANDROID STUDIO
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Full React TypeScript project to build APK via Capacitor
              </div>
            </div>
          </div>
          <Download className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
      </div>

      {/* 1. App Identifiers */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          1. App Configuration & Manifest
        </h3>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5 font-mono">
          <div><strong className="text-slate-400">App Name:</strong> Dots & Boxes Pro</div>
          <div><strong className="text-slate-400">Package ID:</strong> com.dotsandboxes.pro</div>
          <div><strong className="text-slate-400">Version:</strong> 1.0.0 (Build 1)</div>
          <div><strong className="text-slate-400">Permissions:</strong> android.permission.VIBRATE, android.permission.INTERNET</div>
        </div>
      </div>

      {/* 2. Instant Capacitor Android Build */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          2. Capacitor Native APK Workflow
        </h3>
        <div className="relative p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto">
          <button
            onClick={() =>
              copyToClipboard(
                'cap_cmds',
                `npm run build\nnpx cap init "Dots & Boxes Pro" com.dotsandboxes.pro --web-dir dist\nnpx cap add android\nnpx cap copy\nnpx cap open android`
              )
            }
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {copiedKey === 'cap_cmds' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <code>
            # 1. Build optimized web bundle<br />
            npm run build<br /><br />
            # 2. Initialize Capacitor Android project<br />
            npx cap init "Dots & Boxes Pro" com.dotsandboxes.pro --web-dir dist<br /><br />
            # 3. Add Android platform & sync assets<br />
            npx cap add android<br />
            npx cap copy<br /><br />
            # 4. Open project in Android Studio<br />
            npx cap open android
          </code>
        </div>
      </div>

      {/* 3. Generating Release APK & AAB */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          3. Generate Signed APK & Google Play AAB
        </h3>
        <div className="relative p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 leading-relaxed overflow-x-auto">
          <button
            onClick={() =>
              copyToClipboard(
                'gradle_cmds',
                `keytool -genkey -v -keystore dots-release-key.keystore -alias dotskey -keyalg RSA -keysize 2048 -validity 10000\ncd android\n./gradlew assembleRelease\n./gradlew bundleRelease`
              )
            }
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {copiedKey === 'gradle_cmds' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <code>
            # Generate Keystore signing key<br />
            keytool -genkey -v -keystore dots-release.keystore -alias dots -keyalg RSA -keysize 2048 -validity 10000<br /><br />
            # Build Release APK<br />
            cd android &amp;&amp; ./gradlew assembleRelease<br /><br />
            # Build Google Play AAB (Android App Bundle)<br />
            ./gradlew bundleRelease
          </code>
        </div>
      </div>

      {/* 4. Physical Device Checklist */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          4. Physical Device QA Checklist
        </h3>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Touch targets $\ge 44$px for edge taps on 3x3 up to 10x10 boards</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Haptic feedback vibration tested on real Android hardware</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Web Audio synthesizer latency $\le 50$ms on device speakers</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Real-time WebSocket reconnection when toggling Airplane Mode</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>PWA offline cache test: loads instantly without active network</span>
          </div>
        </div>
      </div>
    </div>
  );
};
