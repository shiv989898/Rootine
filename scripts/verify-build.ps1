# Rootine APK Build Verification Script (PowerShell)
# This script verifies that all configurations are correct before building APK

Write-Host "🔍 Rootine APK Build Verification" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$Errors = 0
$Warnings = 0

# Function to check file exists
function Check-File {
    param($Path, $Description)
    if (Test-Path $Path) {
        Write-Host "✓ $Description" -ForegroundColor Green
    } else {
        Write-Host "✗ $Description - File not found: $Path" -ForegroundColor Red
        $script:Errors++
    }
}

# Function to check string in file
function Check-String {
    param($Path, $Pattern, $Description)
    if (Test-Path $Path) {
        $content = Get-Content $Path -Raw
        if ($content -match $Pattern) {
            Write-Host "✓ $Description" -ForegroundColor Green
        } else {
            Write-Host "⚠ $Description" -ForegroundColor Yellow
            $script:Warnings++
        }
    } else {
        Write-Host "✗ $Description - File not found: $Path" -ForegroundColor Red
        $script:Errors++
    }
}

Write-Host "📁 Checking Required Files..." -ForegroundColor White
Check-File "package.json" "package.json exists"
Check-File "app.json" "app.json exists"
Check-File "eas.json" "eas.json exists"
Check-File "src\services\api\geminiService.ts" "Gemini service exists"
Check-File "src\services\firebase\config.ts" "Firebase config exists"
Write-Host ""

Write-Host "🔧 Checking Configuration..." -ForegroundColor White
Check-String "app.json" "geminiApiKey" "Gemini API key in app.json"
Check-String "eas.json" "EXPO_PUBLIC_GEMINI_API_KEY" "Gemini API key in eas.json"
Check-String "src\services\api\geminiService.ts" "Constants.expoConfig" "Constants config check"
Check-String "src\services\api\geminiService.ts" "buildFallbackPlan" "Fallback plan exists"
Write-Host ""

Write-Host "📦 Checking Dependencies..." -ForegroundColor White
if (Test-Path "node_modules") {
    Write-Host "✓ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "✗ node_modules not found - Run: npm install" -ForegroundColor Red
    $Errors++
}

if (Test-Path "node_modules\expo-constants\package.json") {
    Write-Host "✓ expo-constants installed" -ForegroundColor Green
} else {
    Write-Host "✗ expo-constants not found - Run: npm install expo-constants" -ForegroundColor Red
    $Errors++
}
Write-Host ""

Write-Host "🔒 Checking Security..." -ForegroundColor White
if (Test-Path ".env") {
    $gitignore = Get-Content ".gitignore" -Raw -ErrorAction SilentlyContinue
    if ($gitignore -match "\.env") {
        Write-Host "✓ .env is in .gitignore" -ForegroundColor Green
    } else {
        Write-Host "⚠ .env should be in .gitignore" -ForegroundColor Yellow
        $Warnings++
    }
} else {
    Write-Host "⚠ .env file not found (optional for production)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "🌐 Checking Network Configuration..." -ForegroundColor White
Check-String "src\services\api\geminiService.ts" "https://generativelanguage.googleapis.com" "Gemini API endpoint"
Check-String "src\services\firebase\config.ts" "initializeApp" "Firebase initialization"
Write-Host ""

Write-Host "✨ Checking Features..." -ForegroundColor White
Check-File "src\services\firebase\analyticsService.ts" "Analytics service"
Check-File "src\services\api\motivationalQuotes.ts" "Motivational quotes"
Check-File "src\services\api\habitSuggestions.ts" "Habit suggestions"
Check-File "src\screens\main\InsightsScreen.tsx" "Insights screen"
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
if ($Errors -eq 0) {
    Write-Host "✓ All critical checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Ready to build APK:" -ForegroundColor Cyan
    Write-Host "   Production: eas build --platform android --profile production" -ForegroundColor White
    Write-Host "   Preview:    eas build --platform android --profile preview" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    Write-Host "✗ Found $Errors error(s) and $Warnings warning(s)" -ForegroundColor Red
    Write-Host ""
    Write-Host "❌ Please fix errors before building APK" -ForegroundColor Red
    Write-Host ""
    exit 1
}
