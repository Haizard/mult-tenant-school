# School Management System - User Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- PostgreSQL database

### Starting the Application

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the Frontend Application:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

3. **Access the Application:**
   Open your browser and navigate to `http://localhost:3000`

---

## 🔐 Authentication & Login

### Default Login Credentials
The system comes with pre-seeded data. Use these credentials to log in:

**Super Admin:**
- Email: `admin@schoolsystem.com`
- Password: `admin123`

**Tenant Admin:**
- Email: `tenantadmin@schoolsystem.com`
- Password: `admin123`

**Teacher:**
- Email: `teacher@schoolsystem.com`
- Password: `teacher123`

**Student:**
- Email: `student@schoolsystem.com`
- Password: `student123`

### Login Process
1. Navigate to `http://localhost:3000/auth/login`
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to your role-specific dashboard

---

## 👥 User Management Features

### Accessing User Management
- **Who can access:** Super Admin, Tenant Admin
- **Navigation:** Sidebar → "User Management" or Dashboard → "Manage Users"

### Creating New Users
1. Click the "Add User" button in the User Management page
2. Fill in the required information:
   - Email (must be unique within tenant)
   - Password (minimum 6 characters)
   - First Name
   - Last Name
   - Phone (optional)
   - Address (optional)
   - Tenant ID (for Super Admin)
   - Role Assignment (select from available roles)
3. Click "Create User"

### Managing Existing Users
- **View Users:** Browse the user list with search and filtering options
- **Edit Users:** Click the edit icon next to any user
- **Delete Users:** Click the delete icon (with confirmation)
- **Filter Users:** Use status and role filters to find specific users

### Role Assignment
Available roles:
- **Super Admin:** System-wide access across all tenants
- **Tenant Admin:** Full access within their tenant
- **Teacher:** Academic management (read-only), gradebook access
- **Student:** Read-only access to their academic records
- **Parent:** Access to their child's academic information
- **Staff:** General staff access

---

## 📚 Academic Management Features

### Course Management

#### Accessing Course Management
- **Who can access:** Super Admin, Tenant Admin (full access), Teachers (read-only)
- **Navigation:** Sidebar → "Academic" → "Courses" or Dashboard → "Manage Courses"

#### Creating Courses
1. Click "Add Course" button
2. Fill in course details:
   - **Course Code:** Unique identifier (e.g., "CS101")
   - **Course Name:** Full course name
   - **Description:** Course description
   - **Credits:** Number of credits
   - **Subjects:** Select subjects to include in the course
3. Click "Create Course"

#### Managing Courses
- **View Courses:** Browse course list with search and status filters
- **Edit Courses:** Click edit icon to modify course details
- **Delete Courses:** Click delete icon (with confirmation)
- **Course Status:** Set courses as Active, Inactive, or Archived

### Subject Management

#### Accessing Subject Management
- **Who can access:** Super Admin, Tenant Admin (full access), Teachers (read-only)
- **Navigation:** Sidebar → "Academic" → "Subjects" or Dashboard → "Manage Subjects"

#### Creating Subjects
1. Click "Add Subject" button
2. Fill in subject details:
   - **Subject Name:** Name of the subject
   - **Subject Code:** Short code (e.g., "MATH")
   - **Subject Level:** Choose from:
     - Primary
     - O-Level
     - A-Level
     - University
   - **Subject Type:** Choose from:
     - Core (required subjects)
     - Optional (elective subjects)
     - Combination (subject combinations like PCB, EGM, HKL)
   - **Description:** Subject description
   - **Credits:** Number of credits
3. Click "Create Subject"

#### NECTA Compliance Features
The system supports Tanzanian education standards:
- **O-Level Subjects:** Core and Optional types
- **A-Level Subjects:** Combination subjects (PCB, EGM, HKL) and Recommended subjects
- **Subject Leveling:** Unique identification across academic levels
- **Division Calculation:** Preparation for NECTA grading system

#### Managing Subjects
- **Filter by Level:** Primary, O-Level, A-Level, University
- **Filter by Type:** Core, Optional, Combination
- **Search Subjects:** By name, code, or description
- **Teacher Assignment:** Assign teachers to specific subjects

### Teacher-Subject Assignments

#### Assigning Teachers to Subjects
1. Navigate to Subject Management
2. Click on a subject to view details
3. Click "Assign Teacher" or use the Teacher-Subject management section
4. Select the teacher from the dropdown
5. Confirm the assignment

#### Managing Assignments
- **View Assignments:** See which teachers are assigned to which subjects
- **Remove Assignments:** Unassign teachers from subjects
- **Bulk Assignments:** Assign multiple teachers to multiple subjects

---

## 🎯 Role-Based Access Control

### Super Admin Dashboard
**Access Level:** System-wide across all tenants
**Features:**
- Global tenant management
- System-wide user management
- Cross-tenant academic data view
- System configuration
- Audit logs and analytics

### Tenant Admin Dashboard
**Access Level:** Full access within their tenant
**Features:**
- User management within tenant
- Course and subject management
- Teacher assignments
- Academic year management
- Tenant-specific reports

### Teacher Dashboard
**Access Level:** Read-only academic access, write access to assessments
**Features:**
- View assigned courses and subjects
- Access to gradebook and assessments
- Student enrollment view
- Teacher-specific reports
- Cannot create/edit courses or subjects

### Student Dashboard
**Access Level:** Read-only access to enrolled courses and subjects
**Features:**
- View enrolled courses and subjects
- Access personal academic records
- View grades and assessments
- Cannot create/edit any academic data

---

## 🏫 Multi-Tenant Operations

### Tenant Isolation
Each school (tenant) operates independently:
- **Data Isolation:** All data is isolated by `tenant_id`
- **User Management:** Users can only access their tenant's data
- **Academic Data:** Courses, subjects, and academic records are tenant-specific
- **Reports:** All reports are generated based on tenant-specific data

### Creating New Tenants (Super Admin Only)
1. Navigate to "Tenants" in the sidebar
2. Click "Add Tenant"
3. Fill in tenant details:
   - Tenant Name
   - Email
   - Contact Information
4. Create the tenant and assign a Tenant Admin

---

## 📊 Academic Year Management

### Setting Up Academic Years
1. Navigate to Academic Management
2. Click "Academic Years"
3. Create new academic year:
   - **Year Name:** e.g., "2023-2024"
   - **Start Date:** Academic year start date
   - **End Date:** Academic year end date
   - **Current Year:** Mark as current academic year

### Managing Academic Years
- **Set Current Year:** Only one academic year can be current
- **Archive Years:** Move completed years to archived status
- **Year Transitions:** Manage student promotions and class advancements

---

## 🔍 Search and Filtering

### User Management Filters
- **Search:** By name, email, or phone
- **Status Filter:** Active, Inactive, Suspended, Pending
- **Role Filter:** Filter by user roles

### Academic Management Filters
- **Course Filters:** By status (Active, Inactive, Archived)
- **Subject Filters:** By level, type, and status
- **Search:** By name, code, or description

---

## 📱 Responsive Design

The system is fully responsive and works on:
- **Desktop:** Full feature access
- **Tablet:** Optimized layout for touch interaction
- **Mobile:** Core features accessible on mobile devices

---

## 🛠️ Troubleshooting

### Common Issues

1. **Login Issues:**
   - Verify email and password are correct
   - Check if account is active
   - Clear browser cache and cookies

2. **Permission Errors:**
   - Ensure you have the correct role for the action
   - Check if you're in the correct tenant
   - Contact your administrator for role updates

3. **Data Not Loading:**
   - Check internet connection
   - Refresh the page
   - Check browser console for errors

### Getting Help
- Check the browser console for error messages
- Verify backend server is running on port 5000
- Ensure database connection is established
- Contact system administrator for role-related issues

---

## 🎉 Quick Start Checklist

- [ ] Start backend server (`npm run dev` in backend folder)
- [ ] Start frontend server (`npm run dev` in frontend folder)
- [ ] Access application at `http://localhost:3000`
- [ ] Login with provided credentials
- [ ] Explore your role-specific dashboard
- [ ] Create users (if admin)
- [ ] Create courses and subjects (if admin)
- [ ] Assign teachers to subjects (if admin)
- [ ] Test role-based access restrictions

---

## 📞 Support

For technical support or feature requests, contact your system administrator or refer to the technical documentation in the `/docs` folder.

**Happy Learning! 🎓**
