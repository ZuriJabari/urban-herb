import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import api from '../services/axios';
import { useAuth } from './AuthContext';
import { Product } from '../types/product';

interface WishlistContextType {
  wishlist: Product[];
  isLoading: boolean;
  error: string | null;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching wishlist...');
      
      const response = await api.get('/wishlist/');
      console.log('Wishlist fetched successfully:', response.data);
      
      setWishlist(response.data);
    } catch (error: any) {
      console.error('Error loading wishlist:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to load wishlist';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      setWishlist([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const addToWishlist = async (productId: number) => {
    try {
      console.log('Adding product to wishlist:', productId);
      const response = await api.post('/wishlist/add/', { product_id: productId });
      console.log('Product added to wishlist:', response.data);
      
      await fetchWishlist(); // Refresh wishlist
      
      toast({
        title: 'Success',
        description: 'Product added to wishlist',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to add to wishlist';
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      console.log('Removing product from wishlist:', productId);
      const response = await api.post('/wishlist/remove/', { product_id: productId });
      console.log('Product removed from wishlist:', response.data);
      
      await fetchWishlist(); // Refresh wishlist
      
      toast({
        title: 'Success',
        description: 'Product removed from wishlist',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to remove from wishlist';
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const isInWishlist = (productId: number): boolean => {
    return wishlist.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoading,
        error,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
