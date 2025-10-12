import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '@/constants/theme';
import {
  getHabitStats,
  getWeeklyInsights,
  getMonthlyInsights,
  getHabitRecommendations,
  HabitStats,
  WeeklyInsights,
  MonthlyInsights,
} from '@/services/firebase/analyticsService';

const { width } = Dimensions.get('window');

const InsightsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyInsights | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyInsights | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, weekly, monthly, recs] = await Promise.all([
        getHabitStats(),
        getWeeklyInsights(),
        getMonthlyInsights(),
        getHabitRecommendations(),
      ]);

      setStats(statsData);
      setWeeklyData(weekly);
      setMonthlyData(monthly);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Analyzing your habits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats || !weeklyData || !monthlyData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="chart-box-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No data yet</Text>
          <Text style={styles.emptySubtext}>Complete some habits to see insights</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Insights</Text>
          <Text style={styles.headerSubtitle}>Track your progress and patterns</Text>
        </View>

        {/* Key Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="check-circle"
            label="Total Habits"
            value={stats.totalCompletions.toString()}
            color="#4CAF50"
          />
          <StatCard
            icon="fire"
            label="Current Streak"
            value={`${stats.currentStreak} days`}
            color="#FF6F00"
          />
          <StatCard
            icon="trophy"
            label="Longest Streak"
            value={`${stats.longestStreak} days`}
            color="#FFD54F"
          />
          <StatCard
            icon="percent"
            label="Completion Rate"
            value={`${stats.completionRate}%`}
            color="#2196F3"
          />
        </View>

        {/* Weekly Activity */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This Week's Activity</Text>
          <Text style={styles.cardSubtitle}>
            {weeklyData.totalCompletions} habits completed
            {weeklyData.comparisonToPreviousWeek !== 0 && (
              <Text
                style={[
                  styles.comparison,
                  weeklyData.comparisonToPreviousWeek > 0 ? styles.positive : styles.negative,
                ]}
              >
                {' '}
                ({weeklyData.comparisonToPreviousWeek > 0 ? '+' : ''}
                {weeklyData.comparisonToPreviousWeek}% from last week)
              </Text>
            )}
          </Text>
          <View style={styles.weeklyBars}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <View key={day} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(
                          4,
                          (weeklyData.dailyCompletions[index] /
                            Math.max(...weeklyData.dailyCompletions, 1)) *
                            100
                        ),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barValue}>{weeklyData.dailyCompletions[index]}</Text>
                <Text style={styles.barLabel}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category Breakdown */}
        {stats.categoryBreakdown.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Category Breakdown</Text>
            <Text style={styles.cardSubtitle}>Your habit focus areas</Text>
            {stats.categoryBreakdown.map((cat, index) => (
              <View key={cat.category} style={styles.categoryRow}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] },
                  ]}
                />
                <Text style={styles.categoryName}>{cat.category}</Text>
                <Text style={styles.categoryCount}>
                  {cat.count} ({Math.round(cat.percentage)}%)
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Monthly Overview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This Month</Text>
          <View style={styles.monthlyStats}>
            <MonthlyStatItem
              label="Total Completions"
              value={monthlyData.totalCompletions.toString()}
            />
            <MonthlyStatItem
              label="Daily Average"
              value={monthlyData.averagePerDay.toFixed(1)}
            />
            <MonthlyStatItem label="Active Days" value={monthlyData.streakDays.toString()} />
          </View>

          {monthlyData.topHabits.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Top Habits</Text>
              {monthlyData.topHabits.slice(0, 3).map((habit, index) => (
                <View key={habit.habitId} style={styles.topHabitItem}>
                  <View style={styles.topHabitRank}>
                    <Text style={styles.topHabitRankText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.topHabitName}>{habit.name}</Text>
                  <Text style={styles.topHabitCount}>{habit.completions}x</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Best Patterns */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Best Patterns</Text>
          <View style={styles.patternItem}>
            <Icon name="calendar-star" size={24} color={COLORS.primary} />
            <View style={styles.patternText}>
              <Text style={styles.patternLabel}>Most Productive Day</Text>
              <Text style={styles.patternValue}>{stats.bestDay}</Text>
            </View>
          </View>
          <View style={styles.patternItem}>
            <Icon name="clock-outline" size={24} color={COLORS.primary} />
            <View style={styles.patternText}>
              <Text style={styles.patternLabel}>Peak Time</Text>
              <Text style={styles.patternValue}>{stats.bestTime}</Text>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Personalized Tips</Text>
            {recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Icon name="lightbulb-on" size={20} color="#FFB300" />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentProps<typeof Icon>['name'];
  label: string;
  value: string;
  color: string;
}) => (
  <View style={styles.statCard}>
    <Icon name={icon} size={32} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MonthlyStatItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.monthlyStatItem}>
    <Text style={styles.monthlyStatLabel}>{label}</Text>
    <Text style={styles.monthlyStatValue}>{value}</Text>
  </View>
);

const CATEGORY_COLORS = [
  '#4CAF50',
  '#2196F3',
  '#FF9800',
  '#9C27B0',
  '#F44336',
  '#00BCD4',
  '#FFC107',
  '#E91E63',
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
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
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  comparison: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  weeklyBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    marginTop: SPACING.md,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 24,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    minHeight: 4,
  },
  barValue: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  barLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  categoryName: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  categoryCount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  monthlyStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  monthlyStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  monthlyStatValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  subsectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  topHabitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  topHabitRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  topHabitRankText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: '#fff',
  },
  topHabitName: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  topHabitCount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  patternText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  patternLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  patternValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: '#FFF9E6',
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  recommendationText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
});

export default InsightsScreen;
