const express = require("express");
const router = express.Router();
const academicController = require("../controllers/academicController");
const {
  authenticateToken,
  authorize,
  ensureTenantAccess,
} = require("../middleware/auth");
const { auditLoggers } = require("../middleware/auditLogger");

// All routes require authentication
router.use(authenticateToken);

// Course Management Routes
router.get(
  "/courses",
  authorize(["courses:read"]),
  ensureTenantAccess,
  academicController.getCourses,
);

router.post(
  "/courses",
  authorize(["courses:create"]),
  ensureTenantAccess,
  academicController.validateCourse,
  academicController.createCourse,
);

router.put(
  "/courses/:id",
  authorize(["courses:update"]),
  ensureTenantAccess,
  academicController.validateCourse,
  academicController.updateCourse,
);

router.get(
  "/courses/:id",
  authorize(["courses:read"]),
  ensureTenantAccess,
  academicController.getCourseById,
);

router.delete(
  "/courses/:id",
  authorize(["courses:delete"]),
  ensureTenantAccess,
  academicController.deleteCourse,
);

// Subject Management Routes
router.get(
  "/subjects",
  authorize(["subjects:read"]),
  ensureTenantAccess,
  academicController.getSubjects,
);

router.post(
  "/subjects",
  authorize(["subjects:create"]),
  ensureTenantAccess,
  academicController.validateSubject,
  academicController.createSubject,
);

router.put(
  "/subjects/:id",
  authorize(["subjects:update"]),
  ensureTenantAccess,
  academicController.validateSubject,
  academicController.updateSubject,
);

router.get(
  "/subjects/:id",
  authorize(["subjects:read"]),
  ensureTenantAccess,
  academicController.getSubjectById,
);

router.delete(
  "/subjects/:id",
  authorize(["subjects:delete"]),
  ensureTenantAccess,
  academicController.deleteSubject,
);

// Teacher-Subject Assignment Routes
router.get(
  "/teacher-subjects",
  authorize(["subjects:read"]),
  ensureTenantAccess,
  academicController.getTeacherSubjects,
);

router.post(
  "/teacher-subjects",
  authorize(["subjects:update"]),
  ensureTenantAccess,
  academicController.validateTeacherSubject,
  academicController.assignTeacherToSubject,
);

router.delete(
  "/teacher-subjects/:id",
  authorize(["subjects:update"]),
  ensureTenantAccess,
  academicController.removeTeacherFromSubject,
);

// Academic Year Management Routes
router.get(
  "/academic-years",
  authorize(["academic-years:read"]),
  ensureTenantAccess,
  academicController.getAcademicYears,
);

router.post(
  "/academic-years",
  authorize(["academic-years:create"]),
  ensureTenantAccess,
  academicController.validateAcademicYear,
  academicController.createAcademicYear,
);

router.put(
  "/academic-years/:id",
  authorize(["academic-years:update"]),
  ensureTenantAccess,
  academicController.validateAcademicYear,
  academicController.updateAcademicYear,
);

router.delete(
  "/academic-years/:id",
  authorize(["academic-years:delete"]),
  ensureTenantAccess,
  academicController.deleteAcademicYear,
);

// Class Management Routes
router.get(
  "/classes",
  authorize(["classes:read"]),
  ensureTenantAccess,
  auditLoggers.read("classes"),
  academicController.getClasses,
);

router.post(
  "/classes",
  authorize(["classes:create"]),
  ensureTenantAccess,
  auditLoggers.createClass,
  academicController.validateClass,
  academicController.createClass,
);

router.put(
  "/classes/:id",
  authorize(["classes:update"]),
  ensureTenantAccess,
  auditLoggers.updateClass,
  academicController.validateClass,
  academicController.updateClass,
);

router.get(
  "/classes/:id",
  authorize(["classes:read"]),
  ensureTenantAccess,
  auditLoggers.viewClass,
  academicController.getClassById,
);

router.delete(
  "/classes/:id",
  authorize(["classes:delete"]),
  ensureTenantAccess,
  auditLoggers.deleteClass,
  academicController.deleteClass,
);

// Class Enrollment Management Routes
router.get(
  "/classes/:id/enrollment",
  authorize(["classes:read"]),
  ensureTenantAccess,
  auditLoggers.viewClass,
  academicController.getClassEnrollmentStats,
);

router.post(
  "/classes/:classId/enrollment",
  authorize(["classes:update"]),
  ensureTenantAccess,
  auditLoggers.assignStudentToClass,
  academicController.updateClassEnrollment,
);

// Test endpoint for debugging subjects API
router.get(
  "/subjects/test",
  authorize(["subjects:read"]),
  ensureTenantAccess,
  async (req, res) => {
    try {
      console.log("=== SUBJECTS TEST ENDPOINT ===");
      console.log("tenantId:", req.tenantId);
      console.log("user:", req.user?.email);

      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();

      // Test 1: Simple count
      const count = await prisma.subject.count({
        where: { tenantId: req.tenantId },
      });
      console.log("Simple count:", count);

      // Test 2: Basic query without includes
      const basicSubjects = await prisma.subject.findMany({
        where: { tenantId: req.tenantId },
        take: 5,
      });
      console.log("Basic subjects:", basicSubjects.length);

      // Test 3: Query with only tenant include
      const subjectsWithTenant = await prisma.subject.findMany({
        where: { tenantId: req.tenantId },
        take: 3,
        include: {
          tenant: {
            select: { id: true, name: true },
          },
        },
      });
      console.log("With tenant include:", subjectsWithTenant.length);

      res.json({
        success: true,
        debug: true,
        tests: {
          count,
          basicQuery: basicSubjects.length,
          withTenant: subjectsWithTenant.length,
        },
        data: basicSubjects.slice(0, 2),
      });
    } catch (error) {
      console.error("Test endpoint error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack,
      });
    }
  },
);

module.exports = router;
