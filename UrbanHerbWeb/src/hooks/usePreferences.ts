import { useState, useCallback } from 'react';
import { UserPreferences } from '../types/user';
import { userApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function usePreferences() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state: { user }, updateUser } = useAuth();

  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.getPreferences();
      updateUser({ preferences: response.data.preferences });
      return response.data.preferences;
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to fetch preferences');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  const updatePreferences = useCallback(async (data: Partial<UserPreferences>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.updatePreferences(data);
      updateUser({ preferences: response.data.preferences });
      return response.data.preferences;
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to update preferences');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  return {
    preferences: user?.preferences,
    isLoading,
    error,
    fetchPreferences,
    updatePreferences,
  };
}
