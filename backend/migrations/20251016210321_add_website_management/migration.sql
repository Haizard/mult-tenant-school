-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "contentType" TEXT NOT NULL,
    "tags" TEXT,
    "folder" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
    "permissions" JSONB,
    "filePath" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "subjectId" TEXT,
    "classId" TEXT,
    "academicYearId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "Content_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Content_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Content_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Content_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Content_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Content_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "assignmentType" TEXT NOT NULL,
    "studentId" TEXT,
    "classId" TEXT,
    "subjectId" TEXT,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "instructions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "completedAt" DATETIME,
    "completionNotes" TEXT,
    CONSTRAINT "ContentAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentAssignment_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ContentAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ContentAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ContentAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "changeDescription" TEXT,
    "diffMetadata" JSONB,
    "filePath" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "ContentVersion_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentVersion_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentVersion_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "userId" TEXT,
    "studentId" TEXT,
    "usageType" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSeconds" INTEGER,
    "deviceInfo" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "engagementScore" REAL,
    "metadata" JSONB,
    CONSTRAINT "ContentUsage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentUsage_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ContentUsage_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "feeName" TEXT NOT NULL,
    "feeType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "frequency" TEXT NOT NULL DEFAULT 'ONE_TIME',
    "applicableLevels" JSONB NOT NULL,
    "applicableClasses" JSONB NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "fees_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fees_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fees_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fee_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "feeId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "classId" TEXT,
    "assignedAmount" REAL NOT NULL,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "scholarshipAmount" REAL NOT NULL DEFAULT 0,
    "finalAmount" REAL NOT NULL,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "fee_assignments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fee_assignments_feeId_fkey" FOREIGN KEY ("feeId") REFERENCES "fees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fee_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fee_assignments_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fee_assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fee_assignments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fee_assignments_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "feeAssignmentId" TEXT,
    "studentId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "paymentMethod" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "transactionId" TEXT,
    "referenceNumber" TEXT,
    "paymentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "receiptNumber" TEXT,
    "processedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payments_feeAssignmentId_fkey" FOREIGN KEY ("feeAssignmentId") REFERENCES "fee_assignments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "payments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payments_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "feeAssignmentId" TEXT,
    "studentId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "classId" TEXT,
    "totalAmount" REAL NOT NULL,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "outstandingAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "issueDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentTerms" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "invoices_feeAssignmentId_fkey" FOREIGN KEY ("feeAssignmentId") REFERENCES "fee_assignments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "invoices_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "invoices_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "invoices_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "expenseCategory" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "expenseDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vendor" TEXT,
    "receiptNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "rejectionReason" TEXT,
    "budgetId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "expenses_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "expenses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "expenses_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "expenses_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "budgetName" TEXT NOT NULL,
    "budgetYear" INTEGER NOT NULL,
    "budgetCategory" TEXT NOT NULL,
    "allocatedAmount" REAL NOT NULL,
    "spentAmount" REAL NOT NULL DEFAULT 0,
    "remainingAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "budgets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "budgets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "budgets_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "paymentId" TEXT,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "reason" TEXT NOT NULL,
    "refundType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "processedBy" TEXT,
    "processedAt" DATETIME,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "refunds_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "refunds_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "refunds_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "refunds_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "financial_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "parameters" JSONB,
    "data" JSONB NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "format" TEXT NOT NULL DEFAULT 'PDF',
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "filePath" TEXT,
    "expiryDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "financial_reports_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "financial_reports_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transport_routes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "routeCode" TEXT,
    "description" TEXT,
    "startLocation" TEXT NOT NULL,
    "endLocation" TEXT NOT NULL,
    "stops" JSONB NOT NULL,
    "distance" REAL,
    "estimatedDuration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "capacity" INTEGER NOT NULL DEFAULT 30,
    "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
    "fareAmount" REAL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "operatingDays" JSONB NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "transport_routes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "capacity" INTEGER NOT NULL DEFAULT 30,
    "fuelType" TEXT NOT NULL DEFAULT 'DIESEL',
    "registrationNumber" TEXT,
    "chassisNumber" TEXT,
    "engineNumber" TEXT,
    "insuranceNumber" TEXT,
    "insuranceExpiry" DATETIME,
    "roadTaxExpiry" DATETIME,
    "fitnessExpiry" DATETIME,
    "permitExpiry" DATETIME,
    "purchaseDate" DATETIME,
    "purchasePrice" REAL,
    "currentMileage" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "location" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "vehicles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "driverCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "dateOfBirth" DATETIME,
    "licenseNumber" TEXT NOT NULL,
    "licenseType" TEXT NOT NULL,
    "licenseExpiry" DATETIME NOT NULL,
    "experience" INTEGER,
    "joiningDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "salary" REAL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "drivers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "driver_vehicle_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "assignedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "driver_vehicle_assignments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "driver_vehicle_assignments_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "driver_vehicle_assignments_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "student_transport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "pickupPoint" TEXT NOT NULL,
    "dropoffPoint" TEXT NOT NULL,
    "pickupTime" TEXT,
    "dropoffTime" TEXT,
    "distance" REAL,
    "transportType" TEXT NOT NULL DEFAULT 'SCHOOL_BUS',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "effectiveDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "monthlyFee" REAL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "specialNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "student_transport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "student_transport_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "student_transport_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "transport_routes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transport_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "driverId" TEXT,
    "scheduleType" TEXT NOT NULL DEFAULT 'REGULAR',
    "date" DATETIME NOT NULL,
    "departureTime" TEXT NOT NULL,
    "arrivalTime" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "actualDepartureTime" TEXT,
    "actualArrivalTime" TEXT,
    "delayReason" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "transport_schedules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transport_schedules_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "transport_routes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transport_schedules_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transport_schedules_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transport_fees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "studentTransportId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "feeType" TEXT NOT NULL DEFAULT 'MONTHLY',
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "billingMonth" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "outstandingAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentDate" DATETIME,
    "receiptNumber" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "transport_fees_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transport_fees_studentTransportId_fkey" FOREIGN KEY ("studentTransportId") REFERENCES "student_transport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transport_fees_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "transport_routes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transport_fees_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transport_attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "studentTransportId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "attendanceType" TEXT NOT NULL DEFAULT 'PICKUP',
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "checkInTime" DATETIME,
    "checkOutTime" DATETIME,
    "location" TEXT,
    "notes" TEXT,
    "markedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "transport_attendance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transport_attendance_studentTransportId_fkey" FOREIGN KEY ("studentTransportId") REFERENCES "student_transport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transport_attendance_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "transport_schedules" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transport_attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transport_incidents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "routeId" TEXT,
    "vehicleId" TEXT,
    "driverId" TEXT,
    "incidentType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'LOW',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "incidentDate" DATETIME NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "reportedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'REPORTED',
    "actionTaken" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" DATETIME,
    "resolvedAt" DATETIME,
    "resolvedBy" TEXT,
    "cost" REAL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "attachments" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "transport_incidents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transport_incidents_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "transport_routes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transport_incidents_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transport_incidents_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vehicle_maintenances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "maintenanceType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledDate" DATETIME NOT NULL,
    "completedDate" DATETIME,
    "cost" REAL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "vendor" TEXT,
    "nextMaintenanceDate" DATETIME,
    "mileageAtMaintenance" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "notes" TEXT,
    "attachments" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "vehicle_maintenances_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "vehicle_maintenances_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hostels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "totalCapacity" INTEGER NOT NULL DEFAULT 0,
    "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
    "availableRooms" INTEGER NOT NULL DEFAULT 0,
    "monthlyFee" REAL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "wardenName" TEXT,
    "wardenPhone" TEXT,
    "wardenEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "hostels_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hostel_rooms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "floorNumber" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
    "roomType" TEXT NOT NULL DEFAULT 'SINGLE',
    "monthlyFee" REAL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "amenities" JSONB,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "hostel_rooms_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hostel_rooms_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "hostels" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hostel_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "assignmentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "monthlyFee" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "depositAmount" REAL,
    "depositPaid" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "hostel_assignments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hostel_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hostel_assignments_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "hostels" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hostel_assignments_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "hostel_rooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hostel_maintenances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "roomId" TEXT,
    "maintenanceType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "scheduledDate" DATETIME NOT NULL,
    "completedDate" DATETIME,
    "cost" REAL,
    "currency" TEXT NOT NULL DEFAULT 'TZS',
    "vendor" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "attachments" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "hostel_maintenances_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hostel_maintenances_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "hostels" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hostel_maintenances_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "hostel_rooms" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hostel_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "parameters" JSONB,
    "data" JSONB NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "format" TEXT NOT NULL DEFAULT 'PDF',
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "filePath" TEXT,
    "expiryDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "hostel_reports_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hostel_reports_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "hostels" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "website_pages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "pageName" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "pageType" TEXT NOT NULL,
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "website_pages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "website_pages_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "website_pages_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "website_content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentData" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "website_content_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "website_content_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "website_pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "website_content_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "website_gallery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "pageId" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imageTitle" TEXT,
    "imageDescription" TEXT,
    "imageAltText" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "website_gallery_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "website_gallery_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "website_pages" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "website_gallery_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "website_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "websiteTitle" TEXT,
    "websiteDescription" TEXT,
    "logoUrl" TEXT,
    "themeColor" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "fontFamily" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "address" TEXT,
    "socialMedia" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "website_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "website_settings_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "website_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "pageId" TEXT,
    "visitorIp" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "pageViews" INTEGER NOT NULL DEFAULT 1,
    "sessionDuration" INTEGER,
    "visitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "website_analytics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "website_analytics_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "website_pages" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Content_tenantId_status_idx" ON "Content"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Content_tenantId_contentType_idx" ON "Content"("tenantId", "contentType");

-- CreateIndex
CREATE INDEX "Content_tenantId_subjectId_idx" ON "Content"("tenantId", "subjectId");

-- CreateIndex
CREATE INDEX "Content_tenantId_classId_idx" ON "Content"("tenantId", "classId");

-- CreateIndex
CREATE INDEX "Content_tenantId_createdAt_idx" ON "Content"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "ContentAssignment_tenantId_contentId_idx" ON "ContentAssignment"("tenantId", "contentId");

-- CreateIndex
CREATE INDEX "ContentAssignment_tenantId_assignmentType_idx" ON "ContentAssignment"("tenantId", "assignmentType");

-- CreateIndex
CREATE INDEX "ContentAssignment_tenantId_studentId_idx" ON "ContentAssignment"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "ContentAssignment_tenantId_classId_idx" ON "ContentAssignment"("tenantId", "classId");

-- CreateIndex
CREATE INDEX "ContentAssignment_tenantId_subjectId_idx" ON "ContentAssignment"("tenantId", "subjectId");

-- CreateIndex
CREATE INDEX "ContentAssignment_tenantId_dueDate_idx" ON "ContentAssignment"("tenantId", "dueDate");

-- CreateIndex
CREATE INDEX "ContentAssignment_tenantId_status_idx" ON "ContentAssignment"("tenantId", "status");

-- CreateIndex
CREATE INDEX "ContentVersion_tenantId_contentId_idx" ON "ContentVersion"("tenantId", "contentId");

-- CreateIndex
CREATE INDEX "ContentVersion_tenantId_status_idx" ON "ContentVersion"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVersion_tenantId_contentId_versionNumber_key" ON "ContentVersion"("tenantId", "contentId", "versionNumber");

-- CreateIndex
CREATE INDEX "ContentUsage_tenantId_contentId_idx" ON "ContentUsage"("tenantId", "contentId");

-- CreateIndex
CREATE INDEX "ContentUsage_tenantId_userId_idx" ON "ContentUsage"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "ContentUsage_tenantId_studentId_idx" ON "ContentUsage"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "ContentUsage_tenantId_usageType_idx" ON "ContentUsage"("tenantId", "usageType");

-- CreateIndex
CREATE INDEX "ContentUsage_tenantId_timestamp_idx" ON "ContentUsage"("tenantId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_referenceNumber_key" ON "payments"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "payments_receiptNumber_key" ON "payments"("receiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "transport_routes_tenantId_routeName_key" ON "transport_routes"("tenantId", "routeName");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_tenantId_vehicleNumber_key" ON "vehicles"("tenantId", "vehicleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_tenantId_registrationNumber_key" ON "vehicles"("tenantId", "registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_tenantId_driverCode_key" ON "drivers"("tenantId", "driverCode");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_tenantId_licenseNumber_key" ON "drivers"("tenantId", "licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "driver_vehicle_assignments_tenantId_driverId_vehicleId_assignedDate_key" ON "driver_vehicle_assignments"("tenantId", "driverId", "vehicleId", "assignedDate");

-- CreateIndex
CREATE UNIQUE INDEX "student_transport_tenantId_studentId_routeId_key" ON "student_transport"("tenantId", "studentId", "routeId");

-- CreateIndex
CREATE UNIQUE INDEX "transport_schedules_tenantId_routeId_date_departureTime_key" ON "transport_schedules"("tenantId", "routeId", "date", "departureTime");

-- CreateIndex
CREATE UNIQUE INDEX "transport_fees_tenantId_studentTransportId_billingMonth_key" ON "transport_fees"("tenantId", "studentTransportId", "billingMonth");

-- CreateIndex
CREATE UNIQUE INDEX "transport_attendance_tenantId_studentTransportId_scheduleId_date_attendanceType_key" ON "transport_attendance"("tenantId", "studentTransportId", "scheduleId", "date", "attendanceType");

-- CreateIndex
CREATE UNIQUE INDEX "hostels_tenantId_name_key" ON "hostels"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_rooms_tenantId_hostelId_roomNumber_key" ON "hostel_rooms"("tenantId", "hostelId", "roomNumber");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_assignments_tenantId_studentId_hostelId_roomId_key" ON "hostel_assignments"("tenantId", "studentId", "hostelId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "website_pages_tenantId_pageSlug_key" ON "website_pages"("tenantId", "pageSlug");

-- CreateIndex
CREATE UNIQUE INDEX "website_content_tenantId_pageId_versionNumber_key" ON "website_content"("tenantId", "pageId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "website_settings_tenantId_key" ON "website_settings"("tenantId");
