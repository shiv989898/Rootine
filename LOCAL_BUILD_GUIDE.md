# Local APK Build Guide

## Option 1: EAS Build Local (Easiest)

### Requirements:
- Docker Desktop for Windows installed

### Steps:
```bash
# Install Docker Desktop from: https://www.docker.com/products/docker-desktop

# Build locally
npx eas-cli build --platform android --profile preview --local
```

The APK will be in the project root after build completes.

---

## Option 2: Expo Prebuild + Android Studio (Full Control)

### Requirements:
- Android Studio installed
- Android SDK and Build Tools
- Java JDK 17+

### Steps:

1. **Generate native Android project:**
```bash
npx expo prebuild --platform android
```

2. **Add to .gitignore:**
```
android/
ios/
```

3. **Build with Gradle:**
```bash
cd android
.\gradlew assembleRelease
```

4. **Find APK at:**
```
android\app\build\outputs\apk\release\app-release.apk
```

### Troubleshooting:

**If Gradle fails:**
```bash
# Clean build
.\gradlew clean

# Try again
.\gradlew assembleRelease
```

**If signing fails:**
```bash
# Build unsigned APK
.\gradlew assembleRelease -PsigningDisabled=true
```

---

## Option 3: React Native CLI (Advanced)

### Requirements:
- Everything from Option 2
- React Native CLI installed globally

### Steps:

1. **Install React Native CLI:**
```bash
npm install -g react-native-cli
```

2. **Generate native project:**
```bash
npx expo prebuild --platform android
```

3. **Run build:**
```bash
npx react-native build-android --mode=release
```

---

## Quick Comparison:

| Method | Time | Difficulty | Requirements |
|--------|------|------------|--------------|
| EAS Local | 15-20 min | Easy | Docker |
| Prebuild + Gradle | 10-15 min | Medium | Android Studio, SDK |
| RN CLI | 10-15 min | Hard | Full dev environment |

---

## Recommended: EAS Local

**Why?**
- Same config as cloud builds
- No manual signing setup
- Works with managed workflow
- Reproducible builds

**Install Docker:**
1. Download from: https://www.docker.com/products/docker-desktop
2. Install and restart computer
3. Run: `npx eas-cli build --platform android --local`

---

## Current Setup:

Your project is configured for:
- ✅ Expo SDK 54
- ✅ Firebase Web SDK
- ✅ Managed workflow
- ✅ EAS Build ready

**Best choice:** Install Docker and use EAS Local builds!
