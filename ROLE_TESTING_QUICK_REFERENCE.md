# 🔐 ROLE-BASED TESTING QUICK REFERENCE

**Date:** October 16, 2025  
**Purpose:** Quick reference for testing each user role

---

## 🔑 LOGIN CREDENTIALS & TOKENS

### Setup Script
```bash
#!/bin/bash

# Super Admin
SUPER_ADMIN_TOKEN=$(curl -s -X POST https://school-management-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "superadmin@system.com", "password": "SecurePass123!"}' | jq -r '.data.token')

# Tenant Admin
TENANT_ADMIN_TOKEN=$(curl -s -X POST https://school-management-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@school1.com", "password": "SecurePass123!"}' | jq -r '.data.token')

# Teacher
TEACHER_TOKEN=$(curl -s -X POST https://school-management-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@school1.com", "password": "SecurePass123!"}' | jq -r '.data.token')

# Student
STUDENT_TOKEN=$(curl -s -X POST https://school-management-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@school1.com", "password": "SecurePass123!"}' | jq -r '.data.token')

# Parent
PARENT_TOKEN=$(curl -s -X POST https://school-management-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "parent@school1.com", "password": "SecurePass123!"}' | jq -r '.data.token')

# Librarian
LIBRARIAN_TOKEN=$(curl -s -X POST https://school-management-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "librarian@school1.com", "password": "SecurePass123!"}' | jq -r '.data.token')

# Finance Staff
FINANCE_TOKEN=$(curl -s -X POST https://school-management-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "finance@school1.com", "password": "SecurePass123!"}' | jq -r '.data.token')

# General Staff
STAFF_TOKEN=$(curl -s -X POST https://school-management-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "staff@school1.com", "password": "SecurePass123!"}' | jq -r '.data.token')

echo "All tokens obtained successfully!"
```

---

## 👑 SUPER ADMIN TESTING

**Can Access:** Everything across all tenants

### Key Tests
```bash
# Get all tenants
curl -X GET https://school-management-api.onrender.com/api/tenants \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN"

# Get all system users
curl -X GET https://school-management-api.onrender.com/api/users/system \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN"

# Create new tenant
curl -X POST https://school-management-api.onrender.com/api/tenants \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New School", "email": "admin@newschool.com"}'
```

**Expected:** All requests return 200/201

---

## 🏢 TENANT ADMIN TESTING

**Can Access:** Own tenant only, full management

### Key Tests
```bash
# Get users in tenant
curl -X GET https://school-management-api.onrender.com/api/users \
  -H "Authorization: Bearer $TENANT_ADMIN_TOKEN"

# Create course
curl -X POST https://school-management-api.onrender.com/api/courses \
  -H "Authorization: Bearer $TENANT_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Math", "code": "MATH101"}'

# Cannot access other tenant
curl -X GET https://school-management-api.onrender.com/api/tenants \
  -H "Authorization: Bearer $TENANT_ADMIN_TOKEN"
```

**Expected:** First two return 200/201, last returns 403

---

## 👨‍🏫 TEACHER TESTING

**Can Access:** Students, grades, attendance, classes

### Key Tests
```bash
# Get students
curl -X GET https://school-management-api.onrender.com/api/students \
  -H "Authorization: Bearer $TEACHER_TOKEN"

# Create grade
curl -X POST https://school-management-api.onrender.com/api/grades \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"studentId": "id", "marks": 85}'

# Cannot create users
curl -X POST https://school-management-api.onrender.com/api/users \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "new@school.com"}'
```

**Expected:** First two return 200/201, last returns 403

---

## 👨‍🎓 STUDENT TESTING

**Can Access:** Own data only

### Key Tests
```bash
# Get own grades
curl -X GET https://school-management-api.onrender.com/api/students/{own-id}/grades \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Get own schedule
curl -X GET https://school-management-api.onrender.com/api/students/{own-id}/schedule \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Cannot access other student's data
curl -X GET https://school-management-api.onrender.com/api/students/other-id/grades \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Expected:** First two return 200, last returns 403

---

## 👨‍👩‍👧 PARENT TESTING

**Can Access:** Child's data only

### Key Tests
```bash
# Get child statistics
curl -X GET https://school-management-api.onrender.com/api/parents/{parent-id}/statistics \
  -H "Authorization: Bearer $PARENT_TOKEN"

# Get child grades
curl -X GET https://school-management-api.onrender.com/api/parents/{parent-id}/children/{child-id}/grades \
  -H "Authorization: Bearer $PARENT_TOKEN"

# Cannot access other parent's children
curl -X GET https://school-management-api.onrender.com/api/parents/other-parent-id/children \
  -H "Authorization: Bearer $PARENT_TOKEN"
```

**Expected:** First two return 200, last returns 403

---

## 📚 LIBRARIAN TESTING

**Can Access:** Library resources only

### Key Tests
```bash
# Get library resources
curl -X GET https://school-management-api.onrender.com/api/library/resources \
  -H "Authorization: Bearer $LIBRARIAN_TOKEN"

# Create resource
curl -X POST https://school-management-api.onrender.com/api/library/resources \
  -H "Authorization: Bearer $LIBRARIAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Book", "author": "Author"}'

# Cannot manage users
curl -X POST https://school-management-api.onrender.com/api/users \
  -H "Authorization: Bearer $LIBRARIAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "new@school.com"}'
```

**Expected:** First two return 200/201, last returns 403

---

## 💰 FINANCE STAFF TESTING

**Can Access:** Payments and financial data

### Key Tests
```bash
# Get payments
curl -X GET https://school-management-api.onrender.com/api/payments \
  -H "Authorization: Bearer $FINANCE_TOKEN"

# Create payment
curl -X POST https://school-management-api.onrender.com/api/payments \
  -H "Authorization: Bearer $FINANCE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"studentId": "id", "amount": 5000}'

# Cannot manage grades
curl -X POST https://school-management-api.onrender.com/api/grades \
  -H "Authorization: Bearer $FINANCE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"studentId": "id", "marks": 85}'
```

**Expected:** First two return 200/201, last returns 403

---

## 👔 GENERAL STAFF TESTING

**Can Access:** Basic operations only

### Key Tests
```bash
# Get general info
curl -X GET https://school-management-api.onrender.com/api/staff/info \
  -H "Authorization: Bearer $STAFF_TOKEN"

# Cannot manage sensitive data
curl -X POST https://school-management-api.onrender.com/api/users \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "new@school.com"}'
```

**Expected:** First returns 200, second returns 403

---

## 🔒 MULTI-TENANT ISOLATION TEST

```bash
# All roles should only see their tenant's data
curl -X GET https://school-management-api.onrender.com/api/students \
  -H "Authorization: Bearer $TENANT_ADMIN_TOKEN"

# Verify all returned students have same tenantId
# Should NOT include students from other tenants
```

---

## ✅ QUICK VERIFICATION

| Role | Can Create Users | Can View Grades | Can View Payments | Can Manage Library |
|------|------------------|-----------------|-------------------|--------------------|
| Super Admin | ✅ | ✅ | ✅ | ✅ |
| Tenant Admin | ✅ | ✅ | ✅ | ✅ |
| Teacher | ❌ | ✅ | ❌ | ❌ |
| Student | ❌ | ✅ (own) | ❌ | ❌ |
| Parent | ❌ | ✅ (child) | ❌ | ❌ |
| Librarian | ❌ | ❌ | ❌ | ✅ |
| Finance | ❌ | ❌ | ✅ | ❌ |
| Staff | ❌ | ❌ | ❌ | ❌ |

---

**Last Updated:** October 16, 2025  
**Status:** ✅ Ready for Testing

