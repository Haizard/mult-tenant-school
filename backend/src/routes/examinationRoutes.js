const express = require("express");
const router = express.Router();
const { authenticateToken, authorize } = require("../middleware/auth");
const {
  // Examination management
  getExaminations,
  getExaminationById,
  createExamination,
  updateExamination,
  deleteExamination,
  validateExamination,

  // Grade management
  getGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
  validateGrade,
  validateGradeUpdate,

  // Grading scale management
  getGradingScales,
  createGradingScale,
  validateGradingScale,

  // Export functions
  exportGrades,
  exportExaminations,
} = require("../controllers/examinationController");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Examination Routes
router.get("/", authorize(["examinations:read"]), getExaminations);
router.get("/:id", authorize(["examinations:read"]), getExaminationById);
router.post(
  "/",
  authorize(["examinations:create"]),
  validateExamination,
  createExamination,
);
router.put(
  "/:id",
  authorize(["examinations:update"]),
  validateExamination,
  updateExamination,
);
router.delete("/:id", authorize(["examinations:delete"]), deleteExamination);

// Grade Routes
router.get("/grades", authorize(["grades:read"]), getGrades);
router.get("/grades/:id", authorize(["grades:read"]), getGradeById);
router.post(
  "/grades",
  authorize(["grades:create"]),
  validateGrade,
  createGrade,
);
router.put(
  "/grades/:id",
  authorize(["grades:update"]),
  validateGradeUpdate,
  updateGrade,
);
router.delete("/grades/:id", authorize(["grades:delete"]), deleteGrade);

// Grading Scale Routes
router.get(
  "/grading-scales",
  authorize(["grading-scales:read"]),
  getGradingScales,
);
router.post(
  "/grading-scales",
  authorize(["grading-scales:create"]),
  validateGradingScale,
  createGradingScale,
);

// Export Routes
router.get("/export/grades", authorize(["grades:read"]), exportGrades);
router.get(
  "/export/examinations",
  authorize(["examinations:read"]),
  exportExaminations,
);

module.exports = router;
