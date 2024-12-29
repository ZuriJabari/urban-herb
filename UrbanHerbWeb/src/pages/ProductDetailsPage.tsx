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
import { ProductService } from '../services/product.service';
import { useState, useEffect } from 'react';

export const ProductDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const toast = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setError('Product not found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log('ProductDetailsPage: Fetching product with slug:', slug);
        const productData = await ProductService.getProductBySlug(slug);
        setProduct(productData);
        console.log('ProductDetailsPage: Product fetched:', productData);
      } catch (error: any) {
        console.error('ProductDetailsPage: Error fetching product:', error);
        setError(error.message || 'Failed to load product details');
        toast({
          title: 'Error',
          description: 'Failed to load product details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug, toast]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart(product, 1);
      toast({
        title: 'Success',
        description: `${product.name} added to cart`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('ProductDetailsPage: Error adding to cart:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add item to cart',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        toast({
          title: 'Success',
          description: `${product.name} removed from wishlist`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await addToWishlist(product);
        toast({
          title: 'Success',
          description: `${product.name} added to wishlist`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error('ProductDetailsPage: Error toggling wishlist:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update wishlist',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Early return if no slug
  if (!slug) {
    console.log('Rendering: No product slug');
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Invalid product slug
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
              onClick={handleWishlistToggle}
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
