# 🚀 PRODUCTION DEPLOYMENT PLAN

**Project:** Multi-Tenant School Management System  
**Date:** October 16, 2025  
**Target:** Render + Supabase

---

## 📋 DEPLOYMENT CHECKLIST

### Phase 1: Database Setup ✅
- [x] Identify active Supabase project: `school_system` (us-east-1)
- [x] Database: PostgreSQL 17.6.1
- [x] Host: db.oibwxhvvnhryoeaytdgh.supabase.co
- [ ] Get connection string from Supabase
- [ ] Create DATABASE_URL environment variable

### Phase 2: Render Web Service Setup
- [ ] Create web service on Render
- [ ] Repository: https://github.com/Haizard/mult-tenant-school.git
- [ ] Branch: main
- [ ] Root directory: backend
- [ ] Runtime: Node
- [ ] Build command: npm install && npx prisma generate && npx prisma migrate deploy
- [ ] Start command: npm start
- [ ] Plan: Starter (or higher)

### Phase 3: Environment Variables
- [ ] DATABASE_URL (Supabase PostgreSQL)
- [ ] NODE_ENV=production
- [ ] PORT=10000 (Render default)
- [ ] JWT_SECRET (generate secure key)
- [ ] FRONTEND_URL (frontend deployment URL)
- [ ] ALLOWED_ORIGINS (frontend URL)

### Phase 4: Database Migration
- [ ] Run Prisma migrations on production
- [ ] Verify all tables created
- [ ] Verify Activity and StudentActivity models
- [ ] Verify HealthRecord model

### Phase 5: Testing
- [ ] Health check endpoint
- [ ] Parent portal endpoints
- [ ] Activities endpoints
- [ ] Health records endpoints
- [ ] Multi-tenant isolation
- [ ] RBAC enforcement

### Phase 6: Documentation
- [ ] Deployment URL
- [ ] Environment variables
- [ ] Monitoring setup
- [ ] Rollback procedure

---

## 🔧 TECHNICAL DETAILS

### Supabase Project
- **Name:** school_system
- **Region:** us-east-1
- **Status:** ACTIVE_HEALTHY
- **Database:** PostgreSQL 17.6.1
- **Host:** db.oibwxhvvnhryoeaytdgh.supabase.co

### Render Configuration
- **Service Type:** Web Service
- **Runtime:** Node.js
- **Repository:** https://github.com/Haizard/mult-tenant-school.git
- **Branch:** main
- **Root Directory:** backend

### Build & Start Commands
```bash
# Build
npm install && npx prisma generate && npx prisma migrate deploy

# Start
npm start
```

### Environment Variables Required
```
DATABASE_URL=postgresql://[user]:[password]@db.oibwxhvvnhryoeaytdgh.supabase.co:5432/postgres
NODE_ENV=production
PORT=10000
JWT_SECRET=[generate-secure-key]
FRONTEND_URL=[frontend-url]
ALLOWED_ORIGINS=[frontend-url]
```

---

## 📊 DEPLOYMENT TIMELINE

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Database Setup | 5 min | ⏳ |
| 2 | Render Service | 10 min | ⏳ |
| 3 | Environment Vars | 5 min | ⏳ |
| 4 | Migration | 5 min | ⏳ |
| 5 | Testing | 15 min | ⏳ |
| 6 | Documentation | 10 min | ⏳ |

**Total Time:** ~50 minutes

---

## ✅ SUCCESS CRITERIA

- [x] Supabase project identified
- [ ] Render web service created
- [ ] Environment variables configured
- [ ] Database migrations successful
- [ ] All endpoints accessible
- [ ] Health check passing
- [ ] Multi-tenant isolation verified
- [ ] RBAC working correctly

---

## 🔐 SECURITY CONSIDERATIONS

1. **Database Connection**
   - Use SSL/TLS for database connection
   - Secure password in environment variables
   - No hardcoded credentials

2. **Environment Variables**
   - JWT_SECRET: Generate strong random key
   - NODE_ENV: Set to production
   - ALLOWED_ORIGINS: Restrict to frontend domain

3. **CORS Configuration**
   - Whitelist frontend domain
   - Reject unauthorized origins
   - Use HTTPS only in production

4. **Database Security**
   - Enable Row Level Security (RLS)
   - Implement proper authorization checks
   - Audit logging enabled

---

## 📞 NEXT STEPS

1. Get Supabase connection string
2. Create Render web service
3. Configure environment variables
4. Run database migrations
5. Test all endpoints
6. Monitor deployment

---

**Status:** Ready for Deployment  
**Confidence:** ⭐⭐⭐⭐⭐

