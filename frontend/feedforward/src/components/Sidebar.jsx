import React from 'react';
import Navlink from './Navlink';

const Sidebar = () => {
  const menuItems = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/submit-feedback', icon: '📝', label: 'Submit Feedback' },
    { to: '/feedback', icon: '👁️', label: 'View Feedback' },
    { to: '/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-[#1976D2] to-[#1565C0] h-screen fixed left-0 top-0 shadow-lg z-20">
      <div className="flex items-center justify-center h-16 border-b border-white/20">
        <h1 className="text-white text-xl font-bold">FeedForward</h1>
      </div>

      <nav className="mt-8 px-3">
        {menuItems.map((item, index) => (
          <Navlink key={index} to={item.to} icon={item.icon} label={item.label} />
        ))}
      </nav>

      <div className="absolute bottom-8 left-0 right-0 px-3">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors">
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;