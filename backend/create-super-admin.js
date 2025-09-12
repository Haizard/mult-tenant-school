const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('🚀 Creating Super Admin...');

    // First, create or find the system tenant
    let systemTenant = await prisma.tenant.findFirst({
      where: { domain: 'system' }
    });

    if (!systemTenant) {
      console.log('📋 Creating system tenant...');
      systemTenant = await prisma.tenant.create({
        data: {
          name: 'System',
          email: 'system@admin.com',
          domain: 'system',
          address: 'System Administration',
          phone: '0000000000',
          type: 'SYSTEM',
          status: 'ACTIVE',
          subscriptionPlan: 'SYSTEM',
          maxUsers: 999999,
          userCount: 0,
          features: JSON.stringify(['System Administration', 'Multi-tenant Management', 'User Management', 'Audit Logs']),
          timezone: 'Africa/Dar_es_Salaam',
          language: 'en',
          currency: 'TZS',
          subscriptionExpiry: new Date('2099-12-31'),
          lastActivity: new Date()
        }
      });
      console.log('✅ System tenant created:', systemTenant.id);
    } else {
      console.log('✅ System tenant already exists:', systemTenant.id);
    }

    // Check if Super Admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        tenantId: systemTenant.id,
        email: 'superadmin@system.com'
      }
    });

    if (existingSuperAdmin) {
      console.log('⚠️ Super Admin already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('superadmin123', 12);

    // Create Super Admin user
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@system.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        phone: '0000000000',
        address: 'System Administration',
        tenantId: systemTenant.id,
        status: 'ACTIVE'
      }
    });

    console.log('✅ Super Admin user created:', superAdmin.id);

    // Create Super Admin role
    let superAdminRole = await prisma.role.findFirst({
      where: {
        tenantId: systemTenant.id,
        name: 'Super Admin'
      }
    });

    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({
        data: {
          tenantId: systemTenant.id,
          name: 'Super Admin',
          description: 'System-wide administrator with full access to all tenants and features',
          isSystem: true
        }
      });
      console.log('✅ Super Admin role created:', superAdminRole.id);
    }

    // Assign Super Admin role to user
    await prisma.userRole.create({
      data: {
        userId: superAdmin.id,
        roleId: superAdminRole.id
      }
    });

    console.log('✅ Super Admin role assigned to user');

    // Create system permissions
    const permissions = [
      { name: 'manage_tenants', description: 'Manage all tenants', resource: 'tenants', action: 'all' },
      { name: 'manage_users', description: 'Manage all users', resource: 'users', action: 'all' },
      { name: 'view_audit_logs', description: 'View system audit logs', resource: 'audit_logs', action: 'read' },
      { name: 'system_settings', description: 'Manage system settings', resource: 'system', action: 'all' },
      { name: 'manage_roles', description: 'Manage roles and permissions', resource: 'roles', action: 'all' }
    ];

    for (const perm of permissions) {
      let permission = await prisma.permission.findFirst({
        where: { name: perm.name }
      });

      if (!permission) {
        permission = await prisma.permission.create({
          data: perm
        });
        console.log(`✅ Permission created: ${perm.name}`);
      }

      // Assign permission to Super Admin role
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id
        }
      });
    }

    console.log('🎉 Super Admin created successfully!');
    console.log('📧 Email: superadmin@system.com');
    console.log('🔑 Password: superadmin123');
    console.log('🏢 Tenant: System (ID: ' + systemTenant.id + ')');

  } catch (error) {
    console.error('❌ Error creating Super Admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
