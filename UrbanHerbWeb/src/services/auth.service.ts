import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from './axios';

export class AuthService {
  static async register(email: string, password: string, firstName: string, lastName: string): Promise<string> {
    try {
      console.log('Starting registration process for:', email);
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase user created successfully');
      
      try {
        // Update profile with name
        await updateProfile(userCredential.user, {
          displayName: `${firstName} ${lastName}`,
        });
        console.log('User profile updated with name');
        
        // Send verification email
        await sendEmailVerification(userCredential.user);
        console.log('Verification email sent');
      } catch (profileError) {
        console.error('Error updating profile or sending verification:', profileError);
      }
      
      // Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      console.log('Got Firebase token');
      
      try {
        // Exchange Firebase token for Django token
        const response = await this.exchangeToken(idToken);
        console.log('Token exchange successful');
        localStorage.setItem('token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
      } catch (tokenError) {
        console.error('Token exchange failed:', tokenError);
        // Clean up if token exchange fails
        await signOut(auth);
        throw tokenError;
      }
      
      return userCredential.user.email || '';
    } catch (error: any) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  static async loginWithEmail(email: string, password: string): Promise<string> {
    try {
      // Sign in with Firebase
      console.log('Attempting Firebase login:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase login successful:', userCredential.user.email);
      
      // Get Firebase token
      const idToken = await userCredential.user.getIdToken(true);
      console.log('Got Firebase token');
      
      // Exchange token with backend
      console.log('Exchanging token with backend...');
      const response = await this.exchangeToken(idToken);
      console.log('Token exchange successful');
      
      // Store tokens
      localStorage.setItem('token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      return userCredential.user.email || '';
    } catch (error: any) {
      console.error('Login error:', error);
      // Clean up if anything fails
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error('Error during cleanup signout:', signOutError);
      }
      throw this.handleAuthError(error);
    }
  }

  static async logout(): Promise<void> {
    try {
      console.log('Starting logout process');
      await signOut(auth);
      console.log('Firebase signOut successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw this.handleAuthError(error);
    } finally {
      // Always clear tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      console.log('Local storage cleared');
    }
  }

  static async exchangeToken(firebaseToken: string): Promise<{ access: string; refresh: string }> {
    try {
      console.log('Exchanging Firebase token');
      const response = await api.post('/auth/firebase-token/', { token: firebaseToken });
      console.log('Token exchange successful');
      return response.data;
    } catch (error) {
      console.error('Token exchange failed:', error);
      throw error;
    }
  }

  static async refreshToken(): Promise<string> {
    try {
      console.log('Refreshing token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        console.error('No refresh token found');
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/token/refresh/', {
        refresh: refreshToken
      });

      console.log('Token refresh successful');
      const { access } = response.data;
      localStorage.setItem('token', access);
      return access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clean up on refresh failure
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error('Error during cleanup signout:', signOutError);
      }
      throw error;
    }
  }

  private static handleAuthError(error: any): Error {
    console.error('Auth error details:', {
      code: error.code,
      message: error.message,
      response: error.response?.data
    });

    // Network errors
    if (!navigator.onLine) {
      return new Error('No internet connection. Please check your network.');
    }

    if (error.message?.includes('network')) {
      return new Error('Network error. Please check your internet connection.');
    }

    let message = 'An error occurred during authentication';
    
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        case 'auth/operation-not-allowed':
          message = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          message = 'Password is too weak';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          message = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          message = 'Invalid password';
          break;
        case 'auth/too-many-requests':
          message = 'Too many attempts. Please try again later';
          break;
        case 'auth/quota-exceeded':
          message = 'Service temporarily unavailable. Please try again later';
          break;
        default:
          if (error.response?.data?.detail) {
            message = error.response.data.detail;
          } else {
            message = error.message || 'Authentication failed';
          }
      }
    } else if (error.response?.data?.detail) {
      message = error.response.data.detail;
    }

    return new Error(message);
  }
}
