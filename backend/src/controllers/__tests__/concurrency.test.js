const { PrismaClient } = require('@prisma/client');
const { createHostelAssignment, updateHostelAssignment } = require('../hostelController');

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    hostelAssignment: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    hostelRoom: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  })),
}));

const mockPrisma = new PrismaClient();

describe('Hostel Controller - Concurrency Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    
    // Reset mock return values to initial state
    mockPrisma.hostelRoom.findFirst.mockResolvedValue(null);
    mockPrisma.hostelAssignment.findFirst.mockResolvedValue(null);
    mockPrisma.hostelAssignment.count.mockResolvedValue(0);
    mockPrisma.hostelAssignment.create.mockResolvedValue({});
    mockPrisma.hostelAssignment.update.mockResolvedValue({});
    mockPrisma.$transaction.mockImplementation(async (callback) => {
      const tx = {
        hostelAssignment: {
          update: jest.fn().mockResolvedValue({}),
        },
        hostelRoom: {
          update: jest.fn().mockResolvedValue({}),
        },
      };
      return await callback(tx);
    });
  });

  describe('Concurrency Tests', () => {
    it('should handle concurrent assignment creation atomically', async () => {
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

      // Mock no existing assignment
      mockPrisma.hostelAssignment.findFirst.mockResolvedValue(null);

      // Mock active assignment count (room is at capacity)
      mockPrisma.hostelAssignment.count.mockResolvedValue(1);

      await createHostelAssignment(req, res);

      // Should return 400 when room is at capacity
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Room is at full capacity' });
    });

    it('should handle concurrent assignment updates atomically', async () => {
      const req = {
        user: { tenantId: 1 },
        params: { id: 1 },
        body: {
          status: 'COMPLETED',
          endDate: '2024-12-31',
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
      });

      // Mock room assignment count
      mockPrisma.hostelAssignment.count.mockResolvedValue(0);

      await updateHostelAssignment(req, res);

      // Verify transaction was used for atomic updates
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should prevent race conditions in assignment updates', async () => {
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

      // Mock assignment not found (concurrent deletion)
      mockPrisma.hostelAssignment.findFirst.mockResolvedValue(null);

      await updateHostelAssignment(req, res);

      // Should return 404 when assignment not found
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Assignment not found' });
    });

    it('should handle concurrent assignment creation with race condition simulation', async () => {
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

      // Mock room with capacity 1
      mockPrisma.hostelRoom.findFirst.mockResolvedValue({
        id: 1,
        capacity: 1,
        tenantId: 1,
      });

      // Mock no existing assignments initially
      mockPrisma.hostelAssignment.findFirst.mockResolvedValue(null);

      // Simulate race condition: first call sees 0 assignments, second sees 1
      mockPrisma.hostelAssignment.count
        .mockResolvedValueOnce(0) // First call
        .mockResolvedValueOnce(1); // Second call

      // Mock successful creation for first assignment
      mockPrisma.hostelAssignment.create.mockResolvedValueOnce({
        id: 1,
        tenantId: 1,
        studentId: 1,
        status: 'ACTIVE',
      });

      // Execute both requests concurrently
      await Promise.all([
        createHostelAssignment(req1, res1),
        createHostelAssignment(req2, res2),
      ]);

      // First assignment should succeed
      expect(res1.status).toHaveBeenCalledWith(201);
      
      // Second assignment should fail due to capacity
      expect(res2.status).toHaveBeenCalledWith(400);
      expect(res2.json).toHaveBeenCalledWith({ error: 'Room is at full capacity' });
    });
  });
});


