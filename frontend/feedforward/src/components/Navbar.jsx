import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowMenu(false);
  };

  const handleProfile = () => {
    navigate('/profile');
    setShowMenu(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-[#1976D2] shadow-md h-16 fixed top-0 right-0 left-64 z-10">
      <div className="flex justify-between items-center h-full px-6">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search feedback..."
            className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/70 focus:outline-none focus:bg-white/20"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <NotificationBell />
          
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              <div className="w-8 h-8 bg-[#DC004E] rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span>{user?.fullName || user?.name || 'User'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20">
                <button
                  onClick={handleProfile}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Settings
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;