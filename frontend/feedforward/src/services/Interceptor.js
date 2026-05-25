



const getToken = () => {
  const token = localStorage.getItem('authToken');
  console.log('Token found:', token ? 'Yes' : 'No');
  return token;
};


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


const handleResponseError = (error) => {
  console.log('Response error:', error.response?.status, error.config?.url);


  if (error.response?.status === 401) {
    console.log('Unauthorized - clearing token and redirecting');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = '/login';
  }


  if (error.response?.status === 403) {
    console.error('Access forbidden. You do not have permission.');
  }


  if (error.response?.status === 404) {
    console.error('Resource not found.');
  }


  if (error.response?.status >= 500) {
    console.error('Server error. Please try again later.');
  }

  return Promise.reject(error);
};


export const setupInterceptors = (apiClient) => {

  apiClient.interceptors.request.use(
    (config) => setAuthHeader(config),
    (error) => Promise.reject(error)
  );


  apiClient.interceptors.response.use(
    (response) => response,
    (error) => handleResponseError(error)
  );
};


export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};


export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.href = '/login';
};