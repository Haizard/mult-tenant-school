const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================================
// SERVICE PACKAGE MANAGEMENT
// ============================================================================

/**
 * Get all service packages
 */
const getPackages = async (req, res) => {
  try {
    const { tenantId } = req;
    const { status, packageType, page = 1, limit = 10 } = req.query;

    const where = { tenantId };
    if (status) where.status = status;
    if (packageType) where.packageType = packageType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const packages = await prisma.servicePackage.findMany({
      where,
      include: {
        features: true,
        subscriptions: { select: { id: true, subscriptionStatus: true } }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.servicePackage.count({ where });

    res.json({
      success: true,
      data: packages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages',
      error: error.message
    });
  }
};

/**
 * Get package by ID
 */
const getPackageById = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;

    const pkg = await prisma.servicePackage.findFirst({
      where: { id, tenantId },
      include: {
        features: true,
        subscriptions: {
          include: { tenant: { select: { name: true } } }
        },
        pricing: true
      }
    });

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({ success: true, data: pkg });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package',
      error: error.message
    });
  }
};

/**
 * Create new service package
 */
const createPackage = async (req, res) => {
  try {
    const { tenantId, user } = req;
    const { packageName, packageType, description, basePrice, billingCycle, features } = req.body;

    // Validate required fields
    if (!packageName || !packageType || basePrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: packageName, packageType, basePrice'
      });
    }

    // Check if package name already exists for this tenant
    const existing = await prisma.servicePackage.findFirst({
      where: { tenantId, packageName }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Package with this name already exists'
      });
    }

    const pkg = await prisma.servicePackage.create({
      data: {
        tenantId,
        packageName,
        packageType,
        description,
        basePrice: parseFloat(basePrice),
        billingCycle: billingCycle || 'monthly',
        createdBy: user?.id,
        features: {
          create: features?.map(f => ({
            featureName: f.featureName,
            featureDescription: f.featureDescription,
            isIncluded: f.isIncluded !== false
          })) || []
        }
      },
      include: { features: true }
    });

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: pkg
    });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create package',
      error: error.message
    });
  }
};

/**
 * Update service package
 */
const updatePackage = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;
    const { packageName, description, basePrice, billingCycle, status } = req.body;

    const pkg = await prisma.servicePackage.findFirst({
      where: { id, tenantId }
    });

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    const updated = await prisma.servicePackage.update({
      where: { id },
      data: {
        ...(packageName && { packageName }),
        ...(description && { description }),
        ...(basePrice !== undefined && { basePrice: parseFloat(basePrice) }),
        ...(billingCycle && { billingCycle }),
        ...(status && { status })
      },
      include: { features: true }
    });

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update package',
      error: error.message
    });
  }
};

/**
 * Delete service package
 */
const deletePackage = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;

    const pkg = await prisma.servicePackage.findFirst({
      where: { id, tenantId }
    });

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    await prisma.servicePackage.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete package',
      error: error.message
    });
  }
};

// ============================================================================
// PACKAGE FEATURES MANAGEMENT
// ============================================================================

/**
 * Add feature to package
 */
const addFeature = async (req, res) => {
  try {
    const { tenantId } = req;
    const { packageId } = req.params;
    const { featureName, featureDescription, isIncluded } = req.body;

    // Verify package exists and belongs to tenant
    const pkg = await prisma.servicePackage.findFirst({
      where: { id: packageId, tenantId }
    });

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    const feature = await prisma.packageFeature.create({
      data: {
        packageId,
        featureName,
        featureDescription,
        isIncluded: isIncluded !== false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Feature added successfully',
      data: feature
    });
  } catch (error) {
    console.error('Error adding feature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add feature',
      error: error.message
    });
  }
};

/**
 * Remove feature from package
 */
const removeFeature = async (req, res) => {
  try {
    const { tenantId } = req;
    const { packageId, featureId } = req.params;

    // Verify package exists and belongs to tenant
    const pkg = await prisma.servicePackage.findFirst({
      where: { id: packageId, tenantId }
    });

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    const feature = await prisma.packageFeature.findUnique({
      where: { id: featureId }
    });

    if (!feature || feature.packageId !== packageId) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }

    await prisma.packageFeature.delete({ where: { id: featureId } });

    res.json({
      success: true,
      message: 'Feature removed successfully'
    });
  } catch (error) {
    console.error('Error removing feature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove feature',
      error: error.message
    });
  }
};

module.exports = {
  // Package management
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,

  // Feature management
  addFeature,
  removeFeature
};

