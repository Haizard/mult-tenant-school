const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// NECTA Compliance Service (simplified version for backend)
const calculateGrade = (percentage, examLevel) => {
  const gradingScales = {
    PRIMARY: [
      { grade: 'A', min: 80, max: 100, points: 7 },
      { grade: 'B', min: 60, max: 79, points: 5 },
      { grade: 'C', min: 40, max: 59, points: 3 },
      { grade: 'D', min: 20, max: 39, points: 1 },
      { grade: 'F', min: 0, max: 19, points: 0 }
    ],
    O_LEVEL: [
      { grade: 'A', min: 80, max: 100, points: 7 },
      { grade: 'B', min: 60, max: 79, points: 5 },
      { grade: 'C', min: 40, max: 59, points: 3 },
      { grade: 'D', min: 20, max: 39, points: 1 },
      { grade: 'F', min: 0, max: 19, points: 0 }
    ],
    A_LEVEL: [
      { grade: 'A', min: 80, max: 100, points: 7 },
      { grade: 'B', min: 60, max: 79, points: 5 },
      { grade: 'C', min: 40, max: 59, points: 3 },
      { grade: 'D', min: 20, max: 39, points: 1 },
      { grade: 'F', min: 0, max: 19, points: 0 }
    ],
    UNIVERSITY: [
      { grade: 'A+', min: 90, max: 100, points: 4.0 },
      { grade: 'A', min: 80, max: 89, points: 3.7 },
      { grade: 'B+', min: 75, max: 79, points: 3.3 },
      { grade: 'B', min: 70, max: 74, points: 3.0 },
      { grade: 'C+', min: 65, max: 69, points: 2.7 },
      { grade: 'C', min: 60, max: 64, points: 2.3 },
      { grade: 'D', min: 50, max: 59, points: 2.0 },
      { grade: 'F', min: 0, max: 49, points: 0 }
    ]
  };

  const gradingScale = gradingScales[examLevel] || gradingScales.O_LEVEL;
  const gradeRange = gradingScale.find(range => 
    percentage >= range.min && percentage <= range.max
  );
  
  if (gradeRange) {
    return {
      grade: gradeRange.grade,
      points: gradeRange.points
    };
  }
  
  return {
    grade: 'F',
    points: 0
  };
};

// Validation rules
const validateExamination = [
  body('examName').notEmpty().withMessage('Exam name is required'),
  body('examType').isIn(['QUIZ', 'MID_TERM', 'FINAL', 'MOCK', 'NECTA', 'ASSIGNMENT', 'PROJECT']).withMessage('Invalid exam type'),
  body('examLevel').isIn(['PRIMARY', 'O_LEVEL', 'A_LEVEL', 'UNIVERSITY']).withMessage('Invalid exam level'),
  body('subjectId').optional().isString(),
  body('academicYearId').optional().isString(),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('maxMarks').optional().isInt({ min: 1 }).withMessage('Max marks must be a positive integer'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('description').optional().isString(),
];

const validateGrade = [
  body('examinationId').notEmpty().withMessage('Examination ID is required'),
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('subjectId').notEmpty().withMessage('Subject ID is required'),
  body('rawMarks').isFloat({ min: 0 }).withMessage('Raw marks must be a non-negative number'),
  body('comments').optional().isString(),
];

const validateGradeUpdate = [
  body('rawMarks').isFloat({ min: 0 }).withMessage('Raw marks must be a non-negative number'),
  body('comments').optional().isString(),
  body('status').optional().isIn(['DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).withMessage('Invalid status'),
];

const validateGradingScale = [
  body('scaleName').notEmpty().withMessage('Scale name is required'),
  body('examLevel').isIn(['PRIMARY', 'O_LEVEL', 'A_LEVEL', 'UNIVERSITY']).withMessage('Invalid exam level'),
  body('gradeRanges').isArray().withMessage('Grade ranges must be an array'),
  body('gradeRanges.*.grade').notEmpty().withMessage('Grade is required'),
  body('gradeRanges.*.min').isFloat({ min: 0, max: 100 }).withMessage('Min percentage must be between 0 and 100'),
  body('gradeRanges.*.max').isFloat({ min: 0, max: 100 }).withMessage('Max percentage must be between 0 and 100'),
  body('gradeRanges.*.points').optional().isFloat({ min: 0 }).withMessage('Points must be a positive number'),
];

// Examination Management
const getExaminations = async (req, res) => {
  try {
    const { examType, examLevel, subjectId, academicYearId, status } = req.query;
    
    const where = {
      tenantId: req.tenantId,
      ...(examType && { examType }),
      ...(examLevel && { examLevel }),
      ...(subjectId && { subjectId }),
      ...(academicYearId && { academicYearId }),
      ...(status && { status }),
    };

    const examinations = await prisma.examination.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectCode: true,
            subjectLevel: true,
            subjectType: true,
          }
        },
        academicYear: {
          select: {
            id: true,
            yearName: true,
            isCurrent: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        _count: {
          select: {
            grades: true,
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    res.json({
      success: true,
      data: examinations
    });
  } catch (error) {
    console.error('Get examinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get examinations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getExaminationById = async (req, res) => {
  try {
    const { id } = req.params;

    const examination = await prisma.examination.findFirst({
      where: {
        id: id,
        tenantId: req.tenantId
      },
      include: {
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectCode: true,
            subjectLevel: true,
            subjectType: true,
          }
        },
        academicYear: {
          select: {
            id: true,
            yearName: true,
            isCurrent: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        grades: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            },
            subject: {
              select: {
                id: true,
                subjectName: true,
                subjectCode: true,
              }
            }
          }
        },
        _count: {
          select: {
            grades: true
          }
        }
      }
    });

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: 'Examination not found'
      });
    }

    res.json({
      success: true,
      data: examination
    });
  } catch (error) {
    console.error('Get examination by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get examination',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const createExamination = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      examName,
      examType,
      examLevel,
      subjectId,
      academicYearId,
      startDate,
      endDate,
      maxMarks,
      weight,
      description
    } = req.body;

    // Check if examination with same name and type already exists in tenant
    const existingExam = await prisma.examination.findFirst({
      where: {
        tenantId: req.tenantId,
        examName: examName,
        examType: examType
      }
    });

    if (existingExam) {
      return res.status(409).json({
        success: false,
        message: 'Examination with this name and type already exists in this tenant'
      });
    }

    // Create examination
    const examination = await prisma.examination.create({
      data: {
        examName,
        examType,
        examLevel,
        subjectId: subjectId || null,
        academicYearId: academicYearId || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        maxMarks: maxMarks || 100,
        weight: weight || 1.0,
        description,
        tenantId: req.tenantId,
        createdBy: req.user.id,
        updatedBy: req.user.id
      },
      include: {
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectCode: true,
            subjectLevel: true,
            subjectType: true,
          }
        },
        academicYear: {
          select: {
            id: true,
            yearName: true,
            isCurrent: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Examination created successfully',
      data: examination
    });
  } catch (error) {
    console.error('Create examination error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create examination',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const updateExamination = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const {
      examName,
      examType,
      examLevel,
      subjectId,
      academicYearId,
      startDate,
      endDate,
      maxMarks,
      weight,
      description,
      status
    } = req.body;

    // Check if examination exists
    const existingExam = await prisma.examination.findFirst({
      where: {
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingExam) {
      return res.status(404).json({
        success: false,
        message: 'Examination not found'
      });
    }

    // Update examination
    const examination = await prisma.examination.update({
      where: { id: id },
      data: {
        ...(examName && { examName }),
        ...(examType && { examType }),
        ...(examLevel && { examLevel }),
        ...(subjectId !== undefined && { subjectId: subjectId || null }),
        ...(academicYearId !== undefined && { academicYearId: academicYearId || null }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(maxMarks !== undefined && { maxMarks }),
        ...(weight !== undefined && { weight }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        updatedBy: req.user.id
      },
      include: {
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectCode: true,
            subjectLevel: true,
            subjectType: true,
          }
        },
        academicYear: {
          select: {
            id: true,
            yearName: true,
            isCurrent: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Examination updated successfully',
      data: examination
    });
  } catch (error) {
    console.error('Update examination error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update examination',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const deleteExamination = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if examination exists
    const existingExam = await prisma.examination.findFirst({
      where: {
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingExam) {
      return res.status(404).json({
        success: false,
        message: 'Examination not found'
      });
    }

    // Delete examination (grades will be cascade deleted)
    await prisma.examination.delete({
      where: { id: id }
    });

    res.json({
      success: true,
      message: 'Examination deleted successfully'
    });
  } catch (error) {
    console.error('Delete examination error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete examination',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Grade Management
const getGrades = async (req, res) => {
  try {
    const { examinationId, studentId, subjectId, status, page, limit } = req.query;
    
    const where = {
      tenantId: req.tenantId,
      ...(examinationId && { examinationId }),
      ...(studentId && { studentId }),
      ...(subjectId && { subjectId }),
      ...(status && { status }),
    };

    const grades = await prisma.grade.findMany({
      where,
      include: {
        examination: {
          select: {
            id: true,
            examName: true,
            examType: true,
            examLevel: true,
            maxMarks: true,
            weight: true,
            status: true,
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectCode: true,
            subjectLevel: true,
            subjectType: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: grades,
      pagination: {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        total: grades.length
      }
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grades',
      error: error.message
    });
  }
};

const getGradeById = async (req, res) => {
  try {
    const { id } = req.params;

    const grade = await prisma.grade.findFirst({
      where: {
        id: id,
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
            weight: true,
            status: true,
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectCode: true,
            subjectLevel: true,
            subjectType: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    res.json({
      success: true,
      data: grade
    });
  } catch (error) {
    console.error('Get grade by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get grade',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const createGrade = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      examinationId,
      studentId,
      subjectId,
      rawMarks,
      comments
    } = req.body;

    // Check if examination exists
    const examination = await prisma.examination.findFirst({
      where: {
        id: examinationId,
        tenantId: req.tenantId
      }
    });

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: 'Examination not found'
      });
    }

    // Check if grade already exists for this student, examination, and subject
    const existingGrade = await prisma.grade.findFirst({
      where: {
        tenantId: req.tenantId,
        examinationId: examinationId,
        studentId: studentId,
        subjectId: subjectId
      }
    });

    if (existingGrade) {
      return res.status(409).json({
        success: false,
        message: 'Grade already exists for this student, examination, and subject'
      });
    }

    // Calculate percentage and grade using NECTA compliance
    const percentage = (rawMarks / examination.maxMarks) * 100;
    const { grade, points } = calculateGrade(percentage, examination.examLevel);

    // Create grade
    const newGrade = await prisma.grade.create({
      data: {
        examinationId,
        studentId,
        subjectId,
        rawMarks,
        percentage,
        grade,
        points,
        comments,
        tenantId: req.tenantId,
        createdBy: req.user.id,
        updatedBy: req.user.id
      },
      include: {
        examination: {
          select: {
            id: true,
            examName: true,
            examType: true,
            examLevel: true,
            maxMarks: true,
            weight: true,
            status: true,
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectCode: true,
            subjectLevel: true,
            subjectType: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Grade created successfully',
      data: newGrade
    });
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create grade',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const updateGrade = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const {
      rawMarks,
      comments,
      status
    } = req.body;

    // Check if grade exists
    const existingGrade = await prisma.grade.findFirst({
      where: {
        id: id,
        tenantId: req.tenantId
      },
      include: {
        examination: true
      }
    });

    if (!existingGrade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Calculate new percentage and grade if rawMarks changed
    let percentage = existingGrade.percentage;
    let grade = existingGrade.grade;
    let points = existingGrade.points;

    if (rawMarks !== undefined) {
      percentage = (rawMarks / existingGrade.examination.maxMarks) * 100;
      const calculatedGrade = calculateGrade(percentage, existingGrade.examination.examLevel);
      grade = calculatedGrade.grade;
      points = calculatedGrade.points;
    }

    // Update grade
    const updatedGrade = await prisma.grade.update({
      where: { id: id },
      data: {
        ...(rawMarks !== undefined && { rawMarks }),
        ...(rawMarks !== undefined && { percentage }),
        ...(rawMarks !== undefined && { grade }),
        ...(rawMarks !== undefined && { points }),
        ...(comments !== undefined && { comments }),
        ...(status && { status }),
        updatedBy: req.user.id
      },
      include: {
        examination: {
          select: {
            id: true,
            examName: true,
            examType: true,
            examLevel: true,
            maxMarks: true,
            weight: true,
            status: true,
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectCode: true,
            subjectLevel: true,
            subjectType: true,
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Grade updated successfully',
      data: updatedGrade
    });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update grade',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if grade exists
    const existingGrade = await prisma.grade.findFirst({
      where: {
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingGrade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Delete grade
    await prisma.grade.delete({
      where: { id: id }
    });

    res.json({
      success: true,
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete grade',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Grading Scale Management
const getGradingScales = async (req, res) => {
  try {
    const { examLevel } = req.query;
    
    const where = {
      tenantId: req.tenantId,
      ...(examLevel && { examLevel }),
    };

    const gradingScales = await prisma.gradingScale.findMany({
      where,
      include: {
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { scaleName: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: gradingScales
    });
  } catch (error) {
    console.error('Get grading scales error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get grading scales',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const createGradingScale = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      scaleName,
      examLevel,
      gradeRanges,
      isDefault
    } = req.body;

    // Check if grading scale with same name and level already exists in tenant
    const existingScale = await prisma.gradingScale.findFirst({
      where: {
        tenantId: req.tenantId,
        scaleName: scaleName,
        examLevel: examLevel
      }
    });

    if (existingScale) {
      return res.status(409).json({
        success: false,
        message: 'Grading scale with this name and level already exists in this tenant'
      });
    }

    // If this is set as default, unset other default scales for this level
    if (isDefault) {
      await prisma.gradingScale.updateMany({
        where: {
          tenantId: req.tenantId,
          examLevel: examLevel,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      });
    }

    // Create grading scale
    const gradingScale = await prisma.gradingScale.create({
      data: {
        scaleName,
        examLevel,
        gradeRanges,
        isDefault: isDefault || false,
        tenantId: req.tenantId,
        createdBy: req.user.id,
        updatedBy: req.user.id
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Grading scale created successfully',
      data: gradingScale
    });
  } catch (error) {
    console.error('Create grading scale error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create grading scale',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Export Grades to CSV/Excel
const exportGrades = async (req, res) => {
  try {
    const { format = 'csv', examinationId, subjectId, academicYearId } = req.query;
    
    const where = {
      tenantId: req.tenantId,
      ...(examinationId && { examinationId }),
      ...(subjectId && { subjectId }),
    };

    // If academicYearId is provided, filter by examination's academic year
    if (academicYearId) {
      where.examination = {
        academicYearId: academicYearId
      };
    }

    const grades = await prisma.grade.findMany({
      where,
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        examination: {
          select: {
            examName: true,
            examType: true,
            examLevel: true,
            maxMarks: true,
            startDate: true,
          }
        },
        subject: {
          select: {
            subjectName: true,
            subjectCode: true,
          }
        },
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: [
        { examination: { startDate: 'desc' } },
        { student: { lastName: 'asc' } },
        { student: { firstName: 'asc' } }
      ]
    });

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Student Name',
        'Student Email', 
        'Examination',
        'Subject',
        'Raw Marks',
        'Max Marks',
        'Percentage',
        'Grade',
        'Points',
        'Status',
        'Exam Date',
        'Comments',
        'Graded By'
      ];

      const csvRows = grades.map(grade => [
        `${grade.student.firstName} ${grade.student.lastName}`,
        grade.student.email,
        grade.examination.examName,
        grade.subject.subjectName,
        grade.rawMarks,
        grade.examination.maxMarks,
        grade.percentage.toFixed(1),
        grade.grade || '',
        grade.points || '',
        grade.status,
        new Date(grade.examination.startDate).toLocaleDateString(),
        grade.comments || '',
        grade.createdByUser ? `${grade.createdByUser.firstName} ${grade.createdByUser.lastName}` : ''
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=grades-export-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    } else {
      // Return JSON for other formats (can be extended for Excel)
      res.json({
        success: true,
        data: grades,
        count: grades.length
      });
    }
  } catch (error) {
    console.error('Export grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export grades',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Export Examinations to CSV/Excel
const exportExaminations = async (req, res) => {
  try {
    const { format = 'csv', academicYearId, subjectId, examType } = req.query;
    
    const where = {
      tenantId: req.tenantId,
      ...(academicYearId && { academicYearId }),
      ...(subjectId && { subjectId }),
      ...(examType && { examType }),
    };

    const examinations = await prisma.examination.findMany({
      where,
      include: {
        subject: {
          select: {
            subjectName: true,
            subjectCode: true,
          }
        },
        academicYear: {
          select: {
            yearName: true,
          }
        },
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        _count: {
          select: {
            grades: true
          }
        }
      },
      orderBy: [
        { startDate: 'desc' },
        { examName: 'asc' }
      ]
    });

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Examination Name',
        'Type',
        'Level',
        'Subject',
        'Academic Year',
        'Start Date',
        'End Date',
        'Max Marks',
        'Weight',
        'Status',
        'Total Grades',
        'Created By'
      ];

      const csvRows = examinations.map(exam => [
        exam.examName,
        exam.examType.replace('_', ' '),
        exam.examLevel.replace('_', '-'),
        exam.subject ? exam.subject.subjectName : 'All Subjects',
        exam.academicYear ? exam.academicYear.yearName : '',
        new Date(exam.startDate).toLocaleDateString(),
        exam.endDate ? new Date(exam.endDate).toLocaleDateString() : '',
        exam.maxMarks,
        exam.weight,
        exam.status,
        exam._count.grades,
        exam.createdByUser ? `${exam.createdByUser.firstName} ${exam.createdByUser.lastName}` : ''
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=examinations-export-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    } else {
      // Return JSON for other formats
      res.json({
        success: true,
        data: examinations,
        count: examinations.length
      });
    }
  } catch (error) {
    console.error('Export examinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export examinations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
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
};
