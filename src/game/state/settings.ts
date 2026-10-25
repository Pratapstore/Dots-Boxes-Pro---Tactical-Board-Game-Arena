/**
 * Game Settings & Customization
 */

export type BoardThemeId =
  | 'neon_cyber'
  | 'emerald_classic'
  | 'sunset_gold'
  | 'amethyst_royal'
  | 'midnight_matrix';

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  bgDark: string;
  gridLineColor: string;
  dotColor: string;
  p1Color: string;
  p1Light: string;
  p2Color: string;
  p2Light: string;
  boxP1Bg: string;
  boxP2Bg: string;
  accent: string;
}

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {
  neon_cyber: {
    id: 'neon_cyber',
    name: 'Cyber Neon',
    bgDark: '#0B1120',
    gridLineColor: '#1E293B',
    dotColor: '#F8FAFC',
    p1Color: '#0EA5E9', // Electric Cyan
    p1Light: '#38BDF8',
    p2Color: '#F59E0B', // Amber Gold
    p2Light: '#FBBF24',
    boxP1Bg: 'rgba(14, 165, 233, 0.22)',
    boxP2Bg: 'rgba(245, 158, 11, 0.22)',
    accent: '#38BDF8',
  },
  emerald_classic: {
    id: 'emerald_classic',
    name: 'Felt Emerald',
    bgDark: '#062817',
    gridLineColor: '#0E492B',
    dotColor: '#ECFDF5',
    p1Color: '#10B981',
    p1Light: '#34D399',
    p2Color: '#E11D48',
    p2Light: '#FB7185',
    boxP1Bg: 'rgba(16, 185, 129, 0.25)',
    boxP2Bg: 'rgba(225, 29, 72, 0.25)',
    accent: '#10B981',
  },
  sunset_gold: {
    id: 'sunset_gold',
    name: 'Sunset Mirage',
    bgDark: '#1A0E2E',
    gridLineColor: '#2D1B4E',
    dotColor: '#FFF1F2',
    p1Color: '#F43F5E',
    p1Light: '#FB7185',
    p2Color: '#F59E0B',
    p2Light: '#FBBF24',
    boxP1Bg: 'rgba(244, 63, 94, 0.22)',
    boxP2Bg: 'rgba(245, 158, 11, 0.22)',
    accent: '#F43F5E',
  },
  amethyst_royal: {
    id: 'amethyst_royal',
    name: 'Amethyst Velvet',
    bgDark: '#0F0E1E',
    gridLineColor: '#211D40',
    dotColor: '#F5F3FF',
    p1Color: '#8B5CF6',
    p1Light: '#A78BFA',
    p2Color: '#06B6D4',
    p2Light: '#22D3EE',
    boxP1Bg: 'rgba(139, 92, 246, 0.22)',
    boxP2Bg: 'rgba(6, 182, 212, 0.22)',
    accent: '#8B5CF6',
  },
  midnight_matrix: {
    id: 'midnight_matrix',
    name: 'Minimal Mono',
    bgDark: '#030712',
    gridLineColor: '#1F2937',
    dotColor: '#E5E7EB',
    p1Color: '#6366F1',
    p1Light: '#818CF8',
    p2Color: '#14B8A6',
    p2Light: '#2DD4BF',
    boxP1Bg: 'rgba(99, 102, 241, 0.22)',
    boxP2Bg: 'rgba(20, 184, 166, 0.22)',
    accent: '#6366F1',
  },
};

export interface GameSettings {
  boardTheme: BoardThemeId;
  soundEffects: boolean;
  hapticFeedback: boolean;
  reducedMotion: boolean;
  showCoordinates: boolean;
  showLegalHints: boolean;
  lineThickness: 'normal' | 'thick';
  simulateMobileDevice: boolean;
}

const SETTINGS_STORAGE_KEY = 'dots_boxes_settings';

export function getInitialSettings(): GameSettings {
  if (typeof window === 'undefined') {
    return defaultSettings();
  }

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...defaultSettings(), ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }

  return defaultSettings();
}

function defaultSettings(): GameSettings {
  return {
    boardTheme: 'neon_cyber',
    soundEffects: true,
    hapticFeedback: true,
    reducedMotion: false,
    showCoordinates: false,
    showLegalHints: true,
    lineThickness: 'normal',
    simulateMobileDevice: true, // Default to sleek mobile frame on wide desktop, responsive on mobile
  };
}

export function saveSettings(settings: GameSettings) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }
}
