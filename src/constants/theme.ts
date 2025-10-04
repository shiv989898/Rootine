// Theme Colors
export const COLORS = {
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#81C784',
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFB74D',
  accent: '#2196F3',
  
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  dark: '#212121',
  gray: '#757575',
  lightGray: '#BDBDBD',
  orange: '#FF9800',
  
  background: '#F5F5F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#BDBDBD',
  
  border: '#E0E0E0',
  divider: '#EEEEEE',
  
  // Habit category colors
  health: '#E91E63',
  fitness: '#9C27B0',
  nutrition: '#FF9800',
  mindfulness: '#00BCD4',
  productivity: '#3F51B5',
  learning: '#FFC107',
  social: '#4CAF50',
  custom: '#607D8B',
  
  // Badge rarity colors
  common: '#9E9E9E',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border Radius
export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Habit Icons
export const HABIT_ICONS = [
  'fitness',
  'nutrition',
  'bed',
  'water',
  'book',
  'meditation',
  'run',
  'walk',
  'bicycle',
  'weight-lifter',
  'yoga',
  'food-apple',
  'glass-water',
  'brain',
  'heart',
  'leaf',
  'coffee',
  'moon',
  'sun',
  'check',
];

// Activity Levels
export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', multiplier: 1.2, description: 'Little to no exercise' },
  { value: 'lightly-active', label: 'Lightly Active', multiplier: 1.375, description: 'Light exercise 1-3 days/week' },
  { value: 'moderately-active', label: 'Moderately Active', multiplier: 1.55, description: 'Moderate exercise 3-5 days/week' },
  { value: 'very-active', label: 'Very Active', multiplier: 1.725, description: 'Hard exercise 6-7 days/week' },
  { value: 'extra-active', label: 'Extra Active', multiplier: 1.9, description: 'Very hard exercise & physical job' },
];

// Dietary Preferences
export const DIETARY_PREFERENCES = [
  { value: 'vegetarian', label: 'Vegetarian', icon: 'leaf' },
  { value: 'vegan', label: 'Vegan', icon: 'sprout' },
  { value: 'pescatarian', label: 'Pescatarian', icon: 'fish' },
  { value: 'omnivore', label: 'Omnivore', icon: 'food' },
];

// Points System
export const POINTS = {
  HABIT_COMPLETE: 10,
  STREAK_BONUS: 5, // per day
  CHALLENGE_COMPLETE: 100,
  POST_CREATE: 5,
  POST_LIKE: 1,
  COMMENT_CREATE: 2,
  FRIEND_ADD: 10,
  LEVEL_UP_THRESHOLD: 100,
};

// Motivational Messages
export const MOTIVATIONAL_MESSAGES = [
  "You're doing great! Keep it up! 💪",
  "Every day is a new opportunity! 🌟",
  "Small steps lead to big changes! 🚀",
  "Believe in yourself! You've got this! ✨",
  "Progress, not perfection! 🎯",
  "Your consistency is inspiring! 🔥",
  "One day at a time, one habit at a time! 🌱",
  "You're building something amazing! 🏆",
];

// Premium Features
export const PREMIUM_FEATURES = [
  'Unlimited AI diet plans and recipes',
  'Weekly diet plan exports (PDF)',
  'Ad-free experience',
  'Exclusive badges and themes',
  'Priority support',
  'Advanced analytics and insights',
  'Custom habit categories',
  'Unlimited photo uploads',
];

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_HABIT_TITLE_LENGTH: 100,
  MAX_POST_LENGTH: 500,
  MAX_COMMENT_LENGTH: 200,
  MAX_FREE_AI_REQUESTS_PER_DAY: 3,
  MAX_IMAGES_PER_POST: 4,
};

// Time Formats
export const TIME_FORMATS = {
  DATE: 'MMM dd, yyyy',
  TIME: 'HH:mm',
  DATETIME: 'MMM dd, yyyy HH:mm',
  FULL: 'EEEE, MMMM dd, yyyy',
};
