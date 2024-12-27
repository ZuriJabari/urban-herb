import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Icon,
  Button,
  Select,
  Skeleton,
  Alert,
  AlertIcon,
  Flex,
  useBreakpointValue
} from '@chakra-ui/react';
import { FaSort } from 'react-icons/fa';
import { useSearch } from '../contexts/SearchContext';
import { ProductCard } from './ProductCard';
import { mockProducts } from '../data/mockProducts';

export const SearchResults = () => {
  const { results, isLoading, error, filters, setFilters } = useSearch();
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3, xl: 4 });

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error.message}
      </Alert>
    );
  }

  const displayProducts = results?.products.map(
    result => mockProducts.find(p => p.id === result.id)
  ).filter(Boolean) || [];

  const renderSkeletons = () => (
    <Grid templateColumns={`repeat(${columns}, 1fr)`} gap={6}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Box key={i} borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Skeleton height="200px" />
          <VStack p={4} spacing={2}>
            <Skeleton height="20px" width="80%" />
            <Skeleton height="16px" width="60%" />
            <Skeleton height="16px" width="40%" />
          </VStack>
        </Box>
      ))}
    </Grid>
  );

  return (
    <VStack spacing={6} align="stretch">
      {/* Results Header */}
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={4}
      >
        <Text fontSize="lg" fontWeight="bold">
          {results
            ? `${results.totalResults} Products Found`
            : 'Search for Products'
          }
        </Text>

        <HStack spacing={4}>
          <HStack>
            <Icon as={FaSort} />
            <Select
              value={filters.sortBy}
              onChange={(e) => setFilters({ sortBy: e.target.value as any })}
              size="sm"
              width="auto"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
            </Select>
          </HStack>

          <Select
            value={columns}
            onChange={(e) => {
              // This would typically update a view preference in user settings
              console.log('Grid columns:', e.target.value);
            }}
            size="sm"
            width="auto"
          >
            <option value={2}>2 Columns</option>
            <option value={3}>3 Columns</option>
            <option value={4}>4 Columns</option>
          </Select>
        </HStack>
      </Flex>

      {/* Results Grid */}
      {isLoading ? (
        renderSkeletons()
      ) : displayProducts.length > 0 ? (
        <Grid templateColumns={`repeat(${columns}, 1fr)`} gap={6}>
          {displayProducts.map((product) => (
            product && <ProductCard key={product.id} product={product} />
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.600">
            No products found matching your criteria.
          </Text>
          <Button
            mt={4}
            colorScheme="green"
            variant="outline"
            onClick={() => setFilters({ categories: [], effects: [], benefits: [], brands: [] })}
          >
            Clear Filters
          </Button>
        </Box>
      )}

      {/* Load More Button */}
      {results && results.totalResults > displayProducts.length && (
        <Button
          colorScheme="green"
          variant="outline"
          size="lg"
          width="100%"
          mt={4}
          onClick={() => {
            // This would typically load the next page of results
            console.log('Load more results');
          }}
        >
          Load More
        </Button>
      )}
    </VStack>
  );
};
