import React from 'react';
import RegisterForm from './RegisterForm';
import './AuthStyles.css';

const Register = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join FeedForward to submit and manage feedback</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;