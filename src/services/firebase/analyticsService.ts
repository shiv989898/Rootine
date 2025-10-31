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
import {
  Habit,
  HabitCompletion,
  HabitCategory,
  HabitHeatmapDay,
  SuccessTrendPoint,
  BestTimeInsight,
  HabitCorrelationInsight,
  WeeklyRecapStory,
} from '@/types';

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

/**
 * Build heatmap data for the last N days
 */
export const getHabitHeatmap = async (days: number = 180): Promise<HabitHeatmapDay[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));

  const completionsQueryRef = query(
    collection(db, 'habitCompletions'),
    where('userId', '==', currentUser.uid),
    where('date', '>=', startDate.toISOString().split('T')[0]),
    where('date', '<=', endDate.toISOString().split('T')[0])
  );

  const snapshot = await getDocs(completionsQueryRef);
  const countsByDate: Record<string, number> = {};

  snapshot.forEach((doc) => {
    const data = doc.data() as HabitCompletion;
    countsByDate[data.date] = (countsByDate[data.date] || 0) + 1;
  });

  const result: HabitHeatmapDay[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const iso = cursor.toISOString().split('T')[0];
    result.push({
      date: iso,
      count: countsByDate[iso] || 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
};

/**
 * Success rate trend across weeks or months
 */
export const getSuccessRateTrends = async (
  period: 'weekly' | 'monthly' = 'weekly',
  sampleSize: number = 6
): Promise<SuccessTrendPoint[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const habitsQueryRef = query(
    collection(db, 'habits'),
    where('userId', '==', currentUser.uid)
  );
  const habitsSnapshot = await getDocs(habitsQueryRef);
  const habitCount = habitsSnapshot.size;

  if (habitCount === 0) {
    return [];
  }

  const endDate = new Date();
  const trend: SuccessTrendPoint[] = [];

  for (let i = sampleSize - 1; i >= 0; i--) {
    const periodEnd = new Date(endDate);
    const periodStart = new Date(endDate);

    if (period === 'weekly') {
      periodStart.setDate(periodEnd.getDate() - i * 7 - 6);
      periodEnd.setDate(periodEnd.getDate() - i * 7);
    } else {
      periodStart.setMonth(periodEnd.getMonth() - i, 1);
      periodEnd.setMonth(periodStart.getMonth(), 1);
      periodEnd.setMonth(periodEnd.getMonth() + 1, 0);
    }

    periodStart.setHours(0, 0, 0, 0);
    periodEnd.setHours(23, 59, 59, 999);

    const completionsQueryRef = query(
      collection(db, 'habitCompletions'),
      where('userId', '==', currentUser.uid),
      where('date', '>=', periodStart.toISOString().split('T')[0]),
      where('date', '<=', periodEnd.toISOString().split('T')[0])
    );
    const completionSnapshot = await getDocs(completionsQueryRef);
    const completionsCount = completionSnapshot.size;

    const expected =
      period === 'weekly'
        ? habitCount * 7
        : habitCount * new Date(periodEnd.getFullYear(), periodEnd.getMonth() + 1, 0).getDate();

    const successRate = expected > 0 ? Math.round((completionsCount / expected) * 100) : 0;

    const label =
      period === 'weekly'
        ? `Wk ${getWeekNumber(periodEnd)}`
        : `${periodEnd.toLocaleString('default', { month: 'short' })}`;

    trend.push({
      label,
      successRate,
      completionRate: successRate,
    });
  }

  return trend;
};

const getWeekNumber = (date: Date): number => {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDays = Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
};

/**
 * Determine best time insights per habit based on completion timestamps
 */
export const getBestTimeInsights = async (): Promise<BestTimeInsight[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const habitsQueryRef = query(
    collection(db, 'habits'),
    where('userId', '==', currentUser.uid)
  );
  const habitsSnapshot = await getDocs(habitsQueryRef);
  const habits = habitsSnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Habit));

  if (habits.length === 0) {
    return [];
  }

  const completionsQueryRef = query(
    collection(db, 'habitCompletions'),
    where('userId', '==', currentUser.uid)
  );
  const completionsSnapshot = await getDocs(completionsQueryRef);

  const completionsByHabit: Record<string, HabitCompletion[]> = {};
  completionsSnapshot.docs.forEach((docSnap) => {
    const completion = docSnap.data() as HabitCompletion;
    completionsByHabit[completion.habitId] = completionsByHabit[completion.habitId] || [];
    completionsByHabit[completion.habitId].push(completion);
  });

  const insights: BestTimeInsight[] = [];

  habits.forEach((habit) => {
    const completions = completionsByHabit[habit.id] || [];
    if (completions.length === 0) {
      return;
    }

    const counts: Record<number, number> = {};
    completions.forEach((completion) => {
      const date = completion.completedAt instanceof Timestamp
        ? completion.completedAt.toDate()
        : new Date(completion.completedAt);
      const hour = date.getHours();
      counts[hour] = (counts[hour] || 0) + 1;
    });

    const topHour = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!topHour) {
      return;
    }

    const hourInt = Number(topHour[0]);
    const confidence = Math.min(1, topHour[1] / completions.length);

    const suggestedSlot = new Date();
    suggestedSlot.setHours(hourInt, 0, 0, 0);

    insights.push({
      habitId: habit.id,
      habitName: habit.title,
      suggestedSlot: suggestedSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence,
      rationale: `You complete this habit most often around ${hourInt}:00 with ${(confidence * 100).toFixed(0)}% consistency.`,
    });
  });

  return insights
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    .slice(0, 3);
};

/**
 * Determine habitual correlations between habit pairs
 */
export const getHabitCorrelations = async (): Promise<HabitCorrelationInsight[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const habitsSnapshot = await getDocs(
    query(collection(db, 'habits'), where('userId', '==', currentUser.uid))
  );
  const habits = habitsSnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Habit));

  const completionsSnapshot = await getDocs(
    query(collection(db, 'habitCompletions'), where('userId', '==', currentUser.uid))
  );

  const byDate: Record<string, string[]> = {};
  completionsSnapshot.docs.forEach((docSnap) => {
    const completion = docSnap.data() as HabitCompletion;
    byDate[completion.date] = byDate[completion.date] || [];
    if (!byDate[completion.date].includes(completion.habitId)) {
      byDate[completion.date].push(completion.habitId);
    }
  });

  const pairCounts: Record<string, number> = {};
  const habitCounts: Record<string, number> = {};

  Object.values(byDate).forEach((habitIds) => {
    habitIds.forEach((habitId) => {
      habitCounts[habitId] = (habitCounts[habitId] || 0) + 1;
    });

    for (let i = 0; i < habitIds.length; i++) {
      for (let j = i + 1; j < habitIds.length; j++) {
        const key = [habitIds[i], habitIds[j]].sort().join('::');
        pairCounts[key] = (pairCounts[key] || 0) + 1;
      }
    }
  });

  const totalDays = Object.keys(byDate).length || 1;

  const correlations: HabitCorrelationInsight[] = Object.entries(pairCounts)
    .map(([key, count]) => {
      const [habitAId, habitBId] = key.split('::');
      const habitA = habits.find((h) => h.id === habitAId);
      const habitB = habits.find((h) => h.id === habitBId);
      const support = count / totalDays;
      const confidence = count / (habitCounts[habitAId] || 1);
      const baseRate = (habitCounts[habitBId] || 1) / totalDays;
      const lift = confidence / baseRate;

      return {
        habitAId,
        habitAName: habitA?.title || 'Habit A',
        habitBId,
        habitBName: habitB?.title || 'Habit B',
        correlation: Number((lift - 1).toFixed(2)),
        lift: Number(lift.toFixed(2)),
        support: Number(support.toFixed(2)),
      };
    })
    .sort((a, b) => (b.lift || 0) - (a.lift || 0))
    .slice(0, 3);

  return correlations;
};

export const getWeeklyRecapStory = async (): Promise<WeeklyRecapStory | null> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');

  const now = new Date();
  const day = now.getDay() || 7; // treat Sunday as 7
  const endOfWeek = new Date(now);
  endOfWeek.setDate(endOfWeek.getDate() - day + 7);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfWeek = new Date(endOfWeek);
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const completionsSnapshot = await getDocs(
    query(
      collection(db, 'habitCompletions'),
      where('userId', '==', currentUser.uid),
      where('date', '>=', startOfWeek.toISOString().split('T')[0]),
      where('date', '<=', endOfWeek.toISOString().split('T')[0])
    )
  );

  if (completionsSnapshot.empty) {
    return null;
  }

  const completions = completionsSnapshot.docs.map((docSnap) => docSnap.data() as HabitCompletion);
  const totalCompletions = completions.length;
  const uniqueDays = new Set(completions.map((item) => item.date)).size;

  const categoryCounts: Record<string, number> = {};
  const habitsSnapshot = await getDocs(
    query(collection(db, 'habits'), where('userId', '==', currentUser.uid))
  );
  const habits = habitsSnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Habit));

  completions.forEach((completion) => {
    const habit = habits.find((h) => h.id === completion.habitId);
    if (!habit) return;
    categoryCounts[habit.category] = (categoryCounts[habit.category] || 0) + 1;
  });

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  const sparkline: number[] = [];
  const cursor = new Date(startOfWeek);
  const completionsGrouped: Record<string, number> = {};
  completions.forEach((completion) => {
    completionsGrouped[completion.date] = (completionsGrouped[completion.date] || 0) + 1;
  });

  while (cursor <= endOfWeek) {
    const iso = cursor.toISOString().split('T')[0];
    sparkline.push(completionsGrouped[iso] || 0);
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    weekStart: startOfWeek.toISOString(),
    weekEnd: endOfWeek.toISOString(),
    stats: [
      { label: 'Habits Completed', value: totalCompletions.toString(), icon: 'check-circle' },
      { label: 'Active Days', value: `${uniqueDays}/7`, icon: 'calendar-check' },
      {
        label: 'Top Category',
        value: topCategory ? `${topCategory[0]} (${topCategory[1]})` : 'Balanced',
        icon: 'star-outline',
      },
    ],
    highlights: [
      {
        title: 'Consistency',
        description: `You showed up ${uniqueDays} days this week!`,
        icon: 'fire',
      },
      {
        title: 'Momentum',
        description: `Best day was ${sparkline.indexOf(Math.max(...sparkline)) + 1} with ${Math.max(
          ...sparkline
        )} completions.`,
        icon: 'chart-line',
      },
    ],
    achievements: [],
    completionSparkline: sparkline,
  };
};
