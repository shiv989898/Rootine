/**
 * Motivational quotes for habit building and personal growth
 */

export interface Quote {
  text: string;
  author: string;
  category: 'motivation' | 'habit' | 'success' | 'mindfulness' | 'fitness' | 'growth';
}

const QUOTES: Quote[] = [
  // Habit & Routine
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    category: "habit"
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    category: "habit"
  },
  {
    text: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
    category: "habit"
  },
  {
    text: "You'll never change your life until you change something you do daily.",
    author: "John C. Maxwell",
    category: "habit"
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
    category: "habit"
  },

  // Motivation
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "motivation"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "motivation"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    category: "motivation"
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
    category: "motivation"
  },
  {
    text: "Your limitation—it's only your imagination.",
    author: "Unknown",
    category: "motivation"
  },

  // Success
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "success"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "success"
  },
  {
    text: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller",
    category: "success"
  },
  {
    text: "I find that the harder I work, the more luck I seem to have.",
    author: "Thomas Jefferson",
    category: "success"
  },

  // Mindfulness & Growth
  {
    text: "The mind is everything. What you think you become.",
    author: "Buddha",
    category: "mindfulness"
  },
  {
    text: "Be present in all things and thankful for all things.",
    author: "Maya Angelou",
    category: "mindfulness"
  },
  {
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
    category: "growth"
  },
  {
    text: "Growth is painful. Change is painful. But nothing is as painful as staying stuck somewhere you don't belong.",
    author: "Mandy Hale",
    category: "growth"
  },
  {
    text: "Life is 10% what happens to you and 90% how you react to it.",
    author: "Charles R. Swindoll",
    category: "growth"
  },

  // Fitness & Health
  {
    text: "Take care of your body. It's the only place you have to live.",
    author: "Jim Rohn",
    category: "fitness"
  },
  {
    text: "The only bad workout is the one that didn't happen.",
    author: "Unknown",
    category: "fitness"
  },
  {
    text: "Your body can stand almost anything. It's your mind that you have to convince.",
    author: "Unknown",
    category: "fitness"
  },
  {
    text: "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.",
    author: "Rikki Rogers",
    category: "fitness"
  },

  // Additional Motivational
  {
    text: "Start where you are. Use what you have. Do what you can.",
    author: "Arthur Ashe",
    category: "motivation"
  },
  {
    text: "It's not whether you get knocked down, it's whether you get up.",
    author: "Vince Lombardi",
    category: "motivation"
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    category: "motivation"
  },
  {
    text: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair",
    category: "motivation"
  },
  {
    text: "Dream big and dare to fail.",
    author: "Norman Vaughan",
    category: "motivation"
  },
];

/**
 * Get a random quote
 */
export const getRandomQuote = (): Quote => {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
};

/**
 * Get a quote by category
 */
export const getQuoteByCategory = (category: Quote['category']): Quote => {
  const categoryQuotes = QUOTES.filter(q => q.category === category);
  return categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)] || getRandomQuote();
};

/**
 * Get daily quote (same quote for the whole day)
 */
export const getDailyQuote = (): Quote => {
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const index = seed % QUOTES.length;
  return QUOTES[index];
};

/**
 * Get all quotes
 */
export const getAllQuotes = (): Quote[] => {
  return QUOTES;
};
