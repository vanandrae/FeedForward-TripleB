import React from 'react';
import RegisterForm from './RegisterForm';
import './AuthStyles.css';

const Register = () => {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className="auth-side-panel">
          <div className="brand-logo">
            <span>HT</span>
          </div>
          <h1>FeedForward</h1>
          <p>Welcome! Please fill in the details to create your account.</p>
        </div>
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Sign Up</h2>
            <p>Create your account to get started.</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register;