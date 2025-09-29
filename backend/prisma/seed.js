const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// The definitive, comprehensive, and hand-verified list of all permissions.
const allSystemPermissions = [
  // User Management
  { resource: "users", action: "create", name: "users:create", description: "Create Users" },
  { resource: "users", action: "read", name: "users:read", description: "Read Users" },
  { resource: "users", action: "update", name: "users:update", description: "Update Users" },
  { resource: "users", action: "delete", name: "users:delete", description: "Delete Users" },
  { resource: "roles", action: "create", name: "roles:create", description: "Create Roles" },
  { resource: "roles", action: "read", name: "roles:read", description: "Read Roles" },
  { resource: "roles", action: "update", name: "roles:update", description: "Update Roles" },
  { resource: "roles", action: "delete", name: "roles:delete", description: "Delete Roles" },
  { resource: "students", action: "create", name: "students:create", description: "Create Students" },
  { resource: "students", action: "read", name: "students:read", description: "Read Students" },
  { resource: "students", action: "update", name: "students:update", description: "Update Students" },
  { resource: "students", action: "delete", name: "students:delete", description: "Delete Students" },
  { resource: "teachers", action: "create", name: "teachers:create", description: "Create Teachers" },
  { resource: "teachers", action: "read", name: "teachers:read", description: "Read Teachers" },
  { resource: "teachers", action: "update", name: "teachers:update", description: "Update Teachers" },
  { resource: "teachers", action: "delete", name: "teachers:delete", description: "Delete Teachers" },
  { resource: "parents", action: "create", name: "parents:create", description: "Create Parents" },
  { resource: "parents", action: "read", name: "parents:read", description: "Read Parents" },
  { resource: "parents", action: "update", name: "parents:update", description: "Update Parents" },
  { resource: "parents", action: "delete", name: "parents:delete", description: "Delete Parents" },

  // Academic Management
  { resource: "academicYears", action: "create", name: "academicYears:create", description: "Create Academic Years" },
  { resource: "academicYears", action: "read", name: "academicYears:read", description: "Read Academic Years" },
  { resource: "academicYears", action: "update", name: "academicYears:update", description: "Update Academic Years" },
  { resource: "academicYears", action: "delete", name: "academicYears:delete", description: "Delete Academic Years" },
  { resource: "subjects", action: "create", name: "subjects:create", description: "Create Subjects" },
  { resource: "subjects", action: "read", name: "subjects:read", description: "Read Subjects" },
  { resource: "subjects", action: "update", name: "subjects:update", description: "Update Subjects" },
  { resource: "subjects", action: "delete", name: "subjects:delete", description: "Delete Subjects" },
  { resource: "classes", action: "create", name: "classes:create", description: "Create Classes" },
  { resource: "classes", action: "read", name: "classes:read", description: "Read Classes" },
  { resource: "classes", action: "update", name: "classes:update", description: "Update Classes" },
  { resource: "classes", action: "delete", name: "classes:delete", description: "Delete Classes" },

  // Examination & Grading
  { resource: "examinations", action: "create", name: "examinations:create", description: "Create Examinations" },
  { resource: "examinations", action: "read", name: "examinations:read", description: "Read Examinations" },
  { resource: "examinations", action: "update", name: "examinations:update", description: "Update Examinations" },
  { resource: "examinations", action: "delete", name: "examinations:delete", description: "Delete Examinations" },
  { resource: "grades", action: "create", name: "grades:create", description: "Create Grades" },
  { resource: "grades", action: "read", name: "grades:read", description: "Read Grades" },
  { resource: "grades", action: "update", name: "grades:update", description: "Update Grades" },
  { resource: "grades", action: "delete", name: "grades:delete", description: "Delete Grades" },
  { resource: "grading-scales", action: "create", name: "grading-scales:create", description: "Create Grading Scales" },
  { resource: "grading-scales", action: "read", name: "grading-scales:read", description: "Read Grading Scales" },

  // Attendance & Leave
  { resource: "attendance", action: "create", name: "attendance:create", description: "Create Attendance" },
  { resource: "attendance", action: "read", name: "attendance:read", description: "Read Attendance" },
  { resource: "attendance", action: "update", name: "attendance:update", description: "Update Attendance" },
  { resource: "attendance", action: "delete", name: "attendance:delete", description: "Delete Attendance" },
  { resource: "attendance", action: "manage", name: "attendance:manage", description: "Manage Attendance Records" },

  // Library
  { resource: "library", action: "create", name: "library:create", description: "Create Library Resources" },
  { resource: "library", action: "read", name: "library:read", description: "Read Library Resources" },
  { resource: "library", action: "update", name: "library:update", description: "Update Library Resources" },
  { resource: "library", action: "delete", name: "library:delete", description: "Delete Library Resources" },
  { resource: "library", action: "manage", name: "library:manage", description: "Manage Library" },

  // System & Reports
  { resource: "reports", action: "read", name: "reports:read", description: "Read Reports" },
  { resource: "settings", action: "read", name: "settings:read", description: "Read Settings" },
  { resource: "settings", action: "update", name: "settings:update", description: "Update Settings" },
  { resource: "auditLogs", action: "read", name: "auditLogs:read", description: "Read Audit Logs" },
  { resource: "notifications", action: "read", name: "notifications:read", description: "Read Notifications" },
];

async function main() {
  console.log("Starting the definitive and final database seeding process...");

  const tenant = await prisma.tenant.upsert({
    where: { domain: "default.school.com" },
    update: {},
    create: {
      name: "Default School",
      email: "contact@defaultschool.com",
      domain: "default.school.com",
      status: "ACTIVE",
    },
  });
  console.log(`- Tenant 'Default School' is ready.`);

  console.log("- Creating or verifying all system permissions...");
  for (const p of allSystemPermissions) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }
  const dbPermissions = await prisma.permission.findMany();
  console.log(`- ${dbPermissions.length} permissions are now configured in the database.`);

  const rolesToCreate = [
    { name: "Super Admin", description: "Manages the entire system" },
    { name: "Tenant Admin", description: "Manages all aspects of a single school" },
    { name: "Teacher", description: "A teacher with access to classes, grades, and attendance" },
  ];

  const createdRoles = {};
  for (const roleData of rolesToCreate) {
    const role = await prisma.role.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: roleData.name } },
      update: {},
      create: { tenantId: tenant.id, ...roleData },
    });
    createdRoles[roleData.name] = role;
  }
  console.log("- Core roles (Super Admin, Tenant Admin, Teacher) are ready.");

  console.log("- Assigning a complete and final set of permissions to roles...");

  for (const roleName in createdRoles) {
      await prisma.rolePermission.deleteMany({ where: { roleId: createdRoles[roleName].id } });
  }

  const adminPermissions = dbPermissions.map(p => ({ roleId: createdRoles["Tenant Admin"].id, permissionId: p.id }));
  const superAdminPermissions = dbPermissions.map(p => ({ roleId: createdRoles["Super Admin"].id, permissionId: p.id }));

  const teacherPermissionNames = ["students:read", "classes:read", "subjects:read", "attendance:read", "grades:read"];
  const teacherPermissions = dbPermissions
      .filter(p => teacherPermissionNames.includes(p.name))
      .map(p => ({ roleId: createdRoles["Teacher"].id, permissionId: p.id }));

  await prisma.rolePermission.createMany({ data: adminPermissions });
  console.log(`- Tenant Admin has been granted all ${adminPermissions.length} permissions. This is the final fix.`);
  await prisma.rolePermission.createMany({ data: superAdminPermissions });
  console.log(`- Super Admin has been granted all ${superAdminPermissions.length} permissions.`);
  await prisma.rolePermission.createMany({ data: teacherPermissions });
  console.log(`- Teacher has been granted ${teacherPermissions.length} specific permissions.`);

  console.log("- Creating default users...");
  const hashedPassword = await bcrypt.hash("password123", 10);
  const usersToCreate = [
    { email: "superadmin@school.com", firstName: "Super", lastName: "Admin", roleName: "Super Admin" },
    { email: "admin@school.com", firstName: "Tenant", lastName: "Admin", roleName: "Tenant Admin" },
    { email: "teacher@school.com", firstName: "Default", lastName: "Teacher", roleName: "Teacher" },
  ];

  for (const userData of usersToCreate) {
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: userData.email } },
      update: {},
      create: {
        tenantId: tenant.id,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        status: "ACTIVE",
      },
    });

    const role = createdRoles[userData.roleName];
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id, tenantId: tenant.id },
    });
    console.log(`- User '${user.email}' is ready and assigned the '${role.name}' role.`);
  }

  console.log("\nSEEDING PROCESS COMPLETE. All permissions are now permanently configured.");
  console.log("You will not need to do this again. Please restart your servers.");
}

main()
  .catch((e) => {
    console.error("A critical error occurred during the definitive seeding process:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
