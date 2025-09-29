const express = require('express');
const router = express.Router();
const { authenticateToken, authorize, ensureTenantAccess } = require('../middleware/auth');
const {
  // Book management
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,

  // Circulation management
  getCirculations,
  issueBook,
  returnBook,
  renewBook,

  // Reservation management
  getReservations,
  createReservation,
  cancelReservation,

  // Statistics
  getLibraryStats,

  // User Search
  searchUsers
} = require('../controllers/libraryController');

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(ensureTenantAccess);

// User Search Route
router.get('/users/search', 
  authorize(['library:manage']), // Or a more specific permission if you prefer
  searchUsers
);

// Book Management Routes

// GET /api/library/books - Get all books
router.get('/books',
  authorize(['library:read', 'library:manage']),
  getBooks
);

// GET /api/library/books/:id - Get single book
router.get('/books/:id',
  authorize(['library:read', 'library:manage']),
  getBookById
);

// POST /api/library/books - Create new book
router.post('/books',
  authorize(['library:create', 'library:manage']),
  createBook
);

// PUT /api/library/books/:id - Update book
router.put('/books/:id',
  authorize(['library:update', 'library:manage']),
  updateBook
);

// DELETE /api/library/books/:id - Delete book
router.delete('/books/:id',
  authorize(['library:delete', 'library:manage']),
  deleteBook
);

// Circulation Management Routes

// GET /api/library/circulations - Get circulation records
router.get('/circulations',
  authorize(['library:read', 'library:manage']),
  getCirculations
);

// POST /api/library/circulations/issue - Issue book to user
router.post('/circulations/issue',
  authorize(['library:create', 'library:manage']),
  issueBook
);

// PUT /api/library/circulations/:id/return - Return book
router.put('/circulations/:id/return',
  authorize(['library:update', 'library:manage']),
  returnBook
);

// PUT /api/library/circulations/:id/renew - Renew book
router.put('/circulations/:id/renew',
  authorize(['library:update', 'library:manage']),
  renewBook
);

// Reservation Management Routes

// GET /api/library/reservations - Get reservation records
router.get('/reservations',
  authorize(['library:read', 'library:manage']),
  getReservations
);

// POST /api/library/reservations - Create reservation
router.post('/reservations',
  authorize(['library:create', 'library:manage']),
  createReservation
);

// PUT /api/library/reservations/:id/cancel - Cancel reservation
router.put('/reservations/:id/cancel',
  authorize(['library:update', 'library:manage']),
  cancelReservation
);

// Statistics and Reports Routes

// GET /api/library/stats - Get library statistics
router.get('/stats',
  authorize(['library:read', 'library:manage']),
  getLibraryStats
);

module.exports = router;
