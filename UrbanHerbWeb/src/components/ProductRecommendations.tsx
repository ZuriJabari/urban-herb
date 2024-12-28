import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  useBreakpointValue,
  Skeleton
} from '@chakra-ui/react';
import { Product } from '../types/product';
import { ProductCard } from './ProductCard';
import { useState, useEffect } from 'react';
import api from '../services/api';

interface ProductRecommendationsProps {
  currentProduct: Product;
  recommendationType?: 'similar' | 'complementary';
}

export const ProductRecommendations = ({
  currentProduct,
  recommendationType = 'similar'
}: ProductRecommendationsProps) => {
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 });
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        // Fetch all products
        const response = await api.get('/api/v1/products/');
        const allProducts = response.data;

        let filtered = allProducts.filter((p: Product) => p.id !== currentProduct.id);

        if (recommendationType === 'similar') {
          // Filter products in the same category
          filtered = filtered.filter((p: Product) => 
            p.category === currentProduct.category
          );
        } else {
          // Filter complementary products
          filtered = filtered.filter((p: Product) => 
            p.category !== currentProduct.category &&
            (
              p.effects.some(effect => currentProduct.effects.includes(effect)) ||
              p.benefits.some(benefit => currentProduct.benefits.includes(benefit))
            )
          );
        }

        // Sort by average rating and take top 3
        setRecommendations(
          filtered
            .sort((a: Product, b: Product) => b.average_rating - a.average_rating)
            .slice(0, 3)
        );
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setError('Failed to load recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentProduct) {
      fetchRecommendations();
    }
  }, [currentProduct, recommendationType]);

  if (error) {
    return (
      <Box py={8}>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box py={8}>
        <Heading size="md" mb={4}>
          {recommendationType === 'similar' ? 'Similar Products' : 'You Might Also Like'}
        </Heading>
        <SimpleGrid columns={columns || 1} spacing={6}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="300px" />
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Box py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="md">
          {recommendationType === 'similar' ? 'Similar Products' : 'You Might Also Like'}
        </Heading>
        <SimpleGrid columns={columns || 1} spacing={6}>
          {recommendations.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};
