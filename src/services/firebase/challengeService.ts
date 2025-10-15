import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  serverTimestamp,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db, auth } from './config';
import { DailyChallenge, UserChallenge, ChallengeGoal, HabitCategory } from '@/types';
import { updateUserLevel } from './userService';

// ==================== DAILY CHALLENGE GENERATION ====================

/**
 * Challenge templates for daily challenges
 */
const DAILY_CHALLENGE_TEMPLATES: Array<{
  title: string;
  description: string;
  icon: string;
  goal: Omit<ChallengeGoal, 'current'>;
  points: number;
}> = [
  {
    title: 'Habit Hero',
    description: 'Complete 3 habits today',
    icon: 'check-circle',
    goal: { type: 'complete_habits', target: 3 },
    points: 50,
  },
  {
    title: 'Fitness Focus',
    description: 'Complete 2 fitness habits',
    icon: 'arm-flex',
    goal: { type: 'complete_category', target: 2, category: 'fitness' },
    points: 60,
  },
  {
    title: 'Nutrition Champion',
    description: 'Complete 2 nutrition habits',
    icon: 'food-apple',
    goal: { type: 'complete_category', target: 2, category: 'nutrition' },
    points: 60,
  },
  {
    title: 'Mindful Master',
    description: 'Complete 2 mindfulness habits',
    icon: 'meditation',
    goal: { type: 'complete_category', target: 2, category: 'mindfulness' },
    points: 60,
  },
  {
    title: 'Streak Keeper',
    description: 'Maintain your streak for today',
    icon: 'fire',
    goal: { type: 'maintain_streak', target: 1 },
    points: 40,
  },
  {
    title: 'Point Hunter',
    description: 'Earn 30 points today',
    icon: 'star',
    goal: { type: 'earn_points', target: 30 },
    points: 50,
  },
  {
    title: 'Social Butterfly',
    description: 'Interact with friends (like or comment)',
    icon: 'account-group',
    goal: { type: 'social_interaction', target: 3 },
    points: 45,
  },
  {
    title: 'Perfect Day',
    description: 'Complete 5 habits today',
    icon: 'trophy',
    goal: { type: 'complete_habits', target: 5 },
    points: 100,
  },
];

/**
 * Generate daily challenges for a user
 * Creates 3 random challenges that reset at midnight
 */
export const generateDailyChallenges = async (): Promise<DailyChallenge[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  // Select 3 random challenges
  const shuffled = [...DAILY_CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
  const selectedTemplates = shuffled.slice(0, 3);

  const challenges: DailyChallenge[] = selectedTemplates.map((template, index) => ({
    id: `daily_${now.toISOString().split('T')[0]}_${index}`,
    type: 'daily',
    title: template.title,
    description: template.description,
    icon: template.icon,
    goal: { ...template.goal, current: 0 },
    reward: { points: template.points },
    startDate: startOfDay,
    endDate: endOfDay,
    isActive: true,
  }));

  return challenges;
};

/**
 * Get user's daily challenges for today
 */
export const getUserDailyChallenges = async (): Promise<UserChallenge[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if user has challenges for today
    const userChallengesQuery = query(
      collection(db, 'userChallenges'),
      where('userId', '==', currentUser.uid)
    );

    const snapshot = await getDocs(userChallengesQuery);
    
    // Filter for today's challenges
    const todaysChallenges = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          challengeId: data.challengeId,
          challenge: {
            ...data.challenge,
            startDate: data.challenge.startDate?.toDate() || new Date(),
            endDate: data.challenge.endDate?.toDate() || new Date(),
          },
          progress: data.progress,
          isCompleted: data.isCompleted,
          isClaimed: data.isClaimed,
          completedAt: data.completedAt?.toDate(),
          claimedAt: data.claimedAt?.toDate(),
        } as UserChallenge;
      })
      .filter((uc) => uc.challengeId.startsWith(`daily_${today}`));

    // If no challenges exist for today, generate new ones
    if (todaysChallenges.length === 0) {
      const newChallenges = await generateDailyChallenges();
      const userChallenges: UserChallenge[] = [];

      for (const challenge of newChallenges) {
        const userChallengeData: UserChallenge = {
          id: `${currentUser.uid}_${challenge.id}`,
          userId: currentUser.uid,
          challengeId: challenge.id,
          challenge,
          progress: 0,
          isCompleted: false,
          isClaimed: false,
        };

        await setDoc(doc(db, 'userChallenges', userChallengeData.id), {
          ...userChallengeData,
          challenge: {
            ...challenge,
            startDate: Timestamp.fromDate(challenge.startDate),
            endDate: Timestamp.fromDate(challenge.endDate),
          },
        });

        userChallenges.push(userChallengeData);
      }

      return userChallenges;
    }

    // Return existing challenges for today
    return todaysChallenges;
  } catch (error: any) {
    console.error('Error getting daily challenges:', error);
    throw new Error(`Failed to load challenges: ${error.message}`);
  }
};

/**
 * Update challenge progress based on user activity
 */
export const updateChallengeProgress = async (
  challengeId: string,
  progressIncrement: number
): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const userChallengeId = `${currentUser.uid}_${challengeId}`;
  const userChallengeRef = doc(db, 'userChallenges', userChallengeId);

  const userChallengeDoc = await getDoc(userChallengeRef);
  if (!userChallengeDoc.exists()) return;

  const data = userChallengeDoc.data();
  const currentProgress = data.progress || 0;
  const target = data.challenge.goal.target;

  const newProgress = Math.min(currentProgress + progressIncrement, target);
  const isCompleted = newProgress >= target;

  await updateDoc(userChallengeRef, {
    'challenge.goal.current': newProgress,
    progress: Math.round((newProgress / target) * 100),
    isCompleted,
    ...(isCompleted && !data.completedAt ? { completedAt: serverTimestamp() } : {}),
  });
};

/**
 * Claim reward for completed challenge
 */
export const claimChallengeReward = async (challengeId: string): Promise<number> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const userChallengeId = `${currentUser.uid}_${challengeId}`;
  const userChallengeRef = doc(db, 'userChallenges', userChallengeId);

  const userChallengeDoc = await getDoc(userChallengeRef);
  if (!userChallengeDoc.exists()) {
    throw new Error('Challenge not found');
  }

  const data = userChallengeDoc.data();
  
  if (!data.isCompleted) {
    throw new Error('Challenge not completed');
  }

  if (data.isClaimed) {
    throw new Error('Reward already claimed');
  }

  const rewardPoints = data.challenge.reward.points;

  // Update user challenge
  await updateDoc(userChallengeRef, {
    isClaimed: true,
    claimedAt: serverTimestamp(),
  });

  // Update user points
  const userRef = doc(db, 'users', currentUser.uid);
  await updateDoc(userRef, {
    'profile.points': increment(rewardPoints),
    'profile.weeklyPoints': increment(rewardPoints),
    'profile.monthlyPoints': increment(rewardPoints),
  });

  // Update user level
  try {
    await updateUserLevel();
  } catch (error) {
    console.error('Error updating level:', error);
  }

  // Create notification
  await setDoc(doc(collection(db, 'notifications')), {
    userId: currentUser.uid,
    type: 'challenge_complete',
    message: `You earned ${rewardPoints} points for completing "${data.challenge.title}"!`,
    read: false,
    createdAt: serverTimestamp(),
  });

  return rewardPoints;
};

// ==================== WEEKLY CHALLENGES ====================

const WEEKLY_CHALLENGE_TEMPLATES: Array<{
  title: string;
  description: string;
  icon: string;
  goal: Omit<ChallengeGoal, 'current'>;
  points: number;
}> = [
  {
    title: 'Weekly Warrior',
    description: 'Complete 15 habits this week',
    icon: 'sword-cross',
    goal: { type: 'complete_habits', target: 15 },
    points: 200,
  },
  {
    title: '7-Day Streak',
    description: 'Maintain a 7-day streak',
    icon: 'fire',
    goal: { type: 'maintain_streak', target: 7 },
    points: 250,
  },
  {
    title: 'Fitness Week',
    description: 'Complete 10 fitness habits',
    icon: 'dumbbell',
    goal: { type: 'complete_category', target: 10, category: 'fitness' },
    points: 220,
  },
  {
    title: 'Point Master',
    description: 'Earn 200 points this week',
    icon: 'star-circle',
    goal: { type: 'earn_points', target: 200 },
    points: 300,
  },
];

/**
 * Get user's weekly challenge
 */
export const getUserWeeklyChallenge = async (): Promise<UserChallenge | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  // Get start of current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const weekId = weekStart.toISOString().split('T')[0];

  // Check if user has a weekly challenge
  const userChallengeId = `${currentUser.uid}_weekly_${weekId}`;
  const userChallengeDoc = await getDoc(doc(db, 'userChallenges', userChallengeId));

  if (!userChallengeDoc.exists()) {
    // Generate new weekly challenge
    const template = WEEKLY_CHALLENGE_TEMPLATES[
      Math.floor(Math.random() * WEEKLY_CHALLENGE_TEMPLATES.length)
    ];

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59);

    const challenge: DailyChallenge = {
      id: `weekly_${weekId}`,
      type: 'weekly',
      title: template.title,
      description: template.description,
      icon: template.icon,
      goal: { ...template.goal, current: 0 },
      reward: { points: template.points },
      startDate: weekStart,
      endDate: weekEnd,
      isActive: true,
    };

    const userChallenge: UserChallenge = {
      id: userChallengeId,
      userId: currentUser.uid,
      challengeId: challenge.id,
      challenge,
      progress: 0,
      isCompleted: false,
      isClaimed: false,
    };

    await setDoc(doc(db, 'userChallenges', userChallengeId), {
      ...userChallenge,
      challenge: {
        ...challenge,
        startDate: Timestamp.fromDate(challenge.startDate),
        endDate: Timestamp.fromDate(challenge.endDate),
      },
    });

    return userChallenge;
  }

  const data = userChallengeDoc.data();
  return {
    id: userChallengeDoc.id,
    userId: data.userId,
    challengeId: data.challengeId,
    challenge: {
      ...data.challenge,
      startDate: data.challenge.startDate?.toDate() || new Date(),
      endDate: data.challenge.endDate?.toDate() || new Date(),
    },
    progress: data.progress,
    isCompleted: data.isCompleted,
    isClaimed: data.isClaimed,
    completedAt: data.completedAt?.toDate(),
    claimedAt: data.claimedAt?.toDate(),
  } as UserChallenge;
};

/**
 * Check and update all active challenges based on habit completion
 */
export const checkAndUpdateChallenges = async (habitCategory?: HabitCategory): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  try {
    const challenges = await getUserDailyChallenges();
    const weeklyChallenge = await getUserWeeklyChallenge();
    
    const allChallenges = [...challenges, ...(weeklyChallenge ? [weeklyChallenge] : [])];

    for (const userChallenge of allChallenges) {
      if (userChallenge.isCompleted) continue;

      const goal = userChallenge.challenge.goal;

      // Update based on goal type
      if (goal.type === 'complete_habits') {
        await updateChallengeProgress(userChallenge.challengeId, 1);
      } else if (goal.type === 'complete_category' && goal.category === habitCategory) {
        await updateChallengeProgress(userChallenge.challengeId, 1);
      }
    }
  } catch (error) {
    console.error('Error updating challenges:', error);
  }
};

/**
 * Update streak-based challenges
 */
export const updateStreakChallenges = async (currentStreak: number): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  try {
    const challenges = await getUserDailyChallenges();
    const weeklyChallenge = await getUserWeeklyChallenge();
    
    const allChallenges = [...challenges, ...(weeklyChallenge ? [weeklyChallenge] : [])];

    for (const userChallenge of allChallenges) {
      if (userChallenge.isCompleted) continue;

      const goal = userChallenge.challenge.goal;

      if (goal.type === 'maintain_streak' && currentStreak >= goal.target) {
        await updateChallengeProgress(userChallenge.challengeId, goal.target);
      }
    }
  } catch (error) {
    console.error('Error updating streak challenges:', error);
  }
};
