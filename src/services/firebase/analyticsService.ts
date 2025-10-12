import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from './config';
import { Habit, HabitCompletion, HabitCategory } from '@/types';

export interface HabitStats {
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // percentage
  bestDay: string; // day of week
  bestTime: string; // hour of day
  categoryBreakdown: { category: HabitCategory; count: number; percentage: number }[];
}

export interface WeeklyInsights {
  weekStart: Date;
  weekEnd: Date;
  totalCompletions: number;
  dailyCompletions: number[];
  topCategories: { category: HabitCategory; count: number }[];
  comparisonToPreviousWeek: number; // percentage change
}

export interface MonthlyInsights {
  month: number;
  year: number;
  totalCompletions: number;
  averagePerDay: number;
  streakDays: number;
  topHabits: { habitId: string; name: string; completions: number }[];
  categoryBreakdown: { category: HabitCategory; count: number }[];
}

/**
 * Get comprehensive habit statistics
 */
export const getHabitStats = async (): Promise<HabitStats> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  // Get all habits
  const habitsQuery = query(
    collection(db, 'habits'),
    where('userId', '==', currentUser.uid)
  );
  const habitsSnapshot = await getDocs(habitsQuery);
  const habits = habitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));

  // Get all completions
  const completionsQuery = query(
    collection(db, 'habitCompletions'),
    where('userId', '==', currentUser.uid),
    orderBy('date', 'desc')
  );
  const completionsSnapshot = await getDocs(completionsQuery);
  const completions = completionsSnapshot.docs.map(doc => doc.data() as HabitCompletion);

  // Calculate total completions
  const totalCompletions = completions.length;

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  const sortedDates = Array.from(new Set(completions.map(c => c.date))).sort().reverse();

  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];

    if (sortedDates[i] === expectedDateStr) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const currentDate = new Date(dateStr);
    
    if (lastDate === null) {
      tempStreak = 1;
    } else {
      const dayDiff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    
    lastDate = currentDate;
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate completion rate (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCompletions = completions.filter(c => new Date(c.date) >= thirtyDaysAgo);
  const expectedCompletions = habits.length * 30;
  const completionRate = expectedCompletions > 0 ? (recentCompletions.length / expectedCompletions) * 100 : 0;

  // Find best day of week
  const dayCount: { [key: string]: number } = {};
  completions.forEach(c => {
    const date = new Date(c.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    dayCount[dayName] = (dayCount[dayName] || 0) + 1;
  });
  const bestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Monday';

  // Find best time (would need completion timestamp - using placeholder)
  const bestTime = '9:00 AM';

  // Category breakdown
  const categoryCount: { [key: string]: number } = {};
  completions.forEach(c => {
    const habit = habits.find(h => h.id === c.habitId);
    if (habit) {
      categoryCount[habit.category] = (categoryCount[habit.category] || 0) + 1;
    }
  });

  const categoryBreakdown = Object.entries(categoryCount).map(([category, count]) => ({
    category: category as HabitCategory,
    count,
    percentage: (count / totalCompletions) * 100,
  }));

  return {
    totalCompletions,
    currentStreak,
    longestStreak,
    completionRate: Math.round(completionRate),
    bestDay,
    bestTime,
    categoryBreakdown,
  };
};

/**
 * Get weekly insights
 */
export const getWeeklyInsights = async (): Promise<WeeklyInsights> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  // Calculate week boundaries
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Get completions for this week
  const completionsQuery = query(
    collection(db, 'habitCompletions'),
    where('userId', '==', currentUser.uid),
    where('date', '>=', weekStart.toISOString().split('T')[0]),
    where('date', '<=', weekEnd.toISOString().split('T')[0])
  );
  const completionsSnapshot = await getDocs(completionsQuery);
  const completions = completionsSnapshot.docs.map(doc => doc.data() as HabitCompletion);

  // Get habits for category breakdown
  const habitsQuery = query(
    collection(db, 'habits'),
    where('userId', '==', currentUser.uid)
  );
  const habitsSnapshot = await getDocs(habitsQuery);
  const habits = habitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));

  // Daily completions
  const dailyCompletions = Array(7).fill(0);
  completions.forEach(c => {
    const date = new Date(c.date);
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Monday = 0
    dailyCompletions[dayIndex]++;
  });

  // Top categories
  const categoryCount: { [key: string]: number } = {};
  completions.forEach(c => {
    const habit = habits.find(h => h.id === c.habitId);
    if (habit) {
      categoryCount[habit.category] = (categoryCount[habit.category] || 0) + 1;
    }
  });

  const topCategories = Object.entries(categoryCount)
    .map(([category, count]) => ({ category: category as HabitCategory, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Get previous week for comparison
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd = new Date(weekEnd);
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

  const prevCompletionsQuery = query(
    collection(db, 'habitCompletions'),
    where('userId', '==', currentUser.uid),
    where('date', '>=', prevWeekStart.toISOString().split('T')[0]),
    where('date', '<=', prevWeekEnd.toISOString().split('T')[0])
  );
  const prevCompletionsSnapshot = await getDocs(prevCompletionsQuery);
  const prevCompletionsCount = prevCompletionsSnapshot.size;

  const comparisonToPreviousWeek = prevCompletionsCount > 0
    ? ((completions.length - prevCompletionsCount) / prevCompletionsCount) * 100
    : 0;

  return {
    weekStart,
    weekEnd,
    totalCompletions: completions.length,
    dailyCompletions,
    topCategories,
    comparisonToPreviousWeek: Math.round(comparisonToPreviousWeek),
  };
};

/**
 * Get monthly insights
 */
export const getMonthlyInsights = async (month?: number, year?: number): Promise<MonthlyInsights> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const now = new Date();
  const targetMonth = month ?? now.getMonth();
  const targetYear = year ?? now.getFullYear();

  const monthStart = new Date(targetYear, targetMonth, 1);
  const monthEnd = new Date(targetYear, targetMonth + 1, 0);

  // Get completions for this month
  const completionsQuery = query(
    collection(db, 'habitCompletions'),
    where('userId', '==', currentUser.uid),
    where('date', '>=', monthStart.toISOString().split('T')[0]),
    where('date', '<=', monthEnd.toISOString().split('T')[0])
  );
  const completionsSnapshot = await getDocs(completionsQuery);
  const completions = completionsSnapshot.docs.map(doc => doc.data() as HabitCompletion);

  // Get habits
  const habitsQuery = query(
    collection(db, 'habits'),
    where('userId', '==', currentUser.uid)
  );
  const habitsSnapshot = await getDocs(habitsQuery);
  const habits = habitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));

  const totalCompletions = completions.length;
  const daysInMonth = monthEnd.getDate();
  const averagePerDay = totalCompletions / daysInMonth;

  // Calculate streak days
  const uniqueDates = new Set(completions.map(c => c.date));
  const streakDays = uniqueDates.size;

  // Top habits
  const habitCount: { [key: string]: number } = {};
  completions.forEach(c => {
    habitCount[c.habitId] = (habitCount[c.habitId] || 0) + 1;
  });

  const topHabits = Object.entries(habitCount)
    .map(([habitId, count]) => {
      const habit = habits.find(h => h.id === habitId);
      return {
        habitId,
        name: habit?.title || 'Unknown',
        completions: count,
      };
    })
    .sort((a, b) => b.completions - a.completions)
    .slice(0, 5);

  // Category breakdown
  const categoryCount: { [key: string]: number } = {};
  completions.forEach(c => {
    const habit = habits.find(h => h.id === c.habitId);
    if (habit) {
      categoryCount[habit.category] = (categoryCount[habit.category] || 0) + 1;
    }
  });

  const categoryBreakdown = Object.entries(categoryCount).map(([category, count]) => ({
    category: category as HabitCategory,
    count,
  }));

  return {
    month: targetMonth,
    year: targetYear,
    totalCompletions,
    averagePerDay: Math.round(averagePerDay * 10) / 10,
    streakDays,
    topHabits,
    categoryBreakdown,
  };
};

/**
 * Get habit predictions and recommendations
 */
export const getHabitRecommendations = async (): Promise<string[]> => {
  const stats = await getHabitStats();
  const recommendations: string[] = [];

  if (stats.completionRate < 50) {
    recommendations.push('Try setting fewer habits to maintain consistency');
    recommendations.push('Set reminders for your most important habits');
  }

  if (stats.currentStreak === 0) {
    recommendations.push('Start fresh today! Every journey begins with a single step');
  } else if (stats.currentStreak < 7) {
    recommendations.push(`You're ${7 - stats.currentStreak} days away from a week streak!`);
  }

  const lowCategories = stats.categoryBreakdown.filter(c => c.percentage < 10);
  if (lowCategories.length > 0) {
    recommendations.push(`Consider adding more ${lowCategories[0].category} habits for balance`);
  }

  return recommendations;
};
