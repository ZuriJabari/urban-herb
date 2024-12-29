import React, { useState, useEffect, useCallback, useContext, useMemo, useRef, useId } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  useColorModeValue,
  VStack,
  Text,
  Button,
  useToast,
  HStack,
  Icon,
  Show,
  Hide,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { FaFilter, FaSearch, FaSlidersH } from 'react-icons/fa';
import { ProductCard } from '../components/ProductCard';
import { ProductService } from '../services/product.service';
import { Product } from '../types/product';
import LoadingSpinner from '../components/LoadingSpinner';
import { CategoryFilter } from '../components/CategoryFilter';
import { EffectsFilter } from '../components/EffectsFilter';
import { PriceFilter } from '../components/Filters/PriceFilter';
import { RatingFilter } from '../components/Filters/RatingFilter';
import { StockFilter } from '../components/Filters/StockFilter';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useSearch } from '../contexts/SearchContext';
import { useAuth } from '../contexts/AuthContext';

export const HomePage = () => {
  // Context hooks
  const { items: cartItems, addToCart } = useCart();
  const { items: wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const { searchTerm, setSearchTerm } = useSearch();
  const { user, loading: authLoading } = useAuth();

  // State hooks
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    effects: [] as string[],
    minPrice: 0,
    maxPrice: 1000,
    minRating: 0,
    inStock: false,
    sortBy: ''
  });

  // Other hooks
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputId = useId();

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('HomePage: Fetching featured products...');
      const data = await ProductService.getFeaturedProducts();
      console.log('HomePage: Featured products fetched:', data.length);
      setProducts(data);
    } catch (error: any) {
      console.error('HomePage: Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
      toast({
        title: 'Error',
        description: error.message || 'Failed to load products',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    console.log('HomePage: Initial featured products fetch');
    fetchProducts();
  }, [fetchProducts]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (loading || error || !products) return [];
    
    console.log('HomePage: Filtering products with:', {
      searchTerm,
      filters,
      totalProducts: products.length
    });

    return products
      .filter(product => {
        if (!product) return false;

        // Search matching
        const matchesSearch = !searchTerm || 
          (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           product.description?.toLowerCase().includes(searchTerm.toLowerCase()));

        // Category matching
        const matchesCategory = !filters.category || 
          product.category === filters.category;

        // Effects matching - handle undefined arrays safely
        const productEffects = product.effects || [];
        const filterEffects = filters.effects || [];
        const matchesEffects = filterEffects.length === 0 || 
          filterEffects.some(effect => 
            productEffects.some(e => e?.name === effect)
          );

        // Price matching - handle undefined or invalid prices
        const price = typeof product.price === 'number' ? product.price : 0;
        const matchesPrice = price >= (filters.minPrice || 0) && 
          price <= (filters.maxPrice || Infinity);

        // Rating matching - handle undefined ratings
        const rating = typeof product.average_rating === 'number' ? product.average_rating : 0;
        const matchesRating = rating >= (filters.minRating || 0);

        // Stock matching - handle undefined stock
        const stock = typeof product.stock === 'number' ? product.stock : 0;
        const matchesStock = !filters.inStock || stock > 0;

        return matchesSearch && 
               matchesCategory && 
               matchesEffects && 
               matchesPrice && 
               matchesRating && 
               matchesStock;
      });
  }, [products, searchTerm, filters, loading, error]);

  // Event handlers
  const handleFilterChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      category: '',
      effects: [],
      minPrice: 0,
      maxPrice: 1000,
      minRating: 0,
      inStock: false,
      sortBy: ''
    });
    setSearchTerm('');
  }, []);

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product, 1);
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleWishlistToggle = async (product: Product) => {
    try {
      const isInWishlist = wishlistItems.some(item => item.id === product.id);
      if (isInWishlist) {
        await removeFromWishlist(product.id);
        toast({
          title: 'Removed from wishlist',
          description: `${product.name} has been removed from your wishlist`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await addToWishlist(product);
        toast({
          title: 'Added to wishlist',
          description: `${product.name} has been added to your wishlist`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to update wishlist',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <LoadingSpinner />
        </VStack>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" py={10}>
            <Text color="red.500" mb={4}>{error}</Text>
            <Button colorScheme="blue" onClick={fetchProducts}>
              Try Again
            </Button>
          </Box>
        </VStack>
      </Container>
    );
  }

  // Render no products state
  if (!products || products.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" py={10}>
            <Text mb={4}>No products available.</Text>
            <Button colorScheme="blue" onClick={fetchProducts}>
              Refresh
            </Button>
          </Box>
        </VStack>
      </Container>
    );
  }

  const renderProductsGrid = () => {
    if (loading) {
      return (
        <Center py={8}>
          <Spinner size="xl" color="green.500" />
        </Center>
      );
    }

    if (error) {
      return (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <VStack py={8} spacing={4}>
          <Text>No products found matching your criteria.</Text>
          <Button colorScheme="green" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </VStack>
      );
    }

    return (
      <Grid
        templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }}
        gap={6}
        py={8}
      >
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            onWishlistToggle={handleWishlistToggle}
            isInCart={(cartItems || []).some(item => item.product?.id === product.id)}
            isInWishlist={(wishlistItems || []).some(item => item?.id === product.id)}
          />
        ))}
      </Grid>
    );
  };

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Heading size="lg">Our Products</Heading>
            <HStack spacing={4}>
              <Show above="md">
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.300" />
                  </InputLeftElement>
                  <Input
                    id={searchInputId}
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </InputGroup>
              </Show>
              <Button
                ref={filterButtonRef}
                onClick={onOpen}
                leftIcon={<FaSlidersH />}
                colorScheme="green"
                variant="outline"
              >
                Filters
              </Button>
            </HStack>
          </Flex>

          {/* Mobile Search */}
          <Hide above="md">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </InputGroup>
          </Hide>

          {/* Active Filters */}
          {(filters.category ||
            filters.effects.length > 0 ||
            filters.minRating > 0 ||
            filters.inStock ||
            filters.minPrice > 0 ||
            filters.maxPrice < 1000) && (
            <Flex gap={2} flexWrap="wrap">
              {filters.category && (
                <Badge
                  colorScheme="green"
                  variant="subtle"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  Category: {filters.category}
                </Badge>
              )}
              {filters.effects.map(effect => (
                <Badge
                  key={effect}
                  colorScheme="purple"
                  variant="subtle"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  {effect}
                </Badge>
              ))}
              {filters.minRating > 0 && (
                <Badge
                  colorScheme="yellow"
                  variant="subtle"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  Rating: ≥{filters.minRating}
                </Badge>
              )}
              {filters.inStock && (
                <Badge
                  colorScheme="blue"
                  variant="subtle"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  In Stock
                </Badge>
              )}
              {(filters.minPrice > 0 || filters.maxPrice < 1000) && (
                <Badge
                  colorScheme="orange"
                  variant="subtle"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  Price: ${filters.minPrice} - ${filters.maxPrice}
                </Badge>
              )}
            </Flex>
          )}

          {/* Products Grid */}
          {renderProductsGrid()}
        </VStack>
      </Container>

      {/* Filters Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={filterButtonRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Filters</DrawerHeader>
          <DrawerBody>
            <VStack spacing={6} align="stretch">
              <CategoryFilter
                value={filters.category}
                onChange={category => handleFilterChange({ category })}
              />
              <EffectsFilter
                value={filters.effects}
                onChange={effects => handleFilterChange({ effects })}
              />
              <PriceFilter
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                onChange={({ minPrice, maxPrice }) =>
                  handleFilterChange({ minPrice, maxPrice })
                }
              />
              <RatingFilter
                value={filters.minRating}
                onChange={rating => handleFilterChange({ minRating: rating })}
              />
              <StockFilter
                value={filters.inStock}
                onChange={inStock => handleFilterChange({ inStock })}
              />
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default HomePage;
