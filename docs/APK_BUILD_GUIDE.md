# APK Build Configuration Guide

This document ensures the Gemini AI and all features work correctly in production APK builds.

## ✅ Current Configuration Status

### 1. Gemini AI Service Configuration
- **Status**: ✅ Properly configured for APK builds
- **Implementation**: REST API calls (no SDK dependency issues)
- **Fallback**: Built-in fallback diet plans if API fails

### 2. API Key Management

#### For Development (.env file)
```bash
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyACODFs7IaY-n5Kipg8Y2HTFBQyi6_gRro
```

#### For Production APK (app.json)
Add to `app.json` under `expo.extra`:
```json
{
  "expo": {
    "extra": {
      "geminiApiKey": "AIzaSyACODFs7IaY-n5Kipg8Y2HTFBQyi6_gRro"
    }
  }
}
```

## 🔧 How It Works in APK

### API Key Resolution (geminiService.ts)
The service tries multiple sources in order:
1. ✅ Environment variable: `process.env.EXPO_PUBLIC_GEMINI_API_KEY`
2. ✅ App config extra: `Constants.expoConfig.extra.geminiApiKey`
3. ✅ Manifest extra: `Constants.manifest.extra.geminiApiKey`
4. ✅ Legacy manifest: `Constants.manifest2.extra.geminiApiKey`

```typescript
const resolveApiKey = (): string => {
  const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
  const extraKey =
    (Constants?.expoConfig as any)?.extra?.geminiApiKey ??
    (Constants?.manifest2 as any)?.extra?.expoClient?.extra?.geminiApiKey ??
    (Constants?.manifest as any)?.extra?.geminiApiKey ??
    '';

  return envKey || extraKey || '';
};
```

### Network Configuration
- ✅ Uses standard `fetch()` API (works everywhere)
- ✅ HTTPS endpoint: `https://generativelanguage.googleapis.com`
- ✅ No special network permissions needed

### Error Handling
- ✅ Graceful fallback to pre-built diet plans
- ✅ User always sees content, even if API fails
- ✅ Clear error messages for debugging

## 📱 Building Production APK

### Option 1: EAS Build (Recommended)

#### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

#### Step 2: Login to Expo
```bash
eas login
```

#### Step 3: Configure EAS Build
Create `eas.json`:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "env": {
          "EXPO_PUBLIC_GEMINI_API_KEY": "AIzaSyACODFs7IaY-n5Kipg8Y2HTFBQyi6_gRro"
        }
      }
    },
    "development": {
      "android": {
        "buildType": "apk",
        "developmentClient": true
      }
    }
  }
}
```

#### Step 4: Build APK
```bash
# Production build
eas build --platform android --profile production

# Development build
eas build --platform android --profile development
```

#### Step 5: Download and Install
- Download APK from EAS build dashboard
- Transfer to Android device
- Enable "Install from unknown sources"
- Install the APK

### Option 2: Local Build (Alternative)

#### Prerequisites
```bash
npm install -g expo-cli
npm install -g turtle-cli
```

#### Build Command
```bash
# Production APK
expo build:android -t apk

# Development APK
expo build:android -t apk --release-channel dev
```

## 🔒 Security Best Practices

### For Public Repositories
**⚠️ IMPORTANT**: Never commit API keys directly to version control!

#### 1. Remove keys from git history:
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

#### 2. Use EAS Secrets:
```bash
# Store API key as secret
eas secret:create --name EXPO_PUBLIC_GEMINI_API_KEY --value "your-api-key" --type string

# Reference in eas.json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_GEMINI_API_KEY": "${EXPO_PUBLIC_GEMINI_API_KEY}"
      }
    }
  }
}
```

#### 3. Use .gitignore:
```gitignore
# Environment
.env
.env.local
.env.production

# Secrets
secrets.json
google-services.json
```

### For Private Repositories
- ✅ Can keep API keys in `.env` (current setup)
- ✅ Ensure repository is private on GitHub
- ✅ Limit collaborator access

## ✨ Features Verified for APK

### ✅ Working Features
- [x] Gemini AI diet generation
- [x] REST API calls
- [x] Fallback diet plans
- [x] Firebase integration
- [x] Analytics service
- [x] Achievement system
- [x] Challenge system
- [x] Motivational quotes
- [x] Habit suggestions
- [x] All UI components

### ✅ No Dependencies on Dev-Only Tools
- [x] No reliance on Expo Go
- [x] No hot reloading dependencies
- [x] No Metro bundler dependencies
- [x] Pure React Native components

## 🧪 Testing APK Builds

### Pre-Build Checklist
```bash
# 1. Clear cache
npm cache clean --force

# 2. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Test locally
npm start

# 4. Build production bundle
npx expo export --platform android

# 5. Verify no errors
npm run lint
```

### Post-Build Testing
1. ✅ Install APK on physical device
2. ✅ Test offline mode (should show fallback plans)
3. ✅ Test online mode (should call Gemini API)
4. ✅ Test all screens and navigation
5. ✅ Test Firebase authentication
6. ✅ Test habit tracking
7. ✅ Test challenge system
8. ✅ Check analytics data

## 📊 Monitoring API Usage

### Gemini API Limits
- Free tier: 60 requests per minute
- Monitor usage at: https://console.cloud.google.com/apis/dashboard

### Firebase Limits
- Spark plan: Limited reads/writes
- Monitor at: https://console.firebase.google.com

### Cost Optimization
- ✅ Fallback plans reduce API calls
- ✅ Client-side caching of diet plans
- ✅ Batch Firebase queries
- ✅ Offline-first architecture

## 🐛 Troubleshooting

### Issue: "Missing Gemini API key"
**Solution**: Ensure key is in `app.json` under `extra.geminiApiKey`

### Issue: "Network request failed"
**Solution**: Check internet connection, verify API endpoint

### Issue: "Failed to generate diet"
**Solution**: Fallback plan will be used automatically

### Issue: APK crashes on startup
**Solution**: 
1. Check Firebase config in `src/services/firebase/config.ts`
2. Verify all required permissions in `app.json`
3. Test with `npx expo run:android` first

### Issue: API works in dev but not in APK
**Solution**: Add API key to `app.json` extra field

## 📝 Build Commands Reference

```bash
# Development
npm start                          # Start Expo dev server
npm run android                    # Run on Android emulator
npx expo run:android              # Direct Android build & run

# Production
eas build -p android --profile production     # EAS cloud build
npx expo export --platform android           # Export production bundle
npx expo build:android -t apk                # Legacy Expo build

# Debugging
npx expo start --no-dev --minify             # Production-like mode
adb logcat | grep "Rootine"                  # View Android logs
npx react-native log-android                 # React Native logs
```

## 🎯 Final Verification

Before releasing APK, verify:
- [ ] API key configured in `app.json`
- [ ] Firebase config is correct
- [ ] All permissions declared
- [ ] Tested on multiple devices
- [ ] Offline mode works
- [ ] No console errors
- [ ] All features functional
- [ ] Proper error messages shown
- [ ] Good user experience

---

**Last Updated**: January 2025
**Gemini Model**: gemini-2.0-flash-exp
**Expo SDK**: Compatible with all versions
**Status**: ✅ Production Ready
