import React from 'react';
import LoginForm from './LoginForm';
import './AuthStyles.css';

const Login = () => {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className="auth-side-panel">
          <div className="brand-logo">
            <span>HT</span>
          </div>
          <h1>FeedFoward</h1>
          <p>Welcome back! Please enter your credentials to access your account.</p>
        </div>
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Login</h2>
            <p>Enter your credentials to access your account.</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;