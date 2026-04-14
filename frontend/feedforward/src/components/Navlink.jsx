import React from 'react';
import { NavLink } from 'react-router-dom';

const Navlink = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-white/10 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

export default Navlink;