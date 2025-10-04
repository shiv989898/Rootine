import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '@/constants/theme';
import { getInitials } from '@/utils/helpers';
import { getFriends, getPendingFriendRequests } from '@/services/firebase/socialService';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const [friendsCount, setFriendsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSocialStats();
  }, []);

  const loadSocialStats = async () => {
    try {
      const [friends, pendingRequests] = await Promise.all([
        getFriends(),
        getPendingFriendRequests(),
      ]);
      setFriendsCount(friends.length);
      setPendingRequestsCount(pendingRequests.length);
    } catch (error) {
      console.error('Error loading social stats:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <SafeAreaView style={styles.container}>
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

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard label="Level" value={user?.profile.level.toString() || '1'} icon="trophy" />
          <StatCard label="Points" value={user?.profile.points.toString() || '0'} icon="star" />
          <StatCard label="Friends" value={friendsCount.toString()} icon="account-multiple" loading={loading} />
          <StatCard label="Streak" value={`${user?.profile.streakDays || 0}`} icon="fire" />
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <MenuOption icon="account-edit" label="Edit Profile" />
          <MenuOption icon="trophy" label="Achievements" />
          <MenuOption 
            icon="account-multiple" 
            label="Friends" 
            badge={pendingRequestsCount > 0 ? pendingRequestsCount : undefined}
          />
          <MenuOption icon="cog" label="Settings" />
          {!user?.profile.isPremium && (
            <MenuOption icon="star" label="Upgrade to Premium" premium />
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
  loading 
}: { 
  label: string; 
  value: string; 
  icon: string;
  loading?: boolean;
}) => (
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>
      <Icon name={icon} size={24} color={COLORS.primary} />
    </View>
    {loading ? (
      <ActivityIndicator size="small" color={COLORS.primary} style={styles.statValue} />
    ) : (
      <Text style={styles.statValue}>{value}</Text>
    )}
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuOption = ({
  icon,
  label,
  premium = false,
  badge,
}: {
  icon: string;
  label: string;
  premium?: boolean;
  badge?: number;
}) => (
  <TouchableOpacity
    style={[styles.menuOption, premium && styles.menuOptionPremium]}
  >
    <View style={styles.menuOptionLeft}>
      <Icon 
        name={icon} 
        size={24} 
        color={premium ? COLORS.warning : COLORS.text} 
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
    <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
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
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
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
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  guestBadge: {
    backgroundColor: COLORS.warning,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
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
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
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
    borderBottomColor: COLORS.divider,
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
    color: COLORS.text,
    flex: 1,
  },
  menuLabelPremium: {
    color: COLORS.warning,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  signOutButton: {
    backgroundColor: COLORS.error,
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
