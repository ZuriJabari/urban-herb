import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Image,
  Badge,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useToast,
  Divider,
  SimpleGrid,
  Icon,
  Skeleton,
  useColorModeValue,
  List,
  ListItem,
  ListIcon,
  Progress,
  Avatar,
  Spinner,
  Center,
} from '@chakra-ui/react';
import {
  FaHeart,
  FaRegHeart,
  FaStar,
  FaStarHalf,
  FaLeaf,
  FaShoppingCart,
  FaCheck,
  FaExchangeAlt,
  FaShieldAlt,
  FaTruck,
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { ProductService } from '../services/product.service';
import { Product, Review } from '../types/product';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const { state: { user } } = useAuth();

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const productData = await ProductService.getProduct(parseInt(id));
        setProduct(productData);
        
        // Only load related products if we have a valid category
        if (productData && productData.category) {
          try {
            const related = await ProductService.getRelatedProducts(productData.category, parseInt(id));
            setRelatedProducts(related);
          } catch (error) {
            console.error('Error loading related products:', error);
            // Don't show error toast for related products failure
            setRelatedProducts([]);
          }
        }

        // Check wishlist status if user is logged in
        if (user) {
          try {
            const wishlistStatus = await ProductService.checkWishlistStatus(parseInt(id));
            setIsWishlisted(wishlistStatus);
          } catch (error) {
            console.error('Error checking wishlist status:', error);
            setIsWishlisted(false);
          }
        }
      } catch (error: any) {
        toast({
          title: 'Error loading product',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/products');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    // Check if user is logged in
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to add items to your cart',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    try {
      await ProductService.addToCart(product.id, quantity);

      toast({
        title: 'Added to Cart',
        description: `${quantity} ${quantity > 1 ? 'items' : 'item'} added to your cart`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh product data to get updated stock
      const updatedProduct = await ProductService.getProduct(product.id);
      setProduct(updatedProduct);
    } catch (error: any) {
      toast({
        title: 'Error adding to cart',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleToggleWishlist = async () => {
    try {
      const newWishlistStatus = await ProductService.toggleWishlist(product!.id);
      setIsWishlisted(newWishlistStatus);
      toast({
        title: newWishlistStatus ? 'Added to Wishlist' : 'Removed from Wishlist',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error updating wishlist',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} as={FaStar} color="yellow.400" />);
    }
    if (hasHalfStar) {
      stars.push(<Icon key="half" as={FaStarHalf} color="yellow.400" />);
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Icon key={`empty-${i}`} as={FaStar} color="gray.300" />);
    }

    return stars;
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="green.500" />
      </Center>
    );
  }

  if (!product) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Product not found</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8}>
        {/* Image Gallery */}
        <GridItem>
          <VStack spacing={4}>
            <Box
              borderRadius="lg"
              overflow="hidden"
              position="relative"
              width="100%"
              paddingBottom="100%"
            >
              <Image
                src={product.images[selectedImage]?.url || ''}
                alt={product.name}
                position="absolute"
                top="0"
                width="100%"
                height="100%"
                objectFit="cover"
              />
            </Box>
            <HStack spacing={4} overflowX="auto" width="100%" p={2}>
              {product.images.map((image, index) => (
                <Box
                  key={index}
                  borderWidth={selectedImage === index ? "2px" : "1px"}
                  borderColor={selectedImage === index ? "green.500" : "gray.200"}
                  borderRadius="md"
                  overflow="hidden"
                  cursor="pointer"
                  onClick={() => setSelectedImage(index)}
                  width="80px"
                  height="80px"
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                  />
                </Box>
              ))}
            </HStack>
          </VStack>
        </GridItem>

        {/* Product Info */}
        <GridItem>
          <VStack align="stretch" spacing={4}>
            <Heading size="lg">{product.name}</Heading>
            
            <HStack>
              <HStack spacing={1}>
                {renderStars(product.average_rating)}
              </HStack>
              <Text color={textColor}>({product.total_reviews} reviews)</Text>
            </HStack>

            <HStack>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                ${product.price}
              </Text>
              {product.stock > 0 ? (
                <Badge colorScheme="green">In Stock ({product.stock} available)</Badge>
              ) : (
                <Badge colorScheme="red">Out of Stock</Badge>
              )}
            </HStack>

            <Text color={textColor}>{product.description}</Text>

            {/* Product Details */}
            <SimpleGrid columns={2} spacing={4}>
              <Box>
                <Text fontWeight="bold">THC Content</Text>
                <Text>{product.thc_content}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">CBD Content</Text>
                <Text>{product.cbd_content}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Strain</Text>
                <Text>{product.strain}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Category</Text>
                <Text>{product.category}</Text>
              </Box>
            </SimpleGrid>

            <Box mt={6}>
              <Flex direction="column" gap={4}>
                <Flex align="center" gap={4}>
                  <NumberInput
                    value={quantity}
                    min={1}
                    max={product?.stock || 1}
                    onChange={(_, value) => setQuantity(value)}
                    w="100px"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Button
                    colorScheme="green"
                    size="lg"
                    width="full"
                    onClick={handleAddToCart}
                    isDisabled={!product?.stock || quantity > (product?.stock || 0)}
                    leftIcon={<FaShoppingCart />}
                  >
                    {user ? 'Add to Cart' : 'Login to Add to Cart'}
                  </Button>
                </Flex>
              </Flex>
            </Box>

            <Divider />

            {/* Benefits and Features */}
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              {[
                { icon: FaLeaf, text: "Lab Tested" },
                { icon: FaTruck, text: "Free Shipping" },
                { icon: FaExchangeAlt, text: "30-Day Returns" },
                { icon: FaShieldAlt, text: "Secure Payment" },
              ].map((feature, index) => (
                <HStack key={index} spacing={2}>
                  <Icon as={feature.icon} color="green.500" />
                  <Text fontSize="sm">{feature.text}</Text>
                </HStack>
              ))}
            </SimpleGrid>
          </VStack>
        </GridItem>
      </Grid>

      {/* Product Details Tabs */}
      <Box mt={12}>
        <Tabs colorScheme="green">
          <TabList>
            <Tab>Benefits</Tab>
            <Tab>Effects</Tab>
            <Tab>Reviews</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <List spacing={3}>
                {product.benefits.map((benefit, index) => (
                  <ListItem key={index}>
                    <ListIcon as={FaCheck} color="green.500" />
                    {benefit}
                  </ListItem>
                ))}
              </List>
            </TabPanel>

            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {product.effects.map((effect, index) => (
                  <Box key={index} p={4} borderWidth="1px" borderRadius="md">
                    <Text>{effect}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </TabPanel>

            <TabPanel>
              <VStack spacing={4} align="stretch">
                {/* Rating Summary */}
                <HStack spacing={8} p={4} bg={bgColor} borderRadius="lg">
                  <VStack>
                    <Heading size="3xl" color="green.500">
                      {product.average_rating.toFixed(1)}
                    </Heading>
                    <HStack spacing={1}>
                      {renderStars(product.average_rating)}
                    </HStack>
                    <Text color={textColor}>
                      Based on {product.total_reviews} reviews
                    </Text>
                  </VStack>
                </HStack>

                {/* Reviews List */}
                <VStack spacing={4} align="stretch">
                  {product.reviews.map((review) => (
                    <Box
                      key={review.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="lg"
                      bg={bgColor}
                    >
                      <HStack spacing={4}>
                        <Avatar name={review.user_email} />
                        <VStack align="start" flex={1}>
                          <HStack justify="space-between" width="100%">
                            <Text fontWeight="bold">{review.title}</Text>
                            <Text color={textColor}>{new Date(review.created_at).toLocaleDateString()}</Text>
                          </HStack>
                          <HStack spacing={1}>
                            {renderStars(review.rating)}
                          </HStack>
                          <Text color={textColor}>{review.content}</Text>
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Box mt={12}>
          <Heading size="lg" mb={6}>Related Products</Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {relatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.id} to={`/products/${relatedProduct.id}`}>
                <Box
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  transition="transform 0.2s"
                  _hover={{ transform: 'scale(1.02)' }}
                >
                  <Image
                    src={relatedProduct.images[0]?.url || ''}
                    alt={relatedProduct.name}
                    height="200px"
                    width="100%"
                    objectFit="cover"
                  />
                  <Box p={4}>
                    <Text fontWeight="semibold" noOfLines={2}>
                      {relatedProduct.name}
                    </Text>
                    <HStack justify="space-between" mt={2}>
                      <Text color="green.500" fontWeight="bold">
                        ${relatedProduct.price}
                      </Text>
                      <HStack spacing={1}>
                        {renderStars(relatedProduct.average_rating)}
                      </HStack>
                    </HStack>
                  </Box>
                </Box>
              </Link>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Container>
  );
};
