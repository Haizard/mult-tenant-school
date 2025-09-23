'use client';

import { FaHome, FaUser, FaCalendar } from 'react-icons/fa';

const TestIconComponent = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Icon Test Component</h2>

      <div className="flex items-center gap-4 mb-4">
        <FaHome className="text-blue-500 text-2xl" />
        <span>Home Icon</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <FaUser className="text-green-500 text-2xl" />
        <span>User Icon</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <FaCalendar className="text-purple-500 text-2xl" />
        <span>Calendar Icon</span>
      </div>

      <div className="mt-6">
        <p className="text-sm text-gray-600">
          If you can see all three icons above, react-icons is working correctly.
        </p>
      </div>
    </div>
  );
};

export default TestIconComponent;
