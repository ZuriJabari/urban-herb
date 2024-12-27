import { useState, useEffect } from 'react';
import { User } from '@firebase/auth';
import { AuthService } from '../services/auth.service';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = AuthService.auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithPhone = async (phoneNumber: string) => {
    try {
      setError(null);
      setLoading(true);
      const id = await AuthService.signInWithPhone(phoneNumber);
      setVerificationId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp: string) => {
    if (!verificationId) {
      setError('No verification ID found');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const user = await AuthService.verifyOTP(verificationId, otp);
      setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setLoading(true);
      await AuthService.signOut();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signInWithPhone,
    verifyOTP,
    signOut,
    isAuthenticated: !!user
  };
};
