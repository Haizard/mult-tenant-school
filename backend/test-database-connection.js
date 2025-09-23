const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test database connection
async function testConnection() {
  log('blue', '\n=== 🔌 DATABASE CONNECTION TEST ===');

  try {
    await prisma.$connect();
    log('green', '✅ Database connection successful');

    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    log('green', '✅ Database query test successful');
    log('cyan', `   Query result: ${JSON.stringify(result)}`);

    return true;
  } catch (error) {
    log('red', '❌ Database connection failed');
    log('red', `   Error: ${error.message}`);
    return false;
  }
}

// Test table existence and basic queries
async function testTables() {
  log('blue', '\n=== 📊 TABLE EXISTENCE TESTS ===');

  const tables = [
    { name: 'Tenant', model: prisma.tenant },
    { name: 'User', model: prisma.user },
    { name: 'Role', model: prisma.role },
    { name: 'Subject', model: prisma.subject },
    { name: 'Course', model: prisma.course },
    { name: 'Class', model: prisma.class },
    { name: 'AcademicYear', model: prisma.academicYear },
    { name: 'Examination', model: prisma.examination }
  ];

  for (const table of tables) {
    try {
      const count = await table.model.count();
      log('green', `✅ ${table.name} table exists (${count} records)`);
    } catch (error) {
      log('red', `❌ ${table.name} table test failed`);
      log('red', `   Error: ${error.message}`);
    }
  }
}

// Test tenants specifically
async function testTenants() {
  log('blue', '\n=== 🏢 TENANT TESTS ===');

  try {
    const tenants = await prisma.tenant.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true
      }
    });

    if (tenants.length > 0) {
      log('green', `✅ Found ${tenants.length} tenants:`);
      tenants.forEach(tenant => {
        log('cyan', `   - ${tenant.name} (ID: ${tenant.id}, Status: ${tenant.status})`);
      });
    } else {
      log('yellow', '⚠️  No tenants found in database');
    }

    return tenants;
  } catch (error) {
    log('red', '❌ Tenant query failed');
    log('red', `   Error: ${error.message}`);
    return [];
  }
}

// Test users and authentication data
async function testUsers() {
  log('blue', '\n=== 👥 USER TESTS ===');

  try {
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        tenantId: true,
        status: true
      }
    });

    if (users.length > 0) {
      log('green', `✅ Found ${users.length} users:`);
      users.forEach(user => {
        log('cyan', `   - ${user.firstName} ${user.lastName} (${user.email})`);
        log('cyan', `     Tenant: ${user.tenantId}, Status: ${user.status}`);
      });
    } else {
      log('yellow', '⚠️  No users found in database');
    }

    return users;
  } catch (error) {
    log('red', '❌ User query failed');
    log('red', `   Error: ${error.message}`);
    return [];
  }
}

// Test subjects specifically (the failing endpoint)
async function testSubjects() {
  log('blue', '\n=== 📚 SUBJECT TESTS ===');

  try {
    const subjects = await prisma.subject.findMany({
      take: 10,
      select: {
        id: true,
        subjectName: true,
        subjectCode: true,
        subjectLevel: true,
        tenantId: true,
        status: true
      }
    });

    if (subjects.length > 0) {
      log('green', `✅ Found ${subjects.length} subjects:`);
      subjects.forEach(subject => {
        log('cyan', `   - ${subject.subjectName} (${subject.subjectCode})`);
        log('cyan', `     Level: ${subject.subjectLevel}, Tenant: ${subject.tenantId}`);
      });
    } else {
      log('yellow', '⚠️  No subjects found in database');
    }

    // Test subject query with tenant filter (simulating API behavior)
    const tenants = await prisma.tenant.findMany({ take: 1 });
    if (tenants.length > 0) {
      const tenantSubjects = await prisma.subject.findMany({
        where: { tenantId: tenants[0].id },
        take: 5
      });
      log('green', `✅ Tenant-filtered subjects test: ${tenantSubjects.length} results for tenant ${tenants[0].id}`);
    }

    return subjects;
  } catch (error) {
    log('red', '❌ Subject query failed');
    log('red', `   Error: ${error.message}`);
    log('red', `   Stack: ${error.stack}`);
    return [];
  }
}

// Test examinations specifically
async function testExaminations() {
  log('blue', '\n=== 📋 EXAMINATION TESTS ===');

  try {
    const examinations = await prisma.examination.findMany({
      take: 5,
      select: {
        id: true,
        examName: true,
        examType: true,
        examLevel: true,
        tenantId: true,
        status: true
      }
    });

    if (examinations.length > 0) {
      log('green', `✅ Found ${examinations.length} examinations:`);
      examinations.forEach(exam => {
        log('cyan', `   - ${exam.examName} (${exam.examType})`);
        log('cyan', `     Level: ${exam.examLevel}, Status: ${exam.status}`);
      });
    } else {
      log('yellow', '⚠️  No examinations found in database');
    }

    return examinations;
  } catch (error) {
    log('red', '❌ Examination query failed');
    log('red', `   Error: ${error.message}`);
    return [];
  }
}

// Test complex queries (with joins)
async function testComplexQueries() {
  log('blue', '\n=== 🔗 COMPLEX QUERY TESTS ===');

  try {
    // Test subject query with includes (similar to what API does)
    const subjectsWithRelations = await prisma.subject.findMany({
      take: 3,
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

    log('green', `✅ Complex subject query with relations: ${subjectsWithRelations.length} results`);

    if (subjectsWithRelations.length > 0) {
      const sample = subjectsWithRelations[0];
      log('cyan', `   Sample: ${sample.subjectName}`);
      log('cyan', `   Tenant: ${sample.tenant?.name || 'N/A'}`);
      log('cyan', `   Created by: ${sample.createdByUser?.firstName || 'N/A'} ${sample.createdByUser?.lastName || ''}`);
    }

  } catch (error) {
    log('red', '❌ Complex query failed');
    log('red', `   Error: ${error.message}`);
    log('red', `   This might indicate missing relations or schema issues`);
  }
}

// Test environment variables
function testEnvironment() {
  log('blue', '\n=== 🌍 ENVIRONMENT VARIABLES TEST ===');

  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NODE_ENV'
  ];

  const optionalVars = [
    'PORT',
    'FRONTEND_URL',
    'CORS_ORIGIN'
  ];

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      log('green', `✅ ${varName} is set`);
    } else {
      log('red', `❌ ${varName} is NOT set (required)`);
    }
  });

  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      log('green', `✅ ${varName} is set: ${process.env[varName]}`);
    } else {
      log('yellow', `⚠️  ${varName} is not set (optional)`);
    }
  });

  // Check DATABASE_URL format
  if (process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.includes('sqlite')) {
      log('cyan', '   Database type: SQLite');
    } else if (process.env.DATABASE_URL.includes('postgresql')) {
      log('cyan', '   Database type: PostgreSQL');
    } else if (process.env.DATABASE_URL.includes('mysql')) {
      log('cyan', '   Database type: MySQL');
    } else {
      log('yellow', '   Database type: Unknown');
    }
  }
}

// Test Prisma schema consistency
async function testSchema() {
  log('blue', '\n=== 📋 SCHEMA CONSISTENCY TEST ===');

  try {
    // Test if we can query the Prisma metadata
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'
    `.catch(() => {
      // If SQLite query fails, try PostgreSQL
      return prisma.$queryRaw`
        SELECT tablename as name FROM pg_tables WHERE schemaname = 'public'
      `.catch(() => {
        // If PostgreSQL fails, try MySQL
        return prisma.$queryRaw`
          SELECT table_name as name FROM information_schema.tables WHERE table_schema = DATABASE()
        `.catch(() => {
          log('yellow', '⚠️  Could not determine database tables (unsupported database type)');
          return [];
        });
      });
    });

    if (Array.isArray(tables) && tables.length > 0) {
      log('green', `✅ Found ${tables.length} tables in database:`);
      tables.forEach(table => {
        log('cyan', `   - ${table.name}`);
      });
    }

  } catch (error) {
    log('yellow', '⚠️  Schema consistency test failed (this is normal for some databases)');
    log('yellow', `   Reason: ${error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  log('magenta', '🧪 DATABASE DIAGNOSTIC TOOL');
  log('magenta', '===========================\n');

  try {
    // Test environment first
    testEnvironment();

    // Test basic connection
    const connected = await testConnection();

    if (!connected) {
      log('red', '\n💥 Cannot proceed with tests - database connection failed');
      return;
    }

    // Run all tests
    await testSchema();
    await testTables();
    await testTenants();
    await testUsers();
    await testSubjects();
    await testExaminations();
    await testComplexQueries();

    log('blue', '\n=== 📊 DIAGNOSTIC SUMMARY ===');
    log('green', '✅ Database diagnostic tests completed');
    log('cyan', '\n💡 If subjects API is still failing:');
    log('cyan', '1. Check authentication middleware (req.tenantId)');
    log('cyan', '2. Verify user has proper permissions');
    log('cyan', '3. Check if tenant exists and user belongs to it');
    log('cyan', '4. Look at backend console logs for detailed errors');
    log('cyan', '5. Test with a direct Prisma query outside middleware');

  } catch (error) {
    log('red', '\n💥 Diagnostic test failed:');
    log('red', error.message);
    log('red', error.stack);
  } finally {
    await prisma.$disconnect();
    log('blue', '\n🔌 Database connection closed');
  }
}

// Error handlers
process.on('uncaughtException', async (error) => {
  log('red', '\n💥 Uncaught Exception:');
  log('red', error.message);
  await prisma.$disconnect();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  log('red', '\n💥 Unhandled Rejection:');
  log('red', reason);
  await prisma.$disconnect();
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  log('yellow', '\n👋 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the tests
runAllTests();
