import axios from 'axios';
import { transformProductData } from '../utils/transformers';
import {
  User,
  RegisterData,
  EmailLoginData,
  PhoneLoginData,
  VerifyPhoneData,
  PasswordResetRequestData,
  PasswordResetVerifyData,
  PasswordResetConfirmData,
  ChangePasswordData,
} from '../types/user';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

const api = axios.create({
  baseURL: 'http://localhost:8001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Function to get CSRF token from cookies
const getCSRFToken = () => {
  const name = 'csrftoken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return '';
};

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // Add CSRF token to headers
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    // Add auth token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log the full request details
    console.log('API Request:', {
      method: config.method,
      url: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
      params: config.params
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    
    // Transform product data if it's a product endpoint
    if (response.config.url?.includes('/products/')) {
      console.log('Transforming product data');
      try {
        if (Array.isArray(response.data)) {
          console.log('Transforming array of products');
          response.data = response.data.map(transformProductData);
        } else {
          console.log('Transforming single product');
          response.data = transformProductData(response.data);
        }
        console.log('Transformed data:', response.data);
      } catch (err) {
        console.error('Error transforming product data:', err);
        throw err;
      }
    }
    return response;
  },
  async (error) => {
    // Log error responses
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: error.config
    });

    // Handle token refresh here...
    if (error.response?.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post<AuthResponse>('/api/v1/auth/token/refresh/', {
          refresh: refreshToken,
        });

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        // Retry the original request
        const config = error.config;
        config.headers.Authorization = `Bearer ${access_token}`;
        return api(config);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

const formatPhoneNumber = (phone: string): string => {
  // Remove any whitespace, dots, or hyphens
  let cleaned = phone.replace(/[\s\.\-]/g, '');
  
  // Make sure it starts with +256
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('0')) {
      cleaned = '+256' + cleaned.slice(1);
    } else if (cleaned.startsWith('256')) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = '+256' + cleaned;
    }
  }
  
  return cleaned;
};

export const authApi = {
  register: (data: RegisterData) => {
    return api.post<AuthResponse>('/api/v1/auth/register/', {
      email: data.email,
      password: data.password,
      confirm_password: data.confirm_password,
      first_name: data.first_name,
      last_name: data.last_name
    });
  },

  loginWithEmail: (data: EmailLoginData) =>
    api.post<AuthResponse>('/api/v1/auth/login/', {
      email: data.email,
      password: data.password,
    }),

  requestPasswordReset: (data: PasswordResetRequestData) =>
    api.post<{ message: string }>('/api/v1/auth/password/reset/', data),

  confirmPasswordReset: (data: PasswordResetConfirmData) =>
    api.post<{ message: string }>('/api/v1/auth/password/reset/confirm/', data),

  changePassword: (data: ChangePasswordData) =>
    api.post<{ message: string }>('/api/v1/auth/password/change/', data),

  verifyEmail: (data: { email: string; code: string }) => {
    return api.post<AuthResponse>('/api/v1/auth/verify-email/', data);
  },

  resendEmailVerification: (email: string) => {
    return api.post<{ message: string }>('/api/v1/auth/resend-verification/', { email });
  },

  logout: () => {
    return api.post('/api/v1/auth/logout/').then(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    });
  }
};

export const userApi = {
  getProfile: () => 
    api.get<User>('/api/v1/auth/profile/'),

  updateProfile: (data: Partial<User>) =>
    api.patch<User>('/api/v1/auth/profile/', data),

  getAddresses: () =>
    api.get<User>('/api/v1/auth/addresses/'),

  createAddress: (data: Omit<User, 'id'>) =>
    api.post<User>('/api/v1/auth/addresses/', data),

  updateAddress: (id: string, data: Partial<User>) =>
    api.patch<User>(`/api/v1/auth/addresses/${id}/`, data),

  deleteAddress: (id: string) =>
    api.delete(`/api/v1/auth/addresses/${id}/`),

  setDefaultAddress: (id: string) =>
    api.post(`/api/v1/auth/addresses/${id}/set-default/`, {}),

  getPreferences: () =>
    api.get<User>('/api/v1/auth/preferences/'),

  updatePreferences: (data: Partial<User>) =>
    api.patch<User>('/api/v1/auth/preferences/', data),
};

export default api;
