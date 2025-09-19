const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Get teacher attendance records
const getTeacherAttendance = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { teacherId, startDate, endDate } = req.query;

    const where = { tenantId };
    if (teacherId) where.teacherId = teacherId;
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const attendance = await prisma.teacherAttendance.findMany({
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
      orderBy: { date: 'desc' }
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
};

// Mark teacher attendance
const markAttendance = async (req, res) => {
  try {
    const { teacherId, date, status, checkIn, checkOut, reason, notes } = req.body;
    const tenantId = req.tenantId;

    const attendance = await prisma.teacherAttendance.upsert({
      where: {
        tenantId_teacherId_date: {
          tenantId,
          teacherId,
          date: new Date(date)
        }
      },
      update: {
        status,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        reason,
        notes
      },
      create: {
        tenantId,
        teacherId,
        date: new Date(date),
        status,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        reason,
        notes,
        markedBy: req.user.id
      }
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark attendance', error: error.message });
  }
};

// Get attendance summary
const getAttendanceSummary = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { teacherId, month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await prisma.teacherAttendance.findMany({
      where: {
        tenantId,
        teacherId,
        date: { gte: startDate, lte: endDate }
      }
    });

    const summary = {
      totalDays: attendance.length,
      present: attendance.filter(a => a.status === 'PRESENT').length,
      absent: attendance.filter(a => a.status === 'ABSENT').length,
      late: attendance.filter(a => a.status === 'LATE').length,
      halfDay: attendance.filter(a => a.status === 'HALF_DAY').length,
      sick: attendance.filter(a => a.status === 'SICK').length,
      onLeave: attendance.filter(a => a.status === 'ON_LEAVE').length
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get summary', error: error.message });
  }
};

module.exports = {
  getTeacherAttendance,
  markAttendance,
  getAttendanceSummary
};