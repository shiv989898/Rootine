import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserProfile, DietPlan, Meal, Recipe, Macros } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      // Add variety by including seed in prompt
      const varietyNote = seed ? `\n\nIMPORTANT: This is request #${seed}. Provide DIFFERENT meal suggestions than previous requests. Be creative with recipes and ingredients to ensure variety.` : '';
      
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      const dietData = JSON.parse(jsonMatch[0]);

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
      throw new Error('Failed to generate diet plan. Please try again.');
    }
  },

  // Generate recipe for a meal
  generateRecipe: async (mealName: string, servings: number, dietaryPreference: string, allergies: string[]): Promise<Recipe> => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      const recipeData = JSON.parse(jsonMatch[0]);

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
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `
Suggest 5 ${dietaryPreference} ${mealType} options that are:
- Under ${maxCalories} calories
- Quick and easy to prepare
- Nutritious and balanced

Provide only the meal names as a comma-separated list.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

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
