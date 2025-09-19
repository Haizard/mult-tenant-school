-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "admissionNumber" TEXT,
    "admissionDate" DATETIME,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Tanzanian',
    "religion" TEXT,
    "bloodGroup" TEXT,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "postalCode" TEXT,
    "phone" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "medicalInfo" TEXT,
    "previousSchool" TEXT,
    "previousGrade" TEXT,
    "transportMode" TEXT,
    "transportRoute" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Student" ("address", "admissionDate", "admissionNumber", "bloodGroup", "city", "createdAt", "dateOfBirth", "emergencyContact", "emergencyPhone", "gender", "id", "isActive", "medicalInfo", "nationality", "phone", "postalCode", "previousGrade", "previousSchool", "region", "religion", "status", "studentId", "tenantId", "transportMode", "transportRoute", "updatedAt", "userId") SELECT "address", "admissionDate", "admissionNumber", "bloodGroup", "city", "createdAt", "dateOfBirth", "emergencyContact", "emergencyPhone", "gender", "id", "isActive", "medicalInfo", "nationality", "phone", "postalCode", "previousGrade", "previousSchool", "region", "religion", "status", "studentId", "tenantId", "transportMode", "transportRoute", "updatedAt", "userId" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");
CREATE UNIQUE INDEX "Student_tenantId_studentId_key" ON "Student"("tenantId", "studentId");
CREATE UNIQUE INDEX "Student_tenantId_admissionNumber_key" ON "Student"("tenantId", "admissionNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
