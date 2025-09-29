import { apiService } from '../../app/lib/api';

// NOTE: All interfaces are simplified for this service file.
// The full interfaces are in the component files.

export interface CreateBookData {
  title: string;
  author: string;
  category: string;
  [key: string]: any;
}

export interface IssueBookData {
  bookId: string;
  userId: string;
  userType: 'STUDENT' | 'TEACHER' | 'STAFF';
  dueDate: string;
  notes?: string;
}

export interface ReturnBookData {
  condition: string;
  notes?: string;
  fineAmount?: number;
}

class LibraryService {
  async getStats() {
    const response = await apiService.get("/library/stats");
    return response.data;
  }

  async getBooks(query: any) {
    const params = new URLSearchParams(query).toString();
    const response = await apiService.get(`/library/books?${params}`);
    return response;
  }

  async createBook(data: CreateBookData) {
    const response = await apiService.post("/library/books", data);
    return response.data;
  }

  async searchBooks(searchTerm: string) {
    const response = await apiService.get(`/library/books?search=${searchTerm}&limit=50`);
    return response.data;
  }

  async searchUsers(searchTerm: string, userType: string) {
    const response = await apiService.get(`/library/users/search?search=${searchTerm}&userType=${userType}`);
    return response.data;
  }

  async getCirculations(query: any) {
    const params = new URLSearchParams(query).toString();
    const response = await apiService.get(`/library/circulations?${params}`);
    return response;
  }

  async renewBook(circulationId: string, data: { newDueDate?: string; notes?: string }) {
    const response = await apiService.put(`/library/circulations/${circulationId}/renew`, data);
    return response.data;
  }

  async getReservations(query: any) {
    const params = new URLSearchParams(query).toString();
    const response = await apiService.get(`/library/reservations?${params}`);
    return response;
  }

  async createReservation(data: { bookId: string; userId: string; userType: string; expiryDate?: string; notes?: string }) {
    const response = await apiService.post("/library/reservations", data);
    return response.data;
  }

  async cancelReservation(reservationId: string, reason?: string) {
    const response = await apiService.put(`/library/reservations/${reservationId}/cancel`, { reason });
    return response.data;
  }

  async issueBook(data: IssueBookData) {
    const response = await apiService.post("/library/circulations/issue", data);
    return response.data;
  }

  async returnBook(circulationId: string, data: ReturnBookData) {
    const response = await apiService.put(`/library/circulations/${circulationId}/return`, data);
    return response.data;
  }
}

export const libraryService = new LibraryService();
