import React, { useCallback, useMemo, useState } from 'react';
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
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const MENU_ICON_SIZE = 24;

type NavigationProp = StackNavigationProp<RootStackParamList>;
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { AppTheme, THEMES } from '@/constants/themes';
import { SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';
import { RootStackParamList } from '@/types';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, signOut } = useAuth();
  const {
    themePalette,
    themeKey,
    homeWidgets,
    notificationSound,
    moodTrackingEnabled,
    setMoodTrackingEnabled,
  } = usePreferences();

  const [notifications, setNotifications] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const styles = useMemo(() => createStyles(themePalette), [themePalette]);
  const themeName = THEMES[themeKey]?.name ?? 'Custom';
  const enabledWidgetCount = Object.values(homeWidgets || {}).filter(Boolean).length;
  const totalWidgetCount = Object.keys(homeWidgets || {}).length || 11;

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

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Coming Soon', 'Account deletion will be available in a future update.');
          },
        },
      ]
    );
  }, []);

  const renderSection = (title: string) => (
    <Text key={title} style={styles.sectionTitle}>
      {title}
    </Text>
  );

  const renderMenuItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      key={title}
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <Icon name={icon as any} size={MENU_ICON_SIZE} color={themePalette.primary} />
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle ? <Text style={styles.menuItemSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {rightElement || (onPress ? <Icon name="chevron-right" size={20} color={themePalette.textSecondary} /> : null)}
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
      thumbColor={value ? themePalette.primary : themePalette.card}
      trackColor={{ false: themePalette.divider, true: `${themePalette.primary}55` }}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
              <Icon name="star" size={16} color={themePalette.accent} />
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
          () => navigation.navigate('MainTabs', { screen: 'Profile' })
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

        {/* Personalization */}
        {renderSection('PERSONALIZATION')}
        {renderMenuItem(
          'palette',
          'Theme',
          themeName,
          () => navigation.navigate('Personalization')
        )}
        {renderMenuItem(
          'view-dashboard-outline',
          'Home Widgets',
          `${enabledWidgetCount} of ${totalWidgetCount} widgets visible`,
          () => navigation.navigate('Personalization')
        )}
        {renderMenuItem(
          'bell-ring',
          'Reminder Sound',
          notificationSound?.name || 'Default',
          () => navigation.navigate('Personalization')
        )}
        {renderToggleItem(
          'emoticon-happy-outline',
          'Mood Tracking',
          'Prompt to log how you feel after habits',
          moodTrackingEnabled,
          setMoodTrackingEnabled
        )}
        {renderMenuItem(
          'tune-variant',
          'Personalization Studio',
          'Customize themes, widgets, sounds, and moods',
          () => navigation.navigate('Personalization')
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
        {renderMenuItem('translate', 'Language', 'English (More coming soon)')}

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
          <Icon name="logout" size={MENU_ICON_SIZE} color={themePalette.error} />
          <Text style={styles.dangerText}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
          <Icon name="delete-forever" size={MENU_ICON_SIZE} color={themePalette.error} />
          <Text style={styles.dangerText}>Delete Account</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ by the Rootine Team</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (palette: AppTheme['palette']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: SPACING.xxl,
    },
    profileCard: {
      flexDirection: 'row',
      backgroundColor: palette.surface,
      marginHorizontal: SPACING.md,
      marginTop: SPACING.lg,
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: palette.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    profileInfo: {
      flex: 1,
      marginLeft: SPACING.md,
    },
    profileName: {
      fontSize: FONT_SIZES.lg,
      fontWeight: 'bold',
      color: palette.text,
    },
    profileEmail: {
      fontSize: FONT_SIZES.sm,
      color: palette.textSecondary,
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
      color: palette.text,
      marginLeft: SPACING.xs,
    },
    pointsText: {
      fontSize: FONT_SIZES.sm,
      color: palette.textSecondary,
      marginLeft: SPACING.xs,
    },
    sectionTitle: {
      fontSize: FONT_SIZES.xs,
      fontWeight: '700',
      color: palette.textSecondary,
      marginTop: SPACING.xl,
      marginBottom: SPACING.sm,
      marginLeft: SPACING.md,
      letterSpacing: 1,
    },
    menuItem: {
      flexDirection: 'row',
      backgroundColor: palette.surface,
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
      backgroundColor: `${palette.primary}15`,
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
      color: palette.text,
    },
    menuItemSubtitle: {
      fontSize: FONT_SIZES.sm,
      color: palette.textSecondary,
      marginTop: 2,
    },
    dangerItem: {
      flexDirection: 'row',
      backgroundColor: palette.surface,
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
      color: palette.error,
      marginLeft: SPACING.md,
    },
    footer: {
      alignItems: 'center',
      padding: SPACING.xl,
      marginTop: SPACING.xl,
    },
    footerText: {
      fontSize: FONT_SIZES.sm,
      color: palette.textSecondary,
    },
    footerVersion: {
      fontSize: FONT_SIZES.xs,
      color: palette.textSecondary,
      marginTop: SPACING.xs,
    },
  });

export default SettingsScreen;
