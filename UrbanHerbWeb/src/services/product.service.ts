import api from './axios';
import { Product, ProductCategory } from '../types/product';

export class ProductService {
  static async getProducts(category?: ProductCategory | '', search?: string): Promise<Product[]> {
    try {
      console.log('ProductService: Making request to fetch products with parameters:', { category, search });
      const params: Record<string, string> = {};
      if (category) params.category = category;
      if (search) params.search = search;

      const response = await api.get('/api/v1/products/', { params });
      console.log('ProductService: Successfully fetched products:', response.data);
      return response.data || [];
    } catch (error: any) {
      console.error('ProductService: Error fetching products:', error.message);
      console.error('ProductService: Error details:', error);
      throw error;
    }
  }

  static async getProduct(id: number): Promise<Product> {
    try {
      console.log('ProductService: Making request to fetch product with id:', id);
      const response = await api.get(`/api/v1/products/${id}/`);
      console.log('ProductService: Successfully fetched product:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('ProductService: Error fetching product:', error.message);
      console.error('ProductService: Error details:', error);
      throw error;
    }
  }

  static async getRelatedProducts(category: ProductCategory, currentProductId: number, limit: number = 4): Promise<Product[]> {
    try {
      console.log('ProductService: Making request to fetch related products with parameters:', { category, currentProductId, limit });
      const response = await api.get('/api/v1/products/', {
        params: {
          category,
          exclude_id: currentProductId,
          limit
        }
      });
      console.log('ProductService: Successfully fetched related products:', response.data);
      return response.data || [];
    } catch (error: any) {
      console.error('ProductService: Error fetching related products:', error.message);
      console.error('ProductService: Error details:', error);
      throw error;
    }
  }

  static async getProductReviews(productId: number): Promise<Product['reviews']> {
    try {
      console.log('ProductService: Making request to fetch product reviews with product id:', productId);
      const response = await api.get(`/api/v1/products/${productId}/reviews/`);
      console.log('ProductService: Successfully fetched product reviews:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('ProductService: Error fetching product reviews:', error.message);
      console.error('ProductService: Error details:', error);
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

  static async addToCart(productId: number, quantity: number = 1): Promise<void> {
    try {
      console.log('ProductService: Making request to add product to cart:', { productId, quantity });
      await api.post('/api/v1/cart/add/', { product_id: productId, quantity });
      console.log('ProductService: Successfully added product to cart');
    } catch (error: any) {
      console.error('ProductService: Error adding product to cart:', error.message);
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
      console.log('ProductService: Making request to check wishlist for product:', productId);
      const response = await api.get(`/api/v1/wishlist/check/${productId}/`);
      console.log('ProductService: Successfully checked wishlist:', response.data);
      return response.data.in_wishlist;
    } catch (error: any) {
      console.error('ProductService: Error checking wishlist:', error.message);
      console.error('ProductService: Error details:', error);
      throw error;
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
}
