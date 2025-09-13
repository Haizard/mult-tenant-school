const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    console.log('Authentication middleware triggered');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('Auth header present:', !!authHeader);
    console.log('Token extracted:', !!token);

    if (!token) {
      console.error('Authentication failed: No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', { userId: decoded.userId, tenantId: decoded.tenantId });
    
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

    console.log('User found:', {
      id: user.id,
      email: user.email,
      status: user.status,
      roles: user.userRoles.map(ur => ur.role.name)
    });

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
    
    console.log('Authentication successful for user:', user.email);
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
      console.log('Authorization check for permissions:', requiredPermissions);
      console.log('User object:', {
        id: req.user?.id,
        email: req.user?.email,
        roles: req.user?.userRoles?.map(ur => ur.role.name)
      });

      if (!req.user) {
        console.error('Authorization failed: No user in request');
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Super Admin bypass (if needed)
      if (req.user.userRoles.some(ur => ur.role.name === 'Super Admin')) {
        console.log('Super Admin bypass - allowing access');
        return next();
      }

      // Check if user has required permissions
      const userPermissions = req.user.userRoles.flatMap(ur =>
        ur.role.rolePermissions.map(rp => rp.permission.name)
      );

      console.log('User permissions:', userPermissions);
      console.log('Required permissions:', requiredPermissions);

      const hasPermission = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        console.error('Authorization failed: Insufficient permissions');
        console.error('Required:', requiredPermissions);
        console.error('User has:', userPermissions);
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: requiredPermissions,
          userPermissions: userPermissions
        });
      }

      console.log('Authorization successful - proceeding');
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

    // Super Admin can access all tenants
    if (req.user.userRoles.some(ur => ur.role.name === 'Super Admin')) {
      return next();
    }

    // For tenant-specific resources, ensure user can only access their tenant's data
    if (req.params.tenantId && req.params.tenantId !== req.tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - tenant isolation'
      });
    }

    next();
  } catch (error) {
    console.error('Tenant access error:', error);
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

