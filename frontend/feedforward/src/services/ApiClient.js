// src/services/ApiClient.js
import axios from 'axios';
import API_BASE_URL from './ApiConstants';
import { setupInterceptors } from './Interceptor';

console.log('🔧 API_BASE_URL:', API_BASE_URL);

const ApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('📡 Axios baseURL set to:', ApiClient.defaults.baseURL);

// Add request interceptor to log full URL
ApiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 Request URL: ${config.baseURL}${config.url}`);
    console.log(`🚀 Request Method: ${config.method}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Setup interceptors
setupInterceptors(ApiClient);

export default ApiClient;