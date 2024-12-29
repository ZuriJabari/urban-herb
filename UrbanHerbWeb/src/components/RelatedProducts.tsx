import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Image,
  Text,
  Link,
  useColorModeValue,
  VStack,
  Skeleton,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ProductService } from '../services/product.service';
import { StarRating } from './StarRating';
import { Product } from '../types/product';

interface RelatedProductsProps {
  productId: number;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ productId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setIsLoading(true);
        const data = await ProductService.getRelatedProducts(productId);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId]);

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {[1, 2, 3, 4].map((index) => (
          <Skeleton key={index} height="300px" />
        ))}
      </SimpleGrid>
    );
  }

  if (products.length === 0) {
    return (
      <Text color="gray.500" textAlign="center">
        No related products found
      </Text>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
      {products.map((product) => (
        <Link
          key={product.id}
          as={RouterLink}
          to={`/products/${product.id}`}
          _hover={{ textDecoration: 'none' }}
        >
          <Box
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
            overflow="hidden"
            bg={bgColor}
            transition="transform 0.2s"
            _hover={{ transform: 'scale(1.02)' }}
          >
            <Image
              src={product.images[0]?.url || 'https://via.placeholder.com/300'}
              alt={product.name}
              height="200px"
              width="100%"
              objectFit="cover"
            />
            <VStack p={4} align="start" spacing={2}>
              <Text fontWeight="semibold" noOfLines={2}>
                {product.name}
              </Text>
              <StarRating rating={product.average_rating || 0} size="14px" />
              <Text color="green.500" fontWeight="bold">
                ${product.price}
              </Text>
            </VStack>
          </Box>
        </Link>
      ))}
    </SimpleGrid>
  );
};
