export interface PriceRange {
  min: number;
  max: number;
}

export interface SearchFilters {
  categories: string[];
  effects: string[];
  benefits: string[];
  brands: string[];
  priceRange: PriceRange;
  cbdContent?: {
    min: number;
    max: number;
  };
  labTested?: boolean;
  inStock?: boolean;
  rating?: number;
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export interface SearchResults {
  products: {
    id: string;
    score: number; // Relevance score
  }[];
  totalResults: number;
  facets: {
    categories: { [key: string]: number };
    effects: { [key: string]: number };
    benefits: { [key: string]: number };
    brands: { [key: string]: number };
    priceRanges: { [key: string]: number };
  };
  suggestedSearches: string[];
}

export interface SearchContextType {
  filters: SearchFilters;
  results: SearchResults | null;
  isLoading: boolean;
  error: Error | null;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  search: (query: string) => Promise<void>;
  getSuggestions: (query: string) => Promise<string[]>;
  getFacets: () => Promise<SearchResults['facets']>;
}
