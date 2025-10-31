import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { RootStackParamList, WeeklyRecapStory } from '@/types';
import { useNavigation } from '@react-navigation/native';
import { formatDate } from '@/utils/helpers';

interface RecapStatProps {
  label: string;
  value: string;
  icon: string;
}

const RecapScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'WeeklyRecap'>>();
  const { recap } = route.params;

  const weekStart = formatDate(new Date(recap.weekStart), 'MMM dd');
  const weekEnd = formatDate(new Date(recap.weekEnd), 'MMM dd');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Recap</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <Text style={styles.heroSubtitle}>Week of {weekStart} - {weekEnd}</Text>
          <Text style={styles.heroTitle}>Your Story</Text>
          <Text style={styles.heroBody}>
            {recap.highlights[0]?.description || 'Consistency is building real momentum!'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          <View style={styles.statsGrid}>
            {recap.stats.map((stat) => (
              <RecapStat key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
            ))}
          </View>
        </View>

        {recap.highlights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Moments</Text>
            {recap.highlights.map((highlight) => (
              <View key={highlight.title} style={styles.highlightCard}>
                <View style={styles.highlightIcon}>
                  <Icon name={highlight.icon as any} size={22} color={COLORS.primary} />
                </View>
                <View style={styles.highlightContent}>
                  <Text style={styles.highlightTitle}>{highlight.title}</Text>
                  <Text style={styles.highlightBody}>{highlight.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {recap.completionSparkline.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consistency Sparkline</Text>
            <View style={styles.sparklineContainer}>
              {recap.completionSparkline.map((value, index) => {
                const height = Math.max(4, value * 12);
                return (
                  <View key={`spark-${index}`} style={styles.sparklineBarWrapper}>
                    <View style={[styles.sparklineBar, { height }]} />
                    <Text style={styles.sparklineLabel}>D{index + 1}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {recap.achievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementRow}>
              {recap.achievements.map((badge) => (
                <View key={badge.id} style={styles.achievementChip}>
                  <Icon name={badge.icon as any} size={20} color={COLORS.secondary} />
                  <Text style={styles.achievementName} numberOfLines={1}>
                    {badge.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const RecapStat: React.FC<RecapStatProps> = ({ label, value, icon }) => (
  <View style={styles.statCard}>
    <Icon name={icon as any} size={28} color={COLORS.primary} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 24,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.md,
    marginBottom: SPACING.lg,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  heroBody: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  statValue: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  highlightIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  highlightBody: {
    marginTop: 4,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  sparklineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  sparklineBarWrapper: {
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  sparklineBar: {
    width: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  sparklineLabel: {
    marginTop: 4,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  achievementRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achievementChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  achievementName: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
});

export default RecapScreen;
