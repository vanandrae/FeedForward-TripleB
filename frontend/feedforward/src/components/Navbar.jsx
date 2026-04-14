import React, { useState } from 'react';

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);

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
          <button className="relative text-white hover:bg-white/10 p-2 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg"
            >
              <div className="w-8 h-8 bg-[#DC004E] rounded-full flex items-center justify-center">
                <span className="text-white font-medium">JD</span>
              </div>
              <span>John Doe</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20">
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</button>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Settings</button>
                <hr className="my-1" />
                <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;