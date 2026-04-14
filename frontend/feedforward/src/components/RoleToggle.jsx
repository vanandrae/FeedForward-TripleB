import React from 'react';

const RoleToggle = ({ currentRole, onToggle }) => {
  return (
    <div className="role-toggle-container">
      <label className="role-label">I am a:</label>
      <div className="toggle-buttons">
        <button 
          type="button"
          className={`toggle-btn ${currentRole === 'STUDENT' ? 'active' : ''}`}
          onClick={() => onToggle('STUDENT')}
        >
          Student
        </button>
        <button 
          type="button"
          className={`toggle-btn ${currentRole === 'STAFF' ? 'active' : ''}`}
          onClick={() => onToggle('STAFF')}
        >
          Staff
        </button>
      </div>
    </div>
  );
};

export default RoleToggle;