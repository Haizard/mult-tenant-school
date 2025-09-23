-- Migration to add missing fields to Class table
ALTER TABLE "Class" ADD COLUMN "academicLevel" TEXT DEFAULT 'O_LEVEL';
ALTER TABLE "Class" ADD COLUMN "academicYearId" TEXT;
ALTER TABLE "Class" ADD COLUMN "teacherId" TEXT;

-- Update existing records to have default academic level
UPDATE "Class" SET "academicLevel" = 'O_LEVEL' WHERE "academicLevel" IS NULL;

-- Add foreign key constraints
ALTER TABLE "Class" ADD CONSTRAINT "Class_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
