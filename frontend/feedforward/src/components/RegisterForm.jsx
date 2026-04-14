import React, { useState } from 'react';
import RoleToggle from './RoleToggle';
import { validateRegistration } from './Validation';
import ApiClient from '../services/ApiClient';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegistration(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await ApiClient.post('/auth/register', formData);
      alert("Registration successful! Redirecting to login...");
      window.location.href = '/login';
    } catch (err) {
      setErrors({ server: "Registration failed. Try a different email." });
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {errors.server && <div className="error-box">{errors.server}</div>}
      
      <div className="input-group">
        <input placeholder="Username" onChange={e => setFormData({...formData, username: e.target.value})} />
        {errors.username && <small className="error-text">{errors.username}</small>}
      </div>

      <div className="input-group">
        <input placeholder="Email" type="email" onChange={e => setFormData({...formData, email: e.target.value})} />
        {errors.email && <small className="error-text">{errors.email}</small>}
      </div>

      <div className="input-group">
        <input placeholder="Password" type="password" onChange={e => setFormData({...formData, password: e.target.value})} />
        {errors.password && <small className="error-text">{errors.password}</small>}
      </div>

      <RoleToggle 
        currentRole={formData.role} 
        onToggle={(role) => setFormData({...formData, role})} 
      />

      <button type="submit">Create Account</button>
    </form>
  );
};

export default RegisterForm;