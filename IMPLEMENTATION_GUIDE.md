# 🚀 Rootine - Complete Implementation Guide

This guide provides step-by-step instructions to complete all remaining features of the Rootine app.

## 📊 Current Status

### ✅ Completed (30%)
- Project structure and configuration
- Type definitions for all features
- Firebase configuration
- Authentication system (Login, Signup, Guest Mode, Profile Setup)
- Gemini AI service for diet and recipes
- Notification service setup
- Basic navigation structure
- Theme and design system
- Helper utilities and functions
- Complete documentation

### 🚧 In Progress
- Habit tracking system (service created, UI pending)

### ⏳ Pending (70%)
- Social features
- Challenges and gamification
- Diet UI screens
- Media uploads
- Shopping list and meal planning
- Premium features
- Polish and final touches

---

## 📝 Implementation Roadmap

### Phase 1: Complete Habit Tracking System (Priority: HIGH)

#### Step 1: Fix Firebase Setup

Currently using `@react-native-firebase` which doesn't work with Expo Go. Options:

**Option A: Stick with Expo (Recommended for faster development)**
```bash
# Uninstall React Native Firebase
npm uninstall @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage

# The web Firebase SDK is already in package.json
# Just ensure firebase@^10.7.2 is installed (already done)
```

Then update the import in `src/services/firebase/habitService.ts`:
```typescript
// Change FROM:
import firestore from '@react-native-firebase/firestore';

// Change TO:
import { collection, addDoc, query, where, getDocs, /* etc */ } from 'firebase/firestore';
import { db } from './config';

const habitsCollection = collection(db, 'habits');
```

**Option B: Use Expo Development Build (for native Firebase)**
- Keep @react-native-firebase packages
- Run `expo prebuild` to generate native code
- Build with EAS: `eas build --platform android --profile development`
- Can't use Expo Go anymore, but gets full Firebase SDK

#### Step 2: Replace HabitsScreen with Full Implementation

File: `src/screens/main/HabitsScreen.tsx`

Key features to implement:
- Habit list with completion checkboxes
- Progress bar showing today's completions
- Create habit modal with category selection
- Pull-to-refresh
- Empty state when no habits exist
- FAB (Floating Action Button) to add habits

Reference code created: See the HabitCard component at `src/components/habits/HabitCard.tsx`

#### Step 3: Create Additional Habit Components

**File: `src/components/habits/HabitList.tsx`**
```typescript
// Displays filtered/sorted list of habits
// Props: habits[], filter (all/completed/incomplete), sortBy (name/streak/date)
```

**File: `src/components/habits/HabitCalendar.tsx`**
```typescript
// Calendar view showing completion history
// Use react-native-calendars
// Mark completed dates with green dots
```

**File: `src/screens/main/HabitDetailScreen.tsx`**
```typescript
// Show habit statistics
// Edit habit details
// View completion history
// Delete habit option
```

**File: `src/screens/main/CreateHabitScreen.tsx`**
```typescript
// Full-screen habit creation
// Category selection with icons
// Color picker
// Recurrence options (daily, weekly, custom)
// Reminder time picker
```

---

### Phase 2: Social Features (Priority: MEDIUM)

#### Step 1: Create Social Service

**File: `src/services/firebase/socialService.ts`**

Functions needed:
```typescript
// Friend Management
export const sendFriendRequest = async (toUserId: string): Promise<void>
export const acceptFriendRequest = async (requestId: string): Promise<void>
export const getFriends = async (): Promise<User[]>
export const searchUserByInviteCode = async (code: string): Promise<User | null>

// Posts
export const createPost = async (content: string, imageUrl?: string): Promise<Post>
export const getFeedPosts = async (): Promise<Post[]>
export const likePost = async (postId: string): Promise<void>
export const commentOnPost = async (postId: string, content: string): Promise<Comment>

// Leaderboard
export const getLeaderboard = async (period: 'week' | 'month' | 'all'): Promise<User[]>
```

#### Step 2: Update FeedScreen

**File: `src/screens/main/FeedScreen.tsx`**

Features:
- Scrollable feed of posts from friends
- Like and comment buttons
- Create post FAB
- Filter (friends only / global)
- Pull to refresh
- Infinite scroll / pagination

Components to create:
- `src/components/social/PostCard.tsx` - Individual post display
- `src/components/social/CommentItem.tsx` - Comment display
- `src/components/social/CreatePostModal.tsx` - Post creation form

#### Step 3: Friends Management

**File: `src/screens/social/FriendsScreen.tsx`**

Features:
- Friends list
- Pending requests (sent/received)
- Add friend by invite code
- Search users
- Remove friend option

**File: `src/screens/social/LeaderboardScreen.tsx`**

Features:
- Ranked list of users by points
- Filter by time period
- Show user stats (level, streak, badges)
- Current user highlighted

---

### Phase 3: Challenges & Gamification (Priority: MEDIUM)

#### Step 1: Create Challenge Service

**File: `src/services/firebase/challengeService.ts`**

```typescript
export const getActiveChallenges = async (): Promise<Challenge[]>
export const joinChallenge = async (challengeId: string): Promise<void>
export const getChallengeProgress = async (challengeId: string): Promise<number>
export const completeChallengeTask = async (challengeId: string, taskId: string): Promise<void>
```

#### Step 2: Implement Points & Badges System

**File: `src/utils/gamification.ts`**

```typescript
// Calculate points for actions
export const POINTS = {
  COMPLETE_HABIT: 10,
  MAINTAIN_STREAK: 5,
  COMPLETE_CHALLENGE: 50,
  SOCIAL_INTERACTION: 2,
  CREATE_POST: 5,
};

// Award badge
export const checkAndAwardBadges = async (userId: string): Promise<Badge[]>

// Level up logic
export const calculateLevel = (points: number): number
export const getPointsForNextLevel = (currentLevel: number): number
```

#### Step 3: Create Challenge Screens

**File: `src/screens/challenges/ChallengesScreen.tsx`**
- Browse available challenges
- View joined challenges
- Progress tracking

**File: `src/screens/challenges/ChallengeDetailScreen.tsx`**
- Challenge details
- Participant list
- Join/leave button
- Progress bar

**File: `src/screens/profile/AchievementsScreen.tsx`**
- Display earned badges
- Show locked badges
- Badge details and requirements

---

### Phase 4: Diet & Recipe UI (Priority: MEDIUM)

The AI service is already built. Just need UI screens.

#### Update DietScreen

**File: `src/screens/main/DietScreen.tsx`**

Features:
- Generate diet plan button
- Display current meal plan
- Macros overview (calories, protein, carbs, fat)
- Recipe suggestions
- Save favorite recipes

#### Create Supporting Components

**File: `src/components/diet/MealCard.tsx`**
```typescript
// Display meal with image, name, calories
// Props: meal, onPress
```

**File: `src/components/diet/MacrosChart.tsx`**
```typescript
// Visual representation of macros
// Use react-native-svg or similar
```

**File: `src/screens/diet/RecipeDetailScreen.tsx`**
```typescript
// Full recipe details
// Ingredients list
// Step-by-step instructions
// Nutrition info
// Save to favorites button
```

**File: `src/screens/diet/GenerateDietPlanScreen.tsx`**
```typescript
// Form to set diet preferences
// Goal selection (weight loss/gain/maintain)
// Generate button
// Loading state while AI generates plan
```

---

### Phase 5: Media Uploads (Priority: LOW)

#### Step 1: Image Upload Service

**File: `src/services/firebase/storageService.ts`**

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';
import * as ImagePicker from 'expo-image-picker';

export const pickImage = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access camera roll is required!');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
  return null;
};

export const uploadImage = async (
  uri: string,
  path: string
): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  
  return await getDownloadURL(storageRef);
};

export const uploadProfilePhoto = async (uri: string, userId: string): Promise<string> => {
  return await uploadImage(uri, `users/${userId}/profile.jpg`);
};

export const uploadPostImage = async (uri: string, postId: string): Promise<string> => {
  return await uploadImage(uri, `posts/${postId}.jpg`);
};

export const uploadProgressPhoto = async (uri: string, userId: string): Promise<string> => {
  const timestamp = Date.now();
  return await uploadImage(uri, `progress/${userId}/${timestamp}.jpg`);
};
```

#### Step 2: Update Screens to Use Image Uploads

- ProfileSetupScreen: Add avatar upload
- CreatePostModal: Add image attachment
- ProfileScreen: Add progress photos gallery

---

### Phase 6: Shopping List & Meal Planning (Priority: LOW)

#### Step 1: Shopping List Service

**File: `src/services/firebase/shoppingService.ts`**

```typescript
export const generateShoppingList = async (dietPlanId: string): Promise<ShoppingList>
export const toggleShoppingItem = async (itemId: string, purchased: boolean): Promise<void>
export const addCustomItem = async (listId: string, item: Ingredient): Promise<void>
```

#### Step 2: Create Shopping List Screen

**File: `src/screens/diet/ShoppingListScreen.tsx`**

Features:
- Checkbox list of ingredients
- Categorized by type (produce, dairy, etc.)
- Generate from current diet plan
- Add custom items
- Clear completed items

#### Step 3: Meal Planning Calendar

**File: `src/screens/diet/MealPlanningScreen.tsx`**

Features:
- Weekly calendar view
- Assign meals to days
- Drag & drop to reschedule
- Generate shopping list from week

---

### Phase 7: Premium Features (Priority: LOW)

#### Step 1: Subscription Service

**File: `src/services/subscriptionService.ts`**

```typescript
import * as InAppPurchases from 'expo-in-app-purchases';

export const PREMIUM_PRODUCT_IDS = {
  MONTHLY: 'premium_monthly',
  YEARLY: 'premium_yearly',
};

export const initializePurchases = async (): Promise<void>
export const purchaseSubscription = async (productId: string): Promise<void>
export const restorePurchases = async (): Promise<void>
export const isPremiumUser = async (): Promise<boolean>
```

#### Step 2: Premium Features Implementation

**Premium-only features to gate:**
- Unlimited AI diet plan generations (free: 3/week)
- Custom themes
- Export data (CSV/PDF)
- Advanced analytics
- Ad-free experience

**File: `src/screens/premium/PremiumScreen.tsx`**

Features:
- Feature comparison table
- Pricing cards
- Purchase buttons
- Restore purchases button
- Terms and privacy links

#### Step 3: Ad Integration (for free tier)

```bash
npm install expo-ads-admob
```

**File: `src/services/adService.ts`**

```typescript
import { AdMobBanner, AdMobInterstitial } from 'expo-ads-admob';

export const showBannerAd = (): void
export const showInterstitialAd = async (): Promise<void>
```

Place banner ads:
- Bottom of FeedScreen
- Bottom of DietScreen
- Between habit cards (every 5th)

---

### Phase 8: Polish & Final Touches (Priority: HIGH before launch)

#### Step 1: App Icons & Splash Screen

```bash
# Generate icons and splash screen
npx expo install expo-splash-screen
```

**Update `app.json`:**
```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4CAF50"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.rootine"
    },
    "android": {
      "package": "com.yourcompany.rootine",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4CAF50"
      }
    }
  }
}
```

#### Step 2: Error Boundaries

**File: `src/components/ErrorBoundary.tsx`**

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Button } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
            Oops! Something went wrong
          </Text>
          <Text style={{ marginBottom: 20, textAlign: 'center' }}>
            We're sorry for the inconvenience. Please try restarting the app.
          </Text>
          <Button
            title="Try Again"
            onPress={() => this.setState({ hasError: false })}
          />
        </View>
      );
    }

    return this.props.children;
  }
}
```

Update `App.tsx` to wrap everything in ErrorBoundary.

#### Step 3: Loading States

Create reusable loading component:

**File: `src/components/LoadingSpinner.tsx`**

```typescript
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '@/constants/theme';

interface Props {
  message?: string;
}

export const LoadingSpinner: React.FC<Props> = ({ message }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    {message && <Text style={styles.message}>{message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  message: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
```

#### Step 4: Empty States

**File: `src/components/EmptyState.tsx`**

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING } from '@/constants/theme';

interface Props {
  icon: string;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<Props> = ({ icon, title, message, action }) => (
  <View style={styles.container}>
    <Icon name={icon} size={64} color={COLORS.lightGray} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {action}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});
```

#### Step 5: Animations

Add micro-interactions:
- Button press animations
- Screen transitions
- Pull-to-refresh animations
- Swipe gestures for actions

Use:
```typescript
import { Animated } from 'react-native';
// or
import Animated from 'react-native-reanimated';
```

#### Step 6: Accessibility

Ensure all interactive elements have:
```typescript
accessible={true}
accessibilityLabel="Description"
accessibilityHint="What happens when you tap"
accessibilityRole="button"
```

#### Step 7: Testing

Before launch:
- Test all user flows end-to-end
- Test on both iOS and Android
- Test with slow network
- Test offline functionality
- Test with guest user
- Test with premium user
- Test error scenarios
- Memory leak testing

---

## 🔥 Quick Wins (Implement These First)

1. **Fix Firebase Setup** (30 min)
   - Switch to web Firebase SDK for Expo compatibility
   - OR set up Expo Development Build

2. **Complete HabitsScreen** (2-3 hours)
   - Use the HabitCard component already created
   - Add create/edit/delete functionality
   - Add progress tracking

3. **Basic Social Feed** (3-4 hours)
   - Simple post creation
   - Display feed
   - Like functionality

4. **Diet Plan Generation UI** (2 hours)
   - Button to trigger AI generation
   - Display generated plan
   - Save plan functionality

5. **Profile Photo Upload** (1 hour)
   - Add image picker to profile
   - Upload to Firebase Storage
   - Display in profile

---

## 🐛 Known Issues to Fix

1. **Firebase Module Resolution**
   - `@react-native-firebase` doesn't work with Expo Go
   - Solution: Use web Firebase SDK

2. **Type Errors**
   - Some `any` types in habitService
   - Missing color constants (white, gray, orange, etc.) - FIXED
   - Missing SHADOWS.medium - FIXED

3. **Missing Dependencies**
   - `@types/react-native-vector-icons` for TypeScript support
   - Run: `npm install --save-dev @types/react-native-vector-icons`

4. **Console Errors**
   - Update tsconfig to include 'dom' lib for console support

---

## 📦 Recommended Package Additions

```bash
# Charts and visualizations
npm install react-native-svg react-native-chart-kit

# Calendar for habits
npm install react-native-calendars

# Better forms
npm install formik yup

# State management (if needed)
npm install zustand
# or
npm install @reduxjs/toolkit react-redux

# In-app purchases
expo install expo-in-app-purchases

# Admob ads
expo install expo-ads-admob

# Better animations
npm install react-native-reanimated
```

---

## 🚀 Deployment Checklist

### Before Submitting to App Stores:

- [ ] Complete all core features
- [ ] Test on real devices (iOS & Android)
- [ ] Add app icons (1024x1024)
- [ ] Add splash screen
- [ ] Set up Firebase security rules
- [ ] Set up Firebase App Check
- [ ] Test payments/subscriptions
- [ ] Add privacy policy URL
- [ ] Add terms of service URL
- [ ] Test analytics tracking
- [ ] Set up crash reporting (Sentry)
- [ ] Performance optimization
- [ ] Remove console.logs
- [ ] Update version numbers
- [ ] Create app store screenshots
- [ ] Write app store descriptions
- [ ] Set up TestFlight/Google Play beta
- [ ] Get beta tester feedback
- [ ] Fix critical bugs
- [ ] Submit for review

---

## 💡 Pro Tips

1. **Start Small**: Don't try to implement everything at once. Focus on core features first.

2. **Test Early**: Test each feature as you build it. Don't wait until the end.

3. **Use Expo Go**: For rapid development, stick with Expo Go and web Firebase SDK.

4. **Mock Data First**: Build UI with mock data, then integrate real services.

5. **Commit Often**: Use git to save progress frequently.

6. **Mobile-First**: Design for mobile screens first, then scale up.

7. **Performance**: Use FlatList for long lists, optimize images, lazy load screens.

8. **User Feedback**: Add loading states and error messages everywhere.

9. **Analytics**: Track user actions to understand behavior.

10. **Community**: Join React Native Discord for help.

---

## 📚 Learning Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Navigation Docs](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

---

## 🤝 Getting Help

If you get stuck:
1. Check the docs above
2. Search Stack Overflow
3. Ask in React Native Discord
4. Check GitHub issues
5. Use ChatGPT/Claude for code help

---

**Good luck building Rootine! 🌱**

Remember: Done is better than perfect. Ship early, iterate fast, and listen to users.
