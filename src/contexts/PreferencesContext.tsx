import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  DEFAULT_NOTIFICATION_SOUND,
  DEFAULT_PREFERENCES,
  DEFAULT_WIDGET_PREFERENCES,
  ensurePersonalizationPreferences,
  getPersonalizationPreferences,
  updateMoodTrackingPreference,
  updateNotificationSoundPreference,
  updateThemePreference,
  updateWidgetPreferences,
} from '@/services/firebase/preferencesService';
import {
  HomeWidgetPreferences,
  NotificationSoundPreference,
  UserPersonalizationPreferences,
} from '@/types';
import { DEFAULT_THEME, ThemeKey, THEMES } from '@/constants/themes';

interface PreferencesContextValue {
  preferences: UserPersonalizationPreferences;
  loading: boolean;
  themeKey: ThemeKey;
  themePalette: typeof THEMES[ThemeKey]['palette'];
  isDark: boolean;
  homeWidgets: HomeWidgetPreferences;
  notificationSound: NotificationSoundPreference;
  moodTrackingEnabled: boolean;
  setTheme: (theme: ThemeKey) => Promise<void>;
  setHomeWidgets: (updates: Partial<HomeWidgetPreferences>) => Promise<void>;
  setNotificationSound: (sound: NotificationSoundPreference) => Promise<void>;
  setMoodTrackingEnabled: (enabled: boolean) => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPersonalizationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  const loadPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(DEFAULT_PREFERENCES);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await ensurePersonalizationPreferences();
      const data = await getPersonalizationPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to load personalization preferences:', error);
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const setTheme = useCallback(
    async (theme: ThemeKey) => {
      try {
        const updated = await updateThemePreference(theme);
        setPreferences(updated);
      } catch (error) {
        console.error('Failed to update theme preference:', error);
      }
    },
    []
  );

  const setHomeWidgets = useCallback(
    async (updates: Partial<HomeWidgetPreferences>) => {
      try {
        const updated = await updateWidgetPreferences(updates);
        setPreferences(updated);
      } catch (error) {
        console.error('Failed to update widget preferences:', error);
      }
    },
    []
  );

  const setNotificationSound = useCallback(
    async (sound: NotificationSoundPreference) => {
      try {
        const updated = await updateNotificationSoundPreference(sound);
        setPreferences(updated);
      } catch (error) {
        console.error('Failed to update notification sound preference:', error);
      }
    },
    []
  );

  const setMoodTrackingEnabled = useCallback(
    async (enabled: boolean) => {
      try {
        const updated = await updateMoodTrackingPreference(enabled);
        setPreferences(updated);
      } catch (error) {
        console.error('Failed to update mood tracking preference:', error);
      }
    },
    []
  );

  const value = useMemo<PreferencesContextValue>(() => {
    const themeKey = preferences.theme || DEFAULT_THEME.key;
    const theme = THEMES[themeKey] ?? DEFAULT_THEME;

    return {
      preferences,
      loading,
      themeKey,
      themePalette: theme.palette,
      isDark: Boolean(theme.isDark),
      homeWidgets: preferences.homeWidgets ?? DEFAULT_WIDGET_PREFERENCES,
      notificationSound: preferences.notificationSound ?? DEFAULT_NOTIFICATION_SOUND,
      moodTrackingEnabled: preferences.moodTrackingEnabled ?? false,
      setTheme,
      setHomeWidgets,
      setNotificationSound,
      setMoodTrackingEnabled,
      refreshPreferences: loadPreferences,
    };
  }, [preferences, loading, setTheme, setHomeWidgets, setNotificationSound, setMoodTrackingEnabled, loadPreferences]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = (): PreferencesContextValue => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
