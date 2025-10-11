# 🚀 Quick Build Guide

## ✅ Build APK (Use This Command)

Run this script to build APK with correct settings:

```powershell
.\build-apk.ps1
```

Or run manually:

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "C:\Program Files\Android\Android Studio\jbr\bin;$env:PATH"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
npx expo run:android --variant release
```

---

## 📦 APK Location

After build completes, find your APK here:

```
C:\Rootine\android\app\build\outputs\apk\release\app-release.apk
```

---

## 🔧 What Was Fixed

**Problem:** Build failed with Java 8
```
Dependency requires at least JVM runtime version 11. This build uses a Java 8 JVM.
```

**Solution:** Use Java 21 from Android Studio
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
```

---

## ⏱️ Build Time

- **Metro Bundler:** 2-3 minutes
- **Gradle Build:** 5-7 minutes  
- **Total:** ~10-15 minutes

Much faster than EAS cloud queue! ⚡

---

## 📱 Install APK

### Method 1: Direct Install (Already connected)
The build will automatically install to your connected device (RZ8N920ESLN)

### Method 2: Manual Install
```powershell
adb install android\app\build\outputs\apk\release\app-release.apk
```

### Method 3: Share APK
Send the APK file to any Android device and install manually

---

## 🎯 Next Time

Just run:
```powershell
.\build-apk.ps1
```

And wait 10-15 minutes! ✅

---

**Current Build Status:** 🔄 Running (Metro Bundler at ~56%)

Monitor the terminal for progress updates!
