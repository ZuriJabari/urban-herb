import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Image,
  Button,
  Stack,
  Badge,
  Icon,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  List,
  ListItem,
  ListIcon,
  useToast,
} from '@chakra-ui/react';
import { MdCheckCircle } from 'react-icons/md';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Product } from '../types/product';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import axios from 'axios';

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading, isError, error } = useQuery(
    ['product', id],
    async () => {
      try {
        const response = await api.get<Product>(`/products/products/${id}/`);
        return response.data; // Data is already transformed by the interceptor
      } catch (error) {
        console.error('Error fetching product:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response:', error.response?.data);
          console.error('Status:', error.response?.status);
        }
        throw error;
      }
    },
    {
      enabled: !!id,
      retry: 1
    }
  );

  if (isLoading) {
    return <LoadingSpinner text="Loading product details..." />;
  }

  if (isError) {
    return (
      <Container maxW="container.xl" py={10}>
        <Stack spacing={4} align="center">
          <Heading size="lg" color="red.500">Error Loading Product</Heading>
          <Text>We couldn't find the product you're looking for.</Text>
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </Stack>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxW="container.xl" py={10}>
        <Stack spacing={4} align="center">
          <Heading size="lg">Product Not Found</Heading>
          <Text>The product you're looking for doesn't exist.</Text>
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </Stack>
      </Container>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: 'Removed from Wishlist',
        description: `${product.name} has been removed from your wishlist.`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } else {
      addToWishlist(product);
      toast({
        title: 'Added to Wishlist',
        description: `${product.name} has been added to your wishlist.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={10}>
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={10}>
        {/* Product Images */}
        <Box>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              w="full"
              h="400px"
              objectFit="cover"
              borderRadius="lg"
              mb={4}
            />
          </motion.div>
          <Stack direction="row" spacing={4} overflowX="auto" py={2}>
            {product.images.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt={`${product.name} thumbnail ${index + 1}`}
                w="100px"
                h="100px"
                objectFit="cover"
                borderRadius="md"
                cursor="pointer"
                opacity={selectedImage === index ? 1 : 0.6}
                onClick={() => setSelectedImage(index)}
                _hover={{ opacity: 1 }}
              />
            ))}
          </Stack>
        </Box>

        {/* Product Info */}
        <Box>
          <Stack spacing={4}>
            <Heading size="xl">{product.name}</Heading>
            <Text fontSize="2xl" color="green.500" fontWeight="bold">
              ${product.price.toFixed(2)}
            </Text>
            {product.discountPrice && (
              <Text as="s" color="gray.500">
                ${product.discountPrice.toFixed(2)}
              </Text>
            )}
            <Text>{product.description}</Text>

            <Stack direction="row" spacing={4}>
              <Button
                size="lg"
                colorScheme="green"
                leftIcon={<Icon as={MdCheckCircle} />}
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleWishlist}
              >
                {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            </Stack>

            <Tabs isFitted variant="enclosed" mt={6}>
              <TabList mb="1em">
                <Tab>Details</Tab>
                <Tab>Specifications</Tab>
                <Tab>Reviews</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Text>{product.description}</Text>
                </TabPanel>
                <TabPanel>
                  <List spacing={3}>
                    {product.specifications?.map((spec, index) => (
                      <ListItem key={index}>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        {spec}
                      </ListItem>
                    ))}
                  </List>
                </TabPanel>
                <TabPanel>
                  <Text>Reviews coming soon...</Text>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Stack>
        </Box>
      </Grid>
    </Container>
  );
};

export default ProductDetailsPage;
