
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ICONS } from '../../constants';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: ICONS.dashboard },
  { path: '/users', label: 'User Management', icon: ICONS.users },
  { path: '/restaurants', label: 'Restaurant Management', icon: ICONS.restaurants },
  { path: '/moods', label: 'Mood Management', icon: ICONS.moods },
  { path: '/posts', label: 'Post Management', icon: ICONS.posts },
  { path: '/notifications', label: 'Notifications', icon: ICONS.notifications },
];

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (user?.accessToken) {
        // This could be moved to an authService call
        await fetch('http://localhost:8081/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user.accessToken}` },
        });
      }
    } catch (error) {
      console.error("Failed to call logout API:", error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const linkClasses = "flex items-center p-3 my-1 rounded-lg transition-colors duration-200 relative group";
  const activeLinkClasses = "bg-highlight text-white shadow-sm";
  const inactiveLinkClasses = "text-text-secondary hover:bg-primary hover:text-text-primary";

  return (
    <div className={`bg-secondary flex flex-col border-r border-accent transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 flex items-center justify-center border-b border-accent" style={{ minHeight: '81px' }}>
        <h1 className={`text-2xl font-heading font-bold text-center text-text-primary transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 scale-0 w-0' : 'opacity-100'}`}>
          Admin Panel
        </h1>
        <div className={`text-highlight transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-100 w-8 h-8' : 'opacity-0 w-0'}`}>
          {isCollapsed && ICONS.adminPanel}
        </div>
      </div>

      <nav className="flex-grow p-2">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0 w-6 h-6">{item.icon}</span>
                <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                  {item.label}
                </span>
                 {isCollapsed && (
                    <span className="absolute left-full ml-4 w-auto p-2 min-w-max rounded-md shadow-md text-white bg-gray-800 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100 z-10">
                        {item.label}
                    </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-2 border-t border-accent">
        {!isCollapsed && user && (
            <div className="p-3 text-center mb-2 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full mb-3 shadow-md border-2 border-accent flex items-center justify-center bg-highlight">
                    <span className="text-3xl font-bold text-white">
                        {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'A'}
                    </span>
                </div>
                <p className="font-semibold text-text-primary text-sm truncate w-full">{user.fullname}</p>
                <p className="text-text-secondary text-xs truncate w-full">{user.email}</p>
            </div>
        )}
        <button
          onClick={handleLogout}
          className={`${linkClasses} ${inactiveLinkClasses} w-full`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <span className="flex-shrink-0 w-6 h-6">{ICONS.logout}</span>
          <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            Logout
          </span>
           {isCollapsed && (
              <span className="absolute left-full ml-4 w-auto p-2 min-w-max rounded-md shadow-md text-white bg-gray-800 text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100 z-10">
                  Logout
              </span>
          )}
        </button>

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center p-3 my-1 rounded-lg text-text-secondary hover:bg-primary"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span className={`transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
            {ICONS.chevronLeft}
          </span>
           <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            Collapse
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;