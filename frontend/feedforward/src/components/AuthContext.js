// src/components/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
// Remove these lines - they're not being used yet
// import { login as apiLogin, register as apiRegister } from '../services/HttpService';

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
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiLogin({ email, password });
      
      // Mock response for now
      const mockResponse = {
        token: 'mock-token-123',
        user: {
          id: 1,
          name: 'John Doe',
          email: email,
          role: 'student'
        }
      };
      
      localStorage.setItem('authToken', mockResponse.token);
      localStorage.setItem('userData', JSON.stringify(mockResponse.user));
      setUser(mockResponse.user);
      setIsAuthenticated(true);
      setUserRole(mockResponse.user.role);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiRegister(userData);
      
      // Mock response for now
      const mockResponse = {
        token: 'mock-token-123',
        user: {
          id: 1,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'student'
        }
      };
      
      localStorage.setItem('authToken', mockResponse.token);
      localStorage.setItem('userData', JSON.stringify(mockResponse.user));
      setUser(mockResponse.user);
      setIsAuthenticated(true);
      setUserRole(mockResponse.user.role);
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