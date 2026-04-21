import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './AuthStyles.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setErrors({ general: 'Please fill in all fields' });
      return;
    }
    
    setLoading(true);
    console.log('Attempting login with:', formData.email);
    
    const result = await login(formData.email, formData.password);
    setLoading(false);
    
    if (!result.success) {
      setErrors({ general: result.message || 'Login failed. Please check your credentials.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {errors.general && (
        <div className="auth-error">{errors.general}</div>
      )}
      
      <div className="form-group">
        <label htmlFor="email" className="form-label">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="form-input"
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">Password</label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      <div className="form-options">
        <label className="checkbox-label">
          <input type="checkbox" /> Remember me
        </label>
        <a href="/forgot-password" className="forgot-link">Forgot Password?</a>
      </div>

      <button type="submit" className="auth-button" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <div className="auth-footer">
        Don't have an account? <a href="/register" className="auth-link">Register here</a>
      </div>
    </form>
  );
};

export default LoginForm;