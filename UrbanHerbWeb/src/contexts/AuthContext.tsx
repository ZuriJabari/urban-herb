import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AuthState,
  AuthContextType,
  RegisterData,
  EmailLoginData,
  PhoneLoginData,
  VerifyPhoneData,
  PasswordResetRequestData,
  PasswordResetVerifyData,
  PasswordResetConfirmData,
  ChangePasswordData,
  User,
} from '../types/user';
import { authApi, userApi } from '../services/api';

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; access?: string; refresh?: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      if (action.payload.access) {
        localStorage.setItem('access_token', action.payload.access);
      }
      if (action.payload.refresh) {
        localStorage.setItem('refresh_token', action.payload.refresh);
      }
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        error: null,
        accessToken: action.payload.access || state.accessToken,
        refreshToken: action.payload.refresh || state.refreshToken,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return {
        ...initialState,
        isLoading: false,
        accessToken: null,
        refreshToken: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Add updateUser function
  const updateUser = async (userData: Partial<User>) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await userApi.updateProfile(userData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data
      });
      return response.data;
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.detail || 'Failed to update profile'
      });
      throw error;
    }
  };

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      console.log('Checking auth status:', { accessToken, refreshToken });
      
      dispatch({ type: 'AUTH_START' });
      if (accessToken) {
        try {
          console.log('Fetching user profile...');
          const response = await userApi.getProfile();
          console.log('User profile loaded:', response.data);
          
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: { 
              user: response.data,
              access: accessToken,
              refresh: refreshToken
            } 
          });
        } catch (error) {
          console.error('Failed to load profile:', error);
          dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
          dispatch({ type: 'AUTH_LOGOUT' });
          navigate('/login');
        }
      } else {
        console.log('No access token found, logging out');
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    checkAuth();
  }, []);  // Remove navigate from dependencies to prevent unnecessary reloads

  const register = async (data: RegisterData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      // Register the user
      const response = await authApi.register(data);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
          access: response.data.access,
          refresh: response.data.refresh,
        },
      });
      
      // Navigate to verify phone
      navigate('/verify-phone', { state: { phone_number: data.phone_number } });
    } catch (error: any) {
      console.error('Registration error:', error.response?.data);
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.error || error.response?.data?.phone_number?.[0] || 'Registration failed',
      });
      throw error;
    }
  };

  const loginWithEmail = async (data: EmailLoginData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authApi.loginWithEmail(data);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
          access: response.data.access,
          refresh: response.data.refresh,
        },
      });
      navigate('/');
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.detail || 'Login failed',
      });
    }
  };

  const loginWithPhone = async (data: PhoneLoginData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await authApi.loginWithPhone(data);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: null } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.detail || 
                         'Failed to send verification code';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage,
      });
      throw error;
    }
  };

  const verifyPhone = async (data: VerifyPhoneData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authApi.verifyPhone(data);
      console.log('Verify phone response:', response.data);  // Debug log
      
      // Save tokens to localStorage
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Update auth state
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
          access: response.data.access,
          refresh: response.data.refresh,
        },
      });
      
      // Then fetch the full user profile
      try {
        const userResponse = await userApi.getProfile();
        console.log('User profile after verification:', userResponse.data);  // Debug log
        dispatch({
          type: 'UPDATE_USER',
          payload: userResponse.data,
        });
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }

      navigate('/');
    } catch (error: any) {
      console.error('Phone verification failed:', error.response?.data);  // Debug log
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.detail || 'Verification failed',
      });
      throw error;
    }
  };

  const logout = async () => {
    authApi.logout();
    dispatch({ type: 'AUTH_LOGOUT' });
    navigate('/login');
  };

  const requestPasswordReset = async (data: PasswordResetRequestData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await authApi.requestPasswordReset(data);
      navigate('/reset-password/verify', { state: { identifier: data.identifier } });
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.detail || 'Password reset request failed',
      });
    }
  };

  const verifyPasswordReset = async (data: PasswordResetVerifyData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await authApi.verifyPasswordReset(data);
      navigate('/reset-password/confirm', {
        state: { identifier: data.identifier, code: data.code },
      });
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.detail || 'Code verification failed',
      });
    }
  };

  const confirmPasswordReset = async (data: PasswordResetConfirmData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await authApi.confirmPasswordReset(data);
      navigate('/login');
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.detail || 'Password reset failed',
      });
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await authApi.changePassword(data);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: state.user! } });
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.detail || 'Password change failed',
      });
    }
  };

  const value: AuthContextType = {
    state,
    register,
    loginWithEmail,
    loginWithPhone,
    verifyPhone,
    logout,
    updateUser,
    requestPasswordReset,
    verifyPasswordReset,
    confirmPasswordReset,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
