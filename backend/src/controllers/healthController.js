const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all health records for a student
const getHealthRecords = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { tenantId } = req;

    // Verify student exists
    const student = await prisma.student.findFirst({
      where: { id: studentId, tenantId }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const records = await prisma.healthRecord.findMany({
      where: { studentId, tenantId },
      orderBy: { recordDate: 'desc' }
    });

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health records',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create a new health record
const createHealthRecord = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { tenantId } = req;
    const { recordType, description, notes, recordDate } = req.body;

    if (!recordType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Record type and description are required'
      });
    }

    // Verify student exists
    const student = await prisma.student.findFirst({
      where: { id: studentId, tenantId }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const record = await prisma.healthRecord.create({
      data: {
        tenantId,
        studentId,
        recordType,
        description,
        notes,
        recordDate: recordDate ? new Date(recordDate) : new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Health record created successfully',
      data: record
    });
  } catch (error) {
    console.error('Create health record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create health record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get health record by ID
const getHealthRecordById = async (req, res) => {
  try {
    const { studentId, recordId } = req.params;
    const { tenantId } = req;

    const record = await prisma.healthRecord.findFirst({
      where: { id: recordId, studentId, tenantId }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Get health record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update health record
const updateHealthRecord = async (req, res) => {
  try {
    const { studentId, recordId } = req.params;
    const { tenantId } = req;
    const { recordType, description, notes } = req.body;

    const record = await prisma.healthRecord.update({
      where: { id: recordId },
      data: {
        recordType: recordType || undefined,
        description: description || undefined,
        notes: notes || undefined
      }
    });

    res.json({
      success: true,
      message: 'Health record updated successfully',
      data: record
    });
  } catch (error) {
    console.error('Update health record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update health record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete health record
const deleteHealthRecord = async (req, res) => {
  try {
    const { studentId, recordId } = req.params;
    const { tenantId } = req;

    await prisma.healthRecord.delete({
      where: { id: recordId }
    });

    res.json({
      success: true,
      message: 'Health record deleted successfully'
    });
  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete health record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get health summary for a student
const getHealthSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { tenantId } = req;

    const student = await prisma.student.findFirst({
      where: { id: studentId, tenantId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        bloodGroup: true,
        medicalInfo: true,
        healthRecords: {
          orderBy: { recordDate: 'desc' },
          take: 10
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
      data: {
        student: {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          dateOfBirth: student.dateOfBirth,
          bloodGroup: student.bloodGroup,
          medicalInfo: student.medicalInfo
        },
        recentRecords: student.healthRecords,
        totalRecords: student.healthRecords.length
      }
    });
  } catch (error) {
    console.error('Get health summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getHealthRecords,
  createHealthRecord,
  getHealthRecordById,
  updateHealthRecord,
  deleteHealthRecord,
  getHealthSummary
};

