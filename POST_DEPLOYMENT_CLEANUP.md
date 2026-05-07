# 🗑️ POST-DEPLOYMENT CLEANUP CHECKLIST

## Files to DELETE from Repository (सब git से remove करना)

### Deployment Guide Files
- [ ] DEPLOYMENT_GUIDE.md
- [ ] FRONTEND_DEPLOYMENT_CHECKLIST.md
- [ ] QUICK_START.md
- [ ] DEPLOYMENT_STEPS.md
- [ ] READY_TO_DEPLOY.txt

### Deployment Scripts
- [ ] deploy.bat
- [ ] deploy.sh
- [ ] deploy.py
- [ ] setup.sh
- [ ] deploy-frontend.sh
- [ ] vps-deploy.sh
- [ ] auto-deploy.ps1
- [ ] deploy.ps1
- [ ] setup-ssh-deploy.ps1
- [ ] vps_deploy_commands.sh

### Configuration Files (Keep on VPS, Delete from Repo)
- [ ] ecosystem.config.js
- [ ] nginx.conf

### Documentation (Delete)
- [ ] AUTO_LOGIN_GUIDE.md (पहले से delete)

---

## Files to KEEP in Repository (जरूरी हैं)

✓ .env.local (VPS config के साथ)
✓ .env.example (template के लिए)
✓ .env.production (production config)
✓ package.json
✓ next.config.ts
✓ tsconfig.json
✓ All source code (src/)
✓ public/
✓ docs/
✓ README.md

---

## Code Cleanup (Unused Code Remove करना)

### Files जहाँ Commented Code है:
- [ ] src/lib/store.ts - Check for unused imports/code
- [ ] src/lib/api.ts - Check for unused functions
- [ ] src/lib/auth.ts - Check for test code
- [ ] src/app/page.tsx - Remove test components
- [ ] src/components/ - Remove unused components

### Check करना:
```bash
# Unused imports
eslint --fix src/

# Unused variables
npm run lint
```

---

## Environment Variables Cleanup

### .env.local को verify करना:
```
# Current (VPS deployed):
NEXT_PUBLIC_API_URL=http://141.94.79.108:5000/api
NEXT_PUBLIC_MOCK_AUTH=false
NODE_ENV=production

# Ye सही है ✓
```

### .env.example update करना:
```
NEXT_PUBLIC_API_URL=https://your-backend-url/api
NEXT_PUBLIC_MOCK_AUTH=false
NODE_ENV=production
```

---

## Git Cleanup Commands

### सब deployment files delete करने के लिए:

```bash
# Stage deletion
git rm DEPLOYMENT_GUIDE.md
git rm FRONTEND_DEPLOYMENT_CHECKLIST.md
git rm QUICK_START.md
git rm DEPLOYMENT_STEPS.md
git rm READY_TO_DEPLOY.txt
git rm deploy.bat
git rm deploy.sh
git rm deploy.py
git rm setup.sh
git rm deploy-frontend.sh
git rm vps-deploy.sh
git rm auto-deploy.ps1
git rm deploy.ps1
git rm setup-ssh-deploy.ps1
git rm ecosystem.config.js
git rm nginx.conf

# Or अगर सब एक साथ करना है:
git rm DEPLOYMENT*.md QUICK_START.md READY_TO_DEPLOY.txt deploy* setup*.ps1 ecosystem.config.js nginx.conf 2>/dev/null || true

# Commit करो
git add -A
git commit -m "Cleanup: Remove deployment files after production deployment"

# Push करो
git push personal main
```

---

## Code Cleanup Commands

```bash
# Unused imports/variables fix करो
npm run lint -- --fix

# Production build test करो
npm run build

# Check करो कोई error नहीं है
npm run lint
```

---

## Final Checklist Before Cleanup

- [ ] Frontend successfully deployed on 141.94.79.108:3001
- [ ] Backend deployed on 141.94.79.108:5000
- [ ] Both apps running with PM2
- [ ] Nginx reverse proxy working
- [ ] Browser test done
- [ ] No errors in production logs

---

## After Cleanup

```bash
# Repository should only have:
ls -la

# ✓ src/                    - Source code
# ✓ public/                 - Static files
# ✓ docs/                   - Documentation
# ✓ .env.local              - VPS config
# ✓ .env.example            - Template
# ✓ package.json            - Dependencies
# ✓ next.config.ts          - Next.js config
# ✓ tsconfig.json           - TypeScript config
# ✓ README.md               - Project docs
# ✗ DEPLOYMENT_*.md         - DELETED
# ✗ deploy*                 - DELETED
# ✗ ecosystem.config.js     - DELETED
# ✗ nginx.conf              - DELETED
```

---

## Important Notes

1. **VPS पर backup रख दो:**
   - ecosystem.config.js को /home/ubuntu/में रख दो
   - nginx.conf को /etc/nginx/sites-available/ में है

2. **Local में भी backup:**
   - Desktop/imp/ folder में सब deployment files हैं

3. **Future Updates के लिए:**
   - Deploy guide Desktop/imp/ में है
   - READY_TO_DEPLOY.txt use कर सकते हो

4. **Production Code Clean रखना:**
   - Deployment files production में नहीं होने चाहिए
   - केवल source code होना चाहिए

---

## Quick Cleanup Script (सब एक command में)

```bash
# सब deployment files delete करो
cd /path/to/HR-frontend

# Files list करो (delete से पहले verify)
git ls-files | grep -E "DEPLOYMENT|QUICK_START|READY_TO_DEPLOY|deploy|ecosystem|nginx" | head -20

# सब delete करो
git rm $(git ls-files | grep -E "DEPLOYMENT|QUICK_START|READY_TO_DEPLOY|deploy|setup.*\.ps1|ecosystem|nginx")

# Commit करो
git commit -m "Cleanup: Remove deployment configuration files"

# Push करो
git push personal main
```

---

**Ready for cleanup after deployment!** ✨
