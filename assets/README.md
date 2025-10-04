# Assets Folder Structure

This folder contains all images and assets for the Rootine app.

## Required Files

### App Icons
- **icon.png** (1024x1024) - Main app icon for all platforms
- **adaptive-icon.png** (1024x1024) - Adaptive icon for Android (foreground)
- **favicon.png** (48x48 or larger) - Web favicon

### Splash Screen
- **splash.png** (2048x2048 recommended) - Loading splash screen
  - The image will be resized to fit the screen
  - Background color is set in app.json (#4CAF50)

### Notifications
- **notification-icon.png** (96x96 recommended) - Icon for notifications
  - Should be a monochrome/white icon on transparent background

## Directory Structure

```
assets/
├── icon.png                    # 1024x1024 app icon
├── adaptive-icon.png           # 1024x1024 Android adaptive icon
├── favicon.png                 # 48x48+ web favicon
├── splash.png                  # 2048x2048 splash screen
├── notification-icon.png       # 96x96 notification icon
└── README.md                   # This file
```

## Guidelines

### App Icon (icon.png)
- Size: 1024x1024 pixels
- Format: PNG with transparency
- Should look good at small sizes (44x44)
- Avoid text that might become illegible
- Use the Rootine brand colors (green theme)
- Suggested design: Stylized "R" or plant/wellness icon

### Adaptive Icon (adaptive-icon.png)
- Size: 1024x1024 pixels
- Safe zone: Keep important content in center 768x768
- Android will mask this into various shapes (circle, square, rounded)
- Background color in app.json: #4CAF50

### Splash Screen (splash.png)
- Size: 2048x2048 pixels (or larger)
- Format: PNG with transparency
- Resize mode: "contain" (set in app.json)
- Background: #4CAF50 (set in app.json)
- Should be simple and load quickly
- Suggested: Rootine logo/icon centered

### Notification Icon (notification-icon.png)
- Size: 96x96 pixels (or larger)
- Format: PNG
- Should be monochrome white on transparent background
- Simpler than app icon (Android requirement)
- Android tints this automatically

## Creating Icons

### Quick Start (Placeholder Icons)
If you need placeholder icons to test:
1. Create simple icons using any image editor
2. Use solid colors matching the brand (#4CAF50 green)
3. Keep it simple for now

### Professional Icons (Production)
For production-ready icons, you can:
1. Design in Figma/Sketch/Illustrator
2. Export at the exact sizes listed above
3. Use online tools like:
   - https://appicon.co
   - https://www.figma.com
   - https://www.canva.com

### Using Expo's Icon Generator
Expo can generate all icon variations from one source:
```bash
npx expo-app-icon generate path/to/your/icon.png
```

## Testing Icons

After adding icons:
1. Clear Expo cache: `npx expo start -c`
2. Reload the app
3. Check on device (not just simulator)
4. Test splash screen appearance
5. Send a test notification to verify notification icon

## Notes

- All these files are referenced in `app.json`
- Icons should be optimized for file size
- PNG format is recommended for transparency support
- Keep source files (PSD, AI, Figma) in a separate design folder
- Don't commit large source files to git
