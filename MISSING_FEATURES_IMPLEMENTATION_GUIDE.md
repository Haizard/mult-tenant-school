# 📋 MISSING FEATURES IMPLEMENTATION GUIDE

## Priority 1: Complete Parent Portal Endpoints

### 1.1 Implement `getChildGrades`

**File:** `backend/src/controllers/parentController.js`

```javascript
const getChildGrades = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    // Verify parent-student relationship
    const relation = await prisma.parentStudentRelation.findFirst({
      where: {
        parentId: id,
        studentId: studentId,
        tenantId: req.tenantId
      }
    });

    if (!relation) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: No relationship with this student'
      });
    }

    const grades = await prisma.grade.findMany({
      where: {
        studentId: studentId,
        tenantId: req.tenantId
      },
      include: {
        examination: {
          select: {
            id: true,
            examName: true,
            examType: true,
            examLevel: true,
            maxMarks: true,
            startDate: true
          }
        },
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectCode: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: grades
    });
  } catch (error) {
    console.error('Get child grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get child grades',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
```

### 1.2 Implement `getChildSchedule`

```javascript
const getChildSchedule = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    // Verify parent-student relationship
    const relation = await prisma.parentStudentRelation.findFirst({
      where: {
        parentId: id,
        studentId: studentId,
        tenantId: req.tenantId
      }
    });

    if (!relation) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: No relationship with this student'
      });
    }

    // Get student's class
    const student = await prisma.student.findFirst({
      where: { id: studentId, tenantId: req.tenantId },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: { class: true }
        }
      }
    });

    if (!student || !student.enrollments.length) {
      return res.json({ success: true, data: [] });
    }

    const classIds = student.enrollments.map(e => e.classId).filter(Boolean);

    const schedule = await prisma.schedule.findMany({
      where: {
        tenantId: req.tenantId,
        classId: { in: classIds },
        status: 'ACTIVE'
      },
      include: {
        subject: { select: { id: true, subjectName: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { startTime: 'asc' }
    });

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Get child schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get child schedule',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
```

### 1.3 Implement `updateParentRelation`

```javascript
const updateParentRelation = async (req, res) => {
  try {
    const { id, relationId } = req.params;
    const { relationship, isPrimary, isEmergency, canPickup, notes } = req.body;

    // Verify parent exists
    const parent = await prisma.parent.findFirst({
      where: { id, tenantId: req.tenantId }
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // Update relation
    const relation = await prisma.parentStudentRelation.update({
      where: { id: relationId },
      data: {
        relationship: relationship || undefined,
        isPrimary: isPrimary !== undefined ? isPrimary : undefined,
        isEmergency: isEmergency !== undefined ? isEmergency : undefined,
        canPickup: canPickup !== undefined ? canPickup : undefined,
        notes: notes || undefined
      },
      include: {
        student: { include: { user: true } }
      }
    });

    res.json({
      success: true,
      message: 'Parent-student relationship updated successfully',
      data: relation
    });
  } catch (error) {
    console.error('Update parent relation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update parent-student relationship',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
```

### 1.4 Implement `deleteParentRelation`

```javascript
const deleteParentRelation = async (req, res) => {
  try {
    const { id, relationId } = req.params;

    // Verify parent exists
    const parent = await prisma.parent.findFirst({
      where: { id, tenantId: req.tenantId }
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // Delete relation
    await prisma.parentStudentRelation.delete({
      where: { id: relationId }
    });

    res.json({
      success: true,
      message: 'Parent-student relationship deleted successfully'
    });
  } catch (error) {
    console.error('Delete parent relation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete parent-student relationship',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
```

---

## Priority 2: Add Extracurricular Activities Module

### 2.1 Update Prisma Schema

Add to `backend/schema.prisma`:

```prisma
model Activity {
  id String @id @default(cuid())
  tenantId String
  name String
  description String?
  type String // SPORTS, CLUB, CULTURAL, ACADEMIC, ARTS, etc.
  leaderId String?
  maxCapacity Int?
  schedule String? // JSON or text description
  status ActivityStatus @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  leader User? @relation("ActivityLeader", fields: [leaderId], references: [id])
  students StudentActivity[]
  
  @@unique([tenantId, name])
}

model StudentActivity {
  id String @id @default(cuid())
  tenantId String
  studentId String
  activityId String
  joinDate DateTime @default(now())
  status ActivityEnrollmentStatus @default(ACTIVE)
  role String? // MEMBER, CAPTAIN, VICE_CAPTAIN, etc.
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)
  activity Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  
  @@unique([tenantId, studentId, activityId])
}

enum ActivityStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}

enum ActivityEnrollmentStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  GRADUATED
}
```

### 2.2 Create Activity Controller

**File:** `backend/src/controllers/activityController.js`

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getActivities = async (req, res) => {
  try {
    const { tenantId } = req;
    const { type, status, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(type && { type }),
      ...(status && { status })
    };

    const activities = await prisma.activity.findMany({
      where,
      include: {
        leader: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { students: true } }
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { name: 'asc' }
    });

    const total = await prisma.activity.count({ where });

    res.json({
      success: true,
      data: activities,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createActivity = async (req, res) => {
  try {
    const { tenantId } = req;
    const { name, description, type, leaderId, maxCapacity, schedule } = req.body;

    const activity = await prisma.activity.create({
      data: {
        tenantId,
        name,
        description,
        type,
        leaderId,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
        schedule
      },
      include: { leader: true }
    });

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const enrollStudent = async (req, res) => {
  try {
    const { tenantId } = req;
    const { activityId } = req.params;
    const { studentId, role } = req.body;

    const enrollment = await prisma.studentActivity.create({
      data: {
        tenantId,
        studentId,
        activityId,
        role
      },
      include: { activity: true, student: { include: { user: true } } }
    });

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getActivities,
  createActivity,
  enrollStudent
};
```

### 2.3 Create Activity Routes

**File:** `backend/src/routes/activityRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');
const activityController = require('../controllers/activityController');

router.use(authenticateToken);
router.use(ensureTenantAccess);

router.get('/', authorize(['activities:read']), activityController.getActivities);
router.post('/', authorize(['activities:create']), activityController.createActivity);
router.post('/:activityId/enroll', authorize(['activities:update']), activityController.enrollStudent);

module.exports = router;
```

---

## Priority 3: Health Records API

### 3.1 Create Health Records Controller

**File:** `backend/src/controllers/healthController.js`

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getHealthRecords = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { tenantId } = req;

    const records = await prisma.healthRecord.findMany({
      where: { studentId, tenantId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createHealthRecord = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { tenantId } = req;
    const { recordType, description, notes } = req.body;

    const record = await prisma.healthRecord.create({
      data: {
        tenantId,
        studentId,
        recordType,
        description,
        notes,
        recordDate: new Date()
      }
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getHealthRecords, createHealthRecord };
```

---

## Testing Checklist

- [ ] Parent can view child's grades
- [ ] Parent can view child's schedule
- [ ] Parent cannot access other children's data
- [ ] Activities can be created and managed
- [ ] Students can enroll in activities
- [ ] Health records can be created and viewed
- [ ] All endpoints properly filter by tenantId
- [ ] RBAC permissions enforced

---

**Implementation Time Estimate:** 4-6 hours  
**Testing Time Estimate:** 2-3 hours

