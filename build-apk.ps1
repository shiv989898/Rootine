# Build Android APK with correct Java version
# This script sets up the environment and builds the APK

Write-Host "🚀 Starting Android Build..." -ForegroundColor Green

# Set Java 21 from Android Studio
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "C:\Program Files\Android\Android Studio\jbr\bin;$env:PATH"

# Set Android SDK
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# Verify Java version
Write-Host "`n✓ Java Version:" -ForegroundColor Cyan
java -version

Write-Host "`n✓ Building Release APK..." -ForegroundColor Cyan
npx expo run:android --variant release

Write-Host "`n🎉 Build Complete!" -ForegroundColor Green
Write-Host "APK Location: C:\Rootine\android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Yellow
