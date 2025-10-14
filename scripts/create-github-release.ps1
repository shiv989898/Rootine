# GitHub Release Creation Script for Rootine v1.0.0
# This script guides you through creating a GitHub release

Write-Host "`n==================================" -ForegroundColor Green
Write-Host "   GitHub Release Creator v1.0" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if APK exists
$apkPath = ".\rootine-v1.0.0.apk"
if (Test-Path $apkPath) {
    $apkSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "`nAPK Found: rootine-v1.0.0.apk ($([math]::Round($apkSize, 2)) MB)" -ForegroundColor Cyan
} else {
    Write-Host "`nERROR: APK file not found at $apkPath" -ForegroundColor Red
    exit 1
}

Write-Host "`n----------------------------------" -ForegroundColor Yellow
Write-Host "Release Information" -ForegroundColor Yellow
Write-Host "----------------------------------" -ForegroundColor Yellow
Write-Host "Repository: shiv989898/Rootine"
Write-Host "Tag: v1.0.0"
Write-Host "Branch: master"
Write-Host "Commit: 14fbfbb"
Write-Host "`n"

# Method 1: Using GitHub CLI (if installed)
Write-Host "Checking for GitHub CLI (gh)..." -ForegroundColor Cyan
try {
    $ghVersion = gh --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "GitHub CLI detected!" -ForegroundColor Green
        Write-Host "`nOption 1: Create release with GitHub CLI" -ForegroundColor Yellow
        Write-Host "----------------------------------" -ForegroundColor Yellow
        Write-Host "Run this command:" -ForegroundColor White
        Write-Host ""
        Write-Host "gh release create v1.0.0 rootine-v1.0.0.apk --title `"Rootine v1.0.0 - Initial Release`" --notes-file RELEASE_NOTES.md" -ForegroundColor Green
        Write-Host ""
    }
} catch {
    Write-Host "GitHub CLI not installed" -ForegroundColor Yellow
}

# Method 2: Manual creation
Write-Host "`nOption 2: Create release manually" -ForegroundColor Yellow
Write-Host "----------------------------------" -ForegroundColor Yellow
Write-Host "1. Open: https://github.com/shiv989898/Rootine/releases/new" -ForegroundColor White
Write-Host "2. Select tag: v1.0.0 (or create new tag)" -ForegroundColor White
Write-Host "3. Release title: Rootine v1.0.0 - Initial Release" -ForegroundColor White
Write-Host "4. Upload file: rootine-v1.0.0.apk" -ForegroundColor White
Write-Host "5. Copy release notes from: RELEASE_NOTES.md" -ForegroundColor White
Write-Host "6. Click 'Publish release'" -ForegroundColor White

Write-Host "`n----------------------------------" -ForegroundColor Yellow
Write-Host "Quick Actions" -ForegroundColor Yellow
Write-Host "----------------------------------" -ForegroundColor Yellow
Write-Host "1. Open GitHub releases page in browser" -ForegroundColor White
Write-Host "2. Copy release notes to clipboard" -ForegroundColor White
Write-Host "3. View APK details" -ForegroundColor White
Write-Host "4. Exit" -ForegroundColor White

$choice = Read-Host "`nSelect an option (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`nOpening GitHub releases page..." -ForegroundColor Cyan
        Start-Process "https://github.com/shiv989898/Rootine/releases/new?tag=v1.0.0&title=Rootine%20v1.0.0%20-%20Initial%20Release"
        Write-Host "Browser opened! Now:" -ForegroundColor Green
        Write-Host "1. Upload the APK file: rootine-v1.0.0.apk" -ForegroundColor White
        Write-Host "2. Paste release notes from RELEASE_NOTES.md" -ForegroundColor White
        Write-Host "3. Click 'Publish release'" -ForegroundColor White
    }
    "2" {
        Write-Host "`nCopying release notes to clipboard..." -ForegroundColor Cyan
        Get-Content "RELEASE_NOTES.md" | Set-Clipboard
        Write-Host "Release notes copied! Now:" -ForegroundColor Green
        Write-Host "1. Go to: https://github.com/shiv989898/Rootine/releases/new" -ForegroundColor White
        Write-Host "2. Tag: v1.0.0" -ForegroundColor White
        Write-Host "3. Title: Rootine v1.0.0 - Initial Release" -ForegroundColor White
        Write-Host "4. Paste release notes (Ctrl+V)" -ForegroundColor White
        Write-Host "5. Upload APK: rootine-v1.0.0.apk" -ForegroundColor White
        Write-Host "6. Publish!" -ForegroundColor White
    }
    "3" {
        Write-Host "`nAPK Details:" -ForegroundColor Cyan
        Write-Host "File: rootine-v1.0.0.apk" -ForegroundColor White
        Write-Host "Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor White
        Write-Host "Location: $((Get-Item $apkPath).FullName)" -ForegroundColor White
        Write-Host "`nBuild Info:" -ForegroundColor Cyan
        Write-Host "Build ID: 23acc5e3-31f2-4d5a-9ce4-e6f38e7a2706" -ForegroundColor White
        Write-Host "Platform: Android" -ForegroundColor White
        Write-Host "SDK Version: 54.0.0" -ForegroundColor White
        Write-Host "Version: 1.0.0" -ForegroundColor White
        Write-Host "`nDownload URL:" -ForegroundColor Cyan
        Write-Host "https://expo.dev/artifacts/eas/5pvoyM6xuWe9AGEeBUh3Ky.apk" -ForegroundColor White
    }
    "4" {
        Write-Host "`nGoodbye!" -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host "`nInvalid option" -ForegroundColor Red
    }
}

Write-Host "`n==================================" -ForegroundColor Green
Write-Host "   Release Notes Preview" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host "`nFirst few lines of RELEASE_NOTES.md:" -ForegroundColor Cyan
Get-Content "RELEASE_NOTES.md" | Select-Object -First 30 | ForEach-Object { Write-Host $_ -ForegroundColor White }
Write-Host "`n... (full content in RELEASE_NOTES.md)" -ForegroundColor Gray

Write-Host "`n==================================" -ForegroundColor Green
Write-Host "Script completed!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
