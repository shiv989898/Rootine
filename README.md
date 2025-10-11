# 🌱 Rootine - Lifestyle & Wellness App# 🌱 Rootine - Lifestyle & Wellness App



<div align="center">Rootine is a comprehensive lifestyle application built with React Native and Expo that helps people build better habits, stay consistent with their goals, and improve their health through a socially gamified experience combined with a personalized AI-powered diet and recipe assistant.



![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)## ✨ Features

![Expo](https://img.shields.io/badge/Expo-54.0.13-000020.svg?style=flat&logo=expo)

![React Native](https://img.shields.io/badge/React%20Native-0.81.4-61DAFB.svg?style=flat&logo=react)### 🎯 Core Features

![TypeScript](https://img.shields.io/badge/TypeScript-5.7.0-3178C6.svg?style=flat&logo=typescript)- **Habit Tracking** - Create and track daily habits with streak counters and progress calendars

![Firebase](https://img.shields.io/badge/Firebase-11.2.0-FFCA28.svg?style=flat&logo=firebase)- **Social Community** - Connect with friends, share progress, and compete on leaderboards

- **Challenges & Gamification** - Join challenges, earn badges, collect points, and level up

**A comprehensive lifestyle application that helps you build better habits, stay consistent with your goals, and improve your health through gamification and AI-powered personalization.**- **AI Diet Assistant** - Get personalized meal plans and recipes powered by Google Gemini AI

- **Progress Analytics** - Track your improvement over time with detailed statistics

[Features](#-features) • [Getting Started](#-getting-started) • [Installation](#-installation) • [Configuration](#-configuration) • [Usage](#-usage) • [Contributing](#-contributing)- **Push Notifications** - Never miss a habit with customizable reminders



</div>### 🍎 AI-Powered Nutrition

- Personalized vegetarian diet plans based on your profile

---- Custom recipe generation with step-by-step instructions

- Nutritional breakdowns (calories, macros)

## 📱 About- Weekly shopping list generation

- Meal suggestions based on preferences and dietary restrictions

Rootine is a full-featured React Native application built with Expo that combines:

- 🎯 **Habit Tracking** with streaks and progress visualization### 👥 Social Features

- 👥 **Social Features** - connect with friends and share progress- Add friends via invite codes

- 🏆 **Gamification** - points, levels, badges, and achievements- Public feed with posts and photos

- 🍎 **AI-Powered Nutrition** - personalized diet plans using Google Gemini AI- Like and comment on friends' progress

- 📊 **Analytics** - track your improvement over time- Leaderboards with points and streaks

- 🔔 **Smart Notifications** - never miss a habit- Challenge friends to compete



---### 🏆 Gamification

- Points system for completing habits

## ✨ Features- Level progression

- Badge collection

### 🎯 Habit Tracking- Achievement unlocking

- ✅ Create custom daily habits- Streak rewards

- 📅 Visual progress calendar

- 🔥 Streak counter and tracking## 🚀 Getting Started

- 📈 Completion statistics

- ⏰ Customizable reminders### Prerequisites



### 🍎 AI-Powered Diet Assistant- Node.js (v16 or later)

- 🤖 **Powered by Google Gemini 2.0 Flash**- npm or yarn

- 🥗 Personalized meal plans (breakfast, lunch, dinner, snacks)- Expo CLI: `npm install -g expo-cli`

- 🌱 Multiple diet types: Vegetarian, Non-Veg, Vegan, Pescatarian- iOS Simulator (Mac only) or Android Studio

- 🔄 Infinite variety with AI-generated suggestions- Firebase account

- 📝 Detailed recipes with step-by-step instructions- Google Gemini API key

- 💪 Nutritional information (calories, protein, carbs, fats)

- 🛒 Shopping list generation### Installation



### 👥 Social Community1. **Clone the repository**

- 👫 Add friends via unique invite codes   ```bash

- 📰 Public feed with posts and updates   cd Rootine

- 📸 Share photos of your progress   ```

- ❤️ Like and comment on friends' posts

- 🏆 Compete on leaderboards2. **Install dependencies**

- 👀 View friends' profiles and streaks   ```bash

   npm install

### 🏆 Gamification System   ```

- ⭐ **Points System**: Earn 10 XP per habit completion

- 📊 **Level Progression**: Level up as you earn points3. **Set up environment variables**

- 🏅 **Badges & Achievements**: Unlock special rewards   

- 🎯 **Challenges**: Join time-limited challenges   Copy `.env.example` to `.env`:

- 📊 **Leaderboards**: Daily, weekly, and all-time rankings   ```bash

- 🔥 **Streak Bonuses**: Extra rewards for consistency   copy .env.example .env

   ```

### ⚙️ Settings & Customization

- 👤 Profile management   Update `.env` with your credentials:

- 🔔 Notification preferences   ```env

- 🎵 Sound effects toggle   # Firebase Configuration

- 📳 Haptic feedback control   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key

- 🌙 Theme preferences (Light mode, Dark mode coming soon)   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com

- 🌍 Language selection (English, more coming)   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

- 💾 Data export and backup   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com

- 🔒 Privacy and security settings   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

---

   # Gemini API

## 🚀 Getting Started   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

   ```

### Prerequisites

4. **Set up Firebase**

Before you begin, ensure you have the following installed:   

   a. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

- **Node.js** (v16 or later) - [Download](https://nodejs.org/)   

- **npm** or **yarn** - Comes with Node.js   b. Enable Authentication:

- **Git** - [Download](https://git-scm.com/)      - Go to Authentication > Sign-in method

- **Expo CLI** (optional, but recommended)      - Enable Email/Password

  ```bash

  npm install -g expo-cli   c. Create Firestore Database:

  ```      - Go to Firestore Database

      - Create database in production mode

For mobile development:      - Set up security rules (see `firebase.rules` below)

- **Android Studio** (for Android development)

- **Xcode** (for iOS development - Mac only)   d. Enable Storage:

      - Go to Storage

### Required Accounts & API Keys      - Get started with default security rules



You'll need to set up the following:5. **Get Gemini API Key**

   

1. **Firebase Account** - [Get Started](https://firebase.google.com/)   Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to get your API key.

   - Create a new Firebase project

   - Enable Authentication (Email/Password)### Firebase Security Rules

   - Enable Firestore Database

   - Get your Firebase configuration**Firestore Rules** (`firestore.rules`):

```

2. **Google Gemini API Key** - [Get API Key](https://ai.google.dev/)rules_version = '2';

   - Sign up for Google AI Studioservice cloud.firestore {

   - Generate an API key for Gemini  match /databases/{database}/documents {

    match /users/{userId} {

3. **Expo Account** (for building APK/IPA) - [Sign Up](https://expo.dev/)      allow read: if request.auth != null;

      allow write: if request.auth.uid == userId;

---    }

    

## 📥 Installation    match /habits/{habitId} {

      allow read: if request.auth != null;

### 1. Clone the Repository      allow write: if request.auth.uid == resource.data.userId;

    }

```bash    

git clone https://github.com/YOUR_USERNAME/rootine.git    match /posts/{postId} {

cd rootine      allow read: if request.auth != null;

```      allow create: if request.auth != null;

      allow update, delete: if request.auth.uid == resource.data.userId;

### 2. Install Dependencies    }

  }

```bash}

npm install```

```

**Storage Rules** (`storage.rules`):

Or with yarn:```

```bashrules_version = '2';

yarn installservice firebase.storage {

```  match /b/{bucket}/o {

    match /users/{userId}/{allPaths=**} {

### 3. Configure Environment Variables      allow read: if request.auth != null;

      allow write: if request.auth.uid == userId;

Create a `.env` file in the root directory:    }

  }

```env}

# Firebase Configuration```

EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key

EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com### Running the App

EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com1. **Start the development server**

EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id   ```bash

EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id   npm start

EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id   ```



# Google Gemini AI2. **Run on iOS Simulator** (Mac only)

EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key   ```bash

   npm run ios

# Environment   ```

EXPO_PUBLIC_ENV=development

```3. **Run on Android Emulator**

   ```bash

### 4. Set Up Firebase   npm run android

   ```

1. Go to [Firebase Console](https://console.firebase.google.com/)

2. Create a new project or use existing one4. **Run on Web**

3. Enable **Authentication**:   ```bash

   - Go to Authentication → Sign-in method   npm run web

   - Enable "Email/Password"   ```

4. Enable **Firestore Database**:

   - Go to Firestore Database5. **Using Expo Go** (Recommended for testing)

   - Create database in production mode   - Install Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

   - Set up security rules (see [Firebase Rules](#firebase-security-rules))   - Scan the QR code from the terminal

5. Add your app:

   - Click "Add app" → Web## 📱 App Structure

   - Copy the configuration values to your `.env` file

```

### 5. Verify InstallationRootine/

├── App.tsx                 # Main app entry point

Run the dependency checker:├── src/

│   ├── screens/            # Screen components

```bash│   │   ├── auth/          # Authentication screens

npx expo-doctor│   │   │   ├── OnboardingScreen.tsx

```│   │   │   ├── LoginScreen.tsx

│   │   │   ├── SignupScreen.tsx

You should see: `✅ 17/17 checks passed. No issues detected!`│   │   │   └── ProfileSetupScreen.tsx

│   │   └── main/          # Main app screens

---│   │       ├── HomeScreen.tsx

│   │       ├── HabitsScreen.tsx

## 🎮 Usage│   │       ├── FeedScreen.tsx

│   │       ├── DietScreen.tsx

### Development Mode│   │       └── ProfileScreen.tsx

│   ├── components/         # Reusable components

Start the Expo development server:│   ├── contexts/          # React contexts

│   │   └── AuthContext.tsx

```bash│   ├── services/          # API and external services

npm start│   │   ├── firebase/      # Firebase services

# or│   │   │   ├── config.ts

npx expo start│   │   │   └── authService.ts

```│   │   └── api/           # External APIs

│   │       └── geminiService.ts

This will open Expo DevTools in your browser. You can then:│   ├── utils/             # Utility functions

- Press `a` to open on Android emulator│   │   ├── helpers.ts

- Press `i` to open on iOS simulator│   │   └── notifications.ts

- Scan QR code with Expo Go app on your phone│   ├── types/             # TypeScript types

│   │   └── index.ts

### Running on Android│   └── constants/         # App constants

│       └── theme.ts

```bash├── assets/                # Images, fonts, etc.

npm run android├── app.json              # Expo configuration

# or├── package.json          # Dependencies

npx expo run:android└── tsconfig.json         # TypeScript configuration

``````



### Running on iOS (Mac only)## 🎨 Tech Stack



```bash- **Framework**: React Native with Expo

npm run ios- **Language**: TypeScript

# or- **Navigation**: React Navigation

npx expo run:ios- **UI Library**: React Native Paper

```- **State Management**: React Context API

- **Backend**: Firebase (Auth, Firestore, Storage)

### Building APK for Android- **AI**: Google Gemini API

- **Notifications**: Expo Notifications

Using EAS Build (recommended):- **Image Handling**: Expo Image Picker

- **Date Handling**: date-fns

```bash

# Install EAS CLI## 📋 Available Scripts

npm install -g eas-cli

- `npm start` - Start Expo development server

# Login to Expo- `npm run android` - Run on Android

eas login- `npm run ios` - Run on iOS

- `npm run web` - Run on web

# Configure EAS- `npm run lint` - Run ESLint

eas build:configure- `npm run type-check` - Run TypeScript type checking



# Build APK## 🔑 Key Concepts

npx eas build --profile preview-apk --platform android --non-interactive

```### User Profile

Users can create profiles with:

The build will take 10-30 minutes. You'll get a download URL when complete.- Personal information (age, weight, height, gender)

- Activity level (sedentary to extra active)

---- Dietary preferences (vegetarian, vegan, etc.)

- Allergies and food restrictions

## 🔧 Configuration- Health and fitness goals



### Firebase Security Rules### Habit System

- Create custom habits with recurrence patterns

Add these rules to your Firestore Database:- Track completion with streak counters

- Set reminders for habits

```javascript- View progress on calendar

rules_version = '2';- Earn points for consistency

service cloud.firestore {

  match /databases/{database}/documents {### Gamification

    // Users collection- **Points**: Earn by completing habits, posting updates, etc.

    match /users/{userId} {- **Levels**: Increase level every 100 points

      allow read: if request.auth != null;- **Badges**: Unlock achievements for milestones

      allow write: if request.auth != null && request.auth.uid == userId;- **Streaks**: Track consecutive days of habit completion

    }

    ### AI Diet Plans

    // Habits collectionThe app uses Google Gemini to generate:

    match /habits/{habitId} {- Personalized daily meal plans

      allow read: if request.auth != null;- Detailed recipes with ingredients and instructions

      allow write: if request.auth != null && request.auth.uid == resource.data.userId;- Nutritional information

    }- Meal variations and substitutions

    - Weekly shopping lists

    // Posts collection

    match /posts/{postId} {## 🚧 Future Enhancements

      allow read: if request.auth != null;

      allow create: if request.auth != null;- [ ] Implement habit analytics and insights

      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;- [ ] Add workout tracking integration

    }- [ ] Create video tutorials for habits

    - [ ] Build community challenges marketplace

    // Challenges collection- [ ] Add Apple Health / Google Fit integration

    match /challenges/{challengeId} {- [ ] Implement payment system for premium tier

      allow read: if request.auth != null;- [ ] Add dark mode support

      allow write: if request.auth != null;- [ ] Create web dashboard

    }- [ ] Multi-language support

  }- [ ] Offline mode with sync

}

```## 🤝 Contributing



### App ConfigurationContributions are welcome! Please feel free to submit a Pull Request.



The app configuration is in `app.json`:## 📄 License



```jsonThis project is licensed under the MIT License.

{

  "expo": {## 🙏 Acknowledgments

    "name": "Rootine",

    "slug": "rootine",- Design inspiration from modern fitness and wellness apps

    "version": "1.0.0",- Icons from React Native Vector Icons

    "orientation": "portrait",- AI-powered nutrition guidance by Google Gemini

    "icon": "./assets/icon.png",- Built with ❤️ using React Native and Expo

    "splash": {

      "image": "./assets/splash.png",## 📞 Support

      "resizeMode": "contain",

      "backgroundColor": "#ffffff"For questions or support, please open an issue in the GitHub repository.

    },

    "android": {---

      "package": "com.shivgg.rootine",

      "adaptiveIcon": {**Happy Habit Building! 🌱**

        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

---

## 📂 Project Structure

```
rootine/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── habits/          # Habit-related components
│   │   ├── challenges/      # Challenge components
│   │   ├── animations/      # Animation components
│   │   ├── ErrorBoundary.tsx
│   │   └── FriendCard.tsx
│   ├── screens/             # App screens
│   │   ├── auth/           # Authentication screens
│   │   ├── main/           # Main app screens (Home, Diet, Profile)
│   │   ├── habits/         # Habit detail screens
│   │   ├── social/         # Social features screens
│   │   ├── challenges/     # Challenge screens
│   │   ├── leaderboard/    # Leaderboard screens
│   │   └── achievements/   # Achievement screens
│   ├── services/           # Business logic & API services
│   │   ├── api/           # External API services
│   │   │   └── geminiService.ts
│   │   └── firebase/      # Firebase services
│   │       ├── config.ts
│   │       ├── habitService.ts
│   │       ├── userService.ts
│   │       ├── challengeService.ts
│   │       ├── achievementService.ts
│   │       └── leaderboardService.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   └── utils/             # Utility functions
│       └── performanceHooks.ts
├── assets/                # Images, fonts, icons
├── .env                   # Environment variables (create this)
├── .gitignore
├── App.tsx               # Main app entry point
├── app.json              # Expo configuration
├── eas.json              # EAS Build configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

---

## 🎨 Tech Stack

### Frontend
- **React Native** `0.81.4` - Mobile app framework
- **Expo** `54.0.13` - Development platform
- **TypeScript** `5.7.0` - Type safety
- **React Navigation** `7.0.0` - Navigation
- **React Native Paper** `5.12.0` - UI components

### Backend & Services
- **Firebase Firestore** `11.2.0` - Database
- **Firebase Authentication** `11.2.0` - User auth
- **Google Gemini AI** `0.24.0` - AI-powered diet plans

### State Management
- React Hooks (useState, useEffect, useContext)
- Firebase Realtime Listeners
- AsyncStorage for local persistence

### Additional Libraries
- **date-fns** - Date manipulation
- **expo-notifications** - Push notifications
- **expo-linear-gradient** - Gradient backgrounds
- **react-native-calendars** - Calendar views
- **@expo/vector-icons** - Icon library

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Expo command not found"
```bash
npm install -g expo-cli
```

#### 2. "Firebase not initialized"
- Check your `.env` file exists
- Verify all Firebase keys are correct
- Restart the development server

#### 3. "Duplicate dependencies error"
```bash
npm install
npx expo-doctor
```

#### 4. "Build failed on EAS"
- Run `npx expo-doctor` and fix any issues
- Check your `eas.json` configuration
- Verify your Expo account is set up

#### 5. "Gemini API error"
- Verify your API key in `.env`
- Check API quota limits
- Ensure Gemini API is enabled in Google Cloud Console

### Clean Installation

If you encounter persistent issues:

```bash
# Delete node_modules and lock files
rm -rf node_modules
rm package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall
npm install

# Clear Expo cache
npx expo start -c
```

---

## 📝 Recent Updates (v1.0.0)

### ✅ Fixed Issues
- **Diet Plan System**: Added meal type filters, diet preferences, and infinite variety
- **XP System**: Fixed negative points bug, enabled multiple XP gains per habit
- **Settings Screen**: Complete settings UI with all preferences
- **Performance**: Optimized with React.memo and performance hooks
- **Dependencies**: Resolved duplicate packages and version conflicts

### 🆕 New Features
- Meal type selection (Breakfast, Lunch, Dinner, Snacks)
- Diet type selection (Vegetarian, Non-Veg, Vegan, Pescatarian)
- AI-powered variety in diet suggestions
- Complete settings screen with 9 sections
- Auto-level updates after XP changes

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write clean, readable code
- Add comments for complex logic
- Test on both Android and iOS
- Update README if adding new features

---

## 📄 License

This project is private and not licensed for public use.

---

## 👨‍💻 Author

**Shiv Gopal Gautam**
- GitHub: [@YOUR_GITHUB_USERNAME]
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- **Expo Team** - For the amazing development platform
- **Google Gemini** - For AI-powered diet suggestions
- **Firebase** - For backend services
- **React Native Community** - For excellent libraries and support

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search [existing issues](https://github.com/YOUR_USERNAME/rootine/issues)
3. Open a [new issue](https://github.com/YOUR_USERNAME/rootine/issues/new)
4. Contact: your.email@example.com

---

## 🗺️ Roadmap

### Coming Soon
- 🌙 Dark mode support
- 🌍 Multi-language support (Spanish, French, Hindi)
- 📊 Advanced analytics dashboard
- 🎯 Custom challenge creation
- 💬 In-app messaging
- 📱 iOS App Store release
- 🔔 Smart notification scheduling
- 🏋️ Workout tracking integration
- 💤 Sleep tracking
- 🧘 Meditation timer

---

<div align="center">

**Made with ❤️ by the Rootine Team**

⭐ Star this repo if you found it helpful!

</div>
