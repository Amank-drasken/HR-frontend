#!/usr/bin/env python3
"""
VPS Frontend Deployment Script
Requires: Python 3.6+, paramiko library
Install: pip install paramiko
"""

import paramiko
import time
import sys

# VPS Credentials
VPS_HOST = "141.94.79.108"
VPS_USER = "ubuntu"
VPS_PASS = "6bnb7pcnNq2H"

# SSH Connection
print("=" * 50)
print("  🚀 Frontend Deployment")
print("=" * 50)
print()

try:
    print(f"📡 Connecting to {VPS_HOST}...")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=10)
    
    print(f"✅ Connected to {VPS_HOST}")
    print()
    
    # Deployment commands
    commands = [
        "cd /home/ubuntu",
        "rm -rf frontend",
        "git clone https://github.com/Amank-drasken/HR-frontend.git frontend",
        "cd frontend",
        "npm install",
        "npm run build",
        "pm2 delete frontend 2>/dev/null || true",
        'pm2 start "npm start" --name "frontend" --cwd /home/ubuntu/frontend',
        "pm2 save",
        "pm2 startup",
        "echo 'Deployment Complete!'",
        "pm2 status",
        "pm2 logs frontend --lines 50"
    ]
    
    # Execute commands
    print("📋 Executing deployment commands...")
    print()
    
    for i, cmd in enumerate(commands, 1):
        print(f"[{i}/{len(commands)}] Running: {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        
        # Wait for command to complete
        while not stdout.channel.exit_status_ready():
            time.sleep(0.1)
        
        output = stdout.read().decode()
        error = stderr.read().decode()
        
        if output:
            print(output[:500])  # Print first 500 chars
        if error:
            print(f"⚠️  {error[:200]}")
        print()
    
    print("=" * 50)
    print("✅ DEPLOYMENT COMPLETE!")
    print("=" * 50)
    print()
    print("🌐 Frontend URL: http://141.94.79.108:3001")
    print()
    
    ssh.close()

except ImportError:
    print("❌ paramiko not installed!")
    print("Install with: pip install paramiko")
    print()
    print("Or use manual SSH method from DEPLOYMENT_STEPS.md")
    sys.exit(1)
    
except Exception as e:
    print(f"❌ Error: {e}")
    print()
    print("Fallback: Use manual SSH method from DEPLOYMENT_STEPS.md")
    sys.exit(1)
