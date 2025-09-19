const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Validation rules
const validateStudent = [
  body('studentId').optional().notEmpty().withMessage('Student ID cannot be empty'),
  body('dateOfBirth').optional().isISO8601().withMessage('Date of birth must be a valid date'),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('address').optional(),
  body('city').optional(),
  body('region').optional(),
  body('emergencyContact').optional(),
  body('emergencyPhone').optional(),
];

const validateStudentUpdate = [
  body('studentId').optional().notEmpty().withMessage('Student ID cannot be empty'),
  body('dateOfBirth').optional().isISO8601().withMessage('Date of birth must be a valid date'),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED', 'TRANSFERRED', 'DROPPED']).withMessage('Invalid status'),
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
      firstName,
      lastName,
      email,
      phone,
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
      emergencyContact,
      emergencyPhone,
      emergencyRelation,
      medicalInfo,
      previousSchool,
      previousGrade,
      transportMode,
      transportRoute,
      specialNeeds,
      hobbies
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !studentId || !dateOfBirth || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firstName, lastName, email, studentId, dateOfBirth, gender'
      });
    }

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

    // Check if email already exists in tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        tenantId: req.tenantId
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists in this tenant'
      });
    }

    // Create user first
    // Generate a secure random password or use environment variable
    const defaultPassword = process.env.DEFAULT_STUDENT_PASSWORD 
      ? await bcrypt.hash(process.env.DEFAULT_STUDENT_PASSWORD, 12)
      : await bcrypt.hash(crypto.randomBytes(12).toString('hex'), 12);
    
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        password: defaultPassword,
        tenantId: req.tenantId,
        status: 'ACTIVE'
      }
    });

    // Create student
    const student = await prisma.student.create({
      data: {
        tenantId: req.tenantId,
        userId: user.id,
        studentId,
        admissionNumber: admissionNumber || null,
        admissionDate: admissionDate ? new Date(admissionDate) : null,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        nationality: nationality || 'Tanzanian',
        religion: religion || null,
        bloodGroup: bloodGroup || null,
        address: address || null,
        city: city || null,
        region: region || null,
        postalCode: postalCode || null,
        emergencyContact: emergencyContact || null,
        emergencyPhone: emergencyPhone || null,
        medicalInfo: medicalInfo || null,
        previousSchool: previousSchool || null,
        previousGrade: previousGrade || null,
        transportMode: transportMode || null,
        transportRoute: transportRoute || null
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
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('Tenant ID:', req.tenantId);
    
    // Check if it's a Prisma error
    if (error.code) {
      console.error('Prisma error code:', error.code);
      console.error('Prisma error meta:', error.meta);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: error.message || 'Internal server error',
      details: error.stack,
      prismaError: error.code ? {
        code: error.code,
        meta: error.meta
      } : undefined
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
      },
      include: {
        user: true
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

    // Check if new email conflicts (if email is being updated)
    if (updateData.email && updateData.email !== existingStudent.user.email) {
      const emailConflict = await prisma.user.findFirst({
        where: {
          email: updateData.email,
          tenantId: req.tenantId,
          id: { not: existingStudent.userId }
        }
      });

      if (emailConflict) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists in this tenant'
        });
      }
    }

    // Separate user data from student data
    const { firstName, lastName, email, phone, specialNeeds, hobbies, emergencyRelation, ...rawStudentData } = updateData;
    
    // Filter out any undefined or non-existent fields
    const studentData = {};
    const allowedFields = [
      'studentId', 'admissionNumber', 'admissionDate', 'dateOfBirth', 'gender',
      'nationality', 'religion', 'bloodGroup', 'address', 'city', 'region',
      'postalCode', 'phone', 'emergencyContact', 'emergencyPhone', 'medicalInfo',
      'previousSchool', 'previousGrade', 'transportMode', 'transportRoute', 'status'
    ];
    
    allowedFields.forEach(field => {
      if (rawStudentData[field] !== undefined) {
        studentData[field] = rawStudentData[field];
      }
    });
    
    // Convert date strings to Date objects
    if (studentData.dateOfBirth) {
      studentData.dateOfBirth = new Date(studentData.dateOfBirth);
    }
    if (studentData.admissionDate) {
      studentData.admissionDate = new Date(studentData.admissionDate);
    }

    // Use transaction to update both user and student
    const result = await prisma.$transaction(async (tx) => {
      // Update user data if provided
      if (firstName || lastName || email || phone !== undefined) {
        await tx.user.update({
          where: { id: existingStudent.userId },
          data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(email && { email }),
            ...(phone !== undefined && { phone })
          }
        });
      }

      // Update student data
      const student = await tx.student.update({
        where: { id },
        data: studentData,
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

      return student;
    });

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: result
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
  validateStudentUpdate,
  
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
