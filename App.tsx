import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { RootStackParamList, TabParamList } from './src/types';
import { COLORS } from './src/constants/theme';

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
        </>
      )}
    </Stack.Navigator>
  );
};

// Main App Component
export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}
