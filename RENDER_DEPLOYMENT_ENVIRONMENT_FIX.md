# 🔧 RENDER DEPLOYMENT - ENVIRONMENT VARIABLES FIX

**Status:** ⏳ REQUIRES MANUAL ACTION ON RENDER DASHBOARD  
**Date:** October 16, 2025

---

## 🔴 CURRENT ERROR

```
error: Error validating datasource `db`: 
the URL must start with the protocol `postgresql://` or `postgres://`.
Error code: P1012
```

**Root Cause:** The `DATABASE_URL` environment variable in Render is not in the correct PostgreSQL format.

---

## ✅ SOLUTION

You need to update the `DATABASE_URL` environment variable in Render to use the correct PostgreSQL connection string format.

### Step 1: Get Your Supabase Connection String

1. Go to **Supabase Dashboard** → https://app.supabase.com
2. Select your project: **school_system**
3. Click **Settings** → **Database**
4. Copy the **Connection String** (PostgreSQL)
5. It should look like:
   ```
   postgresql://postgres:[PASSWORD]@db.oibwxhvvnhryoeaytdgh.supabase.co:5432/postgres
   ```

### Step 2: Update Render Environment Variables

1. Go to **Render Dashboard** → https://dashboard.render.com
2. Select your service: **school-management-api**
3. Click **Environment** tab
4. Find the `DATABASE_URL` variable
5. **Replace it** with your Supabase PostgreSQL connection string
6. Make sure it starts with `postgresql://` or `postgres://`

### Step 3: Verify Format

Your DATABASE_URL should look like:
```
postgresql://postgres:YOUR_PASSWORD@db.oibwxhvvnhryoeaytdgh.supabase.co:5432/postgres
```

**NOT:**
```
❌ file:./dev.db
❌ sqlite://...
❌ Just the host name
```

---

## 📋 REQUIRED ENVIRONMENT VARIABLES

| Variable | Value | Format |
|----------|-------|--------|
| **DATABASE_URL** | Supabase PostgreSQL connection string | `postgresql://user:password@host:5432/database` |
| **NODE_ENV** | production | `production` |
| **JWT_SECRET** | Random 32-character string | Base64 encoded |
| **PORT** | 10000 | `10000` |
| **FRONTEND_URL** | Your frontend domain | `https://yourdomain.com` |
| **ALLOWED_ORIGINS** | Your frontend domain | `https://yourdomain.com` |

---

## 🔍 HOW TO GET SUPABASE CONNECTION STRING

### From Supabase Dashboard:

1. **Login** to https://app.supabase.com
2. **Select Project:** school_system
3. **Go to:** Settings → Database
4. **Copy Connection String** (PostgreSQL tab)
5. **Format:** `postgresql://postgres:[PASSWORD]@db.oibwxhvvnhryoeaytdgh.supabase.co:5432/postgres`

### Connection String Components:

```
postgresql://postgres:PASSWORD@db.oibwxhvvnhryoeaytdgh.supabase.co:5432/postgres
│           │       │        │                                    │    │
│           │       │        │                                    │    └─ Database name
│           │       │        │                                    └────── Port
│           │       │        └─────────────────────────────────────────── Host
│           │       └──────────────────────────────────────────────────── Password
│           └────────────────────────────────────────────────────────────── Username
└──────────────────────────────────────────────────────────────────────── Protocol
```

---

## 🚀 STEP-BY-STEP RENDER CONFIGURATION

### 1. Open Render Dashboard
- Go to: https://dashboard.render.com
- Click on your service: **school-management-api**

### 2. Navigate to Environment
- Click the **Environment** tab
- You should see existing environment variables

### 3. Update DATABASE_URL
- Find the `DATABASE_URL` variable
- Click **Edit** (pencil icon)
- **Clear** the current value
- **Paste** your Supabase PostgreSQL connection string
- Click **Save**

### 4. Trigger Redeploy
- Click **Manual Deploy** button
- Or wait for auto-deploy if you've pushed new code
- Watch the build logs

### 5. Monitor Build
- Go to **Deploys** tab
- Watch the build progress
- Check logs for any errors

---

## ✅ VERIFICATION CHECKLIST

After updating the environment variable:

- [ ] DATABASE_URL starts with `postgresql://` or `postgres://`
- [ ] DATABASE_URL includes the password
- [ ] DATABASE_URL includes the host (db.oibwxhvvnhryoeaytdgh.supabase.co)
- [ ] DATABASE_URL includes the port (5432)
- [ ] DATABASE_URL includes the database name (postgres)
- [ ] All other environment variables are set
- [ ] Render service is redeployed
- [ ] Build completes successfully
- [ ] Deployment shows "Live" status

---

## 🔐 SECURITY NOTE

**Never commit DATABASE_URL to git!** It contains your password.

- ✅ Store in Render Environment Variables
- ✅ Store in .env file (local development only)
- ❌ Never commit to GitHub
- ❌ Never share in messages

---

## 📞 TROUBLESHOOTING

### If build still fails:

1. **Check the error message** in Render build logs
2. **Verify DATABASE_URL format** - must start with `postgresql://`
3. **Test connection locally** - run `npx prisma db push` locally
4. **Check Supabase status** - ensure database is running
5. **Verify credentials** - ensure password is correct

### If deployment succeeds but API doesn't work:

1. Check **Render logs** for runtime errors
2. Test health endpoint: `GET /api/health`
3. Check database connectivity
4. Verify all environment variables are set

---

## 🎯 NEXT STEPS

1. **Get Supabase Connection String** from Supabase Dashboard
2. **Update DATABASE_URL** in Render Environment Variables
3. **Trigger Redeploy** in Render Dashboard
4. **Monitor Build** - watch for success
5. **Test API** - verify endpoints are working
6. **Run Tests** - use POST_DEPLOYMENT_TESTING.md

---

## 📊 EXPECTED OUTCOME

After fixing the environment variable:

✅ Build completes successfully  
✅ Prisma migrations run  
✅ API starts and listens on port 10000  
✅ All endpoints are accessible  
✅ Database connection works  
✅ Multi-tenant isolation verified  

---

## 🎓 WHAT'S HAPPENING

1. **Render** pulls your code from GitHub
2. **Render** reads environment variables
3. **Render** runs: `npm install && npx prisma generate && npx prisma migrate deploy`
4. **Prisma** validates the DATABASE_URL format
5. **Prisma** connects to PostgreSQL database
6. **Prisma** runs migrations
7. **Node.js** starts your API server
8. **API** becomes available at your Render URL

---

**Created:** October 16, 2025  
**Status:** ⏳ AWAITING MANUAL ACTION  
**Action Required:** Update DATABASE_URL in Render Environment Variables

