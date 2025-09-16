const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get notifications for a user
const getNotifications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      isRead, 
      type,
      priority 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {
      tenantId: req.tenantId,
      userId: req.user.id
    };
    
    if (isRead !== undefined) where.isRead = isRead === 'true';
    if (type) where.type = type;
    if (priority) where.priority = priority;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ 
        where: { 
          ...where, 
          isRead: false 
        } 
      })
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        tenantId: req.tenantId,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedNotification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        tenantId: req.tenantId,
        userId: req.user.id,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        tenantId: req.tenantId,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await prisma.notification.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Create notification (admin only)
const createNotification = async (req, res) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      data,
      priority = 'NORMAL'
    } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, type, title, message'
      });
    }

    // Verify user exists and belongs to tenant
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

    const notification = await prisma.notification.create({
      data: {
        tenantId: req.tenantId,
        userId,
        type,
        title,
        message,
        data: data || {},
        priority
      }
    });

    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

// Send attendance alert to parents
const sendAttendanceAlert = async (req, res) => {
  try {
    const { studentId, attendanceDate, status } = req.body;

    if (!studentId || !attendanceDate || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: studentId, attendanceDate, status'
      });
    }

    // Get student and their parents
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        tenantId: req.tenantId
      },
      include: {
        parentRelations: {
          include: {
            parent: {
              include: {
                user: true
              }
            }
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

    // Create notifications for all parents
    const notifications = [];
    for (const relation of student.parentRelations) {
      const parent = relation.parent;
      if (parent.user) {
        const notification = await prisma.notification.create({
          data: {
            tenantId: req.tenantId,
            userId: parent.user.id,
            type: 'ATTENDANCE_ALERT',
            title: `Attendance Alert - ${student.firstName} ${student.lastName}`,
            message: `Your child ${student.firstName} ${student.lastName} was marked as ${status.toLowerCase()} on ${new Date(attendanceDate).toLocaleDateString()}`,
            data: {
              studentId: student.id,
              attendanceDate,
              status,
              studentName: `${student.firstName} ${student.lastName}`
            },
            priority: status === 'ABSENT' ? 'HIGH' : 'NORMAL'
          }
        });
        notifications.push(notification);
      }
    }

    res.json({
      success: true,
      data: notifications,
      message: `Attendance alerts sent to ${notifications.length} parent(s)`
    });
  } catch (error) {
    console.error('Error sending attendance alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send attendance alert',
      error: error.message
    });
  }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
  try {
    const where = {
      tenantId: req.tenantId,
      userId: req.user.id
    };

    const [
      totalNotifications,
      unreadNotifications,
      highPriorityNotifications,
      notificationsByType
    ] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, isRead: false } }),
      prisma.notification.count({ where: { ...where, priority: 'HIGH', isRead: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        where,
        _count: {
          id: true
        }
      })
    ]);

    const stats = {
      total: totalNotifications,
      unread: unreadNotifications,
      highPriority: highPriorityNotifications,
      byType: notificationsByType.reduce((acc, item) => {
        acc[item.type] = item._count.id;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching notification statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  sendAttendanceAlert,
  getNotificationStats
};
