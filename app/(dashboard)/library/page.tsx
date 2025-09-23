"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FaBook,
  FaUsers,
  FaExchangeAlt,
  FaClock,
  FaSearch,
  FaPlus,
  FaDownload,
  FaFilter,
} from "react-icons/fa";
import { MdLibraryBooks, MdBookmark, MdWarning } from "react-icons/md";
import AddBookModal from "../../components/library/AddBookModal";
import IssueReturnModal from "../../components/library/IssueReturnModal";

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
  title: string;
  author: string;
  isbn?: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  status: string;
  condition: string;
  currentBorrowed: number;
  activeReservations: number;
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isIssueReturnModalOpen, setIsIssueReturnModalOpen] = useState(false);

  const fetchLibraryStats = useCallback(async () => {
    try {
      const response = await fetch("/api/library/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching library stats:", error);
    }
  }, []);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(filterCategory && { category: filterCategory }),
      });

      const response = await fetch(`/api/library?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBooks(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterCategory]);

  useEffect(() => {
    fetchLibraryStats();
    fetchBooks();
  }, [fetchLibraryStats, fetchBooks]);

  const handleBookAdded = (newBook: any) => {
    fetchBooks();
    fetchLibraryStats();
  };

  const handleActionCompleted = () => {
    fetchBooks();
    fetchLibraryStats();
  };

  const StatCard = ({ icon, title, value, subtitle, color }: any) => (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/25 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-3xl ${color} mb-2`}>{icon}</div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const BookCard = ({ book }: { book: Book }) => (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/25 transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Category: {book.category}</span>
            {book.isbn && <span>ISBN: {book.isbn}</span>}
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            book.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {book.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-semibold text-blue-800">
            {book.totalCopies}
          </div>
          <div className="text-xs text-blue-600">Total Copies</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-semibold text-green-800">
            {book.availableCopies}
          </div>
          <div className="text-xs text-green-600">Available</div>
        </div>
      </div>

      {book.currentBorrowed > 0 && (
        <div className="flex items-center text-sm text-amber-600 mb-2">
          <FaClock className="mr-2" />
          {book.currentBorrowed} currently borrowed
        </div>
      )}

      {book.activeReservations > 0 && (
        <div className="flex items-center text-sm text-purple-600 mb-2">
          <MdBookmark className="mr-2" />
          {book.activeReservations} active reservations
        </div>
      )}

      <div className="flex justify-end space-x-2 mt-4">
        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm">
          View Details
        </button>
        <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm">
          Issue Book
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Library Management
              </h1>
              <p className="text-gray-600">
                Manage your school&apos;s library resources and circulation
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsAddBookModalOpen(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                Add Book
              </button>
              <button
                onClick={() => setIsIssueReturnModalOpen(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaExchangeAlt className="mr-2" />
                Issue/Return
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <FaDownload className="mr-2" />
                Export Data
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-white/20 backdrop-blur-sm rounded-xl p-1 border border-white/10">
            {[
              { id: "overview", name: "Overview", icon: MdLibraryBooks },
              { id: "books", name: "Book Catalog", icon: FaBook },
              { id: "circulation", name: "Circulation", icon: FaExchangeAlt },
              { id: "reservations", name: "Reservations", icon: MdBookmark },
              { id: "reports", name: "Reports", icon: FaDownload },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white/80 text-purple-700 shadow-sm"
                    : "text-gray-600 hover:bg-white/40"
                }`}
              >
                <tab.icon className="mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Statistics Grid */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={<MdLibraryBooks />}
                  title="Total Books"
                  value={stats.totalBooks.toLocaleString()}
                  subtitle={`${stats.availableBooks} available`}
                  color="text-blue-600"
                />
                <StatCard
                  icon={<FaExchangeAlt />}
                  title="Currently Borrowed"
                  value={stats.borrowedBooks.toLocaleString()}
                  color="text-green-600"
                />
                <StatCard
                  icon={<MdWarning />}
                  title="Overdue Books"
                  value={stats.overdueBooks.toLocaleString()}
                  subtitle={
                    stats.overdueBooks > 0
                      ? "Requires attention"
                      : "All on time"
                  }
                  color="text-red-600"
                />
                <StatCard
                  icon={<FaUsers />}
                  title="Library Users"
                  value={stats.totalLibraryUsers.toLocaleString()}
                  color="text-purple-600"
                />
              </div>
            )}

            {/* Quick Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Unpaid Fines */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Outstanding Fines
                  </h3>
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    ${stats.unpaidFines.amount.toFixed(2)}
                  </div>
                  <p className="text-gray-600">
                    {stats.unpaidFines.count} unpaid fine(s)
                  </p>
                </div>

                {/* Popular Books */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Popular Books
                  </h3>
                  <div className="space-y-3">
                    {stats.popularBooks.slice(0, 3).map((book, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {book.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            by {book.author}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-purple-600">
                          {book.borrowCount} borrows
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Books Tab */}
        {activeTab === "books" && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search books by title, author, or ISBN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Categories</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                  <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <FaFilter className="mr-2" />
                    More Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Books Grid */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading books...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/10 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/10">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/10 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Other tabs placeholder */}
        {activeTab !== "overview" && activeTab !== "books" && (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
              Management
            </h3>
            <p className="text-gray-600 mb-6">
              This section is under development. Advanced {activeTab} features
              will be available soon.
            </p>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Get Started
            </button>
          </div>
        )}

        {/* Modals */}
        <AddBookModal
          isOpen={isAddBookModalOpen}
          onClose={() => setIsAddBookModalOpen(false)}
          onBookAdded={handleBookAdded}
        />

        <IssueReturnModal
          isOpen={isIssueReturnModalOpen}
          onClose={() => setIsIssueReturnModalOpen(false)}
          onActionCompleted={handleActionCompleted}
        />
      </div>
    </div>
  );
}
