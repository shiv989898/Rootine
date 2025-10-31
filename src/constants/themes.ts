import { COLORS } from './theme';

export type ThemeKey = 'light' | 'dark' | 'forest' | 'sunset' | 'ocean';

export interface ThemePalette {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  divider: string;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
}

export interface AppTheme {
  key: ThemeKey;
  name: string;
  description: string;
  palette: ThemePalette;
  isDark?: boolean;
  previewGradient: string[];
}

const base = COLORS;

export const THEMES: Record<ThemeKey, AppTheme> = {
  light: {
    key: 'light',
    name: 'Light',
    description: 'Balanced neutral base – ideal for daytime focus',
    palette: {
      background: base.background,
      surface: base.surface,
      card: base.card,
      text: base.text,
      textSecondary: base.textSecondary,
      border: base.border,
      divider: base.divider,
      primary: base.primary,
      secondary: base.secondary,
      accent: base.accent,
      success: base.success,
      warning: base.warning,
      error: base.error,
    },
    previewGradient: ['#F5F5F5', '#FFFFFF'],
  },
  dark: {
    key: 'dark',
    name: 'Midnight Focus',
    description: 'Deep charcoal base with neon highlights for low light',
    palette: {
      background: '#0E1117',
      surface: '#161B22',
      card: '#1F2530',
      text: '#F6F8FA',
      textSecondary: '#9BA1A6',
      border: '#2D333B',
      divider: '#21262D',
      primary: '#3FB950',
      secondary: '#F7A046',
      accent: '#58A6FF',
      success: '#3FB950',
      warning: '#F0883E',
      error: '#FF6A6A',
    },
    isDark: true,
    previewGradient: ['#1F2530', '#0E1117'],
  },
  forest: {
    key: 'forest',
    name: 'Evergreen',
    description: 'Calming forest greens with warm earth accents',
    palette: {
      background: '#0F2320',
      surface: '#183029',
      card: '#1F3B33',
      text: '#F2FFF7',
      textSecondary: '#A8CBB9',
      border: '#255346',
      divider: '#1F3B33',
      primary: '#5DE4A8',
      secondary: '#F5B971',
      accent: '#7ADCE5',
      success: '#5DE4A8',
      warning: '#F5B971',
      error: '#FF7A7A',
    },
    isDark: true,
    previewGradient: ['#1F3B33', '#0F2320'],
  },
  sunset: {
    key: 'sunset',
    name: 'Golden Hour',
    description: 'Vibrant oranges and pinks inspired by sunset energy',
    palette: {
      background: '#FFF3E0',
      surface: '#FFE0B2',
      card: '#FFD180',
      text: '#4E342E',
      textSecondary: '#6D4C41',
      border: '#FFCC80',
      divider: '#FFB74D',
      primary: '#FF7043',
      secondary: '#FFA726',
      accent: '#FF8A65',
      success: '#81C784',
      warning: '#FFB74D',
      error: '#FF7043',
    },
    previewGradient: ['#FFD180', '#FFF3E0'],
  },
  ocean: { 
    key: 'ocean',
    name: 'Ocean Breeze',
    description: 'Cool blues and teals for a tranquil routine',
    palette: {
      background: '#E0F7FA',
      surface: '#B2EBF2',
      card: '#80DEEA',
      text: '#004D61',
      textSecondary: '#006978',
      border: '#4DD0E1',
      divider: '#26C6DA',
      primary: '#00ACC1',
      secondary: '#26A69A',
      accent: '#29B6F6',
      success: '#26A69A',
      warning: '#FFCA28',
      error: '#FF7043',
    },
    previewGradient: ['#80DEEA', '#E0F7FA'],
  },
};

export const DEFAULT_THEME: AppTheme = THEMES.light;