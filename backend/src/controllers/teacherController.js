const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Validation rules
const validateTeacher = [
  body('teacherId').optional(),
  body('dateOfBirth').isISO8601().withMessage('Date of birth must be a valid date'),
  body('gender').isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
  body('emergencyContact').optional().notEmpty().withMessage('Emergency contact cannot be empty'),
  body('emergencyPhone').optional().notEmpty().withMessage('Emergency phone cannot be empty'),
];

const validateSubjectAssignment = [
  body('subjectId').notEmpty().withMessage('Subject ID is required'),
];

const validateQualification = [
  body('title').notEmpty().withMessage('Qualification title is required'),
  body('institution').notEmpty().withMessage('Institution is required'),
  body('dateObtained').isISO8601().withMessage('Date obtained must be a valid date'),
];

// Get all teachers for a tenant
const getTeachers = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    const teachers = await prisma.teacher.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        },
        teacherSubjects: {
          include: {
            subject: {
              select: {
                id: true,
                subjectName: true,
                subjectLevel: true,
                subjectType: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match frontend expectations
    const transformedTeachers = teachers.map(teacher => ({
      ...teacher,
      subjects: teacher.teacherSubjects.map(ts => ts.subject)
    }));

    res.json(transformedTeachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ 
      message: 'Failed to fetch teachers',
      error: error.message 
    });
  }
};

// Get a single teacher by ID
const getTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const teacher = await prisma.teacher.findFirst({
      where: { 
        id,
        tenantId 
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        },
        teacherSubjects: {
          include: {
            subject: {
              select: {
                id: true,
                subjectName: true,
                subjectLevel: true,
                subjectType: true,
              }
            }
          }
        }
      }
    });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Transform the data
    const transformedTeacher = {
      ...teacher,
      subjects: teacher.teacherSubjects.map(ts => ts.subject)
    };

    res.json(transformedTeacher);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ 
      message: 'Failed to fetch teacher',
      error: error.message 
    });
  }
};

// Create a new teacher
const createTeacher = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const tenantId = req.tenantId;
    const {
      // User data
      firstName,
      lastName,
      email,
      phone,
      password,
      // Teacher data
      teacherId,
      employeeNumber,
      dateOfBirth,
      gender,
      nationality,
      qualification,
      experience,
      specialization,
      address,
      city,
      region,
      postalCode,
      emergencyContact,
      emergencyPhone,
      emergencyRelation,
      joiningDate,
      previousSchool,
      teachingLicense,
      licenseExpiry
    } = req.body;

    // Generate unique teacher ID if not provided
    let finalTeacherId = teacherId;
    if (!finalTeacherId) {
      // Generate a unique teacher ID with timestamp and random component
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      finalTeacherId = `TCH${timestamp}${random}`;
      
      // Ensure uniqueness within tenant
      let attempts = 0;
      while (attempts < 5) {
        const existingTeacher = await prisma.teacher.findFirst({
          where: {
            teacherId: finalTeacherId,
            tenantId
          }
        });
        
        if (!existingTeacher) break;
        
        // Generate new ID if collision detected
        const newRandom = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        finalTeacherId = `TCH${Date.now()}${newRandom}`;
        attempts++;
      }
    } else {
      // Check if provided teacher ID already exists in this tenant
      const existingTeacher = await prisma.teacher.findFirst({
        where: {
          teacherId: finalTeacherId,
          tenantId
        }
      });

      if (existingTeacher) {
        return res.status(400).json({ 
          message: 'Teacher ID already exists in this school' 
        });
      }
    }

    // Check if user email already exists in this tenant
    const existingUser = await prisma.user.findUnique({
      where: { 
        tenantId_email: {
          tenantId,
          email
        }
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'teacher123', 12);



    // Create user and teacher in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          password: hashedPassword,
          tenantId
        }
      });

      // Assign teacher role
      const teacherRole = await tx.role.findFirst({
        where: { 
          name: 'Teacher',
          tenantId 
        }
      });

      if (teacherRole) {
        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: teacherRole.id,
            tenantId,
          }
        });
      }

      // Create teacher profile
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          tenantId,
          teacherId: finalTeacherId,
          employeeNumber,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          nationality,
          qualification,
          experience: experience ? parseInt(experience) : 0,
          specialization,
          address,
          city,
          region,
          postalCode,
          emergencyContact,
          emergencyPhone,
          emergencyRelation,
          joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          previousSchool,
          teachingLicense,
          licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
          createdBy: req.user.id
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            }
          }
        }
      });

      return teacher;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ 
      message: 'Failed to create teacher',
      error: error.message 
    });
  }
};

// Update teacher
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const {
      // User data
      firstName,
      lastName,
      email,
      phone,
      // Teacher data
      employeeNumber,
      dateOfBirth,
      gender,
      nationality,
      qualification,
      experience,
      specialization,
      address,
      city,
      region,
      postalCode,
      emergencyContact,
      emergencyPhone,
      emergencyRelation,
      joiningDate,
      previousSchool,
      teachingLicense,
      licenseExpiry
    } = req.body;

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findFirst({
      where: { 
        id,
        tenantId 
      },
      include: { user: true }
    });

    if (!existingTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user
      const updatedUser = await tx.user.update({
        where: { id: existingTeacher.userId },
        data: {
          firstName,
          lastName,
          email,
          phone,
        }
      });

      // Update teacher
      const updatedTeacher = await tx.teacher.update({
        where: { id },
        data: {
          employeeNumber,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender,
          nationality,
          qualification,
          experience: experience ? parseInt(experience) : undefined,
          specialization,
          address,
          city,
          region,
          postalCode,
          emergencyContact,
          emergencyPhone,
          emergencyRelation,
          joiningDate: joiningDate ? new Date(joiningDate) : undefined,
          previousSchool,
          teachingLicense,
          licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            }
          }
        }
      });

      return updatedTeacher;
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ 
      message: 'Failed to update teacher',
      error: error.message 
    });
  }
};

// Delete teacher
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    // Check if teacher exists
    const existingTeacher = await prisma.teacher.findFirst({
      where: { 
        id,
        tenantId 
      }
    });

    if (!existingTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Delete in transaction
    await prisma.$transaction(async (tx) => {
      // Delete teacher subject assignments
      await tx.teacherSubject.deleteMany({
        where: { teacherId: id }
      });

      // Delete teacher qualifications
      await tx.teacherQualification.deleteMany({
        where: { teacherId: id }
      });

      // Delete teacher
      await tx.teacher.delete({
        where: { id }
      });

      // Optionally delete user (or just deactivate)
      await tx.user.update({
        where: { id: existingTeacher.userId },
        data: { 
          isActive: false,
        }
      });
    });

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ 
      message: 'Failed to delete teacher',
      error: error.message 
    });
  }
};

// Get teacher subjects
const getTeacherSubjects = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const tenantId = req.tenantId;

    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacherId,
        tenantId
      },
      include: {
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectLevel: true,
            subjectType: true,
          }
        }
      }
    });

    const subjects = teacherSubjects.map(ts => ts.subject);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching teacher subjects:', error);
    res.status(500).json({ 
      message: 'Failed to fetch teacher subjects',
      error: error.message 
    });
  }
};

// Assign subject to teacher
const assignSubjectToTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { subjectId } = req.body;
    const tenantId = req.tenantId;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.teacherSubject.findFirst({
      where: {
        teacherId,
        subjectId,
        tenantId
      }
    });

    if (existingAssignment) {
      return res.status(400).json({ 
        message: 'Subject already assigned to teacher' 
      });
    }

    const assignment = await prisma.teacherSubject.create({
      data: {
        teacherId,
        subjectId,
        tenantId,
        assignedBy: req.user.id
      },
      include: {
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectLevel: true,
            subjectType: true,
          }
        }
      }
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error assigning subject to teacher:', error);
    res.status(500).json({ 
      message: 'Failed to assign subject to teacher',
      error: error.message 
    });
  }
};

// Remove subject from teacher
const removeSubjectFromTeacher = async (req, res) => {
  try {
    const { teacherId, subjectId } = req.params;
    const tenantId = req.tenantId;

    const assignment = await prisma.teacherSubject.findFirst({
      where: {
        teacherId,
        subjectId,
        tenantId
      }
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    await prisma.teacherSubject.delete({
      where: { id: assignment.id }
    });

    res.json({ message: 'Subject removed from teacher successfully' });
  } catch (error) {
    console.error('Error removing subject from teacher:', error);
    res.status(500).json({ 
      message: 'Failed to remove subject from teacher',
      error: error.message 
    });
  }
};

// Get teacher qualifications
const getTeacherQualifications = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const tenantId = req.tenantId;

    const qualifications = await prisma.teacherQualification.findMany({
      where: {
        teacherId,
        tenantId
      },
      orderBy: {
        dateObtained: 'desc'
      }
    });

    res.json(qualifications);
  } catch (error) {
    console.error('Error fetching teacher qualifications:', error);
    res.status(500).json({ 
      message: 'Failed to fetch teacher qualifications',
      error: error.message 
    });
  }
};

// Add teacher qualification
const addTeacherQualification = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const tenantId = req.tenantId;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const {
      title,
      institution,
      dateObtained,
      expiryDate,
      certificateNumber,
      description
    } = req.body;

    const qualification = await prisma.teacherQualification.create({
      data: {
        teacherId,
        tenantId,
        title,
        institution,
        dateObtained: new Date(dateObtained),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        certificateNumber,
        description,
        createdBy: req.user.id
      }
    });

    res.status(201).json(qualification);
  } catch (error) {
    console.error('Error adding teacher qualification:', error);
    res.status(500).json({ 
      message: 'Failed to add teacher qualification',
      error: error.message 
    });
  }
};

// Update teacher qualification
const updateTeacherQualification = async (req, res) => {
  try {
    const { teacherId, qualificationId } = req.params;
    const tenantId = req.tenantId;

    const {
      title,
      institution,
      dateObtained,
      expiryDate,
      certificateNumber,
      description
    } = req.body;

    const qualification = await prisma.teacherQualification.findFirst({
      where: {
        id: qualificationId,
        teacherId,
        tenantId
      }
    });

    if (!qualification) {
      return res.status(404).json({ message: 'Qualification not found' });
    }

    const updatedQualification = await prisma.teacherQualification.update({
      where: { id: qualificationId },
      data: {
        title,
        institution,
        dateObtained: dateObtained ? new Date(dateObtained) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        certificateNumber,
        description,
        updatedBy: req.user.id
      }
    });

    res.json(updatedQualification);
  } catch (error) {
    console.error('Error updating teacher qualification:', error);
    res.status(500).json({ 
      message: 'Failed to update teacher qualification',
      error: error.message 
    });
  }
};

// Delete teacher qualification
const deleteTeacherQualification = async (req, res) => {
  try {
    const { teacherId, qualificationId } = req.params;
    const tenantId = req.tenantId;

    const qualification = await prisma.teacherQualification.findFirst({
      where: {
        id: qualificationId,
        teacherId,
        tenantId
      }
    });

    if (!qualification) {
      return res.status(404).json({ message: 'Qualification not found' });
    }

    await prisma.teacherQualification.delete({
      where: { id: qualificationId }
    });

    res.json({ message: 'Qualification deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher qualification:', error);
    res.status(500).json({ 
      message: 'Failed to delete teacher qualification',
      error: error.message 
    });
  }
};

module.exports = {
  getTeachers,
  getTeacher,
  createTeacher: [validateTeacher, createTeacher],
  updateTeacher: [validateTeacher, updateTeacher],
  deleteTeacher,
  getTeacherSubjects,
  assignSubjectToTeacher: [validateSubjectAssignment, assignSubjectToTeacher],
  removeSubjectFromTeacher,
  getTeacherQualifications,
  addTeacherQualification: [validateQualification, addTeacherQualification],
  updateTeacherQualification: [validateQualification, updateTeacherQualification],
  deleteTeacherQualification
};
