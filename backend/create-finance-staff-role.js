const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createFinanceStaffRole() {
  try {
    console.log('Creating Finance Staff role and permissions...');

    // Get all tenants
    const tenants = await prisma.tenant.findMany();
    
    if (tenants.length === 0) {
      console.log('No tenants found. Please create a tenant first.');
      return;
    }

    // Create Finance Staff role for each tenant
    for (const tenant of tenants) {
      console.log(`Creating Finance Staff role for tenant: ${tenant.name}`);

      // Check if Finance Staff role already exists
      const existingRole = await prisma.role.findFirst({
        where: {
          tenantId: tenant.id,
          name: 'Finance Staff'
        }
      });

      if (existingRole) {
        console.log(`Finance Staff role already exists for tenant: ${tenant.name}`);
        continue;
      }

      // Create Finance Staff role
      const financeStaffRole = await prisma.role.create({
        data: {
          tenantId: tenant.id,
          name: 'Finance Staff',
          description: 'Finance staff with comprehensive financial management permissions',
          isSystem: false
        }
      });

      console.log(`Created Finance Staff role with ID: ${financeStaffRole.id}`);

      // Define finance permissions
      const financePermissions = [
        // Finance management
        { resource: 'finance', action: 'create' },
        { resource: 'finance', action: 'read' },
        { resource: 'finance', action: 'update' },
        { resource: 'finance', action: 'delete' },
        
        // Fee management
        { resource: 'fees', action: 'create' },
        { resource: 'fees', action: 'read' },
        { resource: 'fees', action: 'update' },
        { resource: 'fees', action: 'delete' },
        
        // Payment processing
        { resource: 'payments', action: 'create' },
        { resource: 'payments', action: 'read' },
        { resource: 'payments', action: 'update' },
        { resource: 'payments', action: 'delete' },
        
        // Invoice management
        { resource: 'invoices', action: 'create' },
        { resource: 'invoices', action: 'read' },
        { resource: 'invoices', action: 'update' },
        { resource: 'invoices', action: 'delete' },
        
        // Expense management
        { resource: 'expenses', action: 'create' },
        { resource: 'expenses', action: 'read' },
        { resource: 'expenses', action: 'update' },
        { resource: 'expenses', action: 'delete' },
        { resource: 'expenses', action: 'approve' },
        
        // Budget management
        { resource: 'budgets', action: 'create' },
        { resource: 'budgets', action: 'read' },
        { resource: 'budgets', action: 'update' },
        { resource: 'budgets', action: 'delete' },
        
        // Refund management
        { resource: 'refunds', action: 'create' },
        { resource: 'refunds', action: 'read' },
        { resource: 'refunds', action: 'update' },
        { resource: 'refunds', action: 'approve' },
        { resource: 'refunds', action: 'process' },
        
        // Financial reports
        { resource: 'financial_reports', action: 'create' },
        { resource: 'financial_reports', action: 'read' },
        { resource: 'financial_reports', action: 'export' },
        
        // General announcements
        { resource: 'announcements', action: 'read' }
      ];

      // Create permissions and assign to role
      for (const perm of financePermissions) {
        // Find or create permission
        let permission = await prisma.permission.findFirst({
          where: {
            resource: perm.resource,
            action: perm.action
          }
        });

        if (!permission) {
          permission = await prisma.permission.create({
            data: {
              name: `${perm.resource}_${perm.action}`,
              description: `${perm.action} permission for ${perm.resource}`,
              resource: perm.resource,
              action: perm.action
            }
          });
        }

        // Create role permission relationship
        await prisma.rolePermission.create({
          data: {
            roleId: financeStaffRole.id,
            permissionId: permission.id
          }
        });
      }

      console.log(`Assigned ${financePermissions.length} permissions to Finance Staff role for tenant: ${tenant.name}`);
    }

    console.log('✅ Finance Staff role creation completed successfully!');
    
    // Create a sample Finance Staff user for each tenant
    for (const tenant of tenants) {
      const financeStaffRole = await prisma.role.findFirst({
        where: {
          tenantId: tenant.id,
          name: 'Finance Staff'
        }
      });

      if (!financeStaffRole) continue;

      // Check if finance staff user already exists
      const existingFinanceStaff = await prisma.user.findFirst({
        where: {
          tenantId: tenant.id,
          email: `finance@${tenant.domain}`
        }
      });

      if (existingFinanceStaff) {
        console.log(`Finance Staff user already exists for tenant: ${tenant.name}`);
        continue;
      }

      // Create Finance Staff user
      const financeStaffUser = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: `finance@${tenant.domain}`,
          password: '$2b$10$example.hash.for.password', // You should hash this properly
          firstName: 'Finance',
          lastName: 'Staff',
          phone: '+255123456789',
          address: 'School Finance Office',
          status: 'ACTIVE'
        }
      });

      // Assign Finance Staff role to user
      await prisma.userRole.create({
        data: {
          userId: financeStaffUser.id,
          roleId: financeStaffRole.id,
          tenantId: tenant.id
        }
      });

      console.log(`Created Finance Staff user: finance@${tenant.domain} for tenant: ${tenant.name}`);
    }

  } catch (error) {
    console.error('Error creating Finance Staff role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createFinanceStaffRole();
