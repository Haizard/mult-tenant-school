const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Mock data for now (will be replaced with database)
let tenants = [
  {
    id: '1',
    name: 'St. Mary\'s Primary School',
    email: 'admin@stmarys.edu.tz',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Kilimanjaro Secondary School',
    email: 'admin@kilimanjaro.edu.tz',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Validation middleware
const validateTenant = [
  body('name').notEmpty().withMessage('Tenant name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
];

// GET /api/tenants - Get all tenants
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: tenants,
      count: tenants.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenants',
      error: error.message
    });
  }
});

// GET /api/tenants/:id - Get tenant by ID
router.get('/:id', (req, res) => {
  try {
    const tenant = tenants.find(t => t.id === req.params.id);
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    res.json({
      success: true,
      data: tenant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant',
      error: error.message
    });
  }
});

// POST /api/tenants - Create new tenant
router.post('/', validateTenant, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email } = req.body;
    
    // Check if email already exists
    const existingTenant = tenants.find(t => t.email === email);
    if (existingTenant) {
      return res.status(409).json({
        success: false,
        message: 'Tenant with this email already exists'
      });
    }

    const newTenant = {
      id: (tenants.length + 1).toString(),
      name,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tenants.push(newTenant);

    res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      data: newTenant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create tenant',
      error: error.message
    });
  }
});

// PUT /api/tenants/:id - Update tenant
router.put('/:id', validateTenant, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const tenantIndex = tenants.findIndex(t => t.id === req.params.id);
    
    if (tenantIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const { name, email } = req.body;
    
    // Check if email already exists (excluding current tenant)
    const existingTenant = tenants.find(t => t.email === email && t.id !== req.params.id);
    if (existingTenant) {
      return res.status(409).json({
        success: false,
        message: 'Tenant with this email already exists'
      });
    }

    tenants[tenantIndex] = {
      ...tenants[tenantIndex],
      name,
      email,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Tenant updated successfully',
      data: tenants[tenantIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update tenant',
      error: error.message
    });
  }
});

// DELETE /api/tenants/:id - Delete tenant
router.delete('/:id', (req, res) => {
  try {
    const tenantIndex = tenants.findIndex(t => t.id === req.params.id);
    
    if (tenantIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const deletedTenant = tenants.splice(tenantIndex, 1)[0];

    res.json({
      success: true,
      message: 'Tenant deleted successfully',
      data: deletedTenant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete tenant',
      error: error.message
    });
  }
});

module.exports = router;

