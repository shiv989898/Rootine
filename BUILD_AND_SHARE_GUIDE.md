# 📱 Build & Share APK for Testing

## 🎯 Quick Overview

You have **3 options** to share your app with friends for testing:

1. **Expo Go App** (Easiest, 5 minutes) - Recommended for quick testing
2. **Development Build APK** (Medium, 30 minutes) - Full features
3. **Production Build APK** (Advanced, 1 hour) - App store ready

---

## ⚡ Option 1: Expo Go (Easiest - Recommended)

This is the **fastest way** to share with friends for testing.

### **Requirements:**
- Friends need to install **Expo Go** app from Play Store
- You need an Expo account (free)

### **Steps:**

#### 1. **Login to Expo**
```bash
npx expo login
```
Enter your credentials or create a free account at https://expo.dev/signup

#### 2. **Publish Your App**
```bash
cd c:\Rootine
npx expo publish
```

This will upload your app to Expo's servers and give you a link.

#### 3. **Share with Friends**
- Copy the QR code or link from the terminal
- Send it to your friends
- They install **Expo Go** from Play Store
- They scan the QR code or open the link
- ✅ App runs on their phone!

### **Pros:**
- ✅ Super fast (5 minutes)
- ✅ No build process needed
- ✅ Easy updates (just publish again)
- ✅ Works on iOS too (with Expo Go from App Store)

### **Cons:**
- ❌ Friends need Expo Go app installed
- ❌ Some features might not work (camera, notifications need development build)

---

## 🔨 Option 2: Development Build APK (Recommended for Real Testing)

Build a standalone APK that works without Expo Go.

### **Requirements:**
- EAS CLI installed
- Expo account
- 30-45 minutes for first build

### **Steps:**

#### 1. **Install EAS CLI**
```bash
npm install -g eas-cli
```

#### 2. **Login to EAS**
```bash
eas login
```

#### 3. **Configure EAS Build**
```bash
cd c:\Rootine
eas build:configure
```

Select:
- Platform: **Android**
- Build type: **APK** (not AAB for testing)

This creates an `eas.json` file.

#### 4. **Update eas.json for APK**
Open `eas.json` and modify:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

#### 5. **Build the APK**
```bash
eas build --profile preview --platform android
```

**What happens:**
- ⏰ Build takes 15-30 minutes (runs on Expo's servers)
- 📱 You'll get a link to download the APK
- 💾 APK file will be ~50-100 MB

#### 6. **Share the APK**
- Copy the download link from the terminal
- Send to your friends
- They click the link on their Android phone
- Install the APK (might need to enable "Install from unknown sources")
- ✅ Done!

### **Pros:**
- ✅ No Expo Go needed
- ✅ Works like a real app
- ✅ All features work (camera, notifications)
- ✅ Easy to share (just a link)

### **Cons:**
- ❌ Takes 30 minutes to build
- ❌ Need to rebuild for updates

---

## 🚀 Option 3: Production Build (For App Store)

For when you're ready to publish to Google Play Store.

### **Steps:**

#### 1. **Create app.json Configuration**
Update your `app.json`:
```json
{
  "expo": {
    "name": "Rootine",
    "slug": "rootine",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4CAF50"
    },
    "android": {
      "package": "com.yourname.rootine",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4CAF50"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

#### 2. **Build Production APK**
```bash
eas build --profile production --platform android
```

#### 3. **Submit to Play Store**
```bash
eas submit --platform android
```

---

## 📋 Quick Comparison

| Feature | Expo Go | Development APK | Production APK |
|---------|---------|-----------------|----------------|
| **Time** | 5 mins | 30 mins | 1 hour |
| **Difficulty** | Easy | Medium | Hard |
| **Expo Go Required** | Yes | No | No |
| **All Features Work** | Some | Yes | Yes |
| **Updates** | Instant | Rebuild | Rebuild |
| **Best For** | Quick tests | Beta testing | App store |

---

## 🎯 **Recommended for You: Option 2 (Development APK)**

Since you want to send to friends for real testing, I recommend **Option 2 (Development Build APK)**.

### **Let me help you do it now:**

**Run these commands:**

```bash
# Step 1: Install EAS CLI
npm install -g eas-cli

# Step 2: Login (create account if needed)
eas login

# Step 3: Configure EAS
cd c:\Rootine
eas build:configure

# Step 4: Build APK
eas build --profile preview --platform android
```

**Wait 20-30 minutes, then:**
- Copy the APK download link
- Send to your friends
- They install and test!

---

## 🐛 Troubleshooting

### **"Install from unknown sources" error**
Friends need to enable this in phone settings:
1. Settings → Security
2. Enable "Install unknown apps" or "Unknown sources"
3. Allow from Chrome/Browser

### **Build failed**
Common issues:
- Check your Firebase API keys in code
- Make sure all dependencies are installed
- Check `app.json` is valid JSON

### **App crashes on startup**
- Check Firebase configuration
- Verify all environment variables are set
- Check Expo logs with `npx expo start`

---

## 📱 Alternative: Use Expo's Internal Distribution

Expo offers built-in distribution:

```bash
# Build and auto-upload to Expo
eas build --profile preview --platform android

# Share via Expo's web interface
# Go to: https://expo.dev/accounts/[your-account]/projects/rootine/builds
```

Friends can:
1. Visit the link you send
2. Download APK directly
3. Install and test

---

## 🎉 Quick Start Commands

**Copy-paste these commands in order:**

```powershell
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Go to project
cd c:\Rootine

# Configure EAS (first time only)
eas build:configure

# Build APK for testing
eas build --profile preview --platform android
```

**Wait for build to complete (~20 mins), then share the link!** 🚀

---

## 📝 Next Steps After Building

1. **Test yourself first** - Download and install on your own Android phone
2. **Create a feedback form** - Google Forms for testers to report issues
3. **Set up a group chat** - WhatsApp/Telegram for quick bug reports
4. **Version tracking** - Keep notes on what version you send
5. **Plan updates** - Rebuild and re-share when you fix bugs

---

## 💡 Pro Tips

1. **Use Expo Go first** - Test quickly before building APK
2. **Build preview, not production** - Faster, better for testing
3. **Keep build number** - Increment version in `app.json` for each build
4. **Test on multiple devices** - Different Android versions behave differently
5. **Check Firebase quotas** - Free tier has limits, monitor usage

---

**Ready to build? Let me know if you want me to help you run the commands!** 🚀
