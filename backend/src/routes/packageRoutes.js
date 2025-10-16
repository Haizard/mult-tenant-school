const express = require('express');
const router = express.Router();
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');
const { auditLoggers } = require('../middleware/auditLogger');

// Import controllers
const packageController = require('../controllers/packageController');
const subscriptionController = require('../controllers/subscriptionController');
const billingController = require('../controllers/billingController');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(ensureTenantAccess);

// ============================================================================
// SERVICE PACKAGES ROUTES
// ============================================================================

/**
 * GET /api/packages - Get all service packages
 */
router.get('/packages',
  authorize(['packages:read']),
  packageController.getPackages
);

/**
 * GET /api/packages/:id - Get package by ID
 */
router.get('/packages/:id',
  authorize(['packages:read']),
  packageController.getPackageById
);

/**
 * POST /api/packages - Create new package (Super Admin only)
 */
router.post('/packages',
  authorize(['packages:create']),
  auditLoggers.create('packages'),
  packageController.createPackage
);

/**
 * PUT /api/packages/:id - Update package (Super Admin only)
 */
router.put('/packages/:id',
  authorize(['packages:update']),
  auditLoggers.update('packages'),
  packageController.updatePackage
);

/**
 * DELETE /api/packages/:id - Delete package (Super Admin only)
 */
router.delete('/packages/:id',
  authorize(['packages:delete']),
  auditLoggers.delete('packages'),
  packageController.deletePackage
);

// ============================================================================
// PACKAGE FEATURES ROUTES
// ============================================================================

/**
 * POST /api/packages/:packageId/features - Add feature to package
 */
router.post('/packages/:packageId/features',
  authorize(['packages:update']),
  auditLoggers.update('package_features'),
  packageController.addFeature
);

/**
 * DELETE /api/packages/:packageId/features/:featureId - Remove feature
 */
router.delete('/packages/:packageId/features/:featureId',
  authorize(['packages:update']),
  auditLoggers.delete('package_features'),
  packageController.removeFeature
);

// ============================================================================
// SUBSCRIPTIONS ROUTES
// ============================================================================

/**
 * GET /api/subscriptions - Get tenant subscriptions
 */
router.get('/subscriptions',
  authorize(['subscriptions:read']),
  subscriptionController.getSubscriptions
);

/**
 * GET /api/subscriptions/:id - Get subscription by ID
 */
router.get('/subscriptions/:id',
  authorize(['subscriptions:read']),
  subscriptionController.getSubscriptionById
);

/**
 * POST /api/subscriptions - Create subscription
 */
router.post('/subscriptions',
  authorize(['subscriptions:create']),
  auditLoggers.create('subscriptions'),
  subscriptionController.createSubscription
);

/**
 * PUT /api/subscriptions/:id - Update subscription
 */
router.put('/subscriptions/:id',
  authorize(['subscriptions:update']),
  auditLoggers.update('subscriptions'),
  subscriptionController.updateSubscription
);

/**
 * DELETE /api/subscriptions/:id - Cancel subscription
 */
router.delete('/subscriptions/:id',
  authorize(['subscriptions:delete']),
  auditLoggers.delete('subscriptions'),
  subscriptionController.cancelSubscription
);

/**
 * POST /api/subscriptions/:id/upgrade - Upgrade subscription
 */
router.post('/subscriptions/:id/upgrade',
  authorize(['subscriptions:update']),
  auditLoggers.update('subscriptions'),
  subscriptionController.upgradeSubscription
);

/**
 * POST /api/subscriptions/:id/downgrade - Downgrade subscription
 */
router.post('/subscriptions/:id/downgrade',
  authorize(['subscriptions:update']),
  auditLoggers.update('subscriptions'),
  subscriptionController.downgradeSubscription
);

// ============================================================================
// PRICING ROUTES
// ============================================================================

/**
 * GET /api/pricing - Get pricing information
 */
router.get('/pricing',
  authorize(['pricing:read']),
  async (req, res) => {
    try {
      const { tenantId } = req;
      const { packageId } = req.query;

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const where = { tenantId };
      if (packageId) where.packageId = packageId;

      const pricing = await prisma.packagePricing.findMany({
        where,
        include: { package: { select: { packageName: true } } },
        orderBy: { effectiveDate: 'desc' }
      });

      res.json({ success: true, data: pricing });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pricing',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/pricing - Set custom pricing
 */
router.post('/pricing',
  authorize(['pricing:create']),
  auditLoggers.create('pricing'),
  async (req, res) => {
    try {
      const { tenantId } = req;
      const { packageId, price, discountPercentage, effectiveDate, endDate } = req.body;

      if (!packageId || price === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: packageId, price'
        });
      }

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const pricing = await prisma.packagePricing.create({
        data: {
          tenantId,
          packageId,
          price: parseFloat(price),
          discountPercentage: discountPercentage || 0,
          effectiveDate: new Date(effectiveDate || new Date()),
          endDate: endDate ? new Date(endDate) : null
        }
      });

      res.status(201).json({
        success: true,
        message: 'Pricing created successfully',
        data: pricing
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create pricing',
        error: error.message
      });
    }
  }
);

// ============================================================================
// BILLING ROUTES
// ============================================================================

/**
 * GET /api/billing/records - Get billing records
 */
router.get('/billing/records',
  authorize(['billing:read']),
  billingController.getBillingRecords
);

/**
 * GET /api/billing/records/:id - Get billing record by ID
 */
router.get('/billing/records/:id',
  authorize(['billing:read']),
  billingController.getBillingRecordById
);

/**
 * POST /api/billing/invoices - Generate invoice
 */
router.post('/billing/invoices',
  authorize(['billing:create']),
  auditLoggers.create('billing'),
  billingController.generateInvoice
);

/**
 * PUT /api/billing/records/:id - Update payment status
 */
router.put('/billing/records/:id',
  authorize(['billing:update']),
  auditLoggers.update('billing'),
  billingController.updatePaymentStatus
);

// ============================================================================
// ANALYTICS ROUTES
// ============================================================================

/**
 * GET /api/analytics/subscriptions - Get subscription analytics
 */
router.get('/analytics/subscriptions',
  authorize(['analytics:read']),
  billingController.getSubscriptionAnalytics
);

/**
 * GET /api/analytics/revenue - Get revenue analytics
 */
router.get('/analytics/revenue',
  authorize(['analytics:read']),
  billingController.getRevenueAnalytics
);

/**
 * GET /api/usage - Get package usage data
 */
router.get('/usage',
  authorize(['usage:read']),
  billingController.getUsageAnalytics
);

/**
 * POST /api/usage/track - Track feature usage
 */
router.post('/usage/track',
  authorize(['usage:create']),
  auditLoggers.create('usage'),
  billingController.trackUsage
);

module.exports = router;

