const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTransportPermissions() {
  try {
    console.log('Adding transport management permissions...');

    // Define transport permissions
    const transportPermissions = [
      {
        name: 'transport.read',
        description: 'View transport routes, vehicles, and drivers',
        resource: 'transport',
        action: 'read'
      },
      {
        name: 'transport.manage',
        description: 'Manage transport routes, vehicles, drivers, and student assignments',
        resource: 'transport',
        action: 'manage'
      },
      {
        name: 'transport.routes.manage',
        description: 'Manage transport routes',
        resource: 'transport_routes',
        action: 'manage'
      },
      {
        name: 'transport.vehicles.manage',
        description: 'Manage vehicles and maintenance',
        resource: 'transport_vehicles',
        action: 'manage'
      },
      {
        name: 'transport.drivers.manage',
        description: 'Manage drivers and assignments',
        resource: 'transport_drivers',
        action: 'manage'
      },
      {
        name: 'transport.students.manage',
        description: 'Manage student transport assignments',
        resource: 'transport_students',
        action: 'manage'
      },
      {
        name: 'transport.fees.manage',
        description: 'Manage transport fees and billing',
        resource: 'transport_fees',
        action: 'manage'
      },
      {
        name: 'transport.reports.read',
        description: 'View transport reports and analytics',
        resource: 'transport_reports',
        action: 'read'
      }
    ];

    // Create permissions if they don't exist
    for (const permission of transportPermissions) {
      const existingPermission = await prisma.permission.findUnique({
        where: { name: permission.name }
      });

      if (!existingPermission) {
        await prisma.permission.create({
          data: permission
        });
        console.log(`✓ Created permission: ${permission.name}`);
      } else {
        console.log(`- Permission already exists: ${permission.name}`);
      }
    }

    // Get all tenants to add role permissions
    const tenants = await prisma.tenant.findMany();

    for (const tenant of tenants) {
      console.log(`\nProcessing tenant: ${tenant.name}`);

      // Find roles for this tenant
      const superAdminRole = await prisma.role.findFirst({
        where: { tenantId: tenant.id, name: 'Super Admin' }
      });

      const tenantAdminRole = await prisma.role.findFirst({
        where: { tenantId: tenant.id, name: 'Tenant Admin' }
      });

      const transportStaffRole = await prisma.role.findFirst({
        where: { tenantId: tenant.id, name: 'Transport Staff' }
      });

      // Create Transport Staff role if it doesn't exist
      let transportRole = transportStaffRole;
      if (!transportStaffRole) {
        transportRole = await prisma.role.create({
          data: {
            tenantId: tenant.id,
            name: 'Transport Staff',
            description: 'Transport management staff with access to transport operations',
            isSystem: false
          }
        });
        console.log(`✓ Created Transport Staff role for tenant: ${tenant.name}`);
      }

      // Assign all transport permissions to Super Admin and Tenant Admin
      const adminRoles = [superAdminRole, tenantAdminRole].filter(Boolean);
      
      for (const role of adminRoles) {
        for (const permissionData of transportPermissions) {
          const permission = await prisma.permission.findUnique({
            where: { name: permissionData.name }
          });

          if (permission) {
            const existingRolePermission = await prisma.rolePermission.findUnique({
              where: {
                roleId_permissionId: {
                  roleId: role.id,
                  permissionId: permission.id
                }
              }
            });

            if (!existingRolePermission) {
              await prisma.rolePermission.create({
                data: {
                  roleId: role.id,
                  permissionId: permission.id
                }
              });
              console.log(`✓ Assigned ${permissionData.name} to ${role.name}`);
            }
          }
        }
      }

      // Assign specific transport permissions to Transport Staff role
      const transportStaffPermissions = [
        'transport.read',
        'transport.routes.manage',
        'transport.vehicles.manage',
        'transport.drivers.manage',
        'transport.students.manage',
        'transport.reports.read'
      ];

      if (transportRole) {
        for (const permissionName of transportStaffPermissions) {
          const permission = await prisma.permission.findUnique({
            where: { name: permissionName }
          });

          if (permission) {
            const existingRolePermission = await prisma.rolePermission.findUnique({
              where: {
                roleId_permissionId: {
                  roleId: transportRole.id,
                  permissionId: permission.id
                }
              }
            });

            if (!existingRolePermission) {
              await prisma.rolePermission.create({
                data: {
                  roleId: transportRole.id,
                  permissionId: permission.id
                }
              });
              console.log(`✓ Assigned ${permissionName} to Transport Staff`);
            }
          }
        }
      }

      // Give students and parents limited transport access
      const studentRole = await prisma.role.findFirst({
        where: { tenantId: tenant.id, name: 'Student' }
      });

      const parentRole = await prisma.role.findFirst({
        where: { tenantId: tenant.id, name: 'Parent' }
      });

      const limitedRoles = [studentRole, parentRole].filter(Boolean);
      
      for (const role of limitedRoles) {
        const permission = await prisma.permission.findUnique({
          where: { name: 'transport.read' }
        });

        if (permission) {
          const existingRolePermission = await prisma.rolePermission.findUnique({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id
              }
            }
          });

          if (!existingRolePermission) {
            await prisma.rolePermission.create({
              data: {
                roleId: role.id,
                permissionId: permission.id
              }
            });
            console.log(`✓ Assigned transport.read to ${role.name}`);
          }
        }
      }
    }

    console.log('\n✅ Transport permissions setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up transport permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if called directly
if (require.main === module) {
  addTransportPermissions().catch(console.error);
}

module.exports = addTransportPermissions;
