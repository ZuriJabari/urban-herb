import { Product } from '../types/product';

/**
 * Transforms API response data to match frontend types
 * Handles:
 * - String to number conversions
 * - snake_case to camelCase conversions
 * - Null/undefined handling
 */
export const transformProductData = (data: any): Product => {
  if (!data) {
    console.error('No data provided to transformProductData');
    throw new Error('No data provided to transform');
  }

  if (!data.id) {
    console.error('Data missing required id field:', data);
    throw new Error('Data missing required id field');
  }

  console.log('Transforming product data:', data);
  
  const transformed = {
    id: data.id,
    name: data.name || '',
    description: data.description || '',
    price: data.price?.toString() || '0',
    category: data.category || 'ACCESSORIES',
    brand: data.brand || {
      id: 0,
      name: '',
      description: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    strain: data.strain || 'NA',
    thc_content: data.thc_content || '0%',
    cbd_content: data.cbd_content || '0mg',
    effects: Array.isArray(data.effects) ? data.effects : [],
    benefits: Array.isArray(data.benefits) ? data.benefits : [],
    lab_tested: Boolean(data.lab_tested),
    stock: Number(data.stock) || 0,
    images: Array.isArray(data.images) ? data.images : [],
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
    average_rating: Number(data.average_rating) || 0,
    total_reviews: Number(data.total_reviews) || 0,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString()
  };

  console.log('Transformed product data:', transformed);
  return transformed;
};

/**
 * Type guard to check if a value is a valid number
 */
export const isValidNumber = (value: any): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num);
};
