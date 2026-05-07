# Automated VPS Frontend Deployment
# Run with: powershell -ExecutionPolicy Bypass -File setup-ssh-deploy.ps1

$VPS_HOST = "141.94.79.108"
$VPS_USER = "ubuntu"
$VPS_PASS = "6bnb7pcnNq2H"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Frontend Deployment Setup" -ForegroundColor Green  
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Create deployment commands
$commands = @"
cd /home/ubuntu
rm -rf frontend
git clone https://github.com/Amank-drasken/HR-frontend.git frontend
cd frontend
npm install
npm run build
pm2 delete frontend 2>/dev/null || true
pm2 start "npm start" --name "frontend" --cwd /home/ubuntu/frontend
pm2 save
pm2 startup 2>/dev/null || true
echo ""
echo "✅ DEPLOYMENT COMPLETE!"
pm2 status
pm2 logs frontend --lines 50
"@

Write-Host "Step 1: Copy all commands below" -ForegroundColor Yellow
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host $commands -ForegroundColor White
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 2: Open Terminal/PowerShell and run:" -ForegroundColor Yellow
Write-Host "  ssh ubuntu@$VPS_HOST" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 3: Enter password: $VPS_PASS" -ForegroundColor Yellow
Write-Host ""

Write-Host "Step 4: Paste all commands from above in SSH" -ForegroundColor Yellow
Write-Host ""

Write-Host "Step 5: Wait for deployment (10-15 minutes)" -ForegroundColor Yellow
Write-Host ""

Write-Host "Success: Frontend will be at http://$VPS_HOST:3001" -ForegroundColor Green
Write-Host ""
