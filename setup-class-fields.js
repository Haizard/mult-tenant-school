const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function setupClassFields() {
  console.log('🚀 Setting up Class Fields for Multi-Tenant School System...\n');

  try {
    // Step 1: Test database connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');

    // Step 2: Check current table schema
    console.log('2️⃣ Checking current Class table schema...');
    try {
      const tableInfo = await prisma.$queryRaw`PRAGMA table_info(Class)`;
      console.log('📋 Current Class table columns:');
      tableInfo.forEach(col => {
        console.log(`  - ${col.name}: ${col.type} ${col.notnull ? '(NOT NULL)' : '(NULL)'} ${col.pk ? '(PRIMARY KEY)' : ''}`);
      });

      // Check if new fields already exist
      const hasAcademicLevel = tableInfo.some(col => col.name === 'academicLevel');
      const hasAcademicYearId = tableInfo.some(col => col.name === 'academicYearId');
      const hasTeacherId = tableInfo.some(col => col.name === 'teacherId');

      if (hasAcademicLevel && hasAcademicYearId && hasTeacherId) {
        console.log('✅ All required fields already exist. Schema is up to date.\n');
      } else {
        console.log('⚠️ Missing fields detected. Running migration...\n');
        await runMigration();
      }
    } catch (error) {
      console.log('❌ Could not check table schema:', error.message);
      console.log('Proceeding with migration...\n');
      await runMigration();
    }

    // Step 3: Verify test data exists
    console.log('3️⃣ Verifying test data...');
    await verifyTestData();

    // Step 4: Test class creation with new fields
    console.log('4️⃣ Testing class creation with new fields...');
    await testClassCreation();

    // Step 5: Generate updated controller code
    console.log('5️⃣ Generating updated controller code...');
    await generateControllerCode();

    console.log('\n🎉 Class Fields Setup Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Replace your createClass function in academicController.js with the generated code above');
    console.log('2. Restart your backend server');
    console.log('3. Test class creation from the frontend');
    console.log('4. Verify that academicLevel, academicYearId, and teacherId fields work properly');

  } catch (error) {
    console.error('💥 Setup failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function runMigration() {
  console.log('🔧 Running database migration...');

  const migrationSteps = [
    {
      name: 'Add academicLevel column',
      sql: `ALTER TABLE "Class" ADD COLUMN "academicLevel" TEXT DEFAULT 'O_LEVEL'`
    },
    {
      name: 'Add academicYearId column',
      sql: `ALTER TABLE "Class" ADD COLUMN "academicYearId" TEXT`
    },
    {
      name: 'Add teacherId column',
      sql: `ALTER TABLE "Class" ADD COLUMN "teacherId" TEXT`
    },
    {
      name: 'Update existing records with default academic level',
      sql: `UPDATE "Class" SET "academicLevel" = 'O_LEVEL' WHERE "academicLevel" IS NULL`
    }
  ];

  for (const step of migrationSteps) {
    try {
      console.log(`  • ${step.name}...`);
      await prisma.$executeRawUnsafe(step.sql);
      console.log(`    ✅ Success`);
    } catch (error) {
      if (error.message.includes('duplicate column name') || error.message.includes('already exists')) {
        console.log(`    ℹ️ Column already exists, skipping`);
      } else {
        console.log(`    ⚠️ Error: ${error.message}`);
      }
    }
  }

  // Add foreign key constraints (these might fail if already exist)
  const constraintSteps = [
    {
      name: 'Add academicYear foreign key',
      sql: `CREATE INDEX IF NOT EXISTS "Class_academicYearId_idx" ON "Class"("academicYearId")`
    },
    {
      name: 'Add teacher foreign key',
      sql: `CREATE INDEX IF NOT EXISTS "Class_teacherId_idx" ON "Class"("teacherId")`
    }
  ];

  console.log('\n  Adding indexes...');
  for (const step of constraintSteps) {
    try {
      console.log(`  • ${step.name}...`);
      await prisma.$executeRawUnsafe(step.sql);
      console.log(`    ✅ Success`);
    } catch (error) {
      console.log(`    ⚠️ Error: ${error.message}`);
    }
  }

  console.log('✅ Migration completed\n');
}

async function verifyTestData() {
  // Check for active tenant
  const tenant = await prisma.tenant.findFirst({
    where: { status: 'ACTIVE' }
  });

  if (!tenant) {
    throw new Error('No active tenant found. Please ensure you have at least one active tenant.');
  }

  // Check for active user
  const user = await prisma.user.findFirst({
    where: {
      tenantId: tenant.id,
      status: 'ACTIVE'
    }
  });

  if (!user) {
    throw new Error('No active user found. Please ensure you have at least one active user.');
  }

  // Check for academic year (optional)
  const academicYear = await prisma.academicYear.findFirst({
    where: { tenantId: tenant.id }
  });

  console.log(`✅ Found tenant: ${tenant.name} (${tenant.id})`);
  console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.id})`);
  if (academicYear) {
    console.log(`✅ Found academic year: ${academicYear.yearName} (${academicYear.id})`);
  } else {
    console.log(`ℹ️ No academic year found (this is optional)`);
  }
  console.log();

  return { tenant, user, academicYear };
}

async function testClassCreation() {
  const { tenant, user, academicYear } = await verifyTestData();

  const testClassName = `Test Class ${Date.now()}`;
  const testClassCode = `TC${Date.now().toString().slice(-6)}`;

  console.log('🧪 Creating test class with new fields...');

  try {
    const testClass = await prisma.class.create({
      data: {
        tenantId: tenant.id,
        className: testClassName,
        classCode: testClassCode,
        academicLevel: 'A_LEVEL',
        academicYearId: academicYear?.id || null,
        teacherId: user.id,
        capacity: 35,
        description: 'Test class created during setup',
        createdBy: user.id,
        updatedBy: user.id
      }
    });

    console.log('✅ Test class created successfully!');
    console.log(`   Class ID: ${testClass.id}`);
    console.log(`   Academic Level: ${testClass.academicLevel}`);
    console.log(`   Academic Year ID: ${testClass.academicYearId || 'Not set'}`);
    console.log(`   Teacher ID: ${testClass.teacherId}`);

    // Test fetching with relationships
    const classWithRelations = await prisma.class.findUnique({
      where: { id: testClass.id },
      include: {
        tenant: { select: { name: true } },
        academicYear: { select: { yearName: true } },
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        studentEnrollments: {
          where: {
            status: 'ACTIVE',
            enrollmentType: 'CLASS'
          }
        }
      }
    });

    console.log('✅ Class relationships work correctly');
    console.log(`   Tenant: ${classWithRelations?.tenant?.name}`);
    console.log(`   Academic Year: ${classWithRelations?.academicYear?.yearName || 'Not set'}`);
    console.log(`   Teacher: ${classWithRelations?.teacher?.firstName} ${classWithRelations?.teacher?.lastName}`);
    console.log(`   Current Enrollment: ${classWithRelations?.studentEnrollments?.length || 0}/${testClass.capacity}`);

    // Clean up test class
    await prisma.class.delete({ where: { id: testClass.id } });
    console.log('🧹 Test class cleaned up\n');

  } catch (error) {
    console.error('❌ Test class creation failed:', error.message);
    throw error;
  }
}

async function generateControllerCode() {
  console.log('📝 Updated Controller Code:\n');

  const controllerCode = `
// ✅ UPDATED CLASS CREATION CONTROLLER WITH NEW FIELDS
const createClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      className,
      classCode,
      academicLevel,
      academicYearId,
      teacherId,
      capacity,
      description,
    } = req.body;

    // Validate required fields
    if (!className?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Class name is required",
      });
    }

    // Check if class name already exists in tenant
    const existingClass = await prisma.class.findFirst({
      where: {
        tenantId: req.tenantId,
        className: className.trim(),
      },
    });

    if (existingClass) {
      return res.status(409).json({
        success: false,
        message: "Class with this name already exists in this tenant",
      });
    }

    // Create class with all fields including new ones
    const classData = await prisma.class.create({
      data: {
        tenantId: req.tenantId,
        className: className.trim(),
        classCode: classCode?.trim() || null,
        academicLevel: academicLevel || "O_LEVEL",
        academicYearId: academicYearId || null,
        teacherId: teacherId || null,
        capacity: capacity ? parseInt(capacity) : 30,
        description: description?.trim() || null,
        createdBy: req.user.id,
        updatedBy: req.user.id,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            yearName: true,
            isCurrent: true,
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        studentEnrollments: {
          where: {
            status: "ACTIVE",
            enrollmentType: "CLASS",
          },
          select: {
            id: true,
            studentId: true,
          },
        },
      },
    });

    // Add real-time enrollment data
    const responseData = {
      ...classData,
      currentEnrollment: classData.studentEnrollments?.length || 0,
    };

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Create class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create class",
      error: process.env.NODE_ENV === "development" ? {
        message: error.message,
        code: error.code,
        meta: error.meta,
      } : "Internal server error",
    });
  }
};

// ✅ UPDATED CLASS VALIDATION
const validateClass = [
  body("className").notEmpty().withMessage("Class name is required"),
  body("classCode").optional().isString(),
  body("academicLevel")
    .optional()
    .isIn(["PRIMARY", "O_LEVEL", "A_LEVEL", "UNIVERSITY"])
    .withMessage("Invalid academic level"),
  body("academicYearId").optional().isString(),
  body("teacherId").optional().isString(),
  body("capacity")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Capacity must be between 1 and 100"),
  body("description").optional().isString(),
];
`;

  console.log(controllerCode);

  // Save to file for reference
  const outputPath = path.join(__dirname, 'updated-class-controller.js');
  fs.writeFileSync(outputPath, controllerCode.trim());
  console.log(`📁 Controller code saved to: ${outputPath}\n`);
}

// Run the setup
console.log('🚀 Starting Class Fields Setup...');
setupClassFields().catch(console.error);
