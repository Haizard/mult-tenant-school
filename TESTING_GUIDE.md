# 🧪 TESTING GUIDE - NEW IMPLEMENTATIONS

**System:** Multi-Tenant School Management System  
**Date:** October 16, 2025

---

## 📋 QUICK START

### 1. Run Database Migration
```bash
cd backend
npx prisma migrate dev --name add_activities_and_health_records
```

### 2. Start Backend Server
```bash
npm start
# Server should run on http://localhost:5000
```

### 3. Test Endpoints Using Postman/cURL

---

## 🧪 TEST SCENARIOS

### A. PARENT PORTAL ENDPOINTS

#### Test 1: Get Child Grades
```bash
curl -X GET http://localhost:5000/api/parents/{parentId}/children/{studentId}/grades \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Expected Response:
{
  "success": true,
  "data": {
    "studentName": "John Doe",
    "grades": [
      {
        "id": "...",
        "subject": "Mathematics",
        "score": 85,
        "grade": "A",
        "examType": "MIDTERM"
      }
    ]
  }
}
```

#### Test 2: Get Child Schedule
```bash
curl -X GET http://localhost:5000/api/parents/{parentId}/children/{studentId}/schedule \
  -H "Authorization: Bearer {token}"

# Expected Response:
{
  "success": true,
  "data": {
    "schedule": [
      {
        "day": "Monday",
        "subject": "Mathematics",
        "teacher": "Mr. Smith",
        "startTime": "09:00",
        "endTime": "10:00"
      }
    ]
  }
}
```

#### Test 3: Get Child Health Records
```bash
curl -X GET http://localhost:5000/api/parents/{parentId}/children/{studentId}/health-records \
  -H "Authorization: Bearer {token}"

# Expected Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "recordType": "VACCINATION",
      "description": "COVID-19 Vaccine",
      "recordDate": "2025-10-01"
    }
  ]
}
```

#### Test 4: Get Parent Statistics
```bash
curl -X GET http://localhost:5000/api/parents/{parentId}/statistics \
  -H "Authorization: Bearer {token}"

# Expected Response:
{
  "success": true,
  "data": {
    "totalChildren": 2,
    "children": [
      {
        "id": "...",
        "name": "John Doe",
        "educationLevel": "Form 1",
        "averageGrade": "A"
      }
    ]
  }
}
```

---

### B. ACTIVITIES MODULE

#### Test 1: Create Activity
```bash
curl -X POST http://localhost:5000/api/activities \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Football Club",
    "description": "School football team",
    "type": "SPORTS",
    "leaderId": "{teacherId}",
    "maxCapacity": 20,
    "schedule": "Monday & Wednesday 3:00 PM"
  }'

# Expected Response:
{
  "success": true,
  "message": "Activity created successfully",
  "data": {
    "id": "...",
    "name": "Football Club",
    "status": "ACTIVE"
  }
}
```

#### Test 2: List Activities
```bash
curl -X GET "http://localhost:5000/api/activities?type=SPORTS&status=ACTIVE&page=1&limit=10" \
  -H "Authorization: Bearer {token}"

# Expected Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Football Club",
      "type": "SPORTS",
      "status": "ACTIVE",
      "leader": { "firstName": "John", "lastName": "Smith" },
      "_count": { "students": 15 }
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 5 }
}
```

#### Test 3: Enroll Student in Activity
```bash
curl -X POST http://localhost:5000/api/activities/{activityId}/enroll \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "{studentId}",
    "role": "MEMBER"
  }'

# Expected Response:
{
  "success": true,
  "message": "Student enrolled in activity successfully",
  "data": {
    "id": "...",
    "studentId": "{studentId}",
    "activityId": "{activityId}",
    "role": "MEMBER",
    "status": "ACTIVE"
  }
}
```

#### Test 4: Get Student's Activities
```bash
curl -X GET http://localhost:5000/api/activities/students/{studentId}/activities \
  -H "Authorization: Bearer {token}"

# Expected Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "studentId": "{studentId}",
      "activity": {
        "name": "Football Club",
        "type": "SPORTS"
      },
      "role": "MEMBER",
      "status": "ACTIVE"
    }
  ]
}
```

---

### C. HEALTH RECORDS API

#### Test 1: Create Health Record
```bash
curl -X POST http://localhost:5000/api/health/students/{studentId}/records \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "VACCINATION",
    "description": "COVID-19 Vaccine Dose 1",
    "notes": "No adverse reactions",
    "recordDate": "2025-10-01"
  }'

# Expected Response:
{
  "success": true,
  "message": "Health record created successfully",
  "data": {
    "id": "...",
    "studentId": "{studentId}",
    "recordType": "VACCINATION",
    "description": "COVID-19 Vaccine Dose 1"
  }
}
```

#### Test 2: Get Health Records
```bash
curl -X GET http://localhost:5000/api/health/students/{studentId}/records \
  -H "Authorization: Bearer {token}"

# Expected Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "recordType": "VACCINATION",
      "description": "COVID-19 Vaccine Dose 1",
      "recordDate": "2025-10-01"
    }
  ]
}
```

#### Test 3: Get Health Summary
```bash
curl -X GET http://localhost:5000/api/health/students/{studentId}/summary \
  -H "Authorization: Bearer {token}"

# Expected Response:
{
  "success": true,
  "data": {
    "student": {
      "name": "John Doe",
      "bloodGroup": "O+",
      "medicalInfo": "Asthmatic"
    },
    "recentRecords": [...],
    "totalRecords": 5
  }
}
```

---

## ✅ VALIDATION CHECKLIST

### Parent Portal
- [ ] Parent can only see their own children's data
- [ ] Proper error when accessing unauthorized child
- [ ] All grades, schedules, and health records display correctly
- [ ] Statistics show accurate child count

### Activities
- [ ] Activities created with correct status
- [ ] Students can be enrolled with different roles
- [ ] Activity capacity is tracked
- [ ] Students can be removed from activities
- [ ] Activity list filters work correctly

### Health Records
- [ ] Records created with correct date
- [ ] All record types supported
- [ ] Records can be updated and deleted
- [ ] Health summary includes all required fields

### Security
- [ ] Unauthorized users get 403 error
- [ ] Multi-tenant isolation verified
- [ ] No data leakage between tenants
- [ ] Proper error messages for invalid requests

---

## 🐛 TROUBLESHOOTING

### Issue: "Activity not found"
**Solution:** Verify activity ID and tenant ID match

### Issue: "Access denied: No relationship with this student"
**Solution:** Verify parent-student relationship exists in database

### Issue: "Student not found"
**Solution:** Verify student ID and tenant ID match

### Issue: Migration fails
**Solution:** 
```bash
# Reset database (development only)
npx prisma migrate reset

# Or manually check schema
npx prisma db push
```

---

## 📊 PERFORMANCE TESTING

### Load Test Activities Endpoint
```bash
# Using Apache Bench
ab -n 1000 -c 10 -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/activities

# Expected: <200ms response time
```

### Database Query Performance
```bash
# Check slow queries in logs
tail -f logs/database.log | grep "duration"
```

---

## 🎯 FINAL VERIFICATION

After all tests pass:

1. ✅ Run full test suite
2. ✅ Check code coverage
3. ✅ Verify no console errors
4. ✅ Check database integrity
5. ✅ Verify multi-tenant isolation
6. ✅ Test with multiple users
7. ✅ Verify authorization on all endpoints

---

**Testing Status:** Ready for QA  
**Date:** October 16, 2025

