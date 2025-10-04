import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '@/contexts/AuthContext';
import { geminiService } from '@/services/api/geminiService';
import { DietPlan, RootStackParamList } from '@/types';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';

type DietScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const DietScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<DietScreenNavigationProp>();
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTodaysPlan();
  }, []);

  const loadTodaysPlan = async () => {
    if (!user?.profile) return;

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const plan = await geminiService.generateDietPlan(user.profile, today);
      setDietPlan(plan);
    } catch (error: any) {
      console.error('Error loading diet plan:', error);
      Alert.alert('Error', 'Failed to load diet plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTodaysPlan();
    setRefreshing(false);
  };

  const handleGeneratePlan = async () => {
    if (!user?.profile) {
      Alert.alert('Profile Required', 'Please complete your profile to generate a diet plan.');
      return;
    }

    await loadTodaysPlan();
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return 'coffee';
      case 'lunch':
        return 'food';
      case 'dinner':
        return 'silverware-fork-knife';
      case 'snack':
        return 'cookie';
      default:
        return 'food-apple';
    }
  };

  const getMealTimeLabel = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return 'Breakfast';
      case 'lunch':
        return 'Lunch';
      case 'dinner':
        return 'Dinner';
      case 'snack':
        return 'Snack';
      default:
        return mealType;
    }
  };

  if (loading && !dietPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Generating your personalized diet plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!dietPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <Icon name="food-apple" size={80} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>No Diet Plan Yet</Text>
          <Text style={styles.emptySubtitle}>
            Generate your personalized AI-powered meal plan for today
          </Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGeneratePlan}
            disabled={loading}
          >
            <Icon name="sparkles" size={20} color="#fff" style={{ marginRight: SPACING.xs }} />
            <Text style={styles.generateButtonText}>Generate Diet Plan</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Today's Diet Plan</Text>
            <Text style={styles.headerDate}>
              {new Date(dietPlan.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.regenerateButton}
            onPress={handleGeneratePlan}
            disabled={loading}
          >
            <Icon name="refresh" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Macros Summary Card */}
        <View style={styles.macrosCard}>
          <View style={styles.macrosHeader}>
            <Text style={styles.macrosTitle}>Daily Totals</Text>
            <View style={styles.caloriesBadge}>
              <Text style={styles.caloriesText}>{dietPlan.totalCalories}</Text>
              <Text style={styles.caloriesLabel}>kcal</Text>
            </View>
          </View>

          <View style={styles.macrosGrid}>
            <View style={styles.macroItem}>
              <Icon name="food-steak" size={24} color={COLORS.primary} />
              <Text style={styles.macroValue}>{dietPlan.macros.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Icon name="bread-slice" size={24} color={COLORS.secondary} />
              <Text style={styles.macroValue}>{dietPlan.macros.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Icon name="water" size={24} color="#FFA726" />
              <Text style={styles.macroValue}>{dietPlan.macros.fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>
        </View>

        {/* Meals List */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Your Meals</Text>
          {dietPlan.meals.map((meal) => (
            <TouchableOpacity
              key={meal.id}
              style={styles.mealCard}
              onPress={() => {
                navigation.navigate('RecipeDetail', { meal });
              }}
            >
              <View style={styles.mealIconContainer}>
                <Icon name={getMealIcon(meal.type)} size={28} color={COLORS.primary} />
              </View>

              <View style={styles.mealContent}>
                <Text style={styles.mealType}>{getMealTimeLabel(meal.type)}</Text>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealDescription} numberOfLines={2}>
                  {meal.description}
                </Text>

                <View style={styles.mealMacros}>
                  <View style={styles.mealMacroItem}>
                    <Text style={styles.mealMacroValue}>{meal.calories}</Text>
                    <Text style={styles.mealMacroLabel}>cal</Text>
                  </View>
                  <View style={styles.mealMacroItem}>
                    <Text style={styles.mealMacroValue}>{meal.macros.protein}g</Text>
                    <Text style={styles.mealMacroLabel}>protein</Text>
                  </View>
                  <View style={styles.mealMacroItem}>
                    <Text style={styles.mealMacroValue}>{meal.macros.carbs}g</Text>
                    <Text style={styles.mealMacroLabel}>carbs</Text>
                  </View>
                  <View style={styles.mealMacroItem}>
                    <Text style={styles.mealMacroValue}>{meal.macros.fat}g</Text>
                    <Text style={styles.mealMacroLabel}>fat</Text>
                  </View>
                </View>
              </View>

              <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.round,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  regenerateButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  macrosCard: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    marginTop: SPACING.sm,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  macrosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  macrosTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  caloriesBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
  },
  caloriesText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 4,
  },
  caloriesLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  macroLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  mealsSection: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  mealIconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  mealContent: {
    flex: 1,
  },
  mealType: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mealName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  mealDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  mealMacros: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  mealMacroItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  mealMacroValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 2,
  },
  mealMacroLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
});

export default DietScreen;
