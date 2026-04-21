import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Navlink from './Navlink';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout, user, isAuthenticated, isAdmin, isStudent } = useAuth(); // Removed unused isFaculty

  // Get menu items based on user role
  const getMenuItems = () => {
    const items = [
      { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    ];
    
    // Only students can submit feedback
    if (isStudent) {
      items.push({ to: '/submit-feedback', icon: '📝', label: 'Submit Feedback' });
    }
    
    // All authenticated users can view feedback
    items.push({ to: '/feedback', icon: '👁️', label: 'View Feedback' });
    items.push({ to: '/profile', icon: '👤', label: 'Profile' });
    
    // Only admins see reports and analytics
    if (isAdmin) {
      items.push({ to: '/admin/reports', icon: '📋', label: 'Admin Reports' });
      items.push({ to: '/reports', icon: '📈', label: 'Analytics' });
    }
    
    return items;
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't render sidebar if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-64 bg-gradient-to-b from-[#1976D2] to-[#1565C0] h-screen fixed left-0 top-0 shadow-lg z-20">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-white/20">
        <h1 className="text-white text-xl font-bold">FeedForward</h1>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-4 py-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{user.fullName || user.name || 'User'}</p>
              <p className="text-white/70 text-xs capitalize">{user.role || 'Student'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="mt-4 px-3">
        {menuItems.map((item, index) => (
          <Navlink key={index} to={item.to} icon={item.icon} label={item.label} />
        ))}
      </nav>

      {/* Footer with Logout Button */}
      <div className="absolute bottom-8 left-0 right-0 px-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;