const { PrismaClient } = require('@prisma/client');
const auditLogger = require('../utils/auditLogger');

const prisma = new PrismaClient();

// ============ WEBSITE PAGES CONTROLLERS ============

/**
 * Get all website pages for a tenant
 */
exports.getWebsitePages = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { status, pageType } = req.query;

    const where = { tenantId };
    if (status) where.status = status;
    if (pageType) where.pageType = pageType;

    const pages = await prisma.websitePage.findMany({
      where,
      include: {
        createdByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        updatedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    await auditLogger.logRead(req.user, 'WEBSITE_PAGE', null, `Retrieved ${pages.length} pages`);

    res.json({
      success: true,
      data: pages,
      count: pages.length,
    });
  } catch (error) {
    console.error('Error fetching website pages:', error);
    await auditLogger.logFailure(req.user, 'READ', 'WEBSITE_PAGE', null, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get a single website page by ID
 */
exports.getWebsitePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const page = await prisma.websitePage.findFirst({
      where: { id, tenantId },
      include: {
        content: { orderBy: { createdAt: 'desc' } },
        gallery: { orderBy: { displayOrder: 'asc' } },
        createdByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        updatedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }

    await auditLogger.logRead(req.user, 'WEBSITE_PAGE', id);

    res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error fetching website page:', error);
    await auditLogger.logFailure(req.user, 'READ', 'WEBSITE_PAGE', req.params.id, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create a new website page
 */
exports.createWebsitePage = async (req, res) => {
  try {
    const { tenantId, id: userId } = req.user;
    const { pageName, pageSlug, pageType, description } = req.body;

    // Validate required fields
    if (!pageName || !pageSlug || !pageType) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Check if slug already exists
    const existing = await prisma.websitePage.findFirst({
      where: { tenantId, pageSlug },
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'Page slug already exists' });
    }

    const page = await prisma.websitePage.create({
      data: {
        tenantId,
        pageName,
        pageSlug,
        pageType,
        description,
        createdBy: userId,
        status: 'DRAFT',
      },
      include: {
        createdByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await auditLogger.logCreate(req.user, 'WEBSITE_PAGE', page.id, `Created page: ${pageName}`);

    res.status(201).json({ success: true, data: page });
  } catch (error) {
    console.error('Error creating website page:', error);
    await auditLogger.logFailure(req.user, 'CREATE', 'WEBSITE_PAGE', null, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update a website page
 */
exports.updateWebsitePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId, id: userId } = req.user;
    const { pageName, pageSlug, pageType, description, status } = req.body;

    // Verify ownership
    const page = await prisma.websitePage.findFirst({
      where: { id, tenantId },
    });

    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }

    // Check if new slug conflicts
    if (pageSlug && pageSlug !== page.pageSlug) {
      const existing = await prisma.websitePage.findFirst({
        where: { tenantId, pageSlug },
      });
      if (existing) {
        return res.status(400).json({ success: false, error: 'Page slug already exists' });
      }
    }

    const updated = await prisma.websitePage.update({
      where: { id },
      data: {
        ...(pageName && { pageName }),
        ...(pageSlug && { pageSlug }),
        ...(pageType && { pageType }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        updatedBy: userId,
      },
      include: {
        createdByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        updatedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await auditLogger.logUpdate(req.user, 'WEBSITE_PAGE', id, `Updated page: ${pageName}`);

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating website page:', error);
    await auditLogger.logFailure(req.user, 'UPDATE', 'WEBSITE_PAGE', req.params.id, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete a website page
 */
exports.deleteWebsitePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    // Verify ownership
    const page = await prisma.websitePage.findFirst({
      where: { id, tenantId },
    });

    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }

    await prisma.websitePage.delete({ where: { id } });

    await auditLogger.logDelete(req.user, 'WEBSITE_PAGE', id, `Deleted page: ${page.pageName}`);

    res.json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting website page:', error);
    await auditLogger.logFailure(req.user, 'DELETE', 'WEBSITE_PAGE', req.params.id, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Publish a website page
 */
exports.publishWebsitePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId, id: userId } = req.user;

    const page = await prisma.websitePage.findFirst({
      where: { id, tenantId },
    });

    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }

    const updated = await prisma.websitePage.update({
      where: { id },
      data: {
        isPublished: true,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        updatedBy: userId,
      },
      include: {
        createdByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        updatedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await auditLogger.logUpdate(req.user, 'WEBSITE_PAGE', id, `Published page: ${page.pageName}`);

    res.json({ success: true, data: updated, message: 'Page published successfully' });
  } catch (error) {
    console.error('Error publishing website page:', error);
    await auditLogger.logFailure(req.user, 'UPDATE', 'WEBSITE_PAGE', req.params.id, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============ WEBSITE CONTENT CONTROLLERS ============

/**
 * Get page content
 */
exports.getPageContent = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { tenantId } = req.user;

    const content = await prisma.websiteContent.findMany({
      where: { pageId, tenantId },
      include: {
        createdByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Error fetching page content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create or update page content
 */
exports.createPageContent = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { tenantId, id: userId } = req.user;
    const { contentType, contentData } = req.body;

    if (!contentType || !contentData) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Verify page ownership
    const page = await prisma.websitePage.findFirst({
      where: { id: pageId, tenantId },
    });

    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found' });
    }

    // Mark previous version as not current
    await prisma.websiteContent.updateMany({
      where: { pageId, tenantId, isCurrent: true },
      data: { isCurrent: false },
    });

    // Get next version number
    const lastVersion = await prisma.websiteContent.findFirst({
      where: { pageId, tenantId },
      orderBy: { versionNumber: 'desc' },
    });

    const nextVersion = (lastVersion?.versionNumber || 0) + 1;

    const content = await prisma.websiteContent.create({
      data: {
        tenantId,
        pageId,
        contentType,
        contentData: JSON.stringify(contentData),
        versionNumber: nextVersion,
        isCurrent: true,
        createdBy: userId,
      },
      include: {
        createdByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await auditLogger.logCreate(req.user, 'WEBSITE_CONTENT', content.id, `Created content v${nextVersion}`);

    res.status(201).json({ success: true, data: content });
  } catch (error) {
    console.error('Error creating page content:', error);
    await auditLogger.logFailure(req.user, 'CREATE', 'WEBSITE_CONTENT', null, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============ WEBSITE GALLERY CONTROLLERS ============

/**
 * Get gallery images
 */
exports.getGalleryImages = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { pageId } = req.query;

    const where = { tenantId };
    if (pageId) where.pageId = pageId;

    const images = await prisma.websiteGallery.findMany({
      where,
      include: {
        createdByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { displayOrder: 'asc' },
    });

    res.json({ success: true, data: images });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Upload gallery image
 */
exports.uploadGalleryImage = async (req, res) => {
  try {
    const { tenantId, id: userId } = req.user;
    const { imageUrl, imageTitle, imageDescription, imageAltText, pageId, displayOrder } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, error: 'Image URL is required' });
    }

    const image = await prisma.websiteGallery.create({
      data: {
        tenantId,
        pageId: pageId || null,
        imageUrl,
        imageTitle,
        imageDescription,
        imageAltText,
        displayOrder: displayOrder || 0,
        createdBy: userId,
      },
      include: {
        createdByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await auditLogger.logCreate(req.user, 'WEBSITE_GALLERY', image.id, `Uploaded image: ${imageTitle}`);

    res.status(201).json({ success: true, data: image });
  } catch (error) {
    console.error('Error uploading gallery image:', error);
    await auditLogger.logFailure(req.user, 'CREATE', 'WEBSITE_GALLERY', null, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete gallery image
 */
exports.deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const image = await prisma.websiteGallery.findFirst({
      where: { id, tenantId },
    });

    if (!image) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    await prisma.websiteGallery.delete({ where: { id } });

    await auditLogger.logDelete(req.user, 'WEBSITE_GALLERY', id, `Deleted image: ${image.imageTitle}`);

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    await auditLogger.logFailure(req.user, 'DELETE', 'WEBSITE_GALLERY', req.params.id, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============ WEBSITE SETTINGS CONTROLLERS ============

/**
 * Get website settings
 */
exports.getWebsiteSettings = async (req, res) => {
  try {
    const { tenantId } = req.user;

    let settings = await prisma.websiteSettings.findUnique({
      where: { tenantId },
      include: {
        updatedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!settings) {
      settings = await prisma.websiteSettings.create({
        data: { tenantId },
        include: {
          updatedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching website settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update website settings
 */
exports.updateWebsiteSettings = async (req, res) => {
  try {
    const { tenantId, id: userId } = req.user;
    const {
      websiteTitle,
      websiteDescription,
      logoUrl,
      themeColor,
      primaryColor,
      secondaryColor,
      fontFamily,
      contactEmail,
      contactPhone,
      address,
      socialMedia,
    } = req.body;

    let settings = await prisma.websiteSettings.findUnique({
      where: { tenantId },
    });

    if (!settings) {
      settings = await prisma.websiteSettings.create({
        data: { tenantId },
      });
    }

    const updated = await prisma.websiteSettings.update({
      where: { tenantId },
      data: {
        ...(websiteTitle && { websiteTitle }),
        ...(websiteDescription && { websiteDescription }),
        ...(logoUrl && { logoUrl }),
        ...(themeColor && { themeColor }),
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor && { secondaryColor }),
        ...(fontFamily && { fontFamily }),
        ...(contactEmail && { contactEmail }),
        ...(contactPhone && { contactPhone }),
        ...(address && { address }),
        ...(socialMedia && { socialMedia: JSON.stringify(socialMedia) }),
        updatedBy: userId,
      },
      include: {
        updatedByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await auditLogger.logUpdate(req.user, 'WEBSITE_SETTINGS', tenantId, 'Updated website settings');

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating website settings:', error);
    await auditLogger.logFailure(req.user, 'UPDATE', 'WEBSITE_SETTINGS', null, error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============ WEBSITE ANALYTICS CONTROLLERS ============

/**
 * Get website analytics
 */
exports.getWebsiteAnalytics = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { pageId, startDate, endDate } = req.query;

    const where = { tenantId };
    if (pageId) where.pageId = pageId;
    if (startDate || endDate) {
      where.visitedAt = {};
      if (startDate) where.visitedAt.gte = new Date(startDate);
      if (endDate) where.visitedAt.lte = new Date(endDate);
    }

    const analytics = await prisma.websiteAnalytics.findMany({
      where,
      include: {
        page: { select: { id: true, pageName: true, pageSlug: true } },
      },
      orderBy: { visitedAt: 'desc' },
      take: 1000,
    });

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching website analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Track page view
 */
exports.trackPageView = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { pageId, visitorIp, userAgent, referrer } = req.body;

    const analytics = await prisma.websiteAnalytics.create({
      data: {
        tenantId,
        pageId: pageId || null,
        visitorIp,
        userAgent,
        referrer,
      },
    });

    res.status(201).json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

