import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  Timestamp,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { LeaderboardEntry, LeaderboardPeriod, User } from '@/types';

/**
 * Get global leaderboard for all users
 * @param period - Time period for leaderboard (all-time, weekly, monthly)
 * @param limitCount - Number of users to fetch (default 100)
 * @param lastDoc - Last document for pagination
 * @returns Array of leaderboard entries with rankings
 */
export const getGlobalLeaderboard = async (
  period: LeaderboardPeriod = 'all-time',
  limitCount: number = 100,
  lastDoc?: DocumentSnapshot
): Promise<LeaderboardEntry[]> => {
  try {
    const usersRef = collection(db, 'users');
    let q;

    // Build query based on period
    switch (period) {
      case 'weekly':
        // Get users with weekly points sorted
        q = query(
          usersRef,
          orderBy('profile.weeklyPoints', 'desc'),
          orderBy('profile.points', 'desc'), // Secondary sort
          limit(limitCount)
        );
        break;

      case 'monthly':
        // Get users with monthly points sorted
        q = query(
          usersRef,
          orderBy('profile.monthlyPoints', 'desc'),
          orderBy('profile.points', 'desc'), // Secondary sort
          limit(limitCount)
        );
        break;

      case 'friends':
        // Friends leaderboard handled by separate function
        throw new Error('Use getFriendsLeaderboard for friends period');

      case 'all-time':
      default:
        // Get all users sorted by total points
        q = query(
          usersRef,
          orderBy('profile.points', 'desc'),
          orderBy('profile.currentStreak', 'desc'), // Secondary sort
          limit(limitCount)
        );
    }

    // Add pagination if last document provided
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];

    snapshot.docs.forEach((doc, index) => {
      const userData = doc.data() as User;
      
      entries.push({
        userId: doc.id,
        userName: userData.profile.displayName || 'Anonymous',
        userAvatar: userData.profile.photoURL || undefined,
        rank: lastDoc ? 0 : index + 1, // Will be recalculated if paginated
        points: userData.profile.points || 0,
        streak: userData.profile.currentStreak || 0,
        level: Math.floor((userData.profile.points || 0) / 100),
        weeklyPoints: userData.profile.weeklyPoints || 0,
        monthlyPoints: userData.profile.monthlyPoints || 0,
      });
    });

    return entries;
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    throw error;
  }
};

/**
 * Get leaderboard for user's friends only
 * @returns Array of leaderboard entries for friends
 */
export const getFriendsLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    // Get user's friends list
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) throw new Error('User not found');

    const userData = userDoc.data() as User;
    const friendIds = userData.friends || [];

    if (friendIds.length === 0) {
      return [];
    }

    // Fetch all friends' data
    const friendsData: LeaderboardEntry[] = [];
    
    // Batch fetch friends (Firestore 'in' query limited to 10, so we chunk)
    const chunks = chunkArray(friendIds, 10);
    
    for (const chunk of chunks) {
      const friendsQuery = query(
        collection(db, 'users'),
        where('__name__', 'in', chunk)
      );

      const snapshot = await getDocs(friendsQuery);
      snapshot.forEach((doc) => {
        const friend = doc.data() as User;
        friendsData.push({
          userId: doc.id,
          userName: friend.profile.displayName || 'Anonymous',
          userAvatar: friend.profile.photoURL || undefined,
          rank: 0, // Will be calculated after sorting
          points: friend.profile.points || 0,
          streak: friend.profile.currentStreak || 0,
          level: Math.floor((friend.profile.points || 0) / 100),
          weeklyPoints: friend.profile.weeklyPoints || 0,
          monthlyPoints: friend.profile.monthlyPoints || 0,
        });
      });
    }

    // Add current user to list
    const currentUserEntry: LeaderboardEntry = {
      userId,
      userName: userData.profile.displayName || 'You',
      userAvatar: userData.profile.photoURL || undefined,
      rank: 0,
      points: userData.profile.points || 0,
      streak: userData.profile.currentStreak || 0,
      level: Math.floor((userData.profile.points || 0) / 100),
      weeklyPoints: userData.profile.weeklyPoints || 0,
      monthlyPoints: userData.profile.monthlyPoints || 0,
    };
    friendsData.push(currentUserEntry);

    // Sort by points descending
    friendsData.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.streak - a.streak; // Tie-breaker
    });

    // Assign ranks
    friendsData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return friendsData;
  } catch (error) {
    console.error('Error fetching friends leaderboard:', error);
    throw error;
  }
};

/**
 * Get current user's rank in global leaderboard
 * @param period - Time period for ranking
 * @returns User's current rank (1-indexed)
 */
export const getUserRank = async (
  period: LeaderboardPeriod = 'all-time'
): Promise<number> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    // Get current user's data
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) throw new Error('User not found');

    const userData = userDoc.data() as User;
    let userScore = 0;

    // Get score based on period
    switch (period) {
      case 'weekly':
        userScore = userData.profile.weeklyPoints || 0;
        break;
      case 'monthly':
        userScore = userData.profile.monthlyPoints || 0;
        break;
      case 'all-time':
      default:
        userScore = userData.profile.points || 0;
    }

    // Count how many users have higher score
    const usersRef = collection(db, 'users');
    let q;

    switch (period) {
      case 'weekly':
        q = query(
          usersRef,
          where('profile.weeklyPoints', '>', userScore)
        );
        break;
      case 'monthly':
        q = query(
          usersRef,
          where('profile.monthlyPoints', '>', userScore)
        );
        break;
      case 'all-time':
      default:
        q = query(
          usersRef,
          where('profile.points', '>', userScore)
        );
    }

    const snapshot = await getDocs(q);
    const rank = snapshot.size + 1; // +1 because ranks are 1-indexed

    return rank;
  } catch (error) {
    console.error('Error getting user rank:', error);
    throw error;
  }
};

/**
 * Get leaderboard statistics
 * @returns Object with total users, average points, top score
 */
export const getLeaderboardStats = async (): Promise<{
  totalUsers: number;
  averagePoints: number;
  topScore: number;
}> => {
  try {
    const usersRef = collection(db, 'users');
    
    // Get top user
    const topQuery = query(
      usersRef,
      orderBy('profile.points', 'desc'),
      limit(1)
    );
    const topSnapshot = await getDocs(topQuery);
    const topScore = topSnapshot.empty 
      ? 0 
      : (topSnapshot.docs[0].data() as User).profile.points || 0;

    // Get all users for count and average
    const allUsersSnapshot = await getDocs(usersRef);
    const totalUsers = allUsersSnapshot.size;
    
    let totalPoints = 0;
    allUsersSnapshot.forEach(doc => {
      const user = doc.data() as User;
      totalPoints += user.profile.points || 0;
    });

    const averagePoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;

    return {
      totalUsers,
      averagePoints,
      topScore,
    };
  } catch (error) {
    console.error('Error fetching leaderboard stats:', error);
    throw error;
  }
};

/**
 * Get users near current user's rank
 * @param range - Number of users above and below to fetch
 * @returns Array of nearby users
 */
export const getNearbyUsers = async (
  range: number = 5
): Promise<LeaderboardEntry[]> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const userRank = await getUserRank('all-time');
    
    // Fetch users from (rank - range) to (rank + range)
    const startRank = Math.max(1, userRank - range);
    const endRank = userRank + range;
    const totalToFetch = endRank - startRank + 1;

    // Get leaderboard starting from startRank
    const leaderboard = await getGlobalLeaderboard('all-time', totalToFetch);
    
    // Filter to nearby range
    return leaderboard.filter(entry => 
      entry.rank >= startRank && entry.rank <= endRank
    );
  } catch (error) {
    console.error('Error fetching nearby users:', error);
    throw error;
  }
};

/**
 * Reset weekly/monthly points (called by scheduled function)
 * This should be called by a Cloud Function on schedule
 */
export const resetPeriodPoints = async (
  period: 'weekly' | 'monthly'
): Promise<void> => {
  try {
    console.warn('resetPeriodPoints should be called by Cloud Function');
    // This is a placeholder - implement in Cloud Functions
    // Firebase Admin SDK required for batch updates
  } catch (error) {
    console.error('Error resetting period points:', error);
    throw error;
  }
};

/**
 * Search users in leaderboard by name
 * @param searchQuery - User name to search for
 * @param limitCount - Max results to return
 * @returns Array of matching users
 */
export const searchLeaderboard = async (
  searchQuery: string,
  limitCount: number = 20
): Promise<LeaderboardEntry[]> => {
  try {
    if (!searchQuery || searchQuery.trim().length === 0) {
      return [];
    }

    const usersRef = collection(db, 'users');
    
    // Firestore doesn't support full-text search, so we'll fetch and filter
    // For production, consider using Algolia or similar
    const q = query(
      usersRef,
      orderBy('profile.displayName'),
      limit(100) // Fetch more to filter
    );

    const snapshot = await getDocs(q);
    const results: LeaderboardEntry[] = [];
    const searchLower = searchQuery.toLowerCase();

    snapshot.forEach((doc) => {
      const user = doc.data() as User;
      const displayName = user.profile.displayName || '';
      
      // Simple contains search
      if (displayName.toLowerCase().includes(searchLower)) {
        results.push({
          userId: doc.id,
          userName: displayName,
          userAvatar: user.profile.photoURL || undefined,
          rank: 0, // Will be calculated separately
          points: user.profile.points || 0,
          streak: user.profile.currentStreak || 0,
          level: Math.floor((user.profile.points || 0) / 100),
          weeklyPoints: user.profile.weeklyPoints || 0,
          monthlyPoints: user.profile.monthlyPoints || 0,
        });
      }
    });

    // Sort by points and assign ranks
    results.sort((a, b) => b.points - a.points);
    results.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return results.slice(0, limitCount);
  } catch (error) {
    console.error('Error searching leaderboard:', error);
    throw error;
  }
};

/**
 * Utility function to chunk array into smaller arrays
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
