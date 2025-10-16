const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all activities for a tenant
const getActivities = async (req, res) => {
  try {
    const { tenantId } = req;
    const { type, status, page = 1, limit = 10, search } = req.query;

    const where = {
      tenantId,
      ...(type && { type }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } }
        ]
      })
    };

    const activities = await prisma.activity.findMany({
      where,
      include: {
        leader: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { students: true } }
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { name: 'asc' }
    });

    const total = await prisma.activity.count({ where });

    res.json({
      success: true,
      data: activities,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activities',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create a new activity
const createActivity = async (req, res) => {
  try {
    const { tenantId } = req;
    const { name, description, type, leaderId, maxCapacity, schedule } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Activity name and type are required'
      });
    }

    const activity = await prisma.activity.create({
      data: {
        tenantId,
        name,
        description,
        type,
        leaderId,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
        schedule
      },
      include: {
        leader: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: activity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get activity by ID
const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req;

    const activity = await prisma.activity.findFirst({
      where: { id, tenantId },
      include: {
        leader: { select: { id: true, firstName: true, lastName: true } },
        students: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true } }
          }
        }
      }
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    res.json({ success: true, data: activity });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update activity
const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req;
    const { name, description, type, leaderId, maxCapacity, schedule, status } = req.body;

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description || undefined,
        type: type || undefined,
        leaderId: leaderId || undefined,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
        schedule: schedule || undefined,
        status: status || undefined
      },
      include: {
        leader: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    res.json({
      success: true,
      message: 'Activity updated successfully',
      data: activity
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete activity
const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req;

    await prisma.activity.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Enroll student in activity
const enrollStudent = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { tenantId } = req;
    const { studentId, role } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const enrollment = await prisma.studentActivity.create({
      data: {
        tenantId,
        studentId,
        activityId,
        role
      },
      include: {
        activity: true,
        student: { include: { user: true } }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Student enrolled in activity successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Remove student from activity
const removeStudent = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { tenantId } = req;

    await prisma.studentActivity.delete({
      where: { id: enrollmentId }
    });

    res.json({
      success: true,
      message: 'Student removed from activity successfully'
    });
  } catch (error) {
    console.error('Remove student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get student's activities
const getStudentActivities = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { tenantId } = req;

    const activities = await prisma.studentActivity.findMany({
      where: { studentId, tenantId },
      include: {
        activity: true
      },
      orderBy: { joinDate: 'desc' }
    });

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get student activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student activities',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getActivities,
  createActivity,
  getActivityById,
  updateActivity,
  deleteActivity,
  enrollStudent,
  removeStudent,
  getStudentActivities
};

