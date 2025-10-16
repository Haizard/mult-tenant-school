const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Get tenant subscriptions
 */
const getSubscriptions = async (req, res) => {
  try {
    const { tenantId } = req;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { tenantId };
    if (status) where.subscriptionStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const subscriptions = await prisma.packageSubscription.findMany({
      where,
      include: {
        package: { select: { packageName, packageType, basePrice, description } },
        billingRecords: { select: { id: true, paymentStatus: true } }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.packageSubscription.count({ where });

    res.json({
      success: true,
      data: subscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: error.message
    });
  }
};

/**
 * Get subscription by ID
 */
const getSubscriptionById = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;

    const subscription = await prisma.packageSubscription.findFirst({
      where: { id, tenantId },
      include: {
        package: { include: { features: true } },
        billingRecords: true
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json({ success: true, data: subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription',
      error: error.message
    });
  }
};

/**
 * Create new subscription
 */
const createSubscription = async (req, res) => {
  try {
    const { tenantId, user } = req;
    const { packageId, startDate, endDate, autoRenew, customPrice } = req.body;

    if (!packageId || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: packageId, startDate'
      });
    }

    // Verify package exists
    const pkg = await prisma.servicePackage.findUnique({
      where: { id: packageId }
    });

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    // Check if subscription already exists
    const existing = await prisma.packageSubscription.findFirst({
      where: { tenantId, packageId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Subscription to this package already exists'
      });
    }

    const subscription = await prisma.packageSubscription.create({
      data: {
        tenantId,
        packageId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        autoRenew: autoRenew !== false,
        customPrice: customPrice ? parseFloat(customPrice) : null,
        createdBy: user?.id
      },
      include: { package: true }
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: error.message
    });
  }
};

/**
 * Update subscription
 */
const updateSubscription = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;
    const { endDate, autoRenew, customPrice, subscriptionStatus } = req.body;

    const subscription = await prisma.packageSubscription.findFirst({
      where: { id, tenantId }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const updated = await prisma.packageSubscription.update({
      where: { id },
      data: {
        ...(endDate && { endDate: new Date(endDate) }),
        ...(autoRenew !== undefined && { autoRenew }),
        ...(customPrice !== undefined && { customPrice: customPrice ? parseFloat(customPrice) : null }),
        ...(subscriptionStatus && { subscriptionStatus })
      },
      include: { package: true }
    });

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: error.message
    });
  }
};

/**
 * Cancel subscription
 */
const cancelSubscription = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;

    const subscription = await prisma.packageSubscription.findFirst({
      where: { id, tenantId }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const updated = await prisma.packageSubscription.update({
      where: { id },
      data: { subscriptionStatus: 'CANCELLED' }
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
};

/**
 * Upgrade subscription to a different package
 */
const upgradeSubscription = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;
    const { newPackageId } = req.body;

    if (!newPackageId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: newPackageId'
      });
    }

    const subscription = await prisma.packageSubscription.findFirst({
      where: { id, tenantId }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Verify new package exists
    const newPackage = await prisma.servicePackage.findUnique({
      where: { id: newPackageId }
    });

    if (!newPackage) {
      return res.status(404).json({
        success: false,
        message: 'New package not found'
      });
    }

    // Update subscription to new package
    const updated = await prisma.packageSubscription.update({
      where: { id },
      data: { packageId: newPackageId },
      include: { package: true }
    });

    res.json({
      success: true,
      message: 'Subscription upgraded successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade subscription',
      error: error.message
    });
  }
};

/**
 * Downgrade subscription to a different package
 */
const downgradeSubscription = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;
    const { newPackageId } = req.body;

    if (!newPackageId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: newPackageId'
      });
    }

    const subscription = await prisma.packageSubscription.findFirst({
      where: { id, tenantId }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Verify new package exists
    const newPackage = await prisma.servicePackage.findUnique({
      where: { id: newPackageId }
    });

    if (!newPackage) {
      return res.status(404).json({
        success: false,
        message: 'New package not found'
      });
    }

    // Update subscription to new package
    const updated = await prisma.packageSubscription.update({
      where: { id },
      data: { packageId: newPackageId },
      include: { package: true }
    });

    res.json({
      success: true,
      message: 'Subscription downgraded successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error downgrading subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to downgrade subscription',
      error: error.message
    });
  }
};

module.exports = {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  upgradeSubscription,
  downgradeSubscription
};

