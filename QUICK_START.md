# 🚀 Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- PostgreSQL database

## Step-by-Step Setup

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend folder:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/school_management"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 4. Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

Open your browser and go to: `http://localhost:3000`

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@schoolsystem.com | admin123 |
| Tenant Admin | tenantadmin@schoolsystem.com | admin123 |
| Teacher | teacher@schoolsystem.com | teacher123 |
| Student | student@schoolsystem.com | student123 |

## Quick Feature Access

### User Management
- Login as Super Admin or Tenant Admin
- Navigate to "User Management" in sidebar
- Click "Add User" to create new users

### Course Management
- Login as Super Admin or Tenant Admin
- Navigate to "Academic" → "Courses"
- Click "Add Course" to create new courses

### Subject Management
- Login as Super Admin or Tenant Admin
- Navigate to "Academic" → "Subjects"
- Click "Add Subject" to create subjects with NECTA compliance

### Teacher Assignments
- In Subject Management, click on a subject
- Use "Assign Teacher" to link teachers to subjects

## Role-Based Access

- **Super Admin:** Full system access across all tenants
- **Tenant Admin:** Full access within their tenant
- **Teacher:** Read-only academic access, write access to assessments
- **Student:** Read-only access to their academic records

## Troubleshooting

If you encounter issues:
1. Check that both servers are running
2. Verify database connection
3. Clear browser cache
4. Check browser console for errors

**Ready to go! 🎉**
