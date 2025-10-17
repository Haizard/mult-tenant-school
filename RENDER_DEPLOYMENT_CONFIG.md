# 🔧 RENDER DEPLOYMENT CONFIGURATION

**Project:** Multi-Tenant School Management System  
**Platform:** Render  
**Date:** October 16, 2025

---

## 📋 RENDER WEB SERVICE SETUP

### Service Details
```
Name:              school-management-api
Runtime:           Node.js
Region:            Oregon (or your preferred region)
Plan:              Starter ($7/month)
Auto-Deploy:       Yes (from main branch)
```

### Repository Configuration
```
Repository:        https://github.com/Haizard/mult-tenant-school.git
Branch:            main
Root Directory:    backend
```

### Build & Start Commands

**Build Command:**
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

**Start Command:**
```bash
npm start
```

---

## 🔐 ENVIRONMENT VARIABLES

### Required Variables

#### 1. DATABASE_URL (CRITICAL)
```
Key:   DATABASE_URL
Value: postgresql://postgres:[PASSWORD]@db.oibwxhvvnhryoeaytdgh.supabase.co:5432/postgres
```

**How to get:**
1. Go to Supabase Dashboard
2. Select "school_system" project
3. Settings → Database → Connection String
4. Copy PostgreSQL URI
5. Replace `[PASSWORD]` with your Supabase password

#### 2. NODE_ENV
```
Key:   NODE_ENV
Value: production
```

#### 3. JWT_SECRET (CRITICAL)
```
Key:   JWT_SECRET
Value: [Generate using: openssl rand -base64 32]
```

**Generate on your machine:**
```bash
openssl rand -base64 32
# Example output: 
# aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890+/=
```

#### 4. PORT
```
Key:   PORT
Value: 10000
```

**Note:** Render assigns port 10000 by default

#### 5. FRONTEND_URL
```
Key:   FRONTEND_URL
Value: https://your-frontend-domain.com
```

**Examples:**
- `https://school-app.com`
- `https://app.yourdomain.com`
- `https://school-management.vercel.app`

#### 6. ALLOWED_ORIGINS
```
Key:   ALLOWED_ORIGINS
Value: https://your-frontend-domain.com
```

**For multiple origins (comma-separated):**
```
https://school-app.com,https://admin.school-app.com
```

---

## 📝 ENVIRONMENT VARIABLES TABLE

| Key | Value | Required | Notes |
|-----|-------|----------|-------|
| DATABASE_URL | PostgreSQL connection string | ✅ Yes | From Supabase |
| NODE_ENV | production | ✅ Yes | Production mode |
| JWT_SECRET | Random 32-char string | ✅ Yes | Generate new |
| PORT | 10000 | ✅ Yes | Render default |
| FRONTEND_URL | Frontend domain | ✅ Yes | HTTPS only |
| ALLOWED_ORIGINS | Frontend domain | ✅ Yes | CORS whitelist |

---

## 🔑 GENERATING SECURE KEYS

### JWT_SECRET Generation

**Option 1: Using OpenSSL (Linux/Mac)**
```bash
openssl rand -base64 32
```

**Option 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3: Using Python**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Option 4: Online Generator**
- Visit: https://www.random.org/strings/
- Generate 32 characters
- Use alphanumeric + special characters

---

## 🗄️ SUPABASE CONNECTION DETAILS

### Project Information
```
Project Name:  school_system
Region:        us-east-1
Status:        ACTIVE_HEALTHY
Database:      PostgreSQL 17.6.1
Host:          db.oibwxhvvnhryoeaytdgh.supabase.co
Port:          5432
Database:      postgres
```

### Connection String Format
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

### Example
```
postgresql://postgres:your_password@db.oibwxhvvnhryoeaytdgh.supabase.co:5432/postgres
```

---

## 🚀 STEP-BY-STEP SETUP IN RENDER

### 1. Create Web Service
1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect GitHub account
4. Select repository: `mult-tenant-school`

### 2. Configure Service
1. **Name:** `school-management-api`
2. **Environment:** `Node`
3. **Region:** `Oregon` (or your choice)
4. **Branch:** `main`
5. **Root Directory:** `backend`

### 3. Build & Start Commands
1. **Build Command:**
   ```
   npm install && npx prisma generate && npx prisma migrate deploy
   ```

2. **Start Command:**
   ```
   npm start
   ```

### 4. Add Environment Variables
1. Click **Advanced** (or **Environment**)
2. Add each variable from the table above
3. Click **Create Web Service**

### 5. Monitor Deployment
1. Watch the build logs
2. Verify migrations complete
3. Check for any errors
4. Service should be live in 5-10 minutes

---

## ✅ VERIFICATION CHECKLIST

After deployment, verify:

- [ ] Service is running (green status)
- [ ] Build logs show no errors
- [ ] Migrations completed successfully
- [ ] Health endpoint responds: `GET /health`
- [ ] Parent portal endpoints work
- [ ] Activities endpoints work
- [ ] Health records endpoints work
- [ ] CORS is configured correctly
- [ ] Database connection is stable
- [ ] Logs show normal operation

---

## 🔍 TESTING ENDPOINTS

### Health Check
```bash
curl https://school-management-api.onrender.com/health
```

### Parent Portal
```bash
curl -X GET https://school-management-api.onrender.com/api/parents/{id}/statistics \
  -H "Authorization: Bearer {token}"
```

### Activities
```bash
curl -X GET https://school-management-api.onrender.com/api/activities \
  -H "Authorization: Bearer {token}"
```

### Health Records
```bash
curl -X GET https://school-management-api.onrender.com/api/health/students/{id}/summary \
  -H "Authorization: Bearer {token}"
```

---

## 🆘 TROUBLESHOOTING

### Build Fails
**Check:**
- Backend directory exists
- package.json is in backend/
- All dependencies are listed
- No syntax errors in code

### Migration Fails
**Check:**
- DATABASE_URL is correct
- Supabase is running
- Connection string format is valid
- Password is correct

### Service Won't Start
**Check:**
- Start command is correct
- PORT environment variable is set
- No port conflicts
- Check logs for errors

### CORS Errors
**Check:**
- FRONTEND_URL is set
- ALLOWED_ORIGINS matches frontend
- Frontend is using HTTPS
- No trailing slashes

---

## 📊 MONITORING

### Enable Monitoring in Render
1. Dashboard → Your Service
2. **Metrics** tab
3. Monitor:
   - CPU usage
   - Memory usage
   - Request count
   - Error rate

### Set Up Alerts
1. **Settings** → **Notifications**
2. Alert on:
   - Failed deployments
   - High CPU (>80%)
   - High memory (>80%)
   - Error rate > 1%

---

## 🔄 UPDATING DEPLOYMENT

### Deploy New Changes
1. Push to `main` branch
2. Render auto-deploys
3. Deployment takes ~5-10 minutes
4. Check logs for errors

### Disable Auto-Deploy
1. Service Settings
2. **Auto-Deploy** → Off
3. Deploy manually when ready

---

## 📞 SUPPORT RESOURCES

- **Render Docs:** https://render.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Supabase Docs:** https://supabase.com/docs
- **Express Docs:** https://expressjs.com

---

**Configuration Date:** October 16, 2025  
**Status:** Ready for Deployment  
**Confidence:** ⭐⭐⭐⭐⭐

