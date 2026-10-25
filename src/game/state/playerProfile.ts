/**
 * Player Profile & Statistics Persistence
 */

import { BoardDimension, GameMode, Move, PlayerId } from '../engine/types';

export interface MatchHistoryItem {
  id: string;
  timestamp: number;
  gameMode: GameMode;
  boardSize: BoardDimension;
  opponentName: string;
  opponentAvatar: string;
  playerScore: number;
  opponentScore: number;
  result: 'VICTORY' | 'DEFEAT' | 'DRAW';
  moves: Move[];
  durationSeconds: number;
}

export interface CoinTransaction {
  id: string;
  type: 'WELCOME_BONUS' | 'MATCH_ENTRY' | 'MATCH_WIN' | 'DRAW_REFUND' | 'DAILY_BONUS' | 'AD_REWARD' | 'WIN_BONUS' | 'STREAK_BONUS' | 'MISSION_REWARD';
  amount: number;
  label: string;
  timestamp: number;
}

export type MissionType = 'PLAY_MATCHES' | 'WIN_GAMES' | 'WATCH_AD' | 'PLAY_MINIGAME';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
  type: MissionType;
}

export interface DailyMissionsData {
  dateKey: string;
  missions: DailyMission[];
  allClaimedBonusReceived?: boolean;
}

export interface PlayerProfile {
  id: string;
  username: string;
  avatar: string; // key of avatar
  color: string;
  level: number;
  xp: number;
  coins: number;
  welcomeGiftClaimed?: boolean;
  lastDailyRewardClaim?: number;
  totalCoinsWon?: number;
  transactions?: CoinTransaction[];
  adsWatchedCount?: number;
  adsensePublisherId?: string;
  adsenseSlotId?: string;
  claimedMilestones?: string[];
  dailyMissions?: DailyMissionsData;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  ratingElo: number;
  unlockedAchievements: string[];
  solvedPuzzleIds: string[];
  matchHistory: MatchHistoryItem[];
  createdAt: number;
  isGuest: boolean;
}

const STORAGE_KEY = 'dots_boxes_pro_profile';

export const AVATAR_OPTIONS = [
  { id: 'tactician', name: 'Tactician', color: '#0EA5E9', icon: 'zap' },
  { id: 'grandmaster', name: 'Grandmaster', color: '#F59E0B', icon: 'crown' },
  { id: 'ninja', name: 'Shadow', color: '#8B5CF6', icon: 'shield' },
  { id: 'pilot', name: 'Ace', color: '#10B981', icon: 'compass' },
  { id: 'oracle', name: 'Oracle', color: '#EC4899', icon: 'eye' },
  { id: 'titan', name: 'Titan', color: '#F97316', icon: 'award' },
  { id: 'maverick', name: 'Maverick', color: '#06B6D4', icon: 'target' },
  { id: 'nova', name: 'Supernova', color: '#6366F1', icon: 'star' },
];

export function getInitialProfile(): PlayerProfile {
  if (typeof window === 'undefined') {
    return createDefaultProfile();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure 1,000 free coins welcome bonus for first time players or profiles below 1,000
      if (!parsed.welcomeGiftClaimed || typeof parsed.coins !== 'number' || parsed.coins < 1000) {
        parsed.coins = Math.max(1000, parsed.coins || 1000);
        parsed.welcomeGiftClaimed = true;
      }
      if (!parsed.adsensePublisherId || parsed.adsensePublisherId === 'ca-pub-3300440695300000') {
        parsed.adsensePublisherId = 'ca-pub-3986932799330524';
      }
      const loaded = { ...createDefaultProfile(), ...parsed };
      return ensureDailyMissions(loaded);
    }
  } catch (err) {
    console.error('Failed to load profile', err);
  }

  const fresh = ensureDailyMissions(createDefaultProfile());
  saveProfile(fresh);
  return fresh;
}

function createDefaultProfile(): PlayerProfile {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const now = Date.now();
  return {
    id: `guest_${now}_${randNum}`,
    username: `Tactician_${randNum}`,
    avatar: 'tactician',
    color: '#0EA5E9',
    level: 1,
    xp: 0,
    coins: 1000, // 1,000 FREE COINS FIRST TIME
    welcomeGiftClaimed: true,
    totalCoinsWon: 0,
    adsensePublisherId: 'ca-pub-3986932799330524',
    adsenseSlotId: '8392104821',
    transactions: [
      {
        id: `tx_${now}`,
        type: 'WELCOME_BONUS',
        amount: 1000,
        label: 'Welcome Starter Capital',
        timestamp: now,
      },
    ],
    totalMatches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0,
    bestStreak: 0,
    ratingElo: 1200,
    unlockedAchievements: [],
    solvedPuzzleIds: [],
    matchHistory: [],
    createdAt: now,
    isGuest: true,
  };
}

export function saveProfile(profile: PlayerProfile) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }
}

export function canAffordMatch(profile: PlayerProfile, entryFee: number = 100): boolean {
  return profile.coins >= entryFee;
}

export function deductEntryCoins(profile: PlayerProfile, entryFee: number = 100, gameName: string = 'Match'): PlayerProfile {
  const tx: CoinTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'MATCH_ENTRY',
    amount: -entryFee,
    label: `${gameName} Entry Fee`,
    timestamp: Date.now(),
  };

  const updated: PlayerProfile = {
    ...profile,
    coins: Math.max(0, profile.coins - entryFee),
    transactions: [tx, ...(profile.transactions || [])].slice(0, 50),
  };
  saveProfile(updated);
  return updated;
}

export function addCoins(profile: PlayerProfile, amount: number, label: string = 'Coin Credit'): PlayerProfile {
  const tx: CoinTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: amount >= 0 ? 'MATCH_WIN' : 'MATCH_ENTRY',
    amount,
    label,
    timestamp: Date.now(),
  };

  const updated: PlayerProfile = {
    ...profile,
    coins: profile.coins + amount,
    totalCoinsWon: (profile.totalCoinsWon || 0) + (amount > 0 ? amount : 0),
    transactions: [tx, ...(profile.transactions || [])].slice(0, 50),
  };
  saveProfile(updated);
  return updated;
}

export function claimDailyBonus(profile: PlayerProfile): {
  updatedProfile: PlayerProfile;
  bonusCoins: number;
  success: boolean;
  nextClaimInMs: number;
} {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const lastClaim = profile.lastDailyRewardClaim || 0;

  if (now - lastClaim < ONE_DAY) {
    return {
      updatedProfile: profile,
      bonusCoins: 0,
      success: false,
      nextClaimInMs: ONE_DAY - (now - lastClaim),
    };
  }

  // User requirement: 24 hours may 1000 coins mila gha 1 bar
  const bonusCoins = 1000;
  const tx: CoinTransaction = {
    id: `tx_${now}`,
    type: 'DAILY_BONUS',
    amount: bonusCoins,
    label: 'Daily 24-Hour Reward (+1,000 🪙)',
    timestamp: now,
  };

  const updated: PlayerProfile = {
    ...profile,
    coins: profile.coins + bonusCoins,
    lastDailyRewardClaim: now,
    transactions: [tx, ...(profile.transactions || [])].slice(0, 50),
  };
  saveProfile(updated);
  return {
    updatedProfile: updated,
    bonusCoins,
    success: true,
    nextClaimInMs: ONE_DAY,
  };
}

export function getLocalDateKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateDefaultDailyMissions(dateKey: string): DailyMissionsData {
  return {
    dateKey,
    allClaimedBonusReceived: false,
    missions: [
      {
        id: `win_1_game_${dateKey}`,
        title: 'Win 1 Match',
        description: 'Achieve victory in any arena match or minigame',
        rewardCoins: 200,
        progress: 0,
        target: 1,
        completed: false,
        claimed: false,
        icon: '🏆',
        type: 'WIN_GAMES',
      },
      {
        id: `play_3_matches_${dateKey}`,
        title: 'Play 3 Matches',
        description: 'Compete in 3 matches across Dots & Boxes or Minigames',
        rewardCoins: 150,
        progress: 0,
        target: 3,
        completed: false,
        claimed: false,
        icon: '⚔️',
        type: 'PLAY_MATCHES',
      },
      {
        id: `win_2_games_${dateKey}`,
        title: 'Win 2 Matches',
        description: 'Dominate 2 victories today to prove your skills',
        rewardCoins: 250,
        progress: 0,
        target: 2,
        completed: false,
        claimed: false,
        icon: '👑',
        type: 'WIN_GAMES',
      },
      {
        id: `watch_1_ad_${dateKey}`,
        title: 'Watch 1 Video Ad',
        description: 'Watch 1 sponsored video in the Ads Dekho center',
        rewardCoins: 100,
        progress: 0,
        target: 1,
        completed: false,
        claimed: false,
        icon: '📺',
        type: 'WATCH_AD',
      },
    ],
  };
}

export function ensureDailyMissions(profile: PlayerProfile): PlayerProfile {
  const todayKey = getLocalDateKey();
  if (
    profile.dailyMissions &&
    profile.dailyMissions.dateKey === todayKey &&
    Array.isArray(profile.dailyMissions.missions) &&
    profile.dailyMissions.missions.length > 0
  ) {
    return profile;
  }
  const updated: PlayerProfile = {
    ...profile,
    dailyMissions: generateDefaultDailyMissions(todayKey),
  };
  saveProfile(updated);
  return updated;
}

export function recordMissionEvent(
  profile: PlayerProfile,
  event: { type: MissionType; count?: number }
): PlayerProfile {
  const ensured = ensureDailyMissions(profile);
  const data = ensured.dailyMissions;
  if (!data) return ensured;

  const countToAdd = event.count ?? 1;
  let changed = false;

  const updatedMissions = data.missions.map((m) => {
    if (m.type === event.type && !m.claimed) {
      const newProgress = Math.min(m.target, m.progress + countToAdd);
      const isCompleted = newProgress >= m.target;
      if (newProgress !== m.progress || isCompleted !== m.completed) {
        changed = true;
        return {
          ...m,
          progress: newProgress,
          completed: isCompleted,
        };
      }
    }
    return m;
  });

  if (!changed) return ensured;

  const updated: PlayerProfile = {
    ...ensured,
    dailyMissions: {
      ...data,
      missions: updatedMissions,
    },
  };
  saveProfile(updated);
  return updated;
}

export function claimDailyMission(
  profile: PlayerProfile,
  missionId: string
): {
  updatedProfile: PlayerProfile;
  rewardCoins: number;
  missionTitle: string;
  allMissionsBonus: number;
} {
  const ensured = ensureDailyMissions(profile);
  const data = ensured.dailyMissions;
  if (!data) {
    return { updatedProfile: ensured, rewardCoins: 0, missionTitle: '', allMissionsBonus: 0 };
  }

  const mission = data.missions.find((m) => m.id === missionId);
  if (!mission || !mission.completed || mission.claimed) {
    return { updatedProfile: ensured, rewardCoins: 0, missionTitle: '', allMissionsBonus: 0 };
  }

  const rewardCoins = mission.rewardCoins;
  let allMissionsBonus = 0;

  const updatedMissions = data.missions.map((m) =>
    m.id === missionId ? { ...m, claimed: true } : m
  );

  const allCompletedAndClaimed = updatedMissions.every((m) => m.claimed);
  let allClaimedBonusReceived = data.allClaimedBonusReceived;

  const newTransactions = [...(ensured.transactions || [])];

  newTransactions.unshift({
    id: `tx_${Date.now()}_mission_${mission.id}`,
    type: 'MISSION_REWARD',
    amount: rewardCoins,
    label: `Daily Mission Claimed: ${mission.title} (+${rewardCoins} 🪙)`,
    timestamp: Date.now(),
  });

  if (allCompletedAndClaimed && !allClaimedBonusReceived) {
    allMissionsBonus = 250;
    allClaimedBonusReceived = true;
    newTransactions.unshift({
      id: `tx_${Date.now()}_all_missions_bonus`,
      type: 'MISSION_REWARD',
      amount: allMissionsBonus,
      label: `Daily Missions Mastery Bonus (+${allMissionsBonus} 🪙)`,
      timestamp: Date.now() + 1,
    });
  }

  const totalGained = rewardCoins + allMissionsBonus;

  const updated: PlayerProfile = {
    ...ensured,
    coins: ensured.coins + totalGained,
    totalCoinsWon: (ensured.totalCoinsWon || 0) + totalGained,
    dailyMissions: {
      ...data,
      missions: updatedMissions,
      allClaimedBonusReceived,
    },
    transactions: newTransactions.slice(0, 50),
  };

  saveProfile(updated);
  return {
    updatedProfile: updated,
    rewardCoins,
    missionTitle: mission.title,
    allMissionsBonus,
  };
}

/**
 * Watch Ads & Earn Coins (connected to user's AdSense)
 */
export function claimAdReward(
  profile: PlayerProfile,
  amount: number = 100,
  adLabel: string = 'Rewarded Ad'
): PlayerProfile {
  const tx: CoinTransaction = {
    id: `tx_${Date.now()}_ad`,
    type: 'AD_REWARD',
    amount,
    label: `Watched Ad: ${adLabel} (+${amount} 🪙)`,
    timestamp: Date.now(),
  };

  const updated: PlayerProfile = {
    ...profile,
    coins: profile.coins + amount,
    adsWatchedCount: (profile.adsWatchedCount || 0) + 1,
    transactions: [tx, ...(profile.transactions || [])].slice(0, 50),
  };
  saveProfile(updated);
  return recordMissionEvent(updated, { type: 'WATCH_AD', count: 1 });
}

export function formatPublisherId(input: string): string {
  const clean = input.trim();
  if (!clean) return 'ca-pub-3986932799330524';
  if (clean.startsWith('ca-pub-')) return clean;
  if (clean.startsWith('pub-')) return `ca-${clean}`;
  if (/^\d+$/.test(clean)) return `ca-pub-${clean}`;
  return clean;
}

/**
 * Configure user's Google AdSense Publisher & Slot IDs
 */
export function updateAdSenseConfig(
  profile: PlayerProfile,
  publisherId: string,
  slotId: string
): PlayerProfile {
  const updated: PlayerProfile = {
    ...profile,
    adsensePublisherId: formatPublisherId(publisherId),
    adsenseSlotId: slotId.trim(),
  };
  saveProfile(updated);
  return updated;
}

export function calculateLevel(xp: number): number {
  return 1 + Math.floor(Math.sqrt(Math.max(0, xp) / 100));
}

export function getNextLevelXP(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 100;
}

export function getCurrentLevelBaseXP(currentLevel: number): number {
  return Math.pow(currentLevel - 1, 2) * 100;
}

/**
 * Record a completed match and apply coin winnings / payouts
 */
export function recordMatchResult(
  profile: PlayerProfile,
  result: 'VICTORY' | 'DEFEAT' | 'DRAW',
  gameMode: GameMode,
  boardSize: BoardDimension,
  playerScore: number,
  opponentScore: number,
  opponentName: string,
  opponentAvatar: string,
  moves: Move[],
  durationSeconds: number,
  isAIExpert?: boolean,
  entryFee: number = 100
): {
  updatedProfile: PlayerProfile;
  newAchievements: string[];
  xpGained: number;
  coinsGained: number;
  basePrize: number;
  perWinBonus: number;
  milestoneBonus: number;
  milestoneLabel: string;
} {
  const newAchievements: string[] = [];
  let xpGained = 30; // base xp for playing
  let coinsGained = 0;

  const newTotalMatches = profile.totalMatches + 1;
  const newWins = profile.wins + (result === 'VICTORY' ? 1 : 0);
  const newLosses = profile.losses + (result === 'DEFEAT' ? 1 : 0);
  const newDraws = profile.draws + (result === 'DRAW' ? 1 : 0);

  const newStreak = result === 'VICTORY' ? profile.currentStreak + 1 : 0;
  const bestStreak = Math.max(profile.bestStreak, newStreak);

  let basePrize = 0;
  let perWinBonus = 0;
  let milestoneBonus = 0;
  let milestoneLabel = '';

  if (result === 'VICTORY') {
    xpGained += 70;
    // 1. Double the entry pot
    basePrize = entryFee * 2;
    // 2. User requirement: "per wining bonus 100 coins"
    perWinBonus = 100;

    // 3. User requirement: "5 wining bonus 500 10 wining 1000"
    if (newStreak === 5 || newWins === 5) {
      milestoneBonus += 500;
      milestoneLabel = '5 Wins Milestone Bonus (+500 🪙)';
    } else if (newStreak === 10 || newWins === 10) {
      milestoneBonus += 1000;
      milestoneLabel = '10 Wins Milestone Bonus (+1,000 🪙)';
    }

    coinsGained = basePrize + perWinBonus + milestoneBonus;
  } else if (result === 'DRAW') {
    xpGained += 40;
    // In draw, 100% of entry fee is refunded
    coinsGained = entryFee;
    basePrize = entryFee;
  } else {
    // Defeat: 0 coins won
    coinsGained = 0;
  }

  // Bonus for larger boards
  xpGained += (boardSize - 3) * 15;

  // Elo rating adjustment
  let newElo = profile.ratingElo;
  if (gameMode.includes('online')) {
    if (result === 'VICTORY') newElo += 24;
    else if (result === 'DEFEAT') newElo = Math.max(800, newElo - 20);
    else newElo += 2;
  }

  const updatedXP = profile.xp + xpGained;
  const updatedLevel = calculateLevel(updatedXP);
  const updatedCoins = profile.coins + coinsGained;
  const totalCoinsWon = (profile.totalCoinsWon || 0) + coinsGained;

  // Check achievements
  const existingAch = new Set(profile.unlockedAchievements);

  if (!existingAch.has('first_blood')) {
    existingAch.add('first_blood');
    newAchievements.push('first_blood');
  }

  if (result === 'VICTORY' && !existingAch.has('first_victory')) {
    existingAch.add('first_victory');
    newAchievements.push('first_victory');
  }

  if (newStreak >= 3 && !existingAch.has('hot_streak')) {
    existingAch.add('hot_streak');
    newAchievements.push('hot_streak');
  }

  if (newWins >= 10 && !existingAch.has('grand_master')) {
    existingAch.add('grand_master');
    newAchievements.push('grand_master');
  }

  if (result === 'VICTORY' && isAIExpert && !existingAch.has('expert_slayer')) {
    existingAch.add('expert_slayer');
    newAchievements.push('expert_slayer');
  }

  if (boardSize >= 8 && !existingAch.has('grid_dominator')) {
    existingAch.add('grid_dominator');
    newAchievements.push('grid_dominator');
  }

  if (result === 'VICTORY' && opponentScore <= 2 && !existingAch.has('perfect_game')) {
    existingAch.add('perfect_game');
    newAchievements.push('perfect_game');
  }

  if (gameMode.includes('online') && !existingAch.has('online_warrior')) {
    existingAch.add('online_warrior');
    newAchievements.push('online_warrior');
  }

  if (updatedLevel >= 10 && !existingAch.has('level_ten')) {
    existingAch.add('level_ten');
    newAchievements.push('level_ten');
  }

  const historyItem: MatchHistoryItem = {
    id: `match_${Date.now()}`,
    timestamp: Date.now(),
    gameMode,
    boardSize,
    opponentName,
    opponentAvatar,
    playerScore,
    opponentScore,
    result,
    moves,
    durationSeconds,
  };

  // Keep last 30 matches
  const newHistory = [historyItem, ...profile.matchHistory].slice(0, 30);

  // Record coin win transaction if applicable
  const newTransactions = [...(profile.transactions || [])];
  if (coinsGained > 0) {
    newTransactions.unshift({
      id: `tx_${Date.now()}_win`,
      type: result === 'VICTORY' ? 'MATCH_WIN' : 'DRAW_REFUND',
      amount: coinsGained,
      label: result === 'VICTORY'
        ? `Match Victory (${basePrize} 🪙) + Win Bonus (+${perWinBonus} 🪙)${milestoneBonus > 0 ? ` + ${milestoneLabel}` : ''}`
        : `Match Draw Refund (${coinsGained} 🪙)`,
      timestamp: Date.now(),
    });
  }

  const updatedProfile: PlayerProfile = {
    ...profile,
    level: updatedLevel,
    xp: updatedXP,
    coins: updatedCoins,
    totalCoinsWon,
    transactions: newTransactions.slice(0, 50),
    totalMatches: newTotalMatches,
    wins: newWins,
    losses: newLosses,
    draws: newDraws,
    currentStreak: newStreak,
    bestStreak,
    ratingElo: newElo,
    unlockedAchievements: Array.from(existingAch),
    matchHistory: newHistory,
  };

  saveProfile(updatedProfile);
  return {
    updatedProfile,
    newAchievements,
    xpGained,
    coinsGained,
    basePrize,
    perWinBonus,
    milestoneBonus,
    milestoneLabel,
  };
}
