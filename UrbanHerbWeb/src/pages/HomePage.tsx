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
  useColorModeValue
} from '@chakra-ui/react';
import { FaSearch, FaLeaf, FaShoppingCart, FaBook, FaFilter } from 'react-icons/fa';
import { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { mockProducts } from '../data/mockProducts';
import { ProductCategory } from '../types/product';
import { Cart } from '../components/Cart';
import { useCart } from '../contexts/CartContext';
import { useQuery } from 'react-query';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { motion } from 'framer-motion';
import { useLoading } from '../hooks/useLoading';
import { useErrorHandler } from '../hooks/useErrorHandler';
import LoadingSpinner from '../components/LoadingSpinner';

const categories: ProductCategory[] = [
  'Flowers',
  'Edibles',
  'Concentrates',
  'Vapes',
  'Pre-rolls',
  'Tinctures',
  'Topicals'
];

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { items: cartItems, loading: cartLoading } = useCart();
  const { isLoading, withLoading } = useLoading(true); // Start with loading state
  const { handleError } = useErrorHandler();
  const [products, setProducts] = useState([]);

  // Simulate fetching products
  const fetchProducts = async () => {
    try {
      await withLoading(
        new Promise((resolve) => {
          setTimeout(() => {
            setProducts(mockProducts);
            resolve(null);
          }, 1500);
        })
      );
    } catch (error) {
      handleError(error);
    }
  };

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

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
              colorScheme={selectedCategory === 'all' ? 'green' : 'gray'}
              onClick={() => setSelectedCategory('all')}
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
                {category}
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
          {filteredProducts.length === 0 ? (
            <VStack py={8} spacing={4}>
              <Text>No products found.</Text>
              <Button onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}>
                Clear Filters
              </Button>
            </VStack>
          ) : (
            filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </Grid>
      </Container>

      <Cart isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default HomePage;
