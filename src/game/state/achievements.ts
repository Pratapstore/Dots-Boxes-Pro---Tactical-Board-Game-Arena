/**
 * Achievements Metadata & Definitions
 */

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'Progression' | 'Mastery' | 'Special';
  xpReward: number;
}

export const ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'first_blood',
    title: 'First Contact',
    description: 'Complete your first match in any game mode.',
    icon: 'swords',
    category: 'Progression',
    xpReward: 50,
  },
  {
    id: 'first_victory',
    title: 'Taste of Victory',
    description: 'Win your very first match.',
    icon: 'trophy',
    category: 'Progression',
    xpReward: 100,
  },
  {
    id: 'hot_streak',
    title: 'Hot Streak',
    description: 'Win 3 consecutive matches.',
    icon: 'flame',
    category: 'Mastery',
    xpReward: 150,
  },
  {
    id: 'grand_master',
    title: 'Battle-Tested',
    description: 'Win 10 matches total.',
    icon: 'crown',
    category: 'Progression',
    xpReward: 250,
  },
  {
    id: 'expert_slayer',
    title: 'Deep Mind Slayer',
    description: 'Defeat the Expert AI on any board size.',
    icon: 'cpu',
    category: 'Mastery',
    xpReward: 300,
  },
  {
    id: 'puzzle_pro',
    title: 'Tactical Mind',
    description: 'Solve 5 challenge puzzles.',
    icon: 'sparkles',
    category: 'Special',
    xpReward: 200,
  },
  {
    id: 'grid_dominator',
    title: 'Titan of the Grid',
    description: 'Complete a match on an 8x8 or 10x10 board.',
    icon: 'grid',
    category: 'Special',
    xpReward: 200,
  },
  {
    id: 'perfect_game',
    title: 'Clean Sweep',
    description: 'Win a match allowing the opponent 2 or fewer boxes.',
    icon: 'shield-check',
    category: 'Mastery',
    xpReward: 350,
  },
  {
    id: 'online_warrior',
    title: 'Global Contender',
    description: 'Complete an online multiplayer room or matchmaking match.',
    icon: 'globe',
    category: 'Progression',
    xpReward: 150,
  },
  {
    id: 'level_ten',
    title: 'Decorated Veteran',
    description: 'Reach Player Level 10.',
    icon: 'medal',
    category: 'Progression',
    xpReward: 500,
  },
];
