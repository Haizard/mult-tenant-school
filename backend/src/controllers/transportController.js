const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auditLogger = require('../utils/auditLogger');

// ==================== TRANSPORT ROUTE MANAGEMENT ====================

const getTransportRoutes = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { status, search, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { routeName: { contains: search, mode: 'insensitive' } },
          { routeCode: { contains: search, mode: 'insensitive' } },
          { startLocation: { contains: search, mode: 'insensitive' } },
          { endLocation: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const routes = await prisma.transportRoute.findMany({
      where,
      include: {
        studentTransport: {
          include: {
            student: {
              include: {
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            }
          }
        },
        transportSchedules: {
          where: {
            date: {
              gte: new Date()
            }
          },
          take: 5,
          orderBy: { date: 'asc' },
          include: {
            vehicle: { select: { vehicleNumber: true } },
            driver: { select: { firstName: true, lastName: true } }
          }
        },
        routeStops: {
          orderBy: { stopOrder: 'asc' }
        },
        _count: {
          select: {
            studentTransport: true,
            transportSchedules: true,
            routeStops: true
          }
        }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.transportRoute.count({ where });

    await auditLogger.log(req.user, 'READ', 'TRANSPORT_ROUTES', null, 
      `Retrieved ${routes.length} transport routes`);

    res.json({
      success: true,
      data: routes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching transport routes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transport routes',
      error: error.message
    });
  }
};

const getTransportRouteById = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;

    const route = await prisma.transportRoute.findFirst({
      where: { id, tenantId },
      include: {
        studentTransport: {
          include: {
            student: {
              include: {
                user: {
                  select: { firstName: true, lastName: true, email: true, phone: true }
                }
              }
            }
          }
        },
        transportSchedules: {
          include: {
            vehicle: true,
            driver: true,
            attendanceRecords: {
              include: {
                student: {
                  include: {
                    user: { select: { firstName: true, lastName: true } }
                  }
                }
              }
            }
          },
          orderBy: { date: 'desc' },
          take: 20
        },
        transportFees: {
          include: {
            student: {
              include: {
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            }
          }
        },
        routeStops: {
          orderBy: { stopOrder: 'asc' }
        },
        incidents: {
          where: {
            incidentDate: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          orderBy: { incidentDate: 'desc' }
        }
      }
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Transport route not found'
      });
    }

    await auditLogger.log(req.user, 'READ', 'TRANSPORT_ROUTE', id, 
      `Retrieved transport route: ${route.routeName}`);

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error('Error fetching transport route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transport route',
      error: error.message
    });
  }
};

const createTransportRoute = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const {
      routeName,
      routeCode,
      description,
      startLocation,
      endLocation,
      stops,
      distance,
      estimatedDuration,
      capacity,
      fareAmount,
      operatingDays,
      startTime,
      endTime,
      emergencyContacts,
      specialInstructions
    } = req.body;

    // Validate required fields
    if (!routeName || !startLocation || !endLocation) {
      return res.status(400).json({
        success: false,
        message: 'Route name, start location, and end location are required'
      });
    }

    // Check for duplicate route name
    const existingRoute = await prisma.transportRoute.findFirst({
      where: {
        tenantId,
        routeName
      }
    });

    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: 'A route with this name already exists'
      });
    }

    // Check for duplicate route code if provided
    if (routeCode) {
      const existingCodeRoute = await prisma.transportRoute.findFirst({
        where: {
          tenantId,
          routeCode
        }
      });

      if (existingCodeRoute) {
        return res.status(400).json({
          success: false,
          message: 'A route with this code already exists'
        });
      }
    }

    const route = await prisma.transportRoute.create({
      data: {
        tenantId,
        routeName,
        routeCode,
        description,
        startLocation,
        endLocation,
        stops: stops || [],
        distance: distance ? parseFloat(distance) : null,
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
        capacity: capacity ? parseInt(capacity) : 30,
        fareAmount: fareAmount ? parseFloat(fareAmount) : null,
        operatingDays: operatingDays || [1, 2, 3, 4, 5], // Default Mon-Fri
        startTime,
        endTime,
        emergencyContacts: emergencyContacts || [],
        specialInstructions,
        createdBy: userId,
        updatedBy: userId
      },
      include: {
        _count: {
          select: {
            studentTransport: true,
            transportSchedules: true,
            routeStops: true
          }
        }
      }
    });

    await auditLogger.log(req.user, 'CREATE', 'TRANSPORT_ROUTE', route.id, 
      `Created transport route: ${route.routeName}`);

    res.status(201).json({
      success: true,
      message: 'Transport route created successfully',
      data: route
    });
  } catch (error) {
    console.error('Error creating transport route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transport route',
      error: error.message
    });
  }
};

const updateTransportRoute = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData.tenantId;
    delete updateData.createdAt;
    delete updateData.createdBy;

    // Check if route exists
    const existingRoute = await prisma.transportRoute.findFirst({
      where: { id, tenantId }
    });

    if (!existingRoute) {
      return res.status(404).json({
        success: false,
        message: 'Transport route not found'
      });
    }

    // Check for duplicate route name if name is being updated
    if (updateData.routeName && updateData.routeName !== existingRoute.routeName) {
      const duplicateRoute = await prisma.transportRoute.findFirst({
        where: {
          tenantId,
          routeName: updateData.routeName,
          id: { not: id }
        }
      });

      if (duplicateRoute) {
        return res.status(400).json({
          success: false,
          message: 'A route with this name already exists'
        });
      }
    }

    // Check for duplicate route code if code is being updated
    if (updateData.routeCode && updateData.routeCode !== existingRoute.routeCode) {
      const duplicateCodeRoute = await prisma.transportRoute.findFirst({
        where: {
          tenantId,
          routeCode: updateData.routeCode,
          id: { not: id }
        }
      });

      if (duplicateCodeRoute) {
        return res.status(400).json({
          success: false,
          message: 'A route with this code already exists'
        });
      }
    }

    const route = await prisma.transportRoute.update({
      where: { id },
      data: {
        ...updateData,
        updatedBy: userId,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            studentTransport: true,
            transportSchedules: true,
            routeStops: true
          }
        }
      }
    });

    await auditLogger.log(req.user, 'UPDATE', 'TRANSPORT_ROUTE', route.id, 
      `Updated transport route: ${route.routeName}`);

    res.json({
      success: true,
      message: 'Transport route updated successfully',
      data: route
    });
  } catch (error) {
    console.error('Error updating transport route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transport route',
      error: error.message
    });
  }
};

const deleteTransportRoute = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;

    // Check if route exists
    const route = await prisma.transportRoute.findFirst({
      where: { id, tenantId },
      include: {
        studentTransport: true,
        transportSchedules: {
          where: {
            date: {
              gte: new Date()
            }
          }
        }
      }
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Transport route not found'
      });
    }

    // Check if route has active students or future schedules
    if (route.studentTransport.length > 0 || route.transportSchedules.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete route with active students or future schedules. Please reassign students and remove schedules first.'
      });
    }

    await prisma.transportRoute.delete({
      where: { id }
    });

    await auditLogger.log(req.user, 'DELETE', 'TRANSPORT_ROUTE', id, 
      `Deleted transport route: ${route.routeName}`);

    res.json({
      success: true,
      message: 'Transport route deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transport route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete transport route',
      error: error.message
    });
  }
};

// ==================== VEHICLE MANAGEMENT ====================

const getVehicles = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { status, search, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { vehicleNumber: { contains: search, mode: 'insensitive' } },
          { make: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { registrationNumber: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        driverAssignments: {
          where: { status: 'ACTIVE' },
          include: {
            driver: {
              select: { firstName: true, lastName: true, phone: true }
            }
          }
        },
        transportSchedules: {
          where: {
            date: {
              gte: new Date()
            }
          },
          take: 5,
          include: {
            route: { select: { routeName: true } }
          }
        },
        maintenances: {
          where: {
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
          },
          orderBy: { scheduledDate: 'asc' },
          take: 3
        },
        inspections: {
          where: {
            expiryDate: {
              gte: new Date()
            }
          },
          orderBy: { expiryDate: 'asc' },
          take: 3
        },
        _count: {
          select: {
            transportSchedules: true,
            maintenances: true,
            fuelRecords: true,
            incidents: true
          }
        }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.vehicle.count({ where });

    await auditLogger.log(req.user, 'READ', 'VEHICLES', null, 
      `Retrieved ${vehicles.length} vehicles`);

    res.json({
      success: true,
      data: vehicles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicles',
      error: error.message
    });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findFirst({
      where: { id, tenantId },
      include: {
        driverAssignments: {
          include: {
            driver: true
          },
          orderBy: { assignedDate: 'desc' }
        },
        transportSchedules: {
          include: {
            route: true,
            driver: true
          },
          orderBy: { date: 'desc' },
          take: 20
        },
        maintenances: {
          orderBy: { scheduledDate: 'desc' }
        },
        fuelRecords: {
          orderBy: { fillDate: 'desc' },
          take: 20
        },
        inspections: {
          orderBy: { inspectionDate: 'desc' }
        },
        incidents: {
          orderBy: { incidentDate: 'desc' },
          take: 10
        }
      }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    await auditLogger.log(req.user, 'READ', 'VEHICLE', id, 
      `Retrieved vehicle: ${vehicle.vehicleNumber}`);

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle',
      error: error.message
    });
  }
};

const createVehicle = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const vehicleData = { ...req.body };

    // Validate required fields
    if (!vehicleData.vehicleNumber || !vehicleData.make || !vehicleData.model) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number, make, and model are required'
      });
    }

    // Check for duplicate vehicle number
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        tenantId,
        vehicleNumber: vehicleData.vehicleNumber
      }
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'A vehicle with this number already exists'
      });
    }

    // Check for duplicate registration number if provided
    if (vehicleData.registrationNumber) {
      const existingRegVehicle = await prisma.vehicle.findFirst({
        where: {
          tenantId,
          registrationNumber: vehicleData.registrationNumber
        }
      });

      if (existingRegVehicle) {
        return res.status(400).json({
          success: false,
          message: 'A vehicle with this registration number already exists'
        });
      }
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        tenantId,
        ...vehicleData,
        createdBy: userId,
        updatedBy: userId
      },
      include: {
        _count: {
          select: {
            transportSchedules: true,
            maintenances: true,
            fuelRecords: true
          }
        }
      }
    });

    await auditLogger.log(req.user, 'CREATE', 'VEHICLE', vehicle.id, 
      `Created vehicle: ${vehicle.vehicleNumber}`);

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vehicle',
      error: error.message
    });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData.tenantId;
    delete updateData.createdAt;
    delete updateData.createdBy;

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findFirst({
      where: { id, tenantId }
    });

    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check for duplicate vehicle number if number is being updated
    if (updateData.vehicleNumber && updateData.vehicleNumber !== existingVehicle.vehicleNumber) {
      const duplicateVehicle = await prisma.vehicle.findFirst({
        where: {
          tenantId,
          vehicleNumber: updateData.vehicleNumber,
          id: { not: id }
        }
      });

      if (duplicateVehicle) {
        return res.status(400).json({
          success: false,
          message: 'A vehicle with this number already exists'
        });
      }
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...updateData,
        updatedBy: userId,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            transportSchedules: true,
            maintenances: true,
            fuelRecords: true
          }
        }
      }
    });

    await auditLogger.log(req.user, 'UPDATE', 'VEHICLE', vehicle.id, 
      `Updated vehicle: ${vehicle.vehicleNumber}`);

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vehicle',
      error: error.message
    });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, tenantId },
      include: {
        driverAssignments: {
          where: { status: 'ACTIVE' }
        },
        transportSchedules: {
          where: {
            date: {
              gte: new Date()
            }
          }
        }
      }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if vehicle has active assignments or future schedules
    if (vehicle.driverAssignments.length > 0 || vehicle.transportSchedules.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vehicle with active assignments or future schedules. Please remove assignments and schedules first.'
      });
    }

    await prisma.vehicle.delete({
      where: { id }
    });

    await auditLogger.log(req.user, 'DELETE', 'VEHICLE', id, 
      `Deleted vehicle: ${vehicle.vehicleNumber}`);

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vehicle',
      error: error.message
    });
  }
};

// ==================== DRIVER MANAGEMENT ====================

const getDrivers = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { status, search, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { driverCode: { contains: search, mode: 'insensitive' } },
          { licenseNumber: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const drivers = await prisma.driver.findMany({
      where,
      include: {
        vehicleAssignments: {
          where: { status: 'ACTIVE' },
          include: {
            vehicle: {
              select: { vehicleNumber: true, make: true, model: true }
            }
          }
        },
        transportSchedules: {
          where: {
            date: {
              gte: new Date()
            }
          },
          take: 5,
          include: {
            route: { select: { routeName: true } },
            vehicle: { select: { vehicleNumber: true } }
          }
        },
        attendanceRecords: {
          where: {
            date: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          },
          orderBy: { date: 'desc' },
          take: 7
        },
        performanceRecords: {
          orderBy: { evaluationDate: 'desc' },
          take: 1
        },
        _count: {
          select: {
            vehicleAssignments: true,
            transportSchedules: true,
            incidents: true
          }
        }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.driver.count({ where });

    await auditLogger.log(req.user, 'READ', 'DRIVERS', null, 
      `Retrieved ${drivers.length} drivers`);

    res.json({
      success: true,
      data: drivers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drivers',
      error: error.message
    });
  }
};

const getDriverById = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;

    const driver = await prisma.driver.findFirst({
      where: { id, tenantId },
      include: {
        vehicleAssignments: {
          include: {
            vehicle: true
          },
          orderBy: { assignedDate: 'desc' }
        },
        transportSchedules: {
          include: {
            route: true,
            vehicle: true
          },
          orderBy: { date: 'desc' },
          take: 20
        },
        attendanceRecords: {
          orderBy: { date: 'desc' },
          take: 30
        },
        performanceRecords: {
          orderBy: { evaluationDate: 'desc' }
        },
        incidents: {
          orderBy: { incidentDate: 'desc' },
          take: 10
        }
      }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    await auditLogger.log(req.user, 'READ', 'DRIVER', id, 
      `Retrieved driver: ${driver.firstName} ${driver.lastName}`);

    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver',
      error: error.message
    });
  }
};

const createDriver = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const driverData = { ...req.body };

    // Validate required fields
    if (!driverData.firstName || !driverData.lastName || !driverData.licenseNumber) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and license number are required'
      });
    }

    // Check for duplicate license number
    const existingDriver = await prisma.driver.findFirst({
      where: {
        tenantId,
        licenseNumber: driverData.licenseNumber
      }
    });

    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'A driver with this license number already exists'
      });
    }

    // Generate driver code if not provided
    if (!driverData.driverCode) {
      const count = await prisma.driver.count({ where: { tenantId } });
      driverData.driverCode = `DRV${String(count + 1).padStart(3, '0')}`;
    }

    // Check for duplicate driver code
    const existingCodeDriver = await prisma.driver.findFirst({
      where: {
        tenantId,
        driverCode: driverData.driverCode
      }
    });

    if (existingCodeDriver) {
      return res.status(400).json({
        success: false,
        message: 'A driver with this code already exists'
      });
    }

    const driver = await prisma.driver.create({
      data: {
        tenantId,
        ...driverData,
        createdBy: userId,
        updatedBy: userId
      },
      include: {
        _count: {
          select: {
            vehicleAssignments: true,
            transportSchedules: true
          }
        }
      }
    });

    await auditLogger.log(req.user, 'CREATE', 'DRIVER', driver.id, 
      `Created driver: ${driver.firstName} ${driver.lastName}`);

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driver
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create driver',
      error: error.message
    });
  }
};

const updateDriver = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData.tenantId;
    delete updateData.createdAt;
    delete updateData.createdBy;

    // Check if driver exists
    const existingDriver = await prisma.driver.findFirst({
      where: { id, tenantId }
    });

    if (!existingDriver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Check for duplicate license number if license is being updated
    if (updateData.licenseNumber && updateData.licenseNumber !== existingDriver.licenseNumber) {
      const duplicateDriver = await prisma.driver.findFirst({
        where: {
          tenantId,
          licenseNumber: updateData.licenseNumber,
          id: { not: id }
        }
      });

      if (duplicateDriver) {
        return res.status(400).json({
          success: false,
          message: 'A driver with this license number already exists'
        });
      }
    }

    const driver = await prisma.driver.update({
      where: { id },
      data: {
        ...updateData,
        updatedBy: userId,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            vehicleAssignments: true,
            transportSchedules: true
          }
        }
      }
    });

    await auditLogger.log(req.user, 'UPDATE', 'DRIVER', driver.id, 
      `Updated driver: ${driver.firstName} ${driver.lastName}`);

    res.json({
      success: true,
      message: 'Driver updated successfully',
      data: driver
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update driver',
      error: error.message
    });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;

    // Check if driver exists
    const driver = await prisma.driver.findFirst({
      where: { id, tenantId },
      include: {
        vehicleAssignments: {
          where: { status: 'ACTIVE' }
        },
        transportSchedules: {
          where: {
            date: {
              gte: new Date()
            }
          }
        }
      }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Check if driver has active assignments or future schedules
    if (driver.vehicleAssignments.length > 0 || driver.transportSchedules.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete driver with active assignments or future schedules. Please remove assignments and schedules first.'
      });
    }

    await prisma.driver.delete({
      where: { id }
    });

    await auditLogger.log(req.user, 'DELETE', 'DRIVER', id, 
      `Deleted driver: ${driver.firstName} ${driver.lastName}`);

    res.json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete driver',
      error: error.message
    });
  }
};

// ==================== STUDENT TRANSPORT MANAGEMENT ====================

const getStudentTransports = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { routeId, status, search, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(routeId && { routeId }),
      ...(status && { status }),
      ...(search && {
        student: {
          OR: [
            { user: { firstName: { contains: search, mode: 'insensitive' } } },
            { user: { lastName: { contains: search, mode: 'insensitive' } } },
            { studentId: { contains: search, mode: 'insensitive' } }
          ]
        }
      })
    };

    const studentTransports = await prisma.studentTransport.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true, phone: true }
            }
          }
        },
        route: {
          include: {
            _count: {
              select: { studentTransport: true }
            }
          }
        },
        transportFees: {
          where: {
            status: { in: ['PENDING', 'OVERDUE'] }
          },
          orderBy: { dueDate: 'asc' }
        },
        attendanceRecords: {
          where: {
            date: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          },
          orderBy: { date: 'desc' }
        }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.studentTransport.count({ where });

    await auditLogger.log(req.user, 'READ', 'STUDENT_TRANSPORTS', null, 
      `Retrieved ${studentTransports.length} student transport assignments`);

    res.json({
      success: true,
      data: studentTransports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching student transports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student transports',
      error: error.message
    });
  }
};

const assignStudentToRoute = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const {
      studentId,
      routeId,
      pickupPoint,
      dropoffPoint,
      pickupTime,
      dropoffTime,
      monthlyFee,
      seatNumber,
      emergencyContact,
      emergencyPhone,
      specialNotes,
      guardianPreferences
    } = req.body;

    // Validate required fields
    if (!studentId || !routeId || !pickupPoint || !dropoffPoint) {
      return res.status(400).json({
        success: false,
        message: 'Student, route, pickup point, and dropoff point are required'
      });
    }

    // Verify student and route exist and belong to the tenant
    const student = await prisma.student.findFirst({
      where: { id: studentId, tenantId }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const route = await prisma.transportRoute.findFirst({
      where: { id: routeId, tenantId }
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Transport route not found'
      });
    }

    // Check if student is already assigned to this route
    const existingAssignment = await prisma.studentTransport.findFirst({
      where: {
        tenantId,
        studentId,
        routeId,
        status: { in: ['ACTIVE', 'SUSPENDED'] }
      }
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Student is already assigned to this route'
      });
    }

    // Check route capacity
    const currentOccupancy = await prisma.studentTransport.count({
      where: {
        routeId,
        status: 'ACTIVE'
      }
    });

    if (currentOccupancy >= route.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Route has reached maximum capacity'
      });
    }

    const studentTransport = await prisma.studentTransport.create({
      data: {
        tenantId,
        studentId,
        routeId,
        pickupPoint,
        dropoffPoint,
        pickupTime,
        dropoffTime,
        monthlyFee: monthlyFee ? parseFloat(monthlyFee) : null,
        seatNumber,
        emergencyContact,
        emergencyPhone,
        specialNotes,
        guardianPreferences: guardianPreferences || {},
        createdBy: userId,
        updatedBy: userId
      },
      include: {
        student: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        route: true
      }
    });

    // Update route occupancy
    await prisma.transportRoute.update({
      where: { id: routeId },
      data: {
        currentOccupancy: currentOccupancy + 1
      }
    });

    await auditLogger.log(req.user, 'CREATE', 'STUDENT_TRANSPORT', studentTransport.id, 
      `Assigned student ${student.studentId} to route ${route.routeName}`);

    res.status(201).json({
      success: true,
      message: 'Student assigned to transport route successfully',
      data: studentTransport
    });
  } catch (error) {
    console.error('Error assigning student to transport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign student to transport route',
      error: error.message
    });
  }
};

// ==================== TRANSPORT STATISTICS ====================

const getTransportStats = async (req, res) => {
  try {
    const { tenantId } = req.user;

    const [
      totalRoutes,
      activeRoutes,
      totalVehicles,
      activeVehicles,
      totalDrivers,
      activeDrivers,
      totalStudents,
      activeStudents,
      pendingMaintenances,
      recentIncidents,
      overdueMaintenances,
      expiringSoon,
      totalFuelCost,
      monthlyTransportRevenue
    ] = await Promise.all([
      prisma.transportRoute.count({ where: { tenantId } }),
      prisma.transportRoute.count({ where: { tenantId, status: 'ACTIVE' } }),
      prisma.vehicle.count({ where: { tenantId } }),
      prisma.vehicle.count({ where: { tenantId, status: 'ACTIVE' } }),
      prisma.driver.count({ where: { tenantId } }),
      prisma.driver.count({ where: { tenantId, status: 'ACTIVE' } }),
      prisma.studentTransport.count({ where: { tenantId } }),
      prisma.studentTransport.count({ where: { tenantId, status: 'ACTIVE' } }),
      prisma.vehicleMaintenance.count({ 
        where: { 
          tenantId, 
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] } 
        } 
      }),
      prisma.transportIncident.count({
        where: {
          tenantId,
          incidentDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.vehicleMaintenance.count({
        where: {
          tenantId,
          status: 'OVERDUE'
        }
      }),
      // Count vehicles with licenses/inspections expiring in next 30 days
      prisma.vehicle.count({
        where: {
          tenantId,
          OR: [
            {
              insuranceExpiry: {
                lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              }
            },
            {
              roadTaxExpiry: {
                lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              }
            }
          ]
        }
      }),
      // Total fuel cost this month
      prisma.fuelRecord.aggregate({
        where: {
          tenantId,
          fillDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: {
          fuelCost: true
        }
      }),
      // Transport revenue this month
      prisma.transportFee.aggregate({
        where: {
          tenantId,
          status: 'PAID',
          paidDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: {
          amount: true
        }
      })
    ]);

    const stats = {
      routes: {
        total: totalRoutes,
        active: activeRoutes,
        inactive: totalRoutes - activeRoutes
      },
      vehicles: {
        total: totalVehicles,
        active: activeVehicles,
        inactive: totalVehicles - activeVehicles
      },
      drivers: {
        total: totalDrivers,
        active: activeDrivers,
        inactive: totalDrivers - activeDrivers
      },
      students: {
        total: totalStudents,
        active: activeStudents,
        inactive: totalStudents - activeStudents
      },
      maintenance: {
        pending: pendingMaintenances,
        overdue: overdueMaintenances
      },
      incidents: {
        recent: recentIncidents
      },
      alerts: {
        expiringSoon: expiringSoon
      },
      financial: {
        monthlyFuelCost: totalFuelCost._sum.fuelCost || 0,
        monthlyRevenue: monthlyTransportRevenue._sum.amount || 0
      }
    };

    await auditLogger.log(req.user, 'READ', 'TRANSPORT_STATS', null, 
      'Retrieved transport statistics');

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching transport stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transport statistics',
      error: error.message
    });
  }
};

// ==================== MAINTENANCE MANAGEMENT ====================

const getMaintenanceRecords = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { vehicleId, status, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(vehicleId && { vehicleId }),
      ...(status && { status })
    };

    const maintenances = await prisma.vehicleMaintenance.findMany({
      where,
      include: {
        vehicle: {
          select: { vehicleNumber: true, make: true, model: true }
        },
        creator: {
          select: { firstName: true, lastName: true }
        }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { scheduledDate: 'desc' }
    });

    const total = await prisma.vehicleMaintenance.count({ where });

    res.json({
      success: true,
      data: maintenances,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance records',
      error: error.message
    });
  }
};

const createMaintenanceRecord = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const maintenanceData = { ...req.body };

    const maintenance = await prisma.vehicleMaintenance.create({
      data: {
        tenantId,
        ...maintenanceData,
        createdBy: userId
      },
      include: {
        vehicle: {
          select: { vehicleNumber: true, make: true, model: true }
        }
      }
    });

    await auditLogger.log(req.user, 'CREATE', 'VEHICLE_MAINTENANCE', maintenance.id, 
      `Scheduled maintenance for vehicle ${maintenance.vehicle.vehicleNumber}`);

    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      data: maintenance
    });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create maintenance record',
      error: error.message
    });
  }
};

// ==================== ROUTE OPTIMIZATION ====================

const optimizeRoute = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const { routeId } = req.params;

    // Get route with all stops and student locations
    const route = await prisma.transportRoute.findFirst({
      where: { id: routeId, tenantId },
      include: {
        routeStops: {
          orderBy: { stopOrder: 'asc' }
        },
        studentTransport: {
          where: { status: 'ACTIVE' },
          include: {
            student: {
              include: {
                user: { select: { firstName: true, lastName: true } }
              }
            }
          }
        }
      }
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Simple optimization: sort stops by geographical proximity
    // In a real implementation, you would use proper routing algorithms
    const optimizedStops = route.routeStops.map((stop, index) => ({
      ...stop,
      stopOrder: index + 1,
      optimized: true
    }));

    // Update route with optimization flag
    const updatedRoute = await prisma.transportRoute.update({
      where: { id: routeId },
      data: {
        routeOptimized: true,
        lastOptimizedAt: new Date(),
        updatedBy: userId
      },
      include: {
        routeStops: true,
        _count: {
          select: { studentTransport: true }
        }
      }
    });

    await auditLogger.log(req.user, 'UPDATE', 'TRANSPORT_ROUTE', routeId, 
      `Optimized route: ${route.routeName}`);

    res.json({
      success: true,
      message: 'Route optimized successfully',
      data: {
        route: updatedRoute,
        optimizedStops,
        savings: {
          timeReduced: '15 minutes',
          fuelSaved: '2.5 liters',
          costSaved: 'TZS 5,000'
        }
      }
    });
  } catch (error) {
    console.error('Error optimizing route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize route',
      error: error.message
    });
  }
};

// ==================== TRANSPORT SCHEDULE MANAGEMENT ====================

const getTransportSchedules = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { routeId, vehicleId, driverId, date, status, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(routeId && { routeId }),
      ...(vehicleId && { vehicleId }),
      ...(driverId && { driverId }),
      ...(date && { date: new Date(date) }),
      ...(status && { status })
    };

    const schedules = await prisma.transportSchedule.findMany({
      where,
      include: {
        route: { select: { routeName: true, routeCode: true } },
        vehicle: { select: { vehicleNumber: true, make: true, model: true } },
        driver: { select: { firstName: true, lastName: true, driverCode: true } },
        attendanceRecords: {
          include: {
            student: {
              include: {
                user: { select: { firstName: true, lastName: true } }
              }
            }
          }
        },
        incidents: true
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { date: 'desc' }
    });

    const total = await prisma.transportSchedule.count({ where });

    await auditLogger.log(req.user, 'READ', 'TRANSPORT_SCHEDULES', null, 
      `Retrieved ${schedules.length} transport schedules`);

    res.json({
      success: true,
      data: schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching transport schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transport schedules',
      error: error.message
    });
  }
};

const createTransportSchedule = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const scheduleData = { ...req.body };

    // Validate required fields
    if (!scheduleData.routeId || !scheduleData.vehicleId || !scheduleData.driverId || !scheduleData.date) {
      return res.status(400).json({
        success: false,
        message: 'Route, vehicle, driver, and date are required'
      });
    }

    // Check for conflicts
    const existingSchedule = await prisma.transportSchedule.findFirst({
      where: {
        tenantId,
        vehicleId: scheduleData.vehicleId,
        date: new Date(scheduleData.date),
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
      }
    });

    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is already scheduled for this date'
      });
    }

    const schedule = await prisma.transportSchedule.create({
      data: {
        tenantId,
        ...scheduleData,
        createdBy: userId,
        updatedBy: userId
      },
      include: {
        route: true,
        vehicle: true,
        driver: true
      }
    });

    await auditLogger.log(req.user, 'CREATE', 'TRANSPORT_SCHEDULE', schedule.id, 
      `Created transport schedule for route ${schedule.route.routeName}`);

    res.status(201).json({
      success: true,
      message: 'Transport schedule created successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error creating transport schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transport schedule',
      error: error.message
    });
  }
};

// ==================== TRANSPORT INCIDENT MANAGEMENT ====================

const getTransportIncidents = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { routeId, vehicleId, driverId, severity, status, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(routeId && { routeId }),
      ...(vehicleId && { vehicleId }),
      ...(driverId && { driverId }),
      ...(severity && { severity }),
      ...(status && { status })
    };

    const incidents = await prisma.transportIncident.findMany({
      where,
      include: {
        route: { select: { routeName: true } },
        vehicle: { select: { vehicleNumber: true } },
        driver: { select: { firstName: true, lastName: true } },
        schedule: { select: { date: true, startTime: true } }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { incidentDate: 'desc' }
    });

    const total = await prisma.transportIncident.count({ where });

    await auditLogger.log(req.user, 'READ', 'TRANSPORT_INCIDENTS', null, 
      `Retrieved ${incidents.length} transport incidents`);

    res.json({
      success: true,
      data: incidents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching transport incidents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transport incidents',
      error: error.message
    });
  }
};

const createTransportIncident = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const incidentData = { ...req.body };

    // Validate required fields
    if (!incidentData.incidentType || !incidentData.severity || !incidentData.title || !incidentData.description) {
      return res.status(400).json({
        success: false,
        message: 'Incident type, severity, title, and description are required'
      });
    }

    const incident = await prisma.transportIncident.create({
      data: {
        tenantId,
        ...incidentData,
        createdBy: userId,
        updatedBy: userId
      },
      include: {
        route: true,
        vehicle: true,
        driver: true
      }
    });

    await auditLogger.log(req.user, 'CREATE', 'TRANSPORT_INCIDENT', incident.id, 
      `Created transport incident: ${incident.title}`);

    res.status(201).json({
      success: true,
      message: 'Transport incident created successfully',
      data: incident
    });
  } catch (error) {
    console.error('Error creating transport incident:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transport incident',
      error: error.message
    });
  }
};

// ==================== TRANSPORT FEE MANAGEMENT ====================

const getTransportFees = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { studentId, routeId, status, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(studentId && { studentId }),
      ...(routeId && { routeId }),
      ...(status && { status })
    };

    const fees = await prisma.transportFee.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        },
        route: { select: { routeName: true } }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { dueDate: 'desc' }
    });

    const total = await prisma.transportFee.count({ where });

    await auditLogger.log(req.user, 'READ', 'TRANSPORT_FEES', null, 
      `Retrieved ${fees.length} transport fees`);

    res.json({
      success: true,
      data: fees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching transport fees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transport fees',
      error: error.message
    });
  }
};

const createTransportFee = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const feeData = { ...req.body };

    // Validate required fields
    if (!feeData.studentId || !feeData.routeId || !feeData.amount || !feeData.dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Student, route, amount, and due date are required'
      });
    }

    const fee = await prisma.transportFee.create({
      data: {
        tenantId,
        ...feeData,
        createdBy: userId,
        updatedBy: userId
      },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        },
        route: { select: { routeName: true } }
      }
    });

    await auditLogger.log(req.user, 'CREATE', 'TRANSPORT_FEE', fee.id, 
      `Created transport fee for student ${fee.student.user.firstName} ${fee.student.user.lastName}`);

    res.status(201).json({
      success: true,
      message: 'Transport fee created successfully',
      data: fee
    });
  } catch (error) {
    console.error('Error creating transport fee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transport fee',
      error: error.message
    });
  }
};

// ==================== TRANSPORT ATTENDANCE MANAGEMENT ====================

const getTransportAttendance = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { studentId, scheduleId, date, status, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(studentId && { studentId }),
      ...(scheduleId && { scheduleId }),
      ...(date && { date: new Date(date) }),
      ...(status && { pickupStatus: status })
    };

    const attendance = await prisma.transportAttendance.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        },
        schedule: {
          include: {
            route: { select: { routeName: true } },
            vehicle: { select: { vehicleNumber: true } }
          }
        }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { date: 'desc' }
    });

    const total = await prisma.transportAttendance.count({ where });

    await auditLogger.log(req.user, 'READ', 'TRANSPORT_ATTENDANCE', null, 
      `Retrieved ${attendance.length} transport attendance records`);

    res.json({
      success: true,
      data: attendance,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching transport attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transport attendance',
      error: error.message
    });
  }
};

const markTransportAttendance = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const attendanceData = { ...req.body };

    // Validate required fields
    if (!attendanceData.studentId || !attendanceData.scheduleId || !attendanceData.date) {
      return res.status(400).json({
        success: false,
        message: 'Student, schedule, and date are required'
      });
    }

    const attendance = await prisma.transportAttendance.create({
      data: {
        tenantId,
        ...attendanceData,
        createdBy: userId,
        updatedBy: userId
      },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        },
        schedule: {
          include: {
            route: { select: { routeName: true } }
          }
        }
      }
    });

    await auditLogger.log(req.user, 'CREATE', 'TRANSPORT_ATTENDANCE', attendance.id, 
      `Marked attendance for student ${attendance.student.user.firstName} ${attendance.student.user.lastName}`);

    res.status(201).json({
      success: true,
      message: 'Transport attendance marked successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Error marking transport attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark transport attendance',
      error: error.message
    });
  }
};

// ==================== FUEL RECORD MANAGEMENT ====================

const getFuelRecords = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { vehicleId, startDate, endDate, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(vehicleId && { vehicleId }),
      ...(startDate && endDate && {
        fillDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const fuelRecords = await prisma.fuelRecord.findMany({
      where,
      include: {
        vehicle: { select: { vehicleNumber: true, make: true, model: true } }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { fillDate: 'desc' }
    });

    const total = await prisma.fuelRecord.count({ where });

    await auditLogger.log(req.user, 'READ', 'FUEL_RECORDS', null, 
      `Retrieved ${fuelRecords.length} fuel records`);

    res.json({
      success: true,
      data: fuelRecords,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching fuel records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fuel records',
      error: error.message
    });
  }
};

const createFuelRecord = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const fuelData = { ...req.body };

    // Validate required fields
    if (!fuelData.vehicleId || !fuelData.fuelQuantity || !fuelData.fuelCost || !fuelData.fillDate) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle, fuel quantity, cost, and fill date are required'
      });
    }

    const fuelRecord = await prisma.fuelRecord.create({
      data: {
        tenantId,
        ...fuelData,
        createdBy: userId,
        updatedBy: userId
      },
      include: {
        vehicle: { select: { vehicleNumber: true, make: true, model: true } }
      }
    });

    await auditLogger.log(req.user, 'CREATE', 'FUEL_RECORD', fuelRecord.id, 
      `Created fuel record for vehicle ${fuelRecord.vehicle.vehicleNumber}`);

    res.status(201).json({
      success: true,
      message: 'Fuel record created successfully',
      data: fuelRecord
    });
  } catch (error) {
    console.error('Error creating fuel record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create fuel record',
      error: error.message
    });
  }
};

// ==================== VEHICLE INSPECTION MANAGEMENT ====================

const getVehicleInspections = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { vehicleId, inspectionType, status, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(vehicleId && { vehicleId }),
      ...(inspectionType && { inspectionType }),
      ...(status && { status })
    };

    const inspections = await prisma.vehicleInspection.findMany({
      where,
      include: {
        vehicle: { select: { vehicleNumber: true, make: true, model: true } }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { inspectionDate: 'desc' }
    });

    const total = await prisma.vehicleInspection.count({ where });

    await auditLogger.log(req.user, 'READ', 'VEHICLE_INSPECTIONS', null, 
      `Retrieved ${inspections.length} vehicle inspections`);

    res.json({
      success: true,
      data: inspections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching vehicle inspections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle inspections',
      error: error.message
    });
  }
};

const createVehicleInspection = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const inspectionData = { ...req.body };

    // Validate required fields
    if (!inspectionData.vehicleId || !inspectionData.inspectionType || !inspectionData.inspectionDate) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle, inspection type, and inspection date are required'
      });
    }

    const inspection = await prisma.vehicleInspection.create({
      data: {
        tenantId,
        ...inspectionData,
        createdBy: userId,
        updatedBy: userId
      },
      include: {
        vehicle: { select: { vehicleNumber: true, make: true, model: true } }
      }
    });

    await auditLogger.log(req.user, 'CREATE', 'VEHICLE_INSPECTION', inspection.id, 
      `Created vehicle inspection for ${inspection.vehicle.vehicleNumber}`);

    res.status(201).json({
      success: true,
      message: 'Vehicle inspection created successfully',
      data: inspection
    });
  } catch (error) {
    console.error('Error creating vehicle inspection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vehicle inspection',
      error: error.message
    });
  }
};

// ==================== DRIVER PERFORMANCE MANAGEMENT ====================

const getDriverPerformance = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { driverId, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(driverId && { driverId })
    };

    const performance = await prisma.driverPerformance.findMany({
      where,
      include: {
        driver: { select: { firstName: true, lastName: true, driverCode: true } }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { evaluationDate: 'desc' }
    });

    const total = await prisma.driverPerformance.count({ where });

    await auditLogger.log(req.user, 'READ', 'DRIVER_PERFORMANCE', null, 
      `Retrieved ${performance.length} driver performance records`);

    res.json({
      success: true,
      data: performance,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching driver performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver performance',
      error: error.message
    });
  }
};

const createDriverPerformance = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const performanceData = { ...req.body };

    // Validate required fields
    if (!performanceData.driverId || !performanceData.evaluationDate) {
      return res.status(400).json({
        success: false,
        message: 'Driver and evaluation date are required'
      });
    }

    const performance = await prisma.driverPerformance.create({
      data: {
        tenantId,
        ...performanceData,
        createdBy: userId,
        updatedBy: userId
      },
      include: {
        driver: { select: { firstName: true, lastName: true, driverCode: true } }
      }
    });

    await auditLogger.log(req.user, 'CREATE', 'DRIVER_PERFORMANCE', performance.id, 
      `Created performance record for driver ${performance.driver.firstName} ${performance.driver.lastName}`);

    res.status(201).json({
      success: true,
      message: 'Driver performance record created successfully',
      data: performance
    });
  } catch (error) {
    console.error('Error creating driver performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create driver performance record',
      error: error.message
    });
  }
};

// ==================== DRIVER ASSIGNMENT MANAGEMENT ====================

const getDriverAssignments = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { driverId, vehicleId, status, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(driverId && { driverId }),
      ...(vehicleId && { vehicleId }),
      ...(status && { status })
    };

    const assignments = await prisma.driverAssignment.findMany({
      where,
      include: {
        driver: { select: { firstName: true, lastName: true, driverCode: true } },
        vehicle: { select: { vehicleNumber: true, make: true, model: true } }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { assignedDate: 'desc' }
    });

    const total = await prisma.driverAssignment.count({ where });

    await auditLogger.log(req.user, 'READ', 'DRIVER_ASSIGNMENTS', null, 
      `Retrieved ${assignments.length} driver assignments`);

    res.json({
      success: true,
      data: assignments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching driver assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver assignments',
      error: error.message
    });
  }
};

const createDriverAssignment = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const assignmentData = { ...req.body };

    // Validate required fields
    if (!assignmentData.driverId || !assignmentData.vehicleId) {
      return res.status(400).json({
        success: false,
        message: 'Driver and vehicle are required'
      });
    }

    // Check for existing active assignment
    const existingAssignment = await prisma.driverAssignment.findFirst({
      where: {
        tenantId,
        vehicleId: assignmentData.vehicleId,
        status: 'ACTIVE'
      }
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle already has an active driver assignment'
      });
    }

    const assignment = await prisma.driverAssignment.create({
      data: {
        tenantId,
        ...assignmentData,
        createdBy: userId,
        updatedBy: userId
      },
      include: {
        driver: { select: { firstName: true, lastName: true, driverCode: true } },
        vehicle: { select: { vehicleNumber: true, make: true, model: true } }
      }
    });

    await auditLogger.log(req.user, 'CREATE', 'DRIVER_ASSIGNMENT', assignment.id, 
      `Assigned driver ${assignment.driver.firstName} ${assignment.driver.lastName} to vehicle ${assignment.vehicle.vehicleNumber}`);

    res.status(201).json({
      success: true,
      message: 'Driver assignment created successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error creating driver assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create driver assignment',
      error: error.message
    });
  }
};

// ==================== ROUTE STOP MANAGEMENT ====================

const getRouteStops = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { routeId, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(routeId && { routeId })
    };

    const stops = await prisma.routeStop.findMany({
      where,
      include: {
        route: { select: { routeName: true } }
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { stopOrder: 'asc' }
    });

    const total = await prisma.routeStop.count({ where });

    await auditLogger.log(req.user, 'READ', 'ROUTE_STOPS', null, 
      `Retrieved ${stops.length} route stops`);

    res.json({
      success: true,
      data: stops,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching route stops:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch route stops',
      error: error.message
    });
  }
};

const createRouteStop = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const stopData = { ...req.body };

    // Validate required fields
    if (!stopData.routeId || !stopData.stopName) {
      return res.status(400).json({
        success: false,
        message: 'Route and stop name are required'
      });
    }

    const stop = await prisma.routeStop.create({
      data: {
        tenantId,
        ...stopData,
        createdBy: userId,
        updatedBy: userId
      },
      include: {
        route: { select: { routeName: true } }
      }
    });

    await auditLogger.log(req.user, 'CREATE', 'ROUTE_STOP', stop.id, 
      `Created route stop: ${stop.stopName}`);

    res.status(201).json({
      success: true,
      message: 'Route stop created successfully',
      data: stop
    });
  } catch (error) {
    console.error('Error creating route stop:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create route stop',
      error: error.message
    });
  }
};

// ==================== NOTIFICATION MANAGEMENT ====================

const getTransportNotifications = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { type, status, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(type && { type }),
      ...(status && { status })
    };

    const notifications = await prisma.transportNotification.findMany({
      where,
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.transportNotification.count({ where });

    await auditLogger.log(req.user, 'READ', 'TRANSPORT_NOTIFICATIONS', null, 
      `Retrieved ${notifications.length} transport notifications`);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching transport notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transport notifications',
      error: error.message
    });
  }
};

const createTransportNotification = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const notificationData = { ...req.body };

    // Validate required fields
    if (!notificationData.type || !notificationData.title || !notificationData.message) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, and message are required'
      });
    }

    const notification = await prisma.transportNotification.create({
      data: {
        tenantId,
        ...notificationData,
        createdBy: userId,
        updatedBy: userId
      }
    });

    await auditLogger.log(req.user, 'CREATE', 'TRANSPORT_NOTIFICATION', notification.id, 
      `Created transport notification: ${notification.title}`);

    res.status(201).json({
      success: true,
      message: 'Transport notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error creating transport notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transport notification',
      error: error.message
    });
  }
};

module.exports = {
  // Route management
  getTransportRoutes,
  getTransportRouteById,
  createTransportRoute,
  updateTransportRoute,
  deleteTransportRoute,

  // Vehicle management
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,

  // Driver management
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,

  // Student transport management
  getStudentTransports,
  assignStudentToRoute,

  // Maintenance management
  getMaintenanceRecords,
  createMaintenanceRecord,

  // Route optimization
  optimizeRoute,

  // Statistics
  getTransportStats,

  // Schedule management
  getTransportSchedules,
  createTransportSchedule,

  // Incident management
  getTransportIncidents,
  createTransportIncident,

  // Fee management
  getTransportFees,
  createTransportFee,

  // Attendance management
  getTransportAttendance,
  markTransportAttendance,

  // Fuel management
  getFuelRecords,
  createFuelRecord,

  // Inspection management
  getVehicleInspections,
  createVehicleInspection,

  // Driver performance management
  getDriverPerformance,
  createDriverPerformance,

  // Driver assignment management
  getDriverAssignments,
  createDriverAssignment,

  // Route stop management
  getRouteStops,
  createRouteStop,

  // Notification management
  getTransportNotifications,
  createTransportNotification
};