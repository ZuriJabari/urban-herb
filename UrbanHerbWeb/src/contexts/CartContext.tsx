import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { Product } from '../types/product';
import { CartContextType, CartItem } from '../types/cart';
import { useAuth } from './AuthContext';
import { ProductService } from '../services/product.service';

const CART_STORAGE_KEY = 'urbanherb_cart';

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const toast = useToast();
  const { user } = useAuth();

  // Sync cart with backend
  const syncCartWithBackend = useCallback(async () => {
    if (!user) {
      console.log('CartContext: No user, skipping backend sync');
      return;
    }

    try {
      console.log('CartContext: Syncing cart with backend');
      const backendCart = await ProductService.getCart();
      
      if (backendCart && Array.isArray(backendCart.items)) {
        setItems(backendCart.items);
        console.log('CartContext: Cart synced with backend:', backendCart.items);
      } else {
        console.warn('CartContext: Invalid backend cart format:', backendCart);
      }
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log('CartContext: User not authenticated, using local storage');
        loadFromLocalStorage();
      } else {
        console.error('CartContext: Error syncing with backend:', error);
        toast({
          title: 'Cart Sync Error',
          description: 'Unable to sync cart with server. Using local storage.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        loadFromLocalStorage();
      }
    }
  }, [user, toast]);

  // Load cart from local storage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
        console.log('CartContext: Loaded cart from local storage:', parsedCart);
      }
    } catch (error) {
      console.error('CartContext: Error loading from local storage:', error);
    }
  }, []);

  // Save cart to local storage
  const saveToLocalStorage = useCallback((cartItems: CartItem[]) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      console.log('CartContext: Saved cart to local storage:', cartItems);
    } catch (error) {
      console.error('CartContext: Error saving to local storage:', error);
    }
  }, []);

  // Initialize cart
  useEffect(() => {
    const initializeCart = async () => {
      setLoading(true);
      try {
        if (user) {
          console.log('CartContext: User authenticated, fetching cart from backend');
          await syncCartWithBackend();
        } else {
          console.log('CartContext: User not authenticated, loading from local storage');
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('CartContext: Error initializing cart:', error);
        // Fallback to local storage if backend fails
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    };

    initializeCart();
  }, [user, syncCartWithBackend, loadFromLocalStorage]);

  // Save cart changes to local storage
  useEffect(() => {
    if (!loading) {
      saveToLocalStorage(items);
    }
  }, [items, loading, saveToLocalStorage]);

  // Add item to cart
  const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
    try {
      console.log('CartContext: Adding to cart:', { product, quantity });
      
      // Update local state first for better UX
      setItems(currentItems => {
        const existingItem = currentItems.find(item => item.product.id === product.id);
        if (existingItem) {
          return currentItems.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...currentItems, { product, quantity }];
      });

      // Sync with backend if user is authenticated
      if (user) {
        await ProductService.addToCart(product.id, quantity);
        await syncCartWithBackend();
      }

      toast({
        title: 'Added to Cart',
        description: `${product.name} has been added to your cart.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('CartContext: Error adding to cart:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add item to cart',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [user, syncCartWithBackend, toast]);

  // Remove item from cart
  const removeFromCart = useCallback(async (productId: number) => {
    try {
      console.log('CartContext: Removing from cart:', productId);
      
      // Update local state first
      setItems(currentItems => currentItems.filter(item => item.product.id !== productId));

      // Sync with backend if user is authenticated
      if (user) {
        await ProductService.removeFromCart(productId);
        await syncCartWithBackend();
      }

      toast({
        title: 'Removed from Cart',
        description: 'Item has been removed from your cart.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('CartContext: Error removing from cart:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove item from cart',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [user, syncCartWithBackend, toast]);

  // Update quantity
  const updateQuantity = useCallback(async (productId: number, quantity: number) => {
    try {
      setError(null);
      console.log('CartContext: Updating quantity:', { productId, quantity });

      if (user) {
        await ProductService.updateCartItemQuantity(productId, quantity);
        await syncCartWithBackend();
      } else {
        setItems(prev => prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        ));
      }

      toast({
        title: 'Success',
        description: 'Cart updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('CartContext: Error updating quantity:', error);
      setError('Failed to update quantity');
      toast({
        title: 'Error',
        description: 'Failed to update quantity',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [user, syncCartWithBackend, toast]);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      setError(null);
      console.log('CartContext: Clearing cart');

      if (user) {
        await ProductService.clearCart();
        await syncCartWithBackend();
      } else {
        setItems([]);
        localStorage.removeItem(CART_STORAGE_KEY);
      }

      toast({
        title: 'Success',
        description: 'Cart cleared',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('CartContext: Error clearing cart:', error);
      setError('Failed to clear cart');
      toast({
        title: 'Error',
        description: 'Failed to clear cart',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [user, syncCartWithBackend, toast]);

  // Context value
  const value = {
    items,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
