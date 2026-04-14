import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ApiClient from '../services/ApiClient';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await ApiClient.post('/auth/login', credentials);
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="error-box">{error}</div>}
      <div className="input-group">
        <input
          name="email"
          type="email"
          placeholder="User Name"
          onChange={handleChange}
          required
        />
      </div>
      <div className="input-group">
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
      </div>
      <div className="auth-row">
        <a className="forgot-link" href="#">Forgot Password?</a>
      </div>
      <div className="button-row">
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <a className="secondary-button" href="/register">Signup</a>
      </div>
    </form>
  );
};

export default LoginForm;