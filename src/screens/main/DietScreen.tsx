import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { geminiService } from '@/services/api/geminiService';
import { DietPlan, RootStackParamList } from '@/types';
import { SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';
import { usePreferences } from '@/contexts/PreferencesContext';
import { AppTheme } from '@/constants/themes';
const createStyles = (palette: AppTheme['palette']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
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
      color: palette.textSecondary,
      textAlign: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
      gap: SPACING.md,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: palette.text,
    },
    emptySubtitle: {
      fontSize: FONT_SIZES.md,
      color: palette.textSecondary,
      textAlign: 'center',
    },
    generateButton: {
      marginTop: SPACING.lg,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.primary,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      borderRadius: RADIUS.lg,
    },
    generateButtonText: {
      color: '#FFFFFF',
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: SPACING.lg,
      paddingBottom: SPACING.sm,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: palette.text,
    },
    headerDate: {
      fontSize: FONT_SIZES.md,
      color: palette.textSecondary,
      marginTop: SPACING.xs,
    },
    dietTypeLabel: {
      marginTop: SPACING.sm,
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.md,
      backgroundColor: `${palette.primary}10`,
      color: palette.primary,
      borderRadius: RADIUS.full,
      fontWeight: '600',
      alignSelf: 'flex-start',
    },
    filterButton: {
      backgroundColor: `${palette.primary}10`,
      padding: SPACING.sm,
      borderRadius: RADIUS.full,
    },
    regenerateButton: {
      backgroundColor: `${palette.primary}10`,
      padding: SPACING.sm,
      borderRadius: RADIUS.full,
    },
    mealTypeFilter: {
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.sm,
      gap: SPACING.sm,
    },
    mealTypeChip: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.full,
      backgroundColor: palette.surface,
      marginRight: SPACING.sm,
      borderWidth: 1,
      borderColor: palette.border,
    },
    mealTypeChipActive: {
      backgroundColor: palette.primary,
    },
    mealTypeChipText: {
      color: palette.text,
      fontSize: FONT_SIZES.md,
      fontWeight: '500',
    },
    mealTypeChipTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    macrosCard: {
      margin: SPACING.lg,
      padding: SPACING.lg,
      backgroundColor: palette.card,
      borderRadius: RADIUS.xl,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
      gap: SPACING.lg,
    },
    macrosHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    macrosTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: palette.text,
    },
    caloriesBadge: {
      backgroundColor: `${palette.primary}15`,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
    },
    caloriesText: {
      color: palette.primary,
      fontSize: 24,
      fontWeight: '700',
    },
    caloriesLabel: {
      color: palette.textSecondary,
      fontSize: FONT_SIZES.sm,
    },
    macrosGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    macroItem: {
      flex: 1,
      alignItems: 'center',
      gap: SPACING.xs,
    },
    macroValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: palette.text,
    },
    macroLabel: {
      color: palette.textSecondary,
      fontSize: FONT_SIZES.sm,
    },
    mealsSection: {
      marginTop: SPACING.xl,
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.xxl,
      gap: SPACING.md,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: palette.text,
    },
    mealCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.card,
      padding: SPACING.lg,
      borderRadius: RADIUS.xl,
      gap: SPACING.md,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    mealIconContainer: {
      width: 56,
      height: 56,
      borderRadius: RADIUS.full,
      backgroundColor: `${palette.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    mealContent: {
      flex: 1,
      gap: SPACING.xs,
    },
    mealHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    mealType: {
      color: palette.textSecondary,
      fontSize: FONT_SIZES.sm,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    mealCalories: {
      color: palette.primary,
      fontSize: FONT_SIZES.sm,
      fontWeight: '600',
    },
    mealName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: palette.text,
    },
    mealDescription: {
      color: palette.textSecondary,
      fontSize: FONT_SIZES.sm,
    },
    mealMacros: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    macroTag: {
      backgroundColor: `${palette.primary}12`,
      color: palette.primary,
      paddingVertical: 4,
      paddingHorizontal: SPACING.sm,
      borderRadius: RADIUS.full,
      fontSize: FONT_SIZES.xs,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: '#00000066',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: palette.surface,
      borderTopLeftRadius: RADIUS.xxl,
      borderTopRightRadius: RADIUS.xxl,
      padding: SPACING.lg,
      gap: SPACING.md,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: palette.text,
    },
    filterSection: {
      gap: SPACING.sm,
    },
    filterLabel: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
      color: palette.text,
    },
    filterOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
    },
    filterOption: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.full,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
    },
    filterOptionActive: {
      borderColor: palette.primary,
      backgroundColor: `${palette.primary}20`,
    },
    filterOptionText: {
      color: palette.text,
      fontSize: FONT_SIZES.sm,
      fontWeight: '600',
    },
    filterOptionTextActive: {
      color: palette.primary,
    },
    applyButton: {
      marginTop: SPACING.md,
      backgroundColor: palette.primary,
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    applyButtonText: {
      color: '#FFFFFF',
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
    },
  });
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
              <Icon name="food-steak" size={24} color={themePalette.primary} />
              <Text style={styles.macroValue}>{dietPlan.macros.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Icon name="bread-slice" size={24} color={themePalette.secondary} />
              <Text style={styles.macroValue}>{dietPlan.macros.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Icon name="water" size={24} color={themePalette.accent} />
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
                <Icon name={getMealIcon(meal.type) as any} size={32} color={themePalette.primary} />
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
              <Icon name="chevron-right" size={20} color={themePalette.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {renderFilterModal()}
    </SafeAreaView>
  );
};

export default DietScreen;
