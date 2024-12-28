import { 
  Box, 
  Container, 
  Grid, 
  Heading, 
  Text,
  HStack,
  Button,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Flex,
  IconButton,
  useDisclosure,
  Badge,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { FaSearch, FaLeaf, FaShoppingCart, FaBook } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Product, ProductCategory } from '../types/product';
import { Cart } from '../components/Cart';
import { useCart } from '../contexts/CartContext';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { motion } from 'framer-motion';
import { useLoading } from '../hooks/useLoading';
import { useErrorHandler } from '../hooks/useErrorHandler';
import LoadingSpinner from '../components/LoadingSpinner';
import { ProductService } from '../services/product.service';

const categories: ProductCategory[] = [
  'FLOWERS',
  'EDIBLES',
  'CONCENTRATES',
  'VAPES',
  'PRE_ROLLS',
  'TINCTURES',
  'TOPICALS',
  'ACCESSORIES',
  'SEEDS'
];

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { items: cartItems, loading: cartLoading } = useCart();
  const { isLoading, withLoading } = useLoading(true);
  const { handleError } = useErrorHandler();
  const [products, setProducts] = useState<Product[]>([]);
  const toast = useToast();

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      console.log('Fetching products with:', { selectedCategory, searchQuery });
      const fetchedProducts = await ProductService.getProducts(selectedCategory, searchQuery);
      console.log('Fetched products:', fetchedProducts);
      setProducts(fetchedProducts);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      const errorMessage = error.message || 'Failed to fetch products';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setProducts([]);
    }
  };

  // Fetch products when category or search changes
  useEffect(() => {
    withLoading(fetchProducts());
  }, [selectedCategory, searchQuery]);

  if (isLoading || cartLoading) {
    return (
      <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh" py={8}>
        <LoadingOverlay isLoading={isLoading || cartLoading} text="Loading products..." />
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8}>
            <Heading>Our Products</Heading>
            <LoadingSpinner text="Loading products..." />
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh" py={8}>
      <LoadingOverlay isLoading={isLoading || cartLoading} text="Loading products..." />
      
      <Box bg="green.500" color="white" py={4}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <HStack spacing={2}>
              <Icon as={FaLeaf} w={6} h={6} />
              <Heading size="lg">UrbanHerb</Heading>
            </HStack>
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/education"
                colorScheme="whiteAlpha"
                leftIcon={<Icon as={FaBook} />}
              >
                Learn
              </Button>
              <Box position="relative">
                <IconButton
                  aria-label="Shopping cart"
                  icon={<Icon as={FaShoppingCart} />}
                  colorScheme="whiteAlpha"
                  onClick={onOpen}
                />
                {cartItems.length > 0 && (
                  <Badge
                    position="absolute"
                    top="-2"
                    right="-2"
                    colorScheme="red"
                    borderRadius="full"
                    px={2}
                  >
                    {cartItems.length}
                  </Badge>
                )}
              </Box>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        {/* Search and Filter Section */}
        <VStack spacing={6} mb={10}>
          <InputGroup maxW="600px">
            <InputLeftElement>
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="white"
            />
          </InputGroup>

          <HStack spacing={4} overflowX="auto" pb={2} width="100%">
            <Button
              colorScheme={selectedCategory === '' ? 'green' : 'gray'}
              onClick={() => setSelectedCategory('')}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                colorScheme={selectedCategory === category ? 'green' : 'gray'}
                onClick={() => setSelectedCategory(category)}
                whiteSpace="nowrap"
              >
                {category.replace('_', ' ')}
              </Button>
            ))}
          </HStack>
        </VStack>

        {/* Products Grid */}
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
            xl: 'repeat(4, 1fr)',
          }}
          gap={6}
        >
          {products.length === 0 ? (
            <VStack py={8} spacing={4}>
              <Text>No products found.</Text>
              <Button onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
              }}>
                Clear Filters
              </Button>
            </VStack>
          ) : (
            products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </Grid>
      </Container>

      {/* Shopping Cart Drawer */}
      <Cart isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default HomePage;
