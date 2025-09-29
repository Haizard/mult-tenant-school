const express = require('express');
const router = express.Router();
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');
const {
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
} = require('../controllers/transportController');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(ensureTenantAccess);

// ==================== TRANSPORT ROUTES ====================

// GET /api/transport/routes - Get all transport routes
router.get('/routes', authorize(['transport.read', 'transport.manage']), getTransportRoutes);

// GET /api/transport/routes/:id - Get specific transport route
router.get('/routes/:id', authorize(['transport.read', 'transport.manage']), getTransportRouteById);

// POST /api/transport/routes - Create new transport route
router.post('/routes', authorize(['transport.manage', 'transport.routes.manage']), createTransportRoute);

// PUT /api/transport/routes/:id - Update transport route
router.put('/routes/:id', authorize(['transport.manage', 'transport.routes.manage']), updateTransportRoute);

// DELETE /api/transport/routes/:id - Delete transport route
router.delete('/routes/:id', authorize(['transport.manage', 'transport.routes.manage']), deleteTransportRoute);

// POST /api/transport/routes/:id/optimize - Optimize route
router.post('/routes/:id/optimize', authorize(['transport.manage', 'transport.routes.manage']), optimizeRoute);

// ==================== VEHICLE MANAGEMENT ====================

// GET /api/transport/vehicles - Get all vehicles
router.get('/vehicles', authorize(['transport.read', 'transport.manage']), getVehicles);

// GET /api/transport/vehicles/:id - Get specific vehicle
router.get('/vehicles/:id', authorize(['transport.read', 'transport.manage']), getVehicleById);

// POST /api/transport/vehicles - Create new vehicle
router.post('/vehicles', authorize(['transport.manage', 'transport.vehicles.manage']), createVehicle);

// PUT /api/transport/vehicles/:id - Update vehicle
router.put('/vehicles/:id', authorize(['transport.manage', 'transport.vehicles.manage']), updateVehicle);

// DELETE /api/transport/vehicles/:id - Delete vehicle
router.delete('/vehicles/:id', authorize(['transport.manage', 'transport.vehicles.manage']), deleteVehicle);

// ==================== DRIVER MANAGEMENT ====================

// GET /api/transport/drivers - Get all drivers
router.get('/drivers', authorize(['transport.read', 'transport.manage']), getDrivers);

// GET /api/transport/drivers/:id - Get specific driver
router.get('/drivers/:id', authorize(['transport.read', 'transport.manage']), getDriverById);

// POST /api/transport/drivers - Create new driver
router.post('/drivers', authorize(['transport.manage', 'transport.drivers.manage']), createDriver);

// PUT /api/transport/drivers/:id - Update driver
router.put('/drivers/:id', authorize(['transport.manage', 'transport.drivers.manage']), updateDriver);

// DELETE /api/transport/drivers/:id - Delete driver
router.delete('/drivers/:id', authorize(['transport.manage', 'transport.drivers.manage']), deleteDriver);

// ==================== STUDENT TRANSPORT MANAGEMENT ====================

// GET /api/transport/students - Get student transport assignments
router.get('/students', authorize(['transport.read', 'transport.manage']), getStudentTransports);

// POST /api/transport/students/assign - Assign student to transport route
router.post('/students/assign', authorize(['transport.manage', 'transport.students.manage']), assignStudentToRoute);

// ==================== MAINTENANCE MANAGEMENT ====================

// GET /api/transport/maintenance - Get maintenance records
router.get('/maintenance', authorize(['transport.read', 'transport.manage']), getMaintenanceRecords);

// POST /api/transport/maintenance - Create maintenance record
router.post('/maintenance', authorize(['transport.manage', 'transport.vehicles.manage']), createMaintenanceRecord);

// ==================== STATISTICS & REPORTS ====================

// GET /api/transport/stats - Get transport statistics
router.get('/stats', authorize(['transport.read', 'transport.manage', 'transport.reports.read']), getTransportStats);

// ==================== TRANSPORT SCHEDULE MANAGEMENT ====================

// GET /api/transport/schedules - Get transport schedules
router.get('/schedules', authorize(['transport.read', 'transport.manage']), getTransportSchedules);

// POST /api/transport/schedules - Create transport schedule
router.post('/schedules', authorize(['transport.manage', 'transport.schedules.manage']), createTransportSchedule);

// ==================== TRANSPORT INCIDENT MANAGEMENT ====================

// GET /api/transport/incidents - Get transport incidents
router.get('/incidents', authorize(['transport.read', 'transport.manage']), getTransportIncidents);

// POST /api/transport/incidents - Create transport incident
router.post('/incidents', authorize(['transport.manage', 'transport.incidents.manage']), createTransportIncident);

// ==================== TRANSPORT FEE MANAGEMENT ====================

// GET /api/transport/fees - Get transport fees
router.get('/fees', authorize(['transport.read', 'transport.manage']), getTransportFees);

// POST /api/transport/fees - Create transport fee
router.post('/fees', authorize(['transport.manage', 'transport.fees.manage']), createTransportFee);

// ==================== TRANSPORT ATTENDANCE MANAGEMENT ====================

// GET /api/transport/attendance - Get transport attendance
router.get('/attendance', authorize(['transport.read', 'transport.manage']), getTransportAttendance);

// POST /api/transport/attendance - Mark transport attendance
router.post('/attendance', authorize(['transport.manage', 'transport.attendance.manage']), markTransportAttendance);

// ==================== FUEL RECORD MANAGEMENT ====================

// GET /api/transport/fuel - Get fuel records
router.get('/fuel', authorize(['transport.read', 'transport.manage']), getFuelRecords);

// POST /api/transport/fuel - Create fuel record
router.post('/fuel', authorize(['transport.manage', 'transport.fuel.manage']), createFuelRecord);

// ==================== VEHICLE INSPECTION MANAGEMENT ====================

// GET /api/transport/inspections - Get vehicle inspections
router.get('/inspections', authorize(['transport.read', 'transport.manage']), getVehicleInspections);

// POST /api/transport/inspections - Create vehicle inspection
router.post('/inspections', authorize(['transport.manage', 'transport.inspections.manage']), createVehicleInspection);

// ==================== DRIVER PERFORMANCE MANAGEMENT ====================

// GET /api/transport/drivers/performance - Get driver performance
router.get('/drivers/performance', authorize(['transport.read', 'transport.manage']), getDriverPerformance);

// POST /api/transport/drivers/performance - Create driver performance record
router.post('/drivers/performance', authorize(['transport.manage', 'transport.drivers.manage']), createDriverPerformance);

// ==================== DRIVER ASSIGNMENT MANAGEMENT ====================

// GET /api/transport/drivers/assignments - Get driver assignments
router.get('/drivers/assignments', authorize(['transport.read', 'transport.manage']), getDriverAssignments);

// POST /api/transport/drivers/assignments - Create driver assignment
router.post('/drivers/assignments', authorize(['transport.manage', 'transport.drivers.manage']), createDriverAssignment);

// ==================== ROUTE STOP MANAGEMENT ====================

// GET /api/transport/routes/stops - Get route stops
router.get('/routes/stops', authorize(['transport.read', 'transport.manage']), getRouteStops);

// POST /api/transport/routes/stops - Create route stop
router.post('/routes/stops', authorize(['transport.manage', 'transport.routes.manage']), createRouteStop);

// ==================== NOTIFICATION MANAGEMENT ====================

// GET /api/transport/notifications - Get transport notifications
router.get('/notifications', authorize(['transport.read', 'transport.manage']), getTransportNotifications);

// POST /api/transport/notifications - Create transport notification
router.post('/notifications', authorize(['transport.manage', 'transport.notifications.manage']), createTransportNotification);

module.exports = router;