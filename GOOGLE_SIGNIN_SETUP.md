# Google Sign-In Setup Guide for Rootine

## Overview
This guide will help you set up Google Sign-In for your Rootine app. You'll need to create OAuth credentials in the Google Cloud Console and configure them in the app.

## Prerequisites
- Google Cloud Account (free)
- Access to Google Cloud Console
- Your app's package name: `com.rootine.app`

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: **"Rootine"**
4. Click **"Create"**

## Step 2: Enable Google Sign-In API

1. In the Google Cloud Console, select your project
2. Go to **"APIs & Services"** → **"Library"**
3. Search for **"Google Sign-In"** or **"Google+ API"**
4. Click **"Enable"**

## Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: Rootine
   - **User support email**: your email
   - **Developer contact information**: your email
5. Click **"Save and Continue"**
6. Skip the "Scopes" section (click "Save and Continue")
7. Add test users (optional for testing)
8. Click **"Save and Continue"**

## Step 4: Create OAuth Credentials

### For Android

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Android"** as application type
4. Enter the following:
   - **Name**: Rootine Android
   - **Package name**: `com.rootine.app`
   - **SHA-1 certificate fingerprint**: See below how to get it

#### Get SHA-1 Certificate Fingerprint

**For Development (Debug Keystore):**
```powershell
# Run this in PowerShell
cd $env:USERPROFILE\.android
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**For Production (Release Keystore):**
```powershell
# If you have a release keystore
keytool -list -v -keystore path\to\your\release.keystore -alias your-alias
```

5. Copy the SHA-1 fingerprint and paste it
6. Click **"Create"**
7. **Copy the Client ID** - you'll need this!

### For Web (Required for Expo)

1. Click **"Create Credentials"** → **"OAuth client ID"**
2. Select **"Web application"**
3. Enter the following:
   - **Name**: Rootine Web
   - **Authorized redirect URIs**: 
     - `https://auth.expo.io/@your-expo-username/rootine`
     - Replace `your-expo-username` with your actual Expo username
4. Click **"Create"**
5. **Copy the Client ID** - you'll need this!

### For iOS (Optional - for future)

1. Click **"Create Credentials"** → **"OAuth client ID"**
2. Select **"iOS"**
3. Enter the following:
   - **Name**: Rootine iOS
   - **Bundle ID**: `com.rootine.app`
4. Click **"Create"**
5. **Copy the Client ID** - you'll need this!

## Step 5: Configure the App

1. Open `src/hooks/useGoogleSignIn.ts`
2. Replace the placeholder values with your actual Client IDs:

```typescript
// Replace these with your actual Google OAuth credentials
const GOOGLE_WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
```

Example (with actual values):
```typescript
const GOOGLE_WEB_CLIENT_ID = '123456789-abcdefg.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '987654321-hijklmn.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '456789123-opqrstu.apps.googleusercontent.com';
```

## Step 6: Update app.json (Optional - for standalone builds)

Add Google Sign-In plugin to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      // ... existing plugins
      [
        "expo-auth-session",
        {
          "scheme": "rootine"
        }
      ]
    ]
  }
}
```

## Step 7: Test Google Sign-In

1. Build and run the app:
```powershell
npm start
# Or
npx expo start
```

2. On the Login/Signup screen, click **"Continue with Google"**
3. You should see the Google Sign-In browser window
4. Sign in with your Google account
5. The app should authenticate and navigate to the main screen

## Troubleshooting

### Error: "Invalid client ID"
- Double-check that you've copied the correct Client IDs
- Make sure you're using the Web Client ID in the app
- Verify the Client IDs are active in Google Cloud Console

### Error: "Redirect URI mismatch"
- Make sure you've added the correct redirect URI in Google Cloud Console
- Format: `https://auth.expo.io/@your-expo-username/rootine`
- Get your Expo username with: `npx eas whoami`

### Error: "SHA-1 fingerprint mismatch" (Android)
- Make sure you've added the correct SHA-1 fingerprint
- For development, use the debug keystore SHA-1
- For production builds, use your release keystore SHA-1

### Google Sign-In button is disabled
- This is normal during development
- The OAuth credentials are being configured
- Wait a few seconds for the request to complete

### Browser doesn't open
- Make sure `expo-web-browser` is installed: `npm install expo-web-browser`
- Check that your device/emulator has a browser installed
- Try restarting the Metro bundler

## Security Notes

1. **Never commit credentials to Git**:
   - Add `src/hooks/useGoogleSignIn.ts` to `.gitignore` after adding your credentials
   - Or use environment variables (recommended)

2. **Use environment variables** (Recommended):
   Create a `.env` file:
   ```
   GOOGLE_WEB_CLIENT_ID=your-web-client-id
   GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
   GOOGLE_IOS_CLIENT_ID=your-ios-client-id
   ```
   
   Then install: `npm install react-native-dotenv`
   
   And use: `import { GOOGLE_WEB_CLIENT_ID } from '@env';`

3. **Restrict API Keys**:
   - In Google Cloud Console, restrict your OAuth Client IDs
   - Set authorized domains
   - Set package name restrictions for Android

## Production Checklist

Before releasing to production:

- [ ] Generate production SHA-1 fingerprint from release keystore
- [ ] Add production SHA-1 to Google Cloud Console
- [ ] Create separate OAuth Client IDs for production
- [ ] Test Google Sign-In with production build
- [ ] Verify OAuth consent screen is configured
- [ ] Add app logo to OAuth consent screen
- [ ] Add privacy policy URL
- [ ] Add terms of service URL
- [ ] Move OAuth credentials to environment variables
- [ ] Test on both Android and iOS

## Additional Resources

- [Expo Auth Session Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google Sign-In for Android](https://developers.google.com/identity/sign-in/android)
- [Firebase Authentication with Google](https://firebase.google.com/docs/auth/android/google-signin)
- [Get SHA-1 Certificate Fingerprint](https://developers.google.com/android/guides/client-auth)

## Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all credentials are correct
3. Ensure Firebase has Google Sign-In enabled
4. Check that your app's package name matches everywhere

## What's Already Implemented

✅ **Persistent Authentication**:
- User sessions are stored in AsyncStorage
- Users remain logged in after closing the app
- Auth state is restored on app restart

✅ **Google Sign-In UI**:
- Google Sign-In button on Login screen
- Google Sign-In button on Signup screen
- Loading states and error handling
- Beautiful UI with Google branding

✅ **Firebase Integration**:
- Google Sign-In integrated with Firebase Auth
- User profile created automatically on first sign-in
- Existing users are recognized and logged in

✅ **Security**:
- Secure token storage
- Proper sign-out clears all tokens
- Guest user data is separate from authenticated users

## Next Steps

After setting up Google Sign-In:
1. Test the authentication flow thoroughly
2. Build the app: `npx eas build -p android --profile preview-apk`
3. Test on a real device
4. Prepare for production release
