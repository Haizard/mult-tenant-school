# API Troubleshooting Guide

## 🚨 Issues Identified & Fixed

This guide documents the API issues found in your multi-tenant school system and provides solutions.

### ❌ Problem 1: Examination Routes (404 Errors)
**Error:** `GET http://localhost:5000/api/examinations? 404 (Not Found)`

**Root Cause:** Double-nested routes in examination routes file
- Backend routes defined as `/examinations` within `/api/examinations` mount
- Resulted in `/api/examinations/examinations` instead of `/api/examinations`

**✅ Fix Applied:**
```javascript
// Before (examinationRoutes.js)
router.get('/examinations', ...)

// After (examinationRoutes.js) 
router.get('/', ...)
```

### ❌ Problem 2: API Base URL Configuration  
**Error:** Frontend calling Next.js API routes instead of backend server

**Root Cause:** API base URL pointing to `/api` instead of `http://localhost:5000/api`

**✅ Fix Applied:**
```typescript
// Before (api.ts)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// After (api.ts)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
```

### ⚠️ Problem 3: Academic Subjects (500 Errors)
**Error:** `GET http://localhost:5000/api/academic/subjects 500 (Internal Server Error)`

**Potential Causes:**
- Database connection issues
- Authentication/authorization problems
- Missing tenant context
- Schema/migration issues

---

## 🧪 Testing Your Fixes

### 1. Start Your Backend Server
```bash
cd backend
npm start
# or
node src/server.js
```

### 2. Test Database Connection
```bash
cd backend
node test-database-connection.js
```

### 3. Test API Endpoints
```bash
cd backend  
node test-api-endpoints.js
```

### 4. Manual Testing with Browser
Open: `http://localhost:5000/health`
Should return: `{"status": "healthy", ...}`

### 5. Test Frontend Integration
1. Start your Next.js frontend: `npm run dev`
2. Navigate to examinations page
3. Check browser console for errors

---

## 🔍 Systematic Troubleshooting Process

### Step 1: Verify Backend Server Status
```bash
# Check if server is running
netstat -an | findstr :5000
# or on Linux/Mac
lsof -i :5000
```

### Step 2: Test Basic Connectivity
```bash
curl http://localhost:5000/health
```

### Step 3: Check Environment Variables
Create `.env` file in backend directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-here"
NODE_ENV="development"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

### Step 4: Database Health Check
```bash
cd backend
npx prisma db push
npx prisma generate
```

### Step 5: Authentication Testing
1. Login via frontend to get valid JWT token
2. Test API endpoints with token in headers:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/academic/subjects
```

---

## 🛠️ Common API Issues & Solutions

### Issue: CORS Errors
**Symptoms:** Browser blocks requests, CORS policy errors
**Solution:**
```javascript
// In server.js
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
```

### Issue: Authentication Failures
**Symptoms:** 401 Unauthorized errors
**Solutions:**
1. Check JWT secret is set: `process.env.JWT_SECRET`
2. Verify token format: `Bearer YOUR_TOKEN`
3. Check token expiration
4. Validate user exists in database

### Issue: Database Connection Problems
**Symptoms:** 500 errors, Prisma connection failures
**Solutions:**
1. Verify DATABASE_URL in .env
2. Run: `npx prisma generate`
3. Check database file permissions (SQLite)
4. Test connection: `npx prisma db push`

### Issue: Route Not Found (404)
**Symptoms:** 404 errors for valid endpoints
**Solutions:**
1. Check route mounting in `server.js`
2. Verify route definitions in route files
3. Check for typos in endpoint paths
4. Ensure middleware order is correct

### Issue: Permission Denied (403)
**Symptoms:** 403 Forbidden errors
**Solutions:**
1. Check user has required permissions
2. Verify tenant isolation logic
3. Check role assignments
4. Validate permission strings match

---

## 📊 Debugging Tools & Techniques

### 1. Enable Debug Logging
```javascript
// Add to server.js
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
  });
}
```

### 2. Prisma Debug Mode
```bash
# Enable query logging
DEBUG="prisma:query" npm start
```

### 3. Network Inspection
- Use browser DevTools Network tab
- Check request/response headers
- Verify request payloads
- Monitor response times

### 4. Backend Console Monitoring
Watch backend console for:
- Database connection messages
- Authentication logs
- Error stack traces
- Custom debug logs

---

## 🏗️ Prevention Strategies

### 1. Route Testing
Create automated tests for all API endpoints:
```javascript
// Example test
describe('Examination API', () => {
  test('GET /api/examinations returns 200', async () => {
    const response = await request(app)
      .get('/api/examinations')
      .set('Authorization', `Bearer ${validToken}`);
    expect(response.status).toBe(200);
  });
});
```

### 2. Environment Validation
```javascript
// Add to server startup
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missing = requiredEnvVars.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
```

### 3. Health Check Endpoints
```javascript
// Add comprehensive health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database
    await prisma.$queryRaw`SELECT 1`;
    
    // Test environment
    const env = {
      nodeEnv: process.env.NODE_ENV,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    };
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### 4. API Documentation
Document all endpoints with:
- Required headers
- Request/response examples
- Error responses
- Authentication requirements

---

## 🚀 Next Steps

1. **Verify Fixes**: Run the testing scripts provided
2. **Monitor Logs**: Watch backend console for errors
3. **Test Authentication**: Ensure login/logout works
4. **Database Check**: Verify all tables have data
5. **Frontend Integration**: Test examination pages work

## 📞 Getting Help

If issues persist:

1. **Check Logs**: Backend console and browser DevTools
2. **Run Diagnostics**: Use the test scripts provided
3. **Verify Environment**: Ensure all required vars are set
4. **Test Isolation**: Try endpoints with curl/Postman
5. **Database State**: Check if data exists and is accessible

---

## 📋 Quick Reference Commands

```bash
# Backend server
cd backend && npm start

# Database operations
cd backend && npx prisma db push
cd backend && npx prisma generate
cd backend && npx prisma studio

# Testing
cd backend && node test-database-connection.js
cd backend && node test-api-endpoints.js

# Frontend
npm run dev

# Environment check
echo $NODE_ENV
```

Remember: Always check the backend console logs first when debugging API issues!