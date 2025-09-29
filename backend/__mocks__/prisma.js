// Mock Prisma for testing
module.exports = {
  hostelRoom: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  hostelAssignment: {
    count: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};
