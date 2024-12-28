import {
  Box,
  Image,
  Text,
  Stack,
  Button,
  IconButton,
  useColorModeValue,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import { Product } from '../types/product';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const toast = useToast();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const priceColor = useColorModeValue('green.600', 'green.300');

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.images?.[0]?.image || '',
      quantity: 1
    });
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'bottom-right',
    });
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: 'Removed from wishlist',
        description: `${product.name} has been removed from your wishlist`,
        status: 'info',
        duration: 2000,
        isClosable: true,
        position: 'bottom-right',
      });
    } else {
      addToWishlist(product);
      toast({
        title: 'Added to wishlist',
        description: `${product.name} has been added to your wishlist`,
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'bottom-right',
      });
    }
  };

  return (
    <Box
      as={motion.div}
      whileHover={{ y: -5 }}
      bg={bgColor}
      rounded="lg"
      shadow="sm"
      position="relative"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ shadow: 'lg' }}
      onClick={() => navigate(`/products/${product.id}`)}
      cursor="pointer"
    >
      <Box position="relative" height="200px" overflow="hidden">
        <AnimatePresence mode="wait">
          {!isImageLoaded && (
            <Box
              as={motion.div}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="gray.100"
            />
          )}
        </AnimatePresence>
        <Image
          src={product.images?.[0]?.image || '/placeholder.jpg'}
          alt={product.name}
          objectFit="cover"
          width="100%"
          height="100%"
          onLoad={() => setIsImageLoaded(true)}
          opacity={isImageLoaded ? 1 : 0}
          transition="opacity 0.3s"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
          }}
        >
          <Tooltip
            label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            placement="left"
          >
            <IconButton
              aria-label="Add to wishlist"
              icon={<FaHeart />}
              size="sm"
              colorScheme={isInWishlist(product.id) ? 'red' : 'gray'}
              variant="solid"
              onClick={handleWishlistToggle}
              opacity={0.8}
              _hover={{ opacity: 1 }}
            />
          </Tooltip>
        </motion.div>
      </Box>

      <Stack p={4} spacing={2}>
        <Text
          fontSize="lg"
          fontWeight="semibold"
          color={textColor}
          noOfLines={1}
        >
          {product.name}
        </Text>
        <Text fontSize="sm" color={textColor} noOfLines={2}>
          {product.description}
        </Text>
        <Stack
          direction="row"
          justify="space-between"
          align="center"
          mt={2}
        >
          <Text
            fontSize="xl"
            fontWeight="bold"
            color={priceColor}
          >
            ${product.price}
          </Text>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              leftIcon={<FaShoppingCart />}
              colorScheme="green"
              variant="solid"
              size="sm"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </motion.div>
        </Stack>
      </Stack>
    </Box>
  );
};
