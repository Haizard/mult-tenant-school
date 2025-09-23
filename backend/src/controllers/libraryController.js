const { PrismaClient } = require('@prisma/client');
const { startOfDay, parseISO, addDays, isBefore, isAfter } = require('date-fns');
const prisma = new PrismaClient();

// Book Management

// Get all books for a tenant
const getBooks = async (req, res) => {
  try {
    const { tenantId } = req;
    const {
      search,
      category,
      author,
      status,
      condition,
      available,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter conditions
    const where = {
      tenantId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
          { isbn: { contains: search, mode: 'insensitive' } },
          { publisher: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(category && { category }),
      ...(author && { author: { contains: author, mode: 'insensitive' } }),
      ...(status && { status }),
      ...(condition && { condition }),
      ...(available === 'true' && { availableCopies: { gt: 0 } })
    };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get books with related data
    const books = await prisma.book.findMany({
      where,
      include: {
        _count: {
          select: {
            circulations: {
              where: {
                status: 'BORROWED'
              }
            },
            reservations: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      },
      orderBy: [
        { title: 'asc' }
      ],
      skip,
      take
    });

    // Get total count for pagination
    const totalCount = await prisma.book.count({ where });

    // Format response data
    const formattedBooks = books.map(book => ({
      id: book.id,
      isbn: book.isbn,
      title: book.title,
      subtitle: book.subtitle,
      author: book.author,
      coAuthor: book.coAuthor,
      publisher: book.publisher,
      publishedYear: book.publishedYear,
      edition: book.edition,
      language: book.language,
      pages: book.pages,
      genre: book.genre,
      category: book.category,
      subCategory: book.subCategory,
      classification: book.classification,
      description: book.description,
      location: book.location,
      barcode: book.barcode,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      condition: book.condition,
      status: book.status,
      currentBorrowed: book._count.circulations,
      activeReservations: book._count.reservations,
      acquisitionDate: book.acquisitionDate,
      acquisitionType: book.acquisitionType,
      price: book.price,
      digitalResourceUrl: book.digitalResourceUrl,
      coverImageUrl: book.coverImageUrl,
      notes: book.notes,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt
    }));

    res.json({
      success: true,
      data: formattedBooks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch books',
      error: error.message
    });
  }
};

// Get single book by ID
const getBookById = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;

    const book = await prisma.book.findFirst({
      where: {
        id,
        tenantId
      },
      include: {
        circulations: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            borrowDate: 'desc'
          },
          take: 10
        },
        reservations: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            reservationDate: 'asc'
          }
        }
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: book
    });

  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book',
      error: error.message
    });
  }
};

// Create new book
const createBook = async (req, res) => {
  try {
    const { tenantId, user } = req;
    const bookData = req.body;

    // Validate required fields
    if (!bookData.title || !bookData.author || !bookData.category) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, and category are required'
      });
    }

    // Check for duplicate ISBN if provided
    if (bookData.isbn) {
      const existingBook = await prisma.book.findFirst({
        where: {
          tenantId,
          isbn: bookData.isbn
        }
      });

      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: 'A book with this ISBN already exists'
        });
      }
    }

    const book = await prisma.book.create({
      data: {
        tenantId,
        ...bookData,
        totalCopies: bookData.totalCopies || 1,
        availableCopies: bookData.availableCopies || bookData.totalCopies || 1,
        createdBy: user.id
      }
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });

  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create book',
      error: error.message
    });
  }
};

// Update book
const updateBook = async (req, res) => {
  try {
    const { tenantId, user } = req;
    const { id } = req.params;
    const updateData = req.body;

    // Check if book exists and belongs to tenant
    const existingBook = await prisma.book.findFirst({
      where: {
        id,
        tenantId
      }
    });

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        ...updateData,
        updatedBy: user.id,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook
    });

  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update book',
      error: error.message
    });
  }
};

// Delete book
const deleteBook = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;

    // Check if book exists and belongs to tenant
    const existingBook = await prisma.book.findFirst({
      where: {
        id,
        tenantId
      }
    });

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if book has active circulations
    const activeCirculations = await prisma.bookCirculation.count({
      where: {
        bookId: id,
        status: 'BORROWED'
      }
    });

    if (activeCirculations > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book with active circulations'
      });
    }

    await prisma.book.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete book',
      error: error.message
    });
  }
};

// Circulation Management

// Get circulation records
const getCirculations = async (req, res) => {
  try {
    const { tenantId } = req;
    const {
      userId,
      bookId,
      status,
      userType,
      overdue,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter conditions
    const where = {
      tenantId,
      ...(userId && { userId }),
      ...(bookId && { bookId }),
      ...(status && { status }),
      ...(userType && { userType }),
      ...(overdue === 'true' && {
        dueDate: { lt: new Date() },
        status: 'BORROWED'
      })
    };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const circulations = await prisma.bookCirculation.findMany({
      where,
      include: {
        book: {
          select: {
            title: true,
            author: true,
            isbn: true,
            barcode: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        issuer: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        returner: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        borrowDate: 'desc'
      },
      skip,
      take
    });

    const totalCount = await prisma.bookCirculation.count({ where });

    // Format response data
    const formattedCirculations = circulations.map(circulation => ({
      id: circulation.id,
      book: {
        title: circulation.book.title,
        author: circulation.book.author,
        isbn: circulation.book.isbn,
        barcode: circulation.book.barcode
      },
      user: {
        name: `${circulation.user.firstName} ${circulation.user.lastName}`,
        email: circulation.user.email
      },
      userType: circulation.userType,
      borrowDate: circulation.borrowDate,
      dueDate: circulation.dueDate,
      returnDate: circulation.returnDate,
      renewalCount: circulation.renewalCount,
      maxRenewals: circulation.maxRenewals,
      status: circulation.status,
      fineAmount: circulation.fineAmount,
      finePaid: circulation.finePaid,
      isOverdue: circulation.status === 'BORROWED' && isBefore(circulation.dueDate, new Date()),
      daysOverdue: circulation.status === 'BORROWED' && isBefore(circulation.dueDate, new Date())
        ? Math.ceil((new Date() - circulation.dueDate) / (1000 * 60 * 60 * 24))
        : 0,
      issuer: circulation.issuer ? `${circulation.issuer.firstName} ${circulation.issuer.lastName}` : null,
      returner: circulation.returner ? `${circulation.returner.firstName} ${circulation.returner.lastName}` : null,
      notes: circulation.notes,
      createdAt: circulation.createdAt,
      updatedAt: circulation.updatedAt
    }));

    res.json({
      success: true,
      data: formattedCirculations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching circulations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch circulation records',
      error: error.message
    });
  }
};

// Issue book to user
const issueBook = async (req, res) => {
  try {
    const { tenantId, user } = req;
    const { bookId, userId, userType, dueDate, notes } = req.body;

    if (!bookId || !userId || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Book ID, User ID, and User Type are required'
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Check if book exists and is available
      const book = await tx.book.findFirst({
        where: {
          id: bookId,
          tenantId
        }
      });

      if (!book) {
        throw new Error('Book not found');
      }

      if (book.availableCopies <= 0) {
        throw new Error('Book is not available for borrowing');
      }

      // Check if user exists in tenant
      const borrower = await tx.user.findFirst({
        where: {
          id: userId,
          tenantId
        }
      });

      if (!borrower) {
        throw new Error('User not found');
      }

      // Check if user already has this book
      const existingCirculation = await tx.bookCirculation.findFirst({
        where: {
          bookId,
          userId,
          status: 'BORROWED'
        }
      });

      if (existingCirculation) {
        throw new Error('User already has this book borrowed');
      }

      // Create circulation record
      const circulation = await tx.bookCirculation.create({
        data: {
          tenantId,
          bookId,
          userId,
          userType,
          dueDate: dueDate ? new Date(dueDate) : addDays(new Date(), 14), // Default 2 weeks
          issuedBy: user.id,
          notes
        },
        include: {
          book: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      // Update book available copies
      await tx.book.update({
        where: { id: bookId },
        data: {
          availableCopies: {
            decrement: 1
          }
        }
      });

      // Update library user's current borrowed count
      await tx.libraryUser.upsert({
        where: {
          userId
        },
        update: {
          currentBorrowed: {
            increment: 1
          }
        },
        create: {
          tenantId,
          userId,
          userType,
          libraryCardNumber: `LIB${Date.now()}`,
          currentBorrowed: 1
        }
      });

      return circulation;
    });

    res.status(201).json({
      success: true,
      message: 'Book issued successfully',
      data: {
        id: result.id,
        bookTitle: result.book.title,
        borrowerName: `${result.user.firstName} ${result.user.lastName}`,
        dueDate: result.dueDate,
        status: result.status
      }
    });

  } catch (error) {
    console.error('Error issuing book:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to issue book',
      error: error.message
    });
  }
};

// Return book
const returnBook = async (req, res) => {
  try {
    const { tenantId, user } = req;
    const { id } = req.params;
    const { condition, notes, fineAmount = 0 } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Get circulation record
      const circulation = await tx.bookCirculation.findFirst({
        where: {
          id,
          tenantId,
          status: 'BORROWED'
        },
        include: {
          book: true
        }
      });

      if (!circulation) {
        throw new Error('Circulation record not found or book already returned');
      }

      // Update circulation record
      const updatedCirculation = await tx.bookCirculation.update({
        where: { id },
        data: {
          returnDate: new Date(),
          status: 'RETURNED',
          returnedBy: user.id,
          notes,
          fineAmount: parseFloat(fineAmount) || 0
        }
      });

      // Update book available copies
      await tx.book.update({
        where: { id: circulation.bookId },
        data: {
          availableCopies: {
            increment: 1
          },
          ...(condition && { condition })
        }
      });

      // Update library user's current borrowed count
      await tx.libraryUser.update({
        where: {
          userId: circulation.userId
        },
        data: {
          currentBorrowed: {
            decrement: 1
          }
        }
      });

      // Create fine record if applicable
      if (fineAmount > 0) {
        await tx.libraryFine.create({
          data: {
            tenantId,
            circulationId: id,
            userId: circulation.userId,
            fineType: isBefore(circulation.dueDate, new Date()) ? 'OVERDUE' : 'OTHER',
            amount: parseFloat(fineAmount),
            reason: isBefore(circulation.dueDate, new Date()) ? 'Overdue return' : 'Other charges'
          }
        });
      }

      return updatedCirculation;
    });

    res.json({
      success: true,
      message: 'Book returned successfully',
      data: result
    });

  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to return book',
      error: error.message
    });
  }
};

// Renew book
const renewBook = async (req, res) => {
  try {
    const { tenantId, user } = req;
    const { id } = req.params;
    const { newDueDate, notes } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Get circulation record
      const circulation = await tx.bookCirculation.findFirst({
        where: {
          id,
          tenantId,
          status: 'BORROWED'
        }
      });

      if (!circulation) {
        throw new Error('Circulation record not found or book not currently borrowed');
      }

      // Check renewal limit
      if (circulation.renewalCount >= circulation.maxRenewals) {
        throw new Error('Maximum renewal limit reached');
      }

      // Check for active reservations
      const activeReservations = await tx.bookReservation.count({
        where: {
          bookId: circulation.bookId,
          status: 'ACTIVE'
        }
      });

      if (activeReservations > 0) {
        throw new Error('Cannot renew book with active reservations');
      }

      // Update circulation record
      const updatedCirculation = await tx.bookCirculation.update({
        where: { id },
        data: {
          dueDate: newDueDate ? new Date(newDueDate) : addDays(new Date(), 14),
          renewalCount: {
            increment: 1
          },
          notes,
          updatedAt: new Date()
        }
      });

      return updatedCirculation;
    });

    res.json({
      success: true,
      message: 'Book renewed successfully',
      data: result
    });

  } catch (error) {
    console.error('Error renewing book:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to renew book',
      error: error.message
    });
  }
};

// Reservation Management

// Get reservations
const getReservations = async (req, res) => {
  try {
    const { tenantId } = req;
    const { userId, bookId, status, page = 1, limit = 10 } = req.query;

    const where = {
      tenantId,
      ...(userId && { userId }),
      ...(bookId && { bookId }),
      ...(status && { status })
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const reservations = await prisma.bookReservation.findMany({
      where,
      include: {
        book: {
          select: {
            title: true,
            author: true,
            isbn: true,
            availableCopies: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { reservationDate: 'asc' }
      ],
      skip,
      take
    });

    const totalCount = await prisma.bookReservation.count({ where });

    res.json({
      success: true,
      data: reservations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reservations',
      error: error.message
    });
  }
};

// Create reservation
const createReservation = async (req, res) => {
  try {
    const { tenantId } = req;
    const { bookId, userId, userType, notes } = req.body;

    if (!bookId || !userId || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Book ID, User ID, and User Type are required'
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Check if book exists
      const book = await tx.book.findFirst({
        where: {
          id: bookId,
          tenantId
        }
      });

      if (!book) {
        throw new Error('Book not found');
      }

      // Check if book is available (no need for reservation if available)
      if (book.availableCopies > 0) {
        throw new Error('Book is available for immediate borrowing');
      }

      // Check if user already has reservation for this book
      const existingReservation = await tx.bookReservation.findFirst({
        where: {
          bookId,
          userId,
          status: 'ACTIVE'
        }
      });

      if (existingReservation) {
        throw new Error('User already has an active reservation for this book');
      }

      // Get next priority number
      const maxPriority = await tx.bookReservation.findFirst({
        where: {
          bookId,
          status: 'ACTIVE'
        },
        orderBy: {
          priority: 'desc'
        }
      });

      const reservation = await tx.bookReservation.create({
        data: {
          tenantId,
          bookId,
          userId,
          userType,
          expiryDate: addDays(new Date(), 7), // 7 days expiry
          priority: (maxPriority?.priority || 0) + 1,
          notes
        },
        include: {
          book: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      return reservation;
    });

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: result
    });

  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create reservation',
      error: error.message
    });
  }
};

// Cancel reservation
const cancelReservation = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;

    const reservation = await prisma.bookReservation.findFirst({
      where: {
        id,
        tenantId
      }
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    await prisma.bookReservation.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Reservation cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel reservation',
      error: error.message
    });
  }
};

// Library Statistics
const getLibraryStats = async (req, res) => {
  try {
    const { tenantId } = req;

    const stats = await prisma.$transaction(async (tx) => {
      // Total books
      const totalBooks = await tx.book.count({
        where: { tenantId }
      });

      // Available books
      const availableBooks = await tx.book.count({
        where: {
          tenantId,
          availableCopies: { gt: 0 }
        }
      });

      // Total borrowed books
      const borrowedBooks = await tx.bookCirculation.count({
        where: {
          tenantId,
          status: 'BORROWED'
        }
      });

      // Overdue books
      const overdueBooks = await tx.bookCirculation.count({
        where: {
          tenantId,
          status: 'BORROWED',
          dueDate: { lt: new Date() }
        }
      });

      // Active reservations
      const activeReservations = await tx.bookReservation.count({
        where: {
          tenantId,
          status: 'ACTIVE'
        }
      });

      // Total library users
      const totalLibraryUsers = await tx.libraryUser.count({
        where: { tenantId }
      });

      // Total unpaid fines
      const unpaidFines = await tx.libraryFine.aggregate({
        where: {
          tenantId,
          status: 'UNPAID'
        },
        _sum: {
          amount: true
        },
        _count: true
      });

      // Most popular books (top 5)
      const popularBooks = await tx.bookCirculation.groupBy({
        by: ['bookId'],
        where: { tenantId },
        _count: {
          bookId: true
        },
        orderBy: {
          _count: {
            bookId: 'desc'
          }
        },
        take: 5
      });

      // Get book details for popular books
      const popularBooksWithDetails = await Promise.all(
        popularBooks.map(async (item) => {
          const book = await tx.book.findUnique({
            where: { id: item.bookId },
            select: {
              title: true,
              author: true
            }
          });
          return {
            ...book,
            borrowCount: item._count.bookId
          };
        })
      );

      return {
        totalBooks,
        availableBooks,
        borrowedBooks,
        overdueBooks,
        activeReservations,
        totalLibraryUsers,
        unpaidFines: {
          count: unpaidFines._count,
          amount: unpaidFines._sum.amount || 0
        },
        popularBooks: popularBooksWithDetails
      };
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching library statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch library statistics',
      error: error.message
    });
  }
};

module.exports = {
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
  getLibraryStats
};
