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
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { mockProducts } from '../data/mockProducts';

interface WishlistProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Wishlist = ({ isOpen, onClose }: WishlistProps) => {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const toast = useToast();

  const wishlistProducts = items.map(item => ({
    ...item,
    product: mockProducts.find(p => p.id === item.productId)!
  })).filter(item => item.product);

  const handleAddToCart = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      addToCart(product);
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Your Wishlist</DrawerHeader>

        <DrawerBody>
          {wishlistProducts.length === 0 ? (
            <Text color="gray.500">Your wishlist is empty</Text>
          ) : (
            <VStack spacing={4} align="stretch">
              {wishlistProducts.map(({ product, addedAt }) => (
                <Box key={product.id} borderWidth="1px" borderRadius="lg" p={4}>
                  <HStack spacing={4}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      boxSize="100px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <VStack align="start" flex={1}>
                      <Text fontWeight="bold">{product.name}</Text>
                      <Text color="green.600">${product.price.toFixed(2)}</Text>
                      <Text fontSize="sm" color="gray.500">
                        Added on {new Date(addedAt).toLocaleDateString()}
                      </Text>
                      <HStack>
                        <Button
                          size="sm"
                          leftIcon={<FaShoppingCart />}
                          colorScheme="green"
                          onClick={() => handleAddToCart(product.id)}
                        >
                          Add to Cart
                        </Button>
                        <IconButton
                          aria-label="Remove from wishlist"
                          icon={<FaTrash />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeItem(product.id)}
                        />
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </DrawerBody>

        {wishlistProducts.length > 0 && (
          <DrawerFooter flexDirection="column">
            <Divider mb={4} />
            <Button
              colorScheme="red"
              variant="ghost"
              width="100%"
              onClick={clearWishlist}
            >
              Clear Wishlist
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};
