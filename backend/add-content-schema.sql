-- Content Management System Tables
-- Add to existing Prisma schema

-- Content table for educational materials
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content_type" TEXT NOT NULL, -- 'document', 'video', 'presentation', 'interactive', 'resource'
    "file_path" TEXT,
    "file_url" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "category" TEXT, -- subject category
    "tags" TEXT[], -- array of tags
    "grade_level" TEXT,
    "subject_id" TEXT,
    "created_by" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
    "approval_status" TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "views_count" INTEGER DEFAULT 0,
    "downloads_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- Content assignments (sharing with students/classes)
CREATE TABLE "ContentAssignment" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "assigned_by" TEXT NOT NULL,
    "assignment_type" TEXT NOT NULL, -- 'student', 'class', 'grade'
    "target_id" TEXT NOT NULL, -- student_id, class_id, or grade_level
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3),
    "instructions" TEXT,
    "is_mandatory" BOOLEAN DEFAULT false,
    "status" TEXT DEFAULT 'assigned', -- 'assigned', 'viewed', 'completed'

    CONSTRAINT "ContentAssignment_pkey" PRIMARY KEY ("id")
);

-- Content versions for version control
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "file_path" TEXT,
    "file_url" TEXT,
    "changes_description" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

-- Content usage tracking and analytics
CREATE TABLE "ContentUsage" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_type" TEXT NOT NULL, -- 'student', 'teacher', 'parent'
    "action_type" TEXT NOT NULL, -- 'view', 'download', 'share', 'comment'
    "duration_seconds" INTEGER, -- for videos/presentations
    "progress_percentage" INTEGER DEFAULT 0,
    "device_info" TEXT,
    "ip_address" TEXT,
    "accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentUsage_pkey" PRIMARY KEY ("id")
);

-- Content comments and feedback
CREATE TABLE "ContentComment" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "comment_text" TEXT NOT NULL,
    "parent_comment_id" TEXT, -- for replies
    "is_public" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentComment_pkey" PRIMARY KEY ("id")
);

-- Content collections (playlists/courses)
CREATE TABLE "ContentCollection" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "is_public" BOOLEAN DEFAULT false,
    "subject_id" TEXT,
    "grade_level" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentCollection_pkey" PRIMARY KEY ("id")
);

-- Content collection items (many-to-many)
CREATE TABLE "ContentCollectionItem" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "collection_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentCollectionItem_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "Content" ADD CONSTRAINT "Content_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Content" ADD CONSTRAINT "Content_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Content" ADD CONSTRAINT "Content_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ContentAssignment" ADD CONSTRAINT "ContentAssignment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContentAssignment" ADD CONSTRAINT "ContentAssignment_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentAssignment" ADD CONSTRAINT "ContentAssignment_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ContentVersion" ADD CONSTRAINT "ContentVersion_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContentVersion" ADD CONSTRAINT "ContentVersion_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentVersion" ADD CONSTRAINT "ContentVersion_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ContentUsage" ADD CONSTRAINT "ContentUsage_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContentUsage" ADD CONSTRAINT "ContentUsage_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentUsage" ADD CONSTRAINT "ContentUsage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContentComment" ADD CONSTRAINT "ContentComment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContentComment" ADD CONSTRAINT "ContentComment_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentComment" ADD CONSTRAINT "ContentComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentComment" ADD CONSTRAINT "ContentComment_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "ContentComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContentCollection" ADD CONSTRAINT "ContentCollection_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContentCollection" ADD CONSTRAINT "ContentCollection_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContentCollection" ADD CONSTRAINT "ContentCollection_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ContentCollectionItem" ADD CONSTRAINT "ContentCollectionItem_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContentCollectionItem" ADD CONSTRAINT "ContentCollectionItem_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "ContentCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentCollectionItem" ADD CONSTRAINT "ContentCollectionItem_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add indexes for performance
CREATE INDEX "Content_tenant_id_idx" ON "Content"("tenant_id");
CREATE INDEX "Content_created_by_idx" ON "Content"("created_by");
CREATE INDEX "Content_subject_id_idx" ON "Content"("subject_id");
CREATE INDEX "Content_status_idx" ON "Content"("status");
CREATE INDEX "Content_content_type_idx" ON "Content"("content_type");

CREATE INDEX "ContentAssignment_tenant_id_idx" ON "ContentAssignment"("tenant_id");
CREATE INDEX "ContentAssignment_content_id_idx" ON "ContentAssignment"("content_id");
CREATE INDEX "ContentAssignment_target_id_idx" ON "ContentAssignment"("target_id");

CREATE INDEX "ContentUsage_tenant_id_idx" ON "ContentUsage"("tenant_id");
CREATE INDEX "ContentUsage_content_id_idx" ON "ContentUsage"("content_id");
CREATE INDEX "ContentUsage_user_id_idx" ON "ContentUsage"("user_id");

-- Add unique constraints
CREATE UNIQUE INDEX "ContentVersion_content_id_version_number_key" ON "ContentVersion"("content_id", "version_number");
CREATE UNIQUE INDEX "ContentCollectionItem_collection_id_content_id_key" ON "ContentCollectionItem"("collection_id", "content_id");
