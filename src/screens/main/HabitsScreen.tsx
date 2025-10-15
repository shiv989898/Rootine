import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';
import { Habit } from '@/types';
import { 
  getUserHabits, 
  getHabitStatistics, 
  subscribeToHabits,
  toggleHabitCompletion,
  getTodaysCompletedHabits 
} from '@/services/firebase/habitService';
import { HabitCard } from '@/components/habits/HabitCard';
import { CreateEditHabitModal } from '@/components/habits/CreateEditHabitModal';
import { ReminderSettingsModal } from '@/components/habits/ReminderSettingsModal';
import { initializeNotifications } from '@/services/notifications/notificationService';

const HabitsScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    totalCompletions: 0,
    bestStreak: 0,
  });

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
    try {
      await toggleHabitCompletion(habitId);
      // Reload stats and completed list
      await Promise.all([loadStats(), loadCompletedToday()]);
    } catch (error) {
      console.error('Error toggling habit:', error);
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

  const handleReminderSave = (reminderSettings: any) => {
    console.log('Reminder settings saved:', reminderSettings);
    // TODO: Save to Firebase if needed
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
      <Text style={styles.emptyTitle}>No habits yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first habit to start building better routines
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleCreateHabit}
      >
        <Text style={styles.emptyButtonText}>Create Your First Habit</Text>
      </TouchableOpacity>
    </View>
  );

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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your habits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={habits}
        renderItem={renderHabit}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <CreateEditHabitModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
      />

      {selectedHabit && (
        <ReminderSettingsModal
          visible={reminderModalVisible}
          habitId={selectedHabit.id}
          habitTitle={selectedHabit.title}
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
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
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
    color: COLORS.text,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

export default HabitsScreen;
