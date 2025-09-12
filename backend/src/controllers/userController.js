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
    const { page = 1, limit = 10, search, status } = req.query;
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

    const [users, total] = await Promise.all([
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
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
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

module.exports = {
  register,
  login,
  getProfile,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
  getTenants,
  getRoles,
  validateUser,
  validateLogin
};


