# 🚀 Quick Reference - Rootine

## Essential Commands

### Setup
```powershell
# Automated setup (recommended)
.\install.ps1

# Manual setup
npm install
copy .env.example .env
# Edit .env with your credentials
```

### Development
```powershell
# Start development server
npm start

# Run on specific platform
npm run android        # Android
npm run ios            # iOS (Mac only)
npm run web            # Web browser

# Clear cache if issues
npm start -- --clear
```

### Code Quality
```powershell
npm run lint           # Check code style
npm run type-check     # Check TypeScript types
```

## Common Imports

### Screens
```typescript
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants/theme';
```

### Services
```typescript
import { authService } from '@/services/firebase/authService';
import { geminiService } from '@/services/api/geminiService';
import { notificationService } from '@/utils/notifications';
```

### Types
```typescript
import type { User, Habit, DietPlan, Post } from '@/types';
```

## File Locations

| What | Where |
|------|-------|
| Screens | `src/screens/auth/` or `src/screens/main/` |
| Components | `src/components/` |
| Services | `src/services/firebase/` or `src/services/api/` |
| Types | `src/types/index.ts` |
| Utils | `src/utils/` |
| Constants | `src/constants/theme.ts` |
| Context | `src/contexts/` |

## Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | Main app entry, navigation setup |
| `.env` | Environment variables (API keys) |
| `app.json` | Expo configuration |
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |

## Environment Variables

```env
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# Gemini AI
EXPO_PUBLIC_GEMINI_API_KEY=
```

## Navigation Types

```typescript
// Root stack
type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ProfileSetup: undefined;
  MainTabs: undefined;
  // Add more here
};

// Tab navigator
type TabParamList = {
  Home: undefined;
  Habits: undefined;
  Feed: undefined;
  Diet: undefined;
  Profile: undefined;
};
```

## Theme Quick Access

```typescript
// Colors
COLORS.primary          // #4CAF50
COLORS.secondary        // #FF9800
COLORS.background       // #F5F5F5
COLORS.text             // #212121
COLORS.textSecondary    // #757575

// Spacing
SPACING.xs   // 4
SPACING.sm   // 8
SPACING.md   // 16
SPACING.lg   // 24
SPACING.xl   // 32
SPACING.xxl  // 48

// Font Sizes
FONT_SIZES.xs    // 10
FONT_SIZES.sm    // 12
FONT_SIZES.md    // 14
FONT_SIZES.lg    // 16
FONT_SIZES.xl    // 20
FONT_SIZES.xxl   // 24

// Border Radius
RADIUS.sm    // 4
RADIUS.md    // 8
RADIUS.lg    // 12
RADIUS.xl    // 16
```

## Common Patterns

### Screen Template
```typescript
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';

const MyScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>My Screen</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

export default MyScreen;
```

### Component Template
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '@/constants/theme';

interface Props {
  title: string;
  onPress: () => void;
}

const MyComponent: React.FC<Props> = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  title: {
    color: COLORS.text,
  },
});

export default MyComponent;
```

### Using Auth Context
```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, signIn, signOut, updateProfile } = useAuth();
  
  // Use user data
  console.log(user?.displayName);
  
  // Sign in
  await signIn(email, password);
  
  // Update profile
  await updateProfile({ age: 25 });
  
  // Sign out
  await signOut();
};
```

### Calling Gemini AI
```typescript
import { geminiService } from '@/services/api/geminiService';

// Generate diet plan
const dietPlan = await geminiService.generateDietPlan(
  user.profile,
  '2024-01-15'
);

// Generate recipe
const recipe = await geminiService.generateRecipe(
  'Veggie Pasta',
  4,
  'vegetarian',
  ['peanuts']
);
```

### Scheduling Notifications
```typescript
import { notificationService } from '@/utils/notifications';

// Request permissions first
const granted = await notificationService.requestPermissions();

// Schedule reminder
const notificationId = await notificationService.scheduleHabitReminder(
  habitId,
  'Morning Meditation',
  '08:00'
);

// Cancel notification
await notificationService.cancelNotification(notificationId);
```

## Debugging

### Expo DevTools
```
In terminal after 'npm start':
- Press 'j' to open Chrome DevTools
- Press 'm' to toggle menu
- Press 'r' to reload
- Press 'shift+d' for developer menu on device
```

### Common Issues

| Problem | Solution |
|---------|----------|
| Module not found | `npm install` |
| Port already in use | `npx kill-port 19000 19001` |
| Metro bundler crash | `npm start -- --clear` |
| TypeScript errors | Restart TS server in VS Code |
| Firebase errors | Check .env credentials |
| Expo Go not connecting | Use tunnel mode: `npm start -- --tunnel` |

## Helpful VS Code Extensions

- **ES7+ React/Redux/React-Native snippets** - Code snippets
- **Prettier - Code formatter** - Auto-formatting
- **ESLint** - Linting
- **React Native Tools** - Debugging
- **Auto Rename Tag** - Rename paired tags
- **Path Intellisense** - Autocomplete imports

## Git Workflow

```powershell
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add feature description"

# Push to remote
git push origin feature/my-feature

# After review, merge to main
git checkout main
git merge feature/my-feature
git push origin main
```

## Resources

- **Expo Docs**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev
- **React Navigation**: https://reactnavigation.org
- **Firebase Docs**: https://firebase.google.com/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs

## Getting Help

1. Check `PROJECT_STATUS.md` for implementation details
2. Read `SETUP.md` for setup issues
3. See `DEVELOPMENT.md` for development guide
4. Review `README.md` for full documentation
5. Check `FIREBASE_RULES.md` for Firebase setup

## Quick Checklist Before Running

- [ ] `npm install` completed
- [ ] `.env` file created with credentials
- [ ] Firebase project created and configured
- [ ] Gemini API key obtained
- [ ] Expo Go installed on phone (or emulator running)

## That's It!

You're ready to build! 🚀

Run `npm start` and start developing!
