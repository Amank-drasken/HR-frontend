#!/bin/bash

# ============================================
# FRONTEND DEPLOYMENT SCRIPT FOR VPS
# ============================================
# Copy this entire script and paste in VPS terminal
# Or run: bash /home/ubuntu/deploy.sh
# ============================================

set -e  # Exit on error

echo "=================================================="
echo "   🚀 FRONTEND DEPLOYMENT - HR APP"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Backup old deployment
echo -e "${BLUE}📁 Step 1: Cleaning up old frontend...${NC}"
cd /home/ubuntu
if [ -d "frontend" ]; then
    echo "   Removing existing frontend folder..."
    sudo rm -rf frontend
    echo -e "${GREEN}   ✓ Old frontend removed${NC}"
fi
echo ""

# Step 2: Clone repository
echo -e "${BLUE}📥 Step 2: Cloning repository...${NC}"
git clone https://github.com/Amank-drasken/HR-frontend.git frontend
echo -e "${GREEN}   ✓ Repository cloned${NC}"
echo ""

# Step 3: Navigate to frontend
echo -e "${BLUE}📂 Step 3: Navigating to frontend directory...${NC}"
cd /home/ubuntu/frontend
echo "   Current directory: $(pwd)"
echo -e "${GREEN}   ✓ In frontend directory${NC}"
echo ""

# Step 4: Install dependencies
echo -e "${BLUE}📦 Step 4: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}   ✓ Dependencies installed${NC}"
echo ""

# Step 5: Build for production
echo -e "${BLUE}🔨 Step 5: Building for production...${NC}"
npm run build
echo -e "${GREEN}   ✓ Production build created${NC}"
echo ""

# Step 6: Setup PM2
echo -e "${BLUE}🚀 Step 6: Setting up PM2...${NC}"

# Kill existing process
pm2 delete frontend 2>/dev/null || true
echo "   Old PM2 process deleted (if existed)"

# Start new process
pm2 start "npm start" --name "frontend" --cwd /home/ubuntu/frontend
echo "   New PM2 process started"

# Save PM2 configuration
pm2 save
echo "   PM2 configuration saved"

# Setup auto-start on reboot
pm2 startup
echo -e "${GREEN}   ✓ PM2 configured for auto-start${NC}"
echo ""

# Step 7: Verify deployment
echo -e "${BLUE}✅ Step 7: Verifying deployment...${NC}"
echo ""
echo "PM2 Status:"
pm2 status
echo ""
echo "Recent Logs:"
pm2 logs frontend --lines 30
echo ""

# Summary
echo "=================================================="
echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
echo "=================================================="
echo ""
echo "📊 Deployment Summary:"
echo "   Frontend URL: http://141.94.79.108:3001"
echo "   Process Name: frontend"
echo "   Port: 3001"
echo "   Status: $(pm2 describe frontend | grep status | awk '{print $NF}')"
echo ""
echo "📋 Useful Commands:"
echo "   pm2 status          - Check status"
echo "   pm2 logs frontend   - View logs"
echo "   pm2 restart frontend - Restart app"
echo "   pm2 stop frontend    - Stop app"
echo ""
echo "=================================================="
