const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Validation rules for audit log creation
const validateAuditLog = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('action').notEmpty().withMessage('Action is required'),
  body('resource').notEmpty().withMessage('Resource is required'),
  body('timestamp').notEmpty().withMessage('Timestamp is required'),
  body('status').isIn(['SUCCESS', 'FAILURE', 'PENDING']).withMessage('Status must be SUCCESS, FAILURE, or PENDING')
];

// Create audit log entry
const createAuditLog = async (req, res) => {
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
      userId,
      userEmail,
      userName,
      userRoles,
      tenantId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      timestamp,
      status,
      errorMessage
    } = req.body;

    // Create audit log entry
    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        userEmail,
        userName,
        userRoles: JSON.stringify(userRoles || []),
        tenantId,
        action,
        resource,
        resourceId,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent,
        timestamp: new Date(timestamp),
        status,
        errorMessage
      }
    });

    res.status(201).json({
      success: true,
      message: 'Audit log created successfully',
      data: auditLog
    });
  } catch (error) {
    console.error('Create audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create audit log',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get audit logs with filtering
const getAuditLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      userId, 
      tenantId, 
      action, 
      resource, 
      status,
      startDate,
      endDate
    } = req.query;
    
    const skip = (page - 1) * limit;

    const where = {};

    // Apply filters
    if (userId) where.userId = userId;
    if (tenantId) where.tenantId = tenantId;
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (resource) where.resource = { contains: resource, mode: 'insensitive' };
    if (status) where.status = status;

    // Date range filter
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { timestamp: 'desc' }
      }),
      prisma.auditLog.count({ where })
    ]);

    // Parse JSON fields
    const parsedLogs = auditLogs.map(log => ({
      ...log,
      userRoles: log.userRoles ? JSON.parse(log.userRoles) : [],
      details: log.details ? JSON.parse(log.details) : null
    }));

    res.json({
      success: true,
      data: parsedLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get audit log by ID
const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const auditLog = await prisma.auditLog.findUnique({
      where: { id }
    });

    if (!auditLog) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    // Parse JSON fields
    const parsedLog = {
      ...auditLog,
      userRoles: auditLog.userRoles ? JSON.parse(auditLog.userRoles) : [],
      details: auditLog.details ? JSON.parse(auditLog.details) : null
    };

    res.json({
      success: true,
      data: parsedLog
    });
  } catch (error) {
    console.error('Get audit log by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit log',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get audit log statistics
const getAuditLogStats = async (req, res) => {
  try {
    const { tenantId, startDate, endDate } = req.query;

    const where = {};
    if (tenantId) where.tenantId = tenantId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [
      totalLogs,
      successLogs,
      failureLogs,
      actionStats,
      resourceStats
    ] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.count({ where: { ...where, status: 'SUCCESS' } }),
      prisma.auditLog.count({ where: { ...where, status: 'FAILURE' } }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10
      }),
      prisma.auditLog.groupBy({
        by: ['resource'],
        where,
        _count: { resource: true },
        orderBy: { _count: { resource: 'desc' } },
        take: 10
      })
    ]);

    res.json({
      success: true,
      data: {
        totalLogs,
        successLogs,
        failureLogs,
        pendingLogs: totalLogs - successLogs - failureLogs,
        topActions: actionStats.map(stat => ({
          action: stat.action,
          count: stat._count.action
        })),
        topResources: resourceStats.map(stat => ({
          resource: stat.resource,
          count: stat._count.resource
        }))
      }
    });
  } catch (error) {
    console.error('Get audit log stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get audit log statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createAuditLog,
  getAuditLogs,
  getAuditLogById,
  getAuditLogStats,
  validateAuditLog
};
