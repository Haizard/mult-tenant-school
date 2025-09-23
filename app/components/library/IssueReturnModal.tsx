'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaExchangeAlt, FaUser, FaBook, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import { MdLibraryBooks, MdAssignmentReturn } from 'react-icons/md';
import { libraryService } from '../../../lib/services/libraryService';

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
  totalCopies: number;
}

interface Circulation {
  id: string;
  book: {
    title: string;
    author: string;
    isbn?: string;
  };
  user: {
    name: string;
    email: string;
  };
  dueDate: string;
  status: string;
  renewalCount: number;
  maxRenewals: number;
}

interface IssueReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionCompleted: () => void;
}

export default function IssueReturnModal({ isOpen, onClose, onActionCompleted }: IssueReturnModalProps) {
  const [activeTab, setActiveTab] = useState<'issue' | 'return'>('issue');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Issue Book State
  const [bookSearch, setBookSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
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
    if (isOpen) {
      // Set default due date to 2 weeks from now
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 14);
      setDueDate(defaultDueDate.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  // Search for books
  useEffect(() => {
    const searchBooks = async () => {
      if (bookSearch.trim().length > 2) {
        try {
          const results = await libraryService.searchBooks(bookSearch);
          setBookResults(results.filter(book => book.availableCopies > 0));
        } catch (error) {
          console.error('Error searching books:', error);
        }
      } else {
        setBookResults([]);
      }
    };

    const debounceTimer = setTimeout(searchBooks, 300);
    return () => clearTimeout(debounceTimer);
  }, [bookSearch]);

  // Search for circulations
  useEffect(() => {
    const searchCirculations = async () => {
      if (circulationSearch.trim().length > 2) {
        try {
          const result = await libraryService.getCirculations({
            status: 'BORROWED',
            limit: 10
          });
          if (result) {
            const filtered = result.circulations.filter(circ =>
              circ.book.title.toLowerCase().includes(circulationSearch.toLowerCase()) ||
              circ.user.name.toLowerCase().includes(circulationSearch.toLowerCase()) ||
              circ.book.isbn?.includes(circulationSearch)
            );
            setCirculationResults(filtered);
          }
        } catch (error) {
          console.error('Error searching circulations:', error);
        }
      } else {
        setCirculationResults([]);
      }
    };

    const debounceTimer = setTimeout(searchCirculations, 300);
    return () => clearTimeout(debounceTimer);
  }, [circulationSearch]);

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

      setSuccess(`Book "${selectedBook.title}" has been issued to ${selectedUser.firstName} ${selectedUser.lastName}`);
      onActionCompleted();

      // Reset form
      setSelectedBook(null);
      setSelectedUser(null);
      setBookSearch('');
      setUserSearch('');
      setIssueNotes('');

    } catch (error) {
      console.error('Error issuing book:', error);
      setError(error instanceof Error ? error.message : 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCirculation) {
      setError('Please select a circulation record');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await libraryService.returnBook(selectedCirculation.id, {
        condition: bookCondition,
        notes: returnNotes,
        fineAmount: fineAmount ? parseFloat(fineAmount) : 0
      });

      setSuccess(`Book "${selectedCirculation.book.title}" has been returned by ${selectedCirculation.user.name}`);
      onActionCompleted();

      // Reset form
      setSelectedCirculation(null);
      setCirculationSearch('');
      setReturnNotes('');
      setFineAmount('');

    } catch (error) {
      console.error('Error returning book:', error);
      setError(error instanceof Error ? error.message : 'Failed to return book');
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
    setIssueNotes('');
    setReturnNotes('');
    setFineAmount('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaExchangeAlt className="text-2xl" />
              <h2 className="text-xl font-semibold">Issue & Return Books</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50 border-b">
          <button
            onClick={() => setActiveTab('issue')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'issue'
                ? 'bg-white text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <MdLibraryBooks className="inline-block mr-2" />
            Issue Book
          </button>
          <button
            onClick={() => setActiveTab('return')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'return'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <MdAssignmentReturn className="inline-block mr-2" />
            Return Book
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {/* Issue Book Tab */}
          {activeTab === 'issue' && (
            <form onSubmit={handleIssueBook} className="space-y-6">
              {/* Book Selection */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaBook className="mr-2 text-green-600" />
                  Select Book
                </h3>

                <div className="relative mb-4">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    placeholder="Search books by title, author, or ISBN..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {bookResults.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {bookResults.map((book) => (
                      <div
                        key={book.id}
                        onClick={() => {
                          setSelectedBook(book);
                          setBookSearch('');
                          setBookResults([]);
                        }}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer transition-colors"
                      >
                        <div className="font-medium text-gray-900">{book.title}</div>
                        <div className="text-sm text-gray-600">by {book.author}</div>
                        <div className="text-sm text-green-600">
                          {book.availableCopies} of {book.totalCopies} available
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedBook && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-gray-900">{selectedBook.title}</div>
                    <div className="text-sm text-gray-600">by {selectedBook.author}</div>
                    <div className="text-sm text-green-600">
                      Available: {selectedBook.availableCopies} copies
                    </div>
                  </div>
                )}
              </div>

              {/* User Selection */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Select User
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Type
                    </label>
                    <select
                      value={userType}
                      onChange={(e) => setUserType(e.target.value as 'STUDENT' | 'TEACHER' | 'STAFF')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="STAFF">Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="relative mb-4">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {selectedUser && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </div>
                    <div className="text-sm text-gray-600">{selectedUser.email}</div>
                  </div>
                )}
              </div>

              {/* Issue Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Any additional notes for this transaction..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={loading || !selectedBook || !selectedUser}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Issuing...
                    </>
                  ) : (
                    <>
                      <MdLibraryBooks className="mr-2" />
                      Issue Book
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Return Book Tab */}
          {activeTab === 'return' && (
            <form onSubmit={handleReturnBook} className="space-y-6">
              {/* Circulation Selection */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MdAssignmentReturn className="mr-2 text-blue-600" />
                  Select Borrowed Book
                </h3>

                <div className="relative mb-4">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={circulationSearch}
                    onChange={(e) => setCirculationSearch(e.target.value)}
                    placeholder="Search by book title, user name, or ISBN..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {circulationResults.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {circulationResults.map((circulation) => (
                      <div
                        key={circulation.id}
                        onClick={() => {
                          setSelectedCirculation(circulation);
                          setCirculationSearch('');
                          setCirculationResults([]);
                        }}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <div className="font-medium text-gray-900">{circulation.book.title}</div>
                        <div className="text-sm text-gray-600">by {circulation.book.author}</div>
                        <div className="text-sm text-blue-600">
                          Borrowed by: {circulation.user.name} • Due: {new Date(circulation.dueDate).toLocaleDateString()}
                        </div>
                        {new Date(circulation.dueDate) < new Date() && (
                          <div className="text-sm text-red-600 font-medium">OVERDUE</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedCirculation && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-gray-900">{selectedCirculation.book.title}</div>
                    <div className="text-sm text-gray-600">by {selectedCirculation.book.author}</div>
                    <div className="text-sm text-blue-600">
                      Borrowed by: {selectedCirculation.user.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      Due: {new Date(selectedCirculation.dueDate).toLocaleDateString()}
                    </div>
                    {new Date(selectedCirculation.dueDate) < new Date() && (
                      <div className="text-sm text-red-600 font-medium">OVERDUE</div>
                    )}
                  </div>
                )}
              </div>

              {/* Return Details */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Return Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book Condition
                    </label>
                    <select
                      value={bookCondition}
                      onChange={(e) => setBookCondition(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EXCELLENT">Excellent</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                      <option value="DAMAGED">Damaged</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fine Amount (if any)
                    </label>
                    <input
                      type="number"
                      value={fineAmount}
                      onChange={(e) => setFineAmount(e.target.value)}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Notes (Optional)
                  </label>
                  <textarea
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any notes about the book condition or return..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={loading || !selectedCirculation}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <MdAssignmentReturn className="mr-2" />
                      Return Book
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
