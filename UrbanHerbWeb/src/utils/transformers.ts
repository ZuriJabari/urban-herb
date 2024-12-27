import { Product } from '../types/product';

/**
 * Transforms API response data to match frontend types
 * Handles:
 * - String to number conversions
 * - snake_case to camelCase conversions
 * - Null/undefined handling
 */
export const transformProductData = (data: any): Product => {
  return {
    ...data,
    // Convert string prices to numbers
    price: parseFloat(data.price),
    discountPrice: data.discount_price ? parseFloat(data.discount_price) : null,
    rating: parseFloat(data.rating),
    
    // Convert snake_case to camelCase
    reviewCount: data.review_count,
    labTested: data.lab_tested,
    thcContent: data.thc_content,
    cbdContent: data.cbd_content,
    
    // Ensure arrays exist
    effects: data.effects || [],
    benefits: data.benefits || [],
    images: data.images || [],
    reviews: data.reviews || []
  };
};

/**
 * Type guard to check if a value is a valid number
 */
export const isValidNumber = (value: any): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num);
};
