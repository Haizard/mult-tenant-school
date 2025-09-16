const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all attendance records for a tenant
const getAttendanceRecords = async (req, res) => {
  try {
    const { tenantId } = req;
    const { date, studentId, classId, subjectId, status, page = 1, limit = 10 } = req.query;

    // Build filter conditions
    const where = {
      tenantId,
      ...(date && { date: new Date(date) }),
      ...(studentId && { studentId }),
      ...(classId && { classId }),
      ...(subjectId && { subjectId }),
      ...(status && { status })
    };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get attendance records with related data
    const attendanceRecords = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        class: {
          select: {
            className: true,
            classCode: true
          }
        },
        subject: {
          select: {
            subjectName: true,
            subjectCode: true
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take
    });

    // Get total count for pagination
    const totalCount = await prisma.attendance.count({ where });

    // Format response data
    const formattedRecords = attendanceRecords.map(record => ({
      id: record.id,
      studentName: `${record.student.user.firstName} ${record.student.user.lastName}`,
      studentId: record.student.studentId,
      studentEmail: record.student.user.email,
      class: record.class?.className || 'N/A',
      subject: record.subject?.subjectName || 'N/A',
      date: record.date.toISOString().split('T')[0],
      status: record.status,
      period: record.period,
      reason: record.reason,
      notes: record.notes,
      markedBy: record.markedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }));

    res.json({
      success: true,
      data: formattedRecords,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message
    });
  }
};

// Mark attendance for students
const markAttendance = async (req, res) => {
  try {
    const { tenantId, user } = req;
    const { attendanceData } = req.body;

    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Attendance data is required and must be an array'
      });
    }

    const results = [];
    const errors = [];

    for (const attendance of attendanceData) {
      try {
        const { studentId, classId, subjectId, date, status, period, reason, notes } = attendance;

        // Validate required fields
        if (!studentId || !date || !status) {
          errors.push({
            studentId,
            error: 'Student ID, date, and status are required'
          });
          continue;
        }

        // Check if student exists in tenant
        const student = await prisma.student.findFirst({
          where: {
            tenantId,
            studentId
          }
        });

        if (!student) {
          errors.push({
            studentId,
            error: 'Student not found in this tenant'
          });
          continue;
        }

        // Create or update attendance record
        const attendanceRecord = await prisma.attendance.upsert({
          where: {
            tenantId_studentId_date_period: {
              tenantId,
              studentId: student.id,
              date: new Date(date),
              period: period || 'FULL_DAY'
            }
          },
          update: {
            status,
            reason,
            notes,
            updatedAt: new Date()
          },
          create: {
            tenantId,
            studentId: student.id,
            classId,
            subjectId,
            date: new Date(date),
            status,
            period: period || 'FULL_DAY',
            reason,
            notes,
            markedBy: user.id
          },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        });

        results.push({
          id: attendanceRecord.id,
          studentName: `${attendanceRecord.student.user.firstName} ${attendanceRecord.student.user.lastName}`,
          studentId: attendanceRecord.student.studentId,
          status: attendanceRecord.status,
          date: attendanceRecord.date
        });

      } catch (error) {
        errors.push({
          studentId: attendance.studentId,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Attendance marked for ${results.length} students`,
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
};

// Update attendance record
const updateAttendance = async (req, res) => {
  try {
    const { tenantId, user } = req;
    const { id } = req.params;
    const { status, reason, notes } = req.body;

    // Check if attendance record exists and belongs to tenant
    const existingRecord = await prisma.attendance.findFirst({
      where: {
        id,
        tenantId
      }
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Update attendance record
    const updatedRecord = await prisma.attendance.update({
      where: { id },
      data: {
        status,
        reason,
        notes,
        updatedAt: new Date()
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: {
        id: updatedRecord.id,
        studentName: `${updatedRecord.student.user.firstName} ${updatedRecord.student.user.lastName}`,
        status: updatedRecord.status,
        reason: updatedRecord.reason,
        notes: updatedRecord.notes
      }
    });

  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance record',
      error: error.message
    });
  }
};

// Delete attendance record
const deleteAttendance = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;

    // Check if attendance record exists and belongs to tenant
    const existingRecord = await prisma.attendance.findFirst({
      where: {
        id,
        tenantId
      }
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Delete attendance record
    await prisma.attendance.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete attendance record',
      error: error.message
    });
  }
};

// Get attendance statistics
const getAttendanceStats = async (req, res) => {
  try {
    const { tenantId } = req;
    const { date, classId, subjectId } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    
    // Build filter conditions
    const where = {
      tenantId,
      date: targetDate,
      ...(classId && { classId }),
      ...(subjectId && { subjectId })
    };

    // Get attendance statistics
    const stats = await prisma.attendance.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true
      }
    });

    // Format statistics
    const formattedStats = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      EXCUSED: 0,
      SICK: 0
    };

    stats.forEach(stat => {
      formattedStats[stat.status] = stat._count.status;
    });

    const totalStudents = Object.values(formattedStats).reduce((sum, count) => sum + count, 0);
    const attendanceRate = totalStudents > 0 ? Math.round((formattedStats.PRESENT / totalStudents) * 100) : 0;

    res.json({
      success: true,
      data: {
        stats: formattedStats,
        totalStudents,
        attendanceRate,
        date: targetDate.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Error fetching attendance statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance statistics',
      error: error.message
    });
  }
};

// Get student attendance history
const getStudentAttendanceHistory = async (req, res) => {
  try {
    const { tenantId } = req;
    const { studentId } = req.params;
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const where = {
      tenantId,
      student: {
        studentId
      },
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get attendance history
    const attendanceHistory = await prisma.attendance.findMany({
      where,
      include: {
        class: {
          select: {
            className: true
          }
        },
        subject: {
          select: {
            subjectName: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      skip,
      take
    });

    // Get total count
    const totalCount = await prisma.attendance.count({ where });

    // Calculate attendance statistics for the period
    const attendanceStats = await prisma.attendance.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true
      }
    });

    const stats = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      EXCUSED: 0,
      SICK: 0
    };

    attendanceStats.forEach(stat => {
      stats[stat.status] = stat._count.status;
    });

    const totalDays = Object.values(stats).reduce((sum, count) => sum + count, 0);
    const attendanceRate = totalDays > 0 ? Math.round((stats.PRESENT / totalDays) * 100) : 0;

    res.json({
      success: true,
      data: {
        history: attendanceHistory,
        stats,
        attendanceRate,
        totalDays
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching student attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student attendance history',
      error: error.message
    });
  }
};

module.exports = {
  getAttendanceRecords,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
  getStudentAttendanceHistory
};
