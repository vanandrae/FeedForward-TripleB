// src/services/Interceptor.js
// Remove the axios import since it's not used

// Get token from localStorage
const getToken = () => {
  const token = localStorage.getItem('authToken');
  console.log('Token found:', token ? 'Yes' : 'No');
  return token;
};

// Set token in headers
const setAuthHeader = (config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header set for:', config.url);
  } else {
    console.log('No token found for:', config.url);
  }
  return config;
};

// Handle response errors
const handleResponseError = (error) => {
  console.log('Response error:', error.response?.status, error.config?.url);
  
  // Handle 401 Unauthorized
  if (error.response?.status === 401) {
    console.log('Unauthorized - clearing token and redirecting');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '/login';
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