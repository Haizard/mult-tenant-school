const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================================
// BILLING MANAGEMENT
// ============================================================================

/**
 * Generate invoice number
 */
const generateInvoiceNumber = async (tenantId) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const count = await prisma.billingRecord.count({
    where: { tenantId }
  });
  return `INV-${year}${month}-${String(count + 1).padStart(5, '0')}`;
};

/**
 * Get billing records
 */
const getBillingRecords = async (req, res) => {
  try {
    const { tenantId } = req;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { tenantId };
    if (status) where.paymentStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const records = await prisma.billingRecord.findMany({
      where,
      include: {
        subscription: {
          include: { package: { select: { packageName: true } } }
        }
      },
      skip,
      take,
      orderBy: { billingDate: 'desc' }
    });

    const total = await prisma.billingRecord.count({ where });

    res.json({
      success: true,
      data: records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching billing records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch billing records',
      error: error.message
    });
  }
};

/**
 * Get billing record by ID
 */
const getBillingRecordById = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;

    const record = await prisma.billingRecord.findFirst({
      where: { id, tenantId },
      include: {
        subscription: {
          include: { package: true }
        }
      }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Billing record not found'
      });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Error fetching billing record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch billing record',
      error: error.message
    });
  }
};

/**
 * Generate invoice for subscription
 */
const generateInvoice = async (req, res) => {
  try {
    const { tenantId } = req;
    const { subscriptionId, amount, taxAmount, billingDate, dueDate } = req.body;

    if (!subscriptionId || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: subscriptionId, amount'
      });
    }

    // Verify subscription exists
    const subscription = await prisma.packageSubscription.findFirst({
      where: { id: subscriptionId, tenantId }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const invoiceNumber = await generateInvoiceNumber(tenantId);
    const tax = taxAmount || 0;
    const total = parseFloat(amount) + tax;

    const record = await prisma.billingRecord.create({
      data: {
        tenantId,
        subscriptionId,
        invoiceNumber,
        amount: parseFloat(amount),
        taxAmount: tax,
        totalAmount: total,
        billingDate: new Date(billingDate || new Date()),
        dueDate: new Date(dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
      },
      include: { subscription: { include: { package: true } } }
    });

    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      data: record
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: error.message
    });
  }
};

/**
 * Update billing record payment status
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;
    const { paymentStatus, paymentDate } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: paymentStatus'
      });
    }

    const record = await prisma.billingRecord.findFirst({
      where: { id, tenantId }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Billing record not found'
      });
    }

    const updated = await prisma.billingRecord.update({
      where: { id },
      data: {
        paymentStatus,
        paymentDate: paymentStatus === 'PAID' ? new Date(paymentDate || new Date()) : null
      },
      include: { subscription: { include: { package: true } } }
    });

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get subscription analytics
 */
const getSubscriptionAnalytics = async (req, res) => {
  try {
    const { tenantId } = req;

    const stats = await prisma.$transaction(async (tx) => {
      const totalSubscriptions = await tx.packageSubscription.count({
        where: { tenantId }
      });

      const activeSubscriptions = await tx.packageSubscription.count({
        where: { tenantId, subscriptionStatus: 'ACTIVE' }
      });

      const expiredSubscriptions = await tx.packageSubscription.count({
        where: { tenantId, subscriptionStatus: 'EXPIRED' }
      });

      const cancelledSubscriptions = await tx.packageSubscription.count({
        where: { tenantId, subscriptionStatus: 'CANCELLED' }
      });

      const subscriptionsByPackage = await tx.packageSubscription.groupBy({
        by: ['packageId'],
        where: { tenantId },
        _count: { packageId: true }
      });

      return {
        totalSubscriptions,
        activeSubscriptions,
        expiredSubscriptions,
        cancelledSubscriptions,
        subscriptionsByPackage
      };
    });

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching subscription analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription analytics',
      error: error.message
    });
  }
};

/**
 * Get revenue analytics
 */
const getRevenueAnalytics = async (req, res) => {
  try {
    const { tenantId } = req;

    const stats = await prisma.$transaction(async (tx) => {
      const totalRevenue = await tx.billingRecord.aggregate({
        where: { tenantId, paymentStatus: 'PAID' },
        _sum: { totalAmount: true }
      });

      const pendingRevenue = await tx.billingRecord.aggregate({
        where: { tenantId, paymentStatus: 'PENDING' },
        _sum: { totalAmount: true }
      });

      const overdueRevenue = await tx.billingRecord.aggregate({
        where: { tenantId, paymentStatus: 'OVERDUE' },
        _sum: { totalAmount: true }
      });

      const revenueByPackage = await tx.billingRecord.groupBy({
        by: ['subscriptionId'],
        where: { tenantId, paymentStatus: 'PAID' },
        _sum: { totalAmount: true }
      });

      return {
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        pendingRevenue: pendingRevenue._sum.totalAmount || 0,
        overdueRevenue: overdueRevenue._sum.totalAmount || 0,
        revenueByPackage
      };
    });

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics',
      error: error.message
    });
  }
};

/**
 * Track package usage
 */
const trackUsage = async (req, res) => {
  try {
    const { tenantId } = req;
    const { packageId, featureName, usageCount } = req.body;

    if (!packageId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: packageId'
      });
    }

    const usage = await prisma.packageUsage.create({
      data: {
        tenantId,
        packageId,
        featureName,
        usageCount: usageCount || 1
      }
    });

    res.status(201).json({
      success: true,
      message: 'Usage tracked successfully',
      data: usage
    });
  } catch (error) {
    console.error('Error tracking usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track usage',
      error: error.message
    });
  }
};

/**
 * Get usage analytics
 */
const getUsageAnalytics = async (req, res) => {
  try {
    const { tenantId } = req;
    const { packageId } = req.query;

    const where = { tenantId };
    if (packageId) where.packageId = packageId;

    const usage = await prisma.packageUsage.findMany({
      where,
      include: { package: { select: { packageName: true } } },
      orderBy: { usageDate: 'desc' }
    });

    res.json({ success: true, data: usage });
  } catch (error) {
    console.error('Error fetching usage analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch usage analytics',
      error: error.message
    });
  }
};

module.exports = {
  // Billing management
  getBillingRecords,
  getBillingRecordById,
  generateInvoice,
  updatePaymentStatus,

  // Analytics
  getSubscriptionAnalytics,
  getRevenueAnalytics,
  trackUsage,
  getUsageAnalytics
};

