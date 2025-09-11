import { FaBell, FaSearch, FaComment } from 'react-icons/fa';

const Header = () => {
  return (
    <div className="flex justify-between items-center p-6 bg-background">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Welcome.</h1>
        <p className="text-text-secondary">Navigate the future of education with Schoooli.</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search anything here"
            className="w-80 py-2 pl-10 pr-4 rounded-lg bg-white border border-border-color focus:outline-none focus:ring-2 focus:ring-accent-purple"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
                <FaBell className="text-xl text-text-secondary" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
                <FaComment className="text-xl text-text-secondary" />
            </button>
        </div>
        <div className="flex items-center gap-3">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="User"
            className="w-11 h-11 rounded-full"
          />
          <div>
            <p className="font-semibold text-text-primary">Luke F R</p>
            <p className="text-sm text-text-secondary">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
