import { doc, getDoc, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { User } from '@/types';

/**
 * Award points to the current user
 * @param points - Number of points to award (can be negative to deduct)
 * @param reason - Reason for awarding points (for analytics/history)
 * @returns Updated total points
 */
export const awardPoints = async (
  points: number,
  reason: string = 'general'
): Promise<number> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const userRef = doc(db, 'users', userId);
    
    // Get current points to prevent going negative
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error('User not found');
    
    const userData = userDoc.data() as User;
    const currentPoints = userData.profile.points || 0;
    
    // Prevent points from going below 0
    const finalPoints = Math.max(0, points);
    if (points < 0 && currentPoints + points < 0) {
      // If deducting would make it negative, just set to 0
      await updateDoc(userRef, {
        'profile.points': 0,
        'profile.weeklyPoints': Math.max(0, (userData.profile.weeklyPoints || 0) + points),
        'profile.monthlyPoints': Math.max(0, (userData.profile.monthlyPoints || 0) + points),
        'profile.updatedAt': Timestamp.now(),
      });
      return 0;
    }
    
    // Update all point fields atomically
    await updateDoc(userRef, {
      'profile.points': increment(points),
      'profile.weeklyPoints': increment(points),
      'profile.monthlyPoints': increment(points),
      'profile.updatedAt': Timestamp.now(),
    });

    // Get updated total
    const updatedDoc = await getDoc(userRef);
    if (!updatedDoc.exists()) throw new Error('User not found');
    
    const updatedData = updatedDoc.data() as User;
    const newPoints = Math.max(0, updatedData.profile.points || 0);
    
    // Auto-update level after points change
    await updateUserLevel();
    
    return newPoints;
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
};

/**
 * Update user's streak information
 * @param currentStreak - Current streak count
 * @param longestStreak - Longest streak achieved
 */
export const updateUserStreak = async (
  currentStreak: number,
  longestStreak?: number
): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const userRef = doc(db, 'users', userId);
    const updates: any = {
      'profile.currentStreak': currentStreak,
      'profile.streakDays': currentStreak,
      'profile.updatedAt': Timestamp.now(),
    };

    if (longestStreak !== undefined) {
      updates['profile.longestStreak'] = longestStreak;
    }

    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
};

/**
 * Calculate and update user level based on points
 * Level = floor(points / 100)
 * @returns New level
 */
export const updateUserLevel = async (): Promise<number> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) throw new Error('User not found');
    
    const userData = userDoc.data() as User;
    const points = userData.profile.points || 0;
    const newLevel = Math.floor(points / 100);
    
    // Only update if level changed
    if (newLevel !== userData.profile.level) {
      await updateDoc(userRef, {
        'profile.level': newLevel,
        'profile.updatedAt': Timestamp.now(),
      });
    }

    return newLevel;
  } catch (error) {
    console.error('Error updating level:', error);
    throw error;
  }
};

/**
 * Get user's current points and level
 * @returns Object with points and level
 */
export const getUserPointsAndLevel = async (): Promise<{
  points: number;
  level: number;
  weeklyPoints: number;
  monthlyPoints: number;
}> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) throw new Error('User not found');
    
    const userData = userDoc.data() as User;
    
    return {
      points: userData.profile.points || 0,
      level: userData.profile.level || 0,
      weeklyPoints: userData.profile.weeklyPoints || 0,
      monthlyPoints: userData.profile.monthlyPoints || 0,
    };
  } catch (error) {
    console.error('Error getting points and level:', error);
    throw error;
  }
};

/**
 * Award bonus points for streak milestones
 * @param streakDays - Current streak count
 * @returns Points awarded (0 if no milestone)
 */
export const awardStreakBonus = async (streakDays: number): Promise<number> => {
  try {
    let bonusPoints = 0;

    // Award bonus points at milestones
    if (streakDays === 7) {
      bonusPoints = 50; // 7-day streak bonus
    } else if (streakDays === 30) {
      bonusPoints = 200; // 30-day streak bonus
    } else if (streakDays === 100) {
      bonusPoints = 500; // 100-day streak bonus
    } else if (streakDays % 50 === 0 && streakDays > 0) {
      bonusPoints = 100; // Every 50 days bonus
    }

    if (bonusPoints > 0) {
      await awardPoints(bonusPoints, `${streakDays}-day streak milestone`);
    }

    return bonusPoints;
  } catch (error) {
    console.error('Error awarding streak bonus:', error);
    return 0;
  }
};

/**
 * Reset weekly or monthly points (called by scheduled functions)
 * @param period - 'weekly' or 'monthly'
 */
export const resetPeriodPoints = async (
  period: 'weekly' | 'monthly'
): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const userRef = doc(db, 'users', userId);
    
    if (period === 'weekly') {
      await updateDoc(userRef, {
        'profile.weeklyPoints': 0,
        'profile.updatedAt': Timestamp.now(),
      });
    } else if (period === 'monthly') {
      await updateDoc(userRef, {
        'profile.monthlyPoints': 0,
        'profile.updatedAt': Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error resetting period points:', error);
    throw error;
  }
};
