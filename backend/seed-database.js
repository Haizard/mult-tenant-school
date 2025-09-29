const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');

    // Step 1: Create basic tenant and users
    await createBasicData();
    
    // Step 2: Create roles and permissions
    await createRolesAndPermissions();
    
    // Step 3: Create academic structure
    await createAcademicStructure();
    
    // Step 4: Create sample finance data
    await createSampleFinanceData();

    console.log('✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createBasicData() {
  console.log('📋 Creating basic tenant and users...');

  // Create tenant if none exists
  let tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'Sample School',
        email: 'admin@sampleschool.com',
        domain: 'sampleschool.com',
        address: '123 School Street, Dar es Salaam',
        phone: '+255123456789',
        type: 'PRIMARY_SECONDARY',
        status: 'ACTIVE',
        subscriptionPlan: 'PREMIUM',
        maxUsers: 500,
        currency: 'TZS',
        timezone: 'Africa/Dar_es_Salaam',
        language: 'en',
      },
    });
    console.log(`✅ Created tenant: ${tenant.name}`);
  }

  // Create users if none exist
  const users = await prisma.user.findMany({ where: { tenantId: tenant.id } });
  if (users.length === 0) {
    const userData = [
      {
        email: 'admin@sampleschool.com',
        firstName: 'School',
        lastName: 'Admin',
        phone: '+255123456789',
      },
      {
        email: 'teacher@sampleschool.com',
        firstName: 'John',
        lastName: 'Teacher',
        phone: '+255123456790',
      },
      {
        email: 'student@sampleschool.com',
        firstName: 'Jane',
        lastName: 'Student',
        phone: '+255123456791',
      },
      {
        email: 'finance@sampleschool.com',
        firstName: 'Finance',
        lastName: 'Staff',
        phone: '+255123456792',
      },
    ];

    for (const userInfo of userData) {
      const user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: userInfo.email,
          password: '$2b$10$example.hash.for.password', // In production, use proper hashing
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          phone: userInfo.phone,
          address: '123 School Street, Dar es Salaam',
          status: 'ACTIVE',
        },
      });
      console.log(`✅ Created user: ${user.email}`);
    }
  }
}

async function createRolesAndPermissions() {
  console.log('🔐 Creating roles and permissions...');

  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.log('❌ No tenant found for role creation');
    return;
  }

  // Define all permissions
  const permissions = [
    // System permissions
    { resource: 'system', action: 'manage' },
    { resource: 'tenants', action: 'create' },
    { resource: 'tenants', action: 'read' },
    { resource: 'tenants', action: 'update' },
    { resource: 'tenants', action: 'delete' },
    
    // User management
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
    
    // Academic management
    { resource: 'courses', action: 'create' },
    { resource: 'courses', action: 'read' },
    { resource: 'courses', action: 'update' },
    { resource: 'courses', action: 'delete' },
    { resource: 'subjects', action: 'create' },
    { resource: 'subjects', action: 'read' },
    { resource: 'subjects', action: 'update' },
    { resource: 'subjects', action: 'delete' },
    { resource: 'classes', action: 'create' },
    { resource: 'classes', action: 'read' },
    { resource: 'classes', action: 'update' },
    { resource: 'classes', action: 'delete' },
    
    // Finance permissions
    { resource: 'finance', action: 'create' },
    { resource: 'finance', action: 'read' },
    { resource: 'finance', action: 'update' },
    { resource: 'finance', action: 'delete' },
    { resource: 'fees', action: 'create' },
    { resource: 'fees', action: 'read' },
    { resource: 'fees', action: 'update' },
    { resource: 'fees', action: 'delete' },
    { resource: 'payments', action: 'create' },
    { resource: 'payments', action: 'read' },
    { resource: 'payments', action: 'update' },
    { resource: 'payments', action: 'delete' },
    { resource: 'invoices', action: 'create' },
    { resource: 'invoices', action: 'read' },
    { resource: 'invoices', action: 'update' },
    { resource: 'invoices', action: 'delete' },
    { resource: 'expenses', action: 'create' },
    { resource: 'expenses', action: 'read' },
    { resource: 'expenses', action: 'update' },
    { resource: 'expenses', action: 'delete' },
    { resource: 'expenses', action: 'approve' },
    { resource: 'budgets', action: 'create' },
    { resource: 'budgets', action: 'read' },
    { resource: 'budgets', action: 'update' },
    { resource: 'budgets', action: 'delete' },
    { resource: 'refunds', action: 'create' },
    { resource: 'refunds', action: 'read' },
    { resource: 'refunds', action: 'update' },
    { resource: 'refunds', action: 'approve' },
    { resource: 'refunds', action: 'process' },
    { resource: 'financial_reports', action: 'create' },
    { resource: 'financial_reports', action: 'read' },
    { resource: 'financial_reports', action: 'export' },
    
    // Library permissions
    { resource: 'library', action: 'manage' },
    
    // General permissions
    { resource: 'announcements', action: 'read' },
    { resource: 'reports', action: 'read' },
    { resource: 'analytics', action: 'read' },
  ];

  // Create permissions
  for (const perm of permissions) {
    const existingPermission = await prisma.permission.findFirst({
      where: {
        resource: perm.resource,
        action: perm.action,
      },
    });

    if (!existingPermission) {
      await prisma.permission.create({
        data: {
          name: `${perm.resource}_${perm.action}`,
          description: `${perm.action} permission for ${perm.resource}`,
          resource: perm.resource,
          action: perm.action,
        },
      });
    }
  }

  // Define roles with their permissions
  const roles = [
    {
      name: 'Super Admin',
      description: 'System-wide administrator with full access',
      permissions: permissions.map(p => `${p.resource}:${p.action}`),
    },
    {
      name: 'Tenant Admin',
      description: 'School administrator with full access within tenant',
      permissions: [
        'users:create', 'users:read', 'users:update', 'users:delete',
        'courses:create', 'courses:read', 'courses:update', 'courses:delete',
        'subjects:create', 'subjects:read', 'subjects:update', 'subjects:delete',
        'classes:create', 'classes:read', 'classes:update', 'classes:delete',
        'finance:create', 'finance:read', 'finance:update', 'finance:delete',
        'fees:create', 'fees:read', 'fees:update', 'fees:delete',
        'payments:create', 'payments:read', 'payments:update', 'payments:delete',
        'invoices:create', 'invoices:read', 'invoices:update', 'invoices:delete',
        'expenses:create', 'expenses:read', 'expenses:update', 'expenses:delete', 'expenses:approve',
        'budgets:create', 'budgets:read', 'budgets:update', 'budgets:delete',
        'refunds:create', 'refunds:read', 'refunds:update', 'refunds:approve', 'refunds:process',
        'financial_reports:create', 'financial_reports:read', 'financial_reports:export',
        'library:manage',
        'announcements:read', 'reports:read', 'analytics:read',
      ],
    },
    {
      name: 'Finance Staff',
      description: 'Finance staff with comprehensive financial management permissions',
      permissions: [
        'finance:create', 'finance:read', 'finance:update', 'finance:delete',
        'fees:create', 'fees:read', 'fees:update', 'fees:delete',
        'payments:create', 'payments:read', 'payments:update', 'payments:delete',
        'invoices:create', 'invoices:read', 'invoices:update', 'invoices:delete',
        'expenses:create', 'expenses:read', 'expenses:update', 'expenses:delete', 'expenses:approve',
        'budgets:create', 'budgets:read', 'budgets:update', 'budgets:delete',
        'refunds:create', 'refunds:read', 'refunds:update', 'refunds:approve', 'refunds:process',
        'financial_reports:create', 'financial_reports:read', 'financial_reports:export',
        'announcements:read',
      ],
    },
    {
      name: 'Teacher',
      description: 'Teacher with academic management permissions',
      permissions: [
        'courses:read', 'subjects:read', 'classes:read',
        'announcements:read', 'reports:read',
      ],
    },
    {
      name: 'Student',
      description: 'Student with limited read access',
      permissions: [
        'courses:read', 'subjects:read', 'classes:read',
        'announcements:read',
      ],
    },
    {
      name: 'Parent',
      description: 'Parent with access to child information',
      permissions: [
        'finance:read', 'fees:read', 'payments:read', 'invoices:read',
        'announcements:read',
      ],
    },
    {
      name: 'Staff',
      description: 'General staff with specific permissions',
      permissions: [
        'library:manage',
        'announcements:read',
      ],
    },
  ];

  // Create roles and assign permissions
  for (const roleData of roles) {
    let role = await prisma.role.findFirst({
      where: {
        tenantId: tenant.id,
        name: roleData.name,
      },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          tenantId: tenant.id,
          name: roleData.name,
          description: roleData.description,
          isSystem: roleData.name === 'Super Admin',
        },
      });
      console.log(`✅ Created role: ${role.name}`);
    }

    // Assign permissions to role
    for (const permissionString of roleData.permissions) {
      const [resource, action] = permissionString.split(':');
      
      const permission = await prisma.permission.findFirst({
        where: { resource, action },
      });

      if (permission) {
        const existingRolePermission = await prisma.rolePermission.findFirst({
          where: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });

        if (!existingRolePermission) {
          await prisma.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId: permission.id,
            },
          });
        }
      }
    }
  }

  // Assign roles to users
  const users = await prisma.user.findMany({ where: { tenantId: tenant.id } });
  const userRoles = await prisma.role.findMany({ where: { tenantId: tenant.id } });

  for (const user of users) {
    let roleName = '';
    
    if (user.email.includes('admin')) {
      roleName = 'Tenant Admin';
    } else if (user.email.includes('finance')) {
      roleName = 'Finance Staff';
    } else if (user.email.includes('teacher')) {
      roleName = 'Teacher';
    } else if (user.email.includes('student')) {
      roleName = 'Student';
    }

    if (roleName) {
      const role = userRoles.find(r => r.name === roleName);
      if (role) {
        const existingUserRole = await prisma.userRole.findFirst({
          where: {
            userId: user.id,
            roleId: role.id,
          },
        });

        if (!existingUserRole) {
          await prisma.userRole.create({
            data: {
              userId: user.id,
              roleId: role.id,
              tenantId: tenant.id,
            },
          });
          console.log(`✅ Assigned role ${roleName} to ${user.email}`);
        }
      }
    }
  }
}

async function createAcademicStructure() {
  console.log('🎓 Creating academic structure...');

  const tenant = await prisma.tenant.findFirst();
  const firstUser = await prisma.user.findFirst({ where: { tenantId: tenant.id } });

  if (!tenant || !firstUser) {
    console.log('❌ Missing tenant or user for academic structure');
    return;
  }

  // Create academic year
  let academicYear = await prisma.academicYear.findFirst({ where: { tenantId: tenant.id } });
  if (!academicYear) {
    const currentYear = new Date().getFullYear();
    academicYear = await prisma.academicYear.create({
      data: {
        tenantId: tenant.id,
        yearName: `${currentYear}/${currentYear + 1}`,
        startDate: new Date(currentYear, 0, 1),
        endDate: new Date(currentYear + 1, 11, 31),
        isCurrent: true,
        status: 'ACTIVE',
        createdBy: firstUser.id,
        updatedBy: firstUser.id,
      },
    });
    console.log(`✅ Created academic year: ${academicYear.yearName}`);
  }

  // Create classes
  const classes = await prisma.class.findMany({ where: { tenantId: tenant.id } });
  if (classes.length === 0) {
    const sampleClasses = [
      { className: 'Form 1', classCode: 'F1', academicLevel: 'O_LEVEL' },
      { className: 'Form 2', classCode: 'F2', academicLevel: 'O_LEVEL' },
      { className: 'Form 3', classCode: 'F3', academicLevel: 'O_LEVEL' },
      { className: 'Form 4', classCode: 'F4', academicLevel: 'O_LEVEL' },
      { className: 'Form 5', classCode: 'F5', academicLevel: 'A_LEVEL' },
      { className: 'Form 6', classCode: 'F6', academicLevel: 'A_LEVEL' },
    ];

    for (const classData of sampleClasses) {
      await prisma.class.create({
        data: {
          tenantId: tenant.id,
          className: classData.className,
          classCode: classData.classCode,
          academicLevel: classData.academicLevel,
          academicYearId: academicYear.id,
          description: `${classData.className} class`,
          capacity: 30,
          createdBy: firstUser.id,
          updatedBy: firstUser.id,
        },
      });
      console.log(`✅ Created class: ${classData.className}`);
    }
  }

  // Create subjects
  const subjects = await prisma.subject.findMany({ where: { tenantId: tenant.id } });
  if (subjects.length === 0) {
    const sampleSubjects = [
      { subjectName: 'Mathematics', subjectCode: 'MATH', subjectLevel: 'O_LEVEL', subjectType: 'CORE' },
      { subjectName: 'English', subjectCode: 'ENG', subjectLevel: 'O_LEVEL', subjectType: 'CORE' },
      { subjectName: 'Kiswahili', subjectCode: 'KIS', subjectLevel: 'O_LEVEL', subjectType: 'CORE' },
      { subjectName: 'Physics', subjectCode: 'PHY', subjectLevel: 'O_LEVEL', subjectType: 'CORE' },
      { subjectName: 'Chemistry', subjectCode: 'CHEM', subjectLevel: 'O_LEVEL', subjectType: 'CORE' },
      { subjectName: 'Biology', subjectCode: 'BIO', subjectLevel: 'O_LEVEL', subjectType: 'CORE' },
      { subjectName: 'History', subjectCode: 'HIST', subjectLevel: 'O_LEVEL', subjectType: 'OPTIONAL' },
      { subjectName: 'Geography', subjectCode: 'GEO', subjectLevel: 'O_LEVEL', subjectType: 'OPTIONAL' },
    ];

    for (const subjectData of sampleSubjects) {
      await prisma.subject.create({
        data: {
          tenantId: tenant.id,
          subjectName: subjectData.subjectName,
          subjectCode: subjectData.subjectCode,
          subjectLevel: subjectData.subjectLevel,
          subjectType: subjectData.subjectType,
          description: `${subjectData.subjectName} subject`,
          credits: 1,
          status: 'ACTIVE',
          createdBy: firstUser.id,
          updatedBy: firstUser.id,
        },
      });
      console.log(`✅ Created subject: ${subjectData.subjectName}`);
    }
  }
}

async function createSampleFinanceData() {
  console.log('💰 Creating sample finance data...');

  const tenant = await prisma.tenant.findFirst();
  const firstUser = await prisma.user.findFirst({ where: { tenantId: tenant.id } });
  const classes = await prisma.class.findMany({ where: { tenantId: tenant.id } });

  if (!tenant || !firstUser || classes.length === 0) {
    console.log('❌ Missing required data for finance setup');
    return;
  }

  // Create sample fees
  const fees = await prisma.fee.findMany({ where: { tenantId: tenant.id } });
  if (fees.length === 0) {
    const sampleFees = [
      {
        feeName: 'Tuition Fee',
        feeType: 'TUITION',
        amount: 500000,
        frequency: 'TERM_WISE',
        applicableLevels: ['O_LEVEL', 'A_LEVEL'],
        applicableClasses: classes.map(c => c.id),
      },
      {
        feeName: 'Admission Fee',
        feeType: 'ADMISSION',
        amount: 100000,
        frequency: 'ONE_TIME',
        applicableLevels: ['O_LEVEL', 'A_LEVEL'],
        applicableClasses: classes.map(c => c.id),
      },
      {
        feeName: 'Examination Fee',
        feeType: 'EXAMINATION',
        amount: 50000,
        frequency: 'ONE_TIME',
        applicableLevels: ['O_LEVEL', 'A_LEVEL'],
        applicableClasses: classes.map(c => c.id),
      },
      {
        feeName: 'Library Fee',
        feeType: 'LIBRARY',
        amount: 25000,
        frequency: 'ANNUALLY',
        applicableLevels: ['O_LEVEL', 'A_LEVEL'],
        applicableClasses: classes.map(c => c.id),
      },
    ];

    for (const feeData of sampleFees) {
      await prisma.fee.create({
        data: {
          tenantId: tenant.id,
          feeName: feeData.feeName,
          feeType: feeData.feeType,
          amount: feeData.amount,
          currency: 'TZS',
          frequency: feeData.frequency,
          applicableLevels: feeData.applicableLevels,
          applicableClasses: feeData.applicableClasses,
          description: `${feeData.feeName} for students`,
          isActive: true,
          effectiveDate: new Date(),
          createdBy: firstUser.id,
        },
      });
      console.log(`✅ Created fee: ${feeData.feeName}`);
    }
  }

  // Create sample budgets
  const budgets = await prisma.budget.findMany({ where: { tenantId: tenant.id } });
  if (budgets.length === 0) {
    const currentYear = new Date().getFullYear();
    const sampleBudgets = [
      {
        budgetName: 'Academic Budget',
        budgetCategory: 'ACADEMIC',
        allocatedAmount: 10000000,
      },
      {
        budgetName: 'Administrative Budget',
        budgetCategory: 'ADMINISTRATIVE',
        allocatedAmount: 5000000,
      },
      {
        budgetName: 'Infrastructure Budget',
        budgetCategory: 'INFRASTRUCTURE',
        allocatedAmount: 8000000,
      },
    ];

    for (const budgetData of sampleBudgets) {
      await prisma.budget.create({
        data: {
          tenantId: tenant.id,
          budgetName: budgetData.budgetName,
          budgetYear: currentYear,
          budgetCategory: budgetData.budgetCategory,
          allocatedAmount: budgetData.allocatedAmount,
          remainingAmount: budgetData.allocatedAmount,
          currency: 'TZS',
          startDate: new Date(currentYear, 0, 1),
          endDate: new Date(currentYear, 11, 31),
          status: 'ACTIVE',
          description: `${budgetData.budgetName} for ${currentYear}`,
          createdBy: firstUser.id,
        },
      });
      console.log(`✅ Created budget: ${budgetData.budgetName}`);
    }
  }

  console.log('✅ Sample finance data created successfully!');
}

// Run the seeding
seedDatabase();
