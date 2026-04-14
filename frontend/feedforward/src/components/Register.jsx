import React from 'react';
import RegisterForm from './RegisterForm';
import './AuthStyles.css';

const Register = () => {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Join FeedForward</h1>
          <p>Create an account to start giving feedback</p>
        </div>
        <RegisterForm />
        <div className="auth-footer">
          <p>Already have an account? <a href="/login">Login</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;