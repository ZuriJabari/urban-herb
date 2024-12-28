import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Log the full request URL and params
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log('Making request:', {
      method: config.method,
      url: fullUrl,
      params: config.params,
      data: config.data,
      headers: config.headers
    });

    // Add token to all non-auth requests
    if (!config.url?.includes('/auth/token/refresh/')) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Remove CSRF header for auth endpoints
    if (config.url?.includes('/auth/')) {
      delete config.headers['X-CSRFToken'];
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Log the response data
    console.log('Received response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
      url: response.config.url
    });
    return response;
  },
  async (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });

    const originalRequest = error.config;
    
    // Only attempt token refresh for non-auth endpoints and 401 errors
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/token/refresh/')
    ) {
      originalRequest._retry = true;

      try {
        console.log('Attempting to refresh token...');
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post('/api/v1/auth/token/refresh/', {
          refresh: refreshToken
        });

        console.log('Token refresh successful');
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
