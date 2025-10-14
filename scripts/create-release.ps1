# GitHub Release Automation Script for Rootine v1.0.0

param(
    [string]$BuildId = "b92f05f1-fe3d-4b8a-8c8f-0c28fba5bfce"
)

Write-Host ""
Write-Host "Rootine v1.0.0 Release Automation" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Monitor build status
Write-Host "Step 1: Monitoring EAS Build Status..." -ForegroundColor Yellow
Write-Host "Build ID: $BuildId" -ForegroundColor Gray
Write-Host ""

$maxAttempts = 30
$attempt = 0
$buildComplete = $false

while ($attempt -lt $maxAttempts -and !$buildComplete) {
    $attempt++
    Write-Host "[$attempt/$maxAttempts] Checking build status..." -ForegroundColor Gray
    
    $buildInfo = npx eas build:view $BuildId 2>&1 | Out-String
    
    if ($buildInfo -match "Status\s+finished") {
        $buildComplete = $true
        Write-Host ""
        Write-Host "Build completed successfully!" -ForegroundColor Green
        Write-Host ""
    }
    elseif ($buildInfo -match "Status\s+errored" -or $buildInfo -match "Status\s+failed") {
        Write-Host ""
        Write-Host "Build failed. Check logs at:" -ForegroundColor Red
        Write-Host "https://expo.dev/accounts/shiv998899/projects/rootine/builds/$BuildId" -ForegroundColor Red
        Write-Host ""
        exit 1
    }
    else {
        Write-Host "   Status: In progress..." -ForegroundColor Gray
        if ($attempt -lt $maxAttempts) {
            Start-Sleep -Seconds 30
        }
    }
}

if (!$buildComplete) {
    Write-Host ""
    Write-Host "Build is taking longer than expected. Continue monitoring at:" -ForegroundColor Yellow
    Write-Host "https://expo.dev/accounts/shiv998899/projects/rootine/builds/$BuildId" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run this script again once the build completes." -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

# Step 2: Download APK
Write-Host "Step 2: Downloading APK..." -ForegroundColor Yellow

try {
    npx eas build:download --platform android --latest --output "./Rootine-v1.0.0.apk"
    Write-Host "APK downloaded successfully: ./Rootine-v1.0.0.apk" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "Failed to download APK: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Step 3: Verify APK
Write-Host "Step 3: Verifying APK..." -ForegroundColor Yellow

if (Test-Path "./Rootine-v1.0.0.apk") {
    $apkSize = (Get-Item "./Rootine-v1.0.0.apk").Length / 1MB
    Write-Host "APK verified - Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host "APK file not found" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Step 4: Display next steps
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Ready for GitHub Release!" -ForegroundColor Green
Write-Host ""
Write-Host "APK Location: ./Rootine-v1.0.0.apk" -ForegroundColor White
Write-Host "Release Notes: ./RELEASE_NOTES.md" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to: https://github.com/shiv989898/Rootine/releases/new" -ForegroundColor White
Write-Host "2. Select tag: v1.0.0" -ForegroundColor White
Write-Host "3. Title: Rootine v1.0.0 - Initial Public Release" -ForegroundColor White
Write-Host "4. Copy content from RELEASE_NOTES.md to description" -ForegroundColor White
Write-Host "5. Upload: Rootine-v1.0.0.apk" -ForegroundColor White
Write-Host "6. Click: Publish release" -ForegroundColor White
Write-Host ""
Write-Host "Or use GitHub CLI (if installed):" -ForegroundColor Cyan
Write-Host "gh release create v1.0.0 ./Rootine-v1.0.0.apk --title 'Rootine v1.0.0' --notes-file RELEASE_NOTES.md" -ForegroundColor Gray
Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

