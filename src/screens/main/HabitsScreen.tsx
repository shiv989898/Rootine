import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';
import { usePreferences } from '@/contexts/PreferencesContext';
import { AppTheme } from '@/constants/themes';
import { Habit } from '@/types';
import { 
  getUserHabits, 
  getHabitStatistics, 
  subscribeToHabits,
  toggleHabitCompletion,
  getTodaysCompletedHabits,
  updateHabit,
} from '@/services/firebase/habitService';
import { HabitCard } from '@/components/habits/HabitCard';
import { CreateEditHabitModal } from '@/components/habits/CreateEditHabitModal';
import { ReminderSettingsModal } from '@/components/habits/ReminderSettingsModal';
import { initializeNotifications } from '@/services/notifications/notificationService';
import {
  computeNextReminderDate,
  formatReminderDateTime,
  formatReminderRelativeTime,
} from '@/utils/reminders';
import { ALL_REMINDER_DAYS, DEFAULT_REMINDER_LEAD_MINUTES } from '@/constants/reminders';
import { logHabitMood } from '@/services/firebase/moodService';
import MoodRatingModal from '@/components/mood/MoodRatingModal';

const DEFAULT_REMINDER_TIME = '09:00';
const FILTER_OPTIONS = [
  { key: 'all' as const, label: 'All' },
  { key: 'reminders' as const, label: 'Reminders' },
  { key: 'completed' as const, label: 'Completed' },
];

const parseReminderTime = (time?: string | null) => {
  const base = new Date();
  const target = time || DEFAULT_REMINDER_TIME;
  const [hours, minutes] = target.split(':').map(Number);
  base.setHours(hours ?? 9, minutes ?? 0, 0, 0);
  return base;
};

const formatReminderTime = (date: Date) => {
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
};

const HabitsScreen = () => {
  const { moodTrackingEnabled, themePalette } = usePreferences();
  const styles = useMemo(() => createStyles(themePalette), [themePalette]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'reminders' | 'completed'>('all');
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    totalCompletions: 0,
    bestStreak: 0,
  });
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [moodHabit, setMoodHabit] = useState<Habit | null>(null);

  const filteredHabits = useMemo(() => {
    if (activeFilter === 'reminders') {
      return habits.filter((habit) => habit.reminderEnabled);
    }

    if (activeFilter === 'completed') {
      return habits.filter((habit) => completedToday.includes(habit.id));
    }

    return habits;
  }, [activeFilter, completedToday, habits]);

  const upcomingReminders = useMemo(() => {
    return habits
      .map((habit) => {
        const next = computeNextReminderDate(habit);
        if (!next) {
          return null;
        }

        return {
          habit,
          next,
        };
      })
      .filter((item): item is { habit: Habit; next: Date } => item !== null)
      .sort((a, b) => a.next.getTime() - b.next.getTime())
      .slice(0, 3);
  }, [habits]);

  // Initialize notifications on mount
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Load habits on mount
  useEffect(() => {
    loadHabits();
    loadStats();
    loadCompletedToday();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToHabits(
      (updatedHabits) => {
        setHabits(updatedHabits);
        setLoading(false);
      },
      (error) => {
        console.error('Habits subscription error:', error);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadHabits = async () => {
    try {
      const userHabits = await getUserHabits();
      setHabits(userHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statistics = await getHabitStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadCompletedToday = async () => {
    try {
      const completed = await getTodaysCompletedHabits();
      setCompletedToday(completed);
    } catch (error) {
      console.error('Error loading completed habits:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadHabits(), loadStats(), loadCompletedToday()]);
    setRefreshing(false);
  };

  const handleToggleHabit = async (habitId: string) => {
    const wasCompleted = completedToday.includes(habitId);
    try {
      await toggleHabitCompletion(habitId);
      // Reload stats and completed list
      await Promise.all([loadStats(), loadCompletedToday()]);

      if (moodTrackingEnabled && !wasCompleted) {
        const habitDetails = habits.find((habit) => habit.id === habitId) || null;
        if (habitDetails) {
          setMoodHabit(habitDetails);
          setMoodModalVisible(true);
        }
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
      Alert.alert('Update failed', 'We could not update this habit right now. Please try again.');
    }
  };

  const handleCreateHabit = () => {
    setModalVisible(true);
  };

  const handleModalSuccess = async () => {
    // Reload habits and stats after creating/editing
    await Promise.all([loadHabits(), loadStats(), loadCompletedToday()]);
  };

  const handleHabitPress = (habit: Habit) => {
    // TODO: Navigate to Habit Detail screen
    console.log('Habit pressed:', habit.title);
  };

  const handleReminderPress = (habit: Habit) => {
    setSelectedHabit(habit);
    setReminderModalVisible(true);
  };

  const handleReminderSave = async (reminderSettings: {
    enabled: boolean;
    time: Date;
    days: number[];
    leadMinutes: number;
    notificationIds: string[];
  }) => {
    if (!selectedHabit) return;

    try {
      const updates = {
        reminderEnabled: reminderSettings.enabled,
        reminderTime: reminderSettings.enabled
          ? formatReminderTime(reminderSettings.time)
          : null,
        reminderDays: reminderSettings.enabled
          ? [...reminderSettings.days].sort((a, b) => a - b)
          : [],
        reminderLeadMinutes: reminderSettings.enabled ? reminderSettings.leadMinutes : null,
        reminderNotificationIds: reminderSettings.notificationIds,
      } as Partial<Habit>;

      await updateHabit(selectedHabit.id, updates);

      setHabits((prev) =>
        prev.map((habit) =>
          habit.id === selectedHabit.id
            ? {
                ...habit,
                ...updates,
              }
            : habit
        )
      );

      await loadStats();
    } catch (error) {
      console.error('Error saving reminder settings:', error);
      throw error;
    }
  };

  const handleMoodSubmit = async ({ rating, note }: { rating: number; note?: string }) => {
    if (!moodHabit) return;

    try {
      await logHabitMood(moodHabit.id, rating, note);
    } catch (error) {
      console.error('Error logging mood entry:', error);
      Alert.alert('Logging failed', 'We could not save your mood entry right now.');
    } finally {
      setMoodHabit(null);
      setMoodModalVisible(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalHabits}</Text>
          <Text style={styles.statLabel}>Total Habits</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.completedToday}</Text>
          <Text style={styles.statLabel}>Done Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.bestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
      </View>

      {upcomingReminders.length > 0 && (
        <View style={styles.upcomingCard}>
          <View style={styles.upcomingHeaderRow}>
            <Text style={styles.upcomingTitle}>Upcoming reminders</Text>
            <Text style={styles.upcomingCount}>
              {upcomingReminders.length} scheduled
            </Text>
          </View>

          {upcomingReminders.map(({ habit, next }) => (
            <View key={habit.id} style={styles.upcomingItem}>
              <View style={[styles.upcomingIcon, { backgroundColor: habit.color }]}>
                <Icon name={habit.icon as any} size={20} color="#FFFFFF" />
              </View>
              <View style={styles.upcomingContent}>
                <Text style={styles.upcomingHabitTitle} numberOfLines={1}>
                  {habit.title}
                </Text>
                <Text style={styles.upcomingMeta} numberOfLines={1}>
                  {formatReminderDateTime(next)} • {formatReminderRelativeTime(next)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.upcomingAction}
                onPress={() => handleReminderPress(habit)}
                activeOpacity={0.7}
              >

              <MoodRatingModal
                visible={Boolean(moodTrackingEnabled && moodModalVisible && moodHabit)}
                habitTitle={moodHabit?.title}
                onClose={() => {
                  setMoodModalVisible(false);
                  setMoodHabit(null);
                }}
                onSubmit={handleMoodSubmit}
              />
                <Icon name="bell-ring" size={18} color={themePalette.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Habits</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateHabit}
        >
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>
        {activeFilter === 'reminders'
          ? 'No reminder-enabled habits'
          : activeFilter === 'completed'
          ? 'No completed habits today'
          : 'No habits yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'reminders'
          ? 'Enable reminders on a habit to see it appear here.'
          : activeFilter === 'completed'
          ? 'Check off a habit to track your progress.'
          : 'Create your first habit to start building better routines.'}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleCreateHabit}
      >
        <Text style={styles.emptyButtonText}>Create Your First Habit</Text>
      </TouchableOpacity>
    </View>
  );

  const reminderDefaults = useMemo(() => {
    if (!selectedHabit) {
      return undefined;
    }

    return {
      enabled: selectedHabit.reminderEnabled,
      time: parseReminderTime(selectedHabit.reminderTime),
      days: selectedHabit.reminderDays?.length
        ? selectedHabit.reminderDays
        : ALL_REMINDER_DAYS,
      leadMinutes: selectedHabit.reminderLeadMinutes ?? DEFAULT_REMINDER_LEAD_MINUTES,
      notificationIds: selectedHabit.reminderNotificationIds ?? [],
    };
  }, [selectedHabit]);

  const renderHabit = ({ item }: { item: Habit }) => (
    <HabitCard
      habit={item}
      isCompleted={completedToday.includes(item.id)}
      onToggle={() => handleToggleHabit(item.id)}
      onPress={() => handleHabitPress(item)}
      onReminderPress={() => handleReminderPress(item)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themePalette.primary} />
          <Text style={styles.loadingText}>Loading your habits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredHabits}
        renderItem={renderHabit}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={themePalette.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <CreateEditHabitModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
      />

      {selectedHabit && reminderDefaults && (
        <ReminderSettingsModal
          visible={reminderModalVisible}
          habitId={selectedHabit.id}
          habitTitle={selectedHabit.title}
          existingReminder={reminderDefaults}
          onClose={() => {
            setReminderModalVisible(false);
            setSelectedHabit(null);
          }}
          onSave={handleReminderSave}
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (palette: AppTheme['palette']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: SPACING.md,
      fontSize: FONT_SIZES.md,
      color: palette.textSecondary,
    },
    listContent: {
      padding: SPACING.lg,
      paddingBottom: SPACING.xxl * 2,
    },
    header: {
      marginBottom: SPACING.lg,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.lg,
    },
    upcomingCard: {
      backgroundColor: palette.card,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.lg,
      borderWidth: 1,
      borderColor: palette.border,
    },
    upcomingHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    upcomingTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: '600',
      color: palette.text,
    },
    upcomingCount: {
      fontSize: FONT_SIZES.xs,
      color: palette.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    upcomingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
    },
    upcomingIcon: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.round,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.md,
    },
    upcomingContent: {
      flex: 1,
    },
    upcomingHabitTitle: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
      color: palette.text,
    },
    upcomingMeta: {
      fontSize: FONT_SIZES.xs,
      color: palette.textSecondary,
      marginTop: 2,
    },
    upcomingAction: {
      padding: SPACING.xs,
    },
    filterRow: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    filterChip: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.round,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
    },
    filterChipActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    filterChipText: {
      fontSize: FONT_SIZES.sm,
      fontWeight: '600',
      color: palette.text,
    },
    filterChipTextActive: {
      color: '#FFFFFF',
    },
    statCard: {
      flex: 1,
      backgroundColor: palette.card,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginHorizontal: SPACING.xs,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: palette.primary,
      marginBottom: SPACING.xs,
    },
    statLabel: {
      fontSize: FONT_SIZES.sm,
      color: palette.textSecondary,
      textAlign: 'center',
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    sectionTitle: {
      fontSize: FONT_SIZES.xl,
      fontWeight: 'bold',
      color: palette.text,
    },
    createButton: {
      backgroundColor: palette.primary,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.md,
    },
    createButtonText: {
      color: '#FFFFFF',
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.xxl * 2,
    },
    emptyTitle: {
      fontSize: FONT_SIZES.xl,
      fontWeight: 'bold',
      color: palette.text,
      marginBottom: SPACING.sm,
    },
    emptySubtitle: {
      fontSize: FONT_SIZES.md,
      color: palette.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.xl,
      paddingHorizontal: SPACING.xl,
    },
    emptyButton: {
      backgroundColor: palette.primary,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.lg,
    },
    emptyButtonText: {
      color: '#FFFFFF',
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
    },
  });

export default HabitsScreen;
