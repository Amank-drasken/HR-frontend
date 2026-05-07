#!/usr/bin/env python3
"""
Simplified SSH Deployment - No external libraries required
Uses subprocess to run SSH commands
"""

import subprocess
import os
import sys

VPS_HOST = "141.94.79.108"
VPS_USER = "ubuntu"  
VPS_PASS = "6bnb7pcnNq2H"

# Complete deployment script
deploy_script = """#!/bin/bash
set -e
echo "🚀 DEPLOYMENT STARTING..."
cd /home/ubuntu
rm -rf frontend 2>/dev/null || true
echo "[1/5] Cloning repository..."
git clone https://github.com/Amank-drasken/HR-frontend.git frontend
cd frontend
echo "[2/5] Installing npm packages..."
npm install
echo "[3/5] Building production..."
npm run build
echo "[4/5] Starting with PM2..."
pm2 delete frontend 2>/dev/null || true
pm2 start "npm start" --name "frontend" --cwd /home/ubuntu/frontend
pm2 save
pm2 startup 2>/dev/null || true
echo ""
echo "✅ DEPLOYMENT SUCCESSFUL!"
pm2 status
echo ""
echo "🌐 Frontend: http://141.94.79.108:3001"
pm2 logs frontend --lines 50
"""

print("=" * 50)
print("  🚀 VPS Frontend Deployment")
print("=" * 50)
print()

print("📋 COMMANDS TO EXECUTE:")
print()
print("-" * 50)
print(deploy_script)
print("-" * 50)
print()

print("📝 INSTRUCTIONS:")
print()
print("1. Open Terminal/PowerShell")
print(f"2. Run: ssh ubuntu@{VPS_HOST}")
print(f"3. Password: {VPS_PASS}")
print("4. Copy & paste above commands")
print("5. Press Enter and wait (10-15 min)")
print()

print("✅ After deployment:")
print(f"   Frontend: http://{VPS_HOST}:3001")
print()
