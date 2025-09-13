const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Validation middleware
const validateTenant = [
  body('name').notEmpty().withMessage('Tenant name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('domain').notEmpty().withMessage('Domain is required'),
  body('address').notEmpty().withMessage('Address is required'),
];

// GET /api/tenants - Get all tenants
router.get('/', async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match frontend expectations
    const transformedTenants = tenants.map(tenant => ({
      id: tenant.id,
      name: tenant.name,
      domain: tenant.domain,
      status: tenant.status,
      adminEmail: tenant.email,
      adminName: tenant.users.find(u => u.email === tenant.email)?.firstName + ' ' + tenant.users.find(u => u.email === tenant.email)?.lastName || 'N/A',
      createdAt: tenant.createdAt.toISOString().split('T')[0],
      userCount: tenant._count.users,
      subscriptionPlan: tenant.subscriptionPlan,
      lastActivity: tenant.lastActivity.toISOString().split('T')[0],
      subscriptionExpiry: tenant.subscriptionExpiry?.toISOString().split('T')[0],
      maxUsers: tenant.maxUsers,
      features: tenant.features,
      address: tenant.address,
      phone: tenant.phone,
      email: tenant.email,
      type: tenant.type,
      timezone: tenant.timezone,
      language: tenant.language,
      currency: tenant.currency
    }));

    res.json({
      success: true,
      data: transformedTenants,
      count: transformedTenants.length
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenants',
      error: error.message
    });
  }
});

// GET /api/tenants/:id - Get tenant by ID
router.get('/:id', async (req, res) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.params.id },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Transform the data to match frontend expectations
    const transformedTenant = {
      id: tenant.id,
      name: tenant.name,
      domain: tenant.domain,
      status: tenant.status,
      adminEmail: tenant.email,
      adminName: tenant.users.find(u => u.email === tenant.email)?.firstName + ' ' + tenant.users.find(u => u.email === tenant.email)?.lastName || 'N/A',
      createdAt: tenant.createdAt.toISOString().split('T')[0],
      userCount: tenant._count.users,
      subscriptionPlan: tenant.subscriptionPlan,
      lastActivity: tenant.lastActivity.toISOString().split('T')[0],
      subscriptionExpiry: tenant.subscriptionExpiry?.toISOString().split('T')[0],
      maxUsers: tenant.maxUsers,
      features: tenant.features,
      address: tenant.address,
      phone: tenant.phone,
      email: tenant.email,
      type: tenant.type,
      timezone: tenant.timezone,
      language: tenant.language,
      currency: tenant.currency
    };

    res.json({
      success: true,
      data: transformedTenant
    });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant',
      error: error.message
    });
  }
});

// POST /api/tenants - Create new tenant with admin user
router.post('/', validateTenant, async (req, res) => {
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
      name, 
      email, 
      domain, 
      address, 
      phone, 
      type, 
      subscriptionPlan, 
      maxUsers, 
      features, 
      timezone, 
      language, 
      currency,
      // Admin user data
      adminFirstName,
      adminLastName,
      adminEmail,
      adminPhone,
      adminPassword
    } = req.body;
    
    // Check if email or domain already exists
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { email: email },
          { domain: domain }
        ]
      }
    });
    
    if (existingTenant) {
      return res.status(409).json({
        success: false,
        message: 'Tenant with this email or domain already exists'
      });
    }

    // Calculate subscription expiry
    const subscriptionExpiry = subscriptionPlan === 'TRIAL' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

    // Create tenant and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name,
          email,
          domain,
          address,
          phone,
          type,
          status: 'TRIAL',
          subscriptionPlan,
          maxUsers,
          features: features ? JSON.stringify(features) : JSON.stringify(['Basic Features']),
          timezone,
          language,
          currency,
          subscriptionExpiry,
          lastActivity: new Date()
        }
      });

      // Hash admin password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      // Create admin user
      const adminUser = await tx.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          firstName: adminFirstName,
          lastName: adminLastName,
          phone: adminPhone,
          tenantId: tenant.id,
          status: 'ACTIVE'
        }
      });

      // Get or create Tenant Admin role
      let tenantAdminRole = await tx.role.findFirst({
        where: {
          tenantId: tenant.id,
          name: 'Tenant Admin'
        }
      });

      if (!tenantAdminRole) {
        // Create Tenant Admin role if it doesn't exist
        tenantAdminRole = await tx.role.create({
          data: {
            tenantId: tenant.id,
            name: 'Tenant Admin',
            description: 'School administrator with full access to school management',
            isSystem: true
          }
        });

        // Define default permissions for Tenant Admin
        const defaultPermissions = [
          { name: 'users:read', description: 'View users', resource: 'users', action: 'read' },
          { name: 'users:create', description: 'Create users', resource: 'users', action: 'create' },
          { name: 'users:update', description: 'Update users', resource: 'users', action: 'update' },
          { name: 'users:delete', description: 'Delete users', resource: 'users', action: 'delete' },
          { name: 'courses:read', description: 'View courses', resource: 'courses', action: 'read' },
          { name: 'courses:create', description: 'Create courses', resource: 'courses', action: 'create' },
          { name: 'courses:update', description: 'Update courses', resource: 'courses', action: 'update' },
          { name: 'courses:delete', description: 'Delete courses', resource: 'courses', action: 'delete' },
          { name: 'subjects:read', description: 'View subjects', resource: 'subjects', action: 'read' },
          { name: 'subjects:create', description: 'Create subjects', resource: 'subjects', action: 'create' },
          { name: 'subjects:update', description: 'Update subjects', resource: 'subjects', action: 'update' },
          { name: 'subjects:delete', description: 'Delete subjects', resource: 'subjects', action: 'delete' },
          { name: 'examinations:read', description: 'View examinations', resource: 'examinations', action: 'read' },
          { name: 'examinations:create', description: 'Create examinations', resource: 'examinations', action: 'create' },
          { name: 'examinations:update', description: 'Update examinations', resource: 'examinations', action: 'update' },
          { name: 'examinations:delete', description: 'Delete examinations', resource: 'examinations', action: 'delete' },
          { name: 'grades:read', description: 'View grades', resource: 'grades', action: 'read' },
          { name: 'grades:create', description: 'Create grades', resource: 'grades', action: 'create' },
          { name: 'grades:update', description: 'Update grades', resource: 'grades', action: 'update' },
          { name: 'grades:delete', description: 'Delete grades', resource: 'grades', action: 'delete' },
          { name: 'grading-scales:read', description: 'View grading scales', resource: 'grading-scales', action: 'read' },
          { name: 'grading-scales:create', description: 'Create grading scales', resource: 'grading-scales', action: 'create' },
          { name: 'academic-years:read', description: 'View academic years', resource: 'academic-years', action: 'read' },
          { name: 'academic-years:create', description: 'Create academic years', resource: 'academic-years', action: 'create' },
          { name: 'academic-years:update', description: 'Update academic years', resource: 'academic-years', action: 'update' },
          { name: 'academic-years:delete', description: 'Delete academic years', resource: 'academic-years', action: 'delete' },
          { name: 'reports:read', description: 'View reports', resource: 'reports', action: 'read' },
          { name: 'analytics:read', description: 'View analytics', resource: 'analytics', action: 'read' }
        ];

        // Create/assign permissions to the new role
        for (const permissionData of defaultPermissions) {
          // Create or get the permission
          const permission = await tx.permission.upsert({
            where: {
              name: permissionData.name
            },
            update: {
              description: permissionData.description,
              resource: permissionData.resource,
              action: permissionData.action
            },
            create: {
              name: permissionData.name,
              description: permissionData.description,
              resource: permissionData.resource,
              action: permissionData.action
            }
          });

          // Assign permission to role
          await tx.rolePermission.create({
            data: {
              roleId: tenantAdminRole.id,
              permissionId: permission.id
            }
          });
        }
      }

      // Assign Tenant Admin role to user
      await tx.userRole.create({
        data: {
          userId: adminUser.id,
          roleId: tenantAdminRole.id
        }
      });

      return { tenant, adminUser };
    });

    // Transform the response
    const transformedTenant = {
      id: result.tenant.id,
      name: result.tenant.name,
      domain: result.tenant.domain,
      status: result.tenant.status,
      adminEmail: result.adminUser.email,
      adminName: `${result.adminUser.firstName} ${result.adminUser.lastName}`,
      createdAt: result.tenant.createdAt.toISOString().split('T')[0],
      userCount: 1,
      subscriptionPlan: result.tenant.subscriptionPlan,
      lastActivity: result.tenant.lastActivity.toISOString().split('T')[0],
      subscriptionExpiry: result.tenant.subscriptionExpiry?.toISOString().split('T')[0],
      maxUsers: result.tenant.maxUsers,
      features: result.tenant.features,
      address: result.tenant.address,
      phone: result.tenant.phone,
      email: result.tenant.email,
      type: result.tenant.type,
      timezone: result.tenant.timezone,
      language: result.tenant.language,
      currency: result.tenant.currency
    };

    res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      data: transformedTenant
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tenant',
      error: error.message
    });
  }
});

// PUT /api/tenants/:id - Update tenant
router.put('/:id', async (req, res) => {
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
      name, 
      email, 
      domain, 
      address, 
      phone, 
      type, 
      subscriptionPlan, 
      maxUsers, 
      features, 
      timezone, 
      language, 
      currency 
    } = req.body;
    
    // Check if email or domain already exists (excluding current tenant)
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        AND: [
          { id: { not: req.params.id } },
          {
            OR: [
              { email: email },
              { domain: domain }
            ]
          }
        ]
      }
    });
    
    if (existingTenant) {
      return res.status(409).json({
        success: false,
        message: 'Tenant with this email or domain already exists'
      });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: req.params.id },
      data: {
        name,
        email,
        domain,
        address,
        phone,
        type,
        subscriptionPlan,
        maxUsers,
        features: features || ['Basic Features'],
        timezone,
        language,
        currency,
        lastActivity: new Date()
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    // Transform the response
    const transformedTenant = {
      id: updatedTenant.id,
      name: updatedTenant.name,
      domain: updatedTenant.domain,
      status: updatedTenant.status,
      adminEmail: updatedTenant.email,
      adminName: updatedTenant.users.find(u => u.email === updatedTenant.email)?.firstName + ' ' + updatedTenant.users.find(u => u.email === updatedTenant.email)?.lastName || 'N/A',
      createdAt: updatedTenant.createdAt.toISOString().split('T')[0],
      userCount: updatedTenant._count.users,
      subscriptionPlan: updatedTenant.subscriptionPlan,
      lastActivity: updatedTenant.lastActivity.toISOString().split('T')[0],
      subscriptionExpiry: updatedTenant.subscriptionExpiry?.toISOString().split('T')[0],
      maxUsers: updatedTenant.maxUsers,
      features: updatedTenant.features,
      address: updatedTenant.address,
      phone: updatedTenant.phone,
      email: updatedTenant.email,
      type: updatedTenant.type,
      timezone: updatedTenant.timezone,
      language: updatedTenant.language,
      currency: updatedTenant.currency
    };

    res.json({
      success: true,
      message: 'Tenant updated successfully',
      data: transformedTenant
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tenant',
      error: error.message
    });
  }
});

// PUT /api/tenants/:id/status - Update tenant status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: req.params.id },
      data: {
        status,
        lastActivity: new Date()
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    // Transform the response
    const transformedTenant = {
      id: updatedTenant.id,
      name: updatedTenant.name,
      domain: updatedTenant.domain,
      status: updatedTenant.status,
      adminEmail: updatedTenant.email,
      adminName: updatedTenant.users.find(u => u.email === updatedTenant.email)?.firstName + ' ' + updatedTenant.users.find(u => u.email === updatedTenant.email)?.lastName || 'N/A',
      createdAt: updatedTenant.createdAt.toISOString().split('T')[0],
      userCount: updatedTenant._count.users,
      subscriptionPlan: updatedTenant.subscriptionPlan,
      lastActivity: updatedTenant.lastActivity.toISOString().split('T')[0],
      subscriptionExpiry: updatedTenant.subscriptionExpiry?.toISOString().split('T')[0],
      maxUsers: updatedTenant.maxUsers,
      features: updatedTenant.features,
      address: updatedTenant.address,
      phone: updatedTenant.phone,
      email: updatedTenant.email,
      type: updatedTenant.type,
      timezone: updatedTenant.timezone,
      language: updatedTenant.language,
      currency: updatedTenant.currency
    };

    res.json({
      success: true,
      message: 'Tenant status updated successfully',
      data: transformedTenant
    });
  } catch (error) {
    console.error('Error updating tenant status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tenant status',
      error: error.message
    });
  }
});

// DELETE /api/tenants/:id - Delete tenant
router.delete('/:id', async (req, res) => {
  try {
    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.params.id }
    });
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Delete tenant (cascade will handle related records)
    await prisma.tenant.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tenant',
      error: error.message
    });
  }
});

module.exports = router;

