import React, { useState, useEffect } from 'react';
import {
  Container,
  SimpleGrid,
  Box,
  Image,
  Text,
  HStack,
  Icon,
  VStack,
  Button,
  Select,
  Input,
  Flex,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { ProductService } from '../services/product.service';
import { Product, ProductCategory } from '../types/product';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  useEffect(() => {
    loadProducts();
  }, [category, searchQuery]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ProductService.getProducts(category, searchQuery);
      setProducts(response);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load products';
      setError(errorMessage);
      toast({
        title: 'Error loading products',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadProducts();
  };

  if (isLoading) {
    return (
      <Center minH="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text>Loading products...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error loading products</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
        <Button mt={4} onClick={loadProducts}>
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} width="100%">
        <Flex
          width="100%"
          gap={4}
          direction={{ base: 'column', md: 'row' }}
          mb={8}
        >
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory | '')}
            placeholder="All Categories"
          >
            <option value="FLOWERS">Flowers</option>
            <option value="EDIBLES">Edibles</option>
            <option value="CONCENTRATES">Concentrates</option>
            <option value="VAPES">Vapes</option>
            <option value="TINCTURES">Tinctures</option>
            <option value="TOPICALS">Topicals</option>
            <option value="ACCESSORIES">Accessories</option>
            <option value="PRE_ROLLS">Pre-Rolls</option>
            <option value="SEEDS">Seeds</option>
          </Select>
          <HStack flex={1}>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>Search</Button>
          </HStack>
        </Flex>

        {products.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Text fontSize="lg" color="gray.600">
              No products found. Try adjusting your search or category filter.
            </Text>
          </Box>
        ) : (
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
            spacing={6}
            width="100%"
          >
            {products.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}>
                <Box
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  transition="transform 0.2s"
                  _hover={{ transform: 'scale(1.02)' }}
                >
                  <Image
                    src={product.images[0]?.image || '/placeholder.jpg'}
                    alt={product.name}
                    height="200px"
                    width="100%"
                    objectFit="cover"
                    fallback={
                      <Center height="200px" bg="gray.100">
                        <Text color="gray.500">No image</Text>
                      </Center>
                    }
                  />
                  <Box p={4}>
                    <Text
                      fontWeight="semibold"
                      fontSize="lg"
                      noOfLines={2}
                      mb={2}
                    >
                      {product.name}
                    </Text>
                    <HStack justify="space-between" mb={2}>
                      <Text color="gray.600">{product.category}</Text>
                      <HStack>
                        <Icon as={FaStar} color="yellow.400" />
                        <Text>{product.average_rating.toFixed(1)}</Text>
                      </HStack>
                    </HStack>
                    <Text fontWeight="bold" fontSize="xl" color="green.600">
                      ${parseFloat(product.price).toFixed(2)}
                    </Text>
                  </Box>
                </Box>
              </Link>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
};
