# Automatic VPS Frontend Deployment Script
# PowerShell script for Windows users
# Run with: powershell -ExecutionPolicy Bypass -File auto-deploy.ps1

$ErrorActionPreference = "Continue"

$VPS_HOST = "141.94.79.108"
$VPS_USER = "ubuntu"
$VPS_PASS = "interns"
$FRONTEND_REPO = "https://github.com/Amank-drasken/HR-frontend.git"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   FRONTEND DEPLOYMENT AUTOMATION" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Deployment Commands
$deploymentCommands = @"
#!/bin/bash
set -e

echo "🚀 FRONTEND DEPLOYMENT STARTED"
cd /home/ubuntu
rm -rf frontend
echo "[1/6] Cloning repository..."
git clone $FRONTEND_REPO frontend
cd frontend

echo "[2/6] Installing dependencies..."
npm install

echo "[3/6] Building for production..."
npm run build

echo "[4/6] Setting up PM2..."
pm2 delete frontend 2>/dev/null || true

echo "[5/6] Starting application..."
pm2 start "npm start" --name "frontend" --cwd /home/ubuntu/frontend
pm2 save

echo "[6/6] Finalizing..."
pm2 startup 2>/dev/null || true

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "📊 STATUS:"
pm2 status
echo ""
echo "📋 RECENT LOGS (last 50 lines):"
pm2 logs frontend --lines 50
"@

# Create temporary script file
$tempScript = "$env:TEMP\vps-deploy-$([System.Guid]::NewGuid()).sh"
$deploymentCommands | Out-File -FilePath $tempScript -Encoding UTF8

Write-Host "📝 Created temporary deployment script: $tempScript" -ForegroundColor Yellow
Write-Host ""

# Try using OpenSSH if available
$sshPath = Get-Command ssh -ErrorAction SilentlyContinue
if ($sshPath) {
    Write-Host "🔌 Found SSH client" -ForegroundColor Green
    Write-Host "📡 Attempting automated deployment..." -ForegroundColor Yellow
    Write-Host ""
    
    # Read the script and execute commands directly
    $commands = $deploymentCommands -split "`n" | Where-Object { $_ -and -not $_.StartsWith("#") }
    
    Write-Host "Instructions:" -ForegroundColor Cyan
    Write-Host "1. Open a new PowerShell/CMD window" -ForegroundColor White
    Write-Host "2. Run: ssh ubuntu@$VPS_HOST" -ForegroundColor White
    Write-Host "3. Enter password: $VPS_PASS" -ForegroundColor White
    Write-Host "4. Copy and paste all commands from below:" -ForegroundColor White
    Write-Host ""
    Write-Host "=================================" -ForegroundColor Yellow
    Write-Host "COMMANDS TO PASTE IN SSH:" -ForegroundColor Yellow
    Write-Host "=================================" -ForegroundColor Yellow
    Write-Host ""
    
    $deploymentCommands | Write-Host
    
    Write-Host ""
    Write-Host "=================================" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "📋 Or copy commands from file: $tempScript" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⏱️  Expected time: 10-15 minutes" -ForegroundColor Cyan
    
} else {
    Write-Host "❌ SSH not found" -ForegroundColor Red
    Write-Host "Please install OpenSSH for Windows" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Paste above commands in SSH terminal to deploy" -ForegroundColor Green
Write-Host "✓ After complete, frontend will be at:" -ForegroundColor Green
Write-Host "  http://141.94.79.108:3001" -ForegroundColor Cyan
Write-Host ""
