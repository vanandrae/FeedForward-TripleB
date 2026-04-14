import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import RoleToggle from './RoleToggle';
import { validateEmail, validatePassword, validateName } from './Validation';
import './AuthStyles.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!validateName(formData.name)) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    });
    setLoading(false);
    
    if (!result.success) {
      setErrors({ general: result.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {errors.general && (
        <div className="auth-error">{errors.general}</div>
      )}
      
      <div className="form-group">
        <label htmlFor="name" className="form-label">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`form-input ${errors.name ? 'form-input-error' : ''}`}
          placeholder="Enter your full name"
          required
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`form-input ${errors.email ? 'form-input-error' : ''}`}
          placeholder="Enter your email"
          required
        />
        {errors.email && <span className="form-error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Role</label>
        <RoleToggle selectedRole={formData.role} onRoleChange={handleRoleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`form-input ${errors.password ? 'form-input-error' : ''}`}
          placeholder="Create a password (min. 6 characters)"
          required
        />
        {errors.password && <span className="form-error">{errors.password}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
          placeholder="Confirm your password"
          required
        />
        {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
      </div>

      <button type="submit" className="auth-button" disabled={loading}>
        {loading ? 'Creating account...' : 'Register'}
      </button>

      <div className="auth-footer">
        Already have an account? <a href="/login" className="auth-link">Login here</a>
      </div>
    </form>
  );
};

export default RegisterForm;