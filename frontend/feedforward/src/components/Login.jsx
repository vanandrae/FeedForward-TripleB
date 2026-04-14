import React from 'react';
import LoginForm from './LoginForm';
import './AuthStyles.css';

const Login = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">FeedForward</h1>
          <p className="auth-subtitle">Welcome back! Please login to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;