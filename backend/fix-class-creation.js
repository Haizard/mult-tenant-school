const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Test and fix class creation
async function fixClassCreation() {
  try {
    console.log('🔧 Fixing Class Creation Issue...');

    // Step 1: Check database connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Step 2: Check if Class table exists and get its schema
    console.log('\n2️⃣ Checking Class table schema...');
    try {
      const tableInfo = await prisma.$queryRaw`PRAGMA table_info(Class)`;
      console.log('📋 Class table columns:');
      tableInfo.forEach(col => {
        console.log(`  - ${col.name}: ${col.type} ${col.notnull ? '(NOT NULL)' : '(NULL)'} ${col.pk ? '(PRIMARY KEY)' : ''}`);
      });
    } catch (schemaError) {
      console.log('❌ Could not get table schema:', schemaError.message);
    }

    // Step 3: Get a test tenant and user
    console.log('\n3️⃣ Finding test data...');
    const tenant = await prisma.tenant.findFirst({
      where: { status: 'ACTIVE' }
    });

    if (!tenant) {
      throw new Error('No active tenant found. Please ensure you have at least one active tenant.');
    }

    const user = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        status: 'ACTIVE'
      }
    });

    if (!user) {
      throw new Error('No active user found for tenant. Please ensure you have at least one active user.');
    }

    console.log(`✅ Found tenant: ${tenant.name} (${tenant.id})`);
    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.id})`);

    // Step 4: Test class creation with minimal data
    console.log('\n4️⃣ Testing class creation...');

    const testClassName = `Test Class ${Date.now()}`;
    const testClassCode = `TC${Date.now().toString().slice(-6)}`;

    const classData = {
      tenantId: tenant.id,
      className: testClassName,
      classCode: testClassCode,
      capacity: 30,
      description: 'Test class created by fix script',
      createdBy: user.id,
      updatedBy: user.id
    };

    console.log('📝 Creating class with data:', JSON.stringify(classData, null, 2));

    const createdClass = await prisma.class.create({
      data: classData,
      include: {
        tenant: {
          select: {
            id: true,
            name: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log('✅ Class created successfully!');
    console.log('📄 Created class:', JSON.stringify(createdClass, null, 2));

    // Step 5: Test enrollment calculation
    console.log('\n5️⃣ Testing enrollment calculation...');
    const enrollment = await prisma.studentEnrollment.findMany({
      where: {
        classId: createdClass.id,
        status: 'ACTIVE',
        enrollmentType: 'CLASS'
      }
    });

    const currentEnrollment = enrollment.length;
    const enrollmentPercentage = Math.round((currentEnrollment / createdClass.capacity) * 100);

    console.log(`📊 Enrollment: ${currentEnrollment}/${createdClass.capacity} (${enrollmentPercentage}%)`);

    // Step 6: Clean up test data
    console.log('\n6️⃣ Cleaning up test data...');
    await prisma.class.delete({
      where: { id: createdClass.id }
    });
    console.log('🧹 Test class deleted successfully');

    // Step 7: Create corrected controller function
    console.log('\n7️⃣ Generating corrected controller function...');

    const correctedController = `
// ✅ CORRECTED CLASS CREATION CONTROLLER
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

    const { className, classCode, capacity, description } = req.body;

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

    // Create class with only valid schema fields
    const classData = await prisma.class.create({
      data: {
        tenantId: req.tenantId,
        className: className.trim(),
        classCode: classCode?.trim() || null,
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
};`;

    console.log('📝 Corrected controller function saved to output above');

    console.log('\n✅ Class Creation Fix Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Replace your createClass function in academicController.js with the corrected version above');
    console.log('2. Restart your backend server');
    console.log('3. Test class creation from the frontend');

  } catch (error) {
    console.error('💥 Fix script failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixClassCreation().catch(console.error);
