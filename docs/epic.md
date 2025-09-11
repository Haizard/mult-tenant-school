# Epic: Multi-Tenant School Management System

## Purpose
To develop a comprehensive, multi-tenant School Management System designed to streamline administrative, academic, and operational processes for educational institutions in Tanzania, addressing inefficiencies such as manual record-keeping, disparate systems, and non-compliance with NECTA regulations. The system aims to reduce administrative overhead by 30%, improve data accuracy by 40%, and enhance communication efficiency by 25% within the first year of implementation, with a strong emphasis on data isolation, configurable features, and strict compliance with Tanzanian academic regulations (NECTA).

## Vision
To provide a scalable and adaptable platform that empowers schools to efficiently manage students, teachers, academic records, finances, and communication, thereby becoming the leading school management solution in Tanzania. This will be achieved by offering a secure, personalized, and highly compliant experience for each tenant (school), enabling them to achieve operational excellence and improved educational outcomes. The system will support the creation of detailed user personas for Super Admins, Tenant Admins, Students, Teachers, Parents, and Staff, and will consider competitive solutions in the Tanzanian market to ensure a differentiated and superior offering.

## Key Features (High-Level)

### 1. User & Role Management
- **Multi-Tenant Authentication & Authorization:** Secure login, role-based access control (RBAC) with granular permissions, ensuring strict data isolation per tenant.
- **User Profiles:** Comprehensive profiles for Super Admins, Tenant Admins, Students, Teachers, Parents, and Staff.
- **Tenant-Specific Roles:** Ability for School Admins to define custom roles within their tenant.

### 2. Academic Management
- **Course & Subject Management:** Define courses and subjects with support for different academic levels (Primary, O-Level, A-Level) and subject types (Core, Optional, Combination).
- **Class Scheduling & Timetable:** Create and manage timetables, including room allocation and conflict detection.
- **Gradebook & Grading System:** Configurable grading scales, weighted grades, and automatic calculation of overall grades.
- **Report Card Generation:** Customizable templates for generating academic reports.
- **Academic Year & Session Management:** Define and manage academic years, terms, and semesters.
- **NECTA Compliance:** Specific logic for O-Level and A-Level division calculations based on NECTA guidelines.

### 3. Student & Teacher Management
- **Comprehensive Profiles:** Detailed personal, academic, and professional information.
- **Enrollment & Assignment:** Streamlined processes for student enrollment and assignment to classes/sections; teacher assignment to classes/subjects.
- **Status Management:** Track active, inactive, graduated, withdrawn, or on-leave statuses.

### 4. Examination & Grading
- **Dynamic Grade System:** Configurable grade levels, customizable grading scales, and dynamic weighting for assessments.
- **Exam Scheduling:** Create and manage various exam types with specific dates and times.
- **Mark Entry & Calculation:** Efficient mark entry for teachers with automatic calculation of results.
- **Result Publication:** Secure publication of results to students and parents.

### 5. Attendance Management
- **Daily/Period-wise Tracking:** Manual and future automated attendance capture for students and teachers.
- **Absence Reporting & Notifications:** Real-time updates and automated alerts for unexplained absences.
- **Attendance History:** Detailed records for individual students and teachers.

### 6. Finance & Fee Management
- **Fee Structure Definition:** Configurable fee types, installment plans, and discount management.
- **Fee Collection & Tracking:** Support for multiple payment methods, automated reminders, and receipt generation.
- **Expense Tracking:** Record and categorize school expenses.
- **Salary Management:** (Optional) Payroll processing for staff.

### 7. Content Management
- **Announcements & Notices:** Targeted communication with scheduling options.
- **Event Calendar:** Centralized calendar for school events with reminders.
- **News & Updates:** Platform for sharing school news and articles.
- **Document Sharing:** Secure repository for sharing documents with access control.

### 8. Admin Portal & Dashboard
- **Overview & Metrics:** Customizable dashboards displaying key performance indicators (KPIs) specific to each tenant.
- **Reporting & Analytics:** Comprehensive reports across all modules with export options.
- **System Configuration:** Centralized settings management for both tenant-specific and global configurations.

### 9. Library Management
- **Book Cataloging:** Comprehensive details and availability status for library resources.
- **Issue & Return Management:** Streamlined borrowing, returning, and reservation processes.
- **Fine Management:** Automated calculation and tracking of overdue and damage fines.
- **Borrowing History:** Detailed records for students and teachers.

### 10. Dormitory Management
- **Room Allocation:** Assign students to specific rooms and beds.
- **Visitor Management:** Track and manage visitors for security.
- **Facilities & Maintenance:** (Future) Management of dormitory facilities and maintenance requests.

## Minimum Viable Product (MVP) Scope

### 1. Core Functionality (MVP)
- **User & Role Management:** Multi-Tenant Authentication & Authorization, User Profiles (Super Admins, Tenant Admins, Students, Teachers).
- **Academic Management:** Course & Subject Management, Gradebook & Grading System (basic), Academic Year & Session Management.
- **Student & Teacher Management:** Comprehensive Profiles, Enrollment & Assignment.
- **Examination & Grading:** Dynamic Grade System (basic), Mark Entry & Calculation.
- **Attendance Management:** Daily/Period-wise Tracking.
- **Admin Portal & Dashboard:** Overview & Metrics (basic).

### 2. Scope Boundaries (MVP)
- **In Scope:** The features listed under 'Core Functionality (MVP)' will be developed and released in the initial version.
- **Out of Scope for MVP:**
  - **Dormitory Management:** All features.
  - **Library Management:** All features.
  - **Finance & Fee Management:** All features.
  - **Content Management:** News & Updates, Document Sharing.
  - **Advanced Features:** Automated attendance capture, detailed report card generation, custom tenant-specific roles, salary management, advanced reporting & analytics.
- **Rationale:** This focused scope allows for rapid development, early user feedback, and validation of core assumptions, minimizing initial investment while maximizing learning.

### 3. MVP Validation Approach
- **Success Metrics:**
  - 80% user adoption rate for core features (User & Role Management, Academic Management, Student & Teacher Management, Examination & Grading, Attendance Management) within the first 3 months post-launch.
  - 90% data accuracy in gradebook and attendance records.
  - Positive feedback from 70% of initial pilot schools regarding ease of use and administrative time savings.
- **User Feedback Mechanisms:**
  - Pilot program with 3-5 selected schools in Tanzania.
  - Regular feedback sessions (bi-weekly) with pilot users.
  - In-app feedback forms and bug reporting.
- **Criteria for Moving Beyond MVP:**
  - Achievement of defined success metrics.
  - Positive user feedback indicating satisfaction with core functionality.
  - Identification of clear next-priority features based on user needs and market demand.
- **Learning Goals:**
  - Validate the core value proposition of streamlining administrative tasks.
  - Understand user behavior and pain points with the implemented features.
  - Gather insights for future feature prioritization and development.
- **Timeline Expectation:** MVP release within 6 months.

## User Experience (UX) Considerations

### 1. User Journeys & Flows
- **Primary User Flows:** High-level flows for key user roles (e.g., Student Enrollment, Teacher Grade Submission, Parent Progress View, Admin Configuration).
- **Critical Paths:** Focus on optimizing core interactions for efficiency and ease of use.
- **Future Consideration:** Detailed flowcharts and edge case handling will be addressed in subsequent design phases.

### 2. Usability Requirements
- **Accessibility:** Adherence to WCAG 2.1 AA guidelines for inclusive design (e.g., keyboard navigation, screen reader compatibility, sufficient color contrast).
- **Platform Compatibility:** Responsive design for optimal viewing and interaction across desktop browsers and mobile devices.
- **Performance:** Target page load times under 3 seconds; real-time updates for critical data (e.g., attendance, grades).
- **Error Handling:** Clear, user-friendly error messages with actionable guidance for recovery.
- **Feedback Mechanisms:** In-app notifications, success messages, and clear indicators for ongoing processes.

### 3. UI Requirements
- **Information Architecture:** Intuitive navigation structure with clear categorization of modules and features.
- **Key UI Components:** Consistent use of common UI elements (e.g., forms, tables, dashboards, navigation menus).
- **Visual Design:** Clean, modern, and professional aesthetic, aligning with educational sector standards. Branding elements will be configurable per tenant. The design will incorporate elements observed in the provided dashboard mockups, focusing on intuitive layouts, clear data visualization, and a consistent visual hierarchy. Specific design structures are detailed in `dashboard_design_structure.json`.
- **Content:** Clear, concise, and context-appropriate language throughout the system.
- **Navigation:** Logical and consistent navigation paths to minimize user confusion.

### 4. Functional Requirements

To ensure clarity and testability, key features will be further elaborated with user stories and acceptance criteria in subsequent documentation. Below are examples for some core MVP functionalities:

#### 4.1 User & Role Management

**User Story:** As a Tenant Admin, I want to create and manage user accounts for students, teachers, and staff within my school, so that I can control access to the system and maintain accurate records.

**Acceptance Criteria:**
- The system shall allow a Tenant Admin to create new user accounts with specified roles (Student, Teacher, Staff).
- The system shall allow a Tenant Admin to edit existing user profiles and assign/reassign roles.
- The system shall ensure that each user account has a unique identifier within the tenant.
- The system shall prevent unauthorized access to tenant-specific data based on assigned roles.

#### 4.2 Academic Management

**User Story:** As a Teacher, I want to record and manage grades for my assigned courses and subjects, so that student academic performance can be accurately tracked.

**Acceptance Criteria:**
- The system shall allow a Teacher to enter grades for individual students in their assigned courses/subjects.
- The system shall automatically calculate overall grades based on predefined grading scales.
- The system shall allow a Teacher to view a history of grade changes for a student.
- The system shall ensure that only authorized teachers can modify grades for their assigned courses.

#### 4.3 Student & Teacher Management

**User Story:** As a Tenant Admin, I want to enroll students into specific classes and assign teachers to courses, so that academic operations can be properly organized.

**Acceptance Criteria:**
- The system shall allow a Tenant Admin to enroll a student into one or more classes/sections.
- The system shall allow a Tenant Admin to assign a teacher to one or more courses/subjects.
- The system shall prevent a student from being enrolled in conflicting classes.
- The system shall ensure that only valid teachers can be assigned to courses.

#### 4.4 Examination & Grading

**User Story:** As a Teacher, I want to enter marks for student examinations, so that results can be processed and published.

**Acceptance Criteria:**
- The system shall allow a Teacher to enter marks for students for specific examinations.
- The system shall validate entered marks against predefined maximums.
- The system shall automatically calculate total marks and grades based on examination results.
- The system shall provide a mechanism for reviewing and confirming mark entries before final submission.

#### 4.5 Attendance Management

**User Story:** As a Teacher, I want to record daily attendance for my students, so that student presence can be tracked.

**Acceptance Criteria:**
- The system shall allow a Teacher to mark students as Present, Absent, or Late for each class session.
- The system shall record the date and time of attendance entry.
- The system shall generate a summary of attendance for a selected period.
- The system shall prevent duplicate attendance entries for the same student and session.

#### 4.6 Admin Portal & Dashboard

**User Story:** As a Tenant Admin, I want to view key metrics and an overview of my school's operations, so that I can monitor performance and identify areas needing attention.

**Acceptance Criteria:**
- The dashboard shall display a summary of active students and teachers.
- The dashboard shall show a quick overview of recent attendance records.
- The dashboard shall provide links to frequently accessed administrative functions.
- The dashboard shall be customizable to display relevant information for the Tenant Admin.


## Multi-Tenancy Architecture
- **Shared Database, Discriminator Column:** All tables will include a `tenant_id` or `school_id` column to ensure strict data isolation at the application level.
- **Tenant Onboarding:** Process for creating new school instances.
- **Tenant-Specific Customization:** Branding, settings, and configurable features per tenant.

## Cross-Cutting Concerns
- **Security:** RBAC, data encryption (at rest and in transit), audit logs, secure authentication (MFA, strong password policies), input validation.
- **Notifications:** In-app, email, and SMS notifications with configurable settings.
- **Data Import/Export:** Bulk import/export capabilities for various data types.
- **Theming & Customization:** Tenant-specific branding and user preferences.

## Technology Stack (Initial)
- **Backend:** Node.js (Express/NestJS)
- **Database:** PostgreSQL
- **Frontend:** React
- **Deployment:** Docker, Kubernetes

## Next Steps
1. Detailed design of the database schema with `tenant_id` for all relevant tables.
2. Setup of the core project structure.
3. Implementation of User & Role Management with multi-tenancy.
4. Detailed design and implementation of each module, ensuring multi-tenancy and NECTA compliance where applicable.