const { PrismaClient } = require('@prisma/client');

// Create a single PrismaClient instance to be shared across the application
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Handle graceful shutdown with error handling and timeout fallback
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Add timeout fallback to force process exit if disconnect hangs
    const disconnectPromise = prisma.$disconnect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Disconnect timeout')), 10000)
    );
    
    await Promise.race([disconnectPromise, timeoutPromise]);
    console.log('Prisma disconnected successfully');
  } catch (error) {
    console.error('Error during Prisma disconnect:', error);
  } finally {
    if (signal !== 'beforeExit') {
      process.exit(0);
    }
  }
};

// Use process.once to avoid multiple triggers
process.once('beforeExit', () => gracefulShutdown('beforeExit'));
process.once('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Add handlers for uncaughtException and unhandledRejection events
process.once('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.once('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = prisma;
