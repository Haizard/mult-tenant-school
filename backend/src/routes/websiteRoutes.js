const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// ============ WEBSITE PAGES ROUTES ============

// Get all website pages
router.get('/pages', websiteController.getWebsitePages);

// Get a single website page
router.get('/pages/:id', websiteController.getWebsitePage);

// Create a new website page
router.post('/pages', websiteController.createWebsitePage);

// Update a website page
router.put('/pages/:id', websiteController.updateWebsitePage);

// Delete a website page
router.delete('/pages/:id', websiteController.deleteWebsitePage);

// Publish a website page
router.post('/pages/:id/publish', websiteController.publishWebsitePage);

// ============ WEBSITE CONTENT ROUTES ============

// Get page content
router.get('/content/:pageId', websiteController.getPageContent);

// Create or update page content
router.post('/content/:pageId', websiteController.createPageContent);

// ============ WEBSITE GALLERY ROUTES ============

// Get gallery images
router.get('/gallery', websiteController.getGalleryImages);

// Upload gallery image
router.post('/gallery', websiteController.uploadGalleryImage);

// Delete gallery image
router.delete('/gallery/:id', websiteController.deleteGalleryImage);

// ============ WEBSITE SETTINGS ROUTES ============

// Get website settings
router.get('/settings', websiteController.getWebsiteSettings);

// Update website settings
router.put('/settings', websiteController.updateWebsiteSettings);

// ============ WEBSITE ANALYTICS ROUTES ============

// Get website analytics
router.get('/analytics', websiteController.getWebsiteAnalytics);

// Track page view
router.post('/analytics/track', websiteController.trackPageView);

module.exports = router;

