# 🚀 Rootine Startup Script
# This script helps you get started with the Rootine project

Write-Host "
╔═══════════════════════════════════════════════╗
║                                               ║
║     🌱 ROOTINE - Lifestyle Habits App        ║
║                                               ║
║     Quick Start & Status Check                ║
║                                               ║
╚═══════════════════════════════════════════════╝
" -ForegroundColor Green

Write-Host "`n📊 Checking Project Status...`n" -ForegroundColor Cyan

# Function to check if a file exists
function Test-FileExists {
    param($Path, $Description)
    if (Test-Path $Path) {
        Write-Host "  ✅ $Description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ❌ $Description - MISSING!" -ForegroundColor Red
        return $false
    }
}

# Function to check if a command exists
function Test-CommandExists {
    param($Command, $Description)
    if (Get-Command $Command -ErrorAction SilentlyContinue) {
        Write-Host "  ✅ $Description installed" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ❌ $Description NOT installed!" -ForegroundColor Red
        return $false
    }
}

# Check Prerequisites
Write-Host "1️⃣ Prerequisites:" -ForegroundColor Yellow
$nodeInstalled = Test-CommandExists "node" "Node.js"
$npmInstalled = Test-CommandExists "npm" "NPM"
$gitInstalled = Test-CommandExists "git" "Git"

if ($nodeInstalled) {
    $nodeVersion = node -v
    Write-Host "     Node version: $nodeVersion" -ForegroundColor Gray
}

if ($npmInstalled) {
    $npmVersion = npm -v
    Write-Host "     NPM version: $npmVersion" -ForegroundColor Gray
}

# Check Project Files
Write-Host "`n2️⃣ Project Files:" -ForegroundColor Yellow
Test-FileExists "package.json" "package.json"
Test-FileExists "tsconfig.json" "TypeScript config"
Test-FileExists "App.tsx" "Main App file"
Test-FileExists ".env.example" ".env template"
$envExists = Test-FileExists ".env" "Environment variables"

# Check Node Modules
Write-Host "`n3️⃣ Dependencies:" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  ✅ node_modules folder exists" -ForegroundColor Green
    $packageCount = (Get-ChildItem "node_modules" -Directory).Count
    Write-Host "     $packageCount packages installed" -ForegroundColor Gray
} else {
    Write-Host "  ❌ node_modules NOT found - Run 'npm install'" -ForegroundColor Red
}

# Check Source Files
Write-Host "`n4️⃣ Source Code:" -ForegroundColor Yellow
Test-FileExists "src/types/index.ts" "Type definitions"
Test-FileExists "src/constants/theme.ts" "Theme constants"
Test-FileExists "src/services/firebase/config.ts" "Firebase config"
Test-FileExists "src/services/firebase/authService.ts" "Auth service"
Test-FileExists "src/services/firebase/habitService.ts" "Habit service"
Test-FileExists "src/services/api/geminiService.ts" "Gemini AI service"
Test-FileExists "src/contexts/AuthContext.tsx" "Auth context"

# Check Screens
Write-Host "`n5️⃣ UI Screens:" -ForegroundColor Yellow
Test-FileExists "src/screens/auth/OnboardingScreen.tsx" "Onboarding screen"
Test-FileExists "src/screens/auth/LoginScreen.tsx" "Login screen"
Test-FileExists "src/screens/auth/SignupScreen.tsx" "Signup screen"
Test-FileExists "src/screens/auth/ProfileSetupScreen.tsx" "Profile setup screen"
Test-FileExists "src/screens/main/HomeScreen.tsx" "Home screen"
Test-FileExists "src/screens/main/HabitsScreen.tsx" "Habits screen"
Test-FileExists "src/screens/main/FeedScreen.tsx" "Feed screen"
Test-FileExists "src/screens/main/DietScreen.tsx" "Diet screen"
Test-FileExists "src/screens/main/ProfileScreen.tsx" "Profile screen"

# Check Documentation
Write-Host "`n6️⃣ Documentation:" -ForegroundColor Yellow
Test-FileExists "README.md" "Main README"
Test-FileExists "SETUP.md" "Setup guide"
Test-FileExists "IMPLEMENTATION_GUIDE.md" "Implementation guide"
Test-FileExists "API_REFERENCE.md" "API reference"
Test-FileExists "FINAL_STATUS.md" "Project status"

# Provide Next Steps
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan

if (-not $envExists) {
    Write-Host "`n⚠️  REQUIRED: Configure Environment Variables" -ForegroundColor Yellow
    Write-Host "
1. Copy .env.example to .env:
   PS> Copy-Item .env.example .env

2. Get Firebase credentials from https://console.firebase.google.com
   - Create new project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Storage
   - Copy config values to .env

3. Get Gemini API key from https://makersuite.google.com/app/apikey
   - Create API key
   - Copy to .env as GEMINI_API_KEY
" -ForegroundColor White
}

if (-not (Test-Path "node_modules")) {
    Write-Host "`n⚠️  REQUIRED: Install Dependencies" -ForegroundColor Yellow
    Write-Host "
Run: npm install

This will install all required packages (~1,383 packages).
" -ForegroundColor White
}

Write-Host "`n📚 Quick Reference Commands:" -ForegroundColor Cyan
Write-Host "
  npm install          Install dependencies
  npm start            Start Expo dev server
  npm run android      Run on Android emulator
  npm run ios          Run on iOS simulator
  npm run web          Run in web browser
  npm run lint         Check code style
  npm run type-check   Check TypeScript errors

" -ForegroundColor White

Write-Host "📖 Documentation Guides:" -ForegroundColor Cyan
Write-Host "
  README.md                  Project overview & features
  SETUP.md                   Detailed setup instructions
  FINAL_STATUS.md            Current implementation status (35% complete)
  IMPLEMENTATION_GUIDE.md    How to implement remaining features
  API_REFERENCE.md           Complete API documentation
  QUICK_REFERENCE.md         Common commands & patterns
  DEVELOPMENT.md             Architecture & workflows

" -ForegroundColor White

Write-Host "🎯 Current Status:" -ForegroundColor Cyan
Write-Host "
  ✅ Project foundation (100%)
  ✅ Authentication system (100%)
  ✅ Firebase services (100%)
  ✅ AI integration (100%)
  ✅ Notifications (100%)
  ✅ Documentation (100%)
  🚧 Habit UI (20%)
  ⏳ Social features (0%)
  ⏳ Challenges (0%)
  ⏳ Diet UI (0%)
  ⏳ Media uploads (0%)
  ⏳ Premium features (0%)

  Overall Progress: ~35% Complete

" -ForegroundColor White

Write-Host "🚀 Immediate Next Steps:" -ForegroundColor Cyan
Write-Host "
  1. Run: npm install
  2. Configure .env file with Firebase & Gemini credentials
  3. Run: npm start
  4. Test authentication flow
  5. Implement Habits UI (see IMPLEMENTATION_GUIDE.md section 'Phase 1')
  6. Build Diet UI screens
  7. Add social features
  8. Implement challenges & gamification
  9. Polish & launch!

" -ForegroundColor White

Write-Host "💡 Pro Tips:" -ForegroundColor Cyan
Write-Host "
  • Use Expo Go app for quick testing (iOS/Android)
  • Check QUICK_REFERENCE.md for common patterns
  • Refer to API_REFERENCE.md for service usage
  • Follow IMPLEMENTATION_GUIDE.md for features
  • Each feature has detailed step-by-step instructions
  • Mock data is available for UI development
  • All core services are ready to use

" -ForegroundColor White

Write-Host "❓ Need Help?" -ForegroundColor Cyan
Write-Host "
  1. Check DOCS_INDEX.md for all documentation
  2. Search relevant .md files
  3. Check code comments
  4. Review example code in components
  5. Test with mock data first

" -ForegroundColor White

Write-Host "═══════════════════════════════════════════════`n" -ForegroundColor Green

Write-Host "Ready to build something amazing! 🌱`n" -ForegroundColor Green

# Ask if user wants to run npm install
if (-not (Test-Path "node_modules")) {
    $response = Read-Host "Would you like to run 'npm install' now? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "`n📦 Installing dependencies...`n" -ForegroundColor Cyan
        npm install
        Write-Host "`n✅ Dependencies installed!`n" -ForegroundColor Green
    }
}

# Ask if user wants to create .env
if (-not $envExists -and (Test-Path ".env.example")) {
    $response = Read-Host "Would you like to create .env file from template? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Copy-Item .env.example .env
        Write-Host "`n✅ .env file created! Remember to add your Firebase and Gemini API credentials.`n" -ForegroundColor Green
        Write-Host "Edit .env file and add:
  - Firebase configuration (from Firebase Console)
  - Gemini API key (from Google AI Studio)
`n" -ForegroundColor Yellow
    }
}

Write-Host "═══════════════════════════════════════════════`n" -ForegroundColor Cyan
Write-Host "🎉 Setup check complete!`n" -ForegroundColor Green

if ((Test-Path "node_modules") -and $envExists) {
    Write-Host "You're all set! Run 'npm start' to begin development.`n" -ForegroundColor Green
} else {
    Write-Host "Complete the steps above, then run this script again to verify.`n" -ForegroundColor Yellow
}
