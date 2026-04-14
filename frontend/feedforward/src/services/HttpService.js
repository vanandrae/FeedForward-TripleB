// src/services/HttpService.js
import ApiClient from './ApiClient';

class HttpService {
  // GET request
  static async get(url, params = {}) {
    try {
      const response = await ApiClient.get(url, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // POST request
  static async post(url, data = {}) {
    try {
      const response = await ApiClient.post(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PUT request
  static async put(url, data = {}) {
    try {
      const response = await ApiClient.put(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PATCH request
  static async patch(url, data = {}) {
    try {
      const response = await ApiClient.patch(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE request
  static async delete(url) {
    try {
      const response = await ApiClient.delete(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  static handleError(error) {
    if (error.response) {
      // Server responded with error
      return {
        status: error.response.status,
        message: error.response.data.message || 'An error occurred',
        data: error.response.data
      };
    } else if (error.request) {
      // Request made but no response
      return {
        status: 0,
        message: 'Network error. Please check your connection.',
      };
    } else {
      // Something else happened
      return {
        status: 500,
        message: error.message || 'An unexpected error occurred',
      };
    }
  }
}

export default HttpService;