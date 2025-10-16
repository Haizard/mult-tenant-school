# 🚀 DEPLOYMENT INSTRUCTIONS

**System:** Multi-Tenant School Management System  
**Date:** October 16, 2025  
**Version:** 1.0 (Post-Critical Fixes)

---

## 📋 PRE-DEPLOYMENT CHECKLIST

- [ ] All code reviewed and approved
- [ ] Database migration tested locally
- [ ] All endpoints tested with Postman/cURL
- [ ] Multi-tenant isolation verified
- [ ] Authorization checks verified
- [ ] Error handling tested
- [ ] Performance benchmarks acceptable
- [ ] Security audit passed
- [ ] Backup of current database created

---

## 🔧 DEPLOYMENT STEPS

### Step 1: Prepare Environment

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if needed)
npm install

# Verify Node version (should be 16+)
node --version

# Verify npm version (should be 8+)
npm --version
```

### Step 2: Database Migration

#### For Development Environment
```bash
# Create and run migration
npx prisma migrate dev --name add_activities_and_health_records

# This will:
# 1. Create migration file
# 2. Apply to development database
# 3. Generate Prisma client
```

#### For Staging/Production Environment
```bash
# First, backup current database
# (Database-specific backup command)

# Apply migration
npx prisma migrate deploy

# Verify migration
npx prisma db push --skip-generate

# Check schema
npx prisma db execute --stdin < schema.sql
```

### Step 3: Verify Database Changes

```bash
# Connect to database and verify new tables
npx prisma studio

# Or use database client to verify:
# - activities table created
# - student_activities table created
# - ActivityStatus enum created
# - ActivityEnrollmentStatus enum created
```

### Step 4: Build Backend

```bash
# Build TypeScript (if applicable)
npm run build

# Or for Node.js
npm run tsc

# Verify build
ls -la dist/
```

### Step 5: Start Server

#### Development
```bash
npm run dev
# Server should start on http://localhost:5000
```

#### Production
```bash
# Set environment variables
export NODE_ENV=production
export DATABASE_URL="postgresql://..."
export JWT_SECRET="your-secret-key"

# Start server
npm start

# Or use PM2
pm2 start backend/src/server.js --name "school-api"
pm2 save
```

### Step 6: Verify Deployment

```bash
# Check health endpoint
curl http://localhost:5000/health

# Expected response:
# {
#   "status": "healthy",
#   "uptime": 123.45,
#   "timestamp": "2025-10-16T10:00:00Z"
# }

# Test parent portal endpoint
curl -X GET http://localhost:5000/api/parents/{parentId}/statistics \
  -H "Authorization: Bearer {token}"

# Test activities endpoint
curl -X GET http://localhost:5000/api/activities \
  -H "Authorization: Bearer {token}"

# Test health endpoint
curl -X GET http://localhost:5000/api/health/students/{studentId}/summary \
  -H "Authorization: Bearer {token}"
```

---

## 🔄 ROLLBACK PROCEDURE

If issues occur after deployment:

### Step 1: Stop Server
```bash
# If using PM2
pm2 stop school-api

# Or manually kill process
kill -9 $(lsof -t -i:5000)
```

### Step 2: Rollback Database
```bash
# Restore from backup
# (Database-specific restore command)

# Or rollback migration
npx prisma migrate resolve --rolled-back add_activities_and_health_records
```

### Step 3: Restart Previous Version
```bash
# Checkout previous commit
git checkout HEAD~1

# Reinstall dependencies
npm install

# Start server
npm start
```

### Step 4: Investigate Issue
```bash
# Check logs
tail -f logs/error.log

# Check database
npx prisma studio

# Verify schema
npx prisma db push --skip-generate
```

---

## 📊 POST-DEPLOYMENT VERIFICATION

### 1. Database Verification
```bash
# Check table creation
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('activities', 'student_activities');

# Check indexes
SELECT * FROM pg_indexes 
WHERE tablename IN ('activities', 'student_activities');

# Check constraints
SELECT * FROM information_schema.table_constraints 
WHERE table_name IN ('activities', 'student_activities');
```

### 2. API Verification
```bash
# Test all new endpoints
./test-endpoints.sh

# Or manually test each:
# Parent Portal (6 endpoints)
# Activities (8 endpoints)
# Health Records (6 endpoints)
```

### 3. Performance Verification
```bash
# Check response times
ab -n 100 -c 10 http://localhost:5000/api/activities

# Check database query performance
EXPLAIN ANALYZE SELECT * FROM activities WHERE tenant_id = '...';

# Monitor server resources
top
free -h
df -h
```

### 4. Security Verification
```bash
# Test authorization
curl -X GET http://localhost:5000/api/activities \
  -H "Authorization: Bearer invalid-token"
# Should return 401

# Test multi-tenant isolation
# Verify data from tenant A is not visible to tenant B

# Test RBAC
# Verify unauthorized roles get 403
```

---

## 🐛 TROUBLESHOOTING

### Issue: Migration fails with "table already exists"
```bash
# Solution: Check if tables already exist
npx prisma db push --skip-generate

# If tables exist, mark migration as applied
npx prisma migrate resolve --applied add_activities_and_health_records
```

### Issue: "Cannot find module" errors
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

### Issue: Database connection fails
```bash
# Solution: Verify connection string
echo $DATABASE_URL

# Test connection
npx prisma db execute --stdin < /dev/null

# Check database logs
tail -f /var/log/postgresql/postgresql.log
```

### Issue: Endpoints return 404
```bash
# Solution: Verify routes are registered
curl http://localhost:5000/api/activities

# Check server logs
tail -f logs/app.log

# Verify route files exist
ls -la backend/src/routes/activityRoutes.js
ls -la backend/src/routes/healthRoutes.js
```

### Issue: Authorization errors on all endpoints
```bash
# Solution: Verify JWT secret
echo $JWT_SECRET

# Check token validity
# Decode token and verify expiration

# Verify middleware chain
grep -n "authorize" backend/src/routes/activityRoutes.js
```

---

## 📈 MONITORING

### Set Up Monitoring
```bash
# Install monitoring tools
npm install pm2-monitoring

# Start monitoring
pm2 monitor

# Or use external service
# - New Relic
# - DataDog
# - Sentry
```

### Key Metrics to Monitor
- Response time (target: <200ms)
- Error rate (target: <0.1%)
- Database query time (target: <100ms)
- CPU usage (target: <70%)
- Memory usage (target: <80%)
- Active connections (target: <100)

---

## 🔐 SECURITY CHECKLIST

- [ ] JWT secret is strong and unique
- [ ] Database credentials are secure
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is active
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Audit logging enabled
- [ ] Error messages don't leak sensitive info

---

## 📞 SUPPORT

### If Issues Occur
1. Check logs: `tail -f logs/error.log`
2. Verify database: `npx prisma studio`
3. Test endpoints: `curl http://localhost:5000/health`
4. Check server status: `pm2 status`
5. Review recent changes: `git log --oneline -10`

### Contact
- Backend Team: backend@school.local
- DevOps Team: devops@school.local
- Database Team: database@school.local

---

## ✅ DEPLOYMENT COMPLETE

After all steps are verified:

1. ✅ Database migrated
2. ✅ Server running
3. ✅ All endpoints accessible
4. ✅ Authorization working
5. ✅ Multi-tenant isolation verified
6. ✅ Performance acceptable
7. ✅ Monitoring active

**System is now live with all critical fixes deployed!**

---

**Deployment Date:** October 16, 2025  
**Status:** Ready for Production  
**Next Review:** October 23, 2025

