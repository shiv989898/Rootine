import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { geminiService } from '@/services/api/geminiService';
import { Recipe } from '@/types';
import { RootStackParamList } from '@/types';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';

type RecipeDetailRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;
type RecipeDetailNavigationProp = StackNavigationProp<RootStackParamList, 'RecipeDetail'>;

const RecipeDetailScreen = () => {
  const route = useRoute<RecipeDetailRouteProp>();
  const navigation = useNavigation<RecipeDetailNavigationProp>();
  const { meal } = route.params;
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipe();
  }, [meal]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      
      // If meal already has a recipe, use it
      if (meal.recipe) {
        setRecipe(meal.recipe);
        setLoading(false);
        return;
      }

      // Otherwise, generate a recipe using AI
      const recipeData = await geminiService.generateRecipe(
        meal.name,
        4, // Default servings
        user?.profile?.dietaryPreference || 'vegetarian',
        user?.profile?.allergies || []
      );
      
      setRecipe({ ...recipeData, mealId: meal.id });
    } catch (error: any) {
      console.error('Error loading recipe:', error);
      Alert.alert('Error', 'Failed to load recipe details.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#4CAF50';
      case 'medium':
        return '#FFA726';
      case 'hard':
        return '#EF5350';
      default:
        return COLORS.textSecondary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="alert-circle" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Recipe not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recipe</Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Icon name="heart-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Recipe Title */}
        <View style={styles.titleSection}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          
          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Icon name="clock-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>
                {recipe.prepTime + recipe.cookTime} min
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="chef-hat" size={20} color={getDifficultyColor(recipe.difficulty)} />
              <Text style={[styles.metaText, { color: getDifficultyColor(recipe.difficulty) }]}>
                {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="account-group" size={20} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{recipe.servings} servings</Text>
            </View>
          </View>

          {/* Time Breakdown */}
          <View style={styles.timeContainer}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Prep</Text>
              <Text style={styles.timeValue}>{recipe.prepTime} min</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Cook</Text>
              <Text style={styles.timeValue}>{recipe.cookTime} min</Text>
            </View>
          </View>
        </View>

        {/* Nutrition Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Per Serving</Text>
          <View style={styles.nutritionCard}>
            <View style={styles.nutritionItem}>
              <Icon name="fire" size={24} color="#FF6B6B" />
              <Text style={styles.nutritionValue}>{recipe.nutritionPerServing.calories}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionDivider} />
            <View style={styles.nutritionItem}>
              <Icon name="food-steak" size={24} color={COLORS.primary} />
              <Text style={styles.nutritionValue}>{recipe.nutritionPerServing.protein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionDivider} />
            <View style={styles.nutritionItem}>
              <Icon name="bread-slice" size={24} color={COLORS.secondary} />
              <Text style={styles.nutritionValue}>{recipe.nutritionPerServing.carbs}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionDivider} />
            <View style={styles.nutritionItem}>
              <Icon name="water" size={24} color="#FFA726" />
              <Text style={styles.nutritionValue}>{recipe.nutritionPerServing.fat}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.ingredientsCard}>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Icon name="checkbox-blank-circle" size={8} color={COLORS.primary} />
                <Text style={styles.ingredientText}>
                  <Text style={styles.ingredientAmount}>
                    {ingredient.amount} {ingredient.unit}
                  </Text>
                  {' '}
                  {ingredient.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.instructionsCard}>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {recipe.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Variations */}
        {recipe.variations && recipe.variations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Variations</Text>
            <View style={styles.variationsCard}>
              {recipe.variations.map((variation, index) => (
                <View key={index} style={styles.variationItem}>
                  <Icon name="lightbulb-outline" size={20} color={COLORS.secondary} />
                  <Text style={styles.variationText}>{variation}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    padding: SPACING.lg,
  },
  recipeName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  timeContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  section: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  nutritionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nutritionItem: {
    flex: 1,
    alignItems: 'center',
  },
  nutritionDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  nutritionValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  nutritionLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ingredientsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  ingredientText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1,
  },
  ingredientAmount: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  instructionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructionText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  variationsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  variationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  variationText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },
});

export default RecipeDetailScreen;
