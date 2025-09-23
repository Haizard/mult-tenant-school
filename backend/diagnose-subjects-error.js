const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const prisma = new PrismaClient();

// Color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('magenta', `\n${'='.repeat(50)}`);
  log('magenta', `${title.toUpperCase()}`);
  log('magenta', `${'='.repeat(50)}`);
}

// Test 1: Basic database connection
async function testDatabaseConnection() {
  logSection('Database Connection Test');

  try {
    await prisma.$connect();
    log('green', '✅ Database connected successfully');

    const result = await prisma.$queryRaw`SELECT 1 as test`;
    log('green', '✅ Database query test passed');
    return true;
  } catch (error) {
    log('red', '❌ Database connection failed');
    log('red', `   Error: ${error.message}`);
    return false;
  }
}

// Test 2: Check subjects table structure
async function testSubjectsTableStructure() {
  logSection('Subjects Table Structure Test');

  try {
    // Test if subjects table exists and get sample data
    const subjectCount = await prisma.subject.count();
    log('green', `✅ Subjects table exists with ${subjectCount} records`);

    if (subjectCount > 0) {
      const sampleSubject = await prisma.subject.findFirst({
        select: {
          id: true,
          subjectName: true,
          subjectCode: true,
          subjectLevel: true,
          subjectType: true,
          tenantId: true,
          status: true,
          createdAt: true,
          createdBy: true
        }
      });

      log('cyan', '   Sample subject structure:');
      console.log('  ', JSON.stringify(sampleSubject, null, 2));
    }

    return true;
  } catch (error) {
    log('red', '❌ Subjects table test failed');
    log('red', `   Error: ${error.message}`);
    log('red', `   Stack: ${error.stack}`);
    return false;
  }
}

// Test 3: Test tenant data
async function testTenantData() {
  logSection('Tenant Data Test');

  try {
    const tenants = await prisma.tenant.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        _count: {
          select: {
            subjects: true,
            users: true
          }
        }
      }
    });

    log('green', `✅ Found ${tenants.length} tenants`);

    tenants.forEach(tenant => {
      log('cyan', `   - ${tenant.name} (ID: ${tenant.id})`);
      log('cyan', `     Status: ${tenant.status}`);
      log('cyan', `     Subjects: ${tenant._count.subjects}, Users: ${tenant._count.users}`);
    });

    return tenants;
  } catch (error) {
    log('red', '❌ Tenant data test failed');
    log('red', `   Error: ${error.message}`);
    return [];
  }
}

// Test 4: Test user authentication data
async function testUserAuthData() {
  logSection('User Authentication Data Test');

  try {
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        tenantId: true,
        status: true,
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

    log('green', `✅ Found ${users.length} users with auth data`);

    users.forEach(user => {
      log('cyan', `   - ${user.firstName} ${user.lastName} (${user.email})`);
      log('cyan', `     Tenant: ${user.tenantId}, Status: ${user.status}`);
      log('cyan', `     Roles: ${user.userRoles.length}`);

      user.userRoles.forEach(userRole => {
        log('cyan', `       - Role: ${userRole.role.name}`);
        log('cyan', `         Permissions: ${userRole.role.rolePermissions.length}`);
      });
    });

    return users;
  } catch (error) {
    log('red', '❌ User auth data test failed');
    log('red', `   Error: ${error.message}`);
    return [];
  }
}

// Test 5: Simulate the exact query from getSubjects controller
async function testSubjectsQuery() {
  logSection('Subjects Query Simulation');

  try {
    // Get a valid tenant ID
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      log('red', '❌ No tenants found - cannot test subjects query');
      return false;
    }

    log('blue', `   Using tenant ID: ${tenant.id} (${tenant.name})`);

    // Simulate the exact query from academicController.js getSubjects function
    const page = 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const where = {
      tenantId: tenant.id
    };

    log('blue', '   Executing subjects query...');
    log('cyan', `   Where clause: ${JSON.stringify(where)}`);
    log('cyan', `   Pagination: skip=${skip}, take=${limit}`);

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
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
          updatedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.subject.count({ where }),
    ]);

    log('green', `✅ Subjects query successful!`);
    log('cyan', `   Found ${subjects.length} subjects out of ${total} total`);

    if (subjects.length > 0) {
      const sample = subjects[0];
      log('cyan', '   Sample subject:');
      log('cyan', `     Name: ${sample.subjectName}`);
      log('cyan', `     Code: ${sample.subjectCode}`);
      log('cyan', `     Level: ${sample.subjectLevel}`);
      log('cyan', `     Tenant: ${sample.tenant?.name || 'N/A'}`);
      log('cyan', `     Created by: ${sample.createdByUser?.firstName || 'N/A'} ${sample.createdByUser?.lastName || ''}`);
    }

    return { subjects, total };
  } catch (error) {
    log('red', '❌ Subjects query failed - THIS IS THE ISSUE!');
    log('red', `   Error: ${error.message}`);
    log('red', `   Stack: ${error.stack}`);

    // Try to identify the specific issue
    if (error.message.includes('Unknown column')) {
      log('yellow', '   🔍 DIAGNOSIS: Database schema issue - column missing');
    } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
      log('yellow', '   🔍 DIAGNOSIS: Table or relation missing');
    } else if (error.message.includes('createdByUser')) {
      log('yellow', '   🔍 DIAGNOSIS: Issue with createdByUser relation');
    } else if (error.message.includes('updatedByUser')) {
      log('yellow', '   🔍 DIAGNOSIS: Issue with updatedByUser relation');
    } else if (error.message.includes('tenant')) {
      log('yellow', '   🔍 DIAGNOSIS: Issue with tenant relation');
    }

    return false;
  }
}

// Test 6: Test simplified subjects query
async function testSimplifiedSubjectsQuery() {
  logSection('Simplified Subjects Query Test');

  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      log('red', '❌ No tenants found');
      return false;
    }

    // Try the most basic query first
    log('blue', '   Step 1: Basic subjects query (no includes)');
    const basicSubjects = await prisma.subject.findMany({
      where: { tenantId: tenant.id },
      take: 5
    });
    log('green', `   ✅ Basic query works: ${basicSubjects.length} results`);

    // Try with tenant include
    log('blue', '   Step 2: Query with tenant include');
    const subjectsWithTenant = await prisma.subject.findMany({
      where: { tenantId: tenant.id },
      take: 3,
      include: {
        tenant: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    log('green', `   ✅ Query with tenant works: ${subjectsWithTenant.length} results`);

    // Try with createdByUser include
    log('blue', '   Step 3: Query with createdByUser include');
    try {
      const subjectsWithCreatedBy = await prisma.subject.findMany({
        where: { tenantId: tenant.id },
        take: 3,
        include: {
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });
      log('green', `   ✅ Query with createdByUser works: ${subjectsWithCreatedBy.length} results`);
    } catch (error) {
      log('red', `   ❌ createdByUser include failed: ${error.message}`);
      log('yellow', '   🔍 LIKELY ISSUE: createdByUser relation or field missing/incorrect');
    }

    // Try with updatedByUser include
    log('blue', '   Step 4: Query with updatedByUser include');
    try {
      const subjectsWithUpdatedBy = await prisma.subject.findMany({
        where: { tenantId: tenant.id },
        take: 3,
        include: {
          updatedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });
      log('green', `   ✅ Query with updatedByUser works: ${subjectsWithUpdatedBy.length} results`);
    } catch (error) {
      log('red', `   ❌ updatedByUser include failed: ${error.message}`);
      log('yellow', '   🔍 LIKELY ISSUE: updatedByUser relation or field missing/incorrect');
    }

    return true;
  } catch (error) {
    log('red', '❌ Simplified query test failed');
    log('red', `   Error: ${error.message}`);
    return false;
  }
}

// Test 7: Check JWT and authentication setup
async function testJWTSetup() {
  logSection('JWT Setup Test');

  try {
    if (!process.env.JWT_SECRET) {
      log('red', '❌ JWT_SECRET environment variable not set');
      return false;
    }

    log('green', '✅ JWT_SECRET is configured');

    // Get a test user
    const user = await prisma.user.findFirst({
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

    if (!user) {
      log('red', '❌ No users found for JWT testing');
      return false;
    }

    // Create a test JWT token
    const testToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    log('green', '✅ JWT token creation works');

    // Verify the token
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    log('green', '✅ JWT token verification works');
    log('cyan', `   Token contains userId: ${decoded.userId}`);

    return { user, token: testToken };
  } catch (error) {
    log('red', '❌ JWT setup test failed');
    log('red', `   Error: ${error.message}`);
    return false;
  }
}

// Test 8: Test API endpoint simulation
async function testAPIEndpointSimulation() {
  logSection('API Endpoint Simulation');

  try {
    const jwtTest = await testJWTSetup();
    if (!jwtTest || !jwtTest.user) {
      log('red', '❌ Cannot simulate API - no valid user/token');
      return false;
    }

    const { user, token } = jwtTest;

    // Simulate the request object that would be passed to the controller
    const mockReq = {
      tenantId: user.tenantId,
      user: user,
      query: {
        page: '1',
        limit: '10'
      }
    };

    log('blue', '   Simulating API request...');
    log('cyan', `   Request tenantId: ${mockReq.tenantId}`);
    log('cyan', `   Request user: ${mockReq.user.firstName} ${mockReq.user.lastName}`);
    log('cyan', `   Request query: ${JSON.stringify(mockReq.query)}`);

    // Simulate the exact controller logic
    const {
      page = 1,
      limit = 10,
      search,
      status,
      subjectLevel,
      subjectType,
    } = mockReq.query;
    const skip = (page - 1) * limit;

    const where = {
      tenantId: mockReq.tenantId,
    };

    if (search) {
      where.OR = [
        { subjectName: { contains: search, mode: "insensitive" } },
        { subjectCode: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (subjectLevel) {
      where.subjectLevel = subjectLevel;
    }

    if (subjectType) {
      where.subjectType = subjectType;
    }

    log('blue', '   Executing controller query...');

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
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
          updatedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.subject.count({ where }),
    ]);

    const response = {
      success: true,
      data: subjects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };

    log('green', '✅ API endpoint simulation successful!');
    log('cyan', `   Response would be: ${subjects.length} subjects`);
    log('cyan', `   Pagination: page ${response.pagination.page} of ${response.pagination.pages}`);

    return response;
  } catch (error) {
    log('red', '❌ API endpoint simulation failed - THIS IS THE ROOT CAUSE!');
    log('red', `   Error: ${error.message}`);
    log('red', `   Stack: ${error.stack}`);
    return false;
  }
}

// Main diagnostic runner
async function runDiagnostic() {
  log('bright', '🔍 SUBJECTS API DIAGNOSTIC TOOL');
  log('bright', '================================');

  try {
    // Run all tests in sequence
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      log('red', '\n💥 Cannot proceed - database connection failed');
      return;
    }

    const tableOk = await testSubjectsTableStructure();
    const tenants = await testTenantData();
    const users = await testUserAuthData();

    if (tableOk) {
      await testSimplifiedSubjectsQuery();
      await testSubjectsQuery();
      await testAPIEndpointSimulation();
    }

    // Summary and recommendations
    logSection('Diagnostic Summary & Recommendations');

    log('cyan', '📋 SUMMARY:');
    log(dbConnected ? 'green' : 'red', `   Database Connection: ${dbConnected ? 'OK' : 'FAILED'}`);
    log(tableOk ? 'green' : 'red', `   Subjects Table: ${tableOk ? 'OK' : 'FAILED'}`);
    log(tenants.length > 0 ? 'green' : 'red', `   Tenant Data: ${tenants.length} tenants found`);
    log(users.length > 0 ? 'green' : 'red', `   User Data: ${users.length} users found`);

    log('cyan', '\n💡 RECOMMENDATIONS:');
    log('yellow', '1. Check backend server console logs during API call');
    log('yellow', '2. Add console.log statements in academicController.js getSubjects function');
    log('yellow', '3. Verify database schema is up to date (npx prisma db push)');
    log('yellow', '4. Check if createdBy/updatedBy fields exist and are valid user IDs');
    log('yellow', '5. Ensure user has proper permissions for subjects:read');

  } catch (error) {
    log('red', '\n💥 Diagnostic failed:');
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

// Run the diagnostic
runDiagnostic();
