const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Validation rules
const validateCourse = [
  body('courseCode').notEmpty().withMessage('Course code is required'),
  body('courseName').notEmpty().withMessage('Course name is required'),
  body('description').optional().isString(),
  body('credits').optional().isInt({ min: 0 }),
];

const validateSubject = [
  body('subjectName').notEmpty().withMessage('Subject name is required'),
  body('subjectCode').optional().isString(),
  body('subjectLevel').isIn(['PRIMARY', 'O_LEVEL', 'A_LEVEL', 'UNIVERSITY']).withMessage('Invalid subject level'),
  body('subjectType').isIn(['CORE', 'OPTIONAL', 'COMBINATION']).withMessage('Invalid subject type'),
  body('description').optional().isString(),
  body('credits').optional().isInt({ min: 0 }),
];

const validateTeacherSubject = [
  body('teacherId').notEmpty().withMessage('Teacher ID is required'),
  body('subjectId').notEmpty().withMessage('Subject ID is required'),
];

const validateAcademicYear = [
  body('yearName').notEmpty().withMessage('Year name is required'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').isISO8601().withMessage('End date must be a valid date'),
  body('isCurrent').optional().isBoolean(),
];

const validateClass = [
  body('className').notEmpty().withMessage('Class name is required'),
  body('classCode').notEmpty().withMessage('Class code is required'),
  body('academicLevel').isIn(['PRIMARY', 'O_LEVEL', 'A_LEVEL', 'UNIVERSITY']).withMessage('Invalid academic level'),
  body('academicYearId').notEmpty().withMessage('Academic year is required'),
  body('capacity').isInt({ min: 1, max: 100 }).withMessage('Capacity must be between 1 and 100'),
  body('teacherId').notEmpty().withMessage('Class teacher is required'),
  body('subjectIds').isArray({ min: 1 }).withMessage('At least one subject is required'),
];

// Course Management
const getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      tenantId: req.tenantId
    };

    if (search) {
      where.OR = [
        { courseCode: { contains: search, mode: 'insensitive' } },
        { courseName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          tenant: true,
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          updatedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          courseSubjects: {
            include: {
              subject: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.course.count({ where })
    ]);

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get courses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { courseCode, courseName, description, credits, subjectIds } = req.body;

    // Check if course code already exists in tenant
    const existingCourse = await prisma.course.findFirst({
      where: { 
        tenantId: req.tenantId,
        courseCode: courseCode
      }
    });

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: 'Course with this code already exists in this tenant'
      });
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        courseCode,
        courseName,
        description,
        credits: credits || 0,
        tenantId: req.tenantId,
        createdBy: req.user.id,
        updatedBy: req.user.id
      },
      include: {
        tenant: true,
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Add subjects to course if provided
    if (subjectIds && subjectIds.length > 0) {
      await prisma.courseSubject.createMany({
        data: subjectIds.map(subjectId => ({
          courseId: course.id,
          subjectId: subjectId,
          tenantId: req.tenantId
        }))
      });
    }

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const updateCourse = async (req, res) => {
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
    const { courseCode, courseName, description, credits, status } = req.body;

    // Check if course exists and belongs to tenant
    const existingCourse = await prisma.course.findFirst({
      where: { 
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if new course code conflicts
    if (courseCode !== existingCourse.courseCode) {
      const codeConflict = await prisma.course.findFirst({
        where: { 
          tenantId: req.tenantId,
          courseCode: courseCode,
          id: { not: id }
        }
      });

      if (codeConflict) {
        return res.status(409).json({
          success: false,
          message: 'Course with this code already exists in this tenant'
        });
      }
    }

    // Update course
    const course = await prisma.course.update({
      where: { id },
      data: {
        courseCode,
        courseName,
        description,
        credits: credits || 0,
        status,
        updatedBy: req.user.id
      },
      include: {
        tenant: true,
        updatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findFirst({
      where: { 
        id: id,
        tenantId: req.tenantId
      },
      include: {
        tenant: true,
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        updatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        courseSubjects: {
          include: {
            subject: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course exists and belongs to tenant
    const existingCourse = await prisma.course.findFirst({
      where: { 
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Delete course (cascade will handle related records)
    await prisma.course.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Subject Management
const getSubjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, subjectLevel, subjectType } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      tenantId: req.tenantId
    };

    if (search) {
      where.OR = [
        { subjectName: { contains: search, mode: 'insensitive' } },
        { subjectCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (subjectLevel) {
      where.subjectLevel = subjectLevel;
    }

    if (subjectType) {
      where.subjectType = subjectType;
    }

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          tenant: true,
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          updatedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          teacherSubjects: {
            include: {
              teacher: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.subject.count({ where })
    ]);

    res.json({
      success: true,
      data: subjects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subjects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const createSubject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { subjectName, subjectCode, subjectLevel, subjectType, description, credits } = req.body;

    // Check if subject with same name and level already exists in tenant
    const existingSubject = await prisma.subject.findFirst({
      where: { 
        tenantId: req.tenantId,
        subjectName: subjectName,
        subjectLevel: subjectLevel
      }
    });

    if (existingSubject) {
      return res.status(409).json({
        success: false,
        message: 'Subject with this name and level already exists in this tenant'
      });
    }

    // Create subject
    const subject = await prisma.subject.create({
      data: {
        subjectName,
        subjectCode,
        subjectLevel,
        subjectType,
        description,
        credits: credits || 0,
        tenantId: req.tenantId,
        createdBy: req.user.id,
        updatedBy: req.user.id
      },
      include: {
        tenant: true,
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subject',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const updateSubject = async (req, res) => {
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
    const { subjectName, subjectCode, subjectLevel, subjectType, description, credits, status } = req.body;

    // Check if subject exists and belongs to tenant
    const existingSubject = await prisma.subject.findFirst({
      where: { 
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if new subject name and level conflicts
    if (subjectName !== existingSubject.subjectName || subjectLevel !== existingSubject.subjectLevel) {
      const nameConflict = await prisma.subject.findFirst({
        where: { 
          tenantId: req.tenantId,
          subjectName: subjectName,
          subjectLevel: subjectLevel,
          id: { not: id }
        }
      });

      if (nameConflict) {
        return res.status(409).json({
          success: false,
          message: 'Subject with this name and level already exists in this tenant'
        });
      }
    }

    // Update subject
    const subject = await prisma.subject.update({
      where: { id },
      data: {
        subjectName,
        subjectCode,
        subjectLevel,
        subjectType,
        description,
        credits: credits || 0,
        status,
        updatedBy: req.user.id
      },
      include: {
        tenant: true,
        updatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Subject updated successfully',
      data: subject
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subject',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findFirst({
      where: { 
        id: id,
        tenantId: req.tenantId
      },
      include: {
        tenant: true,
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        updatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        teacherSubjects: {
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Get subject by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subject',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subject exists and belongs to tenant
    const existingSubject = await prisma.subject.findFirst({
      where: { 
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingSubject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Delete subject (cascade will handle related records)
    await prisma.subject.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subject',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Teacher-Subject Assignment
const getTeacherSubjects = async (req, res) => {
  try {
    const { teacherId, subjectId } = req.query;

    const where = {
      tenantId: req.tenantId
    };

    if (teacherId) {
      where.teacherId = teacherId;
    }

    if (subjectId) {
      where.subjectId = subjectId;
    }

    const teacherSubjects = await prisma.teacherSubject.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        subject: true
      },
      orderBy: { assignedAt: 'desc' }
    });

    res.json({
      success: true,
      data: teacherSubjects
    });
  } catch (error) {
    console.error('Get teacher subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get teacher-subject assignments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const assignTeacherToSubject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { teacherId, subjectId } = req.body;

    // Check if teacher exists and belongs to tenant
    const teacher = await prisma.user.findFirst({
      where: { 
        id: teacherId,
        tenantId: req.tenantId
      }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Check if subject exists and belongs to tenant
    const subject = await prisma.subject.findFirst({
      where: { 
        id: subjectId,
        tenantId: req.tenantId
      }
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.teacherSubject.findFirst({
      where: {
        tenantId: req.tenantId,
        teacherId: teacherId,
        subjectId: subjectId
      }
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: 'Teacher is already assigned to this subject'
      });
    }

    // Create assignment
    const assignment = await prisma.teacherSubject.create({
      data: {
        teacherId,
        subjectId,
        tenantId: req.tenantId,
        assignedBy: req.user.id
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        subject: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Teacher assigned to subject successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Assign teacher to subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign teacher to subject',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const removeTeacherFromSubject = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if assignment exists and belongs to tenant
    const existingAssignment = await prisma.teacherSubject.findFirst({
      where: { 
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        message: 'Teacher-subject assignment not found'
      });
    }

    // Delete assignment
    await prisma.teacherSubject.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Teacher removed from subject successfully'
    });
  } catch (error) {
    console.error('Remove teacher from subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove teacher from subject',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Academic Year Management
const getAcademicYears = async (req, res) => {
  try {
    const academicYears = await prisma.academicYear.findMany({
      where: {
        tenantId: req.tenantId
      },
      include: {
        tenant: true
      },
      orderBy: { startDate: 'desc' }
    });

    res.json({
      success: true,
      data: academicYears
    });
  } catch (error) {
    console.error('Get academic years error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get academic years',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const createAcademicYear = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { yearName, startDate, endDate, isCurrent } = req.body;

    // Check if academic year with same name already exists in tenant
    const existingYear = await prisma.academicYear.findFirst({
      where: { 
        tenantId: req.tenantId,
        yearName: yearName
      }
    });

    if (existingYear) {
      return res.status(409).json({
        success: false,
        message: 'Academic year with this name already exists in this tenant'
      });
    }

    // If this is set as current, unset other current years
    if (isCurrent) {
      await prisma.academicYear.updateMany({
        where: {
          tenantId: req.tenantId,
          isCurrent: true
        },
        data: {
          isCurrent: false
        }
      });
    }

    // Create academic year
    const academicYear = await prisma.academicYear.create({
      data: {
        yearName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent: isCurrent || false,
        tenantId: req.tenantId
      },
      include: {
        tenant: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Academic year created successfully',
      data: academicYear
    });
  } catch (error) {
    console.error('Create academic year error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create academic year',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const updateAcademicYear = async (req, res) => {
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
    const { yearName, startDate, endDate, isCurrent, status } = req.body;

    // Check if academic year exists and belongs to tenant
    const existingYear = await prisma.academicYear.findFirst({
      where: { 
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingYear) {
      return res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
    }

    // If this is set as current, unset other current years
    if (isCurrent) {
      await prisma.academicYear.updateMany({
        where: {
          tenantId: req.tenantId,
          isCurrent: true,
          id: { not: id }
        },
        data: {
          isCurrent: false
        }
      });
    }

    // Update academic year
    const academicYear = await prisma.academicYear.update({
      where: { id },
      data: {
        yearName,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isCurrent,
        status
      },
      include: {
        tenant: true
      }
    });

    res.json({
      success: true,
      message: 'Academic year updated successfully',
      data: academicYear
    });
  } catch (error) {
    console.error('Update academic year error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update academic year',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const deleteAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if academic year exists and belongs to tenant
    const existingYear = await prisma.academicYear.findFirst({
      where: { 
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingYear) {
      return res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
    }

    // Delete academic year
    await prisma.academicYear.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Academic year deleted successfully'
    });
  } catch (error) {
    console.error('Delete academic year error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete academic year',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Class Management
const getClasses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, academicLevel, academicYearId } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      tenantId: req.tenantId
    };

    if (search) {
      where.OR = [
        { className: { contains: search, mode: 'insensitive' } },
        { classCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (academicLevel) {
      where.academicLevel = academicLevel;
    }

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          tenant: true,
          academicYear: true,
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          updatedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          classSubjects: {
            include: {
              subject: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.class.count({ where })
    ]);

    res.json({
      success: true,
      data: classes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get classes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const classData = await prisma.class.findFirst({
      where: { 
        id: id,
        tenantId: req.tenantId
      },
      include: {
        tenant: true,
        academicYear: true,
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        updatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        classSubjects: {
          include: {
            subject: true
          }
        }
      }
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: classData
    });
  } catch (error) {
    console.error('Get class by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get class',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const createClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { className, classCode, academicLevel, academicYearId, capacity, teacherId, subjectIds, description } = req.body;

    // Check if class code already exists in tenant
    const existingClass = await prisma.class.findFirst({
      where: { 
        tenantId: req.tenantId,
        classCode: classCode
      }
    });

    if (existingClass) {
      return res.status(409).json({
        success: false,
        message: 'Class with this code already exists in this tenant'
      });
    }

    // Check if academic year exists
    const academicYear = await prisma.academicYear.findFirst({
      where: {
        id: academicYearId,
        tenantId: req.tenantId
      }
    });

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
    }

    // Check if teacher exists
    const teacher = await prisma.user.findFirst({
      where: {
        id: teacherId,
        tenantId: req.tenantId
      }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Create class
    const classData = await prisma.class.create({
      data: {
        className,
        classCode,
        academicLevel,
        academicYearId,
        capacity,
        teacherId,
        description,
        tenantId: req.tenantId,
        createdBy: req.user.id,
        updatedBy: req.user.id
      },
      include: {
        tenant: true,
        academicYear: true,
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Add subjects to class if provided
    if (subjectIds && subjectIds.length > 0) {
      await prisma.classSubject.createMany({
        data: subjectIds.map(subjectId => ({
          classId: classData.id,
          subjectId: subjectId,
          tenantId: req.tenantId
        }))
      });
    }

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: classData
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create class',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const updateClass = async (req, res) => {
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
    const { className, classCode, academicLevel, academicYearId, capacity, teacherId, subjectIds, description, status } = req.body;

    // Check if class exists and belongs to tenant
    const existingClass = await prisma.class.findFirst({
      where: { 
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if new class code conflicts
    if (classCode !== existingClass.classCode) {
      const codeConflict = await prisma.class.findFirst({
        where: { 
          tenantId: req.tenantId,
          classCode: classCode,
          id: { not: id }
        }
      });

      if (codeConflict) {
        return res.status(409).json({
          success: false,
          message: 'Class with this code already exists in this tenant'
        });
      }
    }

    // Update class
    const classData = await prisma.class.update({
      where: { id },
      data: {
        className,
        classCode,
        academicLevel,
        academicYearId,
        capacity,
        teacherId,
        description,
        status,
        updatedBy: req.user.id
      },
      include: {
        tenant: true,
        academicYear: true,
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        updatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Update subjects if provided
    if (subjectIds) {
      // Remove existing subjects
      await prisma.classSubject.deleteMany({
        where: {
          classId: id,
          tenantId: req.tenantId
        }
      });

      // Add new subjects
      if (subjectIds.length > 0) {
        await prisma.classSubject.createMany({
          data: subjectIds.map(subjectId => ({
            classId: id,
            subjectId: subjectId,
            tenantId: req.tenantId
          }))
        });
      }
    }

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: classData
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update class',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if class exists and belongs to tenant
    const existingClass = await prisma.class.findFirst({
      where: { 
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Delete class (cascade will handle related records)
    await prisma.class.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete class',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  // Course management
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  validateCourse,
  
  // Subject management
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  validateSubject,
  
  // Teacher-Subject assignment
  getTeacherSubjects,
  assignTeacherToSubject,
  removeTeacherFromSubject,
  validateTeacherSubject,
  
  // Academic Year management
  getAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  validateAcademicYear,
  
  // Class management
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  validateClass
};


