import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@/contexts/AuthContext';
import { SPACING, FONT_SIZES, RADIUS, SHADOWS } from '@/constants/theme';
import { usePreferences } from '@/contexts/PreferencesContext';
import { AppTheme } from '@/constants/themes';
import { getInitials } from '@/utils/helpers';
import { getFriends, getPendingFriendRequests } from '@/services/firebase/socialService';
import { getUserBadges, getRarityColor } from '@/services/firebase/achievementService';
import { getUserPointsAndLevel } from '@/services/firebase/userService';
import { RootStackParamList, Badge } from '@/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const { themePalette } = usePreferences();
  const styles = useMemo(() => createStyles(themePalette), [themePalette]);
  
  const [friendsCount, setFriendsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userStats, setUserStats] = useState({
    points: 0,
    level: 0,
    weeklyPoints: 0,
    monthlyPoints: 0,
  });

  const loadProfileData = useCallback(async () => {
    setLoading(true);
    try {
      const [friends, pendingRequests, userBadges, stats] = await Promise.all([
        getFriends(),
        getPendingFriendRequests(),
        getUserBadges(),
        getUserPointsAndLevel(),
      ]);
      setFriendsCount(friends.length);
      setPendingRequestsCount(pendingRequests.length);
      setBadges(Array.isArray(userBadges) ? userBadges : []);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingStateContainer}>
          <ActivityIndicator size="large" color={themePalette.primary} />
          <Text style={styles.loadingStateText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to sign out');
          }
        },
      },
    ]);
  };

  // Calculate XP progress to next level
  const currentLevelXP = userStats.level * 100;
  const nextLevelXP = (userStats.level + 1) * 100;
  const xpProgressRaw = userStats.points - currentLevelXP;
  const xpNeeded = Math.max(nextLevelXP - currentLevelXP, 1);
  const xpProgress = Math.min(Math.max(xpProgressRaw, 0), xpNeeded);
  const progressPercentage = (xpProgress / xpNeeded) * 100;

  // Get top 3 badges by rarity
  const topBadges = [...badges]
    .sort((a, b) => {
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
    })
    .slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(user?.displayName || 'User')}
            </Text>
          </View>
          <Text style={styles.name}>{user?.displayName || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.isGuest && (
            <View style={styles.guestBadge}>
              <Text style={styles.guestText}>Guest Mode</Text>
            </View>
          )}
        </View>

        {/* Level & XP Card */}
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.levelCard}
        >
          <View style={styles.levelHeader}>
            <View style={styles.levelBadge}>
              <Icon name="trophy" size={28} color="#FFD700" />
              <Text style={styles.levelNumber}>{userStats.level}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>Level {userStats.level}</Text>
              <Text style={styles.levelSubtitle}>
                {xpProgress} / {xpNeeded} XP
              </Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.xpProgressContainer}>
            <View style={styles.xpProgressBar}>
              <View 
                style={[
                  styles.xpProgressFill, 
                  { width: `${Math.min(progressPercentage, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.xpProgressText}>
              {Math.round(progressPercentage)}% to Level {userStats.level + 1}
            </Text>
          </View>
        </LinearGradient>

        {/* Badges Showcase */}
        {topBadges.length > 0 && (
          <View style={styles.badgesSection}>
            <View style={styles.badgesHeader}>
              <Text style={styles.sectionTitle}>Top Achievements</Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('BadgeShowcase')}
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllText}>View All ({badges.length})</Text>
                <Icon name="chevron-right" size={20} color={themePalette.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.badgesContainer}>
              {topBadges.map((badge) => (
                <View 
                  key={badge.id} 
                  style={[
                    styles.badgeCard,
                    { borderColor: getRarityColor(badge.rarity) }
                  ]}
                >
                  <View style={[
                    styles.badgeIconContainer,
                    { backgroundColor: getRarityColor(badge.rarity) }
                  ]}>
                    <Icon name={badge.icon as any} size={24} color="#FFF" />
                  </View>
                  <Text style={styles.badgeTitle} numberOfLines={1}>
                    {badge.name}
                  </Text>
                  <View style={[
                    styles.rarityTag,
                    { backgroundColor: getRarityColor(badge.rarity) }
                  ]}>
                    <Text style={styles.rarityTagText}>
                      {badge.rarity.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard 
            label="Total Points" 
            value={userStats.points.toString()} 
            icon="star" 
            color="#FFD700"
            palette={themePalette}
          />
          <StatCard 
            label="Weekly" 
            value={userStats.weeklyPoints.toString()} 
            icon="calendar-week" 
            color="#2196F3"
            palette={themePalette}
          />
          <StatCard 
            label="Monthly" 
            value={userStats.monthlyPoints.toString()} 
            icon="calendar-month" 
            color="#9C27B0"
            palette={themePalette}
          />
          <StatCard 
            label="Streak" 
            value={`${user?.profile.currentStreak || 0}d`} 
            icon="fire" 
            color="#FF5722"
            palette={themePalette}
          />
          <StatCard
            label="Friends"
            value={friendsCount.toString()}
            icon="account-group"
            color="#4CAF50"
            palette={themePalette}
          />
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <MenuOption icon="account-edit" label="Edit Profile" onPress={() => {}} palette={themePalette} />
          <MenuOption 
            icon="trophy" 
            label="Achievements" 
            onPress={() => navigation.navigate('BadgeShowcase')}
            palette={themePalette}
          />
          <MenuOption 
            icon="chart-line" 
            label="Leaderboard" 
            onPress={() => navigation.navigate('Leaderboard')}
            palette={themePalette}
          />
          <MenuOption 
            icon="account-multiple" 
            label="Friends" 
            badge={pendingRequestsCount > 0 ? pendingRequestsCount : undefined}
            onPress={() => navigation.navigate('FriendsList')}
            palette={themePalette}
          />
          <MenuOption 
            icon="account-plus" 
            label="Find Friends" 
            onPress={() => navigation.navigate('SearchUsers')}
            palette={themePalette}
          />
          <MenuOption 
            icon="cog" 
            label="Settings" 
            onPress={() => navigation.navigate('Settings')}
            palette={themePalette}
          />
          {!user?.profile.isPremium && (
            <MenuOption icon="star" label="Upgrade to Premium" premium onPress={() => {}} palette={themePalette} />
          )}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ 
  label, 
  value, 
  icon, 
  loading,
  color,
  palette,
}: { 
  label: string; 
  value: string; 
  icon: string;
  loading?: boolean;
  color?: string;
  palette: AppTheme['palette'];
}) => {
  const finalColor = color || palette.primary;
  const styles = useMemo(() => createStyles(palette), [palette]);
  
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Icon name={icon as any} size={24} color={finalColor} />
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={finalColor} style={styles.statValue} />
      ) : (
        <Text style={[styles.statValue, { color: finalColor }]}>{value}</Text>
      )}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

const MenuOption = ({
  icon,
  label,
  premium = false,
  badge,
  onPress,
  palette,
}: {
  icon: string;
  label: string;
  premium?: boolean;
  badge?: number;
  onPress?: () => void;
  palette: AppTheme['palette'];
}) => {
  const styles = useMemo(() => createStyles(palette), [palette]);
  
  return (
    <TouchableOpacity
      style={[styles.menuOption, premium && styles.menuOptionPremium]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuOptionLeft}>
        <Icon 
          name={icon as any}
          size={24} 
          color={premium ? palette.warning : palette.text} 
          style={styles.menuIcon}
        />
        <Text style={[styles.menuLabel, premium && styles.menuLabelPremium]}>
          {label}
        </Text>
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Icon name="chevron-right" size={24} color={palette.textSecondary} />
    </TouchableOpacity>
  );
};

const createStyles = (palette: AppTheme['palette']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    scrollContent: {
      padding: SPACING.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: SPACING.xl,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: palette.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.md,
      ...SHADOWS.md,
    },
    avatarText: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: palette.text,
      marginBottom: SPACING.xs,
    },
    email: {
      fontSize: FONT_SIZES.md,
      color: palette.textSecondary,
    },
    guestBadge: {
      backgroundColor: palette.warning,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.md,
      marginTop: SPACING.sm,
    },
    guestText: {
      color: '#FFFFFF',
      fontSize: FONT_SIZES.sm,
      fontWeight: '600',
    },
    levelCard: {
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.lg,
      ...SHADOWS.md,
    },
    levelHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    levelBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.lg,
      marginRight: SPACING.md,
    },
    levelNumber: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFF',
      marginLeft: SPACING.xs,
    },
    levelInfo: {
      flex: 1,
    },
    levelTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#FFF',
      marginBottom: 4,
    },
    levelSubtitle: {
      fontSize: FONT_SIZES.md,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    xpProgressContainer: {
      marginTop: SPACING.xs,
    },
    xpProgressBar: {
      height: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: SPACING.xs,
    },
    xpProgressFill: {
      height: '100%',
      backgroundColor: '#FFD700',
      borderRadius: 6,
    },
    xpProgressText: {
      fontSize: FONT_SIZES.sm,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
    },
    badgesSection: {
      marginBottom: SPACING.xl,
    },
    badgesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    sectionTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: 'bold',
      color: palette.text,
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewAllText: {
      fontSize: FONT_SIZES.sm,
      color: palette.primary,
      fontWeight: '600',
      marginRight: 4,
    },
    badgesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: SPACING.sm,
    },
    badgeCard: {
      flex: 1,
      backgroundColor: palette.surface,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      alignItems: 'center',
      borderWidth: 2,
      ...SHADOWS.sm,
    },
    badgeIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.xs,
    },
    badgeTitle: {
      fontSize: FONT_SIZES.xs,
      fontWeight: '600',
      color: palette.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    rarityTag: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    rarityTagText: {
      fontSize: 9,
      color: '#FFF',
      fontWeight: 'bold',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.xl,
      flexWrap: 'wrap',
    },
    loadingStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.lg,
    },
    loadingStateText: {
      marginTop: SPACING.md,
      color: palette.textSecondary,
      fontSize: FONT_SIZES.md,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: palette.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      margin: SPACING.xs,
      alignItems: 'center',
      ...SHADOWS.sm,
    },
    statIconContainer: {
      marginBottom: SPACING.xs,
    },
    statValue: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: 'bold',
      marginBottom: SPACING.xs,
    },
    statLabel: {
      fontSize: FONT_SIZES.sm,
      color: palette.textSecondary,
    },
    menuContainer: {
      backgroundColor: palette.surface,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.xl,
      overflow: 'hidden',
      ...SHADOWS.sm,
    },
    menuOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: palette.divider,
    },
    menuOptionPremium: {
      backgroundColor: 'rgba(255, 193, 7, 0.1)',
    },
    menuOptionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuIcon: {
      marginRight: SPACING.md,
    },
    menuLabel: {
      fontSize: FONT_SIZES.md,
      color: palette.text,
      flex: 1,
    },
    menuLabelPremium: {
      color: palette.warning,
      fontWeight: '600',
    },
    badge: {
      backgroundColor: palette.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: SPACING.xs,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    menuArrow: {
      fontSize: 24,
      color: palette.textSecondary,
    },
    signOutButton: {
      backgroundColor: palette.error,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
      ...SHADOWS.sm,
    },
    signOutText: {
      color: '#FFFFFF',
      fontSize: FONT_SIZES.lg,
      fontWeight: 'bold',
    },
  });

export default ProfileScreen;
