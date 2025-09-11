import { FaHome, FaUsers, FaUserTie, FaBook, FaChartBar, FaCog } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <div className="text-2xl font-bold mb-8">Schooli</div>
      <nav>
        <ul>
          <li className="mb-4">
            <a href="#" className="flex items-center p-2 rounded-md bg-gray-700">
              <FaHome className="mr-3" /> Dashboard
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="flex items-center p-2 rounded-md hover:bg-gray-700">
              <FaUsers className="mr-3" /> Students
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="flex items-center p-2 rounded-md hover:bg-gray-700">
              <FaUserTie className="mr-3" /> Teachers
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="flex items-center p-2 rounded-md hover:bg-gray-700">
              <FaBook className="mr-3" /> Library
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="flex items-center p-2 rounded-md hover:bg-gray-700">
              <FaChartBar className="mr-3" /> Account
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="flex items-center p-2 rounded-md hover:bg-gray-700">
              <FaCog className="mr-3" /> Settings
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
