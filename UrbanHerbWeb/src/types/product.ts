export interface CBDEffect {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text?: string;
  is_primary: boolean;
}

export interface ProductReview {
  id: number;
  user: {
    id: number;
    username: string;
  };
  rating: number;
  title: string;
  content: string;
  created_at: string;
}

export interface ProductEffect {
  id: number;
  name: string;
  description: string;
}

export interface ProductBrand {
  id: number;
  name: string;
  logo?: string;
  description?: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  stock: number;
  category: string;
  strain?: string;
  thc_content?: string;
  cbd_content?: string;
  weight?: string;
  lab_tested: boolean;
  featured: boolean;
  average_rating: number;
  review_count: number;
  usage_instructions?: string;
  warning?: string;
  images: ProductImage[];
  effects: ProductEffect[];
  brand?: ProductBrand;
}

export interface ProductFilters {
  category?: string;
  effects?: number[];
  searchQuery?: string;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  featured?: boolean;
}

export type SortOption = {
  value: string;
  label: string;
}
