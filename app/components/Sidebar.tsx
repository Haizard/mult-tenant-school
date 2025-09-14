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
  FaGraduationCap,
  FaBuilding,
  FaShieldAlt
} from "react-icons/fa";
import Link from "next/link";
import { useAuth } from '../contexts/AuthContext';

const NavItem = ({ icon, text, active = false, hasDropdown = false, href = "#" }: {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  hasDropdown?: boolean;
  href?: string;
}) => (
  <li className="mb-2">
    <Link
      href={href}
      className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-accent-purple/20 to-accent-purple-light/20 text-accent-purple border border-accent-purple/30 shadow-purple-glow"
          : "text-text-secondary hover:bg-glass-white hover:backdrop-blur-md hover:border hover:border-glass-border hover:shadow-glass-light"
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
    <div className="mt-auto bg-gradient-to-br from-accent-purple to-accent-purple-light p-6 rounded-2xl text-white text-center shadow-purple-glow animate-glow">
        <div className="bg-white/20 backdrop-blur-md rounded-full w-16 h-16 mx-auto flex items-center justify-center border border-white/30">
            <FaRocket className="text-3xl animate-float" />
        </div>
        <p className="font-semibold mt-4 text-shadow-glass">You&apos;re on the Free plan.</p>
        <p className="text-sm mb-4 opacity-90">Upgrade to go Pro</p>
        <button className="bg-white/20 backdrop-blur-md text-white font-bold py-2 px-4 rounded-xl w-full border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-glass-light">
            Upgrade
        </button>
    </div>
)

const Sidebar = () => {
  const { user } = useAuth();
  
  // Helper function to check if user has specific role
  const hasRole = (roleName: string) => {
    return user?.roles?.some(role => role.name === roleName) || false;
  };

  // Helper function to check if user has any of the specified roles
  const hasAnyRole = (roleNames: string[]) => {
    return user?.roles?.some(role => roleNames.includes(role.name)) || false;
  };

  // Define navigation items based on roles
  const getNavigationItems = () => {
    const items: Array<{
      icon: React.ReactNode;
      text: string;
      href: string;
      show: boolean;
      hasDropdown?: boolean;
    }> = [
      { icon: <FaHome />, text: "Dashboard", href: "/", show: true },
    ];


    // Super Admin specific features
    if (hasRole('Super Admin')) {
      items.push(
        { icon: <FaBuilding />, text: "Tenants", href: "/tenants", show: true },
        { icon: <FaUsers />, text: "System Users", href: "/system-users", show: true }
      );
    }

    // Tenant Admin specific features
    if (hasRole('Tenant Admin')) {
      items.push(
        { icon: <FaUsers />, text: "School Users", href: "/users", show: true }
      );
    }

    // Academic management - Tenant Admin, Teacher, and Student only
    if (hasAnyRole(['Tenant Admin', 'Teacher', 'Student'])) {
      items.push(
        { icon: <FaBookOpen />, text: "Academic", href: "/academic", show: true, hasDropdown: true }
      );
    }

    // Student management - Tenant Admin and Teacher only
    if (hasAnyRole(['Tenant Admin', 'Teacher'])) {
      items.push(
        { icon: <FaGraduationCap />, text: "Students", href: "/students", show: true, hasDropdown: true }
      );
    }

    // Basic features - all authenticated users
    items.push(
      { icon: <FaUserCircle />, text: "Account", href: "/account", show: true }
    );

    // School-specific features - Tenant Admin, Teacher, Student only
    if (hasAnyRole(['Tenant Admin', 'Teacher', 'Student'])) {
      items.push(
        { icon: <FaCalendarAlt />, text: "Schedule", href: "/schedule", show: true },
        { icon: <FaClipboardList />, text: "Attendance", href: "/attendance", show: true },
        { icon: <FaBullhorn />, text: "Announcements", href: "/announcements", show: true }
      );
    }

    // Super Admin specific administrative features
    if (hasRole('Super Admin')) {
      items.push(
        { icon: <FaShieldAlt />, text: "System Audit", href: "/audit-logs", show: true },
        { icon: <FaShieldAlt />, text: "NECTA Compliance", href: "/necta-compliance", show: true },
        { icon: <FaShieldAlt />, text: "Tenant Isolation", href: "/tenant-isolation", show: true },
        { icon: <FaFileAlt />, text: "System Reports", href: "/reports", show: true }
      );
    }

    // Tenant Admin specific administrative features
    if (hasRole('Tenant Admin')) {
      items.push(
        { icon: <FaShieldAlt />, text: "School Audit", href: "/audit-logs", show: true },
        { icon: <FaFileAlt />, text: "School Reports", href: "/reports", show: true }
      );
    }

    return items.filter(item => item.show);
  };

  return (
    <div className="w-72 glass-sidebar h-screen p-6 flex flex-col">
      <div className="flex items-center mb-10">
        <div className="bg-gradient-to-br from-accent-purple to-accent-purple-light p-3 rounded-2xl shadow-purple-glow">
          <FaGraduationCap className="text-4xl text-white" />
        </div>
        <h1 className="text-3xl font-bold gradient-text ml-3">Schoooli</h1>
      </div>
      
      {/* User Role Display */}
      {user && (
        <div className="glass-card p-4 mb-6 bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-accent-purple/30">
          <div className="text-center">
            <p className="text-sm text-text-secondary mb-1">Logged in as</p>
            <p className="font-semibold text-text-primary">{user.firstName} {user.lastName}</p>
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {user.roles?.map((role, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs bg-accent-purple/20 text-accent-purple rounded-full border border-accent-purple/30"
                >
                  {role.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="flex-grow">
        <ul>
          {getNavigationItems().map((item, index) => (
            <NavItem 
              key={index}
              icon={item.icon} 
              text={item.text} 
              href={item.href}
              hasDropdown={item.hasDropdown}
              active={item.href === "/"}
            />
          ))}
        </ul>
      </nav>
      <UpgradeCard />
    </div>
  );
};

export default Sidebar;
