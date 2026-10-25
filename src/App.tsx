/**
 * Dots & Boxes Pro & Multi-Game Arena — Main Application Container
 */

import React, { useState } from 'react';
import { GameMode, BoardDimension, AIDifficulty, GameState, PlayerId, PuzzleDefinition } from './game/engine/types';
import { getInitialProfile, MatchHistoryItem, PlayerProfile, recordMatchResult, saveProfile, deductEntryCoins, addCoins, recordMissionEvent } from './game/state/playerProfile';
import { getInitialSettings, GameSettings, saveSettings } from './game/state/settings';
import { sounds } from './game/audio/soundEngine';
import { Header } from './components/Header';
import { MobileFrame } from './components/MobileFrame';
import { SplashScreen } from './screens/SplashScreen';
import { HomeScreen } from './screens/HomeScreen';
import { GameSetupScreen } from './screens/GameSetupScreen';
import { GameScreen } from './screens/GameScreen';
import { ConnectFourScreen } from './screens/ConnectFourScreen';
import { TicTacToeScreen } from './screens/TicTacToeScreen';
import { MemoryMatchScreen } from './screens/MemoryMatchScreen';
import { OnlineLobbyScreen } from './screens/OnlineLobbyScreen';
import { ChallengeScreen } from './screens/ChallengeScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { AchievementsScreen } from './screens/AchievementsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { TutorialScreen } from './screens/TutorialScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ReplayViewerScreen } from './screens/ReplayViewerScreen';
import { AndroidGuideScreen } from './screens/AndroidGuideScreen';
import { WatchAdsScreen } from './screens/WatchAdsScreen';
import { AdminPanelScreen } from './screens/AdminPanelScreen';
import { createInitialGameState } from './game/engine/board';
import { applyMove } from './game/engine/rules';
import { networkClient, OpponentInfo } from './game/multiplayer/networkClient';
import { CoinVaultModal } from './components/CoinVaultModal';
import { WelcomeCoinModal } from './components/WelcomeCoinModal';

type Screen =
  | 'splash'
  | 'home'
  | 'setup'
  | 'game'
  | 'connect_four'
  | 'tic_tac_toe'
  | 'memory_match'
  | 'watch_ads'
  | 'online_lobby'
  | 'challenge'
  | 'leaderboard'
  | 'achievements'
  | 'profile'
  | 'tutorial'
  | 'settings'
  | 'replay'
  | 'android_guide'
  | 'admin';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [profile, setProfile] = useState<PlayerProfile>(getInitialProfile);
  const [settings, setSettings] = useState<GameSettings>(getInitialSettings);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  // Game session parameters
  const [gameMode, setGameMode] = useState<GameMode>('vs_ai');
  const [boardSize, setBoardSize] = useState<BoardDimension>(4);
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('medium');
  const [entryFee, setEntryFee] = useState<number>(100);
  const [isCoinVaultOpen, setIsCoinVaultOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(!profile.welcomeGiftClaimed);
  const [insufficientCoinsWarning, setInsufficientCoinsWarning] = useState(false);
  const [customInitialState, setCustomInitialState] = useState<GameState | undefined>(undefined);
  const [onlineOpponent, setOnlineOpponent] = useState<OpponentInfo | null>(null);
  const [onlineRole, setOnlineRole] = useState<PlayerId>('player1');
  const [replayMatchItem, setReplayMatchItem] = useState<MatchHistoryItem | null>(null);
  const [confirmExitGame, setConfirmExitGame] = useState(false);

  const toggleSound = () => {
    const muted = !isMuted;
    sounds.setMuted(muted);
    setIsMuted(muted);
  };

  const toggleSimulateMobile = () => {
    const next = !settings.simulateMobileDevice;
    const updated = { ...settings, simulateMobileDevice: next };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleOpenVault = (insufficient: boolean = false) => {
    setInsufficientCoinsWarning(insufficient);
    setIsCoinVaultOpen(true);
  };

  // Multiple Stakes Mini-Game Entry Handler
  const handleDeductMiniGameStake = (stake: number, gameName: string): boolean => {
    if (stake <= 0) return true;
    if (profile.coins < stake) {
      sounds.playError();
      handleOpenVault(true);
      return false;
    }
    const updated = deductEntryCoins(profile, stake, gameName);
    setProfile(updated);
    sounds.playCoinSpend();
    return true;
  };

  // Dots & Boxes Quick Play (100 Coin Stake)
  const handleQuickPlay = () => {
    if (profile.coins < 100) {
      sounds.playError();
      handleOpenVault(true);
      return;
    }
    const updated = deductEntryCoins(profile, 100, 'Dots & Boxes 4×4');
    setProfile(updated);
    sounds.playCoinSpend();
    setEntryFee(100);
    setGameMode('vs_ai');
    setBoardSize(4);
    setAIDifficulty('medium');
    setCustomInitialState(undefined);
    setScreen('game');
  };

  // Connect Four Launch (Multiple Stakes: 50, 100, 250, 500, 1000)
  const handleStartConnectFour = () => {
    if (profile.coins < 50) {
      sounds.playError();
      handleOpenVault(true);
      return;
    }
    setScreen('connect_four');
  };

  // Tic-Tac-Toe / Gomoku Launch (Multiple Stakes: 50, 100, 250, 500, 1000)
  const handleStartTicTacToe = () => {
    if (profile.coins < 50) {
      sounds.playError();
      handleOpenVault(true);
      return;
    }
    setScreen('tic_tac_toe');
  };

  // Memory Cards Clash Launch (Multiple Stakes: 50, 100, 250, 500, 1000)
  const handleStartMemoryMatch = () => {
    if (profile.coins < 50) {
      sounds.playError();
      handleOpenVault(true);
      return;
    }
    setScreen('memory_match');
  };

  const handleStartModeFromHome = (mode: GameMode | 'online_lobby') => {
    if (mode === 'online_lobby') {
      setScreen('online_lobby');
      return;
    }
    if (mode === 'challenge') {
      setScreen('challenge');
      return;
    }

    setGameMode(mode);
    setCustomInitialState(undefined);
    setScreen('setup');
  };

  const handleStartMatch = (config: {
    boardSize: BoardDimension;
    aiDifficulty: AIDifficulty;
    themeId: any;
    entryFee: number;
  }) => {
    if (config.entryFee > 0) {
      if (profile.coins < config.entryFee) {
        sounds.playError();
        handleOpenVault(true);
        return;
      }
      const updated = deductEntryCoins(profile, config.entryFee, `Dots & Boxes ${config.boardSize}×${config.boardSize}`);
      setProfile(updated);
      sounds.playCoinSpend();
    }
    setEntryFee(config.entryFee);
    setBoardSize(config.boardSize);
    setAIDifficulty(config.aiDifficulty);
    const updatedSettings = { ...settings, boardTheme: config.themeId };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
    setCustomInitialState(undefined);
    setScreen('game');
  };

  const handleStartPuzzle = (puzzle: PuzzleDefinition) => {
    let state = createInitialGameState(puzzle.boardSize);
    let curPlayer = puzzle.startingPlayer;

    for (const edgeId of puzzle.preDrawnEdgeIds) {
      const res = applyMove(state, edgeId, curPlayer);
      if (res.valid) {
        state = res.newState;
        curPlayer = state.currentPlayer;
      }
    }

    setEntryFee(0);
    setGameMode('challenge');
    setBoardSize(puzzle.boardSize);
    setAIDifficulty('medium');
    setCustomInitialState(state);
    setScreen('game');
  };

  // Dots & Boxes Match Complete
  const handleMatchComplete = (data: {
    result: 'VICTORY' | 'DEFEAT' | 'DRAW';
    p1Score: number;
    p2Score: number;
    moves: any[];
    durationSeconds: number;
    isAIExpert?: boolean;
    entryFee?: number;
  }) => {
    const oppName =
      gameMode === 'vs_ai'
        ? `AI Bot (${aiDifficulty})`
        : gameMode === 'local_pass_and_play'
        ? 'Guest Player 2'
        : onlineOpponent
        ? onlineOpponent.name
        : 'Opponent';

    const currentFee = data.entryFee ?? entryFee;

    const { updatedProfile, newAchievements, xpGained, coinsGained } = recordMatchResult(
      profile,
      data.result,
      gameMode,
      boardSize,
      data.p1Score,
      data.p2Score,
      oppName,
      'grandmaster',
      data.moves,
      data.durationSeconds,
      data.isAIExpert,
      currentFee
    );

    setProfile(updatedProfile);
    return { xpGained, newAchievements, coinsGained };
  };

  // Mini-Games (Connect 4, Tic-Tac-Toe, Memory Match) Complete
  const handleMiniGameComplete = (data: {
    result: 'VICTORY' | 'DEFEAT' | 'DRAW';
    entryFee: number;
    gameName: string;
  }) => {
    let coinsGained = 0;
    if (data.result === 'VICTORY') {
      const basePrize = data.entryFee * 2;
      const perWinBonus = 100; // User requirement: "per wining bonus 100 coins"
      let milestoneBonus = 0;
      const newWins = profile.wins + 1;
      const newStreak = profile.currentStreak + 1;

      // User requirement: "5 wining bonus 500 10 wining 1000"
      if (newStreak === 5 || newWins === 5) {
        milestoneBonus = 500;
      } else if (newStreak === 10 || newWins === 10) {
        milestoneBonus = 1000;
      }

      coinsGained = basePrize + perWinBonus + milestoneBonus;
      const label = `${data.gameName} Victory (${basePrize} 🪙) + Win Bonus (+${perWinBonus} 🪙)${milestoneBonus > 0 ? ` + Milestone (+${milestoneBonus} 🪙)` : ''}`;
      const updated = addCoins(profile, coinsGained, label);
      let pWithStats: PlayerProfile = {
        ...updated,
        wins: newWins,
        currentStreak: newStreak,
        bestStreak: Math.max(profile.bestStreak, newStreak),
        totalMatches: profile.totalMatches + 1,
      };
      pWithStats = recordMissionEvent(pWithStats, { type: 'PLAY_MATCHES', count: 1 });
      pWithStats = recordMissionEvent(pWithStats, { type: 'WIN_GAMES', count: 1 });
      setProfile(pWithStats);
    } else if (data.result === 'DRAW') {
      coinsGained = data.entryFee; // Refund entry
      const updated = addCoins(profile, coinsGained, `${data.gameName} Draw Refund (+${coinsGained} 🪙)`);
      let pWithStats: PlayerProfile = {
        ...updated,
        draws: profile.draws + 1,
        totalMatches: profile.totalMatches + 1,
      };
      pWithStats = recordMissionEvent(pWithStats, { type: 'PLAY_MATCHES', count: 1 });
      setProfile(pWithStats);
    } else {
      let pWithStats: PlayerProfile = {
        ...profile,
        losses: profile.losses + 1,
        currentStreak: 0,
        totalMatches: profile.totalMatches + 1,
      };
      pWithStats = recordMissionEvent(pWithStats, { type: 'PLAY_MATCHES', count: 1 });
      setProfile(pWithStats);
    }
    return { coinsGained };
  };

  const handleOpenReplay = (item: MatchHistoryItem) => {
    setReplayMatchItem(item);
    setScreen('replay');
  };

  // Determine header title
  const getHeaderTitle = () => {
    switch (screen) {
      case 'home':
        return 'Game Arena Pro';
      case 'setup':
        return 'Match Configuration';
      case 'connect_four':
        return 'Connect 4 Arena';
      case 'tic_tac_toe':
        return 'Tic-Tac-Toe & Gomoku';
      case 'memory_match':
        return 'Memory Cards Clash';
      case 'watch_ads':
        return 'Ads Dekho & Coins Kamao';
      case 'game':
        return gameMode === 'vs_ai'
          ? 'Dots & Boxes'
          : gameMode === 'practice'
          ? 'Practice Mode'
          : gameMode === 'challenge'
          ? 'Tactical Challenge'
          : isOnline
          ? 'Live Multiplayer'
          : 'Pass & Play';
      case 'online_lobby':
        return 'Multiplayer Lobby';
      case 'challenge':
        return 'Tactical Puzzles';
      case 'leaderboard':
        return 'Global Leaderboard';
      case 'achievements':
        return 'Player Badges';
      case 'profile':
        return 'Commander Profile';
      case 'tutorial':
        return 'How to Play';
      case 'settings':
        return 'Settings';
      case 'replay':
        return 'Match Replay';
      case 'android_guide':
        return 'Android APK Build';
      case 'watch_ads':
        return 'Watch Video Ads';
      case 'admin':
        return 'Admin & AdMob Backend';
      default:
        return 'Game Arena Pro';
    }
  };

  const isOnline = gameMode.includes('online');

  return (
    <MobileFrame
      simulateMobile={settings.simulateMobileDevice}
      onToggleSimulateMobile={toggleSimulateMobile}
      isMuted={isMuted}
      onToggleSound={toggleSound}
      coins={profile.coins}
      onOpenVault={() => handleOpenVault(false)}
      onOpenAds={() => setScreen('watch_ads')}
      onNavigateHome={() => setScreen('home')}
      onBack={() => {
        if (screen === 'game') {
          setConfirmExitGame(true);
        } else if (screen === 'admin') {
          setScreen('settings');
        } else if (screen !== 'home') {
          setScreen('home');
        } else {
          setScreen('splash');
        }
      }}
      onOpenSettings={() => setScreen('settings')}
    >
      {/* Top Bar Header (on non-splash screens) */}
      {screen !== 'splash' && (
        <Header
          title={getHeaderTitle()}
          onBack={() => {
            if (screen === 'game') {
              setConfirmExitGame(true);
            } else if (screen === 'admin') {
              setScreen('settings');
            } else if (screen !== 'home') {
              setScreen('home');
            } else {
              setScreen('splash');
            }
          }}
          onOpenSettings={() => setScreen('settings')}
          onOpenProfile={() => setScreen('profile')}
          onOpenCoinVault={() => handleOpenVault(false)}
          onOpenWatchAds={() => setScreen('watch_ads')}
          coins={profile.coins}
          isMuted={isMuted}
          onToggleSound={toggleSound}
          simulateMobile={settings.simulateMobileDevice}
          onToggleSimulateMobile={toggleSimulateMobile}
          userLevel={profile.level}
        />
      )}

      {/* Screen Router */}
      {screen === 'splash' && (
        <SplashScreen onStart={() => setScreen('home')} />
      )}

      {screen === 'home' && (
        <HomeScreen
          profile={profile}
          onProfileUpdated={(updated) => setProfile(updated)}
          onQuickPlay={handleQuickPlay}
          onSelectMode={handleStartModeFromHome}
          onPlayConnectFour={handleStartConnectFour}
          onPlayTicTacToe={handleStartTicTacToe}
          onPlayMemoryMatch={handleStartMemoryMatch}
          onOpenWatchAds={() => setScreen('watch_ads')}
          onOpenLeaderboard={() => setScreen('leaderboard')}
          onOpenAchievements={() => setScreen('achievements')}
          onOpenProfile={() => setScreen('profile')}
          onOpenTutorial={() => setScreen('tutorial')}
          onOpenAndroidGuide={() => setScreen('android_guide')}
          onOpenCoinVault={() => handleOpenVault(false)}
        />
      )}

      {screen === 'setup' && (
        <GameSetupScreen
          gameMode={gameMode}
          userCoins={profile.coins}
          onStartMatch={handleStartMatch}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'game' && (
        <GameScreen
          key={`${gameMode}_${boardSize}_${customInitialState ? 'custom' : 'fresh'}`}
          gameMode={gameMode}
          boardSize={boardSize}
          aiDifficulty={aiDifficulty}
          themeId={settings.boardTheme}
          entryFee={entryFee}
          player1Name={profile.username}
          player2Name={
            gameMode === 'vs_ai'
              ? `AI (${aiDifficulty.toUpperCase()})`
              : gameMode === 'practice'
              ? 'Trainer Bot'
              : onlineOpponent
              ? onlineOpponent.name
              : 'Player 2'
          }
          player1Avatar={profile.avatar}
          player2Avatar="grandmaster"
          initialState={customInitialState}
          onlineOpponent={onlineOpponent}
          onlineRole={onlineRole}
          onMatchComplete={handleMatchComplete}
          onExit={() => setScreen('home')}
          onOpenReplay={handleOpenReplay}
        />
      )}

      {screen === 'connect_four' && (
        <ConnectFourScreen
          player1Name={profile.username}
          entryFee={100}
          onDeductStake={(stk) => handleDeductMiniGameStake(stk, 'Connect 4')}
          onMatchComplete={handleMiniGameComplete}
          onExit={() => setScreen('home')}
        />
      )}

      {screen === 'tic_tac_toe' && (
        <TicTacToeScreen
          player1Name={profile.username}
          entryFee={100}
          onDeductStake={(stk) => handleDeductMiniGameStake(stk, 'Tic-Tac-Toe')}
          onMatchComplete={handleMiniGameComplete}
          onExit={() => setScreen('home')}
        />
      )}

      {screen === 'memory_match' && (
        <MemoryMatchScreen
          player1Name={profile.username}
          entryFee={100}
          onDeductStake={(stk) => handleDeductMiniGameStake(stk, 'Memory Cards')}
          onMatchComplete={handleMiniGameComplete}
          onExit={() => setScreen('home')}
        />
      )}

      {screen === 'online_lobby' && (
        <OnlineLobbyScreen
          profile={profile}
          onMatchReady={(data) => {
            // Deduct 100 coins for online match entry
            const updated = deductEntryCoins(profile, 100, 'Online Duel');
            setProfile(updated);
            sounds.playCoinSpend();
            setEntryFee(100);
            setGameMode('online_custom_room');
            setBoardSize(data.boardSize);
            setOnlineOpponent(data.opponent);
            setOnlineRole(data.role);
            setCustomInitialState(data.gameState);
            setScreen('game');
          }}
          onBack={() => setScreen('home')}
          onOpenCoinVault={() => handleOpenVault(false)}
        />
      )}

      {screen === 'challenge' && (
        <ChallengeScreen
          solvedPuzzleIds={profile.solvedPuzzleIds}
          onSelectPuzzle={handleStartPuzzle}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'leaderboard' && (
        <LeaderboardScreen
          profile={profile}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'achievements' && (
        <AchievementsScreen
          profile={profile}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'profile' && (
        <ProfileScreen
          profile={profile}
          onUpdateProfile={(updated) => {
            setProfile(updated);
            saveProfile(updated);
          }}
          onOpenReplay={handleOpenReplay}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'tutorial' && (
        <TutorialScreen
          onBack={() => setScreen('home')}
          onLaunchPractice={() => {
            setGameMode('practice');
            setBoardSize(3);
            setAIDifficulty('easy');
            setCustomInitialState(undefined);
            setScreen('game');
          }}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings(newSettings);
            saveSettings(newSettings);
          }}
          onOpenTutorial={() => setScreen('tutorial')}
          onOpenAndroidGuide={() => setScreen('android_guide')}
          onOpenAdminPanel={() => setScreen('admin')}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'admin' && (
        <AdminPanelScreen
          onExit={() => setScreen('settings')}
          onTestRewardedAd={() => setScreen('watch_ads')}
        />
      )}

      {screen === 'replay' && replayMatchItem && (
        <ReplayViewerScreen
          matchItem={replayMatchItem}
          onBack={() => setScreen('profile')}
        />
      )}

      {screen === 'android_guide' && (
        <AndroidGuideScreen onBack={() => setScreen('settings')} />
      )}

      {screen === 'watch_ads' && (
        <WatchAdsScreen
          profile={profile}
          onProfileUpdated={(updated) => {
            setProfile(updated);
            saveProfile(updated);
          }}
          onExit={() => setScreen('home')}
        />
      )}

      {/* Confirm Exit Game Modal */}
      {confirmExitGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold mb-2">Leave Current Match?</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Exiting an active match will forfeit your current progress.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmExitGame(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
              >
                Resume
              </button>
              <button
                onClick={() => {
                  sounds.playButtonClick();
                  setConfirmExitGame(false);
                  if (isOnline) networkClient.leaveRoom();
                  setScreen('home');
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition-colors"
              >
                Forfeit & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1,000 FREE COINS WELCOME MODAL */}
      <WelcomeCoinModal
        isOpen={isWelcomeModalOpen}
        onClaim={() => {
          const updated = {
            ...profile,
            welcomeGiftClaimed: true,
            coins: Math.max(1000, profile.coins),
          };
          setProfile(updated);
          saveProfile(updated);
          setIsWelcomeModalOpen(false);
        }}
      />

      {/* PRO COIN VAULT & WALLET MODAL */}
      <CoinVaultModal
        profile={profile}
        isOpen={isCoinVaultOpen}
        onClose={() => {
          setIsCoinVaultOpen(false);
          setInsufficientCoinsWarning(false);
        }}
        onProfileUpdated={(updated) => {
          setProfile(updated);
          saveProfile(updated);
        }}
        onOpenWatchAds={() => {
          setIsCoinVaultOpen(false);
          setInsufficientCoinsWarning(false);
          setScreen('watch_ads');
        }}
        insufficientCoinsNotice={insufficientCoinsWarning}
      />
    </MobileFrame>
  );
}
