const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Validation rules
const validateRole = [
  body('name').notEmpty().withMessage('Role name is required'),
  body('description').optional().isString(),
  body('permissionIds').optional().isArray(),
];

// Get all roles for tenant
const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      where: { tenantId: req.tenantId },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        createdAt: role.createdAt,
        permissions: role.rolePermissions.map(rp => rp.permission),
        userCount: role.userRoles.length,
        users: role.userRoles.map(ur => ur.user)
      }))
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

// Create new role
const createRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, permissionIds } = req.body;

    // Check if role already exists in tenant
    const existingRole = await prisma.role.findFirst({
      where: { 
        tenantId: req.tenantId,
        name: name
      }
    });

    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: 'Role with this name already exists in this tenant'
      });
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        name,
        description,
        tenantId: req.tenantId,
        isSystem: false
      },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    // Assign permissions if provided
    if (permissionIds && permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({
          roleId: role.id,
          permissionId: permissionId
        }))
      });
    }

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        createdAt: role.createdAt,
        permissions: role.rolePermissions.map(rp => rp.permission)
      }
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create role',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update role
const updateRole = async (req, res) => {
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
    const { name, description, permissionIds } = req.body;

    // Check if role exists and belongs to tenant
    const existingRole = await prisma.role.findFirst({
      where: { 
        id: id,
        tenantId: req.tenantId
      }
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Check if role is system role (cannot be modified)
    if (existingRole.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify system roles'
      });
    }

    // Check if new name conflicts with existing role
    if (name !== existingRole.name) {
      const nameConflict = await prisma.role.findFirst({
        where: { 
          tenantId: req.tenantId,
          name: name,
          id: { not: id }
        }
      });

      if (nameConflict) {
        return res.status(409).json({
          success: false,
          message: 'Role with this name already exists in this tenant'
        });
      }
    }

    // Update role
    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        description
      },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    // Update permissions if provided
    if (permissionIds) {
      // Remove existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: id }
      });

      // Add new permissions
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map(permissionId => ({
            roleId: id,
            permissionId: permissionId
          }))
        });
      }
    }

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        updatedAt: role.updatedAt,
        permissions: role.rolePermissions.map(rp => rp.permission)
      }
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists and belongs to tenant
    const existingRole = await prisma.role.findFirst({
      where: { 
        id: id,
        tenantId: req.tenantId
      },
      include: {
        userRoles: true
      }
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Check if role is system role (cannot be deleted)
    if (existingRole.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete system roles'
      });
    }

    // Check if role is assigned to users
    if (existingRole.userRoles.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete role that is assigned to users',
        userCount: existingRole.userRoles.length
      });
    }

    // Delete role (cascade will handle related records)
    await prisma.role.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete role',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all permissions
const getPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' }
      ]
    });

    // Group permissions by resource
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        permissions,
        groupedPermissions
      }
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get permissions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  validateRole
};


