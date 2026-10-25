# 🚀 Amazon Appstore Complete Submission Kit & Guide
**App Name:** Dots & Boxes Pro — Multiplayer Board Game  
**Package ID:** `com.dotsandboxes.pro`  
**Version:** 1.0.0 (Build 1)  

---

## 📋 Step 1: Open Amazon Developer Console
1. Go to **[https://developer.amazon.com/apps-and-games/console](https://developer.amazon.com/apps-and-games/console)**.
2. Sign in with your Amazon account (or create a **Free** Developer Account).
3. Click on the yellow button: **"Add New App"** ➔ Select **"Android"**.

---

## 📝 Step 2: App Submission Metadata (Direct Copy-Paste)

### 1. General Information
- **App Title:** `Dots & Boxes Pro - Tactical Board Game Arena`
- **App SKU:** `DOTS_BOXES_PRO_01`
- **App Category:** `Games` ➔ `Board` (or `Strategy`)
- **Default Language:** `English (U.S.)`

### 2. Pricing & Availability
- **Price:** Free
- **Where would you like this app to be available?** In all countries and regions where Amazon sells apps (Worldwide).

### 3. Descriptions

#### Short Description:
```
Experience the classic Dots & Boxes game reimagined with futuristic neon graphics, tactical AI duels, instant multiplayer, ranked coin stakes, and 3 bonus arcade board games!
```

#### Long Description:
```
Welcome to Dots & Boxes Pro — the ultimate tactical turn-based strategy board game designed for mobile, tablet, and smart screens!

Connect adjacent dots to complete glowing neon boxes. Score tactical double-boxes with a single strategic line, trigger chain combos, and outsmart your opponents. Compete in high-stakes ranked duels, earn free coins, complete daily tactical missions, and master 4 distinct game modes in one arena!

🌟 KEY HIGHLIGHTS & FEATURES:
• Multiple Grid Sizes: Play quick 3x3 blitz matches or grandmaster 10x10 tactical showdowns.
• Intelligent Multi-Level AI: Challenge Easy, Medium, Hard, and Expert bots with fair-play verified algorithms.
• 4-in-1 Board Game Arena: Includes Dots & Boxes Pro, Connect 4 Arena, Tic-Tac-Toe & Gomoku (5-in-a-row), and Memory Cards Clash.
• Ranked Stakes & Economy: Wager virtual coins in competitive duels and win double pots.
• Daily Missions & Level Progression: Unlock exclusive achievements, tactical medals, and commander titles.
• Watch Ads & Earn Free Coins: Instant coin recharges powered by rewarded video sponsors.
• Full Match Replay Engine: Review your previous duels move-by-move to elevate your strategy.
• Offline & Online Ready: Play locally with friends on one device (Pass & Play) or duel against world-class AI anytime without internet.

Download Dots & Boxes Pro today and claim your spot on the Global Leaderboard!
```

#### Product Feature Bullets (3 to 5 Bullets):
```
• Modern neon cyberpunk visual design with responsive sound effects and haptic feedback
• 4 Games in 1: Dots & Boxes, Connect 4, Tic-Tac-Toe / Gomoku, and Memory Cards
• 4 AI Difficulty Tiers ranging from casual beginner to grandmaster tactical AI
• Ranked coin match betting with instant wallet rewards and daily missions
• Full match history replay viewer to analyze tactics move-by-move
```

#### Keywords (Search Tags):
```
dots and boxes, board game, strategy game, puzzle game, casual game, turn based, connect 4, tic tac toe, multiplayer board game, offline game, brain training, logic puzzle
```

---

## 🎨 Step 3: Images & Promotional Graphics
Amazon Appstore requires store graphics. We have generated and prepared them for you in `public/amazon-assets/`:

1. **App Icon (512 × 512 px PNG/JPEG):**
   - File Path: `public/amazon-assets/app-icon-512x512.jpg`
2. **Promotional Banner (1024 × 500 px JPEG):**
   - File Path: `public/amazon-assets/feature-banner-1024x500.jpg`
3. **Screenshots (Minimum 3 screenshots):**
   - Take 3 screenshots from your browser (`http://localhost:3000`) or Android device showing:
     - Home Screen Arena
     - Active Dots & Boxes Game Board
     - Connect 4 / Tic-Tac-Toe Screen

---

## 📦 Step 4: Generate Your APK File

### Option A: Via Android Studio (Recommended & Easiest)
1. Open **Android Studio**.
2. Click **Open** ➔ Select the `android/` folder inside `dots-&-boxes-pro`.
3. Wait 1-2 minutes for Gradle to sync.
4. Go to top menu: **Build** ➔ **Build Bundle(s) / APK(s)** ➔ **Build APK(s)**.
5. Android Studio will build the `.apk` file located at:
   `android/app/build/outputs/apk/debug/app-debug.apk` (or Release APK).
6. Upload this `.apk` to the Amazon Developer Console under **"Upload APK/App Bundle"**.

### Option B: Automatic Free Cloud Build via GitHub Actions
We have created a ready-to-use GitHub Actions workflow file: `.github/workflows/build-apk.yml`.
1. Push this repository to your GitHub account (`git push origin main`).
2. Go to the **Actions** tab on GitHub ➔ click **"Build Android APK for Amazon Appstore"** ➔ **Run workflow**.
3. In 3 minutes, download the built APK directly from the **Artifacts** section!

---

## 🛡️ Step 5: Content Rating & Submission
1. In the **Content Rating** tab:
   - Does this app contain violence? ➔ **No**
   - Does this app contain gambling? ➔ **No (Simulated virtual coins only, no real-money gambling)**
   - Target Audience ➔ **All Ages / Everyone**
2. Click **"Submit App"**.
3. Amazon will review and approve your app within 24 to 48 hours, and it will be live worldwide on Amazon Appstore, Fire Tablets, and Fire TV!
