#!/bin/bash

# Rootine APK Build Verification Script
# This script verifies that all configurations are correct before building APK

echo "🔍 Rootine APK Build Verification"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2 - File not found: $1"
        ((ERRORS++))
    fi
}

# Function to check string in file
check_string() {
    if grep -q "$2" "$1"; then
        echo -e "${GREEN}✓${NC} $3"
    else
        echo -e "${YELLOW}⚠${NC} $3"
        ((WARNINGS++))
    fi
}

echo "📁 Checking Required Files..."
check_file "package.json" "package.json exists"
check_file "app.json" "app.json exists"
check_file "eas.json" "eas.json exists"
check_file "src/services/api/geminiService.ts" "Gemini service exists"
check_file "src/services/firebase/config.ts" "Firebase config exists"
echo ""

echo "🔧 Checking Configuration..."
check_string "app.json" "geminiApiKey" "Gemini API key in app.json"
check_string "eas.json" "EXPO_PUBLIC_GEMINI_API_KEY" "Gemini API key in eas.json"
check_string "src/services/api/geminiService.ts" "Constants.expoConfig" "Constants config check"
check_string "src/services/api/geminiService.ts" "buildFallbackPlan" "Fallback plan exists"
echo ""

echo "📦 Checking Dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
else
    echo -e "${RED}✗${NC} node_modules not found - Run: npm install"
    ((ERRORS++))
fi

if [ -f "node_modules/expo-constants/package.json" ]; then
    echo -e "${GREEN}✓${NC} expo-constants installed"
else
    echo -e "${RED}✗${NC} expo-constants not found - Run: npm install expo-constants"
    ((ERRORS++))
fi
echo ""

echo "🔒 Checking Security..."
if [ -f ".env" ]; then
    if grep -q ".env" ".gitignore"; then
        echo -e "${GREEN}✓${NC} .env is in .gitignore"
    else
        echo -e "${YELLOW}⚠${NC} .env should be in .gitignore"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} .env file not found (optional for production)"
fi
echo ""

echo "🌐 Checking Network Configuration..."
check_string "src/services/api/geminiService.ts" "https://generativelanguage.googleapis.com" "Gemini API endpoint"
check_string "src/services/firebase/config.ts" "initializeApp" "Firebase initialization"
echo ""

echo "✨ Checking Features..."
check_file "src/services/firebase/analyticsService.ts" "Analytics service"
check_file "src/services/api/motivationalQuotes.ts" "Motivational quotes"
check_file "src/services/api/habitSuggestions.ts" "Habit suggestions"
check_file "src/screens/main/InsightsScreen.tsx" "Insights screen"
echo ""

echo "=================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo ""
    echo "📱 Ready to build APK:"
    echo "   Production: eas build --platform android --profile production"
    echo "   Preview:    eas build --platform android --profile preview"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Found $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "❌ Please fix errors before building APK"
    echo ""
    exit 1
fi
