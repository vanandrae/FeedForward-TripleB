
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

    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);

        if (parsedUser.banned) {

          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          setUser(null);
          setIsAuthenticated(false);
          setUserRole(null);
          window.location.href = '/login';
        } else {
          setUser(parsedUser);
          setIsAuthenticated(true);
          setUserRole(parsedUser.role);
        }
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

      const response = await HttpService.post(API_ENDPOINTS.LOGIN, { email, password });

      console.log('Login response:', response);

      if (response.token) {

        if (response.banned) {
          console.error('❌ Account is banned');
          return { success: false, message: 'Your account has been banned. Please contact an administrator.' };
        }


        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response));
        setUser(response);
        setIsAuthenticated(true);
        setUserRole(response.role);


        try {
          const profileResponse = await HttpService.get(API_ENDPOINTS.GET_USER_PROFILE);
          const updatedUser = {
            ...response,
            profilePicture: profileResponse.profilePicture,
            fullName: profileResponse.fullName || response.fullName,
            department: profileResponse.department,
            banned: profileResponse.banned || false
          };
          localStorage.setItem('userData', JSON.stringify(updatedUser));
          setUser(updatedUser);
        } catch (profileError) {
          console.log('Profile fetch failed, using basic user data:', profileError);

        }

        console.log('✅ Login successful!');
        return { success: true };
      } else {
        console.error('❌ No token in response');
        return { success: false, message: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('❌ Login error details:', error);


      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Your account has been banned. Please contact an administrator.';
        return { success: false, message: errorMessage };
      }

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
        role: 'student',
        department: userData.department || ''
      });

      console.log('Registration response:', response);

      if (response.message === "User registered successfully!") {
        console.log('✅ Registration successful, logging in...');
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