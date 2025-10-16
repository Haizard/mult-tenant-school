const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Validation rules
const validateParent = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('relationship').isIn(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER']).withMessage('Invalid relationship'),
];

const validateParentRelation = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('relationship').isIn(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER']).withMessage('Invalid relationship'),
];

// Parent Management
const getParents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, relationship } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      tenantId: req.tenantId
    };

    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (relationship) {
      where.relationship = relationship;
    }

    const [parents, total] = await Promise.all([
      prisma.parent.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          tenant: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              status: true
            }
          },
          parentRelations: {
            include: {
              student: {
                include: {
                  user: {
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
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.parent.count({ where })
    ]);

    res.json({
      success: true,
      data: parents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get parents',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const createParent = async (req, res) => {
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
      userId,
      occupation,
      workplace,
      workPhone,
      education,
      relationship,
      isPrimary,
      isEmergency
    } = req.body;

    // Check if user exists and belongs to tenant
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: req.tenantId
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if parent already exists for this user
    const existingParent = await prisma.parent.findFirst({
      where: {
        userId: userId,
        tenantId: req.tenantId
      }
    });

    if (existingParent) {
      return res.status(409).json({
        success: false,
        message: 'Parent profile already exists for this user'
      });
    }

    // Create parent
    const parent = await prisma.parent.create({
      data: {
        tenantId: req.tenantId,
        userId,
        occupation,
        workplace,
        workPhone,
        education,
        relationship,
        isPrimary: isPrimary || false,
        isEmergency: isEmergency || false
      },
      include: {
        tenant: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Parent created successfully',
      data: parent
    });
  } catch (error) {
    console.error('Create parent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create parent',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getParentById = async (req, res) => {
  try {
    const { id } = req.params;

    const parent = await prisma.parent.findFirst({
      where: {
        id: id,
        tenantId: req.tenantId
      },
      include: {
        tenant: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true
          }
        },
        parentRelations: {
          include: {
            student: {
              include: {
                user: {
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
        }
      }
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    res.json({
      success: true,
      data: parent
    });
  } catch (error) {
    console.error('Get parent by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get parent',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const updateParent = async (req, res) => {
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
    const updateData = { ...req.body };

    // Check if parent exists and belongs to tenant
    const existingParent = await prisma.parent.findFirst({
      where: {
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingParent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // Update parent
    const parent = await prisma.parent.update({
      where: { id },
      data: updateData,
      include: {
        tenant: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Parent updated successfully',
      data: parent
    });
  } catch (error) {
    console.error('Update parent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update parent',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const deleteParent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if parent exists and belongs to tenant
    const existingParent = await prisma.parent.findFirst({
      where: {
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingParent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // Delete parent (cascade will handle related records)
    await prisma.parent.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Parent deleted successfully'
    });
  } catch (error) {
    console.error('Delete parent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete parent',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Parent-Student Relationship Management
const getParentStudents = async (req, res) => {
  try {
    const { id } = req.params;

    const relations = await prisma.parentStudentRelation.findMany({
      where: {
        parentId: id,
        tenantId: req.tenantId
      },
      include: {
        student: {
          include: {
            user: {
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
    });

    res.json({
      success: true,
      data: relations
    });
  } catch (error) {
    console.error('Get parent students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get parent students',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const createParentRelation = async (req, res) => {
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
    const { studentId, relationship, isPrimary, isEmergency, canPickup, notes } = req.body;

    // Check if parent exists
    const parent = await prisma.parent.findFirst({
      where: {
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // Check if student exists
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        tenantId: req.tenantId
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if relation already exists
    const existingRelation = await prisma.parentStudentRelation.findFirst({
      where: {
        tenantId: req.tenantId,
        parentId: id,
        studentId: studentId
      }
    });

    if (existingRelation) {
      return res.status(409).json({
        success: false,
        message: 'Parent-student relationship already exists'
      });
    }

    // Create relation
    const relation = await prisma.parentStudentRelation.create({
      data: {
        tenantId: req.tenantId,
        parentId: id,
        studentId,
        relationship,
        isPrimary: isPrimary || false,
        isEmergency: isEmergency || false,
        canPickup: canPickup || false,
        notes
      },
      include: {
        student: {
          include: {
            user: {
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

    res.status(201).json({
      success: true,
      message: 'Parent-student relationship created successfully',
      data: relation
    });
  } catch (error) {
    console.error('Create parent relation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create parent-student relationship',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Parent Portal Methods (for parents to view their children's data)
const getChildAcademicRecords = async (req, res) => {
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

    const records = await prisma.studentAcademicRecord.findMany({
      where: {
        studentId: studentId,
        tenantId: req.tenantId
      },
      include: {
        academicYear: true,
        class: true,
        subject: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Get child academic records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get child academic records',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getChildAttendance = async (req, res) => {
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

    const attendance = await prisma.attendance.findMany({
      where: {
        studentId: studentId,
        tenantId: req.tenantId
      },
      include: {
        class: true,
        subject: true
      },
      orderBy: { date: 'desc' },
      take: 30 // Last 30 attendance records
    });

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Get child attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get child attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Additional methods would be implemented here...

module.exports = {
  // Parent management
  getParents,
  createParent,
  getParentById,
  updateParent,
  deleteParent,
  validateParent,
  
  // Parent-student relationships
  getParentStudents,
  createParentRelation,
  validateParentRelation,
  
  // Parent portal
  getChildAcademicRecords,
  getChildAttendance,
  getChildGrades,
  getChildSchedule,
  getChildHealthRecords,
  getParentStatistics,
  updateParentRelation: async (req, res) => {
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
  },

  deleteParentRelation: async (req, res) => {
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
  },
  
  getChildGrades: async (req, res) => {
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
  },

  getChildSchedule: async (req, res) => {
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
  },

  getChildHealthRecords: async (req, res) => {
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

      const healthRecords = await prisma.healthRecord.findMany({
        where: {
          studentId: studentId,
          tenantId: req.tenantId
        },
        orderBy: { recordDate: 'desc' }
      });

      res.json({
        success: true,
        data: healthRecords
      });
    } catch (error) {
      console.error('Get child health records error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get child health records',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  },

  getParentStatistics: async (req, res) => {
    try {
      const { id } = req.params;

      // Verify parent exists and belongs to this tenant
      const parent = await prisma.parent.findFirst({
        where: {
          id: id,
          tenantId: req.tenantId
        }
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent not found'
        });
      }

      // Get parent's children
      const children = await prisma.parentStudentRelation.findMany({
        where: {
          parentId: id,
          tenantId: req.tenantId
        },
        include: {
          student: {
            include: {
              enrollments: true,
              grades: true,
              attendance: true,
              payments: true
            }
          }
        }
      });

      // Calculate statistics
      const stats = {
        totalChildren: children.length,
        childrenDetails: children.map(rel => ({
          studentId: rel.student.id,
          studentName: `${rel.student.firstName} ${rel.student.lastName}`,
          enrolledClasses: rel.student.enrollments.length,
          totalGrades: rel.student.grades.length,
          attendanceRecords: rel.student.attendance.length,
          totalPayments: rel.student.payments.length,
          relationship: rel.relationship
        }))
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get parent statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get parent statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
};
