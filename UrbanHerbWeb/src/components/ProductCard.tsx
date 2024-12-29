import React from 'react';
import {
  Box,
  Image,
  Text,
  VStack,
  HStack,
  Badge,
  Icon,
  useColorModeValue,
  Tooltip,
  Flex,
  IconButton,
  Spacer,
} from '@chakra-ui/react';
import { FaStar, FaLeaf, FaHeart, FaRegHeart } from 'react-icons/fa';
import { Product } from '../types/product';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@chakra-ui/react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product detail
    e.stopPropagation(); // Stop event propagation

    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to add items to your wishlist',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        toast({
          title: 'Removed from Wishlist',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        await addToWishlist(product);
        toast({
          title: 'Added to Wishlist',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update wishlist',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCardClick = () => {
    navigate(`/products/${product.slug}`);
  };

  if (!product) {
    console.error('ProductCard: No product data provided');
    return null;
  }

  return (
    <Box
      as={Link}
      to={`/products/${product.slug}`}
      display="block"
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'lg',
        bg: hoverBg,
        textDecoration: 'none',
      }}
      position="relative"
      height="100%"
      onClick={handleCardClick}
    >
      {/* Favorite Button */}
      <IconButton
        icon={<Icon as={isInWishlist(product.id) ? FaHeart : FaRegHeart} />}
        aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
        position="absolute"
        top={2}
        right={2}
        size="sm"
        colorScheme="pink"
        variant={isInWishlist(product.id) ? "solid" : "ghost"}
        zIndex={2}
        onClick={handleWishlistClick}
      />

      {/* Image Container */}
      <Box position="relative" paddingTop="100%" overflow="hidden">
        <Image
          src={product.images[0]?.image || '/placeholder.jpg'}
          alt={product.name}
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          objectFit="cover"
          transition="transform 0.3s ease-in-out"
          _hover={{ transform: 'scale(1.05)' }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            console.error('Image load error:', e);
            e.currentTarget.src = '/placeholder.jpg';
          }}
        />
        
        {/* Badges */}
        <HStack position="absolute" top={2} left={2} spacing={2}>
          {product.featured && (
            <Badge colorScheme="purple" variant="solid">
              Featured
            </Badge>
          )}
          {product.stock <= 0 && (
            <Badge colorScheme="red" variant="solid">
              Out of Stock
            </Badge>
          )}
          {product.discount_price && (
            <Badge colorScheme="green" variant="solid">
              Sale
            </Badge>
          )}
        </HStack>
      </Box>

      {/* Product Info */}
      <VStack p={4} align="stretch" spacing={2}>
        <Text
          fontSize="sm"
          color={subTextColor}
          textTransform="uppercase"
          fontWeight="medium"
        >
          {product.category}
        </Text>

        <Text
          fontSize="lg"
          fontWeight="semibold"
          color={textColor}
          noOfLines={2}
          title={product.name}
        >
          {product.name}
        </Text>

        <HStack spacing={2}>
          {product.discount_price ? (
            <>
              <Text fontSize="lg" fontWeight="bold" color="green.500">
                {formatPrice(product.discount_price)}
              </Text>
              <Text fontSize="md" color={subTextColor} textDecoration="line-through">
                {formatPrice(product.price)}
              </Text>
            </>
          ) : (
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              {formatPrice(product.price)}
            </Text>
          )}
        </HStack>

        {/* Rating */}
        {product.average_rating !== undefined && (
          <HStack spacing={1}>
            <Icon as={FaStar} color="yellow.400" />
            <Text fontSize="sm" color={subTextColor}>
              {product.average_rating.toFixed(1)}
            </Text>
            {product.review_count !== undefined && (
              <Text fontSize="sm" color={subTextColor}>
                ({product.review_count})
              </Text>
            )}
          </HStack>
        )}

        {/* Stock Status */}
        <Text
          fontSize="sm"
          color={product.stock > 0 ? "green.500" : "red.500"}
          fontWeight="medium"
        >
          {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
        </Text>
      </VStack>
    </Box>
  );
};
