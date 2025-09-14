const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Validation rules
const validateUser = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('tenantId').notEmpty().withMessage('Tenant ID is required'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Register new user
const register = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, phone, address, tenantId, roleIds } = req.body;
    console.log('Processing user creation for:', { email, tenantId, roleIds });

    // Check if user already exists
    console.log('Checking for existing user with email:', email, 'in tenant:', tenantId);
    const existingUser = await prisma.user.findFirst({
      where: { 
        tenantId: tenantId,
        email: email
      }
    });

    if (existingUser) {
      console.log('User already exists:', existingUser);
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists in this tenant'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        address,
        tenantId,
        status: 'ACTIVE'
      },
      include: {
        tenant: true,
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    // Assign roles if provided
    if (roleIds && roleIds.length > 0) {
      await prisma.userRole.createMany({
        data: roleIds.map(roleId => ({
          userId: user.id,
          roleId: roleId
        }))
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        tenantId: user.tenantId,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          status: user.status,
          tenant: user.tenant,
          roles: user.userRoles.map(ur => ur.role)
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user with tenant and roles
    const user = await prisma.user.findFirst({
      where: { email },
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
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: `Account is ${user.status.toLowerCase()}`
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        tenantId: user.tenantId,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          status: user.status,
          tenant: user.tenant,
          roles: user.userRoles.map(ur => ur.role),
          permissions: user.userRoles.flatMap(ur => 
            ur.role.rolePermissions.map(rp => rp.permission.name)
          )
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        status: user.status,
        lastLogin: user.lastLogin,
        tenant: user.tenant,
        roles: user.userRoles.map(ur => ur.role),
        permissions: user.userRoles.flatMap(ur => 
          ur.role.rolePermissions.map(rp => rp.permission.name)
        )
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        tenant: true,
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        status: user.status,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        tenant: user.tenant,
        roles: user.userRoles.map(ur => ur.role)
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all users in tenant
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, role } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      tenantId: req.tenantId
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    // Add role filtering
    let roleFilter = {};
    if (role) {
      roleFilter = {
        userRoles: {
          some: {
            role: {
              name: role
            }
          }
        }
      };
    }

    // Combine where conditions
    const finalWhere = { ...where, ...roleFilter };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: finalWhere,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          tenant: true,
          userRoles: {
            include: {
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: finalWhere })
    ]);

    res.json({
      success: true,
      data: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        status: user.status,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        tenant: user.tenant,
        roles: user.userRoles.map(ur => ur.role)
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, address, status, roleIds } = req.body;

    // Check if user exists and belongs to tenant
    const existingUser = await prisma.user.findFirst({
      where: { 
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone,
        address,
        status
      },
      include: {
        tenant: true,
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    // Update roles if provided
    if (roleIds) {
      // Remove existing roles
      await prisma.userRole.deleteMany({
        where: { userId: id }
      });

      // Add new roles
      if (roleIds.length > 0) {
        await prisma.userRole.createMany({
          data: roleIds.map(roleId => ({
            userId: id,
            roleId: roleId
          }))
        });
      }
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        status: user.status,
        tenant: user.tenant,
        roles: user.userRoles.map(ur => ur.role)
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists and belongs to tenant
    const existingUser = await prisma.user.findFirst({
      where: { 
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all tenants (public route for user creation form)
const getTenants = async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: tenants
    });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tenants',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all roles (public route for user creation form)
const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        tenantId: true,
        tenant: {
          select: {
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get roles',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get teachers in tenant
const getTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      tenantId: req.tenantId,
      userRoles: {
        some: {
          role: {
            name: 'Teacher'
          }
        }
      }
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [teachers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          tenant: true,
          userRoles: {
            include: {
              role: true
            }
          }
        },
        orderBy: { firstName: 'asc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: teachers.map(teacher => ({
        id: teacher.id,
        email: teacher.email,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        phone: teacher.phone,
        address: teacher.address,
        status: teacher.status,
        lastLogin: teacher.lastLogin,
        createdAt: teacher.createdAt,
        tenant: teacher.tenant,
        roles: teacher.userRoles.map(ur => ur.role)
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get teachers',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all system users (Super Admin only)
const getSystemUsers = async (req, res) => {
  try {
    console.log('Getting system users...');
    
    const users = await prisma.user.findMany({
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            domain: true
          }
        },
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      },
      orderBy: [
        { tenant: { name: 'asc' } },
        { firstName: 'asc' }
      ]
    });

    // Transform the data to match frontend expectations
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      status: user.status,
      lastLogin: user.lastLogin?.toISOString(),
      tenant: user.tenant,
      roles: user.userRoles.map(ur => ur.role),
      createdAt: user.createdAt.toISOString().split('T')[0]
    }));

    res.json({
      success: true,
      users: transformedUsers,
      count: transformedUsers.length
    });
  } catch (error) {
    console.error('Get system users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    // For now, we'll just return a success response
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify the token
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

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not active'
      });
    }

    // Generate new JWT token
    const newToken = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email }
    });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return res.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    // In a real app, you would generate a reset token and send an email
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // In a real app, you would verify the reset token
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getUserById,
  getUsers,
  getTeachers,
  updateUser,
  deleteUser,
  getTenants,
  getRoles,
  getSystemUsers,
  validateUser,
  validateLogin,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword
};


