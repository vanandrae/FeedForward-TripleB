import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
    const updatedForm = { ...formData };
    updatedForm[name] = value;
    setFormData(updatedForm);
    
    if (errors[name]) {
      const updatedErrors = { ...errors };
      updatedErrors[name] = '';
      setErrors(updatedErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      const errorObj = { general: 'Please fill in all fields' };
      setErrors(errorObj);
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (!result.success) {
      const errorObj = { general: result.message || 'Login failed. Please check your credentials.' };
      setErrors(errorObj);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getPasswordInputType = () => {
    if (showPassword) {
      return 'text';
    }
    return 'password';
  };

  const getPasswordToggleIcon = () => {
    if (showPassword) {
      return (
        <svg className="toggle-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
          <line x1="21" y1="3" x2="3" y2="21"></line>
        </svg>
      );
    }
    return (
      <svg className="toggle-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    );
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-illustration-panel">
          <div className="illustration-content">
            <div className="illustration-icon">
              <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="illustration-title">Welcome Back!</h2>
            <p className="illustration-description">Sign in to access your feedback dashboard and track your submissions.</p>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-header">
            <h1 className="auth-title">FeedForward</h1>
            <p className="auth-subtitle">Sign in to your account to continue</p>
          </div>

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
                  type={getPasswordInputType()}
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
                  onClick={togglePasswordVisibility}
                >
                  {getPasswordToggleIcon()}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Sign In'}
            </button>

            <div className="auth-footer">
              <span>Don't have an account?</span>
              <Link to="/register" className="auth-link">Create Account</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;