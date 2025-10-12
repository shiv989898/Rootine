# 🔒 Secure API Key Configuration for GitHub

## ⚠️ IMPORTANT: This repository is now secure!

All API keys have been removed from tracked files. Here's how to configure them locally:

---

## 🔧 Local Development Setup

### 1. Environment Variables (.env)
Copy `.env.example` to `.env` and add your keys:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Gemini API
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Environment
EXPO_PUBLIC_ENV=development
```

✅ `.env` is already in `.gitignore` and will NOT be committed

---

## 📦 Building APK with Secrets

### Option 1: Using EAS Secrets (Recommended for CI/CD)

Store secrets securely in EAS:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Create secrets
eas secret:create --scope project --name EXPO_PUBLIC_GEMINI_API_KEY --value "your_key_here" --type string
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "your_key_here" --type string
# ... add other Firebase keys as needed
```

Then update `eas.json` to reference secrets:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "env": {
          "EXPO_PUBLIC_GEMINI_API_KEY": "${EXPO_PUBLIC_GEMINI_API_KEY}",
          "EXPO_PUBLIC_FIREBASE_API_KEY": "${EXPO_PUBLIC_FIREBASE_API_KEY}"
        }
      }
    }
  }
}
```

### Option 2: Local Build Configuration (For Local Builds Only)

**WARNING**: Only use this for local builds. **NEVER commit this file!**

1. Copy `eas.json.example` to `eas.json.local`:
   ```bash
   cp eas.json.example eas.json.local
   ```

2. Edit `eas.json.local` and add your real API keys

3. Build using the local config:
   ```bash
   eas build --platform android --profile production --local
   ```

✅ `eas.json.local` is in `.gitignore` and will NOT be committed

---

## 🔐 Security Best Practices

### ✅ Already Protected
- `.env` is in `.gitignore`
- `eas.json.local` is in `.gitignore`
- API keys removed from `app.json`
- API keys removed from `eas.json`

### 🚨 Never Commit These Files
- `.env`
- `.env.local`
- `eas.json.local`
- Any file containing real API keys

### ✅ Safe to Commit
- `.env.example` (template with placeholders)
- `eas.json.example` (template with placeholders)
- `app.json` (no secrets)
- `eas.json` (references secrets only)

---

## 🚀 Development Workflow

### For Development (Expo Go / Dev Client)
```bash
# 1. Configure .env with your keys
cp .env.example .env
# Edit .env with real keys

# 2. Start development server
npm start
```

### For Production APK Build
```bash
# Option A: Using EAS Secrets (recommended)
eas secret:create --scope project --name EXPO_PUBLIC_GEMINI_API_KEY --value "your_key"
eas build --platform android --profile production

# Option B: Local build with eas.json.local
cp eas.json.example eas.json.local
# Edit eas.json.local with real keys
eas build --platform android --profile production --local
```

---

## 🔍 How API Keys are Loaded

The app tries to load API keys in this order:

1. **Environment variables** (`.env` file)
   - Used during development with `npm start`
   - Loaded by Expo CLI automatically

2. **EAS Secrets** (cloud storage)
   - Used during EAS cloud builds
   - Most secure for production

3. **Build-time environment** (`eas.json` env section)
   - Used during builds
   - Should reference EAS Secrets

4. **Constants.expoConfig.extra** (runtime fallback)
   - Last resort for production builds
   - Not recommended for storing keys directly

---

## 🛡️ What Changed

### Before (INSECURE ❌)
```json
// app.json - COMMITTED TO GITHUB
{
  "extra": {
    "geminiApiKey": "AIzaSy..." // ❌ Exposed!
  }
}

// eas.json - COMMITTED TO GITHUB
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_GEMINI_API_KEY": "AIzaSy..." // ❌ Exposed!
      }
    }
  }
}
```

### After (SECURE ✅)
```json
// app.json - COMMITTED TO GITHUB
{
  "extra": {
    // ✅ No secrets here!
  }
}

// eas.json - COMMITTED TO GITHUB
{
  "build": {
    "production": {
      // ✅ References secrets, doesn't store them
      "env": {
        "EXPO_PUBLIC_GEMINI_API_KEY": "${EXPO_PUBLIC_GEMINI_API_KEY}"
      }
    }
  }
}

// .env - NOT COMMITTED (in .gitignore)
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy... // ✅ Safe locally
```

---

## 📋 Pre-Build Checklist

Before building an APK, verify:

- [ ] `.env` exists locally with real keys
- [ ] `.env` is in `.gitignore`
- [ ] `app.json` has NO hardcoded keys
- [ ] `eas.json` has NO hardcoded keys (or uses secret references)
- [ ] EAS secrets are created (for cloud builds)
- [ ] Run `npm run verify-build` to check configuration

---

## 🆘 Troubleshooting

### "Missing Gemini API key" error
**Cause**: API key not loaded properly

**Solutions**:
1. Check `.env` file exists and has `EXPO_PUBLIC_GEMINI_API_KEY`
2. For builds: Check EAS secrets are created
3. Restart dev server after editing `.env`

### Build fails with "undefined" API key
**Cause**: Secret not available during build

**Solutions**:
1. Use EAS secrets: `eas secret:create`
2. Or use local build with `eas.json.local`

### Firebase connection fails in APK
**Cause**: Firebase config not loaded

**Solution**:
Check that Firebase config is hardcoded in `src/services/firebase/config.ts` (Firebase config can be public, API keys should be restricted by Firebase rules)

---

## 📚 Additional Resources

- [EAS Secrets Documentation](https://docs.expo.dev/build-reference/variables/)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [API Key Security Best Practices](https://cloud.google.com/docs/authentication/api-keys)

---

**Last Updated**: January 2025  
**Status**: ✅ Repository is now secure for public sharing
