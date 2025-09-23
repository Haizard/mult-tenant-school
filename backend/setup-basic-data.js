const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'dev.db');

function runQuery(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

function getQuery(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function allQuery(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function setupBasicData() {
  const db = new sqlite3.Database(dbPath);

  try {
    console.log('🚀 Setting up basic examination data...\n');

    // Check if we have a tenant
    let tenant = await getQuery(db, 'SELECT * FROM Tenant LIMIT 1');
    if (!tenant) {
      console.log('📍 Creating basic tenant...');
      const tenantId = 'tenant_' + Date.now();
      await runQuery(db, `
        INSERT INTO Tenant (id, name, email, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [tenantId, 'Demo School', 'admin@demoschool.com', 'ACTIVE']);

      tenant = { id: tenantId, name: 'Demo School' };
      console.log('  ✅ Created tenant: Demo School');
    } else {
      console.log(`📍 Using existing tenant: ${tenant.name}`);
    }

    // Check if we have a user
    let user = await getQuery(db, 'SELECT * FROM User WHERE tenantId = ? LIMIT 1', [tenant.id]);
    if (!user) {
      console.log('👤 Creating basic user...');
      const userId = 'user_' + Date.now();
      await runQuery(db, `
        INSERT INTO User (id, tenantId, email, firstName, lastName, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [userId, tenant.id, 'admin@demoschool.com', 'System', 'Admin', 'ACTIVE']);

      user = { id: userId, firstName: 'System', lastName: 'Admin' };
      console.log('  ✅ Created user: System Admin');
    } else {
      console.log(`👤 Using existing user: ${user.firstName} ${user.lastName}`);
    }

    // Create Academic Years
    console.log('\n📅 Creating Academic Years...');
    const academicYears = [
      { yearName: '2024/2025', startDate: '2024-09-01', endDate: '2025-08-31', isCurrent: 1 },
      { yearName: '2023/2024', startDate: '2023-09-01', endDate: '2024-08-31', isCurrent: 0 },
    ];

    for (const year of academicYears) {
      const existing = await getQuery(db,
        'SELECT * FROM AcademicYear WHERE yearName = ? AND tenantId = ?',
        [year.yearName, tenant.id]
      );

      if (!existing) {
        const yearId = 'ay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        await runQuery(db, `
          INSERT INTO AcademicYear (id, tenantId, yearName, startDate, endDate, isCurrent, status, createdAt, updatedAt, createdBy, updatedBy)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)
        `, [yearId, tenant.id, year.yearName, year.startDate, year.endDate, year.isCurrent, 'ACTIVE', user.id, user.id]);

        console.log(`  ✅ Created: ${year.yearName}`);
      } else {
        console.log(`  ℹ️  Already exists: ${year.yearName}`);
      }
    }

    // Create Subjects
    console.log('\n📚 Creating Subjects...');
    const subjects = [
      { subjectName: 'Mathematics', subjectCode: 'MATH_O', subjectLevel: 'O_LEVEL', subjectType: 'CORE' },
      { subjectName: 'English Language', subjectCode: 'ENG_O', subjectLevel: 'O_LEVEL', subjectType: 'CORE' },
      { subjectName: 'Physics', subjectCode: 'PHY_O', subjectLevel: 'O_LEVEL', subjectType: 'SCIENCE' },
      { subjectName: 'Chemistry', subjectCode: 'CHEM_O', subjectLevel: 'O_LEVEL', subjectType: 'SCIENCE' },
      { subjectName: 'Biology', subjectCode: 'BIO_O', subjectLevel: 'O_LEVEL', subjectType: 'SCIENCE' },
    ];

    for (const subject of subjects) {
      const existing = await getQuery(db,
        'SELECT * FROM Subject WHERE subjectCode = ? AND tenantId = ?',
        [subject.subjectCode, tenant.id]
      );

      if (!existing) {
        const subjectId = 'subj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        await runQuery(db, `
          INSERT INTO Subject (id, tenantId, subjectName, subjectCode, subjectLevel, subjectType, status, createdAt, updatedAt, createdBy, updatedBy)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)
        `, [subjectId, tenant.id, subject.subjectName, subject.subjectCode, subject.subjectLevel, subject.subjectType, 'ACTIVE', user.id, user.id]);

        console.log(`  ✅ Created: ${subject.subjectName}`);
      } else {
        console.log(`  ℹ️  Already exists: ${subject.subjectName}`);
      }
    }

    // Create Grading Scales
    console.log('\n⭐ Creating Grading Scales...');
    const gradingScales = [
      {
        scaleName: 'O-Level Grading (NECTA)',
        examLevel: 'O_LEVEL',
        isDefault: 1,
        gradeRanges: JSON.stringify([
          { grade: 'A', min: 80, max: 100, points: 5 },
          { grade: 'B', min: 65, max: 79, points: 4 },
          { grade: 'C', min: 50, max: 64, points: 3 },
          { grade: 'D', min: 30, max: 49, points: 2 },
          { grade: 'F', min: 0, max: 29, points: 1 }
        ])
      },
      {
        scaleName: 'A-Level Grading (NECTA)',
        examLevel: 'A_LEVEL',
        isDefault: 1,
        gradeRanges: JSON.stringify([
          { grade: 'A', min: 80, max: 100, points: 5 },
          { grade: 'B', min: 70, max: 79, points: 4 },
          { grade: 'C', min: 60, max: 69, points: 3 },
          { grade: 'D', min: 50, max: 59, points: 2 },
          { grade: 'E', min: 40, max: 49, points: 1 },
          { grade: 'F', min: 0, max: 39, points: 0 }
        ])
      }
    ];

    for (const scale of gradingScales) {
      const existing = await getQuery(db,
        'SELECT * FROM GradingScale WHERE scaleName = ? AND tenantId = ?',
        [scale.scaleName, tenant.id]
      );

      if (!existing) {
        const scaleId = 'gs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        await runQuery(db, `
          INSERT INTO GradingScale (id, tenantId, scaleName, examLevel, gradeRanges, isDefault, createdAt, updatedAt, createdBy, updatedBy)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)
        `, [scaleId, tenant.id, scale.scaleName, scale.examLevel, scale.gradeRanges, scale.isDefault, user.id, user.id]);

        console.log(`  ✅ Created: ${scale.scaleName}`);
      } else {
        console.log(`  ℹ️  Already exists: ${scale.scaleName}`);
      }
    }

    // Check permissions
    console.log('\n🔐 Checking Examination Permissions...');
    const permissions = [
      { name: 'examinations:create', description: 'Create examinations', resource: 'examinations', action: 'create' },
      { name: 'examinations:read', description: 'Read examinations', resource: 'examinations', action: 'read' },
      { name: 'examinations:update', description: 'Update examinations', resource: 'examinations', action: 'update' },
      { name: 'examinations:delete', description: 'Delete examinations', resource: 'examinations', action: 'delete' },
    ];

    for (const perm of permissions) {
      const existing = await getQuery(db, 'SELECT * FROM Permission WHERE name = ?', [perm.name]);
      if (!existing) {
        const permId = 'perm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        await runQuery(db, `
          INSERT INTO Permission (id, name, description, resource, action, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [permId, perm.name, perm.description, perm.resource, perm.action]);
        console.log(`  ✅ Created permission: ${perm.name}`);
      } else {
        console.log(`  ℹ️  Permission exists: ${perm.name}`);
      }
    }

    // Summary
    console.log('\n📊 Setup Summary:');
    const counts = {
      tenants: await getQuery(db, 'SELECT COUNT(*) as count FROM Tenant'),
      users: await getQuery(db, 'SELECT COUNT(*) as count FROM User'),
      academicYears: await getQuery(db, 'SELECT COUNT(*) as count FROM AcademicYear WHERE tenantId = ?', [tenant.id]),
      subjects: await getQuery(db, 'SELECT COUNT(*) as count FROM Subject WHERE tenantId = ?', [tenant.id]),
      gradingScales: await getQuery(db, 'SELECT COUNT(*) as count FROM GradingScale WHERE tenantId = ?', [tenant.id]),
      examinations: await getQuery(db, 'SELECT COUNT(*) as count FROM Examination WHERE tenantId = ?', [tenant.id]),
    };

    console.log(`  🏢 Tenants: ${counts.tenants.count}`);
    console.log(`  👥 Users: ${counts.users.count}`);
    console.log(`  📅 Academic Years: ${counts.academicYears.count}`);
    console.log(`  📚 Subjects: ${counts.subjects.count}`);
    console.log(`  ⭐ Grading Scales: ${counts.gradingScales.count}`);
    console.log(`  📝 Examinations: ${counts.examinations.count}`);

    console.log('\n🎉 Basic examination data setup completed successfully!');
    console.log('\n✨ You can now create examinations through the UI.');

  } catch (error) {
    console.error('❌ Error setting up basic data:', error);
  } finally {
    db.close();
  }
}

setupBasicData();
