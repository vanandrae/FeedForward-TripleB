import React from 'react';
import './AuthStyles.css';

const RoleToggle = ({ selectedRole, onRoleChange }) => {
  const roles = [
    { value: 'student', label: 'Student', icon: '🎓', description: 'Submit and track feedback' },
    { value: 'faculty', label: 'Faculty', icon: '👨‍🏫', description: 'Review and manage feedback' },
    { value: 'admin', label: 'Admin', icon: '👑', description: 'Full system access' }
  ];

  return (
    <div className="role-toggle-container">
      {roles.map(role => (
        <button
          key={role.value}
          type="button"
          onClick={() => onRoleChange(role.value)}
          className={`role-toggle-btn ${selectedRole === role.value ? 'role-toggle-btn-active' : ''}`}
        >
          <div className="role-icon">{role.icon}</div>
          <div className="role-label">{role.label}</div>
          <div className="role-description">{role.description}</div>
        </button>
      ))}
    </div>
  );
};

export default RoleToggle;