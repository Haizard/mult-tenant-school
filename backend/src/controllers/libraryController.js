const { PrismaClient } = require('@prisma/client');
const { addDays } = require('date-fns');
const prisma = new PrismaClient();

const searchUsers = async (req, res) => {
  try {
    const { tenantId } = req;
    const { search, userType } = req.query;
    if (!search || search.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }
    const where = {
      tenantId,
      OR: [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ],
    };
    if (userType === 'STUDENT') {
      where.student = { isNot: null };
    } else if (userType === 'TEACHER') {
      where.teacher = { isNot: null };
    }
    const users = await prisma.user.findMany({
      where,
      select: { id: true, firstName: true, lastName: true, email: true },
      take: 10,
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ success: false, message: `Backend Error: ${error.message}`, error: error });
  }
};

const getCirculations = async (req, res) => {
  try {
    const { tenantId } = req;
    const { search, page = 1, limit = 10 } = req.query;
    const where = {
      tenantId,
      status: 'BORROWED',
      ...(search && {
        OR: [
          { book: { title: { contains: search } } },
          { user: { firstName: { contains: search } } },
          { user: { lastName: { contains: search } } },
        ],
      }),
    };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const circulations = await prisma.bookCirculation.findMany({
      where,
      include: { book: { select: { title: true, author: true } }, user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { borrowDate: 'desc' },
      skip,
      take,
    });
    const totalCount = await prisma.bookCirculation.count({ where });
    const formattedCirculations = circulations.map(c => ({ ...c, user: { name: `${c.user.firstName} ${c.user.lastName}`, email: c.user.email } }));
    res.json({ success: true, data: formattedCirculations, pagination: { page: parseInt(page), limit: parseInt(limit), total: totalCount, pages: Math.ceil(totalCount / parseInt(limit)) } });
  } catch (error) {
    console.error('CRITICAL ERROR in getCirculations:', error);
    res.status(500).json({ success: false, message: `Backend Error: ${error.message}`, error: error });
  }
};

const getLibraryStats = async (req, res) => {
  try {
    const { tenantId } = req;
    const stats = await prisma.$transaction(async (tx) => {
      const totalBooks = await tx.book.count({ where: { tenantId } });
      const availableBooks = await tx.book.aggregate({ where: { tenantId }, _sum: { availableCopies: true } });
      const borrowedBooks = await tx.bookCirculation.count({ where: { tenantId, status: 'BORROWED' } });
      const overdueBooks = await tx.bookCirculation.count({ where: { tenantId, status: 'BORROWED', dueDate: { lt: new Date() } } });
      const activeReservations = await tx.bookReservation.count({ where: { tenantId, status: 'ACTIVE' } });
      const totalLibraryUsers = await tx.libraryUser.count({ where: { tenantId } });
      const unpaidFines = await tx.libraryFine.aggregate({ where: { tenantId, status: 'UNPAID' }, _sum: { amount: true }, _count: true });
      const popularBooks = await tx.bookCirculation.groupBy({ by: ['bookId'], where: { tenantId }, _count: { bookId: true }, orderBy: { _count: { bookId: 'desc' } }, take: 5 });
      const popularBooksWithDetails = await Promise.all(popularBooks.map(async (item) => {
        const book = await tx.book.findUnique({ where: { id: item.bookId }, select: { title: true, author: true } });
        return { ...book, borrowCount: item._count.bookId };
      }));
      return { totalBooks, availableBooks: availableBooks._sum.availableCopies || 0, borrowedBooks, overdueBooks, activeReservations, totalLibraryUsers, unpaidFines: { count: unpaidFines._count, amount: unpaidFines._sum.amount || 0 }, popularBooks: popularBooksWithDetails };
    });
    res.json({ success: true, data: stats });
  } catch (error) {
    // **MODIFICATION: Send the detailed error message to the frontend**
    console.error('CRITICAL ERROR in getLibraryStats:', error);
    res.status(500).json({
      success: false,
      message: `Backend Error: ${error.message}`,
      error: error,
    });
  }
};

const getBooks = async (req, res) => {
  try {
    const { tenantId } = req;
    const { search, category, author, status, condition, available, page = 1, limit = 10 } = req.query;
    const where = {
      tenantId,
      ...(search && { OR: [{ title: { contains: search } }, { author: { contains: search } }] }),
      ...(category && { category }),
      ...(author && { author: { contains: author } }),
      ...(status && { status }),
      ...(condition && { condition }),
      ...(available === 'true' && { availableCopies: { gt: 0 } })
    };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const books = await prisma.book.findMany({
      where,
      include: { _count: { select: { circulations: { where: { status: 'BORROWED' } }, reservations: { where: { status: 'ACTIVE' } } } } },
      orderBy: [{ title: 'asc' }],
      skip,
      take
    });
    const totalCount = await prisma.book.count({ where });
    const formattedBooks = books.map(book => ({ ...book, currentBorrowed: book._count.circulations, activeReservations: book._count.reservations }));
    res.json({ success: true, data: formattedBooks, pagination: { page: parseInt(page), limit: parseInt(limit), total: totalCount, pages: Math.ceil(totalCount / parseInt(limit)) } });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch books', error: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;
    const book = await prisma.book.findFirst({ where: { id, tenantId }, include: { circulations: { include: { user: { select: { firstName: true, lastName: true, email: true } } }, orderBy: { borrowDate: 'desc' }, take: 10 }, reservations: { where: { status: 'ACTIVE' }, include: { user: { select: { firstName: true, lastName: true, email: true } } }, orderBy: { reservationDate: 'asc' } } } });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.json({ success: true, data: book });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch book', error: error.message });
  }
};

const createBook = async (req, res) => {
  try {
    const { tenantId, user } = req;
    const bookData = req.body;
    if (!bookData.title || !bookData.author || !bookData.category) {
      return res.status(400).json({ success: false, message: 'Title, author, and category are required' });
    }
    if (bookData.isbn) {
      const existingBook = await prisma.book.findFirst({ where: { tenantId, isbn: bookData.isbn } });
      if (existingBook) {
        return res.status(400).json({ success: false, message: 'A book with this ISBN already exists' });
      }
    }
    const book = await prisma.book.create({ data: { tenantId, ...bookData, createdBy: user.id } });
    res.status(201).json({ success: true, message: 'Book created successfully', data: book });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ success: false, message: 'Failed to create book', error: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const { tenantId, user } = req;
    const { id } = req.params;
    const updateData = req.body;
    const existingBook = await prisma.book.findFirst({ where: { id, tenantId } });
    if (!existingBook) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    const updatedBook = await prisma.book.update({ where: { id }, data: { ...updateData, updatedBy: user.id, updatedAt: new Date() } });
    res.json({ success: true, message: 'Book updated successfully', data: updatedBook });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ success: false, message: 'Failed to update book', error: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { tenantId } = req;
    const { id } = req.params;
    const existingBook = await prisma.book.findFirst({ where: { id, tenantId } });
    if (!existingBook) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    const activeCirculations = await prisma.bookCirculation.count({ where: { bookId: id, status: 'BORROWED' } });
    if (activeCirculations > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete book with active circulations' });
    }
    await prisma.book.delete({ where: { id } });
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ success: false, message: 'Failed to delete book', error: error.message });
  }
};

const issueBook = async (req, res) => {
  try {
    const { tenantId, user } = req;
    const { bookId, userId, userType, dueDate, notes } = req.body;
    if (!bookId || !userId) {
      return res.status(400).json({ success: false, message: 'Book and user are required' });
    }
    const result = await prisma.$transaction(async (tx) => {
      const book = await tx.book.findFirst({ where: { id: bookId, tenantId } });
      if (!book) throw new Error('Book not found');
      if (book.availableCopies <= 0) throw new Error('Book not available');
      const circulation = await tx.bookCirculation.create({ data: { tenantId, bookId, userId, userType: userType || 'STUDENT', dueDate: dueDate ? new Date(dueDate) : addDays(new Date(), 14), issuedBy: user.id, notes } });
      await tx.book.update({ where: { id: bookId }, data: { availableCopies: { decrement: 1 } } });
      return circulation;
    });
    res.status(201).json({ success: true, message: 'Book issued successfully', data: result });
  } catch (error) {
    console.error('Error issuing book:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to issue book' });
  }
};

const returnBook = async (req, res) => {
  try {
    const { tenantId, user } = req;
    const { id } = req.params;
    const { condition, notes } = req.body;
    const result = await prisma.$transaction(async (tx) => {
      const circulation = await tx.bookCirculation.findFirst({ where: { id, tenantId, status: 'BORROWED' } });
      if (!circulation) throw new Error('Circulation record not found');
      const updatedCirculation = await tx.bookCirculation.update({ where: { id }, data: { returnDate: new Date(), status: 'RETURNED', returnedBy: user.id, notes } });
      await tx.book.update({ where: { id: circulation.bookId }, data: { availableCopies: { increment: 1 }, ...(condition && { condition }) } });
      return updatedCirculation;
    });
    res.json({ success: true, message: 'Book returned successfully', data: result });
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to return book' });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCirculations,
  issueBook,
  returnBook,
  getLibraryStats,
  searchUsers,
  renewBook: async (req, res) => {
    try {
      const { tenantId, user } = req;
      const { id } = req.params;
      const { newDueDate, notes } = req.body;
      
      const result = await prisma.$transaction(async (tx) => {
        const circulation = await tx.bookCirculation.findFirst({ 
          where: { id, tenantId, status: 'BORROWED' } 
        });
        if (!circulation) throw new Error('Circulation record not found');
        if (circulation.renewalCount >= circulation.maxRenewals) {
          throw new Error('Maximum renewals exceeded');
        }
        
        const updatedCirculation = await tx.bookCirculation.update({
          where: { id },
          data: {
            dueDate: newDueDate ? new Date(newDueDate) : addDays(circulation.dueDate, 14),
            renewalCount: { increment: 1 },
            notes: notes || circulation.notes
          }
        });
        
        return updatedCirculation;
      });
      
      res.json({ success: true, message: 'Book renewed successfully', data: result });
    } catch (error) {
      console.error('Error renewing book:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to renew book' });
    }
  },
  
  getReservations: async (req, res) => {
    try {
      const { tenantId } = req;
      const { search, status, page = 1, limit = 10 } = req.query;
      
      const where = {
        tenantId,
        ...(status && { status }),
        ...(search && {
          OR: [
            { book: { title: { contains: search } } },
            { user: { firstName: { contains: search } } },
            { user: { lastName: { contains: search } } },
          ],
        }),
      };
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      
      const reservations = await prisma.bookReservation.findMany({
        where,
        include: {
          book: { select: { title: true, author: true, availableCopies: true } },
          user: { select: { firstName: true, lastName: true, email: true } }
        },
        orderBy: { reservationDate: 'desc' },
        skip,
        take,
      });
      
      const totalCount = await prisma.bookReservation.count({ where });
      const formattedReservations = reservations.map(r => ({
        ...r,
        user: { name: `${r.user.firstName} ${r.user.lastName}`, email: r.user.email }
      }));
      
      res.json({ 
        success: true, 
        data: formattedReservations, 
        pagination: { 
          page: parseInt(page), 
          limit: parseInt(limit), 
          total: totalCount, 
          pages: Math.ceil(totalCount / parseInt(limit)) 
        } 
      });
    } catch (error) {
      console.error('Error fetching reservations:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch reservations', error: error.message });
    }
  },
  
  createReservation: async (req, res) => {
    try {
      const { tenantId, user } = req;
      const { bookId, userId, userType, expiryDate, notes } = req.body;
      
      if (!bookId || !userId) {
        return res.status(400).json({ success: false, message: 'Book and user are required' });
      }
      
      const result = await prisma.$transaction(async (tx) => {
        const book = await tx.book.findFirst({ where: { id: bookId, tenantId } });
        if (!book) throw new Error('Book not found');
        if (book.availableCopies > 0) throw new Error('Book is available for immediate borrowing');
        
        const existingReservation = await tx.bookReservation.findFirst({
          where: { bookId, userId, status: 'ACTIVE' }
        });
        if (existingReservation) throw new Error('User already has an active reservation for this book');
        
        const reservation = await tx.bookReservation.create({
          data: {
            tenantId,
            bookId,
            userId,
            userType: userType || 'STUDENT',
            expiryDate: expiryDate ? new Date(expiryDate) : addDays(new Date(), 7),
            notes
          }
        });
        
        return reservation;
      });
      
      res.status(201).json({ success: true, message: 'Reservation created successfully', data: result });
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to create reservation' });
    }
  },
  
  cancelReservation: async (req, res) => {
    try {
      const { tenantId, user } = req;
      const { id } = req.params;
      const { reason } = req.body;
      
      const result = await prisma.$transaction(async (tx) => {
        const reservation = await tx.bookReservation.findFirst({
          where: { id, tenantId, status: 'ACTIVE' }
        });
        if (!reservation) throw new Error('Active reservation not found');
        
        const updatedReservation = await tx.bookReservation.update({
          where: { id },
          data: { 
            status: 'CANCELLED',
            notes: reason || reservation.notes
          }
        });
        
        return updatedReservation;
      });
      
      res.json({ success: true, message: 'Reservation cancelled successfully', data: result });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to cancel reservation' });
    }
  },
};
