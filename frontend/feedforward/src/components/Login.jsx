import React from 'react';
import LoginForm from './LoginForm';
import './AuthStyles.css';

const Login = () => {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className="auth-header">
          <h1>FeedForward</h1>
          <p>Login to your account to continue</p>
        </div>
        <LoginForm />
        <div className="auth-footer">
          <p>Don't have an account? <a href="/register">Register</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;