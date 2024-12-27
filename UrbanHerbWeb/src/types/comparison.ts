import { Product } from './product';

export interface ComparisonFeature {
  name: string;
  key: keyof Product | string;
  type: 'text' | 'number' | 'boolean' | 'array' | 'rating';
  unit?: string;
  description?: string;
}

export interface ComparisonGroup {
  name: string;
  features: ComparisonFeature[];
}

export interface ComparisonData {
  products: Product[];
  differences: {
    [key: string]: boolean;
  };
  similarities: {
    [key: string]: boolean;
  };
}

export interface ComparisonContextType {
  maxItems: number;
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearAll: () => void;
  getComparison: () => ComparisonData;
  getSimilarProducts: (product: Product) => Product[];
}
