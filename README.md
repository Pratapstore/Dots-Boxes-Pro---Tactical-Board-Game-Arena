# Dots & Boxes Pro — Multi-Game Arena & Multiplayer Mobile Web App

A premium, authoritative multiplayer Dots & Boxes game with intelligent AI, multiple minigames (Connect 4, Tic-Tac-Toe & Gomoku, Memory Match Duel), 24-hour daily coin rewards, real-time online WebSockets, tactical puzzles, AdSense rewarded ads integration, and daily missions.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ or 20+ (Node 22 recommended)
- npm, yarn, or pnpm

### 2. Installation
```bash
# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### 4. Build for Production
```bash
# Build optimized client bundles
npm run build

# Start production server
npm start
```

---

## 📱 Android APK & Mobile App Export (Capacitor)

To package this application into a native Android APK or Google Play AAB:

```bash
# 1. Build the production web bundle
npm run build

# 2. Initialize Capacitor
npx cap init "Dots & Boxes Pro" com.dotsandboxes.pro --web-dir dist

# 3. Add Android platform
npx cap add android

# 4. Copy web assets to Android project
npx cap copy

# 5. Open in Android Studio to build APK
npx cap open android
```

In Android Studio:
- Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
- The generated APK will be in `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🎮 Included Features & Games
- **Dots & Boxes Pro**: 3×3 to 10×10 grids with Alpha-Beta / heuristic AI, multiplayer rooms, and multiple stakes (50 to 2,500 🪙).
- **Connect 4 Arena**: Vertical drop disc strategy with intelligent AI and multiple entry tiers.
- **Tic-Tac-Toe & Gomoku**: 3×3 blitz and 10×10 five-in-a-row with smart blocking algorithms.
- **Memory Cards Clash**: 16-card dual matching card duel against memory AI.
- **Daily Missions**: Daily task system rewarding extra coins for matches and victories.
- **Google AdSense Integration**: Publisher ID `ca-pub-3986932799330524` with rewarded video simulations.
- **Real-Time Multiplayer**: WebSocket matchmaking and live room engine built with Node.js and `ws`.
