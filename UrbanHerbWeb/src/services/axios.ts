import axios from 'axios';
import { auth } from '../config/firebase';

// Validate API URL and ensure it doesn't end with a trailing slash
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8001').replace(/\/$/, '');
console.log('API_URL from env:', import.meta.env.VITE_API_URL);
console.log('Final API_URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // Add trailing slash for Django
      if (config.url && !config.url.endsWith('/')) {
        config.url = `${config.url}/`;
      }

      // Check if endpoint requires authentication
      const publicEndpoints = [
        '/products/',
        '/brands/',
        '/effects/',
        '/categories/',
      ];

      const isPublicEndpoint = publicEndpoints.some(endpoint => 
        config.url?.includes(endpoint) || config.url?.includes('/public/')
      );

      // Only add auth header for protected endpoints
      if (!isPublicEndpoint) {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Log the full URL being requested
      const fullUrl = `${config.baseURL}${config.url}`;
      console.log('Making request to:', {
        fullUrl,
        baseURL: config.baseURL,
        url: config.url,
        method: config.method,
        requiresAuth: !isPublicEndpoint
      });

      return config;
    } catch (error: any) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method,
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });

    // If it's a 401 error and we're not on an auth-required endpoint, try without auth
    if (error.response?.status === 401 && 
        error.config?.url && (
          error.config.url.includes('/products/') ||
          error.config.url.includes('/brands/') ||
          error.config.url.includes('/effects/')
        )) {
      console.log('Retrying request without auth token...');
      const config = error.config;
      delete config.headers.Authorization;
      return axios(config);
    }

    return Promise.reject(error);
  }
);

export default api;
