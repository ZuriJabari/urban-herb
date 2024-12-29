import axios from 'axios';
import { auth } from '../config/firebase';

export const apiClient = axios.create({
  baseURL: '/api/v1',  // Use relative path for proxy
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a public client for endpoints that don't require authentication
export const publicApiClient = axios.create({
  baseURL: '/api/v1',  // Use relative path for proxy
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Add trailing slash for Django
      if (config.url && !config.url.endsWith('/')) {
        config.url = `${config.url}/`;
      }

      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
