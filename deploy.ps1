# PowerShell Deployment Script
# Save as: deploy.ps1
# Run as: powershell -ExecutionPolicy Bypass -File deploy.ps1

$VPS_HOST = "141.94.79.108"
$VPS_USER = "ubuntu"
$VPS_PASS = "6bnb7pcnNq2H"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Frontend Deployment to VPS" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Commands to execute on VPS
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
pm2 startup
echo "=== DEPLOYMENT COMPLETE ==="
pm2 status
echo ""
echo "=== RECENT LOGS ==="
pm2 logs frontend --lines 50
"@

Write-Host "📋 Commands to execute on VPS:" -ForegroundColor Yellow
Write-Host $commands
Write-Host ""

Write-Host "📝 Instructions:" -ForegroundColor Cyan
Write-Host "1. Open PowerShell or Command Prompt"
Write-Host "2. Run: ssh ubuntu@$VPS_HOST"
Write-Host "3. Enter password: $VPS_PASS"
Write-Host "4. Copy and paste above commands one by one (or all together)"
Write-Host ""

# Try to save commands to file
$commandsPath = "$PSScriptRoot\vps-commands.txt"
$commands | Out-File -FilePath $commandsPath -Encoding UTF8

Write-Host "✓ Commands saved to: $commandsPath" -ForegroundColor Green
Write-Host "✓ You can copy all commands from that file" -ForegroundColor Green
