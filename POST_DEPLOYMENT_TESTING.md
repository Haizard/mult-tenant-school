# 🧪 POST-DEPLOYMENT TESTING GUIDE

**Project:** Multi-Tenant School Management System  
**Environment:** Production (Render)  
**Date:** October 16, 2025

---

## ✅ DEPLOYMENT VERIFICATION

### 1. Service Status Check

**Check if service is running:**
```bash
curl -I https://school-management-api.onrender.com/health
```

**Expected Response:**
```
HTTP/2 200
Content-Type: application/json
```

**Full Response:**
```bash
curl https://school-management-api.onrender.com/health
```

**Expected Output:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-16T12:00:00Z"
}
```

---

## 🗄️ DATABASE VERIFICATION

### 1. Check Database Connection

**Verify Prisma can connect:**
```bash
# This happens during build, but you can verify in logs
# Look for: "Prisma schema loaded"
# Look for: "Migrations applied successfully"
```

### 2. Verify Tables Exist

**Check in Supabase:**
1. Go to Supabase Dashboard
2. Select "school_system" project
3. Go to **SQL Editor**
4. Run:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Should include:**
- activities
- student_activities
- health_records
- students
- parents
- teachers
- classes
- And all other tables

---

## 🔐 AUTHENTICATION TEST

### 1. Get JWT Token

**First, create a test user or use existing credentials:**
```bash
curl -X POST https://school-management-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "test@example.com",
    "role": "student"
  }
}
```

**Save the token for testing:**
```bash
export TOKEN="your-jwt-token-here"
```

---

## 👨‍👩‍👧 PARENT PORTAL TESTING

### Test 1: Get Parent Statistics
```bash
curl -X GET https://school-management-api.onrender.com/api/parents/{parent-id}/statistics \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "childrenCount": 2,
    "children": [
      {
        "id": "student-id",
        "name": "John Doe",
        "educationLevel": "Primary"
      }
    ]
  }
}
```

### Test 2: Get Child Grades
```bash
curl -X GET https://school-management-api.onrender.com/api/parents/{parent-id}/children/{student-id}/grades \
  -H "Authorization: Bearer $TOKEN"
```

### Test 3: Get Child Schedule
```bash
curl -X GET https://school-management-api.onrender.com/api/parents/{parent-id}/children/{student-id}/schedule \
  -H "Authorization: Bearer $TOKEN"
```

### Test 4: Get Child Health Records
```bash
curl -X GET https://school-management-api.onrender.com/api/parents/{parent-id}/children/{student-id}/health-records \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 ACTIVITIES MODULE TESTING

### Test 1: List Activities
```bash
curl -X GET https://school-management-api.onrender.com/api/activities \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "activity-id",
      "name": "Football Club",
      "type": "SPORTS",
      "status": "ACTIVE",
      "maxCapacity": 30
    }
  ]
}
```

### Test 2: Create Activity
```bash
curl -X POST https://school-management-api.onrender.com/api/activities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Basketball Club",
    "description": "School basketball team",
    "type": "SPORTS",
    "maxCapacity": 20,
    "schedule": "Monday & Wednesday 4PM"
  }'
```

### Test 3: Enroll Student
```bash
curl -X POST https://school-management-api.onrender.com/api/activities/{activity-id}/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student-id",
    "role": "MEMBER"
  }'
```

### Test 4: Get Student Activities
```bash
curl -X GET https://school-management-api.onrender.com/api/activities/students/{student-id}/activities \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🏥 HEALTH RECORDS TESTING

### Test 1: Get Health Records
```bash
curl -X GET https://school-management-api.onrender.com/api/health/students/{student-id}/records \
  -H "Authorization: Bearer $TOKEN"
```

### Test 2: Create Health Record
```bash
curl -X POST https://school-management-api.onrender.com/api/health/students/{student-id}/records \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "VACCINATION",
    "title": "COVID-19 Vaccine",
    "description": "First dose",
    "date": "2025-10-16"
  }'
```

### Test 3: Get Health Summary
```bash
curl -X GET https://school-management-api.onrender.com/api/health/students/{student-id}/summary \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "bloodGroup": "O+",
    "allergies": ["Peanuts"],
    "medicalConditions": ["Asthma"],
    "recordCount": 5
  }
}
```

---

## 🔒 SECURITY TESTING

### Test 1: Multi-Tenant Isolation
```bash
# Try to access another tenant's data
curl -X GET https://school-management-api.onrender.com/api/students/other-tenant-student-id \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access denied: No access to this resource"
}
```

### Test 2: RBAC Enforcement
```bash
# Try to access admin endpoint as student
curl -X POST https://school-management-api.onrender.com/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "new@example.com"}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Unauthorized: Insufficient permissions"
}
```

### Test 3: Invalid Token
```bash
curl -X GET https://school-management-api.onrender.com/api/activities \
  -H "Authorization: Bearer invalid-token"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Unauthorized: Invalid token"
}
```

---

## 📊 PERFORMANCE TESTING

### Test 1: Response Time
```bash
# Measure response time
time curl -X GET https://school-management-api.onrender.com/api/activities \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** < 200ms

### Test 2: Load Testing
```bash
# Using Apache Bench (if installed)
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  https://school-management-api.onrender.com/api/activities
```

### Test 3: Concurrent Requests
```bash
# Test 10 concurrent requests
for i in {1..10}; do
  curl -X GET https://school-management-api.onrender.com/api/activities \
    -H "Authorization: Bearer $TOKEN" &
done
wait
```

---

## 🔍 ERROR HANDLING TESTING

### Test 1: Invalid Request
```bash
curl -X POST https://school-management-api.onrender.com/api/activities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": ""}'
```

**Expected:** 400 Bad Request with error message

### Test 2: Not Found
```bash
curl -X GET https://school-management-api.onrender.com/api/activities/invalid-id \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** 404 Not Found

### Test 3: Server Error
```bash
# This should not happen, but if it does:
# Expected: 500 Internal Server Error with error details
```

---

## ✅ FINAL VERIFICATION CHECKLIST

- [ ] Health endpoint responds (200 OK)
- [ ] Database connection successful
- [ ] All tables created
- [ ] Parent portal endpoints work
- [ ] Activities endpoints work
- [ ] Health records endpoints work
- [ ] Authentication working
- [ ] Multi-tenant isolation verified
- [ ] RBAC enforcement verified
- [ ] Response times acceptable
- [ ] Error handling working
- [ ] Logs show normal operation
- [ ] No critical errors in logs

---

## 📈 MONITORING

### Check Render Logs
1. Go to Render Dashboard
2. Select your service
3. Click **Logs** tab
4. Look for:
   - Successful migrations
   - Server started message
   - No error messages
   - Normal request logs

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Select "school_system" project
3. Go to **Logs** → **Database**
4. Verify queries are executing

---

## 🎉 SUCCESS CRITERIA

All tests pass when:
- ✅ All endpoints return expected responses
- ✅ Authentication works correctly
- ✅ Multi-tenant isolation is enforced
- ✅ RBAC is working properly
- ✅ Response times are acceptable
- ✅ No critical errors in logs
- ✅ Database is stable
- ✅ All 20 endpoints are accessible

---

**Testing Date:** October 16, 2025  
**Status:** Ready for Production  
**Confidence:** ⭐⭐⭐⭐⭐

