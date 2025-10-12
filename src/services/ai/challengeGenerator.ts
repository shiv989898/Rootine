import { Habit, DailyChallenge, ChallengeGoal, HabitCategory } from '@/types';
import { generateAIContent } from '../api/geminiService';

/**
 * Generate personalized challenges based on user's habits using AI
 */
export const generatePersonalizedChallenges = async (
  habits: Habit[]
): Promise<Partial<DailyChallenge>[]> => {
  if (habits.length === 0) {
    return getDefaultChallenges();
  }

  try {
    const habitsByCategory = habits.reduce((acc, habit) => {
      const category = habit.category || 'custom';
      if (!acc[category]) acc[category] = [];
      acc[category].push(habit);
      return acc;
    }, {} as Record<string, Habit[]>);

    const prompt = `Generate 5 personalized weekly challenges based on these user habits:

${Object.entries(habitsByCategory).map(([category, categoryHabits]) => 
  `${category.toUpperCase()}:\n${categoryHabits.map(h => `- ${h.title}${h.description ? ` (${h.description})` : ''}`).join('\n')}`
).join('\n\n')}

Return ONLY valid JSON array: [{"title":"string","description":"string","icon":"icon-name","goalType":"complete_habits","goalTarget":5,"points":100,"durationDays":7}]`;

    const response = await generateAIContent(prompt);
    const jsonStr = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const challenges = JSON.parse(jsonStr);

    return challenges.map((c: any) => ({
      type: 'weekly' as const,
      title: c.title,
      description: c.description,
      icon: c.icon,
      goal: { type: c.goalType, target: c.goalTarget, current: 0 },
      reward: { points: c.points || 100 },
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
    }));
  } catch (error) {
    return getHabitBasedChallenges(habits);
  }
};

const getHabitBasedChallenges = (habits: Habit[]): Partial<DailyChallenge>[] => {
  const challenges: Partial<DailyChallenge>[] = [];

  if (habits.length >= 3) {
    challenges.push({
      type: 'weekly',
      title: 'Habit Champion',
      description: `Complete ${Math.min(habits.length, 5)} habits this week`,
      icon: 'trophy-variant',
      goal: { type: 'complete_habits', target: Math.min(habits.length, 5) * 3, current: 0 },
      reward: { points: 150 },
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
    });
  }

  return challenges.slice(0, 5);
};

const getDefaultChallenges = (): Partial<DailyChallenge>[] => {
  return [
    {
      type: 'weekly',
      title: 'Getting Started',
      description: 'Create your first 3 habits',
      icon: 'rocket-launch',
      goal: { type: 'complete_habits', target: 3, current: 0 },
      reward: { points: 100 },
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ];
};
