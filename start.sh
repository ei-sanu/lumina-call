#!/bin/bash

# NovaArc - Quick Start Script
# This script helps you get the application running quickly

echo "🚀 NovaArc - Quick Start Script"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo ""

# Function to check if .env exists
check_env() {
    local env_file=$1
    local example_file="${env_file}.example"

    if [ ! -f "$env_file" ]; then
        echo "⚠️  $env_file not found"
        if [ -f "$example_file" ]; then
            echo "   Creating $env_file from $example_file"
            cp "$example_file" "$env_file"
            echo "   ⚠️  Please edit $env_file and add your API keys"
            return 1
        else
            echo "   ❌ $example_file also not found"
            return 1
        fi
    else
        echo "✅ $env_file found"
        return 0
    fi
}

# Check environment files
echo "📝 Checking environment files..."
frontend_env_ok=true
backend_env_ok=true

if ! check_env ".env"; then
    frontend_env_ok=false
fi

if ! check_env "server/.env"; then
    backend_env_ok=false
fi

echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

echo ""

if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd server
    npm install
    cd ..
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend dependencies already installed"
fi

echo ""
echo "===================================="
echo ""

# Check if environment variables are configured
if [ "$frontend_env_ok" = false ] || [ "$backend_env_ok" = false ]; then
    echo "⚠️  IMPORTANT: Please configure your environment variables!"
    echo ""
    echo "📋 You need to:"
    echo "   1. Create a Clerk account at https://clerk.com"
    echo "   2. Create a Supabase project at https://supabase.com"
    echo "   3. Update .env with your Clerk publishable key"
    echo "   4. Update .env with your Supabase URL and anon key"
    echo "   5. Update server/.env with the same Supabase credentials"
    echo "   6. Run the SQL schema from supabase-schema.sql in Supabase"
    echo ""
    echo "See SETUP.md for detailed instructions."
    echo ""
    exit 1
fi

# Offer to start the servers
echo "🎯 Environment configured!"
echo ""
echo "Ready to start the application."
echo ""
echo "You need to run two commands in separate terminals:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd server && npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  npm run dev"
echo ""

read -p "Would you like to see detailed setup instructions? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v less &> /dev/null; then
        less SETUP.md
    elif command -v more &> /dev/null; then
        more SETUP.md
    else
        cat SETUP.md
    fi
fi

echo ""
echo "✨ Setup complete! Happy coding!"
echo ""
