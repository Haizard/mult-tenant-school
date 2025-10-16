# 🔧 QUICK FIX GUIDE

## Fix #1: Update Parent Controller Exports

**File:** `backend/src/controllers/parentController.js`

**Current Issue:** Four methods return 501 (Not Implemented)

**Fix:** Replace the stub implementations at the end of the file with actual implementations.

**Location:** Lines 619-650

**Before:**
```javascript
getChildGrades: async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Child grades not implemented yet'
  });
},
```

**After:** (See MISSING_FEATURES_IMPLEMENTATION_GUIDE.md for full implementation)

---

## Fix #2: Add Parent Data Privacy Check

**File:** `backend/src/controllers/parentController.js`

**Current Issue:** Parent access not explicitly verified

**Add this helper function:**
```javascript
const verifyParentAccess = async (req, res, parentId, studentId) => {
  // Verify parent exists and belongs to this tenant
  const parent = await prisma.parent.findFirst({
    where: {
      id: parentId,
      userId: req.user.id, // Ensure parent is accessing their own account
      tenantId: req.tenantId
    }
  });

  if (!parent) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Invalid parent account'
    });
  }

  // Verify parent-student relationship
  const relation = await prisma.parentStudentRelation.findFirst({
    where: {
      parentId: parentId,
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

  return { parent, relation };
};
```

**Use in all parent portal methods:**
```javascript
const getChildAcademicRecords = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    
    const verification = await verifyParentAccess(req, res, id, studentId);
    if (!verification) return; // verifyParentAccess already sent error response
    
    // ... rest of implementation
  } catch (error) {
    // ... error handling
  }
};
```

---

## Fix #3: Add Teacher Authorization Check

**File:** `backend/src/controllers/examinationController.js`

**Current Issue:** Teachers can potentially grade students not in their classes

**Add this check before creating grades:**
```javascript
const verifyTeacherAccess = async (req, res, studentId, subjectId) => {
  const teacher = await prisma.teacher.findFirst({
    where: {
      userId: req.user.id,
      tenantId: req.tenantId
    }
  });

  if (!teacher) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Not a teacher'
    });
  }

  // Verify teacher teaches this subject
  const teacherSubject = await prisma.teacherSubject.findFirst({
    where: {
      teacherId: teacher.id,
      subjectId: subjectId,
      tenantId: req.tenantId
    }
  });

  if (!teacherSubject) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: You do not teach this subject'
    });
  }

  // Verify student is in teacher's class
  const studentInClass = await prisma.studentEnrollment.findFirst({
    where: {
      studentId: studentId,
      tenantId: req.tenantId,
      class: {
        teachers: {
          some: { teacherId: teacher.id }
        }
      }
    }
  });

  if (!studentInClass) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Student not in your class'
    });
  }

  return teacher;
};
```

---

## Fix #4: Add Audit Logging Middleware

**File:** `backend/src/middleware/auditLog.js` (Create new file)

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auditLog = async (req, res, next) => {
  // Capture original send
  const originalSend = res.send;

  res.send = function (data) {
    // Log sensitive data access
    const sensitiveEndpoints = [
      '/parents/',
      '/students/',
      '/grades',
      '/health-records'
    ];

    const isSensitive = sensitiveEndpoints.some(endpoint => 
      req.path.includes(endpoint)
    );

    if (isSensitive && req.method === 'GET' && res.statusCode === 200) {
      prisma.auditLog.create({
        data: {
          tenantId: req.tenantId,
          userId: req.user?.id,
          action: `${req.method} ${req.path}`,
          resource: req.path,
          status: res.statusCode,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          timestamp: new Date()
        }
      }).catch(err => console.error('Audit log error:', err));
    }

    res.send = originalSend;
    return res.send(data);
  };

  next();
};

module.exports = auditLog;
```

**Add to main app:**
```javascript
const auditLog = require('./middleware/auditLog');
app.use(auditLog);
```

---

## Fix #5: Add Tenant Isolation Test

**File:** `backend/src/tests/tenantIsolation.test.js` (Create new file)

```javascript
const request = require('supertest');
const app = require('../app');

describe('Tenant Isolation Tests', () => {
  let tenant1Token, tenant2Token, student1Id, student2Id;

  test('Parent from Tenant 1 cannot access student from Tenant 2', async () => {
    // Get parent from tenant 1
    const parent1 = await request(app)
      .get('/api/parents')
      .set('Authorization', `Bearer ${tenant1Token}`)
      .expect(200);

    // Try to access student from tenant 2
    const response = await request(app)
      .get(`/api/parents/${parent1.body.data[0].id}/children/${student2Id}/academic-records`)
      .set('Authorization', `Bearer ${tenant1Token}`)
      .expect(403);

    expect(response.body.message).toContain('Access denied');
  });

  test('All queries filter by tenantId', async () => {
    const response = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${tenant1Token}`)
      .expect(200);

    // Verify all students belong to tenant 1
    response.body.data.forEach(student => {
      expect(student.tenantId).toBe(tenant1Token.tenantId);
    });
  });
});
```

---

## Fix #6: Add Missing Routes

**File:** `backend/src/routes/parentRoutes.js`

**Add these routes:**
```javascript
// Parent portal - child data access
router.get('/:id/children/:studentId/grades', 
  authenticateToken, 
  authorize(['parent:view_child_data']),
  parentController.getChildGrades
);

router.get('/:id/children/:studentId/schedule', 
  authenticateToken, 
  authorize(['parent:view_child_data']),
  parentController.getChildSchedule
);

router.put('/:id/relations/:relationId', 
  authenticateToken, 
  authorize(['parent:manage_relations']),
  parentController.updateParentRelation
);

router.delete('/:id/relations/:relationId', 
  authenticateToken, 
  authorize(['parent:manage_relations']),
  parentController.deleteParentRelation
);
```

---

## Fix #7: Update Role Permissions

**File:** `app/lib/rolePermissions.ts`

**Add missing permissions:**
```typescript
export const ROLE_PERMISSIONS = {
  // ... existing roles ...
  
  Parent: [
    { resource: 'parent', action: 'view_self', roles: ['Parent'] },
    { resource: 'parent', action: 'view_child_data', roles: ['Parent'] },
    { resource: 'parent', action: 'manage_relations', roles: ['Parent'] },
    { resource: 'student', action: 'view_child', roles: ['Parent'] },
    { resource: 'grades', action: 'view_child', roles: ['Parent'] },
    { resource: 'attendance', action: 'view_child', roles: ['Parent'] },
    { resource: 'finance', action: 'view_child', roles: ['Parent'] },
  ],
  
  Librarian: [
    { resource: 'library', action: 'manage', roles: ['Librarian'] },
    { resource: 'books', action: 'manage', roles: ['Librarian'] },
    { resource: 'circulation', action: 'manage', roles: ['Librarian'] },
    { resource: 'fines', action: 'manage', roles: ['Librarian'] },
    { resource: 'borrowing_history', action: 'view', roles: ['Librarian'] },
  ]
};
```

---

## Implementation Priority

1. **CRITICAL (Do First):**
   - Fix #1: Implement parent portal endpoints
   - Fix #2: Add parent data privacy check
   - Fix #3: Add teacher authorization check

2. **HIGH (Do Soon):**
   - Fix #4: Add audit logging
   - Fix #5: Add tenant isolation tests
   - Fix #6: Add missing routes

3. **MEDIUM (Do Later):**
   - Fix #7: Update role permissions

---

## Testing After Fixes

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- parentController.test.js

# Run tenant isolation tests
npm test -- tenantIsolation.test.js

# Run with coverage
npm test -- --coverage
```

---

**Estimated Implementation Time:** 3-4 hours  
**Estimated Testing Time:** 1-2 hours

