import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Image,
  IconButton,
  Box,
  Divider,
  useToast
} from '@chakra-ui/react';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart = ({ isOpen, onClose }: CartProps) => {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const toast = useToast();

  const handleCheckout = () => {
    toast({
      title: 'Order Placed!',
      description: 'Thank you for your purchase.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    clearCart();
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Your Cart</DrawerHeader>

        <DrawerBody>
          {items.length === 0 ? (
            <Text color="gray.500">Your cart is empty</Text>
          ) : (
            <VStack spacing={4} align="stretch">
              {items.map((item) => (
                <Box key={item.product.id} borderWidth="1px" borderRadius="lg" p={4}>
                  <HStack spacing={4}>
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      boxSize="100px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <VStack align="start" flex={1}>
                      <Text fontWeight="bold">{item.product.name}</Text>
                      <Text color="green.600">${item.product.price.toFixed(2)}</Text>
                      <HStack>
                        <IconButton
                          aria-label="Decrease quantity"
                          icon={<FaMinus />}
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        />
                        <Text>{item.quantity}</Text>
                        <IconButton
                          aria-label="Increase quantity"
                          icon={<FaPlus />}
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        />
                        <IconButton
                          aria-label="Remove item"
                          icon={<FaTrash />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => removeItem(item.product.id)}
                        />
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </DrawerBody>

        {items.length > 0 && (
          <DrawerFooter flexDirection="column">
            <Divider mb={4} />
            <VStack width="100%" spacing={4}>
              <HStack justify="space-between" width="100%">
                <Text fontSize="lg" fontWeight="bold">Total:</Text>
                <Text fontSize="lg" fontWeight="bold" color="green.600">
                  ${total.toFixed(2)}
                </Text>
              </HStack>
              <Button colorScheme="green" width="100%" onClick={handleCheckout}>
                Checkout
              </Button>
            </VStack>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};
