const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addLibraryPermissions() {
  try {
    console.log('🔑 Adding library permissions to existing users...');

    // Step 1: Ensure library permissions exist
    const libraryPermissions = [
      {
        name: 'library:read',
        description: 'View library resources and data',
        resource: 'library',
        action: 'read'
      },
      {
        name: 'library:create',
        description: 'Add new books and library resources',
        resource: 'library',
        action: 'create'
      },
      {
        name: 'library:update',
        description: 'Update library resources and circulation',
        resource: 'library',
        action: 'update'
      },
      {
        name: 'library:delete',
        description: 'Remove library resources',
        resource: 'library',
        action: 'delete'
      },
      {
        name: 'library:manage',
        description: 'Full library management access',
        resource: 'library',
        action: 'manage'
      },
      {
        name: 'library:circulation',
        description: 'Issue and return books',
        resource: 'library',
        action: 'circulation'
      },
      {
        name: 'library:reports',
        description: 'Generate library reports and analytics',
        resource: 'library',
        action: 'reports'
      }
    ];

    for (const permission of libraryPermissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission
      });
      console.log(`📋 Ensured permission exists: ${permission.name}`);
    }

    // Step 2: Get all library permissions
    const allLibraryPermissions = await prisma.permission.findMany({
      where: {
        name: {
          startsWith: 'library:'
        }
      }
    });

    console.log(`Found ${allLibraryPermissions.length} library permissions`);

    // Step 3: Get all roles and assign appropriate permissions
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    for (const role of roles) {
      console.log(`\n👤 Processing role: ${role.name}`);

      let permissionsToAdd = [];

      // Determine which permissions each role should have
      switch (role.name.toLowerCase()) {
        case 'super admin':
          // Super Admin gets all library permissions
          permissionsToAdd = allLibraryPermissions;
          console.log('  -> Assigning ALL library permissions (Super Admin)');
          break;

        case 'school admin':
        case 'tenant admin':
          // School/Tenant Admin gets all library permissions
          permissionsToAdd = allLibraryPermissions;
          console.log('  -> Assigning ALL library permissions (School Admin)');
          break;

        case 'librarian':
          // Librarian gets all library permissions
          permissionsToAdd = allLibraryPermissions;
          console.log('  -> Assigning ALL library permissions (Librarian)');
          break;

        case 'teacher':
          // Teachers get read and circulation permissions
          permissionsToAdd = allLibraryPermissions.filter(p =>
            p.name === 'library:read' || p.name === 'library:circulation'
          );
          console.log('  -> Assigning READ and CIRCULATION permissions (Teacher)');
          break;

        case 'student':
          // Students get read-only permissions
          permissionsToAdd = allLibraryPermissions.filter(p =>
            p.name === 'library:read'
          );
          console.log('  -> Assigning READ permissions (Student)');
          break;

        default:
          console.log('  -> No library permissions assigned (Unknown role)');
          continue;
      }

      // Add permissions to role
      for (const permission of permissionsToAdd) {
        try {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id
              }
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permission.id
            }
          });
          console.log(`    ✅ Added permission: ${permission.name}`);
        } catch (error) {
          console.log(`    ⚠️  Permission already exists: ${permission.name}`);
        }
      }
    }

    // Step 4: Create Librarian role if it doesn't exist
    const tenants = await prisma.tenant.findMany();

    for (const tenant of tenants) {
      const librarianRole = await prisma.role.upsert({
        where: {
          tenantId_name: {
            tenantId: tenant.id,
            name: 'Librarian'
          }
        },
        update: {},
        create: {
          tenantId: tenant.id,
          name: 'Librarian',
          description: 'Library staff with full library management access'
        }
      });

      console.log(`\n📚 Ensured Librarian role exists for tenant: ${tenant.name}`);

      // Assign all library permissions to librarian role
      for (const permission of allLibraryPermissions) {
        try {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: librarianRole.id,
                permissionId: permission.id
              }
            },
            update: {},
            create: {
              roleId: librarianRole.id,
              permissionId: permission.id
            }
          });
        } catch (error) {
          // Permission already exists, continue
        }
      }
      console.log(`✅ Assigned all library permissions to Librarian role`);
    }

    // Step 5: Show summary
    console.log('\n📊 Summary:');
    console.log(`- ✅ Library permissions created: ${libraryPermissions.length}`);
    console.log(`- ✅ Roles processed: ${roles.length}`);
    console.log(`- ✅ Librarian roles ensured: ${tenants.length}`);

    console.log('\n🎉 Library permissions have been successfully added!');
    console.log('\n💡 Tip: Restart your Next.js application to see the changes reflected.');

  } catch (error) {
    console.error('❌ Error adding library permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  addLibraryPermissions()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = addLibraryPermissions;
