/**
 * Wrapper for async controller functions to handle errors automatically.
 * The provided function should be an async function or return a promise.
 * Any errors thrown will be caught and passed to the next error handling middleware.
 * 
 * @param {Function} fn - Async function or function that returns a promise
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Express error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Prisma errors
  if (err.code === 'P2002') {
    // Unique constraint violation
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'P2025') {
    // Record not found
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  if (err.code === 'P2003') {
    // Foreign key constraint violation
    const message = 'Invalid reference to related resource';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'P2014') {
    // Required relation violation
    const message = 'Required relation is missing';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'P2016') {
    // Query interpretation error
    const message = 'Invalid query parameters';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'P2021') {
    // Table does not exist
    const message = 'Database table not found';
    error = { message, statusCode: 500 };
  }

  if (err.code === 'P2022') {
    // Column does not exist
    const message = 'Database column not found';
    error = { message, statusCode: 500 };
  }

  // Prisma validation errors
  if (err.name === 'PrismaClientValidationError') {
    const message = 'Invalid data provided';
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  asyncHandler,
  errorHandler
};
