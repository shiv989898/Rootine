# Rootine APK Build Verification Script (PowerShell)
# This script verifies that all configurations are correct before building APK

Write-Host "Rootine APK Build Verification" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$Errors = 0
$Warnings = 0

# Function to check file exists
function Test-BuildFile {
    param($Path, $Description)
    if (Test-Path $Path) {
        Write-Host "[OK] $Description" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $Description - File not found: $Path" -ForegroundColor Red
        $script:Errors++
    }
}

# Function to check string in file
function Test-BuildString {
    param($Path, $Pattern, $Description)
    if (Test-Path $Path) {
        $content = Get-Content $Path -Raw
        if ($content -match $Pattern) {
            Write-Host "[OK] $Description" -ForegroundColor Green
        } else {
            Write-Host "[WARN] $Description" -ForegroundColor Yellow
            $script:Warnings++
        }
    } else {
        Write-Host "[FAIL] $Description - File not found: $Path" -ForegroundColor Red
        $script:Errors++
    }
}

Write-Host "Checking Required Files..." -ForegroundColor White
Test-BuildFile "package.json" "package.json exists"
Test-BuildFile "app.json" "app.json exists"
Test-BuildFile "eas.json" "eas.json exists"
Test-BuildFile "src\services\api\geminiService.ts" "Gemini service exists"
Test-BuildFile "src\services\firebase\config.ts" "Firebase config exists"
Write-Host ""

Write-Host "Checking Configuration..." -ForegroundColor White
Test-BuildString "app.json" "geminiApiKey" "Gemini API key in app.json"
Test-BuildString "eas.json" "EXPO_PUBLIC_GEMINI_API_KEY" "Gemini API key in eas.json"
Test-BuildString "src\services\api\geminiService.ts" "Constants.expoConfig" "Constants config check"
Test-BuildString "src\services\api\geminiService.ts" "buildFallbackPlan" "Fallback plan exists"
Write-Host ""

Write-Host "Checking Dependencies..." -ForegroundColor White
if (Test-Path "node_modules") {
    Write-Host "[OK] node_modules exists" -ForegroundColor Green
} else {
    Write-Host "[FAIL] node_modules not found - Run: npm install" -ForegroundColor Red
    $Errors++
}

if (Test-Path "node_modules\expo-constants\package.json") {
    Write-Host "[OK] expo-constants installed" -ForegroundColor Green
} else {
    Write-Host "[FAIL] expo-constants not found - Run: npm install expo-constants" -ForegroundColor Red
    $Errors++
}
Write-Host ""

Write-Host "Checking Security..." -ForegroundColor White
if (Test-Path ".env") {
    $gitignore = Get-Content ".gitignore" -Raw -ErrorAction SilentlyContinue
    if ($gitignore -match "\.env") {
        Write-Host "[OK] .env is in .gitignore" -ForegroundColor Green
    } else {
        Write-Host "[WARN] .env should be in .gitignore" -ForegroundColor Yellow
        $Warnings++
    }
} else {
    Write-Host "[WARN] .env file not found (optional for production)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Checking Network Configuration..." -ForegroundColor White
Test-BuildString "src\services\api\geminiService.ts" "https://generativelanguage.googleapis.com" "Gemini API endpoint"
Test-BuildString "src\services\firebase\config.ts" "initializeApp" "Firebase initialization"
Write-Host ""

Write-Host "Checking Features..." -ForegroundColor White
Test-BuildFile "src\services\firebase\analyticsService.ts" "Analytics service"
Test-BuildFile "src\services\api\motivationalQuotes.ts" "Motivational quotes"
Test-BuildFile "src\services\api\habitSuggestions.ts" "Habit suggestions"
Test-BuildFile "src\screens\main\InsightsScreen.tsx" "Insights screen"
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
if ($Errors -eq 0) {
    Write-Host "All critical checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ready to build APK:" -ForegroundColor Cyan
    Write-Host "   Production: eas build --platform android --profile production" -ForegroundColor White
    Write-Host "   Preview:    eas build --platform android --profile preview" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    Write-Host "Found $Errors error(s) and $Warnings warning(s)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix errors before building APK" -ForegroundColor Red
    Write-Host ""
    exit 1
}
