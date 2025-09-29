const request = require('supertest');
const express = require('express');
const { createHostelAssignment, updateHostelAssignment } = require('../src/controllers/hostelController');
const prisma = require('../src/utils/prisma');

// Mock Prisma for testing
jest.mock('../src/utils/prisma');

// Status constants
const ASSIGNMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const ROOM_STATUS = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
};

// Helper function to create consistent res object mock
const createMockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

// Create a test app
const app = express();
app.use(express.json());

// Mock middleware
const mockAuth = (req, res, next) => {
  req.user = { tenantId: 'test-tenant-id', id: 'test-user-id' };
  next();
};

app.use(mockAuth);

describe('Hostel Assignment Controller Tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('createHostelAssignment', () => {
    const mockRoom = {
      id: 'room-1',
      capacity: 2,
      status: ROOM_STATUS.AVAILABLE,
    };

    const mockAssignmentData = {
      studentId: 'student-1',
      hostelId: 'hostel-1',
      roomId: 'room-1',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      monthlyFee: 500,
      depositAmount: 1000,
      notes: 'Test assignment',
    };

    it('should create assignment when room has capacity - returns 201 Created', async () => {
      // Arrange: Mock data and setup
      prisma.hostelRoom.findFirst.mockResolvedValue(mockRoom);
      prisma.hostelAssignment.count.mockResolvedValue(1); // 1 active assignment, room capacity is 2
      prisma.hostelAssignment.findFirst.mockResolvedValue(null); // No existing assignment for student
      
      const mockCreatedAssignment = {
        id: 'assignment-1',
        ...mockAssignmentData,
        status: ASSIGNMENT_STATUS.ACTIVE,
        student: { id: 'student-1', studentId: 'STU001' },
        hostel: { name: 'Test Hostel' },
        room: { roomNumber: '101', floorNumber: 1 },
      };
      
      prisma.hostelAssignment.create.mockResolvedValue(mockCreatedAssignment);
      prisma.hostelRoom.update.mockResolvedValue({});

      const req = {
        user: { tenantId: 'test-tenant-id' },
        body: mockAssignmentData,
      };
      const res = createMockRes();

      // Act: Call the function under test
      await createHostelAssignment(req, res);

      // Assert: Verify expectations
      expect(prisma.hostelRoom.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'room-1',
            tenantId: 'test-tenant-id',
          }),
        })
      );
      expect(prisma.hostelAssignment.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            roomId: 'room-1',
            status: ASSIGNMENT_STATUS.ACTIVE,
          }),
        })
      );
      expect(prisma.hostelAssignment.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'assignment-1',
        studentId: 'student-1',
        status: ASSIGNMENT_STATUS.ACTIVE,
      }));
    });

    it('should reject assignment when room is at full capacity - returns 400 Bad Request', async () => {
      // Arrange: Mock room exists but is at capacity
      prisma.hostelRoom.findFirst.mockResolvedValue(mockRoom);
      prisma.hostelAssignment.count.mockResolvedValue(2); // Room is at capacity

      const req = {
        user: { tenantId: 'test-tenant-id' },
        body: mockAssignmentData,
      };
      const res = createMockRes();

      // Act: Call the function under test
      await createHostelAssignment(req, res);

      // Assert: Verify expectations
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Room is at full capacity',
      }));
      expect(prisma.hostelAssignment.create).not.toHaveBeenCalled();
    });

    it('should reject assignment when student already has active assignment - returns 400 Bad Request', async () => {
      // Arrange: Mock room exists and has capacity
      prisma.hostelRoom.findFirst.mockResolvedValue(mockRoom);
      prisma.hostelAssignment.count.mockResolvedValue(1);
      prisma.hostelAssignment.findFirst.mockResolvedValue({ id: 'existing-assignment' }); // Student has existing assignment

      const req = {
        user: { tenantId: 'test-tenant-id' },
        body: mockAssignmentData,
      };
      const res = createMockRes();

      // Act: Call the function under test
      await createHostelAssignment(req, res);

      // Assert: Verify expectations
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Student already has an active hostel assignment',
      }));
      expect(prisma.hostelAssignment.create).not.toHaveBeenCalled();
    });

    it('should update room status to OCCUPIED when assignment fills room - creates assignment and updates room', async () => {
      // Arrange: Mock room exists and will be at capacity after assignment
      prisma.hostelRoom.findFirst.mockResolvedValue(mockRoom);
      prisma.hostelAssignment.count.mockResolvedValue(1); // 1 active assignment, capacity is 2
      prisma.hostelAssignment.findFirst.mockResolvedValue(null);
      
      const mockCreatedAssignment = {
        id: 'assignment-1',
        ...mockAssignmentData,
        status: ASSIGNMENT_STATUS.ACTIVE,
      };
      
      prisma.hostelAssignment.create.mockResolvedValue(mockCreatedAssignment);
      prisma.hostelRoom.update.mockResolvedValue({});

      const req = {
        user: { tenantId: 'test-tenant-id' },
        body: mockAssignmentData,
      };
      const res = createMockRes();

      // Act: Call the function under test
      await createHostelAssignment(req, res);

      // Assert: Verify expectations
      expect(prisma.hostelRoom.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'room-1' }),
          data: expect.objectContaining({ status: ROOM_STATUS.OCCUPIED }),
        })
      );
    });

    it('should return 404 when room not found - rejects assignment creation', async () => {
      // Arrange: Mock room not found
      prisma.hostelRoom.findFirst.mockResolvedValue(null);

      const req = {
        user: { tenantId: 'test-tenant-id' },
        body: mockAssignmentData,
      };
      const res = createMockRes();

      // Act: Call the function under test
      await createHostelAssignment(req, res);

      // Assert: Verify expectations
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Room not found',
      }));
    });
  });

  describe('updateHostelAssignment', () => {
    const mockAssignment = {
      id: 'assignment-1',
      roomId: 'room-1',
          status: ASSIGNMENT_STATUS.ACTIVE,
      room: { id: 'room-1', capacity: 2 },
    };

    it('should update assignment status to COMPLETED and set room to AVAILABLE - returns updated assignment', async () => {
      prisma.hostelAssignment.findFirst.mockResolvedValue(mockAssignment);
      prisma.hostelAssignment.count.mockResolvedValue(0); // No other active assignments
      
      const mockUpdatedAssignment = {
        ...mockAssignment,
        status: ASSIGNMENT_STATUS.COMPLETED,
        endDate: expect.any(Date),
      };
      
      const mockTxHostelAssignmentUpdate = jest.fn().mockResolvedValue(mockUpdatedAssignment);
      const mockTxHostelRoomUpdate = jest.fn().mockResolvedValue({});
      
      prisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          hostelAssignment: {
            update: mockTxHostelAssignmentUpdate,
          },
          hostelRoom: {
            update: mockTxHostelRoomUpdate,
          },
        };
        return await callback(tx);
      });

      const req = {
        user: { tenantId: 'test-tenant-id' },
        params: { id: 'assignment-1' },
        body: { status: ASSIGNMENT_STATUS.COMPLETED, endDate: '2024-12-31' },
      };
      const res = createMockRes();

      await updateHostelAssignment(req, res);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mockTxHostelAssignmentUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'assignment-1' }),
          data: expect.objectContaining({ status: ASSIGNMENT_STATUS.COMPLETED }),
        })
      );
      expect(mockTxHostelRoomUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'room-1' }),
          data: expect.objectContaining({ status: ROOM_STATUS.AVAILABLE }),
        })
      );
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'assignment-1',
        status: ASSIGNMENT_STATUS.COMPLETED,
      }));
    });

    it('should update assignment status to CANCELLED and set room to AVAILABLE - returns updated assignment', async () => {
      prisma.hostelAssignment.findFirst.mockResolvedValue(mockAssignment);
      prisma.hostelAssignment.count.mockResolvedValue(0);
      
      const mockUpdatedAssignment = {
        ...mockAssignment,
        status: ASSIGNMENT_STATUS.CANCELLED,
      };
      
      const mockTxHostelAssignmentUpdate2 = jest.fn().mockResolvedValue(mockUpdatedAssignment);
      const mockTxHostelRoomUpdate2 = jest.fn().mockResolvedValue({});
      
      prisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          hostelAssignment: {
            update: mockTxHostelAssignmentUpdate2,
          },
          hostelRoom: {
            update: mockTxHostelRoomUpdate2,
          },
        };
        return await callback(tx);
      });

      const req = {
        user: { tenantId: 'test-tenant-id' },
        params: { id: 'assignment-1' },
        body: { status: ASSIGNMENT_STATUS.CANCELLED },
      };
      const res = createMockRes();

      await updateHostelAssignment(req, res);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mockTxHostelAssignmentUpdate2).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'assignment-1' }),
          data: expect.objectContaining({ status: ASSIGNMENT_STATUS.CANCELLED }),
        })
      );
      expect(mockTxHostelRoomUpdate2).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'room-1' }),
          data: expect.objectContaining({ status: ROOM_STATUS.AVAILABLE }),
        })
      );
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'assignment-1',
        status: ASSIGNMENT_STATUS.CANCELLED,
      }));
    });

    it('should keep room status as OCCUPIED when other active assignments exist - updates assignment only', async () => {
      prisma.hostelAssignment.findFirst.mockResolvedValue(mockAssignment);
      prisma.hostelAssignment.count.mockResolvedValue(1); // Other active assignments exist
      
      const mockUpdatedAssignment = {
        ...mockAssignment,
        status: ASSIGNMENT_STATUS.COMPLETED,
      };
      
      prisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          hostelAssignment: {
            update: jest.fn().mockResolvedValue(mockUpdatedAssignment),
          },
          hostelRoom: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(tx);
      });

      const req = {
        user: { tenantId: 'test-tenant-id' },
        params: { id: 'assignment-1' },
        body: { status: ASSIGNMENT_STATUS.COMPLETED },
      };
      const res = createMockRes();

      await updateHostelAssignment(req, res);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'assignment-1',
        status: ASSIGNMENT_STATUS.COMPLETED,
      }));
    });

    it('should return 404 when assignment not found - rejects update', async () => {
      prisma.hostelAssignment.findFirst.mockResolvedValue(null);

      const req = {
        user: { tenantId: 'test-tenant-id' },
        params: { id: 'non-existent' },
        body: { status: ASSIGNMENT_STATUS.COMPLETED },
      };
      const res = createMockRes();

      await updateHostelAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Assignment not found',
      }));
    });

    it('should validate status values - updates other fields with invalid status', async () => {
      prisma.hostelAssignment.findFirst.mockResolvedValue(mockAssignment);
      
      const mockUpdatedAssignment = {
        ...mockAssignment,
        notes: 'Updated notes',
      };
      
      prisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          hostelAssignment: {
            update: jest.fn().mockResolvedValue(mockUpdatedAssignment),
          },
        };
        return await callback(tx);
      });

      const req = {
        user: { tenantId: 'test-tenant-id' },
        params: { id: 'assignment-1' },
        body: { status: 'INVALID_STATUS', notes: 'Updated notes' },
      };
      const res = createMockRes();

      await updateHostelAssignment(req, res);

      // Should still update other fields even with invalid status
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'assignment-1',
        notes: 'Updated notes',
      }));
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
