
import ApiClient from './ApiClient';

const apiCache = new Map();

class HttpService {
  static async get(url, params = {}, forceRefresh = false) {
    const cacheKey = url + (Object.keys(params).length ? JSON.stringify(params) : '');

    if (!forceRefresh && apiCache.has(cacheKey)) {
      ApiClient.get(url, { params })
        .then(response => {
          apiCache.set(cacheKey, response.data);
        })
        .catch(() => {});
        
      return apiCache.get(cacheKey);
    }

    try {
      console.log(`GET Request: ${url}`, params);
      const response = await ApiClient.get(url, { params });
      console.log(`GET Response:`, response.data);
      
      apiCache.set(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      console.error(`GET Error:`, error);
      throw this.handleError(error);
    }
  }

  static clearCache() {
    apiCache.clear();
  }

  static invalidateCacheForUrl(urlPart) {
    for (const key of apiCache.keys()) {
      if (key.includes(urlPart)) {
        apiCache.delete(key);
      }
    }
  }

  static async post(url, data = {}) {
    this.clearCache();
    try {
      console.log(`POST Request to: ${url}`);
      console.log(`Request body:`, data);
      const response = await ApiClient.post(url, data);
      console.log(`POST Response status:`, response.status);
      console.log(`POST Response data:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`POST Error for ${url}:`, error);
      console.error(`Error response:`, error.response);
      console.error(`Error status:`, error.response?.status);
      console.error(`Error data:`, error.response?.data);
      throw this.handleError(error);
    }
  }

  static async put(url, data = {}) {
    this.clearCache();
    try {
      const response = await ApiClient.put(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async patch(url, data = {}) {
    this.clearCache();
    try {
      const response = await ApiClient.patch(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async delete(url) {
    this.clearCache();
    try {
      const response = await ApiClient.delete(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static handleError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || error.response.data?.error || 'An error occurred',
        data: error.response.data
      };
    } else if (error.request) {
      return {
        status: 0,
        message: 'Network error. Please check your connection.',
      };
    } else {
      return {
        status: 500,
        message: error.message || 'An unexpected error occurred',
      };
    }
  }
}

export default HttpService;