# 📘 Rootine API Reference

Complete reference for all services and their functions.

## 🔥 Firebase Services

### Authentication Service

**File**: `src/services/firebase/authService.ts`

#### `signUp(email, password, displayName)`
Creates a new user account.

**Parameters**:
- `email` (string): User's email address
- `password` (string): User's password (min 8 characters)
- `displayName` (string): User's display name

**Returns**: `Promise<User>`

**Example**:
```typescript
import { signUp } from '@/services/firebase/authService';

try {
  const user = await signUp('user@example.com', 'password123', 'John Doe');
  console.log('User created:', user.id);
} catch (error) {
  console.error('Sign up failed:', error.message);
}
```

---

#### `signIn(email, password)`
Signs in an existing user.

**Parameters**:
- `email` (string): User's email
- `password` (string): User's password

**Returns**: `Promise<User>`

**Example**:
```typescript
import { signIn } from '@/services/firebase/authService';

const user = await signIn('user@example.com', 'password123');
```

---

#### `signInAsGuest(displayName)`
Creates a guest user (stored locally only).

**Parameters**:
- `displayName` (string): Guest's display name

**Returns**: `Promise<User>`

**Example**:
```typescript
import { signInAsGuest } from '@/services/firebase/authService';

const guestUser = await signInAsGuest('Guest User');
```

---

#### `signOut()`
Signs out the current user.

**Returns**: `Promise<void>`

**Example**:
```typescript
import { signOut } from '@/services/firebase/authService';

await signOut();
```

---

#### `updateUserProfile(userId, updates)`
Updates user profile information.

**Parameters**:
- `userId` (string): User's ID
- `updates` (Partial<UserProfile>): Profile fields to update

**Returns**: `Promise<void>`

**Example**:
```typescript
import { updateUserProfile } from '@/services/firebase/authService';

await updateUserProfile('user123', {
  age: 25,
  weight: 70,
  height: 175,
  dietaryPreference: 'vegetarian',
});
```

---

#### `getCurrentUser()`
Gets the currently authenticated user.

**Returns**: `Promise<User | null>`

**Example**:
```typescript
import { getCurrentUser } from '@/services/firebase/authService';

const user = await getCurrentUser();
if (user) {
  console.log('Logged in as:', user.displayName);
}
```

---

#### `resetPassword(email)`
Sends password reset email.

**Parameters**:
- `email` (string): User's email address

**Returns**: `Promise<void>`

**Example**:
```typescript
import { resetPassword } from '@/services/firebase/authService';

await resetPassword('user@example.com');
alert('Password reset email sent!');
```

---

### Habit Service

**File**: `src/services/firebase/habitService.ts`

#### `createHabit(habitData)`
Creates a new habit.

**Parameters**:
- `habitData` (Omit<Habit, 'id' | 'userId' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'completedDates' | 'updatedAt'>)

**Required fields**:
```typescript
{
  title: string;
  description: string;
  category: HabitCategory;
  recurrence: Recurrence;
  reminderTime?: string;
  reminderEnabled: boolean;
  color: string;
  icon: string;
}
```

**Returns**: `Promise<Habit>`

**Example**:
```typescript
import { createHabit } from '@/services/firebase/habitService';
import { COLORS, HABIT_ICONS } from '@/constants/theme';

const habit = await createHabit({
  title: 'Morning Run',
  description: '30 minutes of running',
  category: 'fitness',
  recurrence: 'daily',
  reminderTime: '06:00',
  reminderEnabled: true,
  color: COLORS.fitness,
  icon: HABIT_ICONS.fitness[0],
});
```

---

#### `getUserHabits()`
Gets all habits for the current user.

**Returns**: `Promise<Habit[]>`

**Example**:
```typescript
import { getUserHabits } from '@/services/firebase/habitService';

const habits = await getUserHabits();
console.log(`You have ${habits.length} habits`);
```

---

#### `getHabitById(habitId)`
Gets a single habit by ID.

**Parameters**:
- `habitId` (string): Habit's ID

**Returns**: `Promise<Habit | null>`

**Example**:
```typescript
import { getHabitById } from '@/services/firebase/habitService';

const habit = await getHabitById('habit123');
if (habit) {
  console.log('Habit:', habit.title);
}
```

---

#### `updateHabit(habitId, updates)`
Updates a habit.

**Parameters**:
- `habitId` (string): Habit's ID
- `updates` (Partial<Habit>): Fields to update

**Returns**: `Promise<void>`

**Example**:
```typescript
import { updateHabit } from '@/services/firebase/habitService';

await updateHabit('habit123', {
  title: 'Evening Run',
  reminderTime: '18:00',
});
```

---

#### `deleteHabit(habitId)`
Deletes a habit and all its completions.

**Parameters**:
- `habitId` (string): Habit's ID

**Returns**: `Promise<void>`

**Example**:
```typescript
import { deleteHabit } from '@/services/firebase/habitService';

await deleteHabit('habit123');
console.log('Habit deleted');
```

---

#### `toggleHabitCompletion(habitId, date?)`
Toggles habit completion for a specific date.

**Parameters**:
- `habitId` (string): Habit's ID
- `date` (Date, optional): Date to toggle (defaults to today)

**Returns**: `Promise<void>`

**Example**:
```typescript
import { toggleHabitCompletion } from '@/services/firebase/habitService';

// Toggle today
await toggleHabitCompletion('habit123');

// Toggle specific date
await toggleHabitCompletion('habit123', new Date('2024-01-15'));
```

---

#### `getHabitCompletions(habitId)`
Gets all completions for a habit.

**Parameters**:
- `habitId` (string): Habit's ID

**Returns**: `Promise<HabitCompletion[]>`

**Example**:
```typescript
import { getHabitCompletions } from '@/services/firebase/habitService';

const completions = await getHabitCompletions('habit123');
console.log(`Completed ${completions.length} times`);
```

---

#### `isHabitCompletedOnDate(habitId, date)`
Checks if habit is completed on a specific date.

**Parameters**:
- `habitId` (string): Habit's ID
- `date` (Date): Date to check

**Returns**: `Promise<boolean>`

**Example**:
```typescript
import { isHabitCompletedOnDate } from '@/services/firebase/habitService';

const isCompleted = await isHabitCompletedOnDate('habit123', new Date());
if (isCompleted) {
  console.log('Already completed today!');
}
```

---

#### `getTodaysCompletedHabits()`
Gets IDs of habits completed today.

**Returns**: `Promise<string[]>`

**Example**:
```typescript
import { getTodaysCompletedHabits } from '@/services/firebase/habitService';

const completedIds = await getTodaysCompletedHabits();
console.log(`${completedIds.length} habits completed today`);
```

---

#### `getHabitStatistics()`
Gets habit statistics for the current user.

**Returns**: `Promise<{ totalHabits, completedToday, totalCompletions, bestStreak }>`

**Example**:
```typescript
import { getHabitStatistics } from '@/services/firebase/habitService';

const stats = await getHabitStatistics();
console.log(`Total: ${stats.totalHabits}, Today: ${stats.completedToday}`);
console.log(`Best streak: ${stats.bestStreak} days`);
```

---

### Gemini AI Service

**File**: `src/services/api/geminiService.ts`

#### `generateDietPlan(userProfile, preferences)`
Generates a personalized diet plan.

**Parameters**:
- `userProfile` (UserProfile): User's profile data
- `preferences` (object): Diet preferences
  - `goal?: string` - Weight loss, gain, or maintain
  - `mealCount?: number` - Number of meals (default 3)
  - `excludeIngredients?: string[]` - Ingredients to exclude

**Returns**: `Promise<DietPlan>`

**Example**:
```typescript
import { generateDietPlan } from '@/services/api/geminiService';

const dietPlan = await generateDietPlan(user.profile, {
  goal: 'weight loss',
  mealCount: 4,
  excludeIngredients: ['dairy', 'nuts'],
});

console.log('Calories:', dietPlan.totalCalories);
dietPlan.meals.forEach(meal => {
  console.log(`${meal.name}: ${meal.calories} cal`);
});
```

---

#### `generateRecipe(recipeName, preferences)`
Generates a detailed recipe.

**Parameters**:
- `recipeName` (string): Name of the recipe
- `preferences` (object): Recipe preferences
  - `servings?: number` - Number of servings
  - `dietaryRestrictions?: string[]` - Dietary restrictions
  - `cookingTime?: number` - Max cooking time in minutes

**Returns**: `Promise<Recipe>`

**Example**:
```typescript
import { generateRecipe } from '@/services/api/geminiService';

const recipe = await generateRecipe('Vegan Buddha Bowl', {
  servings: 2,
  dietaryRestrictions: ['vegan', 'gluten-free'],
  cookingTime: 30,
});

console.log('Prep time:', recipe.prepTime);
console.log('Ingredients:', recipe.ingredients.length);
```

---

#### `getMealSuggestions(preferences)`
Gets quick meal suggestions.

**Parameters**:
- `preferences` (object): Meal preferences
  - `mealType` - breakfast, lunch, dinner, snack
  - `dietaryPreference?` - vegetarian, vegan, etc.
  - `maxCalories?` - Maximum calories

**Returns**: `Promise<string[]>` - Array of meal names

**Example**:
```typescript
import { getMealSuggestions } from '@/services/api/geminiService';

const suggestions = await getMealSuggestions({
  mealType: 'breakfast',
  dietaryPreference: 'vegetarian',
  maxCalories: 400,
});

suggestions.forEach(meal => console.log(meal));
```

---

## 🔔 Notification Service

**File**: `src/utils/notifications.ts`

#### `requestPermissions()`
Requests notification permissions from user.

**Returns**: `Promise<boolean>` - true if granted

**Example**:
```typescript
import { requestPermissions } from '@/utils/notifications';

const granted = await requestPermissions();
if (granted) {
  console.log('Notifications enabled!');
}
```

---

#### `scheduleHabitReminder(habit)`
Schedules a daily reminder for a habit.

**Parameters**:
- `habit` (Habit): Habit object with reminderTime

**Returns**: `Promise<string>` - Notification ID

**Example**:
```typescript
import { scheduleHabitReminder } from '@/utils/notifications';

const notificationId = await scheduleHabitReminder(habit);
// Save notificationId to cancel later
```

---

#### `cancelNotification(notificationId)`
Cancels a scheduled notification.

**Parameters**:
- `notificationId` (string): Notification ID to cancel

**Returns**: `Promise<void>`

**Example**:
```typescript
import { cancelNotification } from '@/utils/notifications';

await cancelNotification('notification123');
```

---

#### `sendStreakAlert(streak)`
Sends a streak milestone notification.

**Parameters**:
- `streak` (number): Current streak count

**Returns**: `Promise<void>`

**Example**:
```typescript
import { sendStreakAlert } from '@/utils/notifications';

if (streak === 7) {
  await sendStreakAlert(7);
}
```

---

#### `sendMotivationalNotification()`
Sends a random motivational message.

**Returns**: `Promise<void>`

**Example**:
```typescript
import { sendMotivationalNotification } from '@/utils/notifications';

// Send daily motivation
await sendMotivationalNotification();
```

---

#### `sendAchievementNotification(badge)`
Notifies user about earned badge.

**Parameters**:
- `badge` (Badge): Badge object

**Returns**: `Promise<void>`

**Example**:
```typescript
import { sendAchievementNotification } from '@/utils/notifications';

await sendAchievementNotification(newBadge);
```

---

## 🛠️ Helper Functions

**File**: `src/utils/helpers.ts`

#### `calculateStreak(completedDates)`
Calculates current and longest streak.

**Parameters**:
- `completedDates` (string[]): Array of ISO date strings

**Returns**: `{ current: number, longest: number }`

**Example**:
```typescript
import { calculateStreak } from '@/utils/helpers';

const dates = ['2024-01-10', '2024-01-11', '2024-01-12'];
const { current, longest } = calculateStreak(dates);
console.log(`Current streak: ${current} days`);
```

---

#### `getStartOfDay(date)`
Gets start of day (midnight) for a date.

**Parameters**:
- `date` (Date): Date object

**Returns**: `Date`

**Example**:
```typescript
import { getStartOfDay } from '@/utils/helpers';

const today = getStartOfDay(new Date());
// Returns Date with time set to 00:00:00
```

---

#### `calculateBMR(weight, height, age, gender)`
Calculates Basal Metabolic Rate.

**Parameters**:
- `weight` (number): Weight in kg
- `height` (number): Height in cm
- `age` (number): Age in years
- `gender` ('male' | 'female'): Gender

**Returns**: `number` - BMR in calories

**Example**:
```typescript
import { calculateBMR, calculateTDEE } from '@/utils/helpers';

const bmr = calculateBMR(70, 175, 25, 'male');
const tdee = calculateTDEE(bmr, 1.55); // Moderately active
console.log(`Daily calories needed: ${tdee}`);
```

---

#### `calculateTDEE(bmr, activityMultiplier)`
Calculates Total Daily Energy Expenditure.

**Parameters**:
- `bmr` (number): Basal Metabolic Rate
- `activityMultiplier` (number): Activity level multiplier
  - Sedentary: 1.2
  - Lightly active: 1.375
  - Moderately active: 1.55
  - Very active: 1.725
  - Extra active: 1.9

**Returns**: `number` - TDEE in calories

---

#### `isValidEmail(email)`
Validates email format.

**Parameters**:
- `email` (string): Email to validate

**Returns**: `boolean`

**Example**:
```typescript
import { isValidEmail } from '@/utils/helpers';

if (!isValidEmail(email)) {
  alert('Invalid email format');
}
```

---

#### `generateInviteCode()`
Generates a random invite code.

**Returns**: `string` - 8-character code

**Example**:
```typescript
import { generateInviteCode } from '@/utils/helpers';

const code = generateInviteCode();
// Returns something like: "AB12CD34"
```

---

#### `formatDate(date)`
Formats date as "Jan 1, 2024".

**Parameters**:
- `date` (Date): Date to format

**Returns**: `string`

**Example**:
```typescript
import { formatDate } from '@/utils/helpers';

const formatted = formatDate(new Date());
// "Jan 10, 2024"
```

---

#### `getTodayISO()`
Gets today's date in ISO format.

**Returns**: `string` - "YYYY-MM-DD"

**Example**:
```typescript
import { getTodayISO } from '@/utils/helpers';

const today = getTodayISO();
// "2024-01-10"
```

---

#### `getRelativeTime(date)`
Gets relative time string.

**Parameters**:
- `date` (Date | string): Date to format

**Returns**: `string` - "Today", "Yesterday", "3 days ago", etc.

**Example**:
```typescript
import { getRelativeTime } from '@/utils/helpers';

const time = getRelativeTime(new Date());
// "Today"
```

---

## 🎨 Theme Constants

**File**: `src/constants/theme.ts`

### Colors

```typescript
import { COLORS } from '@/constants/theme';

// Primary colors
COLORS.primary      // '#4CAF50' - Main app color
COLORS.primaryDark  // '#388E3C'
COLORS.primaryLight // '#81C784'

// Base colors
COLORS.white        // '#FFFFFF'
COLORS.black        // '#000000'
COLORS.dark         // '#212121'
COLORS.gray         // '#757575'
COLORS.lightGray    // '#BDBDBD'

// Status colors
COLORS.success      // '#4CAF50'
COLORS.warning      // '#FF9800'
COLORS.error        // '#F44336'
COLORS.info         // '#2196F3'

// Category colors
COLORS.health       // '#E91E63'
COLORS.fitness      // '#9C27B0'
COLORS.nutrition    // '#FF9800'
COLORS.mindfulness  // '#00BCD4'
COLORS.productivity // '#3F51B5'
COLORS.learning     // '#FFC107'
COLORS.social       // '#4CAF50'
COLORS.custom       // '#607D8B'
```

### Spacing

```typescript
import { SPACING } from '@/constants/theme';

SPACING.xs    // 4
SPACING.sm    // 8
SPACING.md    // 16
SPACING.lg    // 24
SPACING.xl    // 32
SPACING.xxl   // 48
```

### Typography

```typescript
import { FONT_SIZES } from '@/constants/theme';

FONT_SIZES.xs     // 10
FONT_SIZES.sm     // 12
FONT_SIZES.md     // 14
FONT_SIZES.lg     // 16
FONT_SIZES.xl     // 20
FONT_SIZES.xxl    // 24
FONT_SIZES.xxxl   // 32
```

### Border Radius

```typescript
import { RADIUS } from '@/constants/theme';

RADIUS.sm      // 4
RADIUS.md      // 8
RADIUS.lg      // 12
RADIUS.xl      // 16
RADIUS.round   // 999 (fully rounded)
```

### Shadows

```typescript
import { SHADOWS } from '@/constants/theme';

// Use in StyleSheet
{
  ...SHADOWS.sm,    // Small shadow
  ...SHADOWS.md,    // Medium shadow
  ...SHADOWS.medium,// Alias for md
  ...SHADOWS.lg,    // Large shadow
}
```

### Habit Icons

```typescript
import { HABIT_ICONS } from '@/constants/theme';

HABIT_ICONS.health       // ['heart', 'pulse', 'hospital']
HABIT_ICONS.fitness      // ['dumbbell', 'run', 'bike']
HABIT_ICONS.nutrition    // ['food-apple', 'nutrition', 'food']
HABIT_ICONS.mindfulness  // ['meditation', 'yoga', 'brain']
HABIT_ICONS.productivity // ['briefcase', 'laptop', 'clock']
HABIT_ICONS.learning     // ['book-open', 'school', 'brain']
HABIT_ICONS.social       // ['account-group', 'handshake', 'heart']
HABIT_ICONS.custom       // ['star', 'plus', 'checkbox-marked']
```

---

## 🔐 Validation Rules

**File**: `src/constants/theme.ts`

```typescript
import { VALIDATION } from '@/constants/theme';

VALIDATION.minPasswordLength    // 8
VALIDATION.maxNameLength        // 50
VALIDATION.minAge               // 13
VALIDATION.maxAge               // 120
VALIDATION.minWeight            // 20 (kg)
VALIDATION.maxWeight            // 300 (kg)
VALIDATION.minHeight            // 100 (cm)
VALIDATION.maxHeight            // 250 (cm)
```

---

## 📱 React Navigation Types

### Stack Navigator

```typescript
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// In component
const navigation = useNavigation<NavigationProp>();

navigation.navigate('Login');
navigation.navigate('ProfileSetup', { userId: '123' });
```

### Tab Navigator

```typescript
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '@/types';

type TabNavigationProp = BottomTabNavigationProp<TabParamList, 'Home'>;

// In component
const navigation = useNavigation<TabNavigationProp>();

navigation.navigate('Habits');
navigation.navigate('Feed');
```

---

## 🎯 Usage Examples

### Complete Flow: Create and Complete a Habit

```typescript
import { useState, useEffect } from 'react';
import { createHabit, getUserHabits, toggleHabitCompletion } from '@/services/firebase/habitService';
import { COLORS } from '@/constants/theme';

// 1. Create habit
const newHabit = await createHabit({
  title: 'Drink Water',
  description: 'Drink 8 glasses',
  category: 'health',
  recurrence: 'daily',
  reminderEnabled: true,
  reminderTime: '09:00',
  color: COLORS.health,
  icon: 'water',
});

console.log('Habit created:', newHabit.id);

// 2. Load habits
const habits = await getUserHabits();

// 3. Complete habit
await toggleHabitCompletion(newHabit.id);

// 4. Check if completed
const completedToday = await getTodaysCompletedHabits();
const isCompleted = completedToday.includes(newHabit.id);

console.log(`Habit completed: ${isCompleted}`);
```

### Complete Flow: Generate and Display Diet Plan

```typescript
import { useState } from 'react';
import { generateDietPlan } from '@/services/api/geminiService';
import { useAuth } from '@/contexts/AuthContext';

const { user } = useAuth();

// Generate diet plan
const [loading, setLoading] = useState(false);
const [dietPlan, setDietPlan] = useState(null);

const handleGeneratePlan = async () => {
  setLoading(true);
  try {
    const plan = await generateDietPlan(user.profile, {
      goal: 'weight loss',
      mealCount: 3,
    });
    setDietPlan(plan);
  } catch (error) {
    console.error('Failed to generate plan:', error);
  } finally {
    setLoading(false);
  }
};

// Display
{loading && <ActivityIndicator />}
{dietPlan && (
  <View>
    <Text>Total Calories: {dietPlan.totalCalories}</Text>
    {dietPlan.meals.map(meal => (
      <Text key={meal.id}>{meal.name}</Text>
    ))}
  </View>
)}
```

---

## 🐛 Error Handling

All async functions can throw errors. Always wrap in try/catch:

```typescript
try {
  const result = await someAsyncFunction();
  // Success
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
    // Show user-friendly message
    Alert.alert('Error', error.message);
  }
}
```

Common error types:
- `User not authenticated` - User not logged in
- `Permission denied` - Firebase security rule violation
- `Network error` - No internet connection
- `Not found` - Resource doesn't exist

---

## ⚡ Performance Tips

1. **Batch Updates**: Use Firebase batch for multiple writes
2. **Pagination**: Limit query results (use `.limit()`)
3. **Caching**: Store frequently accessed data locally
4. **Lazy Loading**: Load screens only when needed
5. **Optimize Images**: Compress before upload
6. **Debounce**: Delay API calls on user input

---

**Last Updated**: January 2024

For questions or issues, check the main [README.md](./README.md) or [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md).
