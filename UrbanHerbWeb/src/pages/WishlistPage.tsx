import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Button,
  useColorModeValue,
  VStack,
  useToast,
  Stack
} from '@chakra-ui/react';
import { useWishlist } from '../contexts/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const WishlistPage = () => {
  const { items, clearWishlist } = useWishlist();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');

  // Simulate loading
  setTimeout(() => setIsLoading(false), 1000);

  const handleClearWishlist = () => {
    clearWishlist();
    toast({
      title: 'Wishlist cleared',
      description: 'All items have been removed from your wishlist',
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'bottom-right',
    });
  };

  if (isLoading) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.xl">
          <Stack spacing={8}>
            <Heading>Your Wishlist</Heading>
            <Grid
              templateColumns={{
                base: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              }}
              gap={6}
            >
              <LoadingSkeleton count={8} type="product" />
            </Grid>
          </Stack>
        </Container>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={8} textAlign="center">
              <Heading>Your Wishlist is Empty</Heading>
              <Text>Add some products to your wishlist and they will show up here</Text>
              <Button
                colorScheme="green"
                size="lg"
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </Button>
            </VStack>
          </motion.div>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <Stack spacing={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Stack direction="row" justify="space-between" align="center">
              <Heading>Your Wishlist</Heading>
              <Button
                colorScheme="red"
                variant="ghost"
                onClick={handleClearWishlist}
                isDisabled={items.length === 0}
              >
                Clear Wishlist
              </Button>
            </Stack>
          </motion.div>

          <Grid
            templateColumns={{
              base: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
            gap={6}
          >
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.1
                  }}
                >
                  <ProductCard product={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

export default WishlistPage;
