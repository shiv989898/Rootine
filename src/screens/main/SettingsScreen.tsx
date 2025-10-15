import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';

const SettingsScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation();
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Coming Soon', 'Account deletion will be available in the next update.');
          },
        },
      ]
    );
  };

  const renderSection = (title: string) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const renderMenuItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <Icon name={icon as any} size={24} color={COLORS.primary} />
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (onPress && <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />)}
    </TouchableOpacity>
  );

  const renderToggleItem = (
    icon: string,
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => renderMenuItem(
    icon,
    title,
    subtitle,
    undefined,
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: COLORS.border, true: COLORS.primary }}
      thumbColor="#fff"
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.profile.displayName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.profile.displayName || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
            <View style={styles.levelBadge}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.levelText}>Level {user?.profile.level || 0}</Text>
              <Text style={styles.pointsText}>• {user?.profile.points || 0} XP</Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        {renderSection('ACCOUNT')}
        {renderMenuItem(
          'account-edit',
          'Edit Profile',
          'Update your personal information',
          () => navigation.navigate('Profile' as never)
        )}
        {renderMenuItem(
          'shield-account',
          'Privacy & Security',
          'Manage your privacy settings'
        )}
        {renderMenuItem(
          'email',
          'Email Preferences',
          'Manage email notifications'
        )}

        {/* Notifications Section */}
        {renderSection('NOTIFICATIONS')}
        {renderToggleItem(
          'bell',
          'Push Notifications',
          'Receive notifications about your habits',
          notifications,
          setNotifications
        )}
        {renderToggleItem(
          'alarm',
          'Daily Reminders',
          'Get reminded to complete your daily habits',
          dailyReminders,
          setDailyReminders
        )}
        {renderToggleItem(
          'chart-line',
          'Weekly Reports',
          'Receive weekly progress summaries',
          weeklyReports,
          setWeeklyReports
        )}

        {/* App Preferences */}
        {renderSection('APP PREFERENCES')}
        {renderToggleItem(
          'volume-high',
          'Sound Effects',
          'Play sounds for actions',
          soundEffects,
          setSoundEffects
        )}
        {renderToggleItem(
          'vibrate',
          'Haptic Feedback',
          'Vibrate on interactions',
          hapticFeedback,
          setHapticFeedback
        )}
        {renderMenuItem(
          'palette',
          'Theme',
          'Light theme (Dark mode coming soon)'
        )}
        {renderMenuItem(
          'translate',
          'Language',
          'English (More languages coming soon)'
        )}

        {/* Data & Storage */}
        {renderSection('DATA & STORAGE')}
        {renderMenuItem(
          'database-export',
          'Export Data',
          'Download your habit data'
        )}
        {renderMenuItem(
          'backup-restore',
          'Backup & Restore',
          'Manage your data backups'
        )}
        {renderMenuItem(
          'delete-sweep',
          'Clear Cache',
          'Free up storage space'
        )}

        {/* Support */}
        {renderSection('SUPPORT')}
        {renderMenuItem(
          'help-circle',
          'Help & FAQ',
          'Get answers to common questions'
        )}
        {renderMenuItem(
          'message-text',
          'Contact Support',
          'Get help from our team'
        )}
        {renderMenuItem(
          'bug',
          'Report a Bug',
          'Help us improve the app'
        )}
        {renderMenuItem(
          'star',
          'Rate App',
          'Share your feedback'
        )}

        {/* About */}
        {renderSection('ABOUT')}
        {renderMenuItem(
          'information',
          'About Rootine',
          'Version 1.0.0'
        )}
        {renderMenuItem(
          'file-document',
          'Terms of Service',
          'Read our terms'
        )}
        {renderMenuItem(
          'shield-check',
          'Privacy Policy',
          'Learn how we protect your data'
        )}
        {renderMenuItem(
          'license',
          'Open Source Licenses',
          'View third-party licenses'
        )}

        {/* Danger Zone */}
        {renderSection('DANGER ZONE')}
        <TouchableOpacity style={styles.dangerItem} onPress={handleSignOut}>
          <Icon name="logout" size={24} color={COLORS.error} />
          <Text style={styles.dangerText}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
          <Icon name="delete-forever" size={24} color={COLORS.error} />
          <Text style={styles.dangerText}>Delete Account</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ by Rootine Team</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  profileName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  levelText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  pointsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.md,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  menuItemTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  menuItemSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dangerItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  dangerText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: SPACING.md,
  },
  footer: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  footerVersion: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

export default SettingsScreen;
