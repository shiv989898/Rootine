# 🚀 Quick Setup Guide for Rootine

This guide will help you get Rootine up and running quickly.

## Step-by-Step Setup

### 1. Install Dependencies

```powershell
cd c:\Rootine
npm install
```

This will install all required packages including:
- React Native and Expo
- Firebase SDK
- React Navigation
- Google Generative AI
- And more...

### 2. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Name it "Rootine" (or your preference)
4. Disable Google Analytics (optional)
5. Create Project

### 3. Configure Firebase Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. Click "Save"

### 4. Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create Database"
3. Choose "Start in production mode"
4. Select a location (choose closest to your users)
5. Click "Enable"

### 5. Set Up Firebase Storage

1. In Firebase Console, go to **Storage**
2. Click "Get Started"
3. Accept the default security rules
4. Click "Done"

### 6. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (⚙️ icon)
2. Scroll down to "Your apps"
3. Click the **</>** (Web) icon
4. Register app with nickname "Rootine Web"
5. Copy the `firebaseConfig` object

### 7. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select or create a Google Cloud project
4. Copy your API key

### 8. Configure Environment Variables

1. In the `c:\Rootine` folder, create a new file called `.env`:

```powershell
copy .env.example .env
```

2. Open `.env` in your text editor and fill in your credentials:

```env
# Firebase Configuration (from step 6)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyC...your_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=rootine-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=rootine-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=rootine-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef...

# Gemini API (from step 7)
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyD...your_gemini_key_here

# App Configuration
EXPO_PUBLIC_ENV=development
```

### 9. Start the Development Server

```powershell
npm start
```

This will start the Expo development server and show you a QR code.

### 10. Run the App

**Option A: Use Expo Go (Easiest)**
1. Install Expo Go on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Scan the QR code from the terminal
3. App will load on your phone!

**Option B: Use Android Emulator**
```powershell
npm run android
```

**Option C: Use iOS Simulator (Mac only)**
```powershell
npm run ios
```

**Option D: Use Web Browser**
```powershell
npm run web
```

## 🎉 You're All Set!

The app should now be running. You can:
- Create a new account
- Sign in as guest
- Start tracking habits
- Generate AI diet plans
- And more!

## 🔧 Troubleshooting

### "Cannot find module" errors
Run: `npm install` again

### Firebase errors
- Check that all credentials in `.env` are correct
- Ensure Firebase Authentication is enabled
- Verify Firestore Database is created

### Gemini API errors
- Confirm your API key is valid
- Check you have billing enabled in Google Cloud (free tier available)
- Ensure the Generative AI API is enabled in your project

### Metro bundler issues
Clear cache:
```powershell
npm start -- --clear
```

### TypeScript errors
The project is pre-configured, but if you see errors:
```powershell
npm run type-check
```

## 📱 Testing on Physical Device

### Android
1. Enable Developer Mode on your phone
2. Enable USB Debugging
3. Connect via USB
4. Run: `npm run android`

### iOS (Mac + Physical iPhone)
1. Open Xcode
2. Add your Apple ID to Xcode
3. Connect iPhone via USB
4. Run: `npm run ios`

## 🎯 Next Steps

Now that your app is running:
1. Explore the onboarding flow
2. Create your first habit
3. Generate an AI diet plan
4. Customize the app features to your needs
5. Read the main README.md for detailed documentation

## 💡 Pro Tips

- Use Expo Go for quick testing and development
- Keep your `.env` file secure (never commit it)
- Check Firebase Console for real-time data
- Use Chrome DevTools for debugging (press `j` in terminal)

## 🆘 Need Help?

- Check the main [README.md](README.md) for detailed info
- Review [Expo Documentation](https://docs.expo.dev)
- Visit [Firebase Documentation](https://firebase.google.com/docs)
- Check [React Navigation Docs](https://reactnavigation.org)

Happy coding! 🚀
