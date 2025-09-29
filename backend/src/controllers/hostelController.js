const prisma = require('../utils/prisma');
const {
  HOSTEL_STATUS,
  ROOM_STATUS,
  ASSIGNMENT_STATUS,
  MAINTENANCE_STATUS,
  REPORT_STATUS,
} = require('../constants/hostelConstants');

// Common select object for student and user fields
const STUDENT_USER_SELECT = {
  id: true,
  studentId: true,
  user: {
    select: {
      firstName: true,
      lastName: true,
      email: true,
    },
  },
};

// Centralized error handling utility function
const handleError = (error, res, operation = 'operation') => {
  console.error(`Error during ${operation}:`, error);
  
  // Don't expose stack traces in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse = {
    error: `Failed to ${operation}`,
    ...(isDevelopment && { details: error.message })
  };
  
  res.status(500).json(errorResponse);
};

/**
 * Builds a tenant-scoped where clause with optional filters
 * @param {Object} user - User object containing tenantId
 * @param {Object} filters - Optional filters to apply (whitelisted only)
 * @returns {Object} Prisma where clause with tenantId and validated filters
 */
const buildTenantScopedWhere = (user, filters = {}) => {
  const { tenantId } = user;
  const where = { tenantId };
  
  // Whitelist of allowed filter keys
  const allowedFilters = [
    'status', 'search', 'hostelId', 'roomId', 'studentId', 
    'maintenanceType', 'reportType', 'id'
  ];
  
  // Numeric fields that should be coerced to numbers
  const numericFields = ['hostelId', 'roomId', 'studentId', 'id'];
  
  // Add optional filters if they exist and are whitelisted
  Object.keys(filters).forEach(key => {
    if (allowedFilters.includes(key) && 
        filters[key] !== undefined && 
        filters[key] !== null && 
        filters[key] !== '') {
      
      // Coerce numeric fields to numbers
      if (numericFields.includes(key)) {
        const numericValue = Number(filters[key]);
        if (!isNaN(numericValue)) {
          where[key] = numericValue;
        }
      } else {
        where[key] = filters[key];
      }
    }
  });
  
  // Exclude INACTIVE status by default unless explicitly specified
  if (!filters.status || filters.status === undefined || filters.status === null || filters.status === '') {
    where.status = { not: 'INACTIVE' };
  }
  
  return where;
};

/**
 * Gets active assignment counts for multiple entities
 * @param {string} fieldName - The field name to filter by (e.g., 'hostelId', 'roomId')
 * @param {Array<number>} entityIds - Array of entity IDs to count assignments for
 * @param {number} tenantId - Tenant ID for scoping
 * @returns {Promise<Array<{id: number, count: number}>>} Array of objects with entity ID and count
 */
const getActiveAssignmentCounts = async (fieldName, entityIds, tenantId) => {
  if (!entityIds || entityIds.length === 0) {
    return [];
  }

  const counts = await Promise.all(
    entityIds.map(async (entityId) => {
      const count = await prisma.hostelAssignment.count({
        where: {
          tenantId,
          status: ASSIGNMENT_STATUS.ACTIVE,
          [fieldName]: entityId,
        },
      });
      return { id: entityId, count };
    })
  );

  return counts;
};

/**
 * Generic helper to merge active assignment counts into items data
 * @param {Array<Object>} items - Array of items (hostels, rooms, etc.)
 * @param {Array<{id: number, count: number}>} activeAssignmentCounts - Array of assignment counts
 * @param {string} itemIdKey - Key for item ID (default: 'id')
 * @param {string} countFieldName - Name of the count field to add (default: 'activeAssignments')
 * @returns {Array<Object>} Items with merged active assignment counts
 */
const mergeWithActiveCounts = (items, activeAssignmentCounts, itemIdKey = 'id', countFieldName = 'activeAssignments') => {
  return items.map(item => {
    const activeCount = activeAssignmentCounts.find(
      count => count.id === item[itemIdKey]
    )?.count ?? 0;
    
    return {
      ...item,
      _count: {
        ...item._count,
        [countFieldName]: activeCount,
      },
    };
  });
};

/**
 * Merges active assignment counts into hostels data
 * @param {Array<Object>} hostels - Array of hostel objects
 * @param {Array<{id: number, count: number}>} activeAssignmentCounts - Array of assignment counts
 * @returns {Array<Object>} Hostels with merged active assignment counts
 */
const mergeHostelsWithActiveCounts = (hostels, activeAssignmentCounts) => {
  return mergeWithActiveCounts(hostels, activeAssignmentCounts);
};

/**
 * Merges active assignment counts into rooms data
 * @param {Array<Object>} rooms - Array of room objects
 * @param {Array<{id: number, count: number}>} activeAssignmentCounts - Array of assignment counts
 * @returns {Array<Object>} Rooms with merged active assignment counts
 */
const mergeRoomsWithActiveCounts = (rooms, activeAssignmentCounts) => {
  return mergeWithActiveCounts(rooms, activeAssignmentCounts);
};

// Hostel Management
const getHostels = async (req, res) => {
  try {
    const { status, search } = req.query;

    const where = buildTenantScopedWhere(req.user, { status });
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const hostels = await prisma.hostel.findMany({
      where,
      include: {
        _count: {
          select: {
            rooms: true,
            assignments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get active assignment counts for each hostel using helper function
    const hostelIds = hostels.map(h => h.id);
    const activeAssignmentCounts = await getActiveAssignmentCounts('hostelId', hostelIds, tenantId);

    // Merge active assignment counts into hostels data
    const hostelsWithActiveCounts = mergeHostelsWithActiveCounts(hostels, activeAssignmentCounts);

    res.json(hostelsWithActiveCounts);
  } catch (error) {
    handleError(error, res, 'fetch hostels');
  }
};

const createHostel = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const {
      name,
      description,
      address,
      totalCapacity,
      monthlyFee,
      wardenName,
      wardenPhone,
      wardenEmail,
    } = req.body;

    // Input validation
    const validationErrors = [];

    // Required field validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      validationErrors.push('name is required and must be a non-empty string');
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      validationErrors.push('description is required and must be a non-empty string');
    }
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      validationErrors.push('address is required and must be a non-empty string');
    }
    if (!wardenName || typeof wardenName !== 'string' || wardenName.trim().length === 0) {
      validationErrors.push('wardenName is required and must be a non-empty string');
    }
    if (!wardenEmail || typeof wardenEmail !== 'string' || wardenEmail.trim().length === 0) {
      validationErrors.push('wardenEmail is required and must be a non-empty string');
    }

    // Numeric field validation
    if (totalCapacity === undefined || totalCapacity === null || isNaN(Number(totalCapacity)) || Number(totalCapacity) <= 0) {
      validationErrors.push('totalCapacity is required and must be a positive number');
    }
    if (monthlyFee === undefined || monthlyFee === null || isNaN(Number(monthlyFee)) || Number(monthlyFee) < 0) {
      validationErrors.push('monthlyFee is required and must be a non-negative number');
    }

    // Phone validation (basic format check)
    if (wardenPhone && typeof wardenPhone === 'string') {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(wardenPhone.replace(/[\s\-\(\)]/g, ''))) {
        validationErrors.push('wardenPhone must be a valid phone number format');
      }
    } else if (wardenPhone !== undefined && wardenPhone !== null) {
      validationErrors.push('wardenPhone must be a string');
    }

    // Email validation (basic format check)
    if (wardenEmail && typeof wardenEmail === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(wardenEmail)) {
        validationErrors.push('wardenEmail must be a valid email format');
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    const hostel = await prisma.hostel.create({
      data: {
        tenantId,
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        totalCapacity: Number(totalCapacity),
        monthlyFee: Number(monthlyFee),
        wardenName: wardenName.trim(),
        wardenPhone: wardenPhone ? wardenPhone.trim() : null,
        wardenEmail: wardenEmail.trim(),
        status: HOSTEL_STATUS.ACTIVE,
      },
    });

    res.status(201).json(hostel);
  } catch (error) {
    handleError(error, res, 'create hostel');
  }
};

const updateHostel = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const numericId = Number(id);
    const updateData = req.body;

    const hostel = await prisma.hostel.update({
      where: { id: numericId, tenantId },
      data: updateData,
    });

    res.json(hostel);
  } catch (error) {
    handleError(error, res, 'update hostel');
  }
};

const deleteHostel = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const numericId = Number(id);

    // Check if hostel exists
    const hostel = await prisma.hostel.findFirst({
      where: { id: numericId, tenantId },
    });

    if (!hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }

    // Check for existing dependencies
    const [roomsCount, assignmentsCount, maintenanceCount] = await Promise.all([
      prisma.hostelRoom.count({ where: { hostelId: numericId, tenantId } }),
      prisma.hostelAssignment.count({ where: { hostelId: numericId, tenantId } }),
      prisma.hostelMaintenance.count({ where: { hostelId: numericId, tenantId } }),
    ]);

    if (roomsCount > 0 || assignmentsCount > 0 || maintenanceCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete hostel with existing dependencies',
        details: {
          rooms: roomsCount,
          assignments: assignmentsCount,
          maintenance: maintenanceCount,
        },
      });
    }

    // Implement soft delete by updating status
    await prisma.hostel.update({
      where: { id: numericId, tenantId },
      data: { 
        status: HOSTEL_STATUS.INACTIVE,
        deletedAt: new Date(),
      },
    });

    res.json({ message: 'Hostel deleted successfully' });
  } catch (error) {
    handleError(error, res, 'delete hostel');
  }
};

// Hostel Room Management
const getHostelRooms = async (req, res) => {
  try {
    const { hostelId, status, search } = req.query;

    const where = buildTenantScopedWhere(req.user, { hostelId, status });
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { roomNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const rooms = await prisma.hostelRoom.findMany({
      where,
      include: {
        hostel: { select: { name: true } },
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      orderBy: { roomNumber: 'asc' },
    });

    // Get active assignment counts for each room using helper function
    const roomIds = rooms.map(r => r.id);
    const activeAssignmentCounts = await getActiveAssignmentCounts('roomId', roomIds, tenantId);

    // Merge active assignment counts into rooms data
    const roomsWithActiveCounts = mergeRoomsWithActiveCounts(rooms, activeAssignmentCounts);

    res.json(roomsWithActiveCounts);
  } catch (error) {
    handleError(error, res, 'fetch hostel rooms');
  }
};

const createHostelRoom = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const {
      hostelId,
      roomNumber,
      floorNumber,
      capacity,
      roomType,
      monthlyFee,
      amenities,
      notes,
    } = req.body;

    // Input validation
    const validationErrors = [];

    // Required field validation
    if (!hostelId || isNaN(Number(hostelId)) || Number(hostelId) <= 0) {
      validationErrors.push('hostelId is required and must be a positive number');
    }
    if (!roomNumber || typeof roomNumber !== 'string' || roomNumber.trim().length === 0) {
      validationErrors.push('roomNumber is required and must be a non-empty string');
    }
    if (capacity === undefined || capacity === null || isNaN(Number(capacity)) || Number(capacity) <= 0) {
      validationErrors.push('capacity is required and must be a positive number');
    }

    // Optional field validation
    if (floorNumber !== undefined && floorNumber !== null && (isNaN(Number(floorNumber)) || Number(floorNumber) < 0)) {
      validationErrors.push('floorNumber must be a non-negative number');
    }
    if (monthlyFee !== undefined && monthlyFee !== null && (isNaN(Number(monthlyFee)) || Number(monthlyFee) < 0)) {
      validationErrors.push('monthlyFee must be a non-negative number');
    }

    // Room type validation (if provided)
    if (roomType !== undefined && roomType !== null) {
      const validRoomTypes = ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD', 'DORMITORY', 'SUITE'];
      if (typeof roomType !== 'string' || !validRoomTypes.includes(roomType.toUpperCase())) {
        validationErrors.push(`roomType must be one of: ${validRoomTypes.join(', ')}`);
      }
    }

    // String field validation
    if (amenities !== undefined && amenities !== null && typeof amenities !== 'string') {
      validationErrors.push('amenities must be a string');
    }
    if (notes !== undefined && notes !== null && typeof notes !== 'string') {
      validationErrors.push('notes must be a string');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Verify hostel exists and belongs to tenant
    const hostel = await prisma.hostel.findFirst({
      where: { id: Number(hostelId), tenantId },
    });

    if (!hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }

    const room = await prisma.hostelRoom.create({
      data: {
        tenantId,
        hostelId: Number(hostelId),
        roomNumber: roomNumber.trim(),
        floorNumber: floorNumber !== undefined && floorNumber !== null ? Number(floorNumber) : null,
        capacity: Number(capacity),
        roomType: roomType ? roomType.toUpperCase() : null,
        monthlyFee: monthlyFee !== undefined && monthlyFee !== null ? Number(monthlyFee) : null,
        amenities: amenities ? amenities.trim() : null,
        notes: notes ? notes.trim() : null,
        status: ROOM_STATUS.AVAILABLE,
      },
    });

    res.status(201).json(room);
  } catch (error) {
    handleError(error, res, 'create hostel room');
  }
};

const updateHostelRoom = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const numericId = Number(id);
    const updateData = req.body;

    // Pre-check: verify the room exists and belongs to the tenant
    const existingRoom = await prisma.hostelRoom.findFirst({
      where: { id: numericId, tenantId },
    });

    if (!existingRoom) {
      return res.status(404).json({ error: 'Hostel room not found' });
    }

    // Update the room by its primary key id only
    const room = await prisma.hostelRoom.update({
      where: { id: numericId, tenantId },
      data: updateData,
    });

    res.json(room);
  } catch (error) {
    handleError(error, res, 'update hostel room');
  }
};

const deleteHostelRoom = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const numericId = Number(id);

    // Check if room exists
    const room = await prisma.hostelRoom.findFirst({
      where: { id: numericId, tenantId },
    });

    if (!room) {
      return res.status(404).json({ error: 'Hostel room not found' });
    }

    // Check for existing dependencies
    const assignmentsCount = await prisma.hostelAssignment.count({
      where: { roomId: numericId, tenantId, status: ASSIGNMENT_STATUS.ACTIVE }
    });

    if (assignmentsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete room with active assignments',
        details: { activeAssignments: assignmentsCount }
      });
    }

    // Implement soft delete by updating status
    await prisma.hostelRoom.update({
      where: { id: numericId, tenantId },
      data: { 
        status: ROOM_STATUS.MAINTENANCE,
        deletedAt: new Date(),
      },
    });

    res.json({ message: 'Hostel room deleted successfully' });
  } catch (error) {
    handleError(error, res, 'delete hostel room');
  }
};

// Hostel Assignment Management
const getHostelAssignments = async (req, res) => {
  try {
    const { status, studentId, hostelId, roomId } = req.query;

    const where = buildTenantScopedWhere(req.user, { status, studentId, hostelId, roomId });

    const assignments = await prisma.hostelAssignment.findMany({
      where,
      include: {
        student: {
          select: STUDENT_USER_SELECT,
        },
        hostel: { select: { name: true } },
        room: { select: { roomNumber: true, floorNumber: true } },
      },
      orderBy: { assignmentDate: 'desc' },
    });

    res.json(assignments);
  } catch (error) {
    handleError(error, res, 'fetch hostel assignments');
  }
};

const createHostelAssignment = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const {
      studentId,
      hostelId,
      roomId,
      startDate,
      endDate,
      monthlyFee,
      depositAmount,
      notes,
    } = req.body;

    // Check if room is available
    const room = await prisma.hostelRoom.findFirst({
      where: { id: roomId, tenantId },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Get count of active assignments for this room
    const activeAssignmentCount = await prisma.hostelAssignment.count({
      where: {
        roomId,
        status: ASSIGNMENT_STATUS.ACTIVE,
      },
    });

    if (activeAssignmentCount >= room.capacity) {
      return res.status(400).json({ error: 'Room is at full capacity' });
    }

    // Validate date inputs
    const startDateObj = new Date(startDate);
    const endDateObj = endDate ? new Date(endDate) : null;
    
    if (isNaN(startDateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid startDate format' });
    }
    
    if (endDate && isNaN(endDateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid endDate format' });
    }

    // Check if student already has an active assignment
    const existingAssignment = await prisma.hostelAssignment.findFirst({
      where: {
        studentId,
        status: ASSIGNMENT_STATUS.ACTIVE,
      },
    });

    if (existingAssignment) {
      return res.status(400).json({ error: 'Student already has an active hostel assignment' });
    }

    const assignment = await prisma.hostelAssignment.create({
      data: {
        tenantId,
        studentId,
        hostelId,
        roomId,
        startDate: startDateObj,
        endDate: endDateObj,
        monthlyFee,
        depositAmount,
        notes,
        status: ASSIGNMENT_STATUS.ACTIVE,
      },
      include: {
        student: {
          select: STUDENT_USER_SELECT,
        },
        hostel: { select: { name: true } },
        room: { select: { roomNumber: true, floorNumber: true } },
      },
    });

    // Update room status if at capacity
    if (activeAssignmentCount + 1 >= room.capacity) {
      await prisma.hostelRoom.update({
        where: { id: roomId, tenantId },
        data: { status: ROOM_STATUS.OCCUPIED },
      });
    }

    res.status(201).json(assignment);
  } catch (error) {
    handleError(error, res, 'create hostel assignment');
  }
};

const updateHostelAssignment = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const numericId = Number(id);
    const { status, endDate, notes } = req.body;

    // First, verify the assignment exists and belongs to the tenant
    const assignment = await prisma.hostelAssignment.findFirst({
      where: { id: numericId, tenantId },
      include: { room: true },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Validate allowed fields and prepare update data
    const allowedFields = ['status', 'endDate', 'notes'];
    const updateData = {};
    
    if (status && [ASSIGNMENT_STATUS.ACTIVE, ASSIGNMENT_STATUS.COMPLETED, ASSIGNMENT_STATUS.CANCELLED].includes(status)) {
      updateData.status = status;
    }
    if (endDate) {
      const endDateObj = new Date(endDate);
      if (isNaN(endDateObj.getTime())) {
        return res.status(400).json({ error: 'Invalid endDate format' });
      }
      updateData.endDate = endDateObj;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Check if updateData is empty
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No updatable fields were provided' });
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update the assignment
      const updatedAssignment = await tx.hostelAssignment.update({
        where: { id: numericId, tenantId },
        data: updateData,
        include: {
          student: {
            select: {
              id: true,
              studentId: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          hostel: { select: { name: true } },
          room: { select: { roomNumber: true, floorNumber: true } },
        },
      });

      // Update room status if assignment is completed or cancelled
      if (status === ASSIGNMENT_STATUS.COMPLETED || status === ASSIGNMENT_STATUS.CANCELLED) {
        const roomAssignments = await tx.hostelAssignment.count({
          where: {
            roomId: assignment.roomId,
            status: ASSIGNMENT_STATUS.ACTIVE,
          },
        });

        const newRoomStatus = roomAssignments === 0 ? ROOM_STATUS.AVAILABLE : ROOM_STATUS.OCCUPIED;
        await tx.hostelRoom.update({
          where: { id: assignment.roomId, tenantId },
          data: { status: newRoomStatus },
        });
      }

      return updatedAssignment;
    });

    res.json(result);
  } catch (error) {
    handleError(error, res, 'update hostel assignment');
  }
};

const deleteHostelAssignment = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const numericId = Number(id);

    // Check if assignment exists
    const assignment = await prisma.hostelAssignment.findFirst({
      where: { id: numericId, tenantId },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Hostel assignment not found' });
    }

    // Implement soft delete by updating status
    await prisma.hostelAssignment.update({
      where: { id: numericId, tenantId },
      data: { 
        status: ASSIGNMENT_STATUS.CANCELLED,
        endDate: new Date(),
      },
    });

    res.json({ message: 'Hostel assignment deleted successfully' });
  } catch (error) {
    handleError(error, res, 'delete hostel assignment');
  }
};

// Hostel Maintenance Management
const getHostelMaintenance = async (req, res) => {
  try {
    const { status, hostelId, roomId, maintenanceType } = req.query;

    const where = buildTenantScopedWhere(req.user, { status, hostelId, roomId, maintenanceType });

    const maintenance = await prisma.hostelMaintenance.findMany({
      where,
      include: {
        hostel: { select: { name: true } },
        room: { select: { roomNumber: true, floorNumber: true } },
      },
      orderBy: { scheduledDate: 'desc' },
    });

    res.json(maintenance);
  } catch (error) {
    handleError(error, res, 'fetch hostel maintenance');
  }
};

const createHostelMaintenance = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const {
      hostelId,
      roomId,
      maintenanceType,
      title,
      description,
      priority,
      scheduledDate,
      cost,
      vendor,
      notes,
    } = req.body;

    // Validate scheduledDate
    const scheduledDateObj = new Date(scheduledDate);
    if (isNaN(scheduledDateObj.getTime())) {
      return res.status(400).json({ error: 'Invalid scheduledDate format' });
    }

    const maintenance = await prisma.hostelMaintenance.create({
      data: {
        tenantId,
        hostelId,
        roomId,
        maintenanceType,
        title,
        description,
        priority,
        scheduledDate: scheduledDateObj,
        cost,
        vendor,
        notes,
        status: MAINTENANCE_STATUS.SCHEDULED,
      },
      include: {
        hostel: { select: { name: true } },
        room: { select: { roomNumber: true, floorNumber: true } },
      },
    });

    res.status(201).json(maintenance);
  } catch (error) {
    handleError(error, res, 'create hostel maintenance');
  }
};

const updateHostelMaintenance = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const numericId = Number(id);
    const updateData = req.body;

    // Validate and convert date strings to Date objects if present
    if (updateData.scheduledDate) {
      const scheduledDateObj = new Date(updateData.scheduledDate);
      if (isNaN(scheduledDateObj.getTime())) {
        return res.status(400).json({ error: 'Invalid scheduledDate format' });
      }
      updateData.scheduledDate = scheduledDateObj;
    }
    if (updateData.completedDate) {
      const completedDateObj = new Date(updateData.completedDate);
      if (isNaN(completedDateObj.getTime())) {
        return res.status(400).json({ error: 'Invalid completedDate format' });
      }
      updateData.completedDate = completedDateObj;
    }

    const maintenance = await prisma.hostelMaintenance.update({
      where: { id: numericId, tenantId },
      data: updateData,
      include: {
        hostel: { select: { name: true } },
        room: { select: { roomNumber: true, floorNumber: true } },
      },
    });

    res.json(maintenance);
  } catch (error) {
    handleError(error, res, 'update hostel maintenance');
  }
};

const deleteHostelMaintenance = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const numericId = Number(id);

    // Check if maintenance record exists
    const maintenance = await prisma.hostelMaintenance.findFirst({
      where: { id: numericId, tenantId },
    });

    if (!maintenance) {
      return res.status(404).json({ error: 'Hostel maintenance record not found' });
    }

    // Implement soft delete by updating status
    await prisma.hostelMaintenance.update({
      where: { id: numericId, tenantId },
      data: { 
        status: MAINTENANCE_STATUS.CANCELLED,
        completedDate: new Date(),
      },
    });

    res.json({ message: 'Hostel maintenance record deleted successfully' });
  } catch (error) {
    handleError(error, res, 'delete hostel maintenance');
  }
};

// Hostel Reports
const getHostelReports = async (req, res) => {
  try {
    const { hostelId, reportType } = req.query;

    const where = buildTenantScopedWhere(req.user, { hostelId, reportType });

    const reports = await prisma.hostelReport.findMany({
      where,
      include: {
        hostel: { select: { name: true } },
      },
      orderBy: { generatedAt: 'desc' },
    });

    res.json(reports);
  } catch (error) {
    handleError(error, res, 'fetch hostel reports');
  }
};

const createHostelReport = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const {
      hostelId,
      reportType,
      title,
      parameters,
      data,
      format,
    } = req.body;

    const report = await prisma.hostelReport.create({
      data: {
        tenantId,
        hostelId,
        reportType,
        title,
        parameters,
        data,
        format,
        generatedBy: req.user.id,
        status: REPORT_STATUS.GENERATED,
      },
      include: {
        hostel: { select: { name: true } },
      },
    });

    res.status(201).json(report);
  } catch (error) {
    handleError(error, res, 'create hostel report');
  }
};

const deleteHostelReport = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const numericId = Number(id);

    // Check if report exists
    const report = await prisma.hostelReport.findFirst({
      where: { id: numericId, tenantId },
    });

    if (!report) {
      return res.status(404).json({ error: 'Hostel report not found' });
    }

    // Implement soft delete by updating status
    await prisma.hostelReport.update({
      where: { id: numericId, tenantId },
      data: { 
        status: REPORT_STATUS.FAILED,
        deletedAt: new Date(),
      },
    });

    res.json({ message: 'Hostel report deleted successfully' });
  } catch (error) {
    handleError(error, res, 'delete hostel report');
  }
};

// Hostel Statistics
const getHostelStats = async (req, res) => {
  try {
    const { tenantId } = req.user;

    const [
      totalHostels,
      totalRooms,
      totalAssignments,
      activeAssignments,
      availableRooms,
      occupiedRooms,
      maintenanceRequests,
      completedMaintenance,
    ] = await Promise.all([
      prisma.hostel.count({ where: { tenantId, status: HOSTEL_STATUS.ACTIVE } }),
      prisma.hostelRoom.count({ where: { tenantId, status: { in: [ROOM_STATUS.AVAILABLE, ROOM_STATUS.OCCUPIED] } } }),
      prisma.hostelAssignment.count({ where: { tenantId } }),
      prisma.hostelAssignment.count({ where: { tenantId, status: ASSIGNMENT_STATUS.ACTIVE } }),
      prisma.hostelRoom.count({ where: { tenantId, status: ROOM_STATUS.AVAILABLE } }),
      prisma.hostelRoom.count({ where: { tenantId, status: ROOM_STATUS.OCCUPIED } }),
      prisma.hostelMaintenance.count({ where: { tenantId, status: { in: [MAINTENANCE_STATUS.SCHEDULED, MAINTENANCE_STATUS.IN_PROGRESS] } } }),
      prisma.hostelMaintenance.count({ where: { tenantId, status: MAINTENANCE_STATUS.COMPLETED } }),
    ]);

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    res.json({
      totalHostels,
      totalRooms,
      totalAssignments,
      activeAssignments,
      availableRooms,
      occupiedRooms,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      maintenanceRequests,
      completedMaintenance,
    });
  } catch (error) {
    handleError(error, res, 'fetch hostel statistics');
  }
};

module.exports = {
  // Hostel Management
  getHostels,
  createHostel,
  updateHostel,
  deleteHostel,
  
  // Room Management
  getHostelRooms,
  createHostelRoom,
  updateHostelRoom,
  deleteHostelRoom,
  
  // Assignment Management
  getHostelAssignments,
  createHostelAssignment,
  updateHostelAssignment,
  deleteHostelAssignment,
  
  // Maintenance Management
  getHostelMaintenance,
  createHostelMaintenance,
  updateHostelMaintenance,
  deleteHostelMaintenance,
  
  // Reports
  getHostelReports,
  createHostelReport,
  deleteHostelReport,
  
  // Statistics
  getHostelStats,
};
