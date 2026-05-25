
const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {

  LOGIN: '/auth/login',
  REGISTER: '/auth/register',


  GET_ALL_FEEDBACK: '/feedback',
  GET_FEEDBACK_BY_ID: '/feedback',
  CREATE_FEEDBACK: '/feedback',
  UPDATE_FEEDBACK: '/feedback',
  DELETE_FEEDBACK: '/feedback',
  UPDATE_FEEDBACK_STATUS: '/feedback/status',


  GET_USER_PROFILE: '/user/profile',
  UPDATE_USER_PROFILE: '/user/profile',
  GET_USER_FEEDBACK: '/user/feedback',


  GET_DASHBOARD_STATS: '/stats/dashboard',
  GET_RESOLUTION_PROGRESS: '/stats/progress',


  GET_ALL_USERS: '/admin/users',
  UPDATE_USER_ROLE: '/admin/users/role',
};

export default API_BASE_URL;