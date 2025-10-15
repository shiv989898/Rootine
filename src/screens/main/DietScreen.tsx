import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { geminiService } from '@/services/api/geminiService';
import { DietPlan, RootStackParamList } from '@/types';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';

type DietScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type DietType = 'vegetarian' | 'non-vegetarian' | 'vegan' | 'pescatarian';
type MealType = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snacks';

const DietScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<DietScreenNavigationProp>();
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDietType, setSelectedDietType] = useState<DietType>('vegetarian');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTodaysPlan();
  }, []);

  const loadTodaysPlan = async (forceNew: boolean = false) => {
    if (!user?.profile) return;

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      // Add random seed to ensure variety on refresh
      const seed = forceNew ? Date.now() : undefined;
      const plan = await geminiService.generateDietPlan(
        user.profile,
        today,
        selectedDietType,
        selectedMealType,
        seed
      );
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
    await loadTodaysPlan(true); // Force new variety
    setRefreshing(false);
  };

  const handleGeneratePlan = async () => {
    if (!user?.profile) {
      Alert.alert('Profile Required', 'Please complete your profile to generate a diet plan.');
      return;
    }

    await loadTodaysPlan(true);
    setShowFilters(false);
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
      case 'snacks':
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
      case 'snacks':
        return 'Snacks';
      default:
        return mealType;
    }
  };

  const filteredMeals = selectedMealType === 'all' 
    ? dietPlan?.meals 
    : dietPlan?.meals.filter(meal => meal.type === selectedMealType);

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Customize Your Diet Plan</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Diet Type Selection */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Diet Type</Text>
            <View style={styles.filterOptions}>
              {(['vegetarian', 'non-vegetarian', 'vegan', 'pescatarian'] as DietType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    selectedDietType === type && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedDietType(type)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedDietType === type && styles.filterOptionTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Meal Type Selection */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Meal Type</Text>
            <View style={styles.filterOptions}>
              {(['all', 'breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    selectedMealType === type && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedMealType(type)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedMealType === type && styles.filterOptionTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleGeneratePlan}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="auto-fix" size={20} color="#fff" style={{ marginRight: SPACING.xs }} />
                <Text style={styles.applyButtonText}>Generate New Plan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading && !dietPlan) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Generating your personalized diet plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!dietPlan) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
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
            onPress={() => setShowFilters(true)}
            disabled={loading}
          >
            <Icon name="auto-fix" size={20} color="#fff" style={{ marginRight: SPACING.xs }} />
            <Text style={styles.generateButtonText}>Generate Diet Plan</Text>
          </TouchableOpacity>
        </ScrollView>
        {renderFilterModal()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Today's Diet Plan</Text>
            <Text style={styles.headerDate}>
              {new Date(dietPlan.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.dietTypeLabel}>{selectedDietType}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: SPACING.xs }}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Icon name="tune" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.regenerateButton}
              onPress={handleRefresh}
              disabled={loading || refreshing}
            >
              <Icon name="refresh" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Meal Type Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.mealTypeFilter}
        >
          {(['all', 'breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.mealTypeChip,
                selectedMealType === type && styles.mealTypeChipActive,
              ]}
              onPress={() => setSelectedMealType(type)}
            >
              <Text
                style={[
                  styles.mealTypeChipText,
                  selectedMealType === type && styles.mealTypeChipTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
          <Text style={styles.sectionTitle}>
            {selectedMealType === 'all' ? 'Your Meals' : `Your ${getMealTimeLabel(selectedMealType)}`}
          </Text>
          {filteredMeals?.map((meal) => (
            <TouchableOpacity
              key={meal.id}
              style={styles.mealCard}
              onPress={() => {
                navigation.navigate('RecipeDetail', { meal });
              }}
            >
              <View style={styles.mealIconContainer}>
                <Icon name={getMealIcon(meal.type) as any} size={32} color={COLORS.primary} />
              </View>
              <View style={styles.mealContent}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealType}>{getMealTimeLabel(meal.type)}</Text>
                  <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                </View>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealDescription} numberOfLines={2}>
                  {meal.description}
                </Text>
                <View style={styles.mealMacros}>
                  <Text style={styles.macroTag}>P: {meal.macros.protein}g</Text>
                  <Text style={styles.macroTag}>C: {meal.macros.carbs}g</Text>
                  <Text style={styles.macroTag}>F: {meal.macros.fat}g</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {renderFilterModal()}
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
    fontSize: FONT_SIZES.xl,
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.round,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  dietTypeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    textTransform: 'capitalize',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regenerateButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealTypeFilter: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  mealTypeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.card,
    marginRight: SPACING.sm,
  },
  mealTypeChipActive: {
    backgroundColor: COLORS.primary,
  },
  mealTypeChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  mealTypeChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  macrosCard: {
    backgroundColor: COLORS.card,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
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
  },
  caloriesText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  caloriesLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  macroLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  mealsSection: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  mealIconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  mealContent: {
    flex: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  mealType: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  mealCalories: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  mealName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  mealDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  mealMacros: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  macroTag: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filterSection: {
    marginBottom: SPACING.xl,
  },
  filterLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  filterOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  applyButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

export default DietScreen;
