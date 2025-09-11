## 2. Requirements

### 2.1. Functional

#### 2.1.1 User & Role Management

**User Story:** As a Tenant Admin, I want to create and manage user accounts for students, teachers, and staff within my school, so that I can control access to the system and maintain accurate records.

**Acceptance Criteria:**
- The system shall allow a Tenant Admin to create new user accounts with specified roles (Student, Teacher, Staff).
- The system shall allow a Tenant Admin to edit existing user profiles and assign/reassign roles.
- The system shall ensure that each user account has a unique identifier within the tenant.
- The system shall prevent unauthorized access to tenant-specific data based on assigned roles.

#### 2.1.2 Academic Management

**User Story:** As a Teacher, I want to record and manage grades for my assigned courses and subjects, so that student academic performance can be accurately tracked.

**Acceptance Criteria:**
- The system shall allow a Teacher to enter grades for individual students in their assigned courses/subjects.
- The system shall automatically calculate overall grades based on predefined grading scales.
- The system shall allow a Teacher to view a history of grade changes for a student.
- The system shall ensure that only authorized teachers can modify grades for their assigned courses.

#### 2.1.3 Student & Teacher Management

**User Story:** As a Tenant Admin, I want to enroll students into specific classes and assign teachers to courses, so that academic operations can be properly organized.

**Acceptance Criteria:**
- The system shall allow a Tenant Admin to enroll a student into one or more classes/sections.
- The system shall allow a Tenant Admin to assign a teacher to one or more courses/subjects.
- The system shall prevent a student from being enrolled in conflicting classes.
- The system shall ensure that only valid teachers can be assigned to courses.

#### 2.1.4 Examination & Grading

**User Story:** As a Teacher, I want to enter marks for student examinations, so that results can be processed and published.

**Acceptance Criteria:**
- The system shall allow a Teacher to enter marks for students for specific examinations.
- The system shall validate entered marks against predefined maximums.
- The system shall automatically calculate total marks and grades based on examination results.
- The system shall provide a mechanism for reviewing and confirming mark entries before final submission.

#### 2.1.5 Attendance Management

**User Story:** As a Teacher, I want to record daily attendance for my students, so that student presence can be tracked.

**Acceptance Criteria:**
- The system shall allow a Teacher to mark students as Present, Absent, or Late for each class session.
- The system shall record the date and time of attendance entry.
- The system shall generate a summary of attendance for a selected period.
- The system shall prevent duplicate attendance entries for the same student and session.

#### 2.1.6 Admin Portal & Dashboard

**User Story:** As a Tenant Admin, I want to view key metrics and an overview of my school's operations, so that I can monitor performance and identify areas needing attention.

**Acceptance Criteria:**
- The dashboard shall display a summary of active students and teachers.
- The dashboard shall show a quick overview of recent attendance records.
- The dashboard shall provide links to frequently accessed administrative functions.
- The dashboard shall be customizable to display relevant information for the Tenant Admin.

### 2.2. Non Functional
- 

