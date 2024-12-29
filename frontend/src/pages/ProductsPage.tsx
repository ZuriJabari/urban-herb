import React, { useState } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Flex,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Select,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { FaSearch } from 'react-icons/fa';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import LoadingScreen from '../components/LoadingScreen';
import { Product, PaginatedResponse } from '../types';
import { ProductService } from '../services/product.service';

const SORT_OPTIONS = [
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating: Low to High' },
  { value: '-rating', label: 'Rating: High to Low' },
];

export default function ProductsPage() {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('-rating');
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 200,
    minTHC: 0,
    maxTHC: 100,
    minCBD: 0,
    maxCBD: 100,
    effects: [],
    categories: [],
  });

  // Construct query parameters
  const queryParams = new URLSearchParams({
    search: searchQuery,
    ordering: sortBy,
    min_price: filters.minPrice.toString(),
    max_price: filters.maxPrice.toString(),
    min_thc: filters.minTHC.toString(),
    max_thc: filters.maxTHC.toString(),
    min_cbd: filters.minCBD.toString(),
    max_cbd: filters.maxCBD.toString(),
    effects: filters.effects.join(','),
    categories: filters.categories.join(','),
  });

  console.log('Query params:', Object.fromEntries(queryParams.entries()));

  const { data, isLoading, error } = useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', queryParams.toString()],
    queryFn: () => ProductService.getProducts(queryParams),
    onError: (error: any) => {
      console.error('Query error:', error);
      toast({
        title: 'Error loading products',
        description: `Failed to load products: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  });

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleAddToCart = (product: Product) => {
    // TODO: Implement cart functionality
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (isLoading) return <LoadingScreen />;
  if (error) return (
    <Box p={8} textAlign="center">
      <Text color="red.500" fontSize="lg" mb={4}>
        Error loading products
      </Text>
      <Text color="gray.600">
        {error instanceof Error ? error.message : 'An unexpected error occurred'}
      </Text>
    </Box>
  );

  return (
    <Container maxW="7xl" py={8}>
      <Flex gap={8} flexDirection={{ base: 'column', md: 'row' }}>
        {/* Filters Section */}
        <Box w={{ base: '100%', md: '300px' }}>
          <ProductFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </Box>

        {/* Products Section */}
        <Box flex="1">
          <Stack spacing={4} mb={6}>
            {/* Search and Sort Controls */}
            <Flex gap={4} flexDirection={{ base: 'column', sm: 'row' }}>
              <InputGroup flex="1">
                <InputLeftElement>
                  <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              <Select
                w={{ base: '100%', sm: '200px' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Flex>
          </Stack>

          {/* Products Grid */}
          <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 3 }}
            spacing={6}
            w="100%"
          >
            {data?.results?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
            {data?.results?.length === 0 && (
              <Box gridColumn="1/-1" textAlign="center" py={8}>
                <Text fontSize="lg" color="gray.600">
                  No products found matching your criteria
                </Text>
              </Box>
            )}
          </SimpleGrid>
        </Box>
      </Flex>
    </Container>
  );
}
