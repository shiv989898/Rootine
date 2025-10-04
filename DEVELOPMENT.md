# Development Guide for Rootine

This guide provides detailed information for developers working on the Rootine project.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Core Concepts](#core-concepts)
4. [Development Workflow](#development-workflow)
5. [Code Style & Standards](#code-style--standards)
6. [Testing](#testing)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

## Architecture Overview

Rootine follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│                  Presentation Layer              │
│  (Screens, Components, Navigation, UI State)    │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│              Business Logic Layer                │
│     (Contexts, Hooks, Utils, Calculations)      │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│               Data Access Layer                  │
│    (Firebase Services, API Calls, Storage)      │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│              External Services                   │
│   (Firebase, Google Gemini, Push Notifications) │
└──────────────────────────────────────────────────┘
```

### Key Principles

- **Component-Based**: UI built with reusable React components
- **Type-Safe**: Full TypeScript coverage for compile-time safety
- **Context-Based State**: React Context API for global state
- **Service Layer**: Abstracted external service calls
- **Offline-First**: Local storage with cloud sync

## Project Structure

```
Rootine/
├── App.tsx                    # Root component, navigation setup
├── src/
│   ├── screens/               # Full-screen components
│   │   ├── auth/             # Authentication flow
│   │   └── main/             # Main app screens
│   ├── components/            # Reusable UI components
│   │   ├── common/           # Shared components (Button, Card, etc.)
│   │   ├── habits/           # Habit-specific components
│   │   ├── social/           # Social feature components
│   │   └── diet/             # Diet/nutrition components
│   ├── contexts/              # React Context providers
│   │   ├── AuthContext.tsx   # Authentication state
│   │   ├── HabitContext.tsx  # Habit management (TODO)
│   │   └── ThemeContext.tsx  # Theme/appearance (TODO)
│   ├── hooks/                 # Custom React hooks
│   │   ├── useHabits.ts      # Habit operations (TODO)
│   │   ├── useDiet.ts        # Diet plan operations (TODO)
│   │   └── useNotifications.ts # Notification management (TODO)
│   ├── services/              # External service integrations
│   │   ├── firebase/         # Firebase operations
│   │   └── api/              # API clients (Gemini, etc.)
│   ├── utils/                 # Utility functions
│   │   ├── helpers.ts        # General helpers
│   │   ├── validators.ts     # Input validation (TODO)
│   │   └── notifications.ts  # Notification helpers
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts          # All app types
│   ├── constants/             # App-wide constants
│   │   └── theme.ts          # Theme, colors, spacing
│   └── navigation/            # Navigation configuration (optional)
├── assets/                    # Static assets
│   ├── images/               # Images, icons
│   ├── fonts/                # Custom fonts (optional)
│   └── animations/           # Lottie animations (optional)
├── __tests__/                # Test files (TODO)
└── docs/                     # Additional documentation
```

## Core Concepts

### 1. Authentication Flow

```typescript
// User authentication states:
- Unauthenticated → Show onboarding/login/signup
- Authenticated (new) → Profile setup
- Authenticated (returning) → Main app
- Guest mode → Limited features, local storage only
```

**Key Files:**
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/services/firebase/authService.ts` - Firebase Auth operations
- `src/screens/auth/*` - Auth UI screens

### 2. Habit Management

```typescript
// Habit lifecycle:
Create → Schedule → Complete Daily → Track Streak → Earn Points
```

**Data Flow:**
1. User creates habit → Stored in Firestore + Local
2. Daily reminder → Notification Service
3. User marks complete → Update streak, calculate points
4. Sync to cloud → Real-time updates

### 3. AI Diet Plans

```typescript
// Diet generation flow:
User Profile → Gemini API → Parse Response → Save Plan → Generate Recipes
```

**Key Considerations:**
- Rate limiting (3 requests/day for free users)
- Caching previous plans
- Offline access to saved plans
- Recipe customization

### 4. Social Features

```typescript
// Social interaction flow:
Create Post → Upload Images → Share → Friends See in Feed → Like/Comment
```

**Privacy:**
- Public posts visible to all users
- Private profiles (optional feature)
- Friend-only posts (optional)

## Development Workflow

### Starting Development

1. **Pull latest changes**
   ```powershell
   git pull origin main
   ```

2. **Install dependencies** (if package.json changed)
   ```powershell
   npm install
   ```

3. **Start dev server**
   ```powershell
   npm start
   ```

4. **Run on device/emulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code for Expo Go

### Creating a New Feature

1. **Create feature branch**
   ```powershell
   git checkout -b feature/your-feature-name
   ```

2. **Add types** (if needed)
   ```typescript
   // src/types/index.ts
   export interface YourNewType {
     // ...
   }
   ```

3. **Create service** (if needed)
   ```typescript
   // src/services/yourService.ts
   export const yourService = {
     // ...
   };
   ```

4. **Build components**
   ```typescript
   // src/components/yourFeature/YourComponent.tsx
   ```

5. **Add screen** (if needed)
   ```typescript
   // src/screens/main/YourScreen.tsx
   ```

6. **Update navigation**
   ```typescript
   // App.tsx or navigation config
   ```

7. **Test thoroughly**
   - Test happy path
   - Test error cases
   - Test offline behavior
   - Test on both platforms

8. **Commit and push**
   ```powershell
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

### Code Review Checklist

Before submitting:
- [ ] Code follows style guide
- [ ] TypeScript types are correct
- [ ] No console.log statements (use console.error for errors)
- [ ] Error handling is implemented
- [ ] Loading states are shown
- [ ] Works on both iOS and Android
- [ ] Tested with slow network
- [ ] No memory leaks (useEffect cleanup)
- [ ] Accessible (screen readers, contrast)

## Code Style & Standards

### TypeScript

```typescript
// ✅ Good - Explicit types
interface Props {
  userId: string;
  onComplete: (success: boolean) => void;
}

const MyComponent: React.FC<Props> = ({ userId, onComplete }) => {
  // ...
};

// ❌ Bad - Implicit any
const MyComponent = ({ userId, onComplete }) => {
  // ...
};
```

### Component Structure

```typescript
// ✅ Good - Organized structure
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '@/constants/theme';

interface Props {
  // Props interface
}

const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // 1. Hooks
  const [state, setState] = useState();
  
  // 2. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 3. Handlers
  const handleAction = () => {
    // ...
  };
  
  // 4. Render helpers (if needed)
  const renderItem = () => {
    // ...
  };
  
  // 5. Main render
  return (
    <View style={styles.container}>
      {/* ... */}
    </View>
  );
};

// 6. Styles
const styles = StyleSheet.create({
  container: {
    // Use constants
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
});

export default MyComponent;
```

### Naming Conventions

- **Components**: PascalCase (`MyComponent.tsx`)
- **Files**: camelCase (`myService.ts`, `helpers.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ITEMS`, `DEFAULT_COLOR`)
- **Functions**: camelCase (`handleSubmit`, `calculateTotal`)
- **Types/Interfaces**: PascalCase (`User`, `HabitData`)
- **Enums**: PascalCase (`ActivityLevel`, `DietaryPreference`)

### Imports Order

```typescript
// 1. React and React Native
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

// 2. Third-party libraries
import { useNavigation } from '@react-navigation/native';

// 3. Local imports (using aliases)
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/common';
import { COLORS } from '@/constants/theme';
import { formatDate } from '@/utils/helpers';
import type { User } from '@/types';
```

## Testing

### Unit Tests (TODO)

```typescript
// __tests__/utils/helpers.test.ts
import { calculateStreak, formatDate } from '@/utils/helpers';

describe('calculateStreak', () => {
  it('should calculate streak correctly', () => {
    const dates = ['2024-01-01', '2024-01-02', '2024-01-03'];
    expect(calculateStreak(dates)).toBe(3);
  });
});
```

### Integration Tests (TODO)

```typescript
// __tests__/services/authService.test.ts
import { authService } from '@/services/firebase/authService';

describe('authService', () => {
  it('should sign up new user', async () => {
    const user = await authService.signUp('test@example.com', 'password', 'Test User');
    expect(user.email).toBe('test@example.com');
  });
});
```

### E2E Tests (TODO)

Consider using Detox or Maestro for end-to-end testing.

## Common Tasks

### Adding a New Screen

1. Create screen file:
   ```typescript
   // src/screens/main/NewScreen.tsx
   import React from 'react';
   import { View, Text, SafeAreaView } from 'react-native';
   
   const NewScreen = () => {
     return (
       <SafeAreaView>
         <View>
           <Text>New Screen</Text>
         </View>
       </SafeAreaView>
     );
   };
   
   export default NewScreen;
   ```

2. Add to navigation types:
   ```typescript
   // src/types/index.ts
   export type RootStackParamList = {
     // ...
     NewScreen: { param?: string };
   };
   ```

3. Add to navigator:
   ```typescript
   // App.tsx
   <Stack.Screen name="NewScreen" component={NewScreen} />
   ```

### Adding a Firebase Collection

1. Define type:
   ```typescript
   // src/types/index.ts
   export interface NewData {
     id: string;
     userId: string;
     // ...
   }
   ```

2. Create service:
   ```typescript
   // src/services/firebase/newDataService.ts
   import { db } from './config';
   import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
   
   export const newDataService = {
     create: async (data: NewData) => {
       // ...
     },
     getAll: async (userId: string) => {
       // ...
     },
   };
   ```

3. Update Firestore rules in Firebase Console

### Adding an AI Feature

1. Define input/output types
2. Create prompt template
3. Call Gemini API
4. Parse and validate response
5. Cache results (if appropriate)
6. Handle errors gracefully

## Troubleshooting

### Metro Bundler Issues

```powershell
# Clear cache
npm start -- --clear

# Reset everything
rm -rf node_modules
rm package-lock.json
npm install
```

### Type Errors

```powershell
# Check types
npm run type-check

# If types are correct but errors persist
# Restart TypeScript server in VS Code:
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Firebase Connection Issues

1. Check `.env` file has correct credentials
2. Verify Firebase project is active
3. Check internet connection
4. Look at Firebase Console for errors

### Expo Go Not Connecting

1. Ensure phone and computer are on same network
2. Try tunnel mode: `npm start -- --tunnel`
3. Restart Expo Go app
4. Clear Expo Go cache

### Build Errors

```powershell
# For iOS
cd ios
pod install
cd ..

# For Android
cd android
./gradlew clean
cd ..
```

## Performance Tips

1. **Use `React.memo` for expensive components**
2. **Implement `useMemo` and `useCallback` for expensive calculations**
3. **Use `FlatList` instead of `ScrollView` for long lists**
4. **Optimize images** - Use proper sizes, lazy loading
5. **Debounce search inputs**
6. **Paginate large data sets**
7. **Cache API responses**
8. **Use Firebase indexes** for complex queries

## Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Firebase Docs](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Hooks](https://react.dev/reference/react)

## Getting Help

- Check existing documentation
- Search GitHub issues
- Ask in team chat/Discord
- Create a detailed bug report

---

Happy coding! 🚀
