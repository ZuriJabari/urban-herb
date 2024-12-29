import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthService } from '../services/auth.service';

interface AuthContextType {
  user: string | null;
  loading: boolean;
  register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const navigate = useNavigate();

  // Clear error handler
  const clearError = useCallback(() => setError(null), []);

  // Auth handlers
  const register = useCallback(async (data: { email: string; password: string; first_name: string; last_name: string }) => {
    try {
      setLoading(true);
      setError(null);
      const email = await AuthService.register(data.email, data.password, data.first_name, data.last_name);
      setUser(email);
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userEmail = await AuthService.loginWithEmail(email, password);
      setUser(userEmail);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.logout();
      setUser(null);
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Firebase auth state listener
  useEffect(() => {
    console.log('Setting up Firebase auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('Firebase user detected:', firebaseUser.email);
          const storedToken = localStorage.getItem('token');
          
          if (!storedToken) {
            console.log('No stored token, getting fresh Firebase token');
            const idToken = await firebaseUser.getIdToken(false);
            
            try {
              const response = await AuthService.exchangeToken(idToken);
              console.log('Token exchange successful');
              localStorage.setItem('token', response.access);
              localStorage.setItem('refresh_token', response.refresh);
              setUser(firebaseUser.email);
            } catch (tokenError) {
              console.error('Token exchange failed:', tokenError);
              await auth.signOut();
              setUser(null);
              localStorage.removeItem('token');
              localStorage.removeItem('refresh_token');
              throw tokenError;
            }
          } else {
            console.log('Using stored token');
            setUser(firebaseUser.email);
          }
        } else {
          console.log('No Firebase user detected');
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
        setError(error instanceof Error ? error.message : 'Authentication error');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Context value
  const value = {
    user,
    loading,
    register,
    loginWithEmail,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
