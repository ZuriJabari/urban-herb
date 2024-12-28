export type ProductCategory = 
  | 'FLOWERS' 
  | 'EDIBLES' 
  | 'CONCENTRATES' 
  | 'VAPES' 
  | 'TINCTURES' 
  | 'TOPICALS'
  | 'ACCESSORIES'
  | 'PRE_ROLLS'
  | 'SEEDS';

export type ProductEffect = 
  | 'RELAXING'
  | 'ENERGIZING'
  | 'CREATIVE'
  | 'SLEEPY'
  | 'FOCUSED'
  | 'UPLIFTED'
  | 'HAPPY'
  | 'PAIN_RELIEF'
  | 'STRESS_RELIEF'
  | 'ANXIETY_RELIEF';

export type StrainType = 
  | 'SATIVA'
  | 'INDICA'
  | 'HYBRID'
  | 'CBD'
  | 'NA';

export interface Brand {
  id: number;
  name: string;
  logo?: string;
  website: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  user: number;
  user_email: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  created_at: string;
  product: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: ProductCategory;
  brand: Brand;
  strain: string;
  thc_content: string;
  cbd_content: string;
  effects: string[];
  benefits: string[];
  lab_tested: boolean;
  stock: number;
  images: ProductImage[];
  reviews: any[];
  created_at: string;
  updated_at: string;
  average_rating: number;
  total_reviews: number;
  slug?: string;
  discount_price?: string;
  weight?: string;
  dosage?: string;
  ingredients?: string;
  usage_instructions?: string;
  warning?: string;
}
