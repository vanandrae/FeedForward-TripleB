import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import ApiClient from '../services/ApiClient';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

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
        <label>Email</label>
        <input name="email" type="email" onChange={handleChange} required />
      </div>
      <div className="input-group">
        <label>Password</label>
        <input name="password" type="password" onChange={handleChange} required />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;