import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { Badge, User } from '@/types';

// ==================== ACHIEVEMENT DEFINITIONS ====================

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'habits' | 'streaks' | 'points' | 'social' | 'challenges' | 'special';
  requirement: {
    type: 'habit_count' | 'streak_days' | 'total_points' | 'friends_count' | 'challenges_completed' | 'level_reached' | 'special';
    value: number;
  };
  reward: {
    points: number;
    title: string; // Badge title
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const ACHIEVEMENTS: Achievement[] = [
  // ===== HABIT ACHIEVEMENTS =====
  {
    id: 'first_habit',
    title: 'Getting Started',
    description: 'Complete your first habit',
    icon: 'star-outline',
    category: 'habits',
    requirement: { type: 'habit_count', value: 1 },
    reward: { points: 10, title: 'Beginner' },
    rarity: 'common',
  },
  {
    id: 'habit_enthusiast',
    title: 'Habit Enthusiast',
    description: 'Complete 10 habits',
    icon: 'star',
    category: 'habits',
    requirement: { type: 'habit_count', value: 10 },
    reward: { points: 25, title: 'Enthusiast' },
    rarity: 'common',
  },
  {
    id: 'habit_master',
    title: 'Habit Master',
    description: 'Complete 50 habits',
    icon: 'star-circle',
    category: 'habits',
    requirement: { type: 'habit_count', value: 50 },
    reward: { points: 100, title: 'Master' },
    rarity: 'rare',
  },
  {
    id: 'habit_legend',
    title: 'Habit Legend',
    description: 'Complete 100 habits',
    icon: 'star-face',
    category: 'habits',
    requirement: { type: 'habit_count', value: 100 },
    reward: { points: 250, title: 'Legend' },
    rarity: 'epic',
  },
  {
    id: 'habit_god',
    title: 'Habit God',
    description: 'Complete 500 habits',
    icon: 'crown',
    category: 'habits',
    requirement: { type: 'habit_count', value: 500 },
    reward: { points: 1000, title: 'God Mode' },
    rarity: 'legendary',
  },

  // ===== STREAK ACHIEVEMENTS =====
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'fire',
    category: 'streaks',
    requirement: { type: 'streak_days', value: 7 },
    reward: { points: 50, title: '7-Day Streak' },
    rarity: 'common',
  },
  {
    id: 'month_master',
    title: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: 'fire-circle',
    category: 'streaks',
    requirement: { type: 'streak_days', value: 30 },
    reward: { points: 200, title: '30-Day Streak' },
    rarity: 'rare',
  },
  {
    id: 'streak_legend',
    title: 'Streak Legend',
    description: 'Maintain a 100-day streak',
    icon: 'fire-alert',
    category: 'streaks',
    requirement: { type: 'streak_days', value: 100 },
    reward: { points: 500, title: '100-Day Streak' },
    rarity: 'epic',
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Maintain a 365-day streak',
    icon: 'fire-auto',
    category: 'streaks',
    requirement: { type: 'streak_days', value: 365 },
    reward: { points: 2000, title: 'Year Warrior' },
    rarity: 'legendary',
  },

  // ===== POINTS ACHIEVEMENTS =====
  {
    id: 'points_starter',
    title: 'Point Collector',
    description: 'Earn 100 total points',
    icon: 'numeric-1-circle',
    category: 'points',
    requirement: { type: 'total_points', value: 100 },
    reward: { points: 20, title: 'Collector' },
    rarity: 'common',
  },
  {
    id: 'points_hunter',
    title: 'Point Hunter',
    description: 'Earn 500 total points',
    icon: 'numeric-5-circle',
    category: 'points',
    requirement: { type: 'total_points', value: 500 },
    reward: { points: 50, title: 'Hunter' },
    rarity: 'rare',
  },
  {
    id: 'points_master',
    title: 'Point Master',
    description: 'Earn 1,000 total points',
    icon: 'diamond-stone',
    category: 'points',
    requirement: { type: 'total_points', value: 1000 },
    reward: { points: 100, title: 'Point Master' },
    rarity: 'epic',
  },
  {
    id: 'points_legend',
    title: 'Point Legend',
    description: 'Earn 5,000 total points',
    icon: 'diamond',
    category: 'points',
    requirement: { type: 'total_points', value: 5000 },
    reward: { points: 500, title: 'Point Legend' },
    rarity: 'legendary',
  },

  // ===== SOCIAL ACHIEVEMENTS =====
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Add 5 friends',
    icon: 'account-group',
    category: 'social',
    requirement: { type: 'friends_count', value: 5 },
    reward: { points: 30, title: 'Socialite' },
    rarity: 'common',
  },
  {
    id: 'friend_magnet',
    title: 'Friend Magnet',
    description: 'Add 20 friends',
    icon: 'account-heart',
    category: 'social',
    requirement: { type: 'friends_count', value: 20 },
    reward: { points: 100, title: 'Friend Magnet' },
    rarity: 'rare',
  },
  {
    id: 'social_icon',
    title: 'Social Icon',
    description: 'Add 50 friends',
    icon: 'account-star',
    category: 'social',
    requirement: { type: 'friends_count', value: 50 },
    reward: { points: 250, title: 'Social Icon' },
    rarity: 'epic',
  },

  // ===== CHALLENGE ACHIEVEMENTS =====
  {
    id: 'challenge_starter',
    title: 'Challenge Accepted',
    description: 'Complete your first challenge',
    icon: 'trophy-outline',
    category: 'challenges',
    requirement: { type: 'challenges_completed', value: 1 },
    reward: { points: 20, title: 'Challenger' },
    rarity: 'common',
  },
  {
    id: 'challenge_seeker',
    title: 'Challenge Seeker',
    description: 'Complete 10 challenges',
    icon: 'trophy',
    category: 'challenges',
    requirement: { type: 'challenges_completed', value: 10 },
    reward: { points: 100, title: 'Seeker' },
    rarity: 'rare',
  },
  {
    id: 'challenge_master',
    title: 'Challenge Master',
    description: 'Complete 50 challenges',
    icon: 'trophy-award',
    category: 'challenges',
    requirement: { type: 'challenges_completed', value: 50 },
    reward: { points: 300, title: 'Challenge Master' },
    rarity: 'epic',
  },
  {
    id: 'challenge_champion',
    title: 'Challenge Champion',
    description: 'Complete 100 challenges',
    icon: 'trophy-variant',
    category: 'challenges',
    requirement: { type: 'challenges_completed', value: 100 },
    reward: { points: 1000, title: 'Champion' },
    rarity: 'legendary',
  },

  // ===== LEVEL ACHIEVEMENTS =====
  {
    id: 'level_10',
    title: 'Level 10',
    description: 'Reach level 10',
    icon: 'numeric-10-circle',
    category: 'points',
    requirement: { type: 'level_reached', value: 10 },
    reward: { points: 50, title: 'Level 10' },
    rarity: 'common',
  },
  {
    id: 'level_25',
    title: 'Level 25',
    description: 'Reach level 25',
    icon: 'alpha-l-circle',
    category: 'points',
    requirement: { type: 'level_reached', value: 25 },
    reward: { points: 150, title: 'Level 25' },
    rarity: 'rare',
  },
  {
    id: 'level_50',
    title: 'Level 50',
    description: 'Reach level 50',
    icon: 'alpha-l-box',
    category: 'points',
    requirement: { type: 'level_reached', value: 50 },
    reward: { points: 500, title: 'Level 50' },
    rarity: 'epic',
  },
  {
    id: 'level_100',
    title: 'Level 100',
    description: 'Reach level 100',
    icon: 'alpha-l-circle-outline',
    category: 'points',
    requirement: { type: 'level_reached', value: 100 },
    reward: { points: 2000, title: 'Centurion' },
    rarity: 'legendary',
  },

  // ===== SPECIAL ACHIEVEMENTS =====
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a habit before 7 AM',
    icon: 'weather-sunny',
    category: 'special',
    requirement: { type: 'special', value: 1 },
    reward: { points: 25, title: 'Early Bird' },
    rarity: 'rare',
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a habit after 10 PM',
    icon: 'weather-night',
    category: 'special',
    requirement: { type: 'special', value: 1 },
    reward: { points: 25, title: 'Night Owl' },
    rarity: 'rare',
  },
  {
    id: 'perfect_day',
    title: 'Perfect Day',
    description: 'Complete all your habits in one day',
    icon: 'check-all',
    category: 'special',
    requirement: { type: 'special', value: 1 },
    reward: { points: 100, title: 'Perfectionist' },
    rarity: 'epic',
  },
];

// ==================== ACHIEVEMENT FUNCTIONS ====================

/**
 * Get all available achievements
 */
export const getAllAchievements = (): Achievement[] => {
  return ACHIEVEMENTS;
};

/**
 * Get user's unlocked badges
 */
export const getUserBadges = async (): Promise<Badge[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return [];

    const userData = userDoc.data() as User;
    return userData.profile.badges || [];
  } catch (error) {
    console.error('Error getting user badges:', error);
    return [];
  }
};

/**
 * Check if user meets achievement requirements
 */
export const checkAchievementRequirement = (
  achievement: Achievement,
  userData: {
    habitCount: number;
    currentStreak: number;
    totalPoints: number;
    friendsCount: number;
    challengesCompleted: number;
    level: number;
  }
): boolean => {
  const { requirement } = achievement;

  switch (requirement.type) {
    case 'habit_count':
      return userData.habitCount >= requirement.value;
    case 'streak_days':
      return userData.currentStreak >= requirement.value;
    case 'total_points':
      return userData.totalPoints >= requirement.value;
    case 'friends_count':
      return userData.friendsCount >= requirement.value;
    case 'challenges_completed':
      return userData.challengesCompleted >= requirement.value;
    case 'level_reached':
      return userData.level >= requirement.value;
    case 'special':
      // Special achievements checked separately
      return false;
    default:
      return false;
  }
};

/**
 * Unlock an achievement for the user
 */
export const unlockAchievement = async (
  achievementId: string
): Promise<Badge | null> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!achievement) throw new Error('Achievement not found');

    // Check if already unlocked
    const badges = await getUserBadges();
    if (badges.some((b) => b.id === achievementId)) {
      return null; // Already unlocked
    }

    const badge: Badge = {
      id: achievement.id,
      name: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      rarity: achievement.rarity,
      unlockedAt: new Date(),
    };

    // Add badge to user profile
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'profile.badges': arrayUnion(badge),
    });

    // Award bonus points
    await updateDoc(userRef, {
      'profile.points': arrayUnion(achievement.reward.points),
    });

    // Create notification
    await setDoc(doc(collection(db, 'notifications')), {
      userId,
      type: 'achievement_unlocked',
      message: `🏆 Achievement Unlocked: ${achievement.title}! (+${achievement.reward.points} pts)`,
      read: false,
      createdAt: serverTimestamp(),
    });

    return badge;
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return null;
  }
};

/**
 * Check all achievements and unlock newly completed ones
 */
export const checkAndUnlockAchievements = async (userData: {
  habitCount: number;
  currentStreak: number;
  totalPoints: number;
  friendsCount: number;
  challengesCompleted: number;
  level: number;
}): Promise<Badge[]> => {
  try {
    const unlockedBadges: Badge[] = [];
    const existingBadges = await getUserBadges();
    const existingBadgeIds = existingBadges.map((b) => b.id);

    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked
      if (existingBadgeIds.includes(achievement.id)) continue;

      // Check if requirement is met
      if (checkAchievementRequirement(achievement, userData)) {
        const badge = await unlockAchievement(achievement.id);
        if (badge) {
          unlockedBadges.push(badge);
        }
      }
    }

    return unlockedBadges;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

/**
 * Get achievement progress for a specific achievement
 */
export const getAchievementProgress = (
  achievement: Achievement,
  userData: {
    habitCount: number;
    currentStreak: number;
    totalPoints: number;
    friendsCount: number;
    challengesCompleted: number;
    level: number;
  }
): { current: number; target: number; percentage: number } => {
  const { requirement } = achievement;
  let current = 0;

  switch (requirement.type) {
    case 'habit_count':
      current = userData.habitCount;
      break;
    case 'streak_days':
      current = userData.currentStreak;
      break;
    case 'total_points':
      current = userData.totalPoints;
      break;
    case 'friends_count':
      current = userData.friendsCount;
      break;
    case 'challenges_completed':
      current = userData.challengesCompleted;
      break;
    case 'level_reached':
      current = userData.level;
      break;
    default:
      current = 0;
  }

  const target = requirement.value;
  const percentage = Math.min(100, Math.round((current / target) * 100));

  return { current, target, percentage };
};

/**
 * Get rarity color
 */
export const getRarityColor = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common':
      return '#9E9E9E'; // Gray
    case 'rare':
      return '#2196F3'; // Blue
    case 'epic':
      return '#9C27B0'; // Purple
    case 'legendary':
      return '#FFD700'; // Gold
    default:
      return '#9E9E9E';
  }
};
