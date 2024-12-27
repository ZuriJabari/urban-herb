import {
  Box,
  Container,
  Grid,
  Image,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Icon,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  List,
  ListItem,
  ListIcon,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaLeaf, FaCheck, FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../types/product';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { ProductRecommendations } from '../components/ProductRecommendations';
import { Reviews } from '../components/Reviews';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { useState, useEffect } from 'react';

export const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const toast = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        console.error('No product ID provided');
        setError('Invalid product ID');
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Fetching product with ID:', id);
        const response = await api.get(`/api/v1/products/${id}/`);
        console.log('Raw API response:', response);
        
        if (!response.data) {
          console.error('No data in API response');
          setError('Failed to load product details - no data received');
          return;
        }

        console.log('Setting product data:', response.data);
        setProduct(response.data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          config: err.config
        });
        setError('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    console.log('ProductDetailsPage mounted with ID:', id);
    fetchProduct();
  }, [id]);

  // Early return if no ID
  if (!id) {
    console.log('Rendering: No product ID');
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Invalid product ID
        </Alert>
      </Container>
    );
  }

  // Show loading state
  if (isLoading) {
    console.log('Rendering: Loading state');
    return (
      <Container maxW="container.xl" py={8}>
        <LoadingSpinner />
      </Container>
    );
  }

  // Show error state
  if (error || !product) {
    console.log('Rendering: Error state', { error, product });
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error || 'Product not found'}
        </Alert>
      </Container>
    );
  }

  console.log('Rendering: Product details', product);

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.image || '',
      quantity: 1
    });
    
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const toggleWishlist = () => {
    if (!product) return;
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: 'Removed from wishlist',
        status: 'info',
        duration: 2000,
      });
    } else {
      addToWishlist(product);
      toast({
        title: 'Added to wishlist',
        status: 'success',
        duration: 2000,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <RouterLink to="/">← Back to Products</RouterLink>
      </Box>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={8} mb={12}>
        <Box>
          <Image
            src={product.images?.[0]?.image || '/placeholder-image.jpg'}
            alt={product.name}
            borderRadius="lg"
            objectFit="cover"
            width="100%"
            height="400px"
          />
        </Box>

        <VStack align="start" spacing={4}>
          <Badge colorScheme="green" fontSize="sm">{product.category}</Badge>
          <Heading as="h1" size="xl">{product.name}</Heading>
          
          <HStack>
            <Icon as={FaStar} color="yellow.400" />
            <Text fontWeight="bold">{product.average_rating || 0}</Text>
            <Text color="gray.500">({product.total_reviews || 0} reviews)</Text>
            {product.lab_tested && (
              <Badge colorScheme="green" display="flex" alignItems="center">
                <Icon as={FaCheck} mr={1} /> Lab Tested
              </Badge>
            )}
          </HStack>

          <HStack spacing={4} alignItems="center">
            <Text fontSize="2xl" fontWeight="bold">
              ${product.price}
            </Text>
          </HStack>

          <Text>{product.description}</Text>

          {product.effects && (
            <HStack spacing={2} flexWrap="wrap">
              {product.cbd_content && (
                <Badge colorScheme="purple">{product.cbd_content} CBD</Badge>
              )}
              {product.effects.map((effect) => (
                <Badge key={effect} colorScheme="blue">
                  {effect}
                </Badge>
              ))}
            </HStack>
          )}

          <HStack spacing={4} width="100%">
            <Button
              colorScheme="green"
              size="lg"
              leftIcon={<Icon as={FaShoppingCart} />}
              flex={1}
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
            <Button
              colorScheme={isInWishlist(product.id) ? 'red' : 'gray'}
              size="lg"
              leftIcon={<Icon as={FaHeart} />}
              onClick={toggleWishlist}
            >
              {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </Button>
          </HStack>
        </VStack>
      </Grid>

      <Tabs>
        <TabList>
          <Tab>Details</Tab>
          <Tab>Reviews ({product.total_reviews || 0})</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack align="start" spacing={4}>
              {product.brand && (
                <Box>
                  <Heading size="md">Brand</Heading>
                  <Text>{product.brand.name}</Text>
                </Box>
              )}
              
              {product.strain && (
                <Box>
                  <Heading size="md">Strain</Heading>
                  <Text>{product.strain}</Text>
                </Box>
              )}

              {(product.thc_content || product.cbd_content) && (
                <Box>
                  <Heading size="md">Content</Heading>
                  <List spacing={2}>
                    {product.thc_content && (
                      <ListItem>
                        <ListIcon as={FaLeaf} color="green.500" />
                        THC: {product.thc_content}
                      </ListItem>
                    )}
                    {product.cbd_content && (
                      <ListItem>
                        <ListIcon as={FaLeaf} color="green.500" />
                        CBD: {product.cbd_content}
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}
            </VStack>
          </TabPanel>
          
          <TabPanel>
            <Reviews productId={product.id} reviews={product.reviews || []} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Box mt={12}>
        <Heading size="lg" mb={6}>You might also like</Heading>
        <ProductRecommendations currentProductId={product.id} category={product.category} />
      </Box>
    </Container>
  );
};
