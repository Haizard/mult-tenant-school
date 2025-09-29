"use client";

import { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaExchangeAlt, FaUser, FaBook, FaSearch } from 'react-icons/fa';
import { MdLibraryBooks, MdAssignmentReturn } from 'react-icons/md';
import { libraryService } from '../../../lib/services/libraryService';

// Interfaces
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  availableCopies: number;
}

interface Circulation {
  id: string;
  book: { title: string; author: string; isbn?: string; };
  user: { name: string; email: string; };
  dueDate: string;
  status: string;
}

interface IssueReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionCompleted: () => void;
  book: Book | null; // Accept a pre-selected book
}

export default function IssueReturnModal({ isOpen, onClose, onActionCompleted, book }: IssueReturnModalProps) {
  const [activeTab, setActiveTab] = useState<'issue' | 'return'>('issue');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Issue Book State
  const [bookSearch, setBookSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(book);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [issueNotes, setIssueNotes] = useState('');
  const [userType, setUserType] = useState<'STUDENT' | 'TEACHER' | 'STAFF'>('STUDENT');

  // Return Book State
  const [circulationSearch, setCirculationSearch] = useState('');
  const [selectedCirculation, setSelectedCirculation] = useState<Circulation | null>(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [bookCondition, setBookCondition] = useState('GOOD');
  const [fineAmount, setFineAmount] = useState('');

  // Search Results
  const [bookResults, setBookResults] = useState<Book[]>([]);
  const [userResults, setUserResults] = useState<User[]>([]);
  const [circulationResults, setCirculationResults] = useState<Circulation[]>([]);

  useEffect(() => {
    if (book) {
      setSelectedBook(book);
      setActiveTab('issue');
    }
  }, [book]);

  useEffect(() => {
    if (isOpen) {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 14);
      setDueDate(defaultDueDate.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const searchBooks = useCallback(async () => {
    if (bookSearch.trim().length > 2) {
      const results = await libraryService.searchBooks(bookSearch);
      setBookResults(results.filter(b => b.availableCopies > 0));
    } else {
      setBookResults([]);
    }
  }, [bookSearch]);

  const searchUsers = useCallback(async () => {
    if (userSearch.trim().length > 2) {
      try {
        const results = await libraryService.searchUsers(userSearch, userType);
        setUserResults(results || []);
      } catch (error) {
        console.error('Error searching users:', error);
        setUserResults([]);
      }
    } else {
      setUserResults([]);
    }
  }, [userSearch, userType]);

  const searchCirculations = useCallback(async () => {
    if (circulationSearch.trim().length > 2) {
      try {
        const result = await libraryService.getCirculations({ status: 'BORROWED', search: circulationSearch, limit: 10 });
        if (result && result.success) {
          setCirculationResults(result.data || []);
        } else {
          setCirculationResults([]);
        }
      } catch (error) {
        console.error('Error searching circulations:', error);
        setCirculationResults([]);
      }
    } else {
      setCirculationResults([]);
    }
  }, [circulationSearch]);

  useEffect(() => {
    const debounceTimer = setTimeout(searchBooks, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchBooks]);

  useEffect(() => {
    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchUsers]);

  useEffect(() => {
    const debounceTimer = setTimeout(searchCirculations, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchCirculations]);

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !selectedUser) {
      setError('Please select both a book and a user');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await libraryService.issueBook({
        bookId: selectedBook.id,
        userId: selectedUser.id,
        userType,
        dueDate,
        notes: issueNotes
      });
      setSuccess(`Book issued to ${selectedUser.firstName}`);
      onActionCompleted();
      setTimeout(handleClose, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCirculation) {
      setError('Please select a borrowed book to return');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await libraryService.returnBook(selectedCirculation.id, {
        condition: bookCondition,
        notes: returnNotes,
        fineAmount: fineAmount ? parseFloat(fineAmount) : undefined
      });
      setSuccess(`Book returned successfully.`);
      onActionCompleted();
      setTimeout(handleClose, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to return book');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveTab('issue');
    setError(null);
    setSuccess(null);
    setSelectedBook(null);
    setSelectedUser(null);
    setSelectedCirculation(null);
    setBookSearch('');
    setUserSearch('');
    setCirculationSearch('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Issue & Return Books</h2>
          <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-lg"><FaTimes /></button>
        </div>

        <div className="flex bg-gray-50 border-b">
          <button onClick={() => setActiveTab('issue')} className={`flex-1 px-6 py-4 text-center font-medium ${activeTab === 'issue' ? 'bg-white text-green-600 border-b-2 border-green-600' : 'text-gray-600'}`}>Issue Book</button>
          <button onClick={() => setActiveTab('return')} className={`flex-1 px-6 py-4 text-center font-medium ${activeTab === 'return' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}>Return Book</button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}

          {activeTab === 'issue' && (
            <form onSubmit={handleIssueBook} className="space-y-4">
              {!book && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Book</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input type="text" value={bookSearch} onChange={(e) => setBookSearch(e.target.value)} placeholder="Search by title, author, or ISBN..." className="w-full pl-10 p-2 border rounded-lg" />
                  </div>
                  {bookResults.length > 0 && (
                    <div className="border rounded-lg mt-2 max-h-40 overflow-y-auto">
                      {bookResults.map(b => (
                        <div key={b.id} onClick={() => { setSelectedBook(b); setBookSearch(''); setBookResults([]); }} className="p-2 hover:bg-gray-100 cursor-pointer">{b.title} by {b.author}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {selectedBook && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-semibold">{selectedBook.title}</p>
                  <p className="text-sm">by {selectedBook.author}</p>
                  <p className="text-sm text-green-600">{selectedBook.availableCopies} available</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search User</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 p-2 border rounded-lg" />
                </div>
                {userResults && userResults.length > 0 && (
                  <div className="border rounded-lg mt-2 max-h-40 overflow-y-auto">
                    {userResults.map(u => (
                      <div key={u.id} onClick={() => { setSelectedUser(u); setUserSearch(''); setUserResults([]); }} className="p-2 hover:bg-gray-100 cursor-pointer">{u.firstName} {u.lastName} ({u.email})</div>
                    ))}
                  </div>
                )}
              </div>
              {selectedUser && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
              )}

              <div className="flex justify-end pt-4"><button type="submit" disabled={loading || !selectedBook || !selectedUser} className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400">Issue Book</button></div>
            </form>
          )}

          {activeTab === 'return' && (
            <form onSubmit={handleReturnBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Borrowed Book</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input type="text" value={circulationSearch} onChange={(e) => setCirculationSearch(e.target.value)} placeholder="Search by book title, user name, or ISBN..." className="w-full pl-10 p-2 border rounded-lg" />
                </div>
                {circulationResults && circulationResults.length > 0 && (
                  <div className="border rounded-lg mt-2 max-h-40 overflow-y-auto">
                    {circulationResults.map(c => (
                      <div key={c.id} onClick={() => { setSelectedCirculation(c); setCirculationSearch(''); setCirculationResults([]); }} className="p-2 hover:bg-gray-100 cursor-pointer">
                        <p className="font-semibold">{c.book.title}</p>
                        <p className="text-sm">Borrowed by: {c.user.name}</p>
                        <p className={`text-sm ${new Date(c.dueDate) < new Date() ? 'text-red-500' : ''}`}>Due: {new Date(c.dueDate).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedCirculation && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-semibold">{selectedCirculation.book.title}</p>
                  <p className="text-sm">Borrowed by: {selectedCirculation.user.name}</p>
                  <p className={`text-sm ${new Date(selectedCirculation.dueDate) < new Date() ? 'text-red-500' : ''}`}>Due: {new Date(selectedCirculation.dueDate).toLocaleDateString()}</p>
                </div>
              )}

              {selectedCirculation && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Book Condition</label>
                      <select value={bookCondition} onChange={(e) => setBookCondition(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="GOOD">Good</option>
                        <option value="FAIR">Fair</option>
                        <option value="POOR">Poor</option>
                        <option value="DAMAGED">Damaged</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fine Amount (if any)</label>
                      <input type="number" value={fineAmount} onChange={(e) => setFineAmount(e.target.value)} step="0.01" min="0" placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Return Notes</label>
                    <textarea value={returnNotes} onChange={(e) => setReturnNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Notes on book condition, etc."></textarea>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4"><button type="submit" disabled={loading || !selectedCirculation} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400">Return Book</button></div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
