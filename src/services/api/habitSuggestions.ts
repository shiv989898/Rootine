import { HabitCategory } from '@/types';

export interface HabitSuggestion {
  id: string;
  title: string;
  description: string;
  category: HabitCategory;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  benefits: string[];
  tips: string;
}

const HABIT_SUGGESTIONS: HabitSuggestion[] = [
  // Health & Fitness
  {
    id: 'morning_walk',
    title: 'Morning Walk',
    description: '15-minute walk after waking up',
    category: 'fitness',
    icon: 'walk',
    difficulty: 'easy',
    benefits: ['Boosts energy', 'Improves mood', 'Better circulation'],
    tips: 'Start with 10 minutes if 15 feels too long',
  },
  {
    id: 'drink_water',
    title: 'Drink Water',
    description: 'Drink 8 glasses of water daily',
    category: 'health',
    icon: 'water',
    difficulty: 'easy',
    benefits: ['Better hydration', 'Clear skin', 'More energy'],
    tips: 'Keep a water bottle with you at all times',
  },
  {
    id: 'workout',
    title: 'Daily Workout',
    description: '30 minutes of exercise',
    category: 'fitness',
    icon: 'dumbbell',
    difficulty: 'medium',
    benefits: ['Build strength', 'Lose weight', 'Feel energized'],
    tips: 'Mix cardio and strength training for best results',
  },
  {
    id: 'stretching',
    title: 'Stretching',
    description: '10 minutes of stretching',
    category: 'fitness',
    icon: 'yoga',
    difficulty: 'easy',
    benefits: ['Flexibility', 'Reduced pain', 'Better posture'],
    tips: 'Focus on major muscle groups',
  },
  {
    id: 'sleep_schedule',
    title: 'Consistent Sleep',
    description: 'Sleep 7-8 hours at same time',
    category: 'health',
    icon: 'sleep',
    difficulty: 'medium',
    benefits: ['Better energy', 'Improved focus', 'Stronger immune system'],
    tips: 'Set a bedtime alarm 30 minutes before sleep',
  },

  // Nutrition
  {
    id: 'healthy_breakfast',
    title: 'Healthy Breakfast',
    description: 'Eat a nutritious breakfast daily',
    category: 'nutrition',
    icon: 'food-apple',
    difficulty: 'easy',
    benefits: ['More energy', 'Better metabolism', 'Improved focus'],
    tips: 'Prep ingredients the night before',
  },
  {
    id: 'vegetables',
    title: 'Eat Vegetables',
    description: '3-5 servings of vegetables',
    category: 'nutrition',
    icon: 'food-variant',
    difficulty: 'medium',
    benefits: ['Vitamins and minerals', 'Better digestion', 'Weight management'],
    tips: 'Add veggies to every meal',
  },
  {
    id: 'meal_prep',
    title: 'Meal Prep',
    description: 'Prepare meals for the week',
    category: 'nutrition',
    icon: 'chef-hat',
    difficulty: 'hard',
    benefits: ['Save time', 'Eat healthier', 'Save money'],
    tips: 'Start with just lunches, then expand',
  },
  {
    id: 'reduce_sugar',
    title: 'Cut Sugar',
    description: 'Limit added sugar intake',
    category: 'nutrition',
    icon: 'candy-off',
    difficulty: 'medium',
    benefits: ['Better energy', 'Weight loss', 'Reduced cravings'],
    tips: 'Replace sugary drinks with water or tea',
  },

  // Mindfulness
  {
    id: 'meditation',
    title: 'Meditation',
    description: '10 minutes of meditation',
    category: 'mindfulness',
    icon: 'meditation',
    difficulty: 'medium',
    benefits: ['Reduced stress', 'Better focus', 'Emotional balance'],
    tips: 'Use a guided meditation app to start',
  },
  {
    id: 'gratitude_journal',
    title: 'Gratitude Journal',
    description: 'Write 3 things you\'re grateful for',
    category: 'mindfulness',
    icon: 'notebook',
    difficulty: 'easy',
    benefits: ['Positive mindset', 'Better mood', 'Life satisfaction'],
    tips: 'Keep journal by your bedside',
  },
  {
    id: 'deep_breathing',
    title: 'Deep Breathing',
    description: '5 minutes of breathing exercises',
    category: 'mindfulness',
    icon: 'cloud',
    difficulty: 'easy',
    benefits: ['Reduced anxiety', 'Better sleep', 'Lower blood pressure'],
    tips: 'Try 4-7-8 breathing technique',
  },
  {
    id: 'digital_detox',
    title: 'Phone-Free Time',
    description: '1 hour without phone before bed',
    category: 'mindfulness',
    icon: 'cellphone-off',
    difficulty: 'medium',
    benefits: ['Better sleep', 'Less stress', 'More present'],
    tips: 'Charge phone outside bedroom',
  },

  // Productivity & Learning
  {
    id: 'read_daily',
    title: 'Daily Reading',
    description: 'Read for 20 minutes',
    category: 'learning',
    icon: 'book-open-page-variant',
    difficulty: 'easy',
    benefits: ['Knowledge', 'Better focus', 'Stress reduction'],
    tips: 'Keep book in visible spot',
  },
  {
    id: 'learn_skill',
    title: 'Learn Something New',
    description: '30 minutes learning',
    category: 'learning',
    icon: 'school',
    difficulty: 'medium',
    benefits: ['Personal growth', 'Career advancement', 'Mental stimulation'],
    tips: 'Use online courses or tutorials',
  },
  {
    id: 'plan_day',
    title: 'Plan Your Day',
    description: 'Plan tomorrow each evening',
    category: 'productivity',
    icon: 'calendar-check',
    difficulty: 'easy',
    benefits: ['Better organization', 'Less stress', 'More productive'],
    tips: 'Use a simple to-do list',
  },
  {
    id: 'pomodoro',
    title: 'Focused Work',
    description: '2 hours of deep work',
    category: 'productivity',
    icon: 'timer',
    difficulty: 'medium',
    benefits: ['More done', 'Better quality', 'Less distractions'],
    tips: 'Use 25-minute focus blocks',
  },
  {
    id: 'journal',
    title: 'Daily Journal',
    description: 'Write in journal for 10 minutes',
    category: 'mindfulness',
    icon: 'pencil',
    difficulty: 'easy',
    benefits: ['Self-awareness', 'Stress relief', 'Track progress'],
    tips: 'Write freely without judgment',
  },

  // Social
  {
    id: 'connect_friend',
    title: 'Connect with Friend',
    description: 'Message or call a friend',
    category: 'social',
    icon: 'phone',
    difficulty: 'easy',
    benefits: ['Stronger relationships', 'Better mood', 'Support system'],
    tips: 'Schedule regular catch-ups',
  },
  {
    id: 'family_time',
    title: 'Quality Family Time',
    description: '30 minutes with family',
    category: 'social',
    icon: 'account-group',
    difficulty: 'easy',
    benefits: ['Stronger bonds', 'Better communication', 'Shared memories'],
    tips: 'No phones during this time',
  },
  {
    id: 'help_someone',
    title: 'Help Someone',
    description: 'Do something kind for others',
    category: 'social',
    icon: 'hand-heart',
    difficulty: 'easy',
    benefits: ['Feel good', 'Build connections', 'Make impact'],
    tips: 'Small acts count too',
  },
];

/**
 * Get all habit suggestions
 */
export const getAllSuggestions = (): HabitSuggestion[] => {
  return HABIT_SUGGESTIONS;
};

/**
 * Get suggestions by category
 */
export const getSuggestionsByCategory = (category: HabitCategory): HabitSuggestion[] => {
  return HABIT_SUGGESTIONS.filter(s => s.category === category);
};

/**
 * Get suggestions by difficulty
 */
export const getSuggestionsByDifficulty = (
  difficulty: 'easy' | 'medium' | 'hard'
): HabitSuggestion[] => {
  return HABIT_SUGGESTIONS.filter(s => s.difficulty === difficulty);
};

/**
 * Get personalized suggestions based on user's existing habits
 */
export const getPersonalizedSuggestions = (
  existingCategories: HabitCategory[]
): HabitSuggestion[] => {
  // Count existing habits by category
  const categoryCount: { [key: string]: number } = {};
  existingCategories.forEach(cat => {
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  // Find underrepresented categories
  const allCategories: HabitCategory[] = ['health', 'fitness', 'nutrition', 'mindfulness', 'productivity', 'learning', 'social'];
  const underrepresented = allCategories
    .filter(cat => (categoryCount[cat] || 0) < 2)
    .sort((a, b) => (categoryCount[a] || 0) - (categoryCount[b] || 0));

  // Get suggestions from underrepresented categories
  const suggestions: HabitSuggestion[] = [];
  underrepresented.forEach(cat => {
    const catSuggestions = getSuggestionsByCategory(cat);
    suggestions.push(...catSuggestions.slice(0, 2));
  });

  // Add some easy suggestions to get started
  const easySuggestions = getSuggestionsByDifficulty('easy');
  suggestions.push(...easySuggestions.slice(0, 3));

  // Remove duplicates and limit to 10
  const unique = Array.from(new Set(suggestions.map(s => s.id)))
    .map(id => suggestions.find(s => s.id === id)!)
    .slice(0, 10);

  return unique;
};

/**
 * Get random suggestions
 */
export const getRandomSuggestions = (count: number = 5): HabitSuggestion[] => {
  const shuffled = [...HABIT_SUGGESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
