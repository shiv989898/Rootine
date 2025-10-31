import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, BounceIn } from 'react-native-reanimated';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '@/constants/theme';
import { getGreeting, formatDate } from '@/utils/helpers';
import {
  Habit,
  LeaderboardEntry,
  PowerUp,
  QuestProgress,
  RootStackParamList,
  TeamChallenge,
  UserChallenge,
  WeeklyRecapStory,
} from '@/types';
import { getUserDailyChallenges, getUserWeeklyChallenge } from '@/services/firebase/challengeService';
import { getStreakLeaderboard } from '@/services/firebase/leaderboardService';
import { getActiveQuests } from '@/services/firebase/questService';
import { getUserTeamChallenges } from '@/services/firebase/teamChallengeService';
import { getUserPowerUps, activatePowerUp } from '@/services/firebase/powerUpService';
import { getWeeklyRecapStory } from '@/services/firebase/analyticsService';
import { getDailyQuote } from '@/services/api/motivationalQuotes';
import { getUserHabits } from '@/services/firebase/habitService';
import {
  computeNextReminderDate,
  formatReminderDateTime,
  formatReminderRelativeTime,
} from '@/utils/reminders';
import { getLeadTimeLabel } from '@/constants/reminders';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<UserChallenge | null>(null);
  const [challengeLoading, setChallengeLoading] = useState(true);
  const [upcomingReminders, setUpcomingReminders] = useState<Array<{ habit: Habit; next: Date }>>([]);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [streakLeaders, setStreakLeaders] = useState<LeaderboardEntry[]>([]);
  const [streakLoading, setStreakLoading] = useState(false);
  const [quests, setQuests] = useState<QuestProgress[]>([]);
  const [questsLoading, setQuestsLoading] = useState(false);
  const [teamChallenges, setTeamChallenges] = useState<TeamChallenge[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [powerUps, setPowerUps] = useState<{ active: PowerUp[]; inventory: PowerUp[] }>({
    active: [],
    inventory: [],
  });
  const [powerUpsLoading, setPowerUpsLoading] = useState(false);
  const [activatingPowerUp, setActivatingPowerUp] = useState<string | null>(null);
  const [weeklyRecap, setWeeklyRecap] = useState<WeeklyRecapStory | null>(null);
  const [weeklyRecapLoading, setWeeklyRecapLoading] = useState(false);

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

  const loadReminders = useCallback(async () => {
    if (!user) {
      setUpcomingReminders([]);
      return;
    }

    setRemindersLoading(true);
    try {
      const habits = await getUserHabits();
      const upcoming = habits
        .map((habit) => {
          const next = computeNextReminderDate(habit);
          if (!next) {
            return null;
          }
          return { habit, next };
        })
        .filter((item): item is { habit: Habit; next: Date } => item !== null)
        .sort((a, b) => a.next.getTime() - b.next.getTime())
        .slice(0, 3);

      setUpcomingReminders(upcoming);
    } catch (error) {
      console.error('Error loading upcoming reminders:', error);
    } finally {
      setRemindersLoading(false);
    }
  }, [user]);

  const loadStreakLeaders = useCallback(async () => {
    if (!user) {
      setStreakLeaders([]);
      return;
    }

    setStreakLoading(true);
    try {
      const friendLeaders = await getStreakLeaderboard('friends', 5).catch(() => []);
      const hasFriendEntries = friendLeaders.some((entry) => entry.userId !== user.id);

      if (friendLeaders.length && hasFriendEntries) {
        setStreakLeaders(friendLeaders.slice(0, 3));
        return;
      }

      const globalLeaders = await getStreakLeaderboard('global', 5).catch(() => []);
      setStreakLeaders(globalLeaders.slice(0, 3));
    } catch (error) {
      console.error('Error loading streak leaderboard:', error);
      setStreakLeaders([]);
    } finally {
      setStreakLoading(false);
    }
  }, [user]);

  const loadQuests = useCallback(async () => {
    if (!user) {
      setQuests([]);
      return;
    }

    setQuestsLoading(true);
    try {
      const activeQuests = await getActiveQuests();
      const uniqueQuests = Array.from(
        activeQuests.reduce<Map<string, QuestProgress>>((accumulator, questProgress) => {
          const key = `${questProgress.quest.type}:${questProgress.quest.id}`;
          const existing = accumulator.get(key);

          if (!existing || existing.updatedAt.getTime() < questProgress.updatedAt.getTime()) {
            accumulator.set(key, questProgress);
          }

          return accumulator;
        }, new Map<string, QuestProgress>()).values()
      ).sort((a, b) => a.quest.expiresAt.getTime() - b.quest.expiresAt.getTime());

      setQuests(uniqueQuests);
    } catch (error) {
      console.error('Error loading quests:', error);
      setQuests([]);
    } finally {
      setQuestsLoading(false);
    }
  }, [user]);

  const loadTeamChallenges = useCallback(async () => {
    if (!user) {
      setTeamChallenges([]);
      return;
    }

    setTeamLoading(true);
    try {
      const challenges = await getUserTeamChallenges();
      setTeamChallenges(challenges);
    } catch (error) {
      console.error('Error loading team challenges:', error);
      setTeamChallenges([]);
    } finally {
      setTeamLoading(false);
    }
  }, [user]);

  const loadPowerUpsState = useCallback(async () => {
    if (!user) {
      setPowerUps({ active: [], inventory: [] });
      return;
    }

    setPowerUpsLoading(true);
    try {
      const data = await getUserPowerUps();
      setPowerUps(data);
    } catch (error) {
      console.error('Error loading power-ups:', error);
      setPowerUps({ active: [], inventory: [] });
    } finally {
      setPowerUpsLoading(false);
    }
  }, [user]);

  const loadWeeklyRecap = useCallback(async () => {
    if (!user) {
      setWeeklyRecap(null);
      return;
    }

    setWeeklyRecapLoading(true);
    try {
      const recap = await getWeeklyRecapStory();
      setWeeklyRecap(recap);
    } catch (error) {
      console.error('Error loading weekly recap:', error);
      setWeeklyRecap(null);
    } finally {
      setWeeklyRecapLoading(false);
    }
  }, [user]);

  const handleActivatePowerUp = useCallback(
    async (powerUpId: string, powerUpName: string) => {
      setActivatingPowerUp(powerUpId);
      try {
        await activatePowerUp(powerUpId);
        await loadPowerUpsState();
        Alert.alert('Power-up activated', `${powerUpName} is now boosting your habits!`);
      } catch (error: any) {
        console.error('Activate power-up error:', error);
        Alert.alert(
          'Activation failed',
          error?.message || 'Unable to activate this power-up right now.'
        );
      } finally {
        setActivatingPowerUp(null);
      }
    },
    [loadPowerUpsState]
  );

  useEffect(() => {
    loadReminders();
    loadStreakLeaders();
    loadQuests();
    loadTeamChallenges();
    loadPowerUpsState();
    loadWeeklyRecap();
  }, [
    loadReminders,
    loadStreakLeaders,
    loadQuests,
    loadTeamChallenges,
    loadPowerUpsState,
    loadWeeklyRecap,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadReminders();
      loadStreakLeaders();
      loadQuests();
      loadTeamChallenges();
      loadPowerUpsState();
      loadWeeklyRecap();
    }, [
      loadReminders,
      loadStreakLeaders,
      loadQuests,
      loadTeamChallenges,
      loadPowerUpsState,
      loadWeeklyRecap,
    ])
  );

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

  const activeTeamChallenge = useMemo(() => {
    if (!teamChallenges.length) {
      return null;
    }
    return teamChallenges.find((entry) => entry.isActive) ?? teamChallenges[0];
  }, [teamChallenges]);

  const teamChallengeMetrics = useMemo(() => {
    if (!activeTeamChallenge) {
      return null;
    }

    const totalContribution = activeTeamChallenge.members.reduce(
      (sum, member) => sum + (member.contribution || 0),
      0
    );
    const target = activeTeamChallenge.goal.target || 1;
    const percent = Math.min(100, Math.round((totalContribution / target) * 100));
    const topMembers = activeTeamChallenge.members
      .slice()
      .sort((a, b) => (b.contribution || 0) - (a.contribution || 0))
      .slice(0, 3);

    return {
      totalContribution,
      percent,
      topMembers,
    };
  }, [activeTeamChallenge]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.displayName || 'Friend'}!</Text>
          </View>
          <Animated.View entering={BounceIn.delay(300)} style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Icon name="fire" size={20} color="#FF5722" />
              <Text style={styles.statValue}>{user?.profile.streakDays || 0}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.card}>
          <Text style={styles.cardTitle}>Your Progress</Text>
          <View style={styles.statsRow}>
            <StatItem label="Level" value={user?.profile.level.toString() || '1'} iconName="star" />
            <StatItem label="Points" value={user?.profile.points.toString() || '0'} iconName="target" />
            <StatItem label="Badges" value={user?.profile.badges.length.toString() || '0'} iconName="trophy" />
          </View>
        </Animated.View>

  {/* Streak Leaders */}
  <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Streak Leaders</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Leaderboard')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllLink}>View leaderboard</Text>
            </TouchableOpacity>
          </View>

          {streakLoading ? (
            <View style={styles.streakLoading}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.streakLoadingText}>Tracking streak champions...</Text>
            </View>
          ) : streakLeaders.length ? (
            streakLeaders.map((entry, index) => (
              <View
                key={entry.userId}
                style={[
                  styles.streakRow,
                  index === 0 ? styles.streakRowHighlight : undefined,
                ]}
              >
                <View
                  style={[
                    styles.streakRankBadge,
                    index === 0 ? styles.streakRankBadgeFirst : undefined,
                  ]}
                >
                  <Text style={styles.streakRankText}>{index + 1}</Text>
                </View>
                <View style={styles.streakDetails}>
                  <Text style={styles.streakName} numberOfLines={1}>
                    {index === 0 ? '🔥 ' : ''}
                    {entry.userName}
                  </Text>
                  <Text style={styles.streakSubtitle} numberOfLines={1}>
                    {entry.streak} day streak • {entry.points} pts
                  </Text>
                </View>
                <View style={styles.streakValueContainer}>
                  <Icon name="fire" size={20} color={COLORS.secondary} />
                  <Text style={styles.streakValue}>{entry.streak}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.streakEmpty}>Keep your habits going to join the streak leaders.</Text>
          )}
        </Animated.View>

        {/* Daily & Weekly Quests */}
        <Animated.View entering={FadeInUp.delay(280).springify()} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Daily & Weekly Quests</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Challenges')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllLink}>View quests</Text>
            </TouchableOpacity>
          </View>

          {questsLoading ? (
            <View style={styles.questLoading}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.questLoadingText}>Loading quests...</Text>
            </View>
          ) : quests.length ? (
            quests.slice(0, 3).map((progressItem) => {
              const requirement = progressItem.quest.requirement;
              const currentValue = requirement.current ?? progressItem.progress ?? 0;
              const targetValue = requirement.target || 1;
              const percent = Math.min(100, Math.round((currentValue / targetValue) * 100));

              return (
                <View key={progressItem.quest.id} style={styles.questRow}>
                  <View style={styles.questHeader}>
                    <Text style={styles.questTitle} numberOfLines={1}>
                      {progressItem.quest.title}
                    </Text>
                    <View
                      style={[
                        styles.questTypePill,
                        progressItem.quest.type === 'daily'
                          ? styles.questTypeDaily
                          : styles.questTypeWeekly,
                      ]}
                    >
                      <Text style={styles.questTypeText}>
                        {progressItem.quest.type === 'daily' ? 'Daily' : 'Weekly'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.questDescription} numberOfLines={2}>
                    {progressItem.quest.description}
                  </Text>
                  <View style={styles.questProgressBar}>
                    <View style={[styles.questProgressFill, { width: `${percent}%` }]} />
                  </View>
                  <Text style={styles.questProgressText}>
                    {currentValue}/{targetValue} • {percent}% complete
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.questEmpty}>
              Complete habits today to unlock fresh quests.
            </Text>
          )}
        </Animated.View>

        {/* Challenge Spotlight */}
        <Animated.View entering={FadeInUp.delay(320).springify()}>
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
        </Animated.View>

        {/* Team Challenge */}
        <Animated.View entering={FadeInUp.delay(360).springify()} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Team Challenge</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Challenges')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllLink}>Manage</Text>
            </TouchableOpacity>
          </View>

          {teamLoading ? (
            <View style={styles.teamLoading}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.teamLoadingText}>Syncing your squad...</Text>
            </View>
          ) : activeTeamChallenge ? (
            <View>
              <Text style={styles.teamTitle}>{activeTeamChallenge.title}</Text>
              <Text style={styles.teamDescription} numberOfLines={2}>
                {activeTeamChallenge.description}
              </Text>
              <View style={styles.teamProgressBar}>
                <View
                  style={[
                    styles.teamProgressFill,
                    { width: `${teamChallengeMetrics?.percent ?? 0}%` },
                  ]}
                />
              </View>
              <Text style={styles.teamProgressText}>
                {teamChallengeMetrics?.totalContribution ?? 0}/
                {activeTeamChallenge.goal.target} collective progress •
                {` ${teamChallengeMetrics?.percent ?? 0}%`}
              </Text>

              {teamChallengeMetrics?.topMembers?.length ? (
                <View style={styles.teamMembersSection}>
                  {teamChallengeMetrics.topMembers.map((member) => (
                    <View key={member.userId} style={styles.teamMemberRow}>
                      <View style={styles.teamMemberAvatar}>
                        <Icon name="account" size={18} color={COLORS.white} />
                      </View>
                      <Text style={styles.teamMemberName} numberOfLines={1}>
                        {member.displayName}
                      </Text>
                      <Text style={styles.teamMemberContribution}>
                        +{member.contribution}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={styles.teamEmpty}>
              Create a team challenge with friends to chase a shared goal.
            </Text>
          )}
        </Animated.View>

        {/* Power-Ups */}
  <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Power-Ups</Text>
          </View>

          {powerUpsLoading ? (
            <View style={styles.powerUpLoading}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.powerUpLoadingText}>Preparing boosts...</Text>
            </View>
          ) : (
            <View>
              {powerUps.active.length ? (
                <View style={styles.powerUpSection}>
                  <Text style={styles.powerUpSectionTitle}>Active Right Now</Text>
                  {powerUps.active.map((item) => {
                    const expiresLabel = item.expiresAt
                      ? `Ends ${formatReminderRelativeTime(item.expiresAt)}`
                      : 'Ongoing';
                    return (
                      <View key={item.id} style={styles.powerUpActiveRow}>
                        <View style={styles.powerUpInfo}>
                          <Text style={styles.powerUpName}>{item.name}</Text>
                          <Text style={styles.powerUpDescription} numberOfLines={2}>
                            {item.description}
                          </Text>
                          <Text style={styles.powerUpMeta}>{expiresLabel}</Text>
                        </View>
                        <Icon name={item.icon as any} size={26} color={COLORS.secondary} />
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.powerUpEmpty}>No active power-ups. Activate one below!</Text>
              )}

              {powerUps.inventory.length ? (
                <View style={styles.powerUpSection}>
                  <Text style={styles.powerUpSectionTitle}>Inventory</Text>
                  {powerUps.inventory.map((item) => (
                    <View key={item.id} style={styles.powerUpInventoryRow}>
                      <View style={styles.powerUpInfo}>
                        <Text style={styles.powerUpName}>{item.name}</Text>
                        <Text style={styles.powerUpDescription} numberOfLines={2}>
                          {item.description}
                        </Text>
                        <Text style={styles.powerUpMeta}>
                          {item.usesRemaining ?? 1} use{(item.usesRemaining ?? 1) > 1 ? 's' : ''} left
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.powerUpActivateButton}
                        onPress={() => handleActivatePowerUp(item.id, item.name)}
                        activeOpacity={0.8}
                        disabled={activatingPowerUp === item.id}
                      >
                        {activatingPowerUp === item.id ? (
                          <ActivityIndicator color={COLORS.white} size="small" />
                        ) : (
                          <Text style={styles.powerUpActivateText}>Activate</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          )}
        </Animated.View>

        {/* Weekly Recap */}
        <Animated.View entering={FadeInUp.delay(420).springify()} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Weekly Recap</Text>
            {weeklyRecap ? (
              <TouchableOpacity
                onPress={() => navigation.navigate('WeeklyRecap', { recap: weeklyRecap })}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllLink}>View story</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {weeklyRecapLoading ? (
            <View style={styles.recapLoading}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.recapLoadingText}>Building your highlight reel...</Text>
            </View>
          ) : weeklyRecap ? (
            <View>
              <View style={styles.recapStatsRow}>
                {weeklyRecap.stats.slice(0, 3).map((stat) => (
                  <View key={stat.label} style={styles.recapStatChip}>
                    <Icon name={stat.icon as any} size={18} color={COLORS.primary} />
                    <Text style={styles.recapStatLabel}>{stat.label}</Text>
                    <Text style={styles.recapStatValue}>{stat.value}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.recapHighlight} numberOfLines={2}>
                {weeklyRecap.highlights[0]?.description || 'Keep up the amazing momentum!'}
              </Text>
            </View>
          ) : (
            <Text style={styles.recapEmpty}>
              Complete habits this week to unlock your recap story.
            </Text>
          )}
        </Animated.View>

        {/* Upcoming Reminders */}
        <Animated.View entering={FadeInUp.delay(460).springify()} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Upcoming Reminders</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs', { screen: 'Habits' })}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllLink}>View all</Text>
            </TouchableOpacity>
          </View>

          {remindersLoading ? (
            <View style={styles.reminderLoading}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.reminderLoadingText}>Checking your schedule...</Text>
            </View>
          ) : upcomingReminders.length ? (
            upcomingReminders.map(({ habit, next }) => (
              <View key={habit.id} style={styles.reminderRow}>
                <View style={[styles.reminderIcon, { backgroundColor: habit.color }]}>
                  <Icon name={habit.icon as any} size={22} color={COLORS.white} />
                </View>
                <View style={styles.reminderContent}>
                  <Text style={styles.reminderTitle} numberOfLines={1}>
                    {habit.title}
                  </Text>
                  <Text style={styles.reminderMeta} numberOfLines={1}>
                    {formatReminderDateTime(next)} • {formatReminderRelativeTime(next)}
                  </Text>
                  <Text style={styles.reminderSubMeta}>
                    {getLeadTimeLabel(habit.reminderLeadMinutes ?? 0)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.reminderAction}
                  onPress={() => navigation.navigate('MainTabs', { screen: 'Habits' })}
                  activeOpacity={0.7}
                >
                  <Icon name="arrow-right" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.reminderEmpty}>No reminders scheduled yet.</Text>
          )}
        </Animated.View>

        {/* Today's Habits */}
        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today's Habits</Text>
            <Text style={styles.dateText}>{formatDate(new Date(), 'MMM dd')}</Text>
          </View>
          <Text style={styles.emptyText}>Start tracking your habits!</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Habits' })}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Habit</Text>
          </TouchableOpacity>
        </Animated.View>

  {/* Motivational Quote */}
  <Animated.View entering={FadeInUp.delay(550).springify()} style={[styles.card, styles.quoteCard]}>
          <Icon name="format-quote-open" size={32} color={COLORS.primary} style={{ opacity: 0.3, marginBottom: SPACING.sm }} />
          <Text style={styles.quoteText}>
            "{dailyQuote.text}"
          </Text>
          <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
        </Animated.View>

  {/* Quick Actions */}
  <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.actionsContainer}>
          <QuickActionButton iconName="podium-gold" label="Leaderboard" onPress={() => navigation.navigate('Leaderboard')} />
          <QuickActionButton iconName="trophy" label="Challenges" onPress={() => navigation.navigate('Challenges')} />
          <QuickActionButton iconName="account-group" label="Add Friends" onPress={() => navigation.navigate('SearchUsers')} />
        </Animated.View>
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
  viewAllLink: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  streakLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakLoadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  streakRowHighlight: {
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
  },
  streakRankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    marginRight: SPACING.md,
  },
  streakRankBadgeFirst: {
    backgroundColor: COLORS.primaryLight,
  },
  streakRankText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  streakDetails: {
    flex: 1,
    marginRight: SPACING.md,
  },
  streakName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  streakSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  streakValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.secondary,
    marginLeft: 4,
  },
  streakEmpty: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  questLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questLoadingText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  questRow: {
    marginBottom: SPACING.md,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  questTypePill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  questTypeDaily: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  questTypeWeekly: {
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
  },
  questTypeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },
  questDescription: {
    marginTop: 4,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  questProgressBar: {
    height: 8,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.divider,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  questProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  questProgressText: {
    marginTop: 4,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  questEmpty: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  teamLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLoadingText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  teamTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  teamDescription: {
    marginTop: 4,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  teamProgressBar: {
    height: 10,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.divider,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  teamProgressFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
  },
  teamProgressText: {
    marginTop: 4,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  teamMembersSection: {
    marginTop: SPACING.md,
  },
  teamMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  teamMemberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  teamMemberName: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  teamMemberContribution: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  teamEmpty: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  powerUpLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  powerUpLoadingText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  powerUpSection: {
    marginTop: SPACING.sm,
  },
  powerUpSectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  powerUpActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  powerUpInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  powerUpName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  powerUpDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  powerUpMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    marginTop: 4,
  },
  powerUpEmpty: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  powerUpInventoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.divider,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  powerUpActivateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  powerUpActivateText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  recapLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recapLoadingText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  recapStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  recapStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  recapStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  recapStatValue: {
    marginLeft: 'auto',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  recapHighlight: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  recapEmpty: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
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
  reminderLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderLoadingText: {
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  reminderIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  reminderMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reminderSubMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reminderAction: {
    padding: SPACING.xs,
  },
  reminderEmpty: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
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
