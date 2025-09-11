import {
  FaHome,
  FaUsers,
  FaUserTie,
  FaBook,
  FaUserCircle,
  FaChalkboard,
  FaBookOpen,
  FaCalendarAlt,
  FaClipboardList,
  FaFileAlt,
  FaBullhorn,
  FaBus,
  FaBed,
  FaChevronDown,
  FaRocket,
  FaGraduationCap
} from "react-icons/fa";
import Link from "next/link";

const NavItem = ({ icon, text, active = false, hasDropdown = false }) => (
  <li className="mb-2">
    <Link
      href="#"
      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
        active
          ? "bg-accent-light-purple text-accent-purple"
          : "text-text-secondary hover:bg-gray-100"
      }`}>
      <div className="flex items-center">
        {icon}
        <span className="ml-4 font-medium">{text}</span>
      </div>
      {hasDropdown && <FaChevronDown className="text-xs" />}
    </Link>
  </li>
);

const UpgradeCard = () => (
    <div className="mt-auto bg-accent-purple p-6 rounded-2xl text-white text-center">
        <div className="bg-white/20 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <FaRocket className="text-3xl" />
        </div>
        <p className="font-semibold mt-4">You're on the Free plan.</p>
        <p className="text-sm mb-4">Upgrade to go Pro</p>
        <button className="bg-white text-accent-purple font-bold py-2 px-4 rounded-lg w-full">
            Upgrade
        </button>
    </div>
)

const Sidebar = () => {
  return (
    <div className="w-72 bg-sidebar-bg h-screen p-6 flex flex-col">
      <div className="flex items-center mb-10">
        <FaGraduationCap className="text-4xl text-accent-purple" />
        <h1 className="text-3xl font-bold text-text-primary ml-3">Schoooli</h1>
      </div>
      <nav className="flex-grow">
        <ul>
          <NavItem icon={<FaHome />} text="Dashboard" active />
          <NavItem icon={<FaUsers />} text="Students" hasDropdown />
          <NavItem icon={<FaUserTie />} text="Teachers" hasDropdown />
          <NavItem icon={<FaBook />} text="Library" />
          <NavItem icon={<FaUserCircle />} text="Account" />
          <NavItem icon={<FaChalkboard />} text="Class" />
          <NavItem icon={<FaBookOpen />} text="Subject" />
          <NavItem icon={<FaCalendarAlt />} text="Routine" />
          <NavItem icon={<FaClipboardList />} text="Attendance" />
          <NavItem icon={<FaFileAlt />} text="Exam" hasDropdown />
          <NavItem icon={<FaBullhorn />} text="Notice" />
          <NavItem icon={<FaBus />} text="Transport" />
          <NavItem icon={<FaBed />} text="Hostel" />
        </ul>
      </nav>
      <UpgradeCard />
    </div>
  );
};

export default Sidebar;
