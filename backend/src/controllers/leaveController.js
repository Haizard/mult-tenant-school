const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get leave requests with filtering and pagination
const getLeaveRequests = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      studentId, 
      leaveType,
      startDate,
      endDate 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {
      tenantId: req.tenantId
    };
    
    if (status) where.status = status;
    if (studentId) where.studentId = studentId;
    if (leaveType) where.leaveType = leaveType;
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate);
      if (endDate) where.startDate.lte = new Date(endDate);
    }

    const [leaveRequests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentId: true,
              admissionNumber: true
            }
          },
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          approver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.leaveRequest.count({ where })
    ]);

    res.json({
      success: true,
      data: leaveRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave requests',
      error: error.message
    });
  }
};

// Create a new leave request
const createLeaveRequest = async (req, res) => {
  try {
    const {
      studentId,
      leaveType,
      startDate,
      endDate,
      reason,
      description,
      supportingDocs,
      isEmergency = false
    } = req.body;

    // Validate required fields
    if (!studentId || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: studentId, leaveType, startDate, endDate, reason'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date'
      });
    }

    // Verify student exists and belongs to tenant
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

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        tenantId: req.tenantId,
        studentId,
        requestedBy: req.user.id,
        leaveType,
        startDate: start,
        endDate: end,
        reason,
        description,
        supportingDocs: supportingDocs ? JSON.stringify(supportingDocs) : null,
        isEmergency
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true
          }
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Create notification for administrators
    await createLeaveNotification(leaveRequest, 'LEAVE_REQUEST');

    res.status(201).json({
      success: true,
      data: leaveRequest,
      message: 'Leave request created successfully'
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create leave request',
      error: error.message
    });
  }
};

// Update leave request status (approve/reject)
const updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectedReason } = req.body;

    if (!['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be APPROVED, REJECTED, or CANCELLED'
      });
    }

    // Find the leave request
    const existingRequest = await prisma.leaveRequest.findFirst({
      where: {
        id,
        tenantId: req.tenantId
      },
      include: {
        student: true,
        requester: true
      }
    });

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (existingRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be updated'
      });
    }

    // Update the request
    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (status === 'APPROVED') {
      updateData.approvedBy = req.user.id;
      updateData.approvedAt = new Date();
    } else if (status === 'REJECTED') {
      updateData.rejectedReason = rejectedReason;
    }

    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true
          }
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Create notification
    const notificationType = status === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED';
    await createLeaveNotification(updatedRequest, notificationType);

    res.json({
      success: true,
      data: updatedRequest,
      message: `Leave request ${status.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update leave request',
      error: error.message
    });
  }
};

// Delete leave request
const deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const leaveRequest = await prisma.leaveRequest.findFirst({
      where: {
        id,
        tenantId: req.tenantId
      }
    });

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Only allow deletion of pending requests or by the requester
    if (leaveRequest.status !== 'PENDING' && leaveRequest.requestedBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete this leave request'
      });
    }

    await prisma.leaveRequest.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Leave request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete leave request',
      error: error.message
    });
  }
};

// Get leave statistics
const getLeaveStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {
      tenantId: req.tenantId
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      emergencyRequests,
      leaveTypeStats
    ] = await Promise.all([
      prisma.leaveRequest.count({ where }),
      prisma.leaveRequest.count({ where: { ...where, status: 'PENDING' } }),
      prisma.leaveRequest.count({ where: { ...where, status: 'APPROVED' } }),
      prisma.leaveRequest.count({ where: { ...where, status: 'REJECTED' } }),
      prisma.leaveRequest.count({ where: { ...where, isEmergency: true } }),
      prisma.leaveRequest.groupBy({
        by: ['leaveType'],
        where,
        _count: {
          id: true
        }
      })
    ]);

    const stats = {
      total: totalRequests,
      pending: pendingRequests,
      approved: approvedRequests,
      rejected: rejectedRequests,
      emergency: emergencyRequests,
      byType: leaveTypeStats.reduce((acc, item) => {
        acc[item.leaveType] = item._count.id;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching leave statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave statistics',
      error: error.message
    });
  }
};

// Helper function to create notifications
const createLeaveNotification = async (leaveRequest, type) => {
  try {
    let title, message, targetUserId;

    switch (type) {
      case 'LEAVE_REQUEST':
        title = 'New Leave Request';
        message = `${leaveRequest.student.firstName} ${leaveRequest.student.lastName} has submitted a leave request`;
        // Send to administrators - for now, send to the requester as placeholder
        targetUserId = leaveRequest.requestedBy;
        break;
      case 'LEAVE_APPROVED':
        title = 'Leave Request Approved';
        message = `Leave request for ${leaveRequest.student.firstName} ${leaveRequest.student.lastName} has been approved`;
        targetUserId = leaveRequest.requestedBy;
        break;
      case 'LEAVE_REJECTED':
        title = 'Leave Request Rejected';
        message = `Leave request for ${leaveRequest.student.firstName} ${leaveRequest.student.lastName} has been rejected`;
        targetUserId = leaveRequest.requestedBy;
        break;
    }

    await prisma.notification.create({
      data: {
        tenantId: leaveRequest.tenantId,
        userId: targetUserId,
        type,
        title,
        message,
        data: {
          leaveRequestId: leaveRequest.id,
          studentId: leaveRequest.studentId
        },
        priority: leaveRequest.isEmergency ? 'HIGH' : 'NORMAL'
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  getLeaveStats
};
