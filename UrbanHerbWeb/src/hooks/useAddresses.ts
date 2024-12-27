import { useState, useCallback } from 'react';
import { Address } from '../types/user';
import { userApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateUser } = useAuth();

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.getAddresses();
      setAddresses(response.data.addresses);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to fetch addresses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAddress = useCallback(async (data: Omit<Address, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.createAddress(data);
      setAddresses(prev => [...prev, response.data]);
      updateUser({ addresses: response.data.addresses });
      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to create address');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  const updateAddress = useCallback(async (id: string, data: Partial<Address>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.updateAddress(id, data);
      setAddresses(prev => prev.map(addr => addr.id === id ? response.data : addr));
      updateUser({ addresses: response.data.addresses });
      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to update address');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  const deleteAddress = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await userApi.deleteAddress(id);
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      updateUser({ addresses: addresses.filter(addr => addr.id !== id) });
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to delete address');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addresses, updateUser]);

  const setDefaultAddress = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.setDefaultAddress(id);
      setAddresses(response.data.addresses);
      updateUser({ addresses: response.data.addresses });
      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to set default address');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  return {
    addresses,
    isLoading,
    error,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
}
