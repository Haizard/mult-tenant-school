"use client";

import { FaTimes, FaBook, FaUser, FaCalendarAlt, FaInfoCircle, FaBarcode } from "react-icons/fa";

// A more detailed Book interface for the details view
interface BookDetails {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publishedYear?: number;
  category: string;
  description?: string;
  totalCopies: number;
  availableCopies: number;
  status: string;
  condition: string;
  location?: string;
  coverImageUrl?: string;
  circulations?: any[]; // Basic circulation history
}

interface BookDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookDetails | null;
}

const DetailItem = ({ label, value }: { label: string; value: any }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-md text-gray-800">{value || "N/A"}</p>
  </div>
);

export default function BookDetailsModal({
  isOpen,
  onClose,
  book,
}: BookDetailsModalProps) {
  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaBook className="text-2xl" />
              <h2 className="text-xl font-semibold truncate">{book.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FaTimes />
            </button>
          </div>
          <p className="text-sm text-blue-100 mt-1">by {book.author}</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Cover Image */}
            <div className="md:col-span-1">
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={`Cover of ${book.title}`}
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <FaBook className="text-4xl text-gray-400" />
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="ISBN" value={book.isbn} />
                <DetailItem label="Publisher" value={book.publisher} />
                <DetailItem label="Published Year" value={book.publishedYear} />
                <DetailItem label="Category" value={book.category} />
                <DetailItem label="Status" value={book.status} />
                <DetailItem label="Condition" value={book.condition} />
                <DetailItem label="Total Copies" value={book.totalCopies} />
                <DetailItem label="Available" value={book.availableCopies} />
                <DetailItem label="Location" value={book.location} />
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-2 border-b pb-2">Description</h4>
                <p className="text-sm text-gray-600 italic">
                  {book.description || "No description provided."}
                </p>
              </div>

              {/* Circulation History - Basic Example */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-2 border-b pb-2">Recent Activity</h4>
                {book.circulations && book.circulations.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {book.circulations.slice(0, 5).map((circ: any) => (
                      <li key={circ.id} className="flex items-center text-gray-600">
                        <FaInfoCircle className="mr-2 text-blue-500" />
                        <span>
                          {circ.status} by {circ.user.firstName} on {new Date(circ.borrowDate).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No recent circulation history.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
