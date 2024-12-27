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
  access: string;
  refresh: string;
  user: User;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: needed for cookies to be sent
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log the full URL being requested
    console.log('Full URL:', `${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    // Transform product data if it's a product endpoint
    if (response.config.url?.includes('/products/')) {
      if (Array.isArray(response.data)) {
        response.data = response.data.map(transformProductData);
      } else {
        response.data = transformProductData(response.data);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post<AuthResponse>('/v1/auth/token/refresh/', {
          refresh: refreshToken,
        });

        if (response.data.access) {
          localStorage.setItem('access_token', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        }
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
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
    const formattedPhone = data.phone_number ? formatPhoneNumber(data.phone_number) : '';
    return api.post<{ message: string }>('/v1/auth/phone/send-verification/', {
      phone_number: formattedPhone,
      first_name: data.first_name,
      last_name: data.last_name,
      is_registration: true
    });
  },

  loginWithEmail: (data: EmailLoginData) =>
    api.post<AuthResponse>('/v1/auth/login/login_email/', data),

  loginWithPhone: (data: PhoneLoginData) => {
    const formattedPhone = formatPhoneNumber(data.phone_number);
    return api.post<{ message: string }>('/v1/auth/phone/send-verification/', {
      phone_number: formattedPhone,
      is_registration: false
    });
  },

  verifyPhone: (data: VerifyPhoneData) => {
    const formattedPhone = formatPhoneNumber(data.phone_number);
    return api.post<AuthResponse>('/v1/auth/phone/verify/', {
      phone_number: formattedPhone,
      code: data.code
    });
  },

  requestPasswordReset: (data: PasswordResetRequestData) =>
    api.post<{ message: string }>('/v1/auth/login/request_password_reset/', data),

  verifyPasswordReset: (data: PasswordResetVerifyData) =>
    api.post<{ message: string }>('/v1/auth/login/verify_reset_code/', data),

  confirmPasswordReset: (data: PasswordResetConfirmData) =>
    api.post<{ message: string }>('/v1/auth/login/reset_password/', data),

  changePassword: (data: ChangePasswordData) =>
    api.post<{ message: string }>('/v1/auth/users/change_password/', data),

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return Promise.resolve();
  }
};

export const userApi = {
  getProfile: () => 
    api.get<User>('/v1/auth/profile/'),

  updateProfile: (data: Partial<User>) =>
    api.patch<User>('/v1/auth/profile/', data),

  getAddresses: () =>
    api.get<User>('/v1/auth/addresses/'),

  createAddress: (data: Omit<User, 'id'>) =>
    api.post<User>('/v1/auth/addresses/', data),

  updateAddress: (id: string, data: Partial<User>) =>
    api.patch<User>(`/v1/auth/addresses/${id}/`, data),

  deleteAddress: (id: string) =>
    api.delete(`/v1/auth/addresses/${id}/`),

  setDefaultAddress: (id: string) =>
    api.post(`/v1/auth/addresses/${id}/set-default/`, {}),

  getPreferences: () =>
    api.get<User>('/v1/auth/preferences/'),

  updatePreferences: (data: Partial<User>) =>
    api.patch<User>('/v1/auth/preferences/', data),
};

export default api;
