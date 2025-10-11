import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '@/constants/theme';
import { getGreeting, formatDate } from '@/utils/helpers';
import { RootStackParamList } from '@/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();

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
          <Icon name="arm-flex" size={40} color={COLORS.primary} />
          <Text style={styles.quoteText}>
            "The secret of getting ahead is getting started."
          </Text>
          <Text style={styles.quoteAuthor}>- Mark Twain</Text>
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
  quoteCard: {
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  quoteAuthor: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
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
