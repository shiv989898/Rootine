import Constants from 'expo-constants';
import { UserProfile, DietPlan, Meal, Recipe, Macros } from '@/types';

const GEMINI_MODEL = 'gemini-2.0-flash-exp';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const resolveApiKey = (): string => {
  const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
  const extraKey =
    (Constants?.expoConfig as any)?.extra?.geminiApiKey ??
    (Constants?.manifest2 as any)?.extra?.expoClient?.extra?.geminiApiKey ??
    (Constants?.manifest as any)?.extra?.geminiApiKey ??
    '';

  return envKey || extraKey || '';
};

const callGemini = async (prompt: string) => {
  const apiKey = resolveApiKey();

  if (!apiKey) {
    throw new Error('Missing Gemini API key. Please configure EXPO_PUBLIC_GEMINI_API_KEY.');
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const message = errorPayload?.error?.message || response.statusText || 'Unknown Gemini error';
    throw new Error(`Gemini API request failed: ${message}`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((part: { text?: string }) => part?.text ?? '')
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Gemini returned no content.');
  }

  return text;
};

const extractJson = (payload: string) => {
  const jsonMatch = payload.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse structured response from Gemini.');
  }

  return JSON.parse(jsonMatch[0]);
};

const buildFallbackPlan = (dietType: string): DietPlan => {
  const now = Date.now();
  const simpleMeals: Meal[] = [
    {
      id: `meal_${now}_0`,
      type: 'breakfast',
      name: 'Power Oats Bowl',
      description: 'Rolled oats with almond butter, berries, and chia for a slow-release breakfast.',
      calories: 420,
      macros: { protein: 18, carbs: 55, fat: 14 },
    },
    {
      id: `meal_${now}_1`,
      type: 'lunch',
      name: 'Rainbow Macro Bowl',
      description: 'Quinoa, roasted veggies, greens, and tahini dressing keep you energized.',
      calories: 540,
      macros: { protein: 24, carbs: 62, fat: 18 },
    },
    {
      id: `meal_${now}_2`,
      type: 'dinner',
      name: 'Protein-Packed Stir Fry',
      description: 'Stir-fried tofu, broccoli, peppers, and brown rice with ginger soy glaze.',
      calories: 580,
      macros: { protein: 30, carbs: 64, fat: 16 },
    },
    {
      id: `meal_${now}_3`,
      type: 'snack',
      name: 'Recovery Smoothie',
      description: 'Banana, spinach, plant protein, and oat milk blended smooth.',
      calories: 260,
      macros: { protein: 18, carbs: 28, fat: 7 },
    },
  ];

  return {
    id: `diet_${now}`,
    userId: '',
    date: new Date().toISOString().split('T')[0],
    meals: simpleMeals,
    totalCalories: simpleMeals.reduce((sum, meal) => sum + meal.calories, 0),
    macros: simpleMeals.reduce(
      (totals, meal) => ({
        protein: totals.protein + meal.macros.protein,
        carbs: totals.carbs + meal.macros.carbs,
        fat: totals.fat + meal.macros.fat,
      }),
      { protein: 0, carbs: 0, fat: 0 }
    ),
    createdAt: new Date(),
  };
};

export const geminiService = {
  // Generate personalized diet plan
  generateDietPlan: async (
    profile: UserProfile, 
    date: string,
    dietType: string = 'vegetarian',
    mealType: string = 'all',
    seed?: number
  ): Promise<DietPlan> => {
    try {
      // Add variety by including seed in prompt
      const varietyNote = seed
        ? `\n\nIMPORTANT: This is request #${seed}. Provide DIFFERENT meal suggestions than previous requests. Be creative with recipes and ingredients to ensure variety.`
        : '';
      
      // Determine which meals to include
      let mealsToInclude = '';
      if (mealType === 'all') {
        mealsToInclude = `
1. Breakfast
2. Mid-morning snack
3. Lunch
4. Evening snack
5. Dinner`;
      } else {
        mealsToInclude = `Only provide ${mealType} options (provide 2-3 variations)`;
      }

  const prompt = `
You are a professional nutritionist. Create a personalized ${dietType} diet plan for today (${date}).

User Profile:
- Age: ${profile.age || 'Not specified'}
- Weight: ${profile.weight ? `${profile.weight} kg` : 'Not specified'}
- Height: ${profile.height ? `${profile.height} cm` : 'Not specified'}
- Gender: ${profile.gender || 'Not specified'}
- Activity Level: ${profile.activityLevel}
- Dietary Preference: ${dietType}
- Allergies: ${profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None'}
- Goals: ${profile.goals.length > 0 ? profile.goals.join(', ') : 'General health'}

Please provide a meal plan with:
${mealsToInclude}

For each meal, provide:
- Name of the dish
- Brief description (1 sentence)
- Estimated calories
- Macros (protein, carbs, fat in grams)

Format the response as JSON with this structure:
{
  "meals": [
    {
      "type": "breakfast",
      "name": "Meal Name",
      "description": "Brief description",
      "calories": 400,
      "macros": {
        "protein": 15,
        "carbs": 60,
        "fat": 10
      }
    }
  ],
  "totalCalories": 2000,
  "macros": {
    "protein": 80,
    "carbs": 250,
    "fat": 60
  }
}

Make sure the meals are:
- ${dietType === 'vegan' ? 'Completely plant-based (vegan)' : dietType === 'non-vegetarian' ? 'Can include meat, fish, and eggs' : dietType === 'pescatarian' ? 'Fish and plant-based (no meat)' : 'Vegetarian'}
- Free from: ${profile.allergies.length > 0 ? profile.allergies.join(', ') : 'No restrictions'}
- Suitable for ${profile.activityLevel} activity level
- Nutritionally balanced${varietyNote}
`;

      const text = await callGemini(prompt);

      const dietData = extractJson(text);

      const meals: Meal[] = dietData.meals.map((meal: any, index: number) => ({
        id: `meal_${Date.now()}_${index}`,
        type: meal.type,
        name: meal.name,
        description: meal.description,
        calories: meal.calories,
        macros: meal.macros,
      }));

      return {
        id: `diet_${Date.now()}`,
        userId: '', // Will be set by the caller
        date,
        meals,
        totalCalories: dietData.totalCalories,
        macros: dietData.macros,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Generate diet plan error:', error);
      // Provide a graceful fallback so the user always sees content in production APKs
      return buildFallbackPlan(dietType);
    }
  },

  // Generate recipe for a meal
  generateRecipe: async (mealName: string, servings: number, dietaryPreference: string, allergies: string[]): Promise<Recipe> => {
    try {
      const prompt = `
You are a professional chef specializing in ${dietaryPreference} cuisine. Create a detailed recipe for: ${mealName}

Requirements:
- Dietary preference: ${dietaryPreference}
- Servings: ${servings}
- Allergies to avoid: ${allergies.length > 0 ? allergies.join(', ') : 'None'}

Provide:
1. List of ingredients with exact quantities
2. Step-by-step cooking instructions
3. Preparation time and cooking time (in minutes)
4. Difficulty level (easy/medium/hard)
5. Nutrition per serving (calories, protein, carbs, fat in grams)
6. Optional variations or tips

Format as JSON:
{
  "name": "${mealName}",
  "servings": ${servings},
  "prepTime": 15,
  "cookTime": 30,
  "difficulty": "medium",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": "1",
      "unit": "cup"
    }
  ],
  "instructions": [
    "Step 1 description",
    "Step 2 description"
  ],
  "nutritionPerServing": {
    "calories": 400,
    "protein": 15,
    "carbs": 60,
    "fat": 10
  },
  "tags": ["healthy", "quick", "vegetarian"],
  "variations": [
    "Optional variation 1",
    "Optional variation 2"
  ]
}
`;

  const text = await callGemini(prompt);

  const recipeData = extractJson(text);

      return {
        id: `recipe_${Date.now()}`,
        mealId: '', // Will be set by the caller
        name: recipeData.name,
        servings: recipeData.servings,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        difficulty: recipeData.difficulty,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        nutritionPerServing: recipeData.nutritionPerServing,
        tags: recipeData.tags,
        variations: recipeData.variations,
      };
    } catch (error) {
      console.error('Generate recipe error:', error);
      throw new Error('Failed to generate recipe. Please try again.');
    }
  },

  // Get meal suggestions based on preferences
  getMealSuggestions: async (mealType: string, dietaryPreference: string, maxCalories: number): Promise<string[]> => {
    try {
      const prompt = `
Suggest 5 ${dietaryPreference} ${mealType} options that are:
- Under ${maxCalories} calories
- Quick and easy to prepare
- Nutritious and balanced

Provide only the meal names as a comma-separated list.
`;

      const text = await callGemini(prompt);

      return text
        .split(',')
        .map((meal: string) => meal.trim())
        .filter((meal: string) => meal.length > 0)
        .slice(0, 5);
    } catch (error) {
      console.error('Get meal suggestions error:', error);
      return [];
    }
  },
};
