const { PrismaClient } = require('@prisma/client');
const { body, validationResult, query } = require('express-validator');

const prisma = new PrismaClient();

// Validation middleware for creating schedules
const validateSchedule = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('type').isIn(['CLASS', 'EXAM', 'EVENT', 'MEETING']).withMessage('Invalid schedule type'),
  body('startTime').isISO8601().withMessage('Invalid start time format'),
  body('endTime').isISO8601().withMessage('Invalid end time format'),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('status').optional().isIn(['ACTIVE', 'CANCELLED', 'COMPLETED', 'DRAFT']).withMessage('Invalid status'),
  body('subjectId').optional().isString(),
  body('teacherId').optional().isString(),
  body('classId').optional().isString(),
  body('location').optional().trim(),
  body('description').optional().trim(),
  body('recurring').optional().isBoolean(),
  body('recurrenceType').optional().isIn(['DAILY', 'WEEKLY', 'MONTHLY']),
  body('recurrenceEnd').optional().isISO8601(),
];

// Validation middleware for updating schedules
const validateScheduleUpdate = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('type').optional().isIn(['CLASS', 'EXAM', 'EVENT', 'MEETING']).withMessage('Invalid schedule type'),
  body('startTime').optional().isISO8601().withMessage('Invalid start time format'),
  body('endTime').optional().isISO8601().withMessage('Invalid end time format'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('status').optional().isIn(['ACTIVE', 'CANCELLED', 'COMPLETED', 'DRAFT']).withMessage('Invalid status'),
  body('subjectId').optional().isString(),
  body('teacherId').optional().isString(),
  body('classId').optional().isString(),
  body('location').optional().trim(),
  body('description').optional().trim(),
  body('recurring').optional().isBoolean(),
  body('recurrenceType').optional().isIn(['DAILY', 'WEEKLY', 'MONTHLY']),
  body('recurrenceEnd').optional().isISO8601(),
];

// Get all schedules with filtering and pagination
const getSchedules = async (req, res) => {
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
      page = 1,
      limit = 10,
      type,
      status,
      date,
      startDate,
      endDate,
      teacherId,
      subjectId,
      search,
      sortBy = 'date',
      sortOrder = 'asc'
    } = req.query;

    // Build where clause for filtering
    const where = {
      tenantId: req.tenantId,
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (date) {
      const searchDate = new Date(date);
      where.date = {
        gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        lt: new Date(searchDate.setHours(23, 59, 59, 999))
      };
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate)
      };
    }

    if (teacherId) {
      where.teacherId = teacherId;
    }

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get total count
    const total = await prisma.schedule.count({ where });

    // Get schedules with relationships
    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectCode: true
          }
        },
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
            lastName: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take
    });

    res.json({
      success: true,
      data: schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedules',
      error: error.message
    });
  }
};

// Get schedule by ID
const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findFirst({
      where: {
        id,
        tenantId: req.tenantId
      },
      include: {
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectCode: true
          }
        },
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
            lastName: true
          }
        },
        updatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule',
      error: error.message
    });
  }
};

// Create new schedule
const createSchedule = async (req, res) => {
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
      title,
      type,
      subjectId,
      teacherId,
      classId,
      startTime,
      endTime,
      date,
      location,
      status = 'ACTIVE',
      description,
      recurring = false,
      recurrenceType,
      recurrenceEnd,
      recurrencePattern
    } = req.body;

    // Validate time logic
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Check for conflicts (optional)
    if (teacherId) {
      const conflicts = await prisma.schedule.findMany({
        where: {
          tenantId: req.tenantId,
          teacherId,
          date: new Date(date),
          status: { in: ['ACTIVE', 'DRAFT'] },
          OR: [
            {
              AND: [
                { startTime: { lte: start } },
                { endTime: { gt: start } }
              ]
            },
            {
              AND: [
                { startTime: { lt: end } },
                { endTime: { gte: end } }
              ]
            },
            {
              AND: [
                { startTime: { gte: start } },
                { endTime: { lte: end } }
              ]
            }
          ]
        }
      });

      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Schedule conflict detected for this teacher at the specified time'
        });
      }
    }

    // Create schedule data
    const scheduleData = {
      title,
      type,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      date: new Date(date),
      status,
      recurring,
      tenantId: req.tenantId,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    // Add optional fields
    if (subjectId) scheduleData.subjectId = subjectId;
    if (teacherId) scheduleData.teacherId = teacherId;
    if (classId) scheduleData.classId = classId;
    if (location) scheduleData.location = location;
    if (description) scheduleData.description = description;
    if (recurrenceType) scheduleData.recurrenceType = recurrenceType;
    if (recurrenceEnd) scheduleData.recurrenceEnd = new Date(recurrenceEnd);
    if (recurrencePattern) scheduleData.recurrencePattern = recurrencePattern;

    const schedule = await prisma.schedule.create({
      data: scheduleData,
      include: {
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectCode: true
          }
        },
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
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: schedule,
      message: 'Schedule created successfully'
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create schedule',
      error: error.message
    });
  }
};

// Update schedule
const updateSchedule = async (req, res) => {
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

    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        id,
        tenantId: req.tenantId
      }
    });

    if (!existingSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Convert date strings to Date objects
    if (updateData.startTime) updateData.startTime = new Date(updateData.startTime);
    if (updateData.endTime) updateData.endTime = new Date(updateData.endTime);
    if (updateData.date) updateData.date = new Date(updateData.date);
    if (updateData.recurrenceEnd) updateData.recurrenceEnd = new Date(updateData.recurrenceEnd);

    // Validate time logic if both times are provided
    if (updateData.startTime && updateData.endTime) {
      if (updateData.startTime >= updateData.endTime) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
    }

    // Update schedule
    updateData.updatedBy = req.user.id;
    
    const schedule = await prisma.schedule.update({
      where: { id },
      data: updateData,
      include: {
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectCode: true
          }
        },
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
            lastName: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: schedule,
      message: 'Schedule updated successfully'
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule',
      error: error.message
    });
  }
};

// Delete schedule
const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        id,
        tenantId: req.tenantId
      }
    });

    if (!existingSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    await prisma.schedule.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete schedule',
      error: error.message
    });
  }
};

// Get schedule statistics
const getScheduleStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {
      tenantId: req.tenantId,
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const [
      totalSchedules,
      activeSchedules,
      todaySchedules,
      upcomingSchedules,
      typeStats,
      statusStats
    ] = await Promise.all([
      // Total schedules
      prisma.schedule.count({ where }),
      
      // Active schedules
      prisma.schedule.count({
        where: { ...where, status: 'ACTIVE' }
      }),
      
      // Today's schedules
      prisma.schedule.count({
        where: {
          ...where,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      
      // Upcoming schedules (next 7 days)
      prisma.schedule.count({
        where: {
          ...where,
          date: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Group by type
      prisma.schedule.groupBy({
        by: ['type'],
        where,
        _count: { type: true }
      }),
      
      // Group by status
      prisma.schedule.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        total: totalSchedules,
        active: activeSchedules,
        today: todaySchedules,
        upcoming: upcomingSchedules,
        byType: typeStats.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {}),
        byStatus: statusStats.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching schedule stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule statistics',
      error: error.message
    });
  }
};

// Export schedules
const exportSchedules = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate, type, status } = req.query;
    
    const where = {
      tenantId: req.tenantId,
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (type) where.type = type;
    if (status) where.status = status;

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        subject: { select: { subjectName: true, subjectCode: true } },
        teacher: { select: { firstName: true, lastName: true } }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    if (format === 'json') {
      return res.json({
        success: true,
        data: schedules
      });
    }

    // CSV Export
    const csvHeaders = [
      'Title',
      'Type',
      'Date',
      'Start Time',
      'End Time',
      'Subject',
      'Teacher',
      'Location',
      'Status',
      'Description'
    ];

    const csvRows = schedules.map(schedule => [
      schedule.title,
      schedule.type,
      schedule.date.toLocaleDateString(),
      schedule.startTime.toLocaleTimeString(),
      schedule.endTime.toLocaleTimeString(),
      schedule.subject ? `${schedule.subject.subjectName} (${schedule.subject.subjectCode})` : '',
      schedule.teacher ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}` : '',
      schedule.location || '',
      schedule.status,
      schedule.description || ''
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="schedules.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export schedules',
      error: error.message
    });
  }
};

module.exports = {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getScheduleStats,
  exportSchedules,
  validateSchedule,
  validateScheduleUpdate
};
