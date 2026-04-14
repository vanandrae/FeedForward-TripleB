// src/services/Interceptor.js
import axios from 'axios';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Set token in headers
const setAuthHeader = (config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Handle response errors
const handleResponseError = (error) => {
  const originalRequest = error.config;

  // Handle 401 Unauthorized
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    
    // Try to refresh token
    return refreshToken()
      .then((newToken) => {
        localStorage.setItem('authToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      })
      .catch(() => {
        // Redirect to login if refresh fails
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        return Promise.reject(error);
      });
  }

  // Handle 403 Forbidden
  if (error.response?.status === 403) {
    console.error('Access forbidden. You do not have permission.');
  }

  // Handle 404 Not Found
  if (error.response?.status === 404) {
    console.error('Resource not found.');
  }

  // Handle 500 Server Error
  if (error.response?.status >= 500) {
    console.error('Server error. Please try again later.');
  }

  return Promise.reject(error);
};

// Mock refresh token function (replace with actual API call)
const refreshToken = async () => {
  // Implement your token refresh logic here
  // const response = await axios.post('/auth/refresh', { refreshToken: localStorage.getItem('refreshToken') });
  // return response.data.token;
  return Promise.reject('Refresh not implemented');
};

// Request interceptor
export const setupInterceptors = (apiClient) => {
  // Request interceptor
  apiClient.interceptors.request.use(
    (config) => setAuthHeader(config),
    (error) => Promise.reject(error)
  );

  // Response interceptor
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => handleResponseError(error)
  );
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// Helper function to logout
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.href = '/login';
};