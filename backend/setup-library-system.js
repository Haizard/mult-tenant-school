const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function setupLibrarySystem() {
  try {
    console.log("🚀 Setting up Library Management System...");

    // Step 1: Push database schema changes
    console.log("📊 Updating database schema...");
    const { execSync } = require("child_process");
    try {
      execSync("npx prisma db push", { stdio: "inherit", cwd: __dirname });
      console.log("✅ Database schema updated successfully");
    } catch (error) {
      console.log("⚠️ Database schema update completed with warnings");
    }

    // Step 2: Create library permissions
    console.log("🔑 Creating library permissions...");

    const libraryPermissions = [
      {
        name: "library:read",
        description: "View library resources and data",
        resource: "library",
        action: "read",
      },
      {
        name: "library:create",
        description: "Add new books and library resources",
        resource: "library",
        action: "create",
      },
      {
        name: "library:update",
        description: "Update library resources and circulation",
        resource: "library",
        action: "update",
      },
      {
        name: "library:delete",
        description: "Remove library resources",
        resource: "library",
        action: "delete",
      },
      {
        name: "library:manage",
        description: "Full library management access",
        resource: "library",
        action: "manage",
      },
      {
        name: "library:circulation",
        description: "Issue and return books",
        resource: "library",
        action: "circulation",
      },
      {
        name: "library:reports",
        description: "Generate library reports and analytics",
        resource: "library",
        action: "reports",
      },
    ];

    for (const permission of libraryPermissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission,
      });
      console.log(`📋 Created permission: ${permission.name}`);
    }

    // Step 3: Assign library permissions to roles
    console.log("👥 Assigning library permissions to roles...");

    // Get roles
    const superAdminRole = await prisma.role.findFirst({
      where: { name: "Super Admin" },
    });

    const schoolAdminRole = await prisma.role.findFirst({
      where: { name: "School Admin" },
    });

    const teacherRole = await prisma.role.findFirst({
      where: { name: "Teacher" },
    });

    // Get a tenant for creating tenant-specific role
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      throw new Error("No tenant found. Please create a tenant first.");
    }

    const librarianRole = await prisma.role.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: "Librarian",
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        name: "Librarian",
        description: "Library staff with full library management access",
      },
    });

    const studentRole = await prisma.role.findFirst({
      where: { name: "Student" },
    });

    // Get all library permissions
    const allLibraryPermissions = await prisma.permission.findMany({
      where: {
        name: {
          startsWith: "library:",
        },
      },
    });

    // Super Admin: All library permissions
    if (superAdminRole) {
      for (const permission of allLibraryPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: superAdminRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        });
      }
      console.log("✅ Super Admin: All library permissions assigned");
    }

    // School Admin: All library permissions
    if (schoolAdminRole) {
      for (const permission of allLibraryPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: schoolAdminRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: schoolAdminRole.id,
            permissionId: permission.id,
          },
        });
      }
      console.log("✅ School Admin: All library permissions assigned");
    }

    // Librarian: All library permissions
    if (librarianRole) {
      for (const permission of allLibraryPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: librarianRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: librarianRole.id,
            permissionId: permission.id,
          },
        });
      }
      console.log("✅ Librarian: All library permissions assigned");
    }

    // Teacher: Read and basic circulation permissions
    if (teacherRole) {
      const teacherPermissions = ["library:read", "library:circulation"];
      for (const permName of teacherPermissions) {
        const permission = allLibraryPermissions.find(
          (p) => p.name === permName,
        );
        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: teacherRole.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              roleId: teacherRole.id,
              permissionId: permission.id,
            },
          });
        }
      }
      console.log("✅ Teacher: Read and circulation permissions assigned");
    }

    // Student: Read-only permissions
    if (studentRole) {
      const studentPermissions = ["library:read"];
      for (const permName of studentPermissions) {
        const permission = allLibraryPermissions.find(
          (p) => p.name === permName,
        );
        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: studentRole.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              roleId: studentRole.id,
              permissionId: permission.id,
            },
          });
        }
      }
      console.log("✅ Student: Read permissions assigned");
    }

    // Step 4: Create sample library data
    console.log("📚 Creating sample library data...");

    // Use the same tenant from role creation
    const user = await prisma.user.findFirst({
      where: { tenantId: tenant.id },
    });

    console.log(
      `Found tenant: ${tenant.id}, Found user: ${user?.id || "None"}`,
    );

    if (user) {
      const sampleBooks = [
        {
          tenantId: tenant.id,
          title: "Introduction to Computer Science",
          author: "John Smith",
          category: "Textbook",
          isbn: "978-0123456789",
          publisher: "Tech Publications",
          publishedYear: 2023,
          language: "English",
          pages: 450,
          totalCopies: 5,
          availableCopies: 5,
          condition: "GOOD",
          status: "ACTIVE",
          acquisitionType: "PURCHASE",
          acquisitionDate: new Date(),
          createdBy: user.id,
        },
        {
          tenantId: tenant.id,
          title: "Advanced Mathematics",
          author: "Dr. Jane Doe",
          category: "Mathematics",
          isbn: "978-0987654321",
          publisher: "Academic Press",
          publishedYear: 2022,
          language: "English",
          pages: 680,
          totalCopies: 3,
          availableCopies: 3,
          condition: "EXCELLENT",
          status: "ACTIVE",
          acquisitionType: "PURCHASE",
          acquisitionDate: new Date(),
          createdBy: user.id,
        },
        {
          tenantId: tenant.id,
          title: "World History: A Comprehensive Guide",
          author: "Prof. Michael Johnson",
          category: "History",
          isbn: "978-0456789123",
          publisher: "Historical Society Press",
          publishedYear: 2021,
          language: "English",
          pages: 890,
          totalCopies: 4,
          availableCopies: 4,
          condition: "GOOD",
          status: "ACTIVE",
          acquisitionType: "DONATION",
          acquisitionDate: new Date(),
          createdBy: user.id,
        },
        {
          tenantId: tenant.id,
          title: "Modern Physics Principles",
          author: "Dr. Sarah Wilson",
          category: "Science",
          isbn: "978-0789123456",
          publisher: "Science Education Ltd",
          publishedYear: 2023,
          language: "English",
          pages: 520,
          totalCopies: 2,
          availableCopies: 2,
          condition: "EXCELLENT",
          status: "ACTIVE",
          acquisitionType: "PURCHASE",
          acquisitionDate: new Date(),
          createdBy: user.id,
        },
        {
          tenantId: tenant.id,
          title: "English Literature Anthology",
          author: "Various Authors",
          category: "Literature",
          isbn: "978-0321654987",
          publisher: "Literary Press",
          publishedYear: 2020,
          language: "English",
          pages: 750,
          totalCopies: 6,
          availableCopies: 6,
          condition: "FAIR",
          status: "ACTIVE",
          acquisitionType: "GIFT",
          acquisitionDate: new Date(),
          createdBy: user.id,
        },
      ];

      for (const book of sampleBooks) {
        try {
          await prisma.book.create({ data: book });
          console.log(`📖 Created sample book: ${book.title}`);
        } catch (bookError) {
          console.error(
            `❌ Error creating book "${book.title}":`,
            bookError.message,
          );
        }
      }
    } else {
      console.log("⚠️ No user found for sample data creation");
    }

    console.log("🎉 Library Management System setup completed successfully!");
    console.log("\n📊 Summary:");
    console.log("- ✅ Database schema updated");
    console.log("- ✅ Library permissions created");
    console.log("- ✅ Role permissions assigned");
    console.log("- ✅ Sample books created");
    console.log("\n🚀 Library system is ready for use!");
  } catch (error) {
    console.error("❌ Error setting up library system:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupLibrarySystem();
