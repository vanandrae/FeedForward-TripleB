import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegistration(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await ApiClient.post('/auth/register', formData);
      alert("Registration successful! Redirecting to login...");
      navigate('/login');
    } catch (err) {
      setErrors({ server: "Registration failed. Try a different email." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {errors.server && <div className="error-box">{errors.server}</div>}
      
      <div className="input-group">
        <input placeholder="Username" onChange={e => setFormData({...formData, username: e.target.value})} required />
        {errors.username && <small className="error-text">{errors.username}</small>}
      </div>

      <div className="input-group">
        <input placeholder="Email" type="email" onChange={e => setFormData({...formData, email: e.target.value})} required />
        {errors.email && <small className="error-text">{errors.email}</small>}
      </div>

      <div className="input-group">
        <input placeholder="Password" type="password" onChange={e => setFormData({...formData, password: e.target.value})} required />
        {errors.password && <small className="error-text">{errors.password}</small>}
      </div>

      <RoleToggle 
        currentRole={formData.role} 
        onToggle={(role) => setFormData({...formData, role})} 
      />

      <div className="button-row">
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>
        <a className="secondary-button" href="/login">Login</a>
      </div>
    </form>
  );
};

export default RegisterForm;