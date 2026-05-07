#!/bin/bash

# VPS Frontend Deployment Script
# Run this on VPS via: bash deploy-frontend.sh

echo "🚀 Starting Frontend Deployment..."

# Navigate to home
cd /home/ubuntu

# Remove old folder if exists
if [ -d "frontend" ]; then
    echo "📁 Removing old frontend folder..."
    rm -rf frontend
fi

# Clone repository
echo "📥 Cloning frontend repository..."
git clone https://github.com/Amank-drasken/HR-frontend.git frontend
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build production
echo "🔨 Building for production..."
npm run build

# Kill existing PM2 process if any
pm2 delete frontend 2>/dev/null || true

# Start with PM2
echo "🚀 Starting with PM2..."
pm2 start "npm start" --name "frontend" --cwd /home/ubuntu/frontend

# Save PM2 config
pm2 save
pm2 startup

echo "✅ Frontend Deployment Complete!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 Logs:"
pm2 logs frontend --lines 20

echo ""
echo "🎉 Frontend is running on: http://141.94.79.108:3001"
