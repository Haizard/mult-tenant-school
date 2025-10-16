# 🏗️ SYSTEM ARCHITECTURE OVERVIEW

## Technology Stack

```
Frontend:
├─ Next.js 15 (React 19)
├─ Tailwind CSS
├─ Radix UI Components
└─ Framer Motion (Animations)

Backend:
├─ Express.js
├─ TypeScript
├─ Prisma ORM
└─ JWT Authentication

Database:
├─ SQLite (Development)
└─ PostgreSQL (Production-ready)

Deployment:
└─ Render.com
```

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Student    │  │   Teacher    │  │   Parent     │       │
│  │   Portal     │  │   Dashboard  │  │   Portal     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Authentication Middleware (JWT)                    │    │
│  │  Authorization Middleware (RBAC)                    │    │
│  │  Tenant Isolation Middleware                        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Student     │  │  Teacher     │  │  Parent      │       │
│  │  Controller  │  │  Controller  │  │  Controller  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Library     │  │  Academic    │  │  Finance     │       │
│  │  Controller  │  │  Controller  │  │  Controller  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Prisma ORM (Query Builder & Validation)            │    │
│  │  ├─ Multi-tenant filtering                          │    │
│  │  ├─ Relationship management                         │    │
│  │  └─ Transaction support                             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PostgreSQL / SQLite                                │    │
│  │  ├─ Tenant Table (Root)                             │    │
│  │  ├─ User & Role Tables                              │    │
│  │  ├─ Student, Teacher, Parent Tables                 │    │
│  │  ├─ Academic Tables (Grades, Attendance, etc.)      │    │
│  │  ├─ Library Tables (Books, Circulation, etc.)       │    │
│  │  ├─ Finance Tables (Fees, Payments, etc.)           │    │
│  │  └─ Support Tables (Health, Documents, etc.)        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Multi-Tenant Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTEM LEVEL                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Super Admin (System-wide access)                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    TENANT LEVEL                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tenant 1 (School A)                                 │   │
│  │  ├─ Tenant Admin                                     │   │
│  │  ├─ Teachers (isolated to Tenant 1)                  │   │
│  │  ├─ Students (isolated to Tenant 1)                  │   │
│  │  ├─ Parents (isolated to Tenant 1)                   │   │
│  │  └─ All data filtered by tenantId                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tenant 2 (School B)                                 │   │
│  │  ├─ Tenant Admin                                     │   │
│  │  ├─ Teachers (isolated to Tenant 2)                  │   │
│  │  ├─ Students (isolated to Tenant 2)                  │   │
│  │  ├─ Parents (isolated to Tenant 2)                   │   │
│  │  └─ All data filtered by tenantId                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Model Relationships

```
TENANT (Root)
├─ USER (1:1 with Tenant)
│  ├─ STUDENT (1:1 with User)
│  │  ├─ ATTENDANCE (1:N)
│  │  ├─ GRADES (1:N)
│  │  ├─ ACADEMIC_RECORD (1:N)
│  │  ├─ ENROLLMENT (1:N)
│  │  ├─ FEE_ASSIGNMENT (1:N)
│  │  ├─ PAYMENT (1:N)
│  │  ├─ HEALTH_RECORD (1:N)
│  │  ├─ LEAVE_REQUEST (1:N)
│  │  └─ PARENT_STUDENT_RELATION (1:N)
│  │
│  ├─ TEACHER (1:1 with User)
│  │  ├─ TEACHER_SUBJECT (1:N)
│  │  ├─ TEACHER_CLASS (1:N)
│  │  ├─ TEACHER_ATTENDANCE (1:N)
│  │  ├─ TEACHER_EVALUATION (1:N)
│  │  └─ TEACHER_TRAINING (1:N)
│  │
│  ├─ PARENT (1:1 with User)
│  │  └─ PARENT_STUDENT_RELATION (1:N)
│  │
│  └─ STAFF (1:1 with User)
│
├─ ACADEMIC_YEAR (1:N)
│  ├─ CLASS (1:N)
│  │  ├─ TEACHER_CLASS (1:N)
│  │  ├─ STUDENT_ENROLLMENT (1:N)
│  │  └─ SCHEDULE (1:N)
│  │
│  ├─ SUBJECT (1:N)
│  │  ├─ TEACHER_SUBJECT (1:N)
│  │  ├─ COURSE (1:N)
│  │  └─ GRADE (1:N)
│  │
│  └─ EXAMINATION (1:N)
│     └─ GRADE (1:N)
│
├─ LIBRARY (1:N)
│  ├─ BOOK (1:N)
│  │  ├─ BOOK_CIRCULATION (1:N)
│  │  └─ BOOK_RESERVATION (1:N)
│  │
│  ├─ LIBRARY_USER (1:N)
│  ├─ LIBRARY_FINE (1:N)
│  └─ LIBRARY_REPORT (1:N)
│
├─ FINANCE (1:N)
│  ├─ FEE (1:N)
│  ├─ FEE_ASSIGNMENT (1:N)
│  ├─ PAYMENT (1:N)
│  ├─ INVOICE (1:N)
│  ├─ EXPENSE (1:N)
│  ├─ BUDGET (1:N)
│  └─ FINANCIAL_REPORT (1:N)
│
└─ SUPPORT (1:N)
   ├─ HOSTEL (1:N)
   ├─ TRANSPORT (1:N)
   ├─ ANNOUNCEMENT (1:N)
   ├─ NOTIFICATION (1:N)
   └─ AUDIT_LOG (1:N)
```

---

## API Route Structure

```
/api
├─ /auth
│  ├─ POST /login
│  ├─ POST /register
│  └─ POST /logout
│
├─ /students
│  ├─ GET / (list all)
│  ├─ POST / (create)
│  ├─ GET /:id (get one)
│  ├─ PUT /:id (update)
│  ├─ DELETE /:id (delete)
│  └─ POST /:id/enroll (enroll in class)
│
├─ /teachers
│  ├─ GET / (list all)
│  ├─ POST / (create)
│  ├─ GET /:id (get one)
│  ├─ PUT /:id (update)
│  └─ DELETE /:id (delete)
│
├─ /parents
│  ├─ GET / (list all)
│  ├─ POST / (create)
│  ├─ GET /:id (get one)
│  ├─ PUT /:id (update)
│  ├─ DELETE /:id (delete)
│  ├─ POST /:id/relations (link to student)
│  ├─ GET /:id/children/:studentId/academic-records ✅
│  ├─ GET /:id/children/:studentId/attendance ✅
│  ├─ GET /:id/children/:studentId/grades ⚠️ (NOT IMPLEMENTED)
│  └─ GET /:id/children/:studentId/schedule ⚠️ (NOT IMPLEMENTED)
│
├─ /library
│  ├─ GET /books (list books)
│  ├─ POST /books (add book)
│  ├─ POST /circulation/issue (issue book)
│  ├─ POST /circulation/return (return book)
│  ├─ POST /reservations (reserve book)
│  └─ GET /stats (library statistics)
│
├─ /academic
│  ├─ GET /grades (list grades)
│  ├─ POST /grades (create grade)
│  ├─ GET /attendance (list attendance)
│  ├─ POST /attendance (mark attendance)
│  └─ GET /records (academic records)
│
├─ /finance
│  ├─ GET /fees (list fees)
│  ├─ POST /fees (create fee)
│  ├─ GET /payments (list payments)
│  ├─ POST /payments (record payment)
│  └─ GET /invoices (list invoices)
│
└─ /admin
   ├─ GET /users (list all users)
   ├─ GET /roles (list roles)
   ├─ POST /roles (create role)
   └─ GET /audit-logs (view audit logs)
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: AUTHENTICATION                                    │
│  ├─ JWT Token Validation                                    │
│  ├─ Token Expiration Check                                  │
│  └─ User Identity Verification                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: AUTHORIZATION (RBAC)                              │
│  ├─ Role Verification                                       │
│  ├─ Permission Checking                                     │
│  └─ Resource Access Control                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: TENANT ISOLATION                                  │
│  ├─ Tenant ID Validation                                    │
│  ├─ Data Filtering by Tenant                                │
│  └─ Cross-Tenant Access Prevention                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4: DATA VALIDATION                                   │
│  ├─ Input Sanitization                                      │
│  ├─ Schema Validation                                       │
│  └─ Business Logic Validation                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RENDER.COM                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Frontend Service (Next.js)                          │   │
│  │  ├─ Auto-deploy on push                              │   │
│  │  ├─ CDN distribution                                 │   │
│  │  └─ SSL/TLS encryption                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Backend Service (Express.js)                        │   │
│  │  ├─ Auto-deploy on push                              │   │
│  │  ├─ Environment variables                            │   │
│  │  └─ SSL/TLS encryption                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Database (PostgreSQL)                               │   │
│  │  ├─ Automated backups                                │   │
│  │  ├─ Point-in-time recovery                           │   │
│  │  └─ SSL/TLS encryption                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

**Architecture Version:** 1.0  
**Last Updated:** October 16, 2025  
**Status:** Production-Ready (with Phase 1 fixes)

