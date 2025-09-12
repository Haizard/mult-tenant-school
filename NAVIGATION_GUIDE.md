# 🧭 Navigation Guide

## Login Flow
```
http://localhost:3000/auth/login
↓
Enter credentials (see Quick Start for defaults)
↓
Redirected to role-specific dashboard
```

## Dashboard Access by Role

### Super Admin Dashboard
```
Login → Dashboard → Full System Access
├── User Management (All Tenants)
├── Tenant Management
├── Academic Management (All Tenants)
├── System Reports
└── Global Settings
```

### Tenant Admin Dashboard
```
Login → Dashboard → Tenant-Specific Access
├── User Management (Tenant Only)
├── Academic Management (Tenant Only)
├── Course Management
├── Subject Management
├── Teacher Assignments
└── Tenant Reports
```

### Teacher Dashboard
```
Login → Dashboard → Academic Access
├── View Assigned Courses (Read-Only)
├── View Assigned Subjects (Read-Only)
├── Gradebook Access
├── Student Management
└── Teacher Reports
```

### Student Dashboard
```
Login → Dashboard → Personal Access
├── View Enrolled Courses
├── View Enrolled Subjects
├── View Grades
├── View Attendance
└── Personal Reports
```

## Feature Access Paths

### User Management
```
Sidebar → "User Management"
OR
Dashboard → "Manage Users" button
↓
User List → Add/Edit/Delete Users
```

### Course Management
```
Sidebar → "Academic" → "Courses"
OR
Dashboard → "Manage Courses" button
↓
Course List → Add/Edit/Delete Courses
```

### Subject Management
```
Sidebar → "Academic" → "Subjects"
OR
Dashboard → "Manage Subjects" button
↓
Subject List → Add/Edit/Delete Subjects
```

### Teacher Assignments
```
Subject Management → Click on Subject
OR
Academic → Teacher Assignments
↓
Assign/Remove Teachers from Subjects
```

## Quick Actions from Dashboard

### Admin Dashboard Quick Actions
- **Manage Users** → User Management page
- **Manage Courses** → Course Management page
- **Manage Subjects** → Subject Management page
- **Security** → Security settings

### Teacher Dashboard Quick Actions
- **View Assignments** → Assignment list
- **Schedule** → Class schedule
- **Progress** → Student progress
- **Attendance** → Attendance tracking

### Student Dashboard Quick Actions
- **View Assignments** → Personal assignments
- **Schedule** → Personal schedule
- **Progress** → Academic progress
- **Attendance** → Personal attendance

## Navigation Tips

1. **Role-Based Visibility:** Menu items appear based on your role
2. **Breadcrumb Navigation:** Use browser back button or sidebar
3. **Search & Filter:** Available in all list views
4. **Quick Access:** Use dashboard quick action buttons
5. **Responsive Design:** Works on desktop, tablet, and mobile

## Common Navigation Patterns

### Creating New Content
1. Navigate to the management page
2. Click "Add [Item]" button
3. Fill in the form
4. Submit to create

### Editing Existing Content
1. Navigate to the management page
2. Click edit icon next to item
3. Modify the form
4. Submit to save changes

### Viewing Details
1. Navigate to the management page
2. Click view icon next to item
3. View detailed information
4. Use back button to return

## Error Handling

If you can't access a feature:
1. Check your role permissions
2. Verify you're in the correct tenant
3. Ensure you're logged in
4. Contact administrator if needed

**Happy Navigating! 🗺️**
