# GitHub Setup Guide
## School Management System

This guide will help you set up the School Management System project on GitHub and prepare it for collaborative development.

## 📋 Prerequisites

- Git installed on your system
- GitHub account
- Node.js and PostgreSQL (for development)

## 🚀 Initial Setup

### 1. Initialize Git Repository

```bash
# Navigate to project directory
cd "C:\Users\HAIZARD\Desktop\school one"

# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: School Management System with UI Design System

- Implemented User & Role Management (Story 1.1)
- Added Academic Management (Story 2.1) 
- Created comprehensive UI design system with glassmorphism
- Added advanced dashboard components (KPI, Chart, DataTable)
- Implemented multi-tenancy architecture
- Added comprehensive .gitignore files
- Created environment variable examples"
```

### 2. Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in repository details:
   - **Repository name**: `school-management-system`
   - **Description**: `Modern multi-tenant school management system with NECTA compliance and glassmorphism UI`
   - **Visibility**: Choose Public or Private
   - **Initialize**: Don't check any boxes (we already have files)
5. Click "Create repository"

### 3. Connect Local Repository to GitHub

```bash
# Add remote origin (replace with your actual repository URL)
git remote add origin https://github.com/yourusername/school-management-system.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

## 📁 .gitignore Files Overview

### Root `.gitignore`
Ignores common files and directories across the entire project:
- `node_modules/` folders
- `.env` files and environment variables
- Build outputs (`build/`, `dist/`)
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Logs and temporary files
- Database files (`*.sqlite`, `*.db`)
- SSL certificates and keys

### Backend `.gitignore`
Backend-specific ignores:
- Database files (`*.sqlite`, `*.db`)
- Upload directories (`uploads/`)
- SSL certificates and keys
- Test coverage reports
- Log files
- Temporary files

### Frontend `.gitignore`
Frontend-specific ignores:
- React build outputs
- Storybook builds
- Bundle analyzer reports
- Cache files
- Development tools cache

## 🔧 Environment Variables

### Backend Environment
Copy `backend/env.example` to `backend/.env` and configure:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_management_system
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment
Copy `frontend/.env.example` to `frontend/.env` and configure:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_VERSION=v1

# Application Configuration
REACT_APP_NAME=School Management System
REACT_APP_VERSION=1.0.0
NODE_ENV=development
```

## 🌿 Branch Strategy

### Main Branches
- `main` - Production-ready code
- `develop` - Integration branch for features

### Feature Branches
- `feature/user-management` - User management features
- `feature/academic-management` - Academic features
- `feature/ui-components` - UI component development
- `feature/dashboard` - Dashboard features

### Example Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push feature branch
git push origin feature/new-feature

# Create Pull Request on GitHub
```

## 📝 Commit Message Convention

Use conventional commit messages:

```
type(scope): description

feat(auth): add JWT token refresh functionality
fix(ui): resolve sidebar collapse issue
docs(readme): update installation instructions
style(components): format code with prettier
refactor(api): simplify user validation logic
test(auth): add unit tests for login
chore(deps): update dependencies
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## 🔒 Security Considerations

### Never Commit
- `.env` files with real credentials
- Database passwords
- API keys
- SSL certificates
- Private keys
- Personal information

### Always Use
- `.env.example` files for configuration templates
- Strong, unique JWT secrets
- Environment-specific configurations
- Secure password hashing

## 🚀 Deployment Preparation

### Environment-Specific Configurations
1. **Development**: Use local database and services
2. **Staging**: Use staging database and services
3. **Production**: Use production database and services

### Build Process
```bash
# Backend build
cd backend
npm run build

# Frontend build
cd frontend
npm run build
```

## 📊 Project Structure on GitHub

```
school-management-system/
├── .gitignore                 # Root gitignore
├── README.md                  # Project documentation
├── package.json              # Root package.json
├── backend/
│   ├── .gitignore            # Backend-specific gitignore
│   ├── env.example           # Backend environment template
│   ├── package.json
│   └── ...
├── frontend/
│   ├── .gitignore            # Frontend-specific gitignore
│   ├── .env.example          # Frontend environment template
│   ├── package.json
│   └── ...
└── docs/
    ├── github-setup.md       # This file
    ├── ui-design-system.md   # UI design system
    └── ...
```

## 🔄 Regular Maintenance

### Daily Tasks
- Pull latest changes: `git pull origin main`
- Check for updates: `npm outdated`
- Run tests: `npm test`

### Weekly Tasks
- Update dependencies: `npm update`
- Review and merge pull requests
- Update documentation

### Monthly Tasks
- Security audit: `npm audit`
- Dependency updates
- Performance review

## 🆘 Troubleshooting

### Common Issues

1. **Large file in git history**
   ```bash
   git filter-branch --tree-filter 'rm -f path/to/large/file' HEAD
   ```

2. **Accidentally committed .env file**
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from tracking"
   ```

3. **Merge conflicts**
   ```bash
   git status
   # Edit conflicted files
   git add .
   git commit -m "Resolve merge conflicts"
   ```

## 📞 Support

If you encounter issues:
1. Check this documentation
2. Review GitHub issues
3. Create a new issue with detailed description
4. Contact the development team

## 🎯 Next Steps

After setting up GitHub:
1. Set up CI/CD pipeline
2. Configure branch protection rules
3. Set up automated testing
4. Configure deployment environments
5. Add code quality checks

---

**Happy Coding! 🚀**
