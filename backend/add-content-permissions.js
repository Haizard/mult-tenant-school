const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addContentPermissions() {
  try {
    console.log('🚀 Adding Content Management permissions...');

    // Define content management permissions
    const contentPermissions = [
      // Content CRUD permissions
      {
        name: 'content.create',
        description: 'Create educational content'
      },
      {
        name: 'content.read',
        description: 'View educational content'
      },
      {
        name: 'content.update',
        description: 'Edit educational content'
      },
      {
        name: 'content.delete',
        description: 'Delete educational content'
      },
      
      // Content sharing permissions
      {
        name: 'content.share',
        description: 'Share content with students and classes'
      },
      {
        name: 'content.assign',
        description: 'Assign content to students'
      },
      
      // Content management permissions
      {
        name: 'content.approve',
        description: 'Approve content for publication'
      },
      {
        name: 'content.publish',
        description: 'Publish content to students'
      },
      {
        name: 'content.archive',
        description: 'Archive outdated content'
      },
      
      // Content analytics permissions
      {
        name: 'content.analytics.view',
        description: 'View content usage analytics'
      },
      {
        name: 'content.reports.generate',
        description: 'Generate content reports'
      },
      
      // Content version permissions
      {
        name: 'content.versions.view',
        description: 'View content version history'
      },
      {
        name: 'content.versions.restore',
        description: 'Restore previous content versions'
      },
      
      // Content collection permissions
      {
        name: 'content.collections.create',
        description: 'Create content collections'
      },
      {
        name: 'content.collections.manage',
        description: 'Manage content collections'
      },
      
      // File management permissions
      {
        name: 'content.upload',
        description: 'Upload content files'
      },
      {
        name: 'content.download',
        description: 'Download content files'
      }
    ];

    // Create permissions
    for (const permission of contentPermissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: {
          description: permission.description
        },
        create: permission
      });
    }

    console.log('✅ Content permissions created successfully');

    // Assign permissions to roles
    const roles = await prisma.role.findMany();
    
    for (const role of roles) {
      let permissionsToAssign = [];
      
      switch (role.name) {
        case 'SUPER_ADMIN':
          // Super admin gets all content permissions
          permissionsToAssign = contentPermissions.map(p => p.name);
          break;
          
        case 'TENANT_ADMIN':
          // Tenant admin gets all content permissions within their tenant
          permissionsToAssign = contentPermissions.map(p => p.name);
          break;
          
        case 'TEACHER':
          // Teachers can create, share, and manage their own content
          permissionsToAssign = [
            'content.create',
            'content.read',
            'content.update',
            'content.delete',
            'content.share',
            'content.assign',
            'content.publish',
            'content.analytics.view',
            'content.reports.generate',
            'content.versions.view',
            'content.versions.restore',
            'content.collections.create',
            'content.collections.manage',
            'content.upload',
            'content.download'
          ];
          break;
          
        case 'STUDENT':
          // Students can only view and download assigned content
          permissionsToAssign = [
            'content.read',
            'content.download'
          ];
          break;
          
        case 'PARENT':
          // Parents can view content assigned to their children
          permissionsToAssign = [
            'content.read'
          ];
          break;
          
        case 'STAFF':
          // Staff can view and manage content
          permissionsToAssign = [
            'content.read',
            'content.share',
            'content.analytics.view',
            'content.download'
          ];
          break;
          
        case 'FINANCE_STAFF':
          // Finance staff minimal content access
          permissionsToAssign = [
            'content.read'
          ];
          break;
      }
      
      // Assign permissions to role
      for (const permissionName of permissionsToAssign) {
        const permission = await prisma.permission.findUnique({
          where: { name: permissionName }
        });
        
        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              role_id_permission_id: {
                role_id: role.id,
                permission_id: permission.id
              }
            },
            update: {},
            create: {
              role_id: role.id,
              permission_id: permission.id
            }
          });
        }
      }
      
      console.log(`✅ Assigned content permissions to ${role.name}`);
    }

    console.log('🎉 Content management permissions setup completed!');

  } catch (error) {
    console.error('❌ Error setting up content permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
if (require.main === module) {
  addContentPermissions()
    .then(() => {
      console.log('✅ Content permissions setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to setup content permissions:', error);
      process.exit(1);
    });
}

module.exports = addContentPermissions;
