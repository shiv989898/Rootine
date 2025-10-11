# 🚀 Rootine Quick Setup Script (PowerShell)
# This script helps you set up the Rootine app quickly on Windows

Write-Host "🌱 Welcome to Rootine Setup!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "📥 Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found" -ForegroundColor Yellow
    Write-Host "📝 Creating .env from template..." -ForegroundColor Cyan
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Created .env file" -ForegroundColor Green
        Write-Host "⚠️  IMPORTANT: Edit .env and add your API keys!" -ForegroundColor Yellow
        Write-Host ""
    }
    else {
        Write-Host "❌ .env.example not found" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    Write-Host ""
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Run expo doctor
Write-Host "🔍 Running health check..." -ForegroundColor Cyan
npx expo-doctor

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All checks passed!" -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "⚠️  Some checks failed. Please review the output above." -ForegroundColor Yellow
    Write-Host ""
}

# Final instructions
Write-Host "================================" -ForegroundColor Green
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your API keys"
Write-Host "2. Run 'npm start' to start the app"
Write-Host "3. Scan QR code with Expo Go app"
Write-Host ""
Write-Host "Need help? Check README.md" -ForegroundColor Yellow
Write-Host ""
