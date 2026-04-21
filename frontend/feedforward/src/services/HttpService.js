// src/services/HttpService.js
import ApiClient from './ApiClient';

class HttpService {
  static async get(url, params = {}) {
    try {
      console.log(`📡 GET Request: ${url}`, params);
      const response = await ApiClient.get(url, { params });
      console.log(`✅ GET Response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ GET Error:`, error);
      throw this.handleError(error);
    }
  }

  static async post(url, data = {}) {
    try {
      console.log(`📡 POST Request to: ${url}`);
      console.log(`📦 Request body:`, data);
      const response = await ApiClient.post(url, data);
      console.log(`✅ POST Response status:`, response.status);
      console.log(`✅ POST Response data:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ POST Error for ${url}:`, error);
      console.error(`Error response:`, error.response);
      console.error(`Error status:`, error.response?.status);
      console.error(`Error data:`, error.response?.data);
      throw this.handleError(error);
    }
  }

  static async put(url, data = {}) {
    try {
      const response = await ApiClient.put(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async patch(url, data = {}) {
    try {
      const response = await ApiClient.patch(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async delete(url) {
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