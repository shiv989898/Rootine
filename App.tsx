// Import polyfills BEFORE any Firebase imports
import 'react-native-get-random-values';

import React, { useEffect, useMemo } from 'react';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { RootStackParamList, TabParamList } from './src/types';
import { COLORS } from './src/constants/theme';
import ErrorBoundary from './src/components/ErrorBoundary';
import { initializeNotifications } from './src/services/notifications/notificationService';
import { PreferencesProvider, usePreferences } from './src/contexts/PreferencesContext';

// Import screens
import OnboardingScreen from './src/screens/auth/OnboardingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import ProfileSetupScreen from './src/screens/auth/ProfileSetupScreen';

import HomeScreen from './src/screens/main/HomeScreen';
import HabitsScreen from './src/screens/main/HabitsScreen';
import FeedScreen from './src/screens/main/FeedScreen';
import DietScreen from './src/screens/main/DietScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import RecipeDetailScreen from './src/screens/diet/RecipeDetailScreen';
import FriendsListScreen from './src/screens/social/FriendsListScreen';
import SearchUsersScreen from './src/screens/social/SearchUsersScreen';
import ChallengesScreen from './src/screens/challenges/ChallengesScreen';
import LeaderboardScreen from './src/screens/leaderboard/LeaderboardScreen';
import BadgeShowcaseScreen from './src/screens/achievements/BadgeShowcaseScreen';
import WeeklyRecapScreen from './src/screens/main/WeeklyRecapScreen';
import PersonalizationScreen from './src/screens/settings/PersonalizationScreen';
import SettingsScreen from './src/screens/main/SettingsScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Bottom Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'home';

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Habits':
              iconName = 'check-circle';
              break;
            case 'Feed':
              iconName = 'newspaper';
              break;
            case 'Diet':
              iconName = 'food-apple';
              break;
            case 'Profile':
              iconName = 'account';
              break;
          }

          return <Icon name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Habits" component={HabitsScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Diet" component={DietScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // You can add a loading screen here
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!user ? (
        // Auth screens
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        </>
      ) : (
        // Main app screens
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
          <Stack.Screen name="FriendsList" component={FriendsListScreen} />
          <Stack.Screen name="SearchUsers" component={SearchUsersScreen} />
          <Stack.Screen name="Challenges" component={ChallengesScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="BadgeShowcase" component={BadgeShowcaseScreen} />
          <Stack.Screen name="WeeklyRecap" component={WeeklyRecapScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Personalization" component={PersonalizationScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const ThemedAppContainer: React.FC = () => {
  const { themePalette, isDark } = usePreferences();

  const navigationTheme = useMemo(() => {
    const base = isDark ? NavigationDarkTheme : NavigationDefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: themePalette.primary,
        background: themePalette.background,
        card: themePalette.card,
        text: themePalette.text,
        border: themePalette.border,
        notification: themePalette.accent,
      },
    };
  }, [themePalette, isDark]);

  const paperTheme = useMemo(() => {
    const base = isDark ? MD3DarkTheme : MD3LightTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: themePalette.primary,
        secondary: themePalette.secondary,
        background: themePalette.background,
        surface: themePalette.surface,
        onSurface: themePalette.text,
        surfaceVariant: themePalette.card,
        outline: themePalette.border,
        error: themePalette.error,
        onPrimary: isDark ? '#000000' : '#FFFFFF',
      },
    };
  }, [themePalette, isDark]);

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

// Main App Component
export default function App() {
  // Initialize notifications on app start
  useEffect(() => {
    initializeNotifications();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <PreferencesProvider>
            <ThemedAppContainer />
          </PreferencesProvider>
        </AuthProvider>
        <Toast />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
