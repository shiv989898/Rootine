# 🌱 Rootine - Lifestyle & Wellness App

Rootine is a comprehensive lifestyle application built with React Native and Expo that helps people build better habits, stay consistent with their goals, and improve their health through a socially gamified experience combined with a personalized AI-powered diet and recipe assistant.

## ✨ Features

### 🎯 Core Features
- **Habit Tracking** - Create and track daily habits with streak counters and progress calendars
- **Social Community** - Connect with friends, share progress, and compete on leaderboards
- **Challenges & Gamification** - Join challenges, earn badges, collect points, and level up
- **AI Diet Assistant** - Get personalized meal plans and recipes powered by Google Gemini AI
- **Progress Analytics** - Track your improvement over time with detailed statistics
- **Push Notifications** - Never miss a habit with customizable reminders

### 🍎 AI-Powered Nutrition
- Personalized vegetarian diet plans based on your profile
- Custom recipe generation with step-by-step instructions
- Nutritional breakdowns (calories, macros)
- Weekly shopping list generation
- Meal suggestions based on preferences and dietary restrictions

### 👥 Social Features
- Add friends via invite codes
- Public feed with posts and photos
- Like and comment on friends' progress
- Leaderboards with points and streaks
- Challenge friends to compete

### 🏆 Gamification
- Points system for completing habits
- Level progression
- Badge collection
- Achievement unlocking
- Streak rewards

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac only) or Android Studio
- Firebase account
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   cd Rootine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

   Update `.env` with your credentials:
   ```env
   # Firebase Configuration
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Gemini API
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Set up Firebase**
   
   a. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   
   b. Enable Authentication:
      - Go to Authentication > Sign-in method
      - Enable Email/Password

   c. Create Firestore Database:
      - Go to Firestore Database
      - Create database in production mode
      - Set up security rules (see `firebase.rules` below)

   d. Enable Storage:
      - Go to Storage
      - Get started with default security rules

5. **Get Gemini API Key**
   
   Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to get your API key.

### Firebase Security Rules

**Firestore Rules** (`firestore.rules`):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /habits/{habitId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.userId;
    }
    
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

**Storage Rules** (`storage.rules`):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

### Running the App

1. **Start the development server**
   ```bash
   npm start
   ```

2. **Run on iOS Simulator** (Mac only)
   ```bash
   npm run ios
   ```

3. **Run on Android Emulator**
   ```bash
   npm run android
   ```

4. **Run on Web**
   ```bash
   npm run web
   ```

5. **Using Expo Go** (Recommended for testing)
   - Install Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
   - Scan the QR code from the terminal

## 📱 App Structure

```
Rootine/
├── App.tsx                 # Main app entry point
├── src/
│   ├── screens/            # Screen components
│   │   ├── auth/          # Authentication screens
│   │   │   ├── OnboardingScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   └── ProfileSetupScreen.tsx
│   │   └── main/          # Main app screens
│   │       ├── HomeScreen.tsx
│   │       ├── HabitsScreen.tsx
│   │       ├── FeedScreen.tsx
│   │       ├── DietScreen.tsx
│   │       └── ProfileScreen.tsx
│   ├── components/         # Reusable components
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   ├── services/          # API and external services
│   │   ├── firebase/      # Firebase services
│   │   │   ├── config.ts
│   │   │   └── authService.ts
│   │   └── api/           # External APIs
│   │       └── geminiService.ts
│   ├── utils/             # Utility functions
│   │   ├── helpers.ts
│   │   └── notifications.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   └── constants/         # App constants
│       └── theme.ts
├── assets/                # Images, fonts, etc.
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

## 🎨 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **UI Library**: React Native Paper
- **State Management**: React Context API
- **Backend**: Firebase (Auth, Firestore, Storage)
- **AI**: Google Gemini API
- **Notifications**: Expo Notifications
- **Image Handling**: Expo Image Picker
- **Date Handling**: date-fns

## 📋 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔑 Key Concepts

### User Profile
Users can create profiles with:
- Personal information (age, weight, height, gender)
- Activity level (sedentary to extra active)
- Dietary preferences (vegetarian, vegan, etc.)
- Allergies and food restrictions
- Health and fitness goals

### Habit System
- Create custom habits with recurrence patterns
- Track completion with streak counters
- Set reminders for habits
- View progress on calendar
- Earn points for consistency

### Gamification
- **Points**: Earn by completing habits, posting updates, etc.
- **Levels**: Increase level every 100 points
- **Badges**: Unlock achievements for milestones
- **Streaks**: Track consecutive days of habit completion

### AI Diet Plans
The app uses Google Gemini to generate:
- Personalized daily meal plans
- Detailed recipes with ingredients and instructions
- Nutritional information
- Meal variations and substitutions
- Weekly shopping lists

## 🚧 Future Enhancements

- [ ] Implement habit analytics and insights
- [ ] Add workout tracking integration
- [ ] Create video tutorials for habits
- [ ] Build community challenges marketplace
- [ ] Add Apple Health / Google Fit integration
- [ ] Implement payment system for premium tier
- [ ] Add dark mode support
- [ ] Create web dashboard
- [ ] Multi-language support
- [ ] Offline mode with sync

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Design inspiration from modern fitness and wellness apps
- Icons from React Native Vector Icons
- AI-powered nutrition guidance by Google Gemini
- Built with ❤️ using React Native and Expo

## 📞 Support

For questions or support, please open an issue in the GitHub repository.

---

**Happy Habit Building! 🌱**
