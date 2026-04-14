// src/components/AuthContext.js
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
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
      setUserRole(JSON.parse(userData).role);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await HttpService.post(API_ENDPOINTS.LOGIN, { email, password });
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userData', JSON.stringify(response));
      setUser(response);
      setIsAuthenticated(true);
      setUserRole(response.role);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await HttpService.post(API_ENDPOINTS.REGISTER, {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        department: userData.department
      });
      
      // Auto login after registration
      const loginResponse = await HttpService.post(API_ENDPOINTS.LOGIN, {
        email: userData.email,
        password: userData.password
      });
      
      localStorage.setItem('authToken', loginResponse.token);
      localStorage.setItem('userData', JSON.stringify(loginResponse));
      setUser(loginResponse);
      setIsAuthenticated(true);
      setUserRole(loginResponse.role);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
    setUserRole(null);
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