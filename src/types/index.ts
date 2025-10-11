// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isGuest?: boolean;
  profile: UserProfile;
  friends?: string[]; // user IDs for social features
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  displayName?: string; // User's display name
  photoURL?: string; // User's avatar URL
  age?: number;
  weight?: number; // in kg
  height?: number; // in cm
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  activityLevel: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extra-active';
  dietaryPreference: 'vegetarian' | 'vegan' | 'pescatarian' | 'omnivore';
  allergies: string[];
  goals: string[];
  points: number;
  weeklyPoints?: number; // Points earned this week
  monthlyPoints?: number; // Points earned this month
  level: number;
  badges: Badge[];
  streakDays: number;
  currentStreak?: number; // Current habit streak
  longestStreak: number;
  isPremium: boolean;
  inviteCode: string;
  friends: string[]; // user IDs
}

// Habit Types
export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: HabitCategory;
  recurrence: Recurrence;
  reminderTime?: string; // HH:mm format
  reminderEnabled: boolean;
  color: string;
  icon: string;
  currentStreak: number;
  longestStreak: number;
  completedDates: string[]; // ISO date strings
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: string; // ISO date string
  completedAt: Date;
}

export type HabitCategory = 
  | 'health' 
  | 'fitness' 
  | 'nutrition' 
  | 'mindfulness' 
  | 'productivity' 
  | 'learning' 
  | 'social' 
  | 'custom';

export interface Recurrence {
  type: 'daily' | 'weekly' | 'custom';
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
  customDays?: number; // for every N days
}

// Challenge Types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: HabitCategory;
  duration: number; // in days
  startDate: Date;
  endDate: Date;
  creatorId: string;
  participants: string[]; // user IDs
  isPublic: boolean;
  reward: Reward;
  createdAt: Date;
}

export interface ChallengeProgress {
  userId: string;
  challengeId: string;
  daysCompleted: number;
  completedDates: string[];
  isCompleted: boolean;
}

export interface Reward {
  points: number;
  badge?: Badge;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

// Daily Challenge Types
export interface DailyChallenge {
  id: string;
  type: 'daily' | 'weekly';
  title: string;
  description: string;
  icon: string;
  goal: ChallengeGoal;
  reward: Reward;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface ChallengeGoal {
  type: 'complete_habits' | 'maintain_streak' | 'earn_points' | 'complete_category' | 'social_interaction';
  target: number; // Target value to achieve
  category?: HabitCategory; // For category-specific challenges
  current?: number; // Current progress
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  challenge: DailyChallenge;
  progress: number; // 0-100
  isCompleted: boolean;
  isClaimed: boolean; // Reward claimed
  completedAt?: Date;
  claimedAt?: Date;
}

// Leaderboard Types
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar?: string;
  rank: number;
  points: number;
  streak: number;
  level: number;
  weeklyPoints?: number;
  monthlyPoints?: number;
}

export type LeaderboardPeriod = 'all-time' | 'weekly' | 'monthly' | 'friends';

// Social Types
export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string; // Single image URL
  likes: number; // Count instead of array
  comments: number; // Count instead of array
  isLiked?: boolean; // Current user's like status
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  edited?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Friendship {
  id: string;
  users: string[]; // [userId1, userId2]
  requestedBy: string;
  requestedTo: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  acceptedAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar?: string;
  points: number;
  level: number;
  streak: number;
  rank: number;
}

// Diet & Nutrition Types
export interface DietPlan {
  id: string;
  userId: string;
  date: string; // ISO date string
  meals: Meal[];
  totalCalories: number;
  macros: Macros;
  createdAt: Date;
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description: string;
  calories: number;
  macros: Macros;
  imageUrl?: string;
  recipe?: Recipe;
}

export interface Macros {
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
}

export interface Recipe {
  id: string;
  mealId: string;
  name: string;
  servings: number;
  prepTime: number; // minutes
  cookTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Ingredient[];
  instructions: string[];
  nutritionPerServing: Macros & { calories: number };
  tags: string[];
  variations?: string[];
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface ShoppingList {
  id: string;
  userId: string;
  weekStartDate: string;
  items: ShoppingItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingItem {
  id: string;
  ingredient: Ingredient;
  isPurchased: boolean;
  mealNames: string[];
}

// Notification Types
export interface AppNotification {
  id: string;
  userId: string;
  type: 'habit-reminder' | 'streak-alert' | 'friend-request' | 'challenge-invite' | 'achievement' | 'motivational';
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

// Navigation Types
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ProfileSetup: undefined;
  MainTabs: undefined;
  HabitDetail: { habitId: string };
  CreateHabit: undefined;
  EditHabit: { habitId: string };
  ChallengeDetail: { challengeId: string };
  CreateChallenge: undefined;
  Challenges: undefined;
  Leaderboard: undefined;
  BadgeShowcase: undefined;
  UserProfile: { userId: string };
  FriendsList: undefined;
  SearchUsers: undefined;
  DietPlan: { date?: string };
  RecipeDetail: { meal: Meal };
  ShoppingList: { weekStartDate?: string };
  Settings: undefined;
  Premium: undefined;
};

export type TabParamList = {
  Home: undefined;
  Habits: undefined;
  Feed: undefined;
  Diet: undefined;
  Profile: undefined;
};
