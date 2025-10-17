# 🚀 PRODUCTION DEPLOYMENT GUIDE

**Project:** Multi-Tenant School Management System  
**Date:** October 16, 2025  
**Target:** Render + Supabase

---

## 📋 STEP-BY-STEP DEPLOYMENT

### STEP 1: Get Supabase Connection String

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select project: **school_system** (us-east-1)
3. Go to **Settings → Database**
4. Copy the connection string (PostgreSQL URI)
5. Format: `postgresql://postgres:[password]@db.oibwxhvvnhryoeaytdgh.supabase.co:5432/postgres`

**Note:** Replace `[password]` with your actual Supabase password

---

### STEP 2: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect GitHub repository: `https://github.com/Haizard/mult-tenant-school.git`
4. Fill in the following details:

**Service Configuration:**
- **Name:** `school-management-api`
- **Environment:** `Node`
- **Region:** `Oregon` (or closest to your users)
- **Branch:** `main`
- **Root Directory:** `backend`

**Build & Start Commands:**
```bash
# Build Command
npm install && npx prisma generate && npx prisma migrate deploy

# Start Command
npm start
```

**Plan:** `Starter` ($7/month) or higher based on traffic

---

### STEP 3: Configure Environment Variables

In Render dashboard, add the following environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql://postgres:[password]@db.oibwxhvvnhryoeaytdgh.supabase.co:5432/postgres` | Replace [password] |
| `NODE_ENV` | `production` | Production environment |
| `JWT_SECRET` | Generate a strong random key | Use: `openssl rand -base64 32` |
| `PORT` | `10000` | Render default port |
| `FRONTEND_URL` | Your frontend URL | e.g., `https://school-app.com` |
| `ALLOWED_ORIGINS` | Your frontend URL | e.g., `https://school-app.com` |

**Generate JWT_SECRET:**
```bash
# On your local machine
openssl rand -base64 32
# Output: example_key_here
```

---

### STEP 4: Deploy Service

1. Click **Create Web Service**
2. Render will automatically:
   - Clone the repository
   - Install dependencies
   - Generate Prisma client
   - Run database migrations
   - Start the application

**Deployment Time:** ~5-10 minutes

---

### STEP 5: Verify Deployment

Once deployment is complete:

1. **Get Service URL:**
   - Render will provide a URL like: `https://school-management-api.onrender.com`

2. **Test Health Endpoint:**
   ```bash
   curl https://school-management-api.onrender.com/health
   ```

3. **Expected Response:**
   ```json
   {
     "status": "ok",
     "timestamp": "2025-10-16T12:00:00Z"
   }
   ```

---

### STEP 6: Test Key Endpoints

**Test Parent Portal:**
```bash
curl -X GET https://school-management-api.onrender.com/api/parents/{id}/statistics \
  -H "Authorization: Bearer {jwt_token}"
```

**Test Activities:**
```bash
curl -X GET https://school-management-api.onrender.com/api/activities \
  -H "Authorization: Bearer {jwt_token}"
```

**Test Health Records:**
```bash
curl -X GET https://school-management-api.onrender.com/api/health/students/{id}/summary \
  -H "Authorization: Bearer {jwt_token}"
```

---

## 🔐 SECURITY CHECKLIST

- [ ] JWT_SECRET is strong and random
- [ ] DATABASE_URL uses SSL/TLS
- [ ] FRONTEND_URL is set correctly
- [ ] ALLOWED_ORIGINS restricts to your domain
- [ ] NODE_ENV is set to production
- [ ] No hardcoded secrets in code
- [ ] Database backups enabled
- [ ] Monitoring enabled

---

## 📊 DEPLOYMENT CONFIGURATION

### Render Service Details
```
Service Name: school-management-api
Runtime: Node.js
Region: Oregon
Plan: Starter ($7/month)
Repository: https://github.com/Haizard/mult-tenant-school.git
Branch: main
Root Directory: backend
```

### Build Configuration
```bash
Build Command:
npm install && npx prisma generate && npx prisma migrate deploy

Start Command:
npm start
```

### Database
```
Provider: PostgreSQL (Supabase)
Host: db.oibwxhvvnhryoeaytdgh.supabase.co
Port: 5432
Database: postgres
Region: us-east-1
```

---

## 🚨 TROUBLESHOOTING

### Build Fails
**Error:** `npm ERR! code ENOENT`
- **Solution:** Ensure `backend/package.json` exists
- **Check:** `git ls-files backend/package.json`

### Migration Fails
**Error:** `PrismaClientInitializationError`
- **Solution:** Verify DATABASE_URL is correct
- **Check:** Connection string format and password

### Service Won't Start
**Error:** `Cannot find module`
- **Solution:** Run `npm install` locally to verify
- **Check:** All dependencies in package.json

### CORS Errors
**Error:** `Access to XMLHttpRequest blocked by CORS`
- **Solution:** Update ALLOWED_ORIGINS in environment
- **Check:** Frontend URL matches exactly

---

## 📈 MONITORING & MAINTENANCE

### Enable Monitoring
1. Go to Render dashboard
2. Select your service
3. Enable **Metrics** and **Logs**
4. Set up alerts for:
   - High CPU usage
   - High memory usage
   - Failed deployments
   - Error rate > 1%

### Database Backups
1. Go to Supabase dashboard
2. Enable **Automated Backups**
3. Set backup frequency to daily
4. Test restore procedure

### Logs
- **Render Logs:** Dashboard → Logs tab
- **Database Logs:** Supabase → Logs
- **Application Logs:** Check Morgan middleware output

---

## 🔄 DEPLOYMENT UPDATES

To deploy updates:

1. Push changes to `main` branch
2. Render automatically redeploys
3. Deployment takes ~5-10 minutes
4. Check logs for any errors

**Disable Auto-Deploy:**
- Render dashboard → Settings → Auto-Deploy → Off

---

## 🆘 SUPPORT

### Common Issues

**Issue:** Service keeps restarting
- Check logs for errors
- Verify DATABASE_URL is correct
- Ensure migrations complete successfully

**Issue:** Endpoints return 404
- Verify routes are registered in server.js
- Check that all controllers are imported
- Ensure build command runs migrations

**Issue:** Database connection timeout
- Check DATABASE_URL format
- Verify Supabase is running
- Check firewall/network settings

---

## ✅ POST-DEPLOYMENT CHECKLIST

- [ ] Service deployed successfully
- [ ] Health endpoint working
- [ ] All 20 endpoints accessible
- [ ] Multi-tenant isolation verified
- [ ] RBAC working correctly
- [ ] Database migrations complete
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Documentation updated
- [ ] Team notified

---

## 📞 DEPLOYMENT SUMMARY

**Service URL:** `https://school-management-api.onrender.com`  
**Database:** Supabase PostgreSQL (school_system)  
**Status:** Ready for Production  
**Confidence:** ⭐⭐⭐⭐⭐

---

**Deployment Date:** October 16, 2025  
**Last Updated:** October 16, 2025

