// src/services/ApiClient.js
import axios from 'axios';
import API_BASE_URL from './ApiConstants';
import { setupInterceptors } from './Interceptor';

// Create axios instance
const ApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup interceptors
setupInterceptors(ApiClient);

export default ApiClient;