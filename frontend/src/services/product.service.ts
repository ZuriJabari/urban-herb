import { apiClient, publicApiClient } from './api';
import { Product, Category, Effect, PaginatedResponse, CBDEffect } from '../types';

interface ProductParams {
  category?: string;
  effects?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  page?: number;
  page_size?: number;
}

export class ProductService {
  static async testConnection(): Promise<boolean> {
    try {
      console.log('Testing API connection...');
      const response = await publicApiClient.get<PaginatedResponse<Product>>('/products/');
      console.log('API connection test response:', response);
      return true;
    } catch (error: any) {
      console.error('API connection test failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          baseURL: error.config?.baseURL,
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      return false;
    }
  }

  static async getProducts(params: URLSearchParams): Promise<PaginatedResponse<Product>> {
    try {
      // First test the connection
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error('API connection test failed');
      }

      // Convert URLSearchParams to a plain object
      const paramsObject = Object.fromEntries(params.entries());
      console.log('Fetching products with params:', paramsObject);
      console.log('API base URL:', publicApiClient.defaults.baseURL);
      
      // Log the full URL being requested
      const url = '/products/';
      console.log('Full request URL:', `${publicApiClient.defaults.baseURL}${url}`);
      console.log('Request headers:', publicApiClient.defaults.headers);
      
      const response = await publicApiClient.get<PaginatedResponse<Product>>(url, { 
        params: paramsObject,
        headers: {
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      
      console.log('Products response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching products:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          baseURL: error.config?.baseURL,
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          params: error.config?.params
        },
        stack: error.stack
      });
      throw error;
    }
  }

  static async getProduct(slug: string): Promise<Product | null> {
    try {
      const response = await publicApiClient.get<Product>(`/products/${slug}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  static async getCategories(): Promise<Category[]> {
    try {
      const response = await publicApiClient.get<Category[]>('/products/categories/');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  static async getEffects(): Promise<CBDEffect[]> {
    try {
      const response = await publicApiClient.get<{ results: CBDEffect[] }>('/effects/');
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching effects:', error);
      return [];
    }
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      const response = await publicApiClient.get<PaginatedResponse<Product>>('/products/', {
        params: { featured: true, page_size: 4 }
      });
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }

  static async getRelatedProducts(productId: number): Promise<Product[]> {
    try {
      const response = await publicApiClient.get<Product[]>(`/products/${productId}/related/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching related products:', error);
      return [];
    }
  }
}
