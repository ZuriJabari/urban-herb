import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  useBreakpointValue
} from '@chakra-ui/react';
import { Product } from '../types/product';
import { mockProducts } from '../data/mockProducts';
import { ProductCard } from './ProductCard';

interface ProductRecommendationsProps {
  currentProduct: Product;
  recommendationType?: 'similar' | 'complementary';
}

export const ProductRecommendations = ({
  currentProduct,
  recommendationType = 'similar'
}: ProductRecommendationsProps) => {
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 });

  const getRecommendations = (): Product[] => {
    if (recommendationType === 'similar') {
      // Return products in the same category
      return mockProducts
        .filter(p => 
          p.id !== currentProduct.id && 
          p.category === currentProduct.category
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    } else {
      // Return complementary products based on effects or benefits
      return mockProducts
        .filter(p => 
          p.id !== currentProduct.id &&
          p.category !== currentProduct.category &&
          (
            p.effects.some(effect => currentProduct.effects.includes(effect)) ||
            p.benefits.some(benefit => currentProduct.benefits.includes(benefit))
          )
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    }
  };

  const recommendations = getRecommendations();

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">
          {recommendationType === 'similar' 
            ? 'Similar Products'
            : 'You Might Also Like'}
        </Heading>
        
        <Text color="gray.600">
          {recommendationType === 'similar'
            ? 'Products similar to what you\'re viewing'
            : 'Complementary products that work well together'}
        </Text>

        <SimpleGrid columns={columns} spacing={6}>
          {recommendations.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};
