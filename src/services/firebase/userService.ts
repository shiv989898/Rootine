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
    const activePowerUpsRaw: any[] = userData.profile.activePowerUps || [];
    const now = Date.now();

    let activePowerUps = activePowerUpsRaw
      .map((item) => {
        const activatedAt = item.activatedAt?.toDate?.() ?? (item.activatedAt ? new Date(item.activatedAt) : undefined);
        const expiresAt = item.expiresAt?.toDate?.() ?? (item.expiresAt ? new Date(item.expiresAt) : undefined);
        return {
          ...item,
          activatedAt,
          expiresAt,
        };
      })
      .filter((item) => !item.expiresAt || item.expiresAt.getTime() > now);

    const expiredCount = activePowerUpsRaw.length - activePowerUps.length;
    let powerUpStateChanged = expiredCount > 0;

    let adjustedPoints = points;

    const doublePointsPowerUp = activePowerUps.find(
      (item) => item.type === 'double_points' && (item.usesRemaining ?? 0) > 0
    );

    if (adjustedPoints > 0 && doublePointsPowerUp) {
      adjustedPoints *= 2;
      const remaining = (doublePointsPowerUp.usesRemaining ?? 1) - 1;
      if (remaining <= 0) {
        activePowerUps = activePowerUps.filter((item) => item.id !== doublePointsPowerUp.id);
      } else {
        doublePointsPowerUp.usesRemaining = remaining;
      }
      powerUpStateChanged = true;
    }
    
    if (adjustedPoints < 0 && currentPoints + adjustedPoints < 0) {
      // If deducting would make it negative, just set to 0
      await updateDoc(userRef, {
        'profile.points': 0,
        'profile.weeklyPoints': Math.max(0, (userData.profile.weeklyPoints || 0) + adjustedPoints),
        'profile.monthlyPoints': Math.max(0, (userData.profile.monthlyPoints || 0) + adjustedPoints),
        'profile.updatedAt': Timestamp.now(),
        ...(powerUpStateChanged
          ? {
              'profile.activePowerUps': activePowerUps.map((item) => ({
                ...item,
                activatedAt: item.activatedAt ? Timestamp.fromDate(item.activatedAt) : null,
                expiresAt: item.expiresAt ? Timestamp.fromDate(item.expiresAt) : null,
              })),
            }
          : {}),
      });
      return 0;
    }
    
    // Update all point fields atomically
    await updateDoc(userRef, {
      'profile.points': increment(adjustedPoints),
      'profile.weeklyPoints': increment(adjustedPoints),
      'profile.monthlyPoints': increment(adjustedPoints),
      'profile.updatedAt': Timestamp.now(),
      ...(expiredCount > 0
        ? {
            'profile.activePowerUps': activePowerUps.map((item) => ({
              ...item,
              activatedAt: item.activatedAt ? Timestamp.fromDate(item.activatedAt) : null,
              expiresAt: item.expiresAt ? Timestamp.fromDate(item.expiresAt) : null,
            })),
          }
        : {}),
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
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error('User not found');

    const userData = userDoc.data() as User;
    const existingStreak = userData.profile.currentStreak || 0;
    const existingLongest = userData.profile.longestStreak || 0;

    const activePowerUpsRaw: any[] = userData.profile.activePowerUps || [];
    const now = Date.now();

    let activePowerUps = activePowerUpsRaw
      .map((item) => {
        const activatedAt = item.activatedAt?.toDate?.() ?? (item.activatedAt ? new Date(item.activatedAt) : undefined);
        const expiresAt = item.expiresAt?.toDate?.() ?? (item.expiresAt ? new Date(item.expiresAt) : undefined);
        return { ...item, activatedAt, expiresAt };
      })
      .filter((item) => !item.expiresAt || item.expiresAt.getTime() > now);

    const expiredCount = activePowerUpsRaw.length - activePowerUps.length;
    let powerUpStateChanged = expiredCount > 0;

    let streakToSave = currentStreak;

    const freezePowerUp = activePowerUps.find(
      (item) => item.type === 'streak_freeze' && (item.usesRemaining ?? 0) > 0
    );

    if (streakToSave < existingStreak && freezePowerUp) {
      streakToSave = existingStreak;
      const remaining = (freezePowerUp.usesRemaining ?? 1) - 1;
      if (remaining <= 0) {
        activePowerUps = activePowerUps.filter((item) => item.id !== freezePowerUp.id);
      } else {
        freezePowerUp.usesRemaining = remaining;
      }
      powerUpStateChanged = true;
    }

    const longestToSave = Math.max(
      longestStreak !== undefined ? longestStreak : 0,
      existingLongest,
      streakToSave
    );

    const updates: Record<string, unknown> = {
      'profile.currentStreak': streakToSave,
      'profile.streakDays': streakToSave,
      'profile.updatedAt': Timestamp.now(),
    };

    if (longestToSave > existingLongest) {
      updates['profile.longestStreak'] = longestToSave;
    }

    if (powerUpStateChanged) {
      updates['profile.activePowerUps'] = activePowerUps.map((item) => ({
        ...item,
        activatedAt: item.activatedAt ? Timestamp.fromDate(item.activatedAt) : null,
        expiresAt: item.expiresAt ? Timestamp.fromDate(item.expiresAt) : null,
      }));
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
