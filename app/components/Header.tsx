import { FaBell, FaSearch } from 'react-icons/fa';

const Header = () => {
  return (
    <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">Welcome.</h1>
        <p className="text-gray-500 ml-2">Navigate the future of education with Schooli.</p>
      </div>
      <div className="flex items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search anything here"
            className="w-64 p-2 pl-10 rounded-md border border-gray-300"
          />
          <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        <div className="ml-4 flex items-center">
          <FaBell className="text-gray-500" />
          <div className="ml-4 flex items-center">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="User"
              className="w-8 h-8 rounded-full"
            />
            <div className="ml-2">
              <p className="font-bold">Luke F R</p>
              <p className="text-sm text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
