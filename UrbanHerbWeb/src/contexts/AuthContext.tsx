import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthService } from '../services/auth.service';
import { AuthState, AuthContextType, User } from '../types/user';

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' };

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
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        isLoading: false,
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

  // Check for existing tokens on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!token || !refreshToken) {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get Firebase token and exchange it for Django token
          console.log('Getting Firebase token for user:', firebaseUser.email);
          const idToken = await firebaseUser.getIdToken(true);
          
          console.log('Exchanging Firebase token for Django token');
          const response = await AuthService.exchangeToken(idToken);
          
          // Store the tokens
          localStorage.setItem('token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          
          // Update state with user info
          const user = AuthService.mapFirebaseUser(firebaseUser);
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } catch (error) {
          console.error('Error exchanging token:', error);
          // Only log out if this is not an initial token exchange
          if (localStorage.getItem('token')) {
            await AuthService.logout();
            dispatch({ type: 'AUTH_LOGOUT' });
            navigate('/login');
          } else {
            dispatch({ type: 'AUTH_FAILURE', payload: 'Failed to authenticate' });
          }
        }
      } else {
        // No Firebase user, clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const register = async (data: { email: string; password: string; first_name: string; last_name: string }) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const user = await AuthService.register(data.email, data.password, data.first_name, data.last_name);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      navigate('/verify-email');
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message });
      throw error;
    }
  };

  const loginWithEmail = async (data: { email: string; password: string }) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const user = await AuthService.loginWithEmail(data.email, data.password);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      navigate('/');
    } catch (error: any) {
      // Clear any existing tokens on login failure
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      dispatch({ type: 'AUTH_FAILURE', payload: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      dispatch({ type: 'AUTH_LOGOUT' });
      navigate('/login');
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message });
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await AuthService.requestPasswordReset(email);
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message });
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    dispatch({ type: 'AUTH_START' });
    try {
      await AuthService.resendVerificationEmail();
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message });
      throw error;
    }
  };

  const value = {
    state,
    register,
    loginWithEmail,
    logout,
    requestPasswordReset,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
