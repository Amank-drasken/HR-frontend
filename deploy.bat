@echo off
@REM Frontend Deployment - RUN THIS FILE
@REM 1. Save this file as: deploy.bat
@REM 2. Double-click to run OR
@REM 3. Run in Command Prompt: deploy.bat

@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

cls
echo =====================================================
echo   FRONTEND DEPLOYMENT - FINAL SETUP
echo =====================================================
echo.

set "VPS_HOST=141.94.79.108"
set "VPS_USER=ubuntu"
set "VPS_PASS=6bnb7pcnNq2H"

echo 📋 DEPLOYMENT COMMANDS READY
echo.
echo Copy the commands below:
echo.
echo =====================================================

(
    echo cd /home/ubuntu
    echo rm -rf frontend
    echo git clone https://github.com/Amank-drasken/HR-frontend.git frontend
    echo cd frontend
    echo npm install
    echo npm run build
    echo pm2 delete frontend 2^>/dev/null ^|^| true
    echo pm2 start "npm start" --name "frontend" --cwd /home/ubuntu/frontend
    echo pm2 save
    echo pm2 startup 2^>/dev/null ^|^| true
    echo echo.
    echo echo DEPLOYMENT COMPLETE!
    echo pm2 status
    echo pm2 logs frontend --lines 50
)

echo.
echo =====================================================
echo.
echo NEXT STEPS:
echo.
echo 1. Open Command Prompt (Win+R, type cmd)
echo.
echo 2. Run: ssh ubuntu@%VPS_HOST%
echo.
echo 3. Password: %VPS_PASS%
echo.
echo 4. Copy above commands and paste in SSH
echo.
echo 5. Press Enter and wait (10-15 minutes)
echo.
echo =====================================================
echo.
echo After deployment, open in browser:
echo http://%VPS_HOST%:3001
echo.
pause
