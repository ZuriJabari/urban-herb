import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Button,
  Divider,
  Grid,
  GridItem,
  useColorModeValue,
  VStack,
  HStack,
  Image,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { formatCurrency } from '../utils/formatters';

const MotionBox = motion(Box);

const CartPage = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    shipping,
    tax,
    total,
    loading,
    error
  } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleQuantityChange = async (productId: number, quantity: number) => {
    try {
      await updateQuantity(productId, quantity);
    } catch (error: any) {
      // Error is handled by the context
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      await removeItem(productId);
    } catch (error: any) {
      // Error is handled by the context
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error: any) {
      // Error is handled by the context
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <Box minH="100vh" py={8}>
        <Container maxW="container.xl">
          <Stack spacing={8}>
            <Heading>Your Cart</Heading>
            <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
              <GridItem>
                <LoadingSkeleton count={3} height="100px" />
              </GridItem>
              <GridItem>
                <Box bg={bgColor} p={6} rounded="lg" shadow="sm">
                  <LoadingSkeleton count={4} height="24px" />
                </Box>
              </GridItem>
            </Grid>
          </Stack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" py={8}>
        <Container maxW="container.xl">
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            rounded="lg"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Error Loading Cart
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              {error}
            </AlertDescription>
            <Button
              mt={4}
              colorScheme="red"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </Alert>
        </Container>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box minH="100vh" py={8}>
        <Container maxW="container.xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={8} textAlign="center">
              <Heading>Your Cart is Empty</Heading>
              <Text>Add some products to your cart and they will show up here</Text>
              <Button
                leftIcon={<FaArrowLeft />}
                colorScheme="green"
                size="lg"
                onClick={() => navigate('/products')}
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
    <Box minH="100vh" py={8}>
      <Container maxW="container.xl">
        <Stack spacing={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Stack direction="row" justify="space-between" align="center">
              <Heading>Your Cart</Heading>
              <Button
                colorScheme="red"
                variant="ghost"
                onClick={handleClearCart}
                isDisabled={items.length === 0}
              >
                Clear Cart
              </Button>
            </Stack>
          </motion.div>

          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
            <GridItem>
              <Stack spacing={4}>
                <AnimatePresence>
                  {items.map((item, index) => (
                    <MotionBox
                      key={item.product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Box
                        p={4}
                        bg={bgColor}
                        rounded="lg"
                        shadow="sm"
                        borderWidth="1px"
                        borderColor={borderColor}
                      >
                        <Grid
                          templateColumns={{
                            base: '1fr',
                            md: '100px 1fr auto auto',
                          }}
                          gap={4}
                          alignItems="center"
                        >
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            width="100px"
                            height="100px"
                            objectFit="cover"
                            rounded="md"
                            fallbackSrc="https://via.placeholder.com/100"
                          />
                          <Box>
                            <Text
                              fontWeight="semibold"
                              _hover={{ color: 'green.500', cursor: 'pointer' }}
                              onClick={() => navigate(`/products/${item.product.id}`)}
                            >
                              {item.product.name}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {formatCurrency(item.product.price)}
                            </Text>
                          </Box>
                          <NumberInput
                            min={1}
                            max={10}
                            value={item.quantity}
                            onChange={(_, value) =>
                              handleQuantityChange(item.product.id, value)
                            }
                            size="sm"
                            maxW={20}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                          <IconButton
                            aria-label="Remove item"
                            icon={<FaTrash />}
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleRemoveItem(item.product.id)}
                          />
                        </Grid>
                      </Box>
                    </MotionBox>
                  ))}
                </AnimatePresence>
              </Stack>
            </GridItem>

            <GridItem>
              <Box
                position="sticky"
                top="100px"
                bg={bgColor}
                p={6}
                rounded="lg"
                shadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Order Summary</Heading>
                  <HStack justify="space-between">
                    <Text>Subtotal</Text>
                    <Text>{formatCurrency(subtotal)}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Shipping</Text>
                    <Text>
                      {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Tax</Text>
                    <Text>{formatCurrency(tax)}</Text>
                  </HStack>
                  <Divider />
                  <HStack justify="space-between" fontWeight="bold">
                    <Text>Total</Text>
                    <Text>{formatCurrency(total)}</Text>
                  </HStack>
                  <Button
                    colorScheme="green"
                    size="lg"
                    onClick={handleCheckout}
                    isDisabled={items.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="ghost"
                    leftIcon={<FaArrowLeft />}
                    onClick={() => navigate('/products')}
                  >
                    Continue Shopping
                  </Button>
                </VStack>
              </Box>
            </GridItem>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

export default CartPage;
