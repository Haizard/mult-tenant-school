# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Frontend (Next.js with Turbopack)
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

### Backend (Express.js API)
```bash
# Start development server (from backend folder)
cd backend && npm run dev

# Start production server
cd backend && npm run start

# Super Admin setup
cd backend && node create-super-admin.js
cd backend && node check-super-admin.js
```

### Database (Prisma + SQLite)
```bash
# Generate Prisma client
cd backend && npx prisma generate

# Run migrations
cd backend && npx prisma migrate dev

# Push schema changes
cd backend && npx prisma db push

# Open Prisma Studio
cd backend && npx prisma studio

# Reset database
cd backend && npx prisma migrate reset
```

### Testing Individual Features
- Access frontend at `http://localhost:3000`
- Backend API runs on `http://localhost:5000`
- Use default login credentials from FEATURE_ACCESS_SUMMARY.md

## Architecture Overview

### Multi-Tenant School Management System
This is a comprehensive educational management platform designed for the Tanzanian education system with full NECTA compliance.

**Key Architectural Patterns:**
- **Multi-tenancy**: Complete data isolation per school/tenant using `tenantId` in all models
- **Role-Based Access Control**: Hierarchical permissions (Super Admin → Tenant Admin → Teacher → Student → Parent)
- **NECTA Integration**: Specialized grading and division calculations for Tanzania's education standards

### Tech Stack
- **Frontend**: Next.js 15 with React 19, Tailwind CSS, Radix UI, Framer Motion
- **Backend**: Express.js with TypeScript, Prisma ORM
- **Database**: SQLite for development, PostgreSQL-ready schema
- **Authentication**: JWT-based with role-based permissions
- **State Management**: React Context API for auth state

### Core Domain Models

#### Multi-Tenancy Structure
```
Tenant (School)
├── Users (with role assignments)
├── Academic Data (courses, subjects, grades)
├── Student/Teacher Records
└── Audit Logs
```

#### Academic Hierarchy
- **Academic Years**: Time periods with current year tracking
- **Courses**: Collections of subjects with credit systems
- **Subjects**: NECTA-compliant with levels (Primary, O-Level, A-Level, University) and types (Core, Optional, Combination)
- **Classes**: Physical or logical groupings of students
- **Teacher-Subject Assignments**: Many-to-many relationships

#### NECTA-Specific Features
- **O-Level**: Core vs Optional subjects, division calculations
- **A-Level**: Subject combinations (PCB, EGM, HKL), specialized grading
- **Grading Scales**: Configurable per academic level
- **Division Calculations**: Automated NECTA compliance

### Key Service Layers

#### Authentication (`app/lib/auth.ts`)
- JWT token management with localStorage persistence
- Role-based permission checking
- Multi-tenant user context
- Methods: `hasRole()`, `hasPermission()`, `isSuperAdmin()`, etc.

#### API Service (`app/lib/api.ts`)
- Centralized HTTP client with token management
- Error handling and response normalization
- Base URL: `http://localhost:5000/api`

#### Academic Services (`app/lib/academicService.ts`)
- CRUD operations for courses, subjects, academic years
- Teacher-subject assignment management
- NECTA-compliant data validation

### Database Schema Highlights

#### Multi-Tenant Base Pattern
```sql
-- Every major entity includes tenantId for isolation
model [Entity] {
  id       String @id @default(cuid())
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])
  // ... other fields
}
```

#### Role-Based Access Control
```sql
User -> UserRole -> Role -> RolePermission -> Permission
```

#### Academic Structure
```sql
Course -> CourseSubject -> Subject
Teacher -> TeacherSubject -> Subject
Student -> StudentEnrollment -> Course/Subject/Class
```

### Development Workflow

#### Working with Multi-Tenancy
- Always filter data by current user's `tenantId`
- Use `authService.getTenantId()` for current tenant context
- Super Admins can access cross-tenant data

#### Adding New Features
1. Update Prisma schema in `backend/schema.prisma`
2. Run `npx prisma migrate dev` to apply changes
3. Update TypeScript interfaces
4. Implement backend API routes
5. Create frontend components with proper role guards

#### Role-Based UI Components
```tsx
import { RoleGuard } from '@/components/RoleGuard';

<RoleGuard allowedRoles={['Super Admin', 'Tenant Admin']}>
  <AdminOnlyComponent />
</RoleGuard>
```

### Common Patterns

#### API Error Handling
All API responses follow the pattern:
```typescript
{
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}
```

#### Authentication Guards
- Use `<ProtectedRoute>` for page-level protection
- Use `useAuth()` hook to access current user context
- Check permissions with `authService.hasPermission()`

#### Academic Data Filtering
When working with academic data, always consider:
- Subject levels (Primary, O-Level, A-Level, University)
- Subject types (Core, Optional, Combination)
- Current academic year context
- Tenant isolation

### Important Files
- `backend/schema.prisma`: Complete database schema with all relationships
- `app/lib/auth.ts`: Authentication service and user management
- `app/lib/api.ts`: HTTP client with error handling
- `app/contexts/AuthContext.tsx`: React authentication context
- `FEATURE_ACCESS_SUMMARY.md`: Default users and feature access guide
- `USER_GUIDE.md`: Comprehensive user documentation

### NECTA Compliance Notes
- Division calculations use specific subject filtering (Core for O-Level, Combination for A-Level)
- Grading scales are configurable per academic level
- Academic records support Tanzania-specific fields (division, points, etc.)
- Audit logging tracks all academic data changes for compliance

### Environment Setup
- Frontend and backend run independently
- SQLite used for development, PostgreSQL-ready for production
- JWT secrets and database URLs configured via environment variables
- Default development ports: Frontend (3000), Backend (5000)