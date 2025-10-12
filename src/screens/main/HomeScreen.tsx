import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '@/constants/theme';
import { getGreeting, formatDate } from '@/utils/helpers';
import { RootStackParamList, UserChallenge } from '@/types';
import { getUserDailyChallenges, getUserWeeklyChallenge } from '@/services/firebase/challengeService';
import { getDailyQuote } from '@/services/api/motivationalQuotes';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<UserChallenge | null>(null);
  const [challengeLoading, setChallengeLoading] = useState(true);

  const dailyQuote = useMemo(() => getDailyQuote(), []);

  useEffect(() => {
    let isMounted = true;

    const hydrateChallenges = async () => {
      if (!user) {
        if (isMounted) {
          setChallenge(null);
          setChallengeLoading(false);
        }
        return;
      }

      try {
        setChallengeLoading(true);
        const [daily, weekly] = await Promise.all([
          getUserDailyChallenges().catch(() => []),
          getUserWeeklyChallenge().catch(() => null),
        ]);

        if (!isMounted) {
          return;
        }

        const activeDaily = daily.filter((entry) => !entry.isClaimed);
        const readyToClaim = activeDaily.find((entry) => entry.isCompleted);
        const highestProgressDaily = activeDaily
          .slice()
          .sort((a, b) => b.progress - a.progress)[0];

        const spotlight =
          readyToClaim ||
          highestProgressDaily ||
          (weekly && !weekly.isClaimed ? weekly : null);

        setChallenge(spotlight);
      } finally {
        if (isMounted) {
          setChallengeLoading(false);
        }
      }
    };

    hydrateChallenges();

    const intervalId = setInterval(hydrateChallenges, 1000 * 60 * 5);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [user]);

  const challengeProgress = useMemo(() => {
    if (!challenge) return 0;
    return Math.min(100, Math.max(0, Math.round(challenge.progress)));
  }, [challenge]);

  const challengeStatus = useMemo(() => {
    if (!challenge) return 'No active challenges yet.';
    if (challenge.isClaimed) return 'Reward collected!';
    if (challenge.isCompleted) return 'Ready to claim rewards – tap to celebrate!';

    const goal = challenge.challenge.goal;
    if (typeof goal.current === 'number') {
      return `${goal.current}/${goal.target} complete`;
    }

    return `${challengeProgress}% complete`;
  }, [challenge, challengeProgress]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.displayName || 'Friend'}!</Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Icon name="fire" size={20} color="#FF5722" />
              <Text style={styles.statValue}>{user?.profile.streakDays || 0}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Progress</Text>
          <View style={styles.statsRow}>
            <StatItem label="Level" value={user?.profile.level.toString() || '1'} iconName="star" />
            <StatItem label="Points" value={user?.profile.points.toString() || '0'} iconName="target" />
            <StatItem label="Badges" value={user?.profile.badges.length.toString() || '0'} iconName="trophy" />
          </View>
        </View>

        {/* Challenge Spotlight */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.card, styles.challengeCard]}
          onPress={() => navigation.navigate('Challenges')}
        >
          <View style={styles.challengeHeader}>
            <View style={styles.challengeBadge}>
              <Icon name="fire" size={20} color="#fff" />
            </View>
            <Text style={styles.challengeTitle}>Challenge Spotlight</Text>
          </View>

          {challengeLoading ? (
            <View style={styles.challengeLoading}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.challengeLoadingText}>Fetching your next win...</Text>
            </View>
          ) : challenge ? (
            <>
              <Text style={styles.challengeName}>{challenge.challenge.title}</Text>
              <Text style={styles.challengeDescription}>{challenge.challenge.description}</Text>
              <View style={styles.challengeMetaRow}>
                <View style={styles.challengeRewardChip}>
                  <Icon
                    name="star-circle"
                    size={18}
                    color="#FFD54F"
                    style={styles.challengeRewardChipIcon}
                  />
                  <Text style={styles.challengeRewardText}>
                    {challenge.challenge.reward.points} pts
                  </Text>
                </View>
                <Text style={styles.challengeStatus}>{challengeStatus}</Text>
              </View>
              <View style={styles.challengeProgressBar}>
                <View
                  style={[styles.challengeProgressFill, { width: `${challengeProgress}%` }]}
                />
              </View>
              <Text style={styles.challengeProgressLabel}>{challengeProgress}% complete</Text>
            </>
          ) : (
            <View>
              <Text style={styles.challengeEmptyTitle}>No active challenges yet</Text>
              <Text style={styles.challengeDescription}>
                Come back tomorrow for a fresh quest and bonus points.
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Today's Habits */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today's Habits</Text>
            <Text style={styles.dateText}>{formatDate(new Date(), 'MMM dd')}</Text>
          </View>
          <Text style={styles.emptyText}>Start tracking your habits!</Text>
          <TouchableOpacity style={styles.addButton}>
            <Icon name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Habit</Text>
          </TouchableOpacity>
        </View>

        {/* Motivational Quote */}
        <View style={[styles.card, styles.quoteCard]}>
          <Icon name="format-quote-open" size={32} color={COLORS.primary} style={{ opacity: 0.3, marginBottom: SPACING.sm }} />
          <Text style={styles.quoteText}>
            "{dailyQuote.text}"
          </Text>
          <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <QuickActionButton iconName="podium-gold" label="Leaderboard" onPress={() => navigation.navigate('Leaderboard')} />
          <QuickActionButton iconName="trophy" label="Challenges" onPress={() => navigation.navigate('Challenges')} />
          <QuickActionButton iconName="account-group" label="Add Friends" onPress={() => navigation.navigate('SearchUsers')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatItem = ({ label, value, iconName }: { label: string; value: string; iconName: string }) => (
  <View style={styles.statItem}>
    <Icon name={iconName as any} size={32} color={COLORS.primary} />
    <Text style={styles.statItemValue}>{value}</Text>
    <Text style={styles.statItemLabel}>{label}</Text>
  </View>
);

const QuickActionButton = ({ iconName, label, onPress }: { iconName: string; label: string; onPress?: () => void }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
    <Icon name={iconName as any} size={32} color={COLORS.primary} />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.md,
  },
  challengeCard: {
    marginBottom: SPACING.md,
    overflow: 'hidden',
    backgroundColor: '#F2FDF6',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  challengeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  challengeLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  challengeLoadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  challengeName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  challengeDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  challengeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  challengeRewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  challengeRewardChipIcon: {
    marginRight: SPACING.xs,
  },
  challengeRewardText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#F57C00',
  },
  challengeStatus: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  challengeProgressBar: {
    height: 10,
    borderRadius: 20,
    backgroundColor: '#E0F2F1',
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  challengeProgressLabel: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  challengeEmptyTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  quoteCard: {
    backgroundColor: '#F0F4FF',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  quoteIcon: {
    marginBottom: SPACING.sm,
    opacity: 0.3,
  },
  quoteText: {
    fontSize: FONT_SIZES.md,
    fontStyle: 'italic',
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  quoteAuthor: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
  },
  statItem: {
    alignItems: 'center',
  },
  statItemValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statItemLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    marginVertical: SPACING.lg,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  actionLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default HomeScreen;
