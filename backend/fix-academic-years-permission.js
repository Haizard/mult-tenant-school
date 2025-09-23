const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAcademicYearsPermission() {
  try {
    console.log('🔍 Checking academic-years:read permission...');

    // Check if academic-years:read permission exists
    const academicYearsReadPermission = await prisma.permission.findFirst({
      where: {
        name: 'academic-years:read'
      }
    });

    if (!academicYearsReadPermission) {
      console.log('❌ academic-years:read permission not found in database');
      return;
    }

    console.log('✅ Found academic-years:read permission');

    // Get all users with their roles and permissions
    const users = await prisma.user.findMany({
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

    console.log('\n📊 Current Users and their academic-years:read permission status:');
    
    for (const user of users) {
      console.log(`\n👤 User: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`🏢 Tenant: ${user.tenant.name}`);
      
      const userRoles = user.userRoles.map(ur => ur.role.name);
      console.log(`🔑 Roles: ${userRoles.join(', ')}`);
      
      const permissions = user.userRoles.flatMap(ur =>
        ur.role.rolePermissions.map(rp => rp.permission.name)
      );
      
      const hasAcademicYearsRead = permissions.includes('academic-years:read');
      console.log(`📋 Has academic-years:read: ${hasAcademicYearsRead ? '✅ YES' : '❌ NO'}`);
      
      // If user doesn't have the permission, add it to their roles
      if (!hasAcademicYearsRead) {
        console.log('🔧 Adding academic-years:read permission to user roles...');
        
        for (const userRole of user.userRoles) {
          const role = userRole.role;
          
          // Check if this role already has the permission
          const roleHasPermission = role.rolePermissions.some(rp => 
            rp.permission.name === 'academic-years:read'
          );
          
          if (!roleHasPermission) {
            try {
              await prisma.rolePermission.create({
                data: {
                  roleId: role.id,
                  permissionId: academicYearsReadPermission.id
                }
              });
              console.log(`✅ Added academic-years:read to role: ${role.name}`);
            } catch (error) {
              if (error.code === 'P2002') {
                console.log(`✅ Role ${role.name} already has academic-years:read permission`);
              } else {
                console.error(`❌ Error adding permission to role ${role.name}:`, error.message);
              }
            }
          } else {
            console.log(`✅ Role ${role.name} already has academic-years:read permission`);
          }
        }
      }
    }

    console.log('\n🎉 Academic years permission fix completed!');
    console.log('\n💡 Note: Users may need to log out and log back in for changes to take effect.');

  } catch (error) {
    console.error('❌ Error fixing academic years permission:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAcademicYearsPermission();