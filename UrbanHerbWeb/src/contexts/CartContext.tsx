import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/product';
import { CartContextType, CartItem } from '../types/cart';
import api from '../services/api';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from API on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('access_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.get('/cart/');
        if (response.data && response.data.length > 0) {
          const cart = response.data[0]; // Get the first cart
          setItems(cart.items.map((item: any) => ({
            product: item.product,
            quantity: item.quantity
          })));
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const addItem = async (product: Product, quantity: number = 1) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        // Handle unauthenticated user (could show a login prompt)
        console.log('User not authenticated');
        return;
      }

      const response = await api.post('/cart/add_item/', {
        product_id: product.id,
        quantity
      });

      if (response.data) {
        setItems(response.data.items.map((item: any) => ({
          product: item.product,
          quantity: item.quantity
        })));
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  const removeItem = async (productId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return;
      }

      await api.post('/cart/remove_item/', { product_id: productId });
      setItems(items.filter(item => item.product.id !== productId));
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return;
      }

      await api.post('/cart/update_quantity/', { product_id: productId, quantity });
      setItems(items.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      ));
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await api.post('/cart/clear/');
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
