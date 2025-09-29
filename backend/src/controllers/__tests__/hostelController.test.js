const { PrismaClient } = require('@prisma/client');
const { 
  createHostelAssignment, 
  updateHostelAssignment,
  createHostel,
  getHostels,
  getHostelAssignments,
  createHostelRoom,
  updateHostelRoom
} = require('../hostelController');

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    hostel: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    hostelAssignment: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    hostelRoom: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  })),
}));

const mockPrisma = new PrismaClient();

describe('Hostel Controller - Core Logic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    
    // Reset mock return values to initial state
    mockPrisma.hostel.create.mockResolvedValue({});
    mockPrisma.hostel.findMany.mockResolvedValue([]);
    mockPrisma.hostel.findFirst.mockResolvedValue(null);
    mockPrisma.hostel.update.mockResolvedValue({});
    mockPrisma.hostel.count.mockResolvedValue(0);
    
    mockPrisma.hostelRoom.findFirst.mockResolvedValue(null);
    mockPrisma.hostelRoom.create.mockResolvedValue({});
    mockPrisma.hostelRoom.update.mockResolvedValue({});
    mockPrisma.hostelRoom.findMany.mockResolvedValue([]);
    mockPrisma.hostelRoom.count.mockResolvedValue(0);
    
    mockPrisma.hostelAssignment.findFirst.mockResolvedValue(null);
    mockPrisma.hostelAssignment.findMany.mockResolvedValue([]);
    mockPrisma.hostelAssignment.count.mockResolvedValue(0);
    mockPrisma.hostelAssignment.create.mockResolvedValue({});
    mockPrisma.hostelAssignment.update.mockResolvedValue({});
    
    mockPrisma.$transaction.mockImplementation(async (callback) => {
      const tx = {
        hostel: {
          create: jest.fn().mockResolvedValue({}),
          update: jest.fn().mockResolvedValue({}),
          findFirst: jest.fn().mockResolvedValue(null),
          findMany: jest.fn().mockResolvedValue([]),
          count: jest.fn().mockResolvedValue(0),
        },
        hostelAssignment: {
          update: jest.fn().mockResolvedValue({}),
          count: jest.fn().mockResolvedValue(0),
        },
        hostelRoom: {
          update: jest.fn().mockResolvedValue({}),
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({}),
        },
      };
      return await callback(tx);
    });
  });

  describe('Tenant Scoping Tests', () => {
    it('should only access data within tenant boundary for hostel creation', async () => {
      const req = {
        user: { tenantId: 1 },
        body: {
          name: 'Test Hostel',
          description: 'Test Description',
          address: 'Test Address',
          totalCapacity: 100,
          monthlyFee: 500,
          wardenName: 'John Doe',
          wardenPhone: '+1234567890',
          wardenEmail: 'john@example.com',
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock successful creation with tenant scoping
      mockPrisma.hostel.create.mockResolvedValue({
        id: 1,
        tenantId: 1,
        name: 'Test Hostel',
        status: 'ACTIVE',
      });

      await createHostel(req, res);

      // Verify tenant scoping is respected
      expect(mockPrisma.hostel.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 1,
          name: 'Test Hostel',
        }),
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should only access data within tenant boundary for hostel retrieval', async () => {
      const req = {
        user: { tenantId: 1 },
        query: {},
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock hostels data with tenant scoping
      mockPrisma.hostel.findMany.mockResolvedValue([
        { id: 1, tenantId: 1, name: 'Hostel 1' },
        { id: 2, tenantId: 1, name: 'Hostel 2' },
      ]);

      await getHostels(req, res);

      // Verify tenant scoping is respected in query
      expect(mockPrisma.hostel.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          tenantId: 1,
        }),
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should prevent cross-tenant data access for assignments', async () => {
      const req = {
        user: { tenantId: 1 },
        body: {
          studentId: 1,
          hostelId: 1,
          roomId: 1,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          monthlyFee: 500,
          depositAmount: 1000,
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock room exists but belongs to different tenant
      mockPrisma.hostelRoom.findFirst.mockResolvedValue(null);

      await createHostelAssignment(req, res);

      // Should return 404 when room not found for tenant
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Room not found' });
    });

    it('should prevent cross-tenant data access for room creation', async () => {
      const req = {
        user: { tenantId: 1 },
        body: {
          hostelId: 999, // Hostel from different tenant
          roomNumber: '101',
          capacity: 2,
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock hostel not found for this tenant
      mockPrisma.hostel.findFirst.mockResolvedValue(null);

      await createHostelRoom(req, res);

      // Should return 404 when hostel not found for tenant
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Hostel not found' });
    });

    it('should prevent cross-tenant data access for room updates', async () => {
      const req = {
        user: { tenantId: 1 },
        params: { id: 999 }, // Room from different tenant
        body: { capacity: 3 },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock room not found for this tenant
      mockPrisma.hostelRoom.findFirst.mockResolvedValue(null);

      await updateHostelRoom(req, res);

      // Should return 404 when room not found for tenant
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Hostel room not found' });
    });

    it('should only return assignments for the correct tenant', async () => {
      const req = {
        user: { tenantId: 1 },
        query: {},
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock assignments data with tenant scoping
      mockPrisma.hostelAssignment.findMany.mockResolvedValue([
        { id: 1, tenantId: 1, studentId: 1 },
        { id: 2, tenantId: 1, studentId: 2 },
      ]);

      await getHostelAssignments(req, res);

      // Verify tenant scoping is respected in query
      expect(mockPrisma.hostelAssignment.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          tenantId: 1,
        }),
        include: expect.any(Object),
        orderBy: expect.any(Object),
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Concurrency Tests', () => {
    it('should handle concurrent assignment creation atomically', async () => {
      const req1 = {
        user: { tenantId: 1 },
        body: {
          studentId: 1,
          hostelId: 1,
          roomId: 1,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          monthlyFee: 500,
          depositAmount: 1000,
        },
      };

      const req2 = {
        user: { tenantId: 1 },
        body: {
          studentId: 2,
          hostelId: 1,
          roomId: 1,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          monthlyFee: 500,
          depositAmount: 1000,
        },
      };

      const res1 = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const res2 = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock room with capacity 2
      mockPrisma.hostelRoom.findFirst.mockResolvedValue({
        id: 1,
        capacity: 2,
        tenantId: 1,
      });

      // Mock no existing assignments initially
      mockPrisma.hostelAssignment.findFirst.mockResolvedValue(null);
      mockPrisma.hostelAssignment.count.mockResolvedValue(0);

      // Mock successful creation
      mockPrisma.hostelAssignment.create.mockResolvedValue({
        id: 1,
        tenantId: 1,
        studentId: 1,
        status: 'ACTIVE',
      });

      // Simulate concurrent requests
      const promise1 = createHostelAssignment(req1, res1);
      const promise2 = createHostelAssignment(req2, res2);

      await Promise.all([promise1, promise2]);

      // Both should succeed as room has capacity for 2
      expect(res1.status).toHaveBeenCalledWith(201);
      expect(res2.status).toHaveBeenCalledWith(201);
    });

    it('should prevent race conditions in room capacity checks', async () => {
      const req1 = {
        user: { tenantId: 1 },
        body: {
          studentId: 1,
          hostelId: 1,
          roomId: 1,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          monthlyFee: 500,
          depositAmount: 1000,
        },
      };

      const req2 = {
        user: { tenantId: 1 },
        body: {
          studentId: 2,
          hostelId: 1,
          roomId: 1,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          monthlyFee: 500,
          depositAmount: 1000,
        },
      };

      const req3 = {
        user: { tenantId: 1 },
        body: {
          studentId: 3,
          hostelId: 1,
          roomId: 1,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          monthlyFee: 500,
          depositAmount: 1000,
        },
      };

      const res1 = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const res2 = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const res3 = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Mock room with capacity 2
      mockPrisma.hostelRoom.findFirst.mockResolvedValue({
        id: 1,
        capacity: 2,
        tenantId: 1,
      });

      // Mock no existing assignments initially
      mockPrisma.hostelAssignment.findFirst.mockResolvedValue(null);
      
      // Mock assignment count to simulate race condition
      let assignmentCount = 0;
      mockPrisma.hostelAssignment.count.mockImplementation(() => {
        assignmentCount++;
        return Promise.resolve(assignmentCount - 1);
      });

      // Mock successful creation
      mockPrisma.hostelAssignment.create.mockResolvedValue({
        id: 1,
        tenantId: 1,
        studentId: 1,
        status: 'ACTIVE',
      });

      // Simulate concurrent requests
      const promise1 = createHostelAssignment(req1, res1);
      const promise2 = createHostelAssignment(req2, res2);
      const promise3 = createHostelAssignment(req3, res3);

      await Promise.all([promise1, promise2, promise3]);

      // First two should succeed, third should fail due to capacity
      expect(res1.status).toHaveBeenCalledWith(201);
      expect(res2.status).toHaveBeenCalledWith(201);
      expect(res3.status).toHaveBeenCalledWith(400);
      expect(res3.json).toHaveBeenCalledWith({ error: 'Room is at full capacity' });
    });

    it('should handle concurrent room status updates atomically', async () => {
      const req1 = {
        user: { tenantId: 1 },
        params: { id: 1 },
        body: { status: 'COMPLETED' },
      };

      const req2 = {
        user: { tenantId: 1 },
        params: { id: 2 },
        body: { status: 'COMPLETED' },
      };

      const res1 = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const res2 = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Mock existing assignments
      mockPrisma.hostelAssignment.findFirst
        .mockResolvedValueOnce({
          id: 1,
          tenantId: 1,
          roomId: 1,
          status: 'ACTIVE',
          room: { id: 1, capacity: 2 },
        })
        .mockResolvedValueOnce({
          id: 2,
          tenantId: 1,
          roomId: 1,
          status: 'ACTIVE',
          room: { id: 1, capacity: 2 },
        });

      // Mock transaction success
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          hostelAssignment: {
            update: jest.fn().mockResolvedValue({}),
            count: jest.fn().mockResolvedValue(0),
          },
          hostelRoom: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(tx);
      });

      // Simulate concurrent updates
      const promise1 = updateHostelAssignment(req1, res1);
      const promise2 = updateHostelAssignment(req2, res2);

      await Promise.all([promise1, promise2]);

      // Both should succeed with atomic transactions
      expect(res1.status).toHaveBeenCalledWith(200);
      expect(res2.status).toHaveBeenCalledWith(200);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(2);
    });
  });

  describe('Input Validation Tests', () => {
    it('should validate required fields for hostel creation', async () => {
      const req = {
        user: { tenantId: 1 },
        body: {
          // Missing required fields
          name: '',
          description: null,
          address: undefined,
          totalCapacity: 0,
          monthlyFee: -100,
          wardenName: '   ',
          wardenEmail: 'invalid-email',
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createHostel(req, res);

      // Should return 400 with validation errors
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          'name is required and must be a non-empty string',
          'description is required and must be a non-empty string',
          'address is required and must be a non-empty string',
          'totalCapacity is required and must be a positive number',
          'monthlyFee is required and must be a non-negative number',
          'wardenName is required and must be a non-empty string',
          'wardenEmail must be a valid email format',
        ]),
      });
    });

    it('should validate field types for hostel creation', async () => {
      const req = {
        user: { tenantId: 1 },
        body: {
          name: 123, // Should be string
          description: true, // Should be string
          address: {}, // Should be string
          totalCapacity: 'not-a-number', // Should be number
          monthlyFee: 'invalid', // Should be number
          wardenName: 456, // Should be string
          wardenPhone: 789, // Should be string
          wardenEmail: 'test@example.com',
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createHostel(req, res);

      // Should return 400 with type validation errors
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          'name is required and must be a non-empty string',
          'description is required and must be a non-empty string',
          'address is required and must be a non-empty string',
          'totalCapacity is required and must be a positive number',
          'monthlyFee is required and must be a non-negative number',
          'wardenName is required and must be a non-empty string',
          'wardenPhone must be a string',
        ]),
      });
    });

    it('should validate phone number format', async () => {
      const req = {
        user: { tenantId: 1 },
        body: {
          name: 'Test Hostel',
          description: 'Test Description',
          address: 'Test Address',
          totalCapacity: 100,
          monthlyFee: 500,
          wardenName: 'John Doe',
          wardenPhone: 'invalid-phone', // Invalid format
          wardenEmail: 'john@example.com',
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createHostel(req, res);

      // Should return 400 for invalid phone format
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          'wardenPhone must be a valid phone number format',
        ]),
      });
    });

    it('should validate email format', async () => {
      const req = {
        user: { tenantId: 1 },
        body: {
          name: 'Test Hostel',
          description: 'Test Description',
          address: 'Test Address',
          totalCapacity: 100,
          monthlyFee: 500,
          wardenName: 'John Doe',
          wardenPhone: '+1234567890',
          wardenEmail: 'invalid-email-format', // Invalid format
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createHostel(req, res);

      // Should return 400 for invalid email format
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          'wardenEmail must be a valid email format',
        ]),
      });
    });

    it('should accept valid input and create hostel', async () => {
      const req = {
        user: { tenantId: 1 },
        body: {
          name: 'Test Hostel',
          description: 'Test Description',
          address: 'Test Address',
          totalCapacity: 100,
          monthlyFee: 500,
          wardenName: 'John Doe',
          wardenPhone: '+1234567890',
          wardenEmail: 'john@example.com',
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock successful creation
      mockPrisma.hostel.create.mockResolvedValue({
        id: 1,
        tenantId: 1,
        name: 'Test Hostel',
        status: 'ACTIVE',
      });

      await createHostel(req, res);

      // Should succeed with valid input
      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockPrisma.hostel.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 1,
          name: 'Test Hostel',
          description: 'Test Description',
          address: 'Test Address',
          totalCapacity: 100,
          monthlyFee: 500,
          wardenName: 'John Doe',
          wardenPhone: '+1234567890',
          wardenEmail: 'john@example.com',
          status: 'ACTIVE',
        }),
      });
    });

    it('should handle optional wardenPhone field', async () => {
      const req = {
        user: { tenantId: 1 },
        body: {
          name: 'Test Hostel',
          description: 'Test Description',
          address: 'Test Address',
          totalCapacity: 100,
          monthlyFee: 500,
          wardenName: 'John Doe',
          // wardenPhone is optional
          wardenEmail: 'john@example.com',
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock successful creation
      mockPrisma.hostel.create.mockResolvedValue({
        id: 1,
        tenantId: 1,
        name: 'Test Hostel',
        status: 'ACTIVE',
      });

      await createHostel(req, res);

      // Should succeed without wardenPhone
      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockPrisma.hostel.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 1,
          name: 'Test Hostel',
          wardenPhone: null, // Should be null when not provided
        }),
      });
    });
  });

  describe('Data Integrity Tests', () => {
    it('should maintain referential integrity during updates', async () => {
      const req = {
        user: { tenantId: 1 },
        params: { id: 1 },
        body: {
          status: 'COMPLETED',
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock existing assignment with room
      mockPrisma.hostelAssignment.findFirst.mockResolvedValue({
        id: 1,
        tenantId: 1,
        roomId: 1,
        status: 'ACTIVE',
        room: { id: 1, capacity: 2 },
      });

      // Mock room assignment count
      mockPrisma.hostelAssignment.count.mockResolvedValue(1);

      await updateHostelAssignment(req, res);

      // Verify transaction was used for atomic updates
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should validate date inputs to prevent data corruption', async () => {
      const req = {
        user: { tenantId: 1 },
        body: {
          studentId: 1,
          hostelId: 1,
          roomId: 1,
          startDate: 'invalid-date',
          endDate: '2024-12-31',
          monthlyFee: 500,
          depositAmount: 1000,
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createHostelAssignment(req, res);

      // Should return 400 for invalid date
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid startDate format' });
    });

    it('should handle database transaction rollback on errors', async () => {
      const req = {
        user: { tenantId: 1 },
        params: { id: 1 },
        body: {
          status: 'COMPLETED',
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock existing assignment
      mockPrisma.hostelAssignment.findFirst.mockResolvedValue({
        id: 1,
        tenantId: 1,
        roomId: 1,
        status: 'ACTIVE',
        room: { id: 1, capacity: 2 },
      });

      // Mock transaction failure
      mockPrisma.$transaction.mockRejectedValue(new Error('Database constraint violation'));

      await updateHostelAssignment(req, res);

      // Should handle error gracefully
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Failed to update hostel assignment'
        })
      );
    });

    it('should prevent duplicate active assignments for same student', async () => {
      const req = {
        user: { tenantId: 1 },
        body: {
          studentId: 1,
          hostelId: 1,
          roomId: 1,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          monthlyFee: 500,
          depositAmount: 1000,
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock room exists
      mockPrisma.hostelRoom.findFirst.mockResolvedValue({
        id: 1,
        capacity: 2,
        tenantId: 1,
      });

      // Mock existing active assignment for student
      mockPrisma.hostelAssignment.findFirst.mockResolvedValue({
        id: 1,
        studentId: 1,
        status: 'ACTIVE',
      });

      await createHostelAssignment(req, res);

      // Should return 400 for duplicate assignment
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Student already has an active hostel assignment' });
    });

    it('should maintain data consistency during room capacity updates', async () => {
      const req = {
        user: { tenantId: 1 },
        body: {
          studentId: 1,
          hostelId: 1,
          roomId: 1,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          monthlyFee: 500,
          depositAmount: 1000,
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock room with capacity 1
      mockPrisma.hostelRoom.findFirst.mockResolvedValue({
        id: 1,
        capacity: 1,
        tenantId: 1,
      });

      // Mock no existing assignments
      mockPrisma.hostelAssignment.findFirst.mockResolvedValue(null);
      mockPrisma.hostelAssignment.count.mockResolvedValue(0);

      // Mock successful creation
      mockPrisma.hostelAssignment.create.mockResolvedValue({
        id: 1,
        tenantId: 1,
        studentId: 1,
        status: 'ACTIVE',
      });

      await createHostelAssignment(req, res);

      // Should update room status to OCCUPIED when at capacity
      expect(mockPrisma.hostelRoom.update).toHaveBeenCalledWith({
        where: { id: 1, tenantId: 1 },
        data: { status: 'OCCUPIED' },
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });
});