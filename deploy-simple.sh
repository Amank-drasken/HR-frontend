#!/bin/bash

echo "🚀 FRONTEND DEPLOYMENT STARTED..."

# Step 1: Navigate and cleanup
cd /home/ubuntu
rm -rf frontend

# Step 2: Clone repository
echo "[1/6] Cloning repository..."
git clone https://github.com/Amank-drasken/HR-frontend.git frontend
cd frontend

# Step 3: Install dependencies
echo "[2/6] Installing dependencies..."
npm install

# Step 4: Build
echo "[3/6] Building production..."
npm run build

# Step 5: Setup PM2
echo "[4/6] Setting up PM2..."
pm2 delete frontend 2>/dev/null || true

# Step 6: Start
echo "[5/6] Starting application..."
pm2 start "npm start" --name "frontend" --cwd /home/ubuntu/frontend
pm2 save
pm2 startup 2>/dev/null || true

# Step 7: Status
echo "[6/6] Checking status..."
echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
pm2 status
echo ""
echo "📋 Recent logs:"
pm2 logs frontend --lines 50
