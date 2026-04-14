// src/services/ApiConstants.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  
  // Feedback
  GET_ALL_FEEDBACK: '/feedback',
  GET_FEEDBACK_BY_ID: '/feedback/:id',
  CREATE_FEEDBACK: '/feedback',
  UPDATE_FEEDBACK: '/feedback/:id',
  DELETE_FEEDBACK: '/feedback/:id',
  UPDATE_FEEDBACK_STATUS: '/feedback/:id/status',
  
  // User
  GET_USER_PROFILE: '/user/profile',
  UPDATE_USER_PROFILE: '/user/profile',
  GET_USER_FEEDBACK: '/user/feedback',
  
  // Stats
  GET_DASHBOARD_STATS: '/stats/dashboard',
  GET_RESOLUTION_PROGRESS: '/stats/progress',
  
  // Admin
  GET_ALL_USERS: '/admin/users',
  UPDATE_USER_ROLE: '/admin/users/:id/role',
};

export default API_BASE_URL;