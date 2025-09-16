const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.error('Authentication failed: No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        tenant: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      console.error('Authentication failed: User not found for ID:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    if (user.status !== 'ACTIVE') {
      console.error('Authentication failed: User account is not active:', user.status);
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Attach user info to request
    req.user = user;
    req.tenantId = user.tenantId;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.error('Authentication failed: Invalid token');
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      console.error('Authentication failed: Token expired');
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Role-based Authorization Middleware
const authorize = (requiredPermissions = []) => {
  return (req, res, next) => {
    try {

      if (!req.user) {
        console.error('Authorization failed: No user in request');
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Super Admin bypass (if needed)
      if (req.user.userRoles.some(ur => ur.role.name === 'Super Admin')) {
        return next();
      }

      // Check if user has required permissions
      const userPermissions = req.user.userRoles.flatMap(ur =>
        ur.role.rolePermissions.map(rp => rp.permission.name)
      );

      const hasPermission = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: requiredPermissions,
          userPermissions: userPermissions
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  };
};

// Tenant Isolation Middleware
const ensureTenantAccess = (req, res, next) => {
  try {
    if (!req.user || !req.tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is system super admin (can access all tenants)
    const isSuperAdmin = req.user.userRoles.some(ur => 
      ur.role.name === 'Super Admin' && ur.role.tenant?.name === 'System'
    );

    if (isSuperAdmin) {
      return next();
    }

    // For regular users, ensure they can only access their own tenant data
    if (req.params.tenantId && req.params.tenantId !== req.tenantId) {
      console.log(`Tenant isolation violation: User tenant ${req.tenantId} trying to access ${req.params.tenantId}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied - tenant isolation violation'
      });
    }

    next();
  } catch (error) {
    console.error('Tenant access validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Tenant access validation failed'
    });
  }
};

module.exports = {
  authenticateToken,
  authorize,
  ensureTenantAccess
};

