// src/components/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import HttpService from '../services/HttpService';
import { API_ENDPOINTS } from '../services/ApiConstants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setUserRole(parsedUser.role);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('========== LOGIN ATTEMPT ==========');
      console.log('Email:', email);
      console.log('Password length:', password?.length);
      console.log('API Endpoint:', API_ENDPOINTS.LOGIN);
      
      const response = await HttpService.post(API_ENDPOINTS.LOGIN, { email, password });
      
      console.log('Login response status:', response);
      console.log('Response token exists:', !!response.token);
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response));
        setUser(response);
        setIsAuthenticated(true);
        setUserRole(response.role);
        console.log('✅ Login successful!');
        return { success: true };
      } else {
        console.error('❌ No token in response');
        return { success: false, message: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('❌ Login error details:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      return { success: false, message: error.response?.data?.message || error.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      console.log('========== REGISTRATION ATTEMPT ==========');
      console.log('Email:', userData.email);
      
      const response = await HttpService.post(API_ENDPOINTS.REGISTER, {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        department: userData.department
      });
      
      console.log('Registration response:', response);
      
      if (response.message === "User registered successfully!") {
        console.log('✅ Registration successful, auto-logging in...');
        const loginResult = await login(userData.email, userData.password);
        return loginResult;
      }
      
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
    setUserRole(null);
    console.log('🔓 User logged out');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    userRole,
    login,
    register,
    logout,
    isAdmin: userRole === 'admin',
    isStudent: userRole === 'student',
    isFaculty: userRole === 'faculty'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;