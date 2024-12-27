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
} from '@chakra-ui/react';
import { FaLeaf, FaCheck, FaHeart, FaShoppingCart } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../types/product';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { ProductRecommendations } from '../components/ProductRecommendations';
import { Reviews } from '../components/Reviews';
import LoadingSpinner from '../components/LoadingSpinner';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = mockProducts.find(p => p.id === id);
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const toast = useToast();

  if (!id) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Invalid product ID
        </Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Product not found. <Button onClick={() => navigate('/')} ml={4}>Return to Home</Button>
        </Alert>
      </Container>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
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
      <Breadcrumb spacing="8px" separator={<Icon as={FaChevronRight} color="gray.500" />} mb={8}>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to={`/search?category=${product.category}`}>
            {product.category}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <Text>{product.name}</Text>
        </BreadcrumbItem>
      </Breadcrumb>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={8} mb={12}>
        <Box>
          <Image
            src={product.image}
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
            <Text fontWeight="bold">{product.rating}</Text>
            <Text color="gray.500">({product.reviewCount} reviews)</Text>
            {product.labTested && (
              <Badge colorScheme="green" display="flex" alignItems="center">
                <Icon as={FaCheck} mr={1} /> Lab Tested
              </Badge>
            )}
          </HStack>

          <Text fontSize="2xl" fontWeight="bold" color="green.600">
            ${product.price.toFixed(2)}
          </Text>

          <Text>{product.description}</Text>

          <HStack spacing={2} flexWrap="wrap">
            <Badge colorScheme="purple">{product.cbdContent} CBD</Badge>
            {product.effects.map((effect) => (
              <Badge key={effect} colorScheme="blue">
                {effect}
              </Badge>
            ))}
          </HStack>

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
            <IconButton
              aria-label="Add to wishlist"
              icon={<Icon as={FaHeart} />}
              size="lg"
              colorScheme={isInWishlist(product.id) ? 'red' : 'gray'}
              onClick={toggleWishlist}
            />
          </HStack>

          <Divider my={4} />

          <Tabs width="100%" colorScheme="green">
            <TabList>
              <Tab>Details</Tab>
              <Tab>Benefits</Tab>
              <Tab>Usage</Tab>
              <Tab>Reviews</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <List spacing={3}>
                  <ListItem>
                    <ListIcon as={FaCheck} color="green.500" />
                    <Text as="span" fontWeight="bold">CBD Content:</Text> {product.cbdContent}
                  </ListItem>
                  {product.strain && (
                    <ListItem>
                      <ListIcon as={FaCheck} color="green.500" />
                      <Text as="span" fontWeight="bold">Strain:</Text> {product.strain}
                    </ListItem>
                  )}
                  {product.weight && (
                    <ListItem>
                      <ListIcon as={FaCheck} color="green.500" />
                      <Text as="span" fontWeight="bold">Weight:</Text> {product.weight}
                    </ListItem>
                  )}
                  <ListItem>
                    <ListIcon as={FaCheck} color="green.500" />
                    <Text as="span" fontWeight="bold">Brand:</Text> {product.brand}
                  </ListItem>
                </List>
              </TabPanel>

              <TabPanel>
                <List spacing={3}>
                  {product.benefits.map((benefit) => (
                    <ListItem key={benefit}>
                      <ListIcon as={FaCheck} color="green.500" />
                      {benefit}
                    </ListItem>
                  ))}
                </List>
              </TabPanel>

              <TabPanel>
                <List spacing={3}>
                  {product.dosage && (
                    <ListItem>
                      <ListIcon as={FaCheck} color="green.500" />
                      <Text as="span" fontWeight="bold">Recommended Dosage:</Text> {product.dosage}
                    </ListItem>
                  )}
                  <ListItem>
                    <ListIcon as={FaCheck} color="green.500" />
                    <Text as="span" fontWeight="bold">Usage Instructions:</Text>
                    <Text mt={2}>{product.usage || 'Follow recommended dosage guidelines.'}</Text>
                  </ListItem>
                </List>
              </TabPanel>

              <TabPanel>
                <Reviews productId={product.id} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Grid>

      <Box mt={12}>
        <Heading size="lg" mb={6}>You May Also Like</Heading>
        <ProductRecommendations currentProduct={product} />
      </Box>
    </Container>
  );
};
