#!/bin/bash

# 🚀 Rootine Quick Setup Script
# This script helps you set up the Rootine app quickly

echo "🌱 Welcome to Rootine Setup!"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "📥 Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo "📝 Creating .env from template..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file"
        echo "⚠️  IMPORTANT: Edit .env and add your API keys!"
        echo ""
    else
        echo "❌ .env.example not found"
        exit 1
    fi
else
    echo "✅ .env file exists"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
    echo ""
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Run expo doctor
echo "🔍 Running health check..."
npx expo-doctor

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All checks passed!"
    echo ""
else
    echo ""
    echo "⚠️  Some checks failed. Please review the output above."
    echo ""
fi

# Final instructions
echo "================================"
echo "🎉 Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run 'npm start' to start the app"
echo "3. Scan QR code with Expo Go app"
echo ""
echo "Need help? Check README.md"
echo ""
