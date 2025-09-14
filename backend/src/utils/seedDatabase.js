const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create default permissions
    const permissions = [
      // User permissions
      { name: 'users:create', description: 'Create users', resource: 'users', action: 'create' },
      { name: 'users:read', description: 'Read users', resource: 'users', action: 'read' },
      { name: 'users:update', description: 'Update users', resource: 'users', action: 'update' },
      { name: 'users:delete', description: 'Delete users', resource: 'users', action: 'delete' },
      
      // Role permissions
      { name: 'roles:create', description: 'Create roles', resource: 'roles', action: 'create' },
      { name: 'roles:read', description: 'Read roles', resource: 'roles', action: 'read' },
      { name: 'roles:update', description: 'Update roles', resource: 'roles', action: 'update' },
      { name: 'roles:delete', description: 'Delete roles', resource: 'roles', action: 'delete' },
      
      // Permission permissions
      { name: 'permissions:read', description: 'Read permissions', resource: 'permissions', action: 'read' },
      
      // Academic permissions
      { name: 'courses:create', description: 'Create courses', resource: 'courses', action: 'create' },
      { name: 'courses:read', description: 'Read courses', resource: 'courses', action: 'read' },
      { name: 'courses:update', description: 'Update courses', resource: 'courses', action: 'update' },
      { name: 'courses:delete', description: 'Delete courses', resource: 'courses', action: 'delete' },
      
      { name: 'subjects:create', description: 'Create subjects', resource: 'subjects', action: 'create' },
      { name: 'subjects:read', description: 'Read subjects', resource: 'subjects', action: 'read' },
      { name: 'subjects:update', description: 'Update subjects', resource: 'subjects', action: 'update' },
      { name: 'subjects:delete', description: 'Delete subjects', resource: 'subjects', action: 'delete' },
      
      // Class permissions
      { name: 'classes:create', description: 'Create classes', resource: 'classes', action: 'create' },
      { name: 'classes:read', description: 'Read classes', resource: 'classes', action: 'read' },
      { name: 'classes:update', description: 'Update classes', resource: 'classes', action: 'update' },
      { name: 'classes:delete', description: 'Delete classes', resource: 'classes', action: 'delete' },
      
      // Examination permissions
      { name: 'examinations:create', description: 'Create examinations', resource: 'examinations', action: 'create' },
      { name: 'examinations:read', description: 'Read examinations', resource: 'examinations', action: 'read' },
      { name: 'examinations:update', description: 'Update examinations', resource: 'examinations', action: 'update' },
      { name: 'examinations:delete', description: 'Delete examinations', resource: 'examinations', action: 'delete' },
      
      // Grade permissions
      { name: 'grades:create', description: 'Create grades', resource: 'grades', action: 'create' },
      { name: 'grades:read', description: 'Read grades', resource: 'grades', action: 'read' },
      { name: 'grades:update', description: 'Update grades', resource: 'grades', action: 'update' },
      { name: 'grades:delete', description: 'Delete grades', resource: 'grades', action: 'delete' },
      
      // Grading scale permissions
      { name: 'grading-scales:create', description: 'Create grading scales', resource: 'grading-scales', action: 'create' },
      { name: 'grading-scales:read', description: 'Read grading scales', resource: 'grading-scales', action: 'read' },
      { name: 'grading-scales:update', description: 'Update grading scales', resource: 'grading-scales', action: 'update' },
      { name: 'grading-scales:delete', description: 'Delete grading scales', resource: 'grading-scales', action: 'delete' },
      
      // Academic year permissions
      { name: 'academic-years:create', description: 'Create academic years', resource: 'academic-years', action: 'create' },
      { name: 'academic-years:read', description: 'Read academic years', resource: 'academic-years', action: 'read' },
      { name: 'academic-years:update', description: 'Update academic years', resource: 'academic-years', action: 'update' },
      { name: 'academic-years:delete', description: 'Delete academic years', resource: 'academic-years', action: 'delete' },
      
      // Schedule permissions
      { name: 'schedules:create', description: 'Create schedules', resource: 'schedules', action: 'create' },
      { name: 'schedules:read', description: 'Read schedules', resource: 'schedules', action: 'read' },
      { name: 'schedules:update', description: 'Update schedules', resource: 'schedules', action: 'update' },
      { name: 'schedules:delete', description: 'Delete schedules', resource: 'schedules', action: 'delete' },
      
      // Tenant permissions
      { name: 'tenants:create', description: 'Create tenants', resource: 'tenants', action: 'create' },
      { name: 'tenants:read', description: 'Read tenants', resource: 'tenants', action: 'read' },
      { name: 'tenants:update', description: 'Update tenants', resource: 'tenants', action: 'update' },
      { name: 'tenants:delete', description: 'Delete tenants', resource: 'tenants', action: 'delete' },
      
      // Audit log permissions
      { name: 'audit-logs:read', description: 'Read audit logs', resource: 'audit-logs', action: 'read' },
    ];

    console.log('📝 Creating permissions...');
    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: permission,
        create: permission
      });
    }

    // Create default tenant
    console.log('🏢 Creating default tenant...');
    const defaultTenant = await prisma.tenant.upsert({
      where: { email: 'admin@schoolsystem.com' },
      update: {},
      create: {
        name: 'Default School',
        email: 'admin@schoolsystem.com',
        domain: 'default-school.system.com'
      }
    });

    // Create default roles
    console.log('👥 Creating default roles...');
    const superAdminRole = await prisma.role.upsert({
      where: { 
        tenantId_name: {
          tenantId: defaultTenant.id,
          name: 'Super Admin'
        }
      },
      update: {},
      create: {
        name: 'Super Admin',
        description: 'System administrator with full access',
        tenantId: defaultTenant.id,
        isSystem: true
      }
    });

    const tenantAdminRole = await prisma.role.upsert({
      where: { 
        tenantId_name: {
          tenantId: defaultTenant.id,
          name: 'Tenant Admin'
        }
      },
      update: {},
      create: {
        name: 'Tenant Admin',
        description: 'School administrator with tenant-level access',
        tenantId: defaultTenant.id,
        isSystem: true
      }
    });

    const teacherRole = await prisma.role.upsert({
      where: { 
        tenantId_name: {
          tenantId: defaultTenant.id,
          name: 'Teacher'
        }
      },
      update: {},
      create: {
        name: 'Teacher',
        description: 'Teacher with academic access',
        tenantId: defaultTenant.id,
        isSystem: true
      }
    });

    const studentRole = await prisma.role.upsert({
      where: { 
        tenantId_name: {
          tenantId: defaultTenant.id,
          name: 'Student'
        }
      },
      update: {},
      create: {
        name: 'Student',
        description: 'Student with limited access',
        tenantId: defaultTenant.id,
        isSystem: true
      }
    });

    // Assign permissions to roles
    console.log('🔐 Assigning permissions to roles...');
    
    // Super Admin gets all permissions
    const allPermissions = await prisma.permission.findMany();
    for (const permission of allPermissions) {
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

    // Tenant Admin gets tenant and academic permissions
    const tenantAdminPermissions = await prisma.permission.findMany({
      where: {
        OR: [
          { resource: 'tenants' },
          { resource: 'users' },
          { resource: 'roles' },
          { resource: 'courses' },
          { resource: 'subjects' },
          { resource: 'classes' },
          { resource: 'examinations' },
          { resource: 'grades' },
          { resource: 'grading-scales' },
          { resource: 'academic-years' },
          { resource: 'schedules' }
        ]
      }
    });

    for (const permission of tenantAdminPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: tenantAdminRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: tenantAdminRole.id,
          permissionId: permission.id
        }
      });
    }

    // Teacher gets read access to academic data
    const teacherPermissions = await prisma.permission.findMany({
      where: {
        OR: [
          { name: 'courses:read' },
          { name: 'subjects:read' },
          { name: 'classes:read' },
          { name: 'examinations:read' },
          { name: 'grades:read' },
          { name: 'grading-scales:read' },
          { name: 'academic-years:read' },
          { name: 'schedules:read' }
        ]
      }
    });

    for (const permission of teacherPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: teacherRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: teacherRole.id,
          permissionId: permission.id
        }
      });
    }

    // Student gets read access to personal academic data
    const studentPermissions = await prisma.permission.findMany({
      where: {
        OR: [
          { name: 'courses:read' },
          { name: 'subjects:read' },
          { name: 'classes:read' },
          { name: 'examinations:read' },
          { name: 'grades:read' },
          { name: 'schedules:read' }
        ]
      }
    });

    for (const permission of studentPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: studentRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: studentRole.id,
          permissionId: permission.id
        }
      });
    }

    // Create default super admin user
    console.log('👤 Creating default super admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const superAdminUser = await prisma.user.upsert({
      where: { 
        tenantId_email: {
          tenantId: defaultTenant.id,
          email: 'admin@schoolsystem.com'
        }
      },
      update: {},
      create: {
        email: 'admin@schoolsystem.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        tenantId: defaultTenant.id,
        status: 'ACTIVE'
      }
    });

    // Assign Super Admin role to user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: superAdminUser.id,
          roleId: superAdminRole.id
        }
      },
      update: {},
      create: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id
      }
    });

    // Create sample Teacher user
    console.log('👨‍🏫 Creating sample teacher user...');
    const teacherPassword = await bcrypt.hash('teacher123', 12);
    
    const teacherUser = await prisma.user.upsert({
      where: { 
        tenantId_email: {
          tenantId: defaultTenant.id,
          email: 'teacher@schoolsystem.com'
        }
      },
      update: {},
      create: {
        email: 'teacher@schoolsystem.com',
        password: teacherPassword,
        firstName: 'John',
        lastName: 'Teacher',
        tenantId: defaultTenant.id,
        status: 'ACTIVE'
      }
    });

    // Assign Teacher role to user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: teacherUser.id,
          roleId: teacherRole.id
        }
      },
      update: {},
      create: {
        userId: teacherUser.id,
        roleId: teacherRole.id
      }
    });

    // Create sample Student user
    console.log('👨‍🎓 Creating sample student user...');
    const studentPassword = await bcrypt.hash('student123', 12);
    
    const studentUser = await prisma.user.upsert({
      where: { 
        tenantId_email: {
          tenantId: defaultTenant.id,
          email: 'student@schoolsystem.com'
        }
      },
      update: {},
      create: {
        email: 'student@schoolsystem.com',
        password: studentPassword,
        firstName: 'Jane',
        lastName: 'Student',
        tenantId: defaultTenant.id,
        status: 'ACTIVE'
      }
    });

    // Assign Student role to user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: studentUser.id,
          roleId: studentRole.id
        }
      },
      update: {},
      create: {
        userId: studentUser.id,
        roleId: studentRole.id
      }
    });

    console.log('✅ Database seeding completed successfully!');
    console.log('📧 Default User Logins:');
    console.log('   Super Admin:');
    console.log('     Email: admin@schoolsystem.com');
    console.log('     Password: admin123');
    console.log('   Teacher:');
    console.log('     Email: teacher@schoolsystem.com');
    console.log('     Password: teacher123');
    console.log('   Student:');
    console.log('     Email: student@schoolsystem.com');
    console.log('     Password: student123');
    console.log('   Tenant: Default School');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;

