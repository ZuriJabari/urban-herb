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
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useState } from 'react';

const MotionBox = motion(Box);

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Simulate loading
  setTimeout(() => setIsLoading(false), 1000);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast({
      title: 'Item removed',
      description: 'The item has been removed from your cart',
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'bottom-right',
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: 'Cart cleared',
      description: 'All items have been removed from your cart',
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'bottom-right',
    });
  };

  if (isLoading) {
    return (
      <Box minH="100vh" py={8}>
        <Container maxW="container.xl">
          <Stack spacing={8}>
            <Heading>Your Cart</Heading>
            <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
              <GridItem>
                <LoadingSkeleton count={3} type="cart" />
              </GridItem>
              <GridItem>
                <Box bg={bgColor} p={6} rounded="lg" shadow="sm">
                  <LoadingSkeleton count={1} type="search" />
                </Box>
              </GridItem>
            </Grid>
          </Stack>
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
                      key={item.id}
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
                            src={item.image}
                            alt={item.name}
                            width="100px"
                            height="100px"
                            objectFit="cover"
                            rounded="md"
                          />
                          <Box>
                            <Text fontWeight="semibold">{item.name}</Text>
                            <Text fontSize="sm" color="gray.600">
                              ${item.price}
                            </Text>
                          </Box>
                          <NumberInput
                            min={1}
                            max={10}
                            value={item.quantity}
                            onChange={(_, value) =>
                              handleQuantityChange(item.id, value)
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
                            onClick={() => handleRemoveItem(item.id)}
                          />
                        </Grid>
                      </Box>
                    </MotionBox>
                  ))}
                </AnimatePresence>
              </Stack>
            </GridItem>

            <GridItem>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Box
                  bg={bgColor}
                  p={6}
                  rounded="lg"
                  shadow="sm"
                  borderWidth="1px"
                  borderColor={borderColor}
                  position="sticky"
                  top="100px"
                >
                  <Heading size="md" mb={6}>
                    Order Summary
                  </Heading>
                  <Stack spacing={4}>
                    <HStack justify="space-between">
                      <Text>Subtotal</Text>
                      <Text>${subtotal}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Shipping</Text>
                      <Text>
                        {shipping === 0 ? 'Free' : `$${shipping}`}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Tax</Text>
                      <Text>${tax}</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between" fontWeight="bold">
                      <Text>Total</Text>
                      <Text>${total}</Text>
                    </HStack>
                    <Button
                      colorScheme="green"
                      size="lg"
                      w="100%"
                      mt={4}
                      as={motion.button}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Proceed to Checkout
                    </Button>
                  </Stack>
                </Box>
              </motion.div>
            </GridItem>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

export default CartPage;
