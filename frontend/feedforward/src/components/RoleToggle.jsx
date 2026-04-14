import React from 'react';

const RoleToggle = ({ currentRole, onToggle }) => {
  return (
    <div className="role-toggle-container">
      <p>I am a:</p>
      <div className="toggle-buttons">
        <button 
          type="button"
          className={currentRole === 'STUDENT' ? 'active' : ''} 
          onClick={() => onToggle('STUDENT')}
        >
          Student
        </button>
        <button 
          type="button"
          className={currentRole === 'STAFF' ? 'active' : ''} 
          onClick={() => onToggle('STAFF')}
        >
          Staff
        </button>
      </div>
    </div>
  );
};

export default RoleToggle;