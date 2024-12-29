import { Product, ProductFilters, CBDEffect } from '../types/product';
import api from './axios';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export class ProductService {
  static async getProducts(filters?: Partial<ProductFilters>): Promise<Product[]> {
    try {
      console.log('ProductService: Fetching products with filters:', filters);
      
      // Clean up undefined and empty string values
      const cleanFilters = Object.entries(filters || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          // Convert filter keys to match Django's expected format
          const apiKey = {
            minPrice: 'price_min',
            maxPrice: 'price_max',
            minRating: 'rating_min',
            inStock: 'in_stock',
            sortBy: 'sort',
            searchQuery: 'search'
          }[key] || key;
          
          acc[apiKey] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      console.log('ProductService: Clean filters:', cleanFilters);

      // If no filters are provided, fetch featured products for the home page
      const endpoint = '/api/v1/products/';
      const params = Object.keys(cleanFilters).length === 0 
        ? { featured: true }
        : cleanFilters;

      const response = await api.get<PaginatedResponse<Product>>(endpoint, {
        params
      });

      console.log('ProductService: Raw response:', response.data);

      // Handle paginated response
      if (response.data.results && Array.isArray(response.data.results)) {
        console.log('ProductService: Processed products:', {
          count: response.data.count,
          resultsCount: response.data.results.length,
          hasNext: !!response.data.next,
          hasPrevious: !!response.data.previous
        });
        return response.data.results;
      }

      throw new Error('Invalid response format from server');
    } catch (error: any) {
      console.error('ProductService: Error fetching products:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullUrl: `${error.config?.baseURL}${error.config?.url}`
      });
      throw error;
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      console.log('ProductService: Fetching product by ID:', id);
      const response = await api.get(`/api/v1/products/${id}/`);
      
      if (!response.data) {
        console.warn('ProductService: No product found with ID:', id);
        return null;
      }

      console.log('ProductService: Product fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('ProductService: Error fetching product by ID:', {
        id,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.detail || `Failed to fetch product with ID: ${id}`);
    }
  }

  static async getProductBySlug(slug: string): Promise<Product> {
    try {
      console.log('ProductService: Fetching product by slug:', slug);
      // Remove any leading or trailing slashes from the slug
      const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
      const response = await api.get<Product>(`/api/v1/products/${cleanSlug}/`);
      
      console.log('ProductService: Raw response:', {
        status: response.status,
        data: response.data,
        url: response.config?.url,
        fullUrl: `${response.config?.baseURL}${response.config?.url}`
      });

      if (!response.data) {
        console.error('ProductService: No data received from server');
        throw new Error('Product not found');
      }

      return response.data;
    } catch (error: any) {
      console.error('ProductService: Error fetching product by slug:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        fullUrl: `${error.config?.baseURL}${error.config?.url}`,
        slug
      });

      if (error.response?.status === 404) {
        throw new Error('Product not found');
      }

      throw new Error(error.response?.data?.detail || 'Failed to load product');
    }
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      console.log('ProductService: Fetching products by category:', category);
      const response = await api.get('/api/v1/products/', {
        params: { category }
      });
      
      console.log('ProductService: Products fetched successfully:', {
        category,
        count: response.data.length
      });
      return response.data;
    } catch (error: any) {
      console.error('ProductService: Error fetching products by category:', {
        category,
        error: error.message,
        response: error.response?.data
      });
      return [];
    }
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      console.log('ProductService: Fetching featured products');
      const response = await api.get<PaginatedResponse<Product>>('/api/v1/products/', {
        params: { featured: true }
      });
      
      console.log('ProductService: Raw response:', {
        status: response.status,
        data: response.data,
        headers: response.headers,
        url: response.config?.url,
        params: response.config?.params
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      if (response.data.results && Array.isArray(response.data.results)) {
        console.log('ProductService: Featured products fetched successfully:', {
          count: response.data.results.length,
          hasNext: !!response.data.next,
          hasPrevious: !!response.data.previous
        });
        return response.data.results;
      }

      throw new Error('Invalid response format from server');
    } catch (error: any) {
      console.error('ProductService: Error fetching featured products:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        params: error.config?.params,
        stack: error.stack
      });
      throw error;
    }
  }

  static async getRelatedProducts(productId: number): Promise<Product[]> {
    try {
      console.log('ProductService: Fetching related products for:', productId);
      const response = await api.get(`/api/v1/products/${productId}/related/`);
      
      console.log('ProductService: Related products fetched successfully:', {
        productId,
        count: response.data.length
      });
      return response.data;
    } catch (error: any) {
      console.error('ProductService: Error fetching related products:', {
        productId,
        error: error.message,
        response: error.response?.data
      });
      return [];
    }
  }

  static async searchProducts(query: string): Promise<Product[]> {
    try {
      console.log('ProductService: Searching products with query:', query);
      const response = await api.get('/api/v1/products/search/', {
        params: { q: query }
      });
      
      console.log('ProductService: Search completed successfully:', {
        query,
        count: response.data.length
      });
      return response.data;
    } catch (error: any) {
      console.error('ProductService: Error searching products:', {
        query,
        error: error.message,
        response: error.response?.data
      });
      return [];
    }
  }

  // Cart operations
  static async getCart() {
    try {
      const response = await api.get('/api/v1/cart/current/');
      return response.data;
    } catch (error: any) {
      console.error('ProductService: Error fetching cart:', error);
      throw error;
    }
  }

  static async addToCart(productId: number, quantity: number) {
    try {
      const response = await api.post('/api/v1/cart/add/', {
        product_id: productId,
        quantity
      });
      return response.data;
    } catch (error: any) {
      console.error('ProductService: Error adding to cart:', error);
      throw error;
    }
  }

  static async removeFromCart(productId: number) {
    try {
      const response = await api.post('/api/v1/cart/remove/', {
        product_id: productId
      });
      return response.data;
    } catch (error: any) {
      console.error('ProductService: Error removing from cart:', error);
      throw error;
    }
  }

  static async updateCartItemQuantity(productId: number, quantity: number) {
    try {
      const response = await api.post('/api/v1/cart/update-quantity/', {
        product_id: productId,
        quantity
      });
      return response.data;
    } catch (error: any) {
      console.error('ProductService: Error updating cart quantity:', error);
      throw error;
    }
  }

  static async clearCart() {
    try {
      const response = await api.post('/api/v1/cart/clear/');
      return response.data;
    } catch (error: any) {
      console.error('ProductService: Error clearing cart:', error);
      throw error;
    }
  }

  static async getProductReviews(slug: string) {
    console.log('ProductService: Getting reviews for product', slug);
    try {
      const response = await api.get(`/api/v1/products/${slug}/reviews/`);
      console.log('ProductService: Got reviews:', response.data);
      return response.data;
    } catch (error) {
      console.error('ProductService: Error getting reviews:', error);
      throw error;
    }
  }

  static async submitReview(slug: string, data: { rating: number; comment: string }) {
    console.log('ProductService: Submitting review for product', slug, data);
    try {
      const response = await api.post(`/api/v1/products/${slug}/reviews/`, data);
      console.log('ProductService: Review submitted:', response.data);
      return response.data;
    } catch (error) {
      console.error('ProductService: Error submitting review:', error);
      throw error;
    }
  }

  static async updateProductStock(productId: number, quantity: number): Promise<void> {
    try {
      console.log('ProductService: Making request to update product stock with parameters:', { productId, quantity });
      await api.post(`/api/v1/products/${productId}/update-stock/`, {
        quantity
      });
      console.log('ProductService: Successfully updated product stock');
    } catch (error: any) {
      console.error('ProductService: Error updating product stock:', error.message);
      console.error('ProductService: Error details:', error);
      throw error;
    }
  }

  static async toggleWishlist(productId: number): Promise<void> {
    try {
      console.log('ProductService: Making request to toggle wishlist for product:', productId);
      await api.post('/api/v1/wishlist/toggle/', { product_id: productId });
      console.log('ProductService: Successfully toggled wishlist');
    } catch (error: any) {
      console.error('ProductService: Error toggling wishlist:', error.message);
      console.error('ProductService: Error details:', error);
      throw error;
    }
  }

  static async checkWishlist(productId: number): Promise<boolean> {
    try {
      console.log('ProductService: Making request to check wishlist status for product:', productId);
      const response = await api.get(`/api/v1/wishlist/check/${productId}/`);
      console.log('ProductService: Successfully checked wishlist status:', response.data);
      return response.data.is_wishlisted;
    } catch (error: any) {
      console.error('ProductService: Error checking wishlist status:', error.message);
      console.error('ProductService: Error details:', error);
      return false;
    }
  }

  static async addReview(productId: number, rating: number, title: string, content: string): Promise<void> {
    try {
      console.log('ProductService: Making request to add review:', { productId, rating, title, content });
      await api.post(`/api/v1/products/${productId}/reviews/`, {
        rating,
        title,
        content
      });
      console.log('ProductService: Successfully added review');
    } catch (error: any) {
      console.error('ProductService: Error adding review:', error.message);
      console.error('ProductService: Error details:', error);
      throw error;
    }
  }

  static async getCBDEffects(): Promise<CBDEffect[]> {
    try {
      console.log('Fetching CBD effects...');
      const response = await api.get('/api/v1/effects/');
      console.log('Fetched CBD effects:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching CBD effects:', error);
      if (error.response) {
        console.log('Response data:', error.response.data);
        console.log('Response status:', error.response.status);
      }
      return [];
    }
  }
}
