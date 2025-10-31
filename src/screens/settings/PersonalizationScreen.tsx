import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { usePreferences } from '@/contexts/PreferencesContext';
import { AppTheme, THEMES, ThemeKey } from '@/constants/themes';
import { RootStackParamList, HomeWidgetPreferences, NotificationSoundPreference } from '@/types';
import { SPACING, FONT_SIZES, RADIUS, SHADOWS } from '@/constants/theme';

const BUILT_IN_SOUNDS: NotificationSoundPreference[] = [
  {
    type: 'default',
    id: 'default',
    name: 'System Default',
    description: 'Use the operating system reminder sound',
  },
  {
    type: 'bundle',
    id: 'gentle_chime',
    name: 'Gentle Chime',
    description: 'Soft bell tone for mindful reminders',
    bundleAsset: 'gentle_chime.wav',
  },
  {
    type: 'bundle',
    id: 'focus_pulse',
    name: 'Focus Pulse',
    description: 'Upbeat ping to kick off habit sessions',
    bundleAsset: 'focus_pulse.wav',
  },
];

type NavigationProp = StackNavigationProp<RootStackParamList>;

type WidgetKey = keyof HomeWidgetPreferences;

const createStyles = (theme: AppTheme['palette']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.lg,
    },
    headerTitle: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: '700',
      color: theme.text,
    },
    headerSpacer: {
      width: 32,
    },
    backButton: {
      padding: SPACING.xs,
      borderRadius: RADIUS.round,
    },
    content: {
      paddingBottom: SPACING.xxl,
      paddingHorizontal: SPACING.lg,
    },
    section: {
      marginBottom: SPACING.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.md,
    },
    sectionTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: '600',
      color: theme.text,
    },
    sectionSubtitle: {
      fontSize: FONT_SIZES.sm,
      color: theme.textSecondary,
    },
    themeCard: {
      borderRadius: RADIUS.lg,
      overflow: 'hidden',
      marginBottom: SPACING.md,
      ...SHADOWS.md,
    },
    themeCardInner: {
      padding: SPACING.lg,
    },
    themeNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.xs,
    },
    themeName: {
      fontSize: FONT_SIZES.lg,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    themeDescription: {
      fontSize: FONT_SIZES.sm,
      color: '#FFFFFFDD',
    },
    selectedBadge: {
      backgroundColor: '#FFFFFF',
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
    },
    selectedBadgeText: {
      fontSize: FONT_SIZES.xs,
      fontWeight: '700',
      color: theme.primary,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    widgetCard: {
      backgroundColor: theme.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
      ...SHADOWS.sm,
    },
    widgetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.md,
    },
    widgetLabel: {
      fontSize: FONT_SIZES.md,
      color: theme.text,
      fontWeight: '500',
    },
    widgetHint: {
      fontSize: FONT_SIZES.sm,
      color: theme.textSecondary,
      marginTop: 2,
    },
    soundCard: {
      backgroundColor: theme.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.md,
      ...SHADOWS.sm,
    },
    soundRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.sm,
    },
    soundInfo: {
      flex: 1,
      marginRight: SPACING.sm,
    },
    soundName: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
      color: theme.text,
    },
    soundDescription: {
      fontSize: FONT_SIZES.sm,
      color: theme.textSecondary,
      marginTop: 2,
    },
    soundAction: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.round,
    },
    soundActionText: {
      fontSize: FONT_SIZES.sm,
      fontWeight: '600',
      color: '#FFFFFF',
      marginLeft: SPACING.xs,
    },
    uploadButton: {
      marginTop: SPACING.sm,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.round,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadButtonText: {
      fontSize: FONT_SIZES.sm,
      color: theme.text,
      marginLeft: SPACING.xs,
    },
    hintCard: {
      backgroundColor: theme.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginTop: SPACING.sm,
      flexDirection: 'row',
      alignItems: 'flex-start',
      ...SHADOWS.sm,
    },
    hintText: {
      flex: 1,
      marginLeft: SPACING.sm,
      fontSize: FONT_SIZES.sm,
      color: theme.textSecondary,
    },
    moodCard: {
      backgroundColor: theme.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      ...SHADOWS.sm,
    },
    moodText: {
      fontSize: FONT_SIZES.md,
      color: theme.text,
      fontWeight: '600',
    },
    moodSubtitle: {
      fontSize: FONT_SIZES.sm,
      color: theme.textSecondary,
      marginTop: SPACING.xs,
    },
    loaderContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
    },
  });

const PersonalizationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    themeKey,
    themePalette,
    setTheme,
    homeWidgets,
    setHomeWidgets,
    notificationSound,
    setNotificationSound,
    moodTrackingEnabled,
    setMoodTrackingEnabled,
    loading,
  } = usePreferences();
  const styles = useMemo(() => createStyles(themePalette), [themePalette]);
  const [uploading, setUploading] = useState(false);

  const handleThemeSelect = async (key: ThemeKey) => {
    await setTheme(key);
  };

  const handleWidgetToggle = async (key: WidgetKey) => {
    await setHomeWidgets({
      [key]: !homeWidgets[key],
    });
  };

  const handleSoundSelect = async (sound: NotificationSoundPreference) => {
    await setNotificationSound(sound);
  };

  const handleUploadSound = async () => {
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const file = result.assets[0];
      const soundPreference: NotificationSoundPreference = {
        type: 'uploaded',
        id: `uploaded-${Date.now()}`,
        name: file.name ?? 'Custom Sound',
        description: 'Custom uploaded reminder sound',
        fileUri: file.uri,
      };

      await setNotificationSound(soundPreference);
    } catch (error: any) {
      console.error('Failed to upload sound:', error);
      Alert.alert('Upload failed', error?.message || 'Unable to use this audio file right now.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer} edges={['top']}>
        <ActivityIndicator size="large" color={themePalette.primary} />
        <Text style={[styles.sectionSubtitle, { marginTop: SPACING.md }]}>Loading your personalization settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={themePalette.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personalization</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Themes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Custom Themes</Text>
              <Text style={styles.sectionSubtitle}>Switch up the vibe with curated palettes</Text>
            </View>
          </View>

          {Object.values(THEMES).map((theme) => (
            <TouchableOpacity
              key={theme.key}
              style={[styles.themeCard, theme.key === themeKey && { borderWidth: 2, borderColor: '#FFFFFF55' }]}
              activeOpacity={0.9}
              onPress={() => handleThemeSelect(theme.key)}
            >
              <LinearGradient
                colors={theme.previewGradient as [string, string]}
                style={styles.themeCardInner}
              >
                <View style={styles.themeNameRow}>
                  <Text style={styles.themeName}>{theme.name}</Text>
                  {theme.key === themeKey && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>Selected</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.themeDescription}>{theme.description}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Widgets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Home Widgets</Text>
              <Text style={styles.sectionSubtitle}>Choose the insights you see on the Home dashboard</Text>
            </View>
          </View>

          <View style={styles.widgetCard}>
            {(
              [
                ['showProgressOverview', 'Progress Overview'],
                ['showStreakLeaders', 'Streak Leaders'],
                ['showQuests', 'Quests'],
                ['showChallengeSpotlight', 'Challenge Spotlight'],
                ['showTeamChallenge', 'Team Challenge'],
                ['showPowerUps', 'Power-Ups'],
                ['showWeeklyRecap', 'Weekly Recap'],
                ['showUpcomingReminders', 'Upcoming Reminders'],
                ['showTodaysHabits', "Today’s Habits"],
                ['showQuote', 'Daily Quote'],
                ['showQuickActions', 'Quick Actions'],
              ] as Array<[WidgetKey, string]>
            ).map(([key, label], index) => (
              <View key={key} style={[styles.widgetRow, index === 10 && { marginBottom: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.widgetLabel}>{label}</Text>
                  <Text style={styles.widgetHint}>
                    {homeWidgets[key]
                      ? 'Visible on Home'
                      : 'Hidden from Home'}
                  </Text>
                </View>
                <Switch
                  value={Boolean(homeWidgets[key])}
                  onValueChange={() => handleWidgetToggle(key)}
                  thumbColor={homeWidgets[key] ? themePalette.primary : themePalette.border}
                  trackColor={{ false: themePalette.divider, true: `${themePalette.primary}55` }}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Notification Sounds */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Reminder Sound</Text>
              <Text style={styles.sectionSubtitle}>Pick the chime you’ll hear when habits nudge you</Text>
            </View>
          </View>

          {BUILT_IN_SOUNDS.map((sound) => (
            <TouchableOpacity
              key={sound.id}
              style={styles.soundCard}
              activeOpacity={0.85}
              onPress={() => handleSoundSelect(sound)}
            >
              <View style={styles.soundRow}>
                <View style={styles.soundInfo}>
                  <Text style={styles.soundName}>{sound.name}</Text>
                  <Text style={styles.soundDescription}>{sound.description}</Text>
                </View>
                {notificationSound?.id === sound.id ? (
                  <View style={styles.soundAction}>
                    <Icon name="check" size={18} color="#FFFFFF" />
                    <Text style={styles.soundActionText}>Active</Text>
                  </View>
                ) : (
                  <Icon name="chevron-right" size={22} color={themePalette.textSecondary} />
                )}
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.uploadButton, uploading && { opacity: 0.6 }]}
            onPress={handleUploadSound}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={themePalette.primary} />
            ) : (
              <>
                <Icon name="upload" size={18} color={themePalette.text} />
                <Text style={styles.uploadButtonText}>Upload custom sound</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.hintCard}>
            <Icon name="information" size={20} color={themePalette.accent} />
            <Text style={styles.hintText}>
              Custom uploads require a development build to register sounds with your device’s notification channel. In Expo Go you’ll still hear the default sound, but your selection will be saved for later builds.
            </Text>
          </View>
        </View>

        {/* Mood Tracking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood Tracking</Text>
          <View style={styles.moodCard}>
            <View style={styles.soundRow}>
              <View style={styles.soundInfo}>
                <Text style={styles.moodText}>Reflect after each habit</Text>
                <Text style={styles.moodSubtitle}>
                  Log how you feel when you complete a habit. We’ll prompt you with a quick rating so you can spot trends over time.
                </Text>
              </View>
              <Switch
                value={moodTrackingEnabled}
                onValueChange={setMoodTrackingEnabled}
                thumbColor={moodTrackingEnabled ? themePalette.primary : themePalette.border}
                trackColor={{ false: themePalette.divider, true: `${themePalette.primary}55` }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalizationScreen;
