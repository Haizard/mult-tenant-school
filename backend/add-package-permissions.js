const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addPackagePermissions() {
  try {
    console.log('🔧 Adding package management permissions...');

    // Step 1: Create package permissions
    const packagePermissions = [
      // Package management
      { name: 'packages:create', description: 'Create service packages', resource: 'packages', action: 'create' },
      { name: 'packages:read', description: 'Read service packages', resource: 'packages', action: 'read' },
      { name: 'packages:update', description: 'Update service packages', resource: 'packages', action: 'update' },
      { name: 'packages:delete', description: 'Delete service packages', resource: 'packages', action: 'delete' },

      // Subscription management
      { name: 'subscriptions:create', description: 'Create subscriptions', resource: 'subscriptions', action: 'create' },
      { name: 'subscriptions:read', description: 'Read subscriptions', resource: 'subscriptions', action: 'read' },
      { name: 'subscriptions:update', description: 'Update subscriptions', resource: 'subscriptions', action: 'update' },
      { name: 'subscriptions:delete', description: 'Delete subscriptions', resource: 'subscriptions', action: 'delete' },

      // Pricing management
      { name: 'pricing:create', description: 'Create pricing', resource: 'pricing', action: 'create' },
      { name: 'pricing:read', description: 'Read pricing', resource: 'pricing', action: 'read' },
      { name: 'pricing:update', description: 'Update pricing', resource: 'pricing', action: 'update' },

      // Billing management
      { name: 'billing:create', description: 'Create billing records', resource: 'billing', action: 'create' },
      { name: 'billing:read', description: 'Read billing records', resource: 'billing', action: 'read' },
      { name: 'billing:update', description: 'Update billing records', resource: 'billing', action: 'update' },

      // Analytics
      { name: 'analytics:read', description: 'Read analytics', resource: 'analytics', action: 'read' },

      // Usage tracking
      { name: 'usage:create', description: 'Track usage', resource: 'usage', action: 'create' },
      { name: 'usage:read', description: 'Read usage data', resource: 'usage', action: 'read' }
    ];

    console.log('📋 Creating permissions...');
    for (const permission of packagePermissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission
      });
      console.log(`✅ Permission created: ${permission.name}`);
    }

    // Step 2: Get all package permissions
    const allPackagePermissions = await prisma.permission.findMany({
      where: {
        name: {
          startsWith: 'packages:'
        }
      }
    });

    const subscriptionPermissions = await prisma.permission.findMany({
      where: {
        name: {
          startsWith: 'subscriptions:'
        }
      }
    });

    const pricingPermissions = await prisma.permission.findMany({
      where: {
        name: {
          startsWith: 'pricing:'
        }
      }
    });

    const billingPermissions = await prisma.permission.findMany({
      where: {
        name: {
          startsWith: 'billing:'
        }
      }
    });

    const analyticsPermissions = await prisma.permission.findMany({
      where: {
        name: {
          startsWith: 'analytics:'
        }
      }
    });

    const usagePermissions = await prisma.permission.findMany({
      where: {
        name: {
          startsWith: 'usage:'
        }
      }
    });

    // Step 3: Get all roles
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    console.log(`\n👥 Found ${roles.length} roles`);

    // Step 4: Assign permissions to roles
    for (const role of roles) {
      console.log(`\n🔐 Processing role: ${role.name}`);

      let permissionsToAssign = [];

      // Super Admin gets all package permissions
      if (role.name === 'Super Admin') {
        permissionsToAssign = [
          ...allPackagePermissions,
          ...subscriptionPermissions,
          ...pricingPermissions,
          ...billingPermissions,
          ...analyticsPermissions,
          ...usagePermissions
        ];
        console.log(`  ➕ Assigning ${permissionsToAssign.length} package permissions to Super Admin`);
      }

      // Tenant Admin gets subscription, billing, and analytics permissions
      if (role.name === 'Tenant Admin' || role.name === 'School Admin') {
        permissionsToAssign = [
          ...subscriptionPermissions,
          ...billingPermissions,
          ...analyticsPermissions,
          ...usagePermissions
        ];
        console.log(`  ➕ Assigning ${permissionsToAssign.length} subscription/billing permissions to ${role.name}`);
      }

      // Assign permissions
      for (const permission of permissionsToAssign) {
        const existingAssignment = role.rolePermissions.find(rp => rp.permissionId === permission.id);

        if (!existingAssignment) {
          await prisma.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId: permission.id
            }
          });
          console.log(`  ✅ Assigned: ${permission.name}`);
        }
      }
    }

    console.log('\n✅ Package permissions added successfully!');
  } catch (error) {
    console.error('❌ Error adding package permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPackagePermissions();

