const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Get teacher leave requests
const getTeacherLeaves = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { teacherId, status } = req.query;

    const where = { tenantId };
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;

    const leaves = await prisma.teacherLeave.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaves', error: error.message });
  }
};

// Create leave request
const createLeaveRequest = async (req, res) => {
  try {
    const { teacherId, leaveType, startDate, endDate, reason, description } = req.body;
    const tenantId = req.tenantId;

    const leave = await prisma.teacherLeave.create({
      data: {
        tenantId,
        teacherId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        description
      },
      include: {
        teacher: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create leave request', error: error.message });
  }
};

// Approve/Reject leave request
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectedReason, coverageNotes } = req.body;
    const tenantId = req.tenantId;

    // First verify the leave belongs to this tenant
    const existingLeave = await prisma.teacherLeave.findFirst({
      where: { id, tenantId }
    });
    
    if (!existingLeave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    const leave = await prisma.teacherLeave.update({
      where: { id, tenantId },
      data: {
        status,
        approvedBy: status === 'APPROVED' ? req.user.id : null,
        approvedAt: status === 'APPROVED' ? new Date() : null,
        rejectedReason: status === 'REJECTED' ? rejectedReason : null,
        coverageNotes
      }
    });

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update leave status', error: error.message });
  }
};

module.exports = {
  getTeacherLeaves,
  createLeaveRequest,
  updateLeaveStatus
};