import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Image,
  Button,
  VStack,
  HStack,
  Badge,
  useToast,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Flex,
  IconButton,
  List,
  ListItem,
  ListIcon,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FaHeart, FaRegHeart, FaMinus, FaPlus, FaLeaf, FaCheck, FaShoppingCart } from 'react-icons/fa';
import { Product } from '../types/product';
import { ProductService } from '../services/product.service';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/formatters';
import ReviewSection from '../components/ReviewSection';
import { motion } from 'framer-motion';
import ErrorBoundary from '../components/ErrorBoundary'; // Update import to use default import

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  
  const { addToCart } = useCart();
  const { user } = useAuth() || {};
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setError('Product not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('ProductDetailPage: Fetching product with slug:', slug);
        const productData = await ProductService.getProductBySlug(slug);
        console.log('ProductDetailPage: Product data received:', productData);
        setProduct(productData);
      } catch (error: any) {
        console.error('ProductDetailPage: Error fetching product:', error);
        const errorMessage = error.response?.status === 404 
          ? 'Product not found' 
          : 'Failed to load product details';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, toast]);

  // Early return for loading state
  if (loading) {
    return (
      <Box p={8} display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  // Early return for error state
  if (error || !product) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Error</AlertTitle>
          <AlertDescription>{error || 'Product not found'}</AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container maxW="container.xl" py={8}>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={8}>
          {/* Product Images */}
          <Box>
            <Image
              src={product.images[0]?.image || '/placeholder.jpg'}
              alt={product.name}
              borderRadius="lg"
              width="100%"
              height="auto"
              objectFit="cover"
            />
          </Box>

          {/* Product Info */}
          <VStack align="stretch" spacing={4}>
            <Badge colorScheme="green" fontSize="sm">
              {product.category}
            </Badge>

            <Heading size="xl">{product.name}</Heading>

            <Text fontSize="2xl" fontWeight="bold" color="green.500">
              {formatPrice(product.price)}
            </Text>

            <Text color="gray.600">{product.description}</Text>

            <HStack spacing={4}>
              <Button
                leftIcon={<FaShoppingCart />}
                colorScheme="green"
                size="lg"
                onClick={() => addToCart(product, 1)}
                isDisabled={product.stock <= 0}
              >
                Add to Cart
              </Button>

              <IconButton
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                icon={isInWishlist ? <FaHeart /> : <FaRegHeart />}
                size="lg"
                colorScheme="pink"
                variant={isInWishlist ? "solid" : "outline"}
                isLoading={loadingWishlist}
              />
            </HStack>

            <Box borderTop="1px" borderColor="gray.200" pt={4}>
              <Text fontWeight="bold" mb={2}>Product Details:</Text>
              <List spacing={2}>
                {product.strain && (
                  <ListItem>
                    <ListIcon as={FaLeaf} color="green.500" />
                    Strain: {product.strain}
                  </ListItem>
                )}
                {product.thc_content && (
                  <ListItem>
                    <ListIcon as={FaCheck} color="green.500" />
                    THC Content: {product.thc_content}
                  </ListItem>
                )}
                {product.cbd_content && (
                  <ListItem>
                    <ListIcon as={FaCheck} color="green.500" />
                    CBD Content: {product.cbd_content}
                  </ListItem>
                )}
              </List>
            </Box>
          </VStack>
        </Grid>
      </Container>
    </ErrorBoundary>
  );
};

export default ProductDetailPage;
