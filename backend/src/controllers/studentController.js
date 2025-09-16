const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Validation rules
const validateStudent = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('dateOfBirth').isISO8601().withMessage('Date of birth must be a valid date'),
  body('gender').isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('region').notEmpty().withMessage('Region is required'),
  body('emergencyContact').notEmpty().withMessage('Emergency contact is required'),
  body('emergencyPhone').notEmpty().withMessage('Emergency phone is required'),
];

const validateEnrollment = [
  body('academicYearId').notEmpty().withMessage('Academic year is required'),
  body('enrollmentType').isIn(['COURSE', 'SUBJECT', 'CLASS']).withMessage('Invalid enrollment type'),
];

const validateAcademicRecord = [
  body('academicYearId').notEmpty().withMessage('Academic year is required'),
  body('term').optional().isIn(['FIRST_TERM', 'SECOND_TERM', 'THIRD_TERM', 'ANNUAL']).withMessage('Invalid term'),
];

const validateParentRelation = [
  body('parentId').notEmpty().withMessage('Parent ID is required'),
  body('relationship').isIn(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER']).withMessage('Invalid relationship'),
];

const validateHealthRecord = [
  body('recordType').isIn(['MEDICAL_CHECKUP', 'VACCINATION', 'INJURY', 'ILLNESS', 'ALLERGY', 'MEDICATION', 'EMERGENCY', 'OTHER']).withMessage('Invalid record type'),
  body('title').notEmpty().withMessage('Title is required'),
  body('date').isISO8601().withMessage('Date must be a valid date'),
];

const validateDocument = [
  body('documentType').isIn(['BIRTH_CERTIFICATE', 'NATIONAL_ID', 'PASSPORT', 'PHOTO', 'MEDICAL_CERTIFICATE', 'TRANSFER_CERTIFICATE', 'REPORT_CARD', 'OTHER']).withMessage('Invalid document type'),
  body('title').notEmpty().withMessage('Title is required'),
  body('filePath').notEmpty().withMessage('File path is required'),
  body('fileName').notEmpty().withMessage('File name is required'),
];

const validateAttendance = [
  body('date').isISO8601().withMessage('Date must be a valid date'),
  body('status').isIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK']).withMessage('Invalid attendance status'),
];

// Student Management
const getStudents = async (req, res) => {
  console.log('Request tenant ID:', req.tenantId);
  try {
    const { page = 1, limit = 10, search, status, gender, classId } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      tenantId: req.tenantId
    };

    if (search) {
      where.OR = [
        { studentId: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (gender) {
      where.gender = gender;
    }

    if (classId) {
      where.enrollments = {
        some: {
          classId: classId,
          isActive: true
        }
      };
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
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
          enrollments: {
            where: { isActive: true },
            include: {
              academicYear: true,
              class: true,
              course: true,
              subject: true
            }
          },
          parentRelations: {
            include: {
              parent: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      phone: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.student.count({ where })
    ]);

    res.json({
      success: true,
      data: students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get students',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const createStudent = async (req, res) => {
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
      studentId,
      admissionNumber,
      admissionDate,
      dateOfBirth,
      gender,
      nationality,
      religion,
      bloodGroup,
      address,
      city,
      region,
      postalCode,
      phone,
      emergencyContact,
      emergencyPhone,
      medicalInfo,
      previousSchool,
      previousGrade,
      transportMode,
      transportRoute
    } = req.body;

    // Check if student ID already exists in tenant
    const existingStudent = await prisma.student.findFirst({
      where: {
        tenantId: req.tenantId,
        studentId: studentId
      }
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: 'Student with this ID already exists in this tenant'
      });
    }

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

    // Create student
    const student = await prisma.student.create({
      data: {
        tenantId: req.tenantId,
        userId,
        studentId,
        admissionNumber,
        admissionDate: admissionDate ? new Date(admissionDate) : null,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        nationality: nationality || 'Tanzanian',
        religion,
        bloodGroup,
        address,
        city,
        region,
        postalCode,
        phone,
        emergencyContact,
        emergencyPhone,
        medicalInfo,
        previousSchool,
        previousGrade,
        transportMode,
        transportRoute
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
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findFirst({
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
        enrollments: {
          include: {
            academicYear: true,
            class: true,
            course: true,
            subject: true
          }
        },
        parentRelations: {
          include: {
            parent: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          }
        },
        academicRecords: {
          include: {
            academicYear: true,
            class: true,
            subject: true
          }
        },
        healthRecords: true,
        documents: true,
        attendance: {
          take: 10,
          orderBy: { date: 'desc' },
          include: {
            class: true,
            subject: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const updateStudent = async (req, res) => {
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

    // Check if student exists and belongs to tenant
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if new student ID conflicts
    if (updateData.studentId && updateData.studentId !== existingStudent.studentId) {
      const idConflict = await prisma.student.findFirst({
        where: {
          tenantId: req.tenantId,
          studentId: updateData.studentId,
          id: { not: id }
        }
      });

      if (idConflict) {
        return res.status(409).json({
          success: false,
          message: 'Student with this ID already exists in this tenant'
        });
      }
    }

    // Convert date strings to Date objects
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }
    if (updateData.admissionDate) {
      updateData.admissionDate = new Date(updateData.admissionDate);
    }

    // Update student
    const student = await prisma.student.update({
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
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if student exists and belongs to tenant
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Delete student (cascade will handle related records)
    await prisma.student.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Student Enrollment Management
const getStudentEnrollments = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        studentId: id,
        tenantId: req.tenantId
      },
      include: {
        academicYear: true,
        class: true,
        course: true,
        subject: true
      },
      orderBy: { enrollmentDate: 'desc' }
    });

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Get student enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student enrollments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const createEnrollment = async (req, res) => {
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
    const { academicYearId, classId, courseId, subjectId, enrollmentType, notes } = req.body;

    // Check if student exists
    const student = await prisma.student.findFirst({
      where: {
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.studentEnrollment.findFirst({
      where: {
        tenantId: req.tenantId,
        studentId: id,
        academicYearId,
        classId: classId || null,
        courseId: courseId || null,
        subjectId: subjectId || null
      }
    });

    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: 'Student is already enrolled in this program'
      });
    }

    // Create enrollment
    const enrollment = await prisma.studentEnrollment.create({
      data: {
        tenantId: req.tenantId,
        studentId: id,
        academicYearId,
        classId: classId || null,
        courseId: courseId || null,
        subjectId: subjectId || null,
        enrollmentType,
        notes
      },
      include: {
        academicYear: true,
        class: true,
        course: true,
        subject: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create enrollment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Additional controller methods
const updateEnrollment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id, enrollmentId } = req.params;
    const updateData = { ...req.body };

    // Check if enrollment exists
    const existingEnrollment = await prisma.studentEnrollment.findFirst({
      where: {
        id: enrollmentId,
        studentId: id,
        tenantId: req.tenantId
      }
    });

    if (!existingEnrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Update enrollment
    const enrollment = await prisma.studentEnrollment.update({
      where: { id: enrollmentId },
      data: updateData,
      include: {
        academicYear: true,
        class: true,
        course: true,
        subject: true
      }
    });

    res.json({
      success: true,
      message: 'Enrollment updated successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Update enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update enrollment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const { id, enrollmentId } = req.params;

    // Check if enrollment exists
    const existingEnrollment = await prisma.studentEnrollment.findFirst({
      where: {
        id: enrollmentId,
        studentId: id,
        tenantId: req.tenantId
      }
    });

    if (!existingEnrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Delete enrollment
    await prisma.studentEnrollment.delete({
      where: { id: enrollmentId }
    });

    res.json({
      success: true,
      message: 'Enrollment deleted successfully'
    });
  } catch (error) {
    console.error('Delete enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enrollment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Placeholder methods for other functionality
const updateAcademicRecord = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Academic record update not implemented yet'
  });
};

const deleteAcademicRecord = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Academic record deletion not implemented yet'
  });
};

const updateParentRelation = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Parent relation update not implemented yet'
  });
};

const deleteParentRelation = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Parent relation deletion not implemented yet'
  });
};

const updateHealthRecord = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Health record update not implemented yet'
  });
};

const deleteHealthRecord = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Health record deletion not implemented yet'
  });
};

const updateDocument = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Document update not implemented yet'
  });
};

const deleteDocument = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Document deletion not implemented yet'
  });
};

const updateAttendance = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Attendance update not implemented yet'
  });
};

const deleteAttendance = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Attendance deletion not implemented yet'
  });
};

const getStudentStatistics = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Student statistics not implemented yet'
  });
};

module.exports = {
  // Student management
  getStudents,
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  validateStudent,
  
  // Enrollment management
  getStudentEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  validateEnrollment,
  
  // Academic records
  getStudentAcademicRecords: async (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Academic records not implemented yet'
    });
  },
  createAcademicRecord: async (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Academic record creation not implemented yet'
    });
  },
  updateAcademicRecord,
  deleteAcademicRecord,
  validateAcademicRecord,
  
  // Parent relations
  getStudentParents: async (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Student parents not implemented yet'
    });
  },
  createParentRelation: async (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Parent relation creation not implemented yet'
    });
  },
  updateParentRelation,
  deleteParentRelation,
  validateParentRelation,
  
  // Health records
  getStudentHealthRecords: async (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Health records not implemented yet'
    });
  },
  createHealthRecord: async (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Health record creation not implemented yet'
    });
  },
  updateHealthRecord,
  deleteHealthRecord,
  validateHealthRecord,
  
  // Documents
  getStudentDocuments: async (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Student documents not implemented yet'
    });
  },
  createDocument: async (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Document creation not implemented yet'
    });
  },
  updateDocument,
  deleteDocument,
  validateDocument,
  
  // Attendance
  getStudentAttendance: async (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Student attendance not implemented yet'
    });
  },
  createAttendance: async (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Attendance creation not implemented yet'
    });
  },
  updateAttendance,
  deleteAttendance,
  validateAttendance,
  
  // Statistics
  getStudentStatistics
};
