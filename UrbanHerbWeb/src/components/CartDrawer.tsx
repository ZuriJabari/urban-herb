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
} from '@chakra-ui/react';
import { AddIcon, MinusIcon, DeleteIcon } from '@chakra-ui/icons';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/formatters';
import { Link as RouterLink } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeItem } = useCart();

  const subtotal = cart?.items?.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  ) ?? 0;

  const itemCount = cart?.items?.length ?? 0;

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Shopping Cart ({itemCount} items)</DrawerHeader>

        <DrawerBody>
          <VStack spacing={4} align="stretch">
            {cart?.items?.map((item) => (
              <Box
                key={item.id}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                position="relative"
              >
                <HStack spacing={4}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    boxSize="100px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                  <VStack align="start" flex={1}>
                    <Text fontWeight="bold">{item.name}</Text>
                    <Text color="gray.600">{formatPrice(item.price)}</Text>
                    <HStack>
                      <IconButton
                        aria-label="Decrease quantity"
                        icon={<MinusIcon />}
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        isDisabled={item.quantity <= 1}
                      />
                      <Text>{item.quantity}</Text>
                      <IconButton
                        aria-label="Increase quantity"
                        icon={<AddIcon />}
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      />
                    </HStack>
                  </VStack>
                  <IconButton
                    aria-label="Remove item"
                    icon={<DeleteIcon />}
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => removeItem(item.id)}
                  />
                </HStack>
              </Box>
            ))}
            {(!cart?.items || cart.items.length === 0) && (
              <Text textAlign="center" color="gray.500">
                Your cart is empty
              </Text>
            )}
          </VStack>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <VStack spacing={4} width="100%">
            <HStack justify="space-between" width="100%">
              <Text>Subtotal:</Text>
              <Text fontWeight="bold">{formatPrice(subtotal)}</Text>
            </HStack>
            <Button
              as={RouterLink}
              to="/checkout"
              colorScheme="brand"
              width="100%"
              isDisabled={!cart?.items || cart.items.length === 0}
            >
              Proceed to Checkout
            </Button>
          </VStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
