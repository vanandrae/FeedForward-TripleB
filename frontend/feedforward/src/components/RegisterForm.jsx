import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { validateEmail, validatePassword, validateName } from './Validation';
import './AuthStyles.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

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

  const validateForm = () => {
    const newErrors = {};

    const isNameValid = validateName(formData.name);
    if (!isNameValid) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const isEmailValid = validateEmail(formData.email);
    if (!isEmailValid) {
      newErrors.email = 'Please enter a valid email address';
    }

    const isPasswordValid = validatePassword(formData.password);
    if (!isPasswordValid) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    const doPasswordsMatch = formData.password === formData.confirmPassword;
    if (!doPasswordsMatch) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    
    const hasErrors = Object.keys(newErrors).length !== 0;
    const isValid = !hasErrors;
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'student'
    });
    setLoading(false);

    const isSuccess = result.success;
    if (!isSuccess) {
      const errorObj = { general: result.message };
      setErrors(errorObj);
    }
  };

  const getInputClassName = (fieldName) => {
    const hasError = errors[fieldName];
    if (hasError) {
      return 'form-input form-input-error';
    }
    return 'form-input';
  };

  const getButtonText = () => {
    if (loading) {
      return 'Creating account...';
    }
    return 'Create Account';
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-illustration-panel">
          <div className="illustration-content">
            <div className="illustration-icon">
              <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h2 className="illustration-title">Join FeedForward</h2>
            <p className="illustration-description">Create an account to submit feedback, track your submissions, and engage with the community.</p>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join us to start sharing your feedback</p>
          </div>

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
                className={getInputClassName('name')}
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
                className={getInputClassName('email')}
                placeholder="Enter your email"
                required
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={getInputClassName('password')}
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
                className={getInputClassName('confirmPassword')}
                placeholder="Confirm your password"
                required
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {getButtonText()}
            </button>

            <div className="auth-footer">
              <span>Already have an account?</span>
              <Link to="/login" className="auth-link">Sign In</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;