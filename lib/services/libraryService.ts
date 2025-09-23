interface LibraryStats {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  overdueBooks: number;
  activeReservations: number;
  totalLibraryUsers: number;
  unpaidFines: {
    count: number;
    amount: number;
  };
  popularBooks: Array<{
    title: string;
    author: string;
    borrowCount: number;
  }>;
}

interface Book {
  id: string;
  isbn?: string;
  title: string;
  subtitle?: string;
  author: string;
  coAuthor?: string;
  publisher?: string;
  publishedYear?: number;
  edition?: string;
  language: string;
  pages?: number;
  genre?: string;
  category: string;
  subCategory?: string;
  classification?: string;
  description?: string;
  location?: string;
  barcode?: string;
  totalCopies: number;
  availableCopies: number;
  condition: string;
  status: string;
  acquisitionDate?: string;
  acquisitionType?: string;
  price?: number;
  digitalResourceUrl?: string;
  coverImageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Circulation {
  id: string;
  book: {
    title: string;
    author: string;
    isbn?: string;
    barcode?: string;
  };
  user: {
    name: string;
    email: string;
  };
  userType: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  renewalCount: number;
  maxRenewals: number;
  status: string;
  fineAmount: number;
  finePaid: boolean;
  isOverdue: boolean;
  daysOverdue: number;
  issuer?: string;
  returner?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Reservation {
  id: string;
  book: {
    title: string;
    author: string;
    isbn?: string;
    availableCopies: number;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  userType: string;
  reservationDate: string;
  expiryDate: string;
  status: string;
  priority: number;
  notified: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateBookData {
  isbn?: string;
  title: string;
  subtitle?: string;
  author: string;
  coAuthor?: string;
  publisher?: string;
  publishedYear?: number;
  edition?: string;
  language?: string;
  pages?: number;
  genre?: string;
  category: string;
  subCategory?: string;
  classification?: string;
  description?: string;
  location?: string;
  barcode?: string;
  totalCopies?: number;
  availableCopies?: number;
  condition?: string;
  status?: string;
  acquisitionDate?: string;
  acquisitionType?: string;
  price?: number;
  digitalResourceUrl?: string;
  coverImageUrl?: string;
  notes?: string;
}

interface UpdateBookData extends Partial<CreateBookData> {}

interface IssueBookData {
  bookId: string;
  userId: string;
  userType: 'STUDENT' | 'TEACHER' | 'STAFF';
  dueDate?: string;
  notes?: string;
}

interface ReturnBookData {
  condition?: string;
  notes?: string;
  fineAmount?: number;
}

interface RenewBookData {
  newDueDate?: string;
  notes?: string;
}

interface CreateReservationData {
  bookId: string;
  userId: string;
  userType: 'STUDENT' | 'TEACHER' | 'STAFF';
  notes?: string;
}

interface BooksQuery {
  search?: string;
  category?: string;
  author?: string;
  status?: string;
  condition?: string;
  available?: string;
  page?: number;
  limit?: number;
}

interface CirculationsQuery {
  userId?: string;
  bookId?: string;
  status?: string;
  userType?: string;
  overdue?: string;
  page?: number;
  limit?: number;
}

interface ReservationsQuery {
  userId?: string;
  bookId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class LibraryService {
  private baseUrl = '/api/library';

  // Statistics
  async getStats(): Promise<LibraryStats | null> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      const result: ApiResponse<LibraryStats> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch library statistics');
      }

      return result.data || null;
    } catch (error) {
      console.error('Error fetching library stats:', error);
      throw error;
    }
  }

  // Book Management
  async getBooks(query: BooksQuery = {}): Promise<{ books: Book[], pagination: any } | null> {
    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      const result: ApiResponse<Book[]> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch books');
      }

      return {
        books: result.data || [],
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  }

  async getBookById(id: string): Promise<Book | null> {
    try {
      const response = await fetch(`${this.baseUrl}/books/${id}`);
      const result: ApiResponse<Book> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch book');
      }

      return result.data || null;
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  }

  async createBook(data: CreateBookData): Promise<Book | null> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<Book> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create book');
      }

      return result.data || null;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  }

  async updateBook(id: string, data: UpdateBookData): Promise<Book | null> {
    try {
      const response = await fetch(`${this.baseUrl}/books/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<Book> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update book');
      }

      return result.data || null;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  }

  async deleteBook(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/books/${id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<void> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete book');
      }

      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  }

  // Circulation Management
  async getCirculations(query: CirculationsQuery = {}): Promise<{ circulations: Circulation[], pagination: any } | null> {
    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/circulations?${params}`);
      const result: ApiResponse<Circulation[]> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch circulations');
      }

      return {
        circulations: result.data || [],
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Error fetching circulations:', error);
      throw error;
    }
  }

  async issueBook(data: IssueBookData): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/circulations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<any> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to issue book');
      }

      return result.data;
    } catch (error) {
      console.error('Error issuing book:', error);
      throw error;
    }
  }

  async returnBook(circulationId: string, data: ReturnBookData = {}): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/circulations/${circulationId}/return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<any> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to return book');
      }

      return result.data;
    } catch (error) {
      console.error('Error returning book:', error);
      throw error;
    }
  }

  async renewBook(circulationId: string, data: RenewBookData = {}): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/circulations/${circulationId}/renew`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<any> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to renew book');
      }

      return result.data;
    } catch (error) {
      console.error('Error renewing book:', error);
      throw error;
    }
  }

  // Reservation Management
  async getReservations(query: ReservationsQuery = {}): Promise<{ reservations: Reservation[], pagination: any } | null> {
    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/reservations?${params}`);
      const result: ApiResponse<Reservation[]> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch reservations');
      }

      return {
        reservations: result.data || [],
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  }

  async createReservation(data: CreateReservationData): Promise<Reservation | null> {
    try {
      const response = await fetch(`${this.baseUrl}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<Reservation> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create reservation');
      }

      return result.data || null;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }

  async cancelReservation(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/reservations/${id}/cancel`, {
        method: 'PUT',
      });

      const result: ApiResponse<void> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to cancel reservation');
      }

      return true;
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      throw error;
    }
  }

  // Utility Methods
  async searchBooks(searchTerm: string): Promise<Book[]> {
    try {
      const result = await this.getBooks({ search: searchTerm, limit: 50 });
      return result?.books || [];
    } catch (error) {
      console.error('Error searching books:', error);
      return [];
    }
  }

  async getOverdueBooks(): Promise<Circulation[]> {
    try {
      const result = await this.getCirculations({ overdue: 'true', limit: 100 });
      return result?.circulations || [];
    } catch (error) {
      console.error('Error fetching overdue books:', error);
      return [];
    }
  }

  async getPopularBooks(): Promise<Book[]> {
    try {
      const stats = await this.getStats();
      if (!stats?.popularBooks) return [];

      // Get detailed book information for popular books
      const bookPromises = stats.popularBooks.map(async (popularBook) => {
        const books = await this.searchBooks(popularBook.title);
        return books.find(book =>
          book.title === popularBook.title && book.author === popularBook.author
        );
      });

      const books = await Promise.all(bookPromises);
      return books.filter(book => book !== undefined) as Book[];
    } catch (error) {
      console.error('Error fetching popular books:', error);
      return [];
    }
  }

  // Export functionality
  async exportBooks(format: 'csv' | 'excel' = 'csv'): Promise<Blob | null> {
    try {
      const result = await this.getBooks({ limit: 10000 }); // Get all books
      if (!result?.books) return null;

      if (format === 'csv') {
        return this.convertToCsv(result.books);
      } else {
        // Excel export would require additional library
        throw new Error('Excel export not yet implemented');
      }
    } catch (error) {
      console.error('Error exporting books:', error);
      throw error;
    }
  }

  private convertToCsv(books: Book[]): Blob {
    const headers = [
      'Title', 'Author', 'ISBN', 'Category', 'Publisher', 'Published Year',
      'Total Copies', 'Available Copies', 'Status', 'Condition', 'Location'
    ];

    const csvContent = [
      headers.join(','),
      ...books.map(book => [
        this.escapeCsv(book.title),
        this.escapeCsv(book.author),
        this.escapeCsv(book.isbn || ''),
        this.escapeCsv(book.category),
        this.escapeCsv(book.publisher || ''),
        book.publishedYear || '',
        book.totalCopies,
        book.availableCopies,
        book.status,
        book.condition,
        this.escapeCsv(book.location || '')
      ].join(','))
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  private escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

export const libraryService = new LibraryService();
export type { LibraryStats, Book, Circulation, Reservation, CreateBookData, UpdateBookData, IssueBookData };
