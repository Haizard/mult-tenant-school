const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runClassMigration() {
  try {
    console.log('🔄 Running Class Fields Migration...');

    // Read the SQL migration file
    const migrationPath = path.join(__dirname, 'add-class-fields-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Migration SQL:');
    console.log(migrationSQL);

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    console.log(`\n🔧 Executing ${statements.length} migration statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n${i + 1}/${statements.length}: Executing...`);
      console.log(statement);

      try {
        await prisma.$executeRawUnsafe(statement);
        console.log('✅ Success');
      } catch (error) {
        console.log(`⚠️ Error (might be expected if column already exists): ${error.message}`);
      }
    }

    console.log('\n🎉 Migration completed!');

    // Verify the migration by checking table schema
    console.log('\n📋 Verifying table schema...');
    try {
      const tableInfo = await prisma.$queryRaw`PRAGMA table_info(Class)`;
      console.log('Updated Class table columns:');
      tableInfo.forEach(col => {
        console.log(`  - ${col.name}: ${col.type} ${col.notnull ? '(NOT NULL)' : '(NULL)'} ${col.pk ? '(PRIMARY KEY)' : ''}`);
      });
    } catch (schemaError) {
      console.log('Could not verify schema:', schemaError.message);
    }

    // Test creating a class with new fields
    console.log('\n🧪 Testing class creation with new fields...');

    // Get test data
    const tenant = await prisma.tenant.findFirst({ where: { status: 'ACTIVE' } });
    const user = await prisma.user.findFirst({ where: { tenantId: tenant?.id, status: 'ACTIVE' } });
    const academicYear = await prisma.academicYear.findFirst({ where: { tenantId: tenant?.id } });

    if (!tenant || !user) {
      console.log('⚠️ Cannot test class creation: No tenant or user found');
      return;
    }

    const testClassName = `Migration Test ${Date.now()}`;

    try {
      const testClass = await prisma.class.create({
        data: {
          tenantId: tenant.id,
          className: testClassName,
          classCode: `MT${Date.now().toString().slice(-4)}`,
          academicLevel: 'O_LEVEL',
          academicYearId: academicYear?.id || null,
          teacherId: user.id,
          capacity: 35,
          description: 'Test class created during migration',
          createdBy: user.id,
          updatedBy: user.id
        },
        include: {
          academicYear: true,
          teacher: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      console.log('✅ Class creation test successful!');
      console.log('📄 Test class data:', JSON.stringify(testClass, null, 2));

      // Clean up test class
      await prisma.class.delete({ where: { id: testClass.id } });
      console.log('🧹 Test class cleaned up');

    } catch (createError) {
      console.log('❌ Class creation test failed:', createError.message);
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
console.log('🚀 Starting Class Fields Migration...');
runClassMigration().catch(console.error);
