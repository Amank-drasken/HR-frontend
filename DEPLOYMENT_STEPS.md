# 🚀 FRONTEND DEPLOYMENT - STEP BY STEP GUIDE

## Step 1️⃣ - Open Terminal/Command Prompt

Windows पर:
- Win+R दबाओ
- `cmd` type करो
- Enter दबाओ

Or PowerShell खोलो

---

## Step 2️⃣ - SSH में Login करो

```bash
ssh ubuntu@141.94.79.108
```

**Output होगा:**
```
The authenticity of host '141.94.79.108' can't be established.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

**Type करो:** `yes` फिर Enter

**फिर Password माँगेगा:**
```
ubuntu@141.94.79.108's password:
```

**Paste करो:** `6bnb7pcnNq2H` फिर Enter

(Note: Password जब type करोगे तो दिखेगा नहीं, बस paste करो और Enter दबा दो)

---

## Step 3️⃣ - Deploy Commands (Copy-Paste करो)

अब तुम VPS में logged in हो। यह **पूरा command paste करो एक साथ**:

```bash
cd /home/ubuntu && rm -rf frontend && git clone https://github.com/Amank-drasken/HR-frontend.git frontend && cd frontend && npm install && npm run build && pm2 delete frontend 2>/dev/null || true && pm2 start "npm start" --name "frontend" --cwd /home/ubuntu/frontend && pm2 save && pm2 startup && echo "" && echo "===== DEPLOYMENT COMPLETE =====" && pm2 status && echo "" && echo "===== LOGS =====" && pm2 logs frontend --lines 50
```

**यह command**:
- Old frontend delete करेगा
- Repository clone करेगा
- Dependencies install करेगा
- Production build बनाएगा
- PM2 से start करेगा
- Status show करेगा
- Logs display करेगा

---

## Step 4️⃣ - Verify Deployment ✅

Command पूरा हो जाने के बाद:

1. **Browser खोलो** और जाओ:
   ```
   http://141.94.79.108:3001
   ```

2. **Frontend लोड होगा** ✓

3. **Logs में कोई error नहीं होना चाहिए** ✓

---

## 🆘 Troubleshooting

**अगर कोई error आए:**

```bash
# Logs देखो
pm2 logs frontend --lines 100

# Status check करो
pm2 status

# Restart करो
pm2 restart frontend
```

---

## 📋 Quick Commands (बाद में use करने के लिए)

```bash
# Check status
pm2 status

# View logs
pm2 logs frontend

# Restart
pm2 restart frontend

# Stop
pm2 stop frontend

# Delete
pm2 delete frontend

# Check port
netstat -tulpn | grep 3001
```

---

## ✅ Success Indicators

- [ ] SSH connection successful
- [ ] Build completes without errors
- [ ] PM2 status shows "online"
- [ ] http://141.94.79.108:3001 loads
- [ ] No red errors in pm2 logs

---

**अब यह steps follow कर और bata dena complete हो गया!** 🚀
