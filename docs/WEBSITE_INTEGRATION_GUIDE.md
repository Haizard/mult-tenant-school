# Website Management Integration Guide

## Quick Start: Adding Website Management to Your Dashboard

This guide shows how to integrate the Website Management feature into your existing dashboard navigation.

## 1. Create the Website Dashboard Route

Create a new file: `app/(dashboard)/website/page.tsx`

```typescript
'use client';

import WebsiteDashboard from '@/app/components/website/WebsiteDashboard';

export default function WebsitePage() {
  return <WebsiteDashboard />;
}
```

## 2. Add Navigation Link

Update your navigation component to include the website management link:

```typescript
// In your navigation/sidebar component
<NavLink href="/dashboard/website" icon={<GlobeIcon />}>
  Website Management
</NavLink>
```

## 3. Add Permissions (Optional)

If using role-based access control, add website permissions:

```javascript
// backend/src/scripts/seedPermissions.js or similar
const websitePermissions = [
  { resource: 'WEBSITE_PAGE', action: 'CREATE' },
  { resource: 'WEBSITE_PAGE', action: 'READ' },
  { resource: 'WEBSITE_PAGE', action: 'UPDATE' },
  { resource: 'WEBSITE_PAGE', action: 'DELETE' },
  { resource: 'WEBSITE_CONTENT', action: 'CREATE' },
  { resource: 'WEBSITE_CONTENT', action: 'READ' },
  { resource: 'WEBSITE_CONTENT', action: 'UPDATE' },
  { resource: 'WEBSITE_GALLERY', action: 'CREATE' },
  { resource: 'WEBSITE_GALLERY', action: 'READ' },
  { resource: 'WEBSITE_GALLERY', action: 'DELETE' },
  { resource: 'WEBSITE_SETTINGS', action: 'READ' },
  { resource: 'WEBSITE_SETTINGS', action: 'UPDATE' },
  { resource: 'WEBSITE_ANALYTICS', action: 'READ' },
];
```

## 4. Testing the Integration

### Test Page Creation
```bash
curl -X POST http://localhost:3001/api/website/pages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pageName": "Home",
    "pageSlug": "home",
    "pageType": "HOME",
    "description": "Home page"
  }'
```

### Test Getting Pages
```bash
curl -X GET http://localhost:3001/api/website/pages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Publishing a Page
```bash
curl -X POST http://localhost:3001/api/website/pages/PAGE_ID/publish \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 5. Component Usage

### Using WebsiteDashboard Directly
```typescript
import WebsiteDashboard from '@/app/components/website/WebsiteDashboard';

export default function MyPage() {
  return <WebsiteDashboard />;
}
```

### Using Individual Components
```typescript
import WebsitePageList from '@/app/components/website/WebsitePageList';
import WebsiteSettings from '@/app/components/website/WebsiteSettings';

// Use components individually
```

### Using API Services
```typescript
import { websitePageService, websiteSettingsService } from '@/lib/websiteService';

// Get all pages
const response = await websitePageService.getPages();

// Create a page
await websitePageService.createPage({
  pageName: 'About',
  pageSlug: 'about',
  pageType: 'ABOUT',
});

// Get settings
const settings = await websiteSettingsService.getSettings();

// Update settings
await websiteSettingsService.updateSettings({
  websiteTitle: 'My School',
  primaryColor: '#3B82F6',
});
```

## 6. Environment Setup

Ensure your `.env` file in the backend has:
```
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
JWT_SECRET="your-secret-key"
PORT=3001
```

## 7. Database Verification

Verify the website tables were created:

```bash
cd backend
npx prisma studio
```

You should see these tables:
- website_pages
- website_content
- website_gallery
- website_settings
- website_analytics

## 8. Common Issues & Solutions

### Issue: "Page not found" error
**Solution**: Ensure the route is created at `app/(dashboard)/website/page.tsx`

### Issue: Authentication errors
**Solution**: Verify JWT token is being sent in Authorization header

### Issue: Tenant isolation errors
**Solution**: Ensure user object contains `tenantId` from JWT token

### Issue: Database errors
**Solution**: Run `npx prisma db push` to sync schema

## 9. Customization

### Change API Base URL
Edit `lib/websiteService.ts`:
```typescript
const API_BASE = '/api/website'; // Change this
```

### Customize Component Styling
All components use Tailwind CSS. Modify classes in:
- `app/components/website/WebsiteDashboard.tsx`
- `app/components/website/WebsitePageList.tsx`
- `app/components/website/WebsitePageForm.tsx`
- `app/components/website/WebsiteSettings.tsx`

### Add More Page Types
Update the enum in `backend/schema.prisma`:
```prisma
enum WebsitePageType {
  HOME
  ADMISSION
  CONTACT
  GALLERY
  ABOUT
  CUSTOM
  NEWS        // Add new types
  EVENTS
  BLOG
}
```

## 10. Deployment Checklist

- [ ] Database migration applied (`npx prisma db push`)
- [ ] Backend routes registered in `server.js`
- [ ] Frontend components created
- [ ] Navigation link added
- [ ] Permissions configured (if using RBAC)
- [ ] Environment variables set
- [ ] JWT authentication working
- [ ] Tested page creation
- [ ] Tested page publishing
- [ ] Tested settings update
- [ ] Audit logging verified

## 11. API Endpoint Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/website/pages` | Get all pages |
| GET | `/api/website/pages/:id` | Get single page |
| POST | `/api/website/pages` | Create page |
| PUT | `/api/website/pages/:id` | Update page |
| DELETE | `/api/website/pages/:id` | Delete page |
| POST | `/api/website/pages/:id/publish` | Publish page |
| GET | `/api/website/content/:pageId` | Get page content |
| POST | `/api/website/content/:pageId` | Create content |
| GET | `/api/website/gallery` | Get gallery images |
| POST | `/api/website/gallery` | Upload image |
| DELETE | `/api/website/gallery/:id` | Delete image |
| GET | `/api/website/settings` | Get settings |
| PUT | `/api/website/settings` | Update settings |
| GET | `/api/website/analytics` | Get analytics |
| POST | `/api/website/analytics/track` | Track page view |

## 12. Support & Documentation

- **Story File**: `docs/stories/9.3.story.md`
- **Implementation Summary**: `docs/WEBSITE_IMPLEMENTATION_SUMMARY.md`
- **API Controllers**: `backend/src/controllers/websiteController.js`
- **API Routes**: `backend/src/routes/websiteRoutes.js`
- **Frontend Service**: `lib/websiteService.ts`
- **Frontend Components**: `app/components/website/`

## Next Steps

1. Create the route file
2. Add navigation link
3. Test the integration
4. Customize as needed
5. Deploy to production

For more details, see the implementation summary and story file.

