export type ProductCategory = 
  | 'FLOWERS' 
  | 'EDIBLES' 
  | 'CONCENTRATES' 
  | 'VAPES' 
  | 'PRE_ROLLS' 
  | 'TINCTURES' 
  | 'TOPICALS'
  | 'CAPSULES';

export type ProductEffect = 
  | 'RELAXING' 
  | 'ENERGIZING' 
  | 'CREATIVE' 
  | 'FOCUSED' 
  | 'CALMING';

export type StrainType = 
  | 'INDICA'
  | 'SATIVA'
  | 'HYBRID';

export interface Brand {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
}

export interface ProductImage {
  id: string;
  image: string;
  alt_text?: string;
  is_primary: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: ProductCategory;
  strain?: StrainType;
  thc_content?: string;
  cbd_content?: string;
  effects: ProductEffect[];
  benefits: string[];
  stock: number;
  rating: number;
  review_count: number;
  brand: Brand;
  lab_tested: boolean;
  weight?: string;
  dosage?: string;
  additional_images?: ProductImage[];
  reviews?: Review[];
  created_at: string;
}
