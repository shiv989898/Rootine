import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth } from './config';
import { db } from './config';
import {
  HomeWidgetPreferences,
  NotificationSoundPreference,
  UserPersonalizationPreferences,
} from '@/types';
import { DEFAULT_THEME, THEMES, ThemeKey } from '@/constants/themes';

const COLLECTION_KEY = 'preferences';
const DOCUMENT_KEY = 'personalization';

export const DEFAULT_WIDGET_PREFERENCES: HomeWidgetPreferences = {
  showProgressOverview: true,
  showStreakLeaders: true,
  showQuests: true,
  showChallengeSpotlight: true,
  showTeamChallenge: true,
  showPowerUps: true,
  showWeeklyRecap: true,
  showUpcomingReminders: true,
  showTodaysHabits: true,
  showQuote: true,
  showQuickActions: true,
};

export const DEFAULT_NOTIFICATION_SOUND: NotificationSoundPreference = {
  type: 'default',
  id: 'default',
  name: 'Default',
  description: 'System default reminder chime',
};

export const DEFAULT_PREFERENCES: UserPersonalizationPreferences = {
  theme: DEFAULT_THEME.key,
  seasonalTheme: null,
  useSeasonalTheme: false,
  homeWidgets: DEFAULT_WIDGET_PREFERENCES,
  notificationSound: DEFAULT_NOTIFICATION_SOUND,
  moodTrackingEnabled: false,
  lastUpdated: new Date(),
};

const mapSnapshotToPreferences = (data: any): UserPersonalizationPreferences => {
  if (!data) {
    return DEFAULT_PREFERENCES;
  }

  return {
    theme: (data.theme as ThemeKey) || DEFAULT_PREFERENCES.theme,
    seasonalTheme: (data.seasonalTheme as ThemeKey | null) ?? DEFAULT_PREFERENCES.seasonalTheme,
    useSeasonalTheme: data.useSeasonalTheme ?? DEFAULT_PREFERENCES.useSeasonalTheme,
    homeWidgets: {
      ...DEFAULT_WIDGET_PREFERENCES,
      ...(data.homeWidgets ?? {}),
    },
    notificationSound: {
      ...DEFAULT_NOTIFICATION_SOUND,
      ...(data.notificationSound ?? {}),
    },
    moodTrackingEnabled: data.moodTrackingEnabled ?? DEFAULT_PREFERENCES.moodTrackingEnabled,
    lastUpdated: data.lastUpdated?.toDate?.() ?? new Date(data.lastUpdated ?? Date.now()),
  };
};

const getUserPreferenceRef = () => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  return doc(db, 'users', userId, COLLECTION_KEY, DOCUMENT_KEY);
};

export const getPersonalizationPreferences = async (): Promise<UserPersonalizationPreferences> => {
  try {
    const ref = getUserPreferenceRef();
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      return DEFAULT_PREFERENCES;
    }

    return mapSnapshotToPreferences(snapshot.data());
  } catch (error) {
    console.error('Error fetching personalization preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

export const ensurePersonalizationPreferences = async () => {
  try {
    const ref = getUserPreferenceRef();
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      await setDoc(ref, {
        ...DEFAULT_PREFERENCES,
        lastUpdated: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error ensuring personalization preferences:', error);
  }
};

export const updatePersonalizationPreferences = async (
  updates: Partial<UserPersonalizationPreferences>
): Promise<UserPersonalizationPreferences> => {
  const ref = getUserPreferenceRef();

  const sanitizedUpdates = Object.entries(updates).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      if (value !== undefined) {
        if (key === 'homeWidgets' && typeof value === 'object' && value !== null) {
          acc[key] = {
            ...DEFAULT_WIDGET_PREFERENCES,
            ...value,
          };
        } else if (key === 'notificationSound' && typeof value === 'object' && value !== null) {
          acc[key] = {
            ...DEFAULT_NOTIFICATION_SOUND,
            ...value,
          };
        } else if (key === 'theme' && value && typeof value === 'string') {
          const nextTheme = value as ThemeKey;
          acc[key] = THEMES[nextTheme] ? nextTheme : DEFAULT_THEME.key;
        } else {
          acc[key] = value;
        }
      }
      return acc;
    },
    {}
  );

  await updateDoc(ref, {
    ...sanitizedUpdates,
    lastUpdated: serverTimestamp(),
  });

  const snapshot = await getDoc(ref);
  return mapSnapshotToPreferences(snapshot.data());
};

export const updateWidgetPreferences = async (
  updates: Partial<HomeWidgetPreferences>
): Promise<UserPersonalizationPreferences> => {
  return updatePersonalizationPreferences({
    homeWidgets: {
      ...DEFAULT_WIDGET_PREFERENCES,
      ...updates,
    },
  });
};

export const updateMoodTrackingPreference = async (
  enabled: boolean
): Promise<UserPersonalizationPreferences> => {
  return updatePersonalizationPreferences({ moodTrackingEnabled: enabled });
};

export const updateNotificationSoundPreference = async (
  sound: NotificationSoundPreference
): Promise<UserPersonalizationPreferences> => {
  return updatePersonalizationPreferences({ notificationSound: sound });
};

export const updateThemePreference = async (
  theme: ThemeKey
): Promise<UserPersonalizationPreferences> => {
  return updatePersonalizationPreferences({ theme });
};
