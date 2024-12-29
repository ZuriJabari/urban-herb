import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  SimpleGrid,
  Box,
  Text,
  HStack,
  Icon,
  VStack,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Button,
  Flex,
  Select,
  Heading,
} from '@chakra-ui/react';
import { FaStar, FaSearch, FaFilter } from 'react-icons/fa';
import { ProductService } from '../services/product.service';
import { Product } from '../types/product';
import { ProductCard } from '../components/ProductCard';
import { ProductFiltersPanel } from '../components/ProductFilters';
import { useDebounce } from '../hooks/useDebounce';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_FILTERS = {
  category: '',
  minPrice: 0,
  maxPrice: 200,
  minRating: 0,
  inStock: false,
  sortBy: 'newest',
  searchQuery: '',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Highest Rated' },
];

export const ProductsPage: React.FC = () => {
  // URL params
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(() => {
    // Initialize filters from URL params or defaults
    const initialFilters = { ...DEFAULT_FILTERS };
    searchParams.forEach((value, key) => {
      if (key in DEFAULT_FILTERS) {
        if (key === 'inStock') {
          initialFilters[key] = value === 'true';
        } else if (['minPrice', 'maxPrice', 'minRating'].includes(key)) {
          initialFilters[key] = Number(value);
        } else {
          initialFilters[key] = value;
        }
      }
    });
    console.log('Initial filters:', initialFilters);
    return initialFilters;
  });

  // Hooks
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const [debouncedFilters] = useDebounce(filters, 500);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      console.log('Fetching products with filters:', debouncedFilters);
      setIsLoading(true);
      setError(null);

      const response = await ProductService.getProducts(debouncedFilters);
      console.log('Products response:', response);

      if (!response || response.length === 0) {
        console.log('No products found');
        setProducts([]);
        return;
      }

      setProducts(response);
      console.log('Products loaded:', response.length);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Failed to load products');
      toast({
        title: 'Error',
        description: error.message || 'Failed to load products',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedFilters, toast]);

  // Effects
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams();
    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== DEFAULT_FILTERS[key]) {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  }, [debouncedFilters, setSearchParams]);

  // Handlers
  const handleFilterChange = (newFilters: Partial<typeof DEFAULT_FILTERS>) => {
    console.log('Filter change:', newFilters);
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = event.target.value;
    console.log('Search query:', searchQuery);
    handleFilterChange({ searchQuery });
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sortBy = event.target.value;
    console.log('Sort change:', sortBy);
    handleFilterChange({ sortBy });
  };

  const resetFilters = () => {
    console.log('Resetting filters');
    setFilters(DEFAULT_FILTERS);
    setSearchParams(new URLSearchParams());
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading products...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Heading size="lg">Products</Heading>
          <HStack spacing={4}>
            <Button
              leftIcon={<FaFilter />}
              onClick={() => setShowFilters(!showFilters)}
              display={{ base: 'flex', md: 'none' }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Select
              value={filters.sortBy}
              onChange={handleSortChange}
              w={{ base: 'full', md: '200px' }}
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </HStack>
        </Flex>

        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Grid
          templateColumns={{ base: '1fr', md: '250px 1fr' }}
          gap={6}
        >
          {/* Filters Panel */}
          <GridItem display={{ base: showFilters ? 'block' : 'none', md: 'block' }}>
            <ProductFiltersPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={resetFilters}
            />
          </GridItem>

          {/* Products Grid */}
          <GridItem>
            {/* Search Bar */}
            <VStack spacing={6} align="stretch">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search products..."
                  value={filters.searchQuery}
                  onChange={handleSearchChange}
                  bg={bgColor}
                />
              </InputGroup>

              {/* Products */}
              {products.length > 0 ? (
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </SimpleGrid>
              ) : (
                <Center py={10}>
                  <VStack spacing={3}>
                    <Text>No products found</Text>
                    <Button onClick={resetFilters} colorScheme="blue">
                      Reset Filters
                    </Button>
                  </VStack>
                </Center>
              )}
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  );
};

export default ProductsPage;
