import React, { createContext, useContext, useState, useCallback } from 'react';
import { SearchContextType, SearchFilters, SearchResults } from '../types/search';
import { mockProducts } from '../data/mockProducts';

const defaultFilters: SearchFilters = {
  categories: [],
  effects: [],
  benefits: [],
  brands: [],
  priceRange: { min: 0, max: 1000 },
  sortBy: 'relevance'
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call with mock data
      const filteredProducts = mockProducts.filter(product => {
        const matchesQuery = query.toLowerCase().split(' ').every(term =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term) ||
          product.effects.some(effect => effect.toLowerCase().includes(term)) ||
          product.benefits.some(benefit => benefit.toLowerCase().includes(term))
        );

        const matchesCategories = filters.categories.length === 0 ||
          filters.categories.includes(product.category);

        const matchesEffects = filters.effects.length === 0 ||
          product.effects.some(effect => filters.effects.includes(effect));

        const matchesBenefits = filters.benefits.length === 0 ||
          product.benefits.some(benefit => filters.benefits.includes(benefit));

        const matchesBrands = filters.brands.length === 0 ||
          filters.brands.includes(product.brand);

        const matchesPrice = product.price >= filters.priceRange.min &&
          product.price <= filters.priceRange.max;

        const matchesCBD = !filters.cbdContent ||
          (parseFloat(product.cbdContent) >= filters.cbdContent.min &&
           parseFloat(product.cbdContent) <= filters.cbdContent.max);

        const matchesLabTested = !filters.labTested || product.labTested;

        return matchesQuery &&
               matchesCategories &&
               matchesEffects &&
               matchesBenefits &&
               matchesBrands &&
               matchesPrice &&
               matchesCBD &&
               matchesLabTested;
      });

      // Sort results
      const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (filters.sortBy) {
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'rating':
            return b.rating - a.rating;
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      });

      // Calculate facets
      const facets = {
        categories: {} as { [key: string]: number },
        effects: {} as { [key: string]: number },
        benefits: {} as { [key: string]: number },
        brands: {} as { [key: string]: number },
        priceRanges: {} as { [key: string]: number }
      };

      filteredProducts.forEach(product => {
        // Categories
        facets.categories[product.category] = (facets.categories[product.category] || 0) + 1;

        // Effects
        product.effects.forEach(effect => {
          facets.effects[effect] = (facets.effects[effect] || 0) + 1;
        });

        // Benefits
        product.benefits.forEach(benefit => {
          facets.benefits[benefit] = (facets.benefits[benefit] || 0) + 1;
        });

        // Brands
        facets.brands[product.brand] = (facets.brands[product.brand] || 0) + 1;

        // Price ranges
        const priceRange = `${Math.floor(product.price / 50) * 50}-${Math.floor(product.price / 50) * 50 + 50}`;
        facets.priceRanges[priceRange] = (facets.priceRanges[priceRange] || 0) + 1;
      });

      // Generate suggested searches
      const suggestedSearches = Array.from(new Set([
        ...filteredProducts.flatMap(p => p.effects),
        ...filteredProducts.flatMap(p => p.benefits),
        ...filteredProducts.map(p => p.category)
      ])).slice(0, 5);

      setResults({
        products: sortedProducts.map(p => ({ id: p.id, score: 1 })),
        totalResults: sortedProducts.length,
        facets,
        suggestedSearches
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred during search'));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const getSuggestions = async (query: string) => {
    // Simulate API call for search suggestions
    const allTerms = mockProducts.flatMap(p => [
      p.name,
      p.category,
      ...p.effects,
      ...p.benefits,
      p.brand
    ]);

    return Array.from(new Set(
      allTerms.filter(term =>
        term.toLowerCase().includes(query.toLowerCase())
      )
    )).slice(0, 5);
  };

  const getFacets = async () => {
    return results?.facets || {
      categories: {},
      effects: {},
      benefits: {},
      brands: {},
      priceRanges: {}
    };
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <SearchContext.Provider
      value={{
        filters,
        results,
        isLoading,
        error,
        setFilters: updateFilters,
        resetFilters,
        search,
        getSuggestions,
        getFacets
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
