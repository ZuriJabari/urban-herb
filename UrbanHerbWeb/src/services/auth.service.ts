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
import { User } from '../types/user';
import api from './axios';

export class AuthService {
  static async register(email: string, password: string, firstName: string, lastName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`,
      });
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      // Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Exchange Firebase token for Django token
      const response = await this.exchangeToken(idToken);
      localStorage.setItem('token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  static async loginWithEmail(email: string, password: string): Promise<User> {
    try {
      console.log('Attempting login with email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase login successful:', userCredential.user.email);
      
      // Get the Firebase token
      const idToken = await userCredential.user.getIdToken(true);
      console.log('Got Firebase token:', {
        length: idToken.length,
        prefix: idToken.substring(0, 10) + '...'
      });
      
      // Exchange Firebase token for Django token
      console.log('Exchanging Firebase token for Django token...');
      const tokens = await this.exchangeToken(idToken);
      console.log('Token exchange successful');
      
      // Store tokens
      localStorage.setItem('token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      console.error('Login error details:', {
        code: error.code,
        message: error.message,
        response: error.response?.data
      });
      throw new Error(error.message);
    }
  }

  static async logout(): Promise<void> {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw this.handleAuthError(error);
    }
  }

  static async requestPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset request error:', error);
      throw this.handleAuthError(error);
    }
  }

  static async resendVerificationEmail(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      await sendEmailVerification(user);
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw this.handleAuthError(error);
    }
  }

  static async exchangeToken(firebaseToken: string): Promise<{ access: string; refresh: string }> {
    try {
      const endpoint = '/api/v1/auth/firebase-token/';
      const baseURL = import.meta.env.VITE_API_URL;
      
      console.log('Token exchange configuration:', {
        baseURL,
        endpoint,
        fullURL: `${baseURL}${endpoint}`,
        tokenLength: firebaseToken.length,
        tokenPrefix: firebaseToken.substring(0, 10) + '...'
      });
      
      const response = await api.post(endpoint, { 
        token: firebaseToken 
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Token exchange response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      if (!response.data.access || !response.data.refresh) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format from server');
      }
      
      return {
        access: response.data.access,
        refresh: response.data.refresh
      };
    } catch (error: any) {
      console.error('Token exchange error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          headers: error.config?.headers
        }
      });
      throw new Error(error.response?.data?.error || 'Failed to exchange Firebase token for Django token');
    }
  }

  static mapFirebaseUser(firebaseUser: FirebaseUser): User {
    const [firstName, ...lastNameParts] = (firebaseUser.displayName || '').split(' ');
    const lastName = lastNameParts.join(' ');

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      first_name: firstName || '',
      last_name: lastName || '',
      is_email_verified: firebaseUser.emailVerified,
      phone_number: firebaseUser.phoneNumber || null,
    };
  }

  private static handleAuthError(error: any): Error {
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
          message = 'Too many unsuccessful login attempts. Please try again later';
          break;
        default:
          message = error.message || message;
      }
    }
    
    return new Error(message);
  }
}
