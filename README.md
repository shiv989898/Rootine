# 🌱 Rootine

> Your personal wellness companion for habits, community, and AI-powered nutrition.

<div align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.81.4-61DAFB?logo=react&logoColor=white" alt="React Native badge" />
  <img src="https://img.shields.io/badge/Expo-54.0.13-000020?logo=expo&logoColor=white" alt="Expo badge" />
  <img src="https://img.shields.io/badge/TypeScript-5.7.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript badge" />
  <img src="https://img.shields.io/badge/Firebase-11.x-FFCA28?logo=firebase&logoColor=black" alt="Firebase badge" />
  <img src="https://img.shields.io/badge/Version-1.0.0-2b9eeb" alt="Version badge" />
</div>

<p align="center">
  <em>Built with Expo + React Native · Powered by Google Gemini · Crafted for consistent progress</em>
</p>

---

## 📚 Table of contents
- [Overview](#-overview)
- [Highlights](#-highlights)
- [Screenshot placeholders](#-screenshot-placeholders)
- [Quick start](#-quick-start)
- [Installation](#-installation)
- [Environment variables](#-environment-variables)
- [Firebase setup](#-firebase-setup)
- [Daily usage](#-daily-usage)
- [Build an APK](#-build-an-apk)
- [Project map](#-project-map)
- [Tech stack](#-tech-stack)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author & support](#-author--support)

---

## 🔎 Overview
Rootine blends habit tracking, social accountability, and AI-generated diet plans into a single, polished mobile app. Users can:
- Create habits with streaks, reminders, and analytics.
- Earn XP, level up, and unlock badges through gamified challenges.
- Share progress with friends via feeds, leaderboards, and comments.
- Generate personalized recipes and meal plans with Google Gemini.

---

## ✨ Highlights
<div align="center">

| Habits & Analytics | Gamification | AI Nutrition | Social Vibes |
| --- | --- | --- | --- |
| 🚀 Streak tracking, calendars, and trend insights keep habits on autopilot. | 🏆 XP, levels, badges, and time-bound challenges make progress addictive. | 🤖 Gemini-powered plans with diet filters, meal types, recipes, and macros. | 👥 Friends, feeds, likes, comments, and leaderboards for accountability. |

</div>

<details>
<summary><strong>Extra polish</strong></summary>

- 60 FPS animations and responsive UI built with React Native Paper.
- Offline-friendly caching for habit data and diet plans.
- Consistent theming and typography utilizing the shared design system.
- Modular service layer for Firebase + Gemini integrations.

</details>

---

## 🖼️ Screenshot placeholders
Add screenshots or GIFs here when you capture them:

```
| Home | Diet Planner | Social Feed | Achievements |
| ---- | ------------ | ----------- | ------------ |
| (img) | (img) | (img) | (img) |
```

---

## 🚀 Quick start
Make sure the core tooling is installed:
- Node.js 16 or newer
- npm (bundled with Node) or Yarn
- Git
- Optional: Android Studio (emulator) and Xcode (Mac) for simulators

Helpful global CLIs:
- `npm install -g expo-cli`
- `npm install -g eas-cli`

---

## ⚙️ Installation
1. **Clone the repo**
   ```powershell
   git clone https://github.com/shiv989898/Rootine.git
   cd Rootine
   ```
2. **Install dependencies**
   ```powershell
   npm install
   ```
3. **Set up environment variables**
   ```powershell
   copy .env.example .env
   ```
4. **Fill in Firebase & Gemini keys** (see [Environment variables](#-environment-variables)).
5. **Health check**
   ```powershell
   npx expo-doctor
   ```
   Expect: `17/17 checks passed. No issues detected!`

---

## 🔐 Environment variables
Update `.env` with your secrets:

```env
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Gemini
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Environment mode
EXPO_PUBLIC_ENV=development
```

> ⚠️ **SECURITY**: API keys are stored in `.env` (gitignored) or EAS Secrets only. They are **NOT** committed to the repository. See [docs/SECURE_KEYS_SETUP.md](./docs/SECURE_KEYS_SETUP.md) for detailed security setup.

---

## 🔧 Firebase setup
1. Create or open a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Email/Password Authentication** (Authentication → Sign-in Method).
3. Create a **Firestore Database** in production mode.
4. Add a **Web App** in Project Settings and copy the config values into `.env`.
5. Apply strict Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /habits/{habitId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /challenges/{challengeId} {
      allow read, write: if request.auth != null;
    }
    match /achievements/{achievementId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 🕹️ Daily usage
- Start Expo in development mode:
  ```powershell
  npm start
  ```
  - Press `a` for Android emulator
  - Press `i` for iOS simulator (macOS only)
  - Scan the QR code using the **Expo Go** app on a physical device
- Platform-specific scripts:
  ```powershell
  npm run android
  npm run ios
  npm run web
  ```

---

## 📦 Build an APK

### Prerequisites
1. **Install EAS CLI globally**:
   ```powershell
   npm install -g eas-cli
   ```

2. **Login to Expo** (once per machine):
   ```powershell
   eas login
   ```

3. **Verify build configuration**:
   ```powershell
   npm run verify-build
   ```
   This checks that all required files and API keys are properly configured.

### Build Commands

#### Using EAS Secrets (Recommended for Security)

First, store your API key securely:
```powershell
# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Login
eas login

# Store API key as secret
eas secret:create --scope project --name EXPO_PUBLIC_GEMINI_API_KEY --value "your_api_key_here" --type string
```

Then build:
```powershell
# Production APK
npm run build:android

# Preview APK
npm run build:preview
```

#### Alternative: Local Build (Development Only)

⚠️ **Warning**: Only for local testing, **not for distribution**

```powershell
# Create local config with your keys
cp eas.json.example eas.json.local
# Edit eas.json.local and add your API keys

# Build locally
eas build --platform android --profile production --local
```

**Note**: `eas.json.local` is gitignored and will NOT be committed.

For complete security setup, see: [docs/SECURE_KEYS_SETUP.md](./docs/SECURE_KEYS_SETUP.md)

### What Happens During Build
- ✅ API keys are injected from `app.json` and `eas.json`
- ✅ Gemini AI configured for production use
- ✅ Firebase connectivity verified
- ✅ All features bundled (offline-capable)
- ✅ APK signed and ready for distribution

### Download & Install
1. Build completes in ~10-15 minutes (cloud build)
2. Download APK from EAS dashboard: https://expo.dev/accounts/[your-account]/projects/rootine/builds
3. Transfer to Android device
4. Enable "Install from unknown sources" in Android settings
5. Install the APK

### Verify AI Works in APK
After installing, test these features:
- 🤖 Generate diet plan (Settings → Diet Planner)
- 📊 View analytics and insights
- 🏆 Complete challenges
- 💬 Check daily motivational quotes

**Note**: If Gemini API fails, the app automatically uses fallback diet plans to ensure a smooth experience.

For detailed build instructions and troubleshooting, see: [docs/APK_BUILD_GUIDE.md](./docs/APK_BUILD_GUIDE.md)
   npx eas build --profile preview-apk --platform android --non-interactive
   ```
3. Monitor build progress on the Expo dashboard; expect a download URL in 10–30 minutes.

> 💡 For distribution builds, create dedicated EAS profiles in `eas.json` and store keystores safely.

---

## 🗂️ Project map
```
Rootine/
├─ src/
│  ├─ components/       # Reusable UI (habits, cards, animations, etc.)
│  ├─ screens/          # Auth, main app, social, settings
│  ├─ services/
│  │  ├─ api/           # Gemini integration
│  │  └─ firebase/      # Auth, habits, challenges, leaderboard logic
│  ├─ types/            # Shared TypeScript definitions
│  └─ utils/            # Performance helpers, common utils
├─ assets/              # Images, icons, fonts
├─ App.tsx              # Entry point
├─ app.json             # Expo config
├─ package.json
└─ README.md
```

---

## 🧰 Tech stack
<div align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.81.4-61DAFB?logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-54.0.13-000020?logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.7.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React%20Navigation-7.x-5E81AC?logo=react&logoColor=white" alt="React Navigation" />
  <img src="https://img.shields.io/badge/React%20Native%20Paper-5.x-6200EE?logo=react" alt="React Native Paper" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-FFCA28?logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Google%20Gemini-AI-4285F4?logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/date--fns-Helpers-770C56" alt="date-fns" />
</div>

---

## 🛠️ Troubleshooting
| Issue | Fix |
| --- | --- |
| `expo-doctor` fails due to duplicate native modules | Pin the conflicting package via `overrides` in `package.json` (already applied for `react-native-safe-area-context`). |
| Gemini API errors | Verify the API key in `.env`, confirm quota in Google Cloud Console, and ensure the Gemini API is enabled. |
| Android emulator is slow or missing Play Services | Update Android Studio images or build a preview APK and test on a real device using the Expo build URL. |
| Firebase permission denied | Re-check Firestore rules and confirm authenticated user IDs match the document owner fields. |

<details>
<summary><strong>Cleanup script</strong></summary>

```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm cache clean --force
npm install
npx expo start --clear
```

</details>

---

## 🗺️ Roadmap
- [x] Habit tracking with streaks & analytics
- [x] AI-powered diet planner (Gemini)
- [x] Social feed with reactions and comments
- [x] Gamified XP + level system without negative XP bugs
- [ ] Dark mode theme
- [ ] Multi-language support
- [ ] Automated EAS release pipeline
- [ ] In-app progress sharing templates

---

## 🤝 Contributing
1. Fork the repository & create a feature branch.
2. Keep pull requests focused and cover new UI with screenshots.
3. Run `npx expo-doctor` and platform-specific smoke tests before submitting.
4. Fill out the PR template with context, testing, and screenshots.

---

## 📄 License
This project is licensed; refer to the repository license file for full terms.

---

## 👤 Author & support
- **Author:** Shiv Goyal — shivgoyal9988@gmail.com
- **Project board / issues:** [GitHub Issues](https://github.com/shiv989898/Rootine/issues)
- Need help? Open an issue with logs, screenshots, and reproduction steps. We'll tackle it together.

<p align="center">
  <sub>Rootine • Crafted with care for everyday momentum.</sub>
</p>
