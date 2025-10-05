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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';
import { Habit, HabitCompletion } from '@/types';
import {
  getHabitById,
  getHabitCompletions,
  deleteHabit,
  updateHabit,
} from '@/services/firebase/habitService';
import { format } from 'date-fns';

type HabitDetailRouteProp = RouteProp<{ params: { habitId: string } }, 'params'>;

const HabitDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<HabitDetailRouteProp>();
  const { habitId } = route.params;

  const [habit, setHabit] = useState<Habit | null>(null);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabitDetails();
  }, [habitId]);

  const loadHabitDetails = async () => {
    try {
      setLoading(true);
      const [habitData, habitCompletions] = await Promise.all([
        getHabitById(habitId),
        getHabitCompletions(habitId),
      ]);

      if (habitData) {
        setHabit(habitData);
        setCompletions(habitCompletions);
      }
    } catch (error) {
      console.error('Error loading habit details:', error);
      Alert.alert('Error', 'Failed to load habit details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habitId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    // TODO: Navigate to Edit Habit screen
    console.log('Edit habit:', habitId);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!habit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Habit not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const completionRate =
    completions.length > 0
      ? Math.round(
          (habit.currentStreak / completions.length) * 100
        )
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
              <Icon name="pencil" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
              <Icon name="delete" size={24} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Habit Info */}
        <View style={[styles.iconCircle, { backgroundColor: habit.color }]}>
          <Icon name={habit.icon} size={48} color={COLORS.white} />
        </View>

        <Text style={styles.title}>{habit.title}</Text>
        {habit.description && (
          <Text style={styles.description}>{habit.description}</Text>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Icon name="fire" size={32} color={COLORS.orange} />
            <Text style={styles.statValue}>{habit.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>

          <View style={styles.statBox}>
            <Icon name="trophy" size={32} color={COLORS.warning} />
            <Text style={styles.statValue}>{habit.longestStreak}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>

          <View style={styles.statBox}>
            <Icon name="check-circle" size={32} color={COLORS.success} />
            <Text style={styles.statValue}>{completions.length}</Text>
            <Text style={styles.statLabel}>Total Completions</Text>
          </View>

          <View style={styles.statBox}>
            <Icon name="percent" size={32} color={COLORS.info} />
            <Text style={styles.statValue}>{completionRate}%</Text>
            <Text style={styles.statLabel}>Completion Rate</Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <View style={styles.detailRow}>
            <Icon name="tag" size={20} color={COLORS.textSecondary} />
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{habit.category}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="calendar-repeat" size={20} color={COLORS.textSecondary} />
            <Text style={styles.detailLabel}>Frequency</Text>
            <Text style={styles.detailValue}>
              {habit.recurrence.type === 'custom' && habit.recurrence.daysOfWeek
                ? `${habit.recurrence.daysOfWeek.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}`
                : habit.recurrence.type}
            </Text>
          </View>

          {habit.reminderEnabled && habit.reminderTime && (
            <View style={styles.detailRow}>
              <Icon name="bell" size={20} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>Reminder</Text>
              <Text style={styles.detailValue}>{habit.reminderTime}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Icon name="calendar-clock" size={20} color={COLORS.textSecondary} />
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>
              {format(new Date(habit.createdAt), 'MMM d, yyyy')}
            </Text>
          </View>
        </View>

        {/* Recent Completions */}
        {completions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Completions</Text>
            {completions.slice(0, 10).map((completion, index) => (
              <View style={styles.completionItem} key={`${completion.id}-${index}`}>
                <Icon
                  name="check-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={styles.completionDate}>
                  {format(new Date(completion.date), 'EEEE, MMM d, yyyy')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.error,
    marginBottom: SPACING.lg,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    padding: SPACING.sm,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  statBox: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  detailLabel: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  completionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  completionDate: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
});

export default HabitDetailScreen;
