import React, { createContext, useContext, useState, useEffect } from 'react';
import { WishlistContextType, WishlistItem } from '../types/wishlist';
import api from '../services/api';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('access_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.get('/wishlist/');
        if (response.data && response.data.length > 0) {
          const wishlist = response.data[0];
          setItems(wishlist.products.map((product: any) => ({
            productId: product.id,
            addedAt: new Date().toISOString()
          })));
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const addItem = async (productId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('User not authenticated');
        return;
      }

      const response = await api.post('/wishlist/add_product/', {
        product_id: productId
      });

      if (response.data) {
        setItems(response.data.products.map((product: any) => ({
          productId: product.id,
          addedAt: new Date().toISOString()
        })));
      }
    } catch (error) {
      console.error('Error adding item to wishlist:', error);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await api.post('/wishlist/remove_product/', {
        product_id: productId
      });

      if (response.data) {
        setItems(response.data.products.map((product: any) => ({
          productId: product.id,
          addedAt: new Date().toISOString()
        })));
      }
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
    }
  };

  const moveToCart = async (productId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await api.post('/wishlist/move_to_cart/', {
        product_id: productId
      });
      removeItem(productId);
    } catch (error) {
      console.error('Error moving item to cart:', error);
    }
  };

  const clearWishlist = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await api.post('/wishlist/clear/');
      setItems([]);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        moveToCart,
        clearWishlist,
        isInWishlist,
        loading
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
