import React from 'react';
import {
  Box,
  VStack,
  Heading,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  Checkbox,
  Select,
  HStack,
  Button,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { ProductCategory, ProductFilters } from '../types/product';

interface ProductFiltersPanelProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  onReset: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'FLOWERS',
  'EDIBLES',
  'CONCENTRATES',
  'VAPES',
  'TINCTURES',
  'TOPICALS',
  'ACCESSORIES',
  'PRE_ROLLS',
  'SEEDS',
];

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
];

export const ProductFiltersPanel: React.FC<ProductFiltersPanelProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handlePriceRangeChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      minPrice: values[0],
      maxPrice: values[1],
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      category: e.target.value as ProductCategory | undefined,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      sortBy: e.target.value as ProductFilters['sortBy'],
    });
  };

  const handleInStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      inStock: e.target.checked,
    });
  };

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      position="sticky"
      top="20px"
    >
      <VStack spacing={4} align="stretch">
        <Heading size="md">Filters</Heading>
        
        <Box>
          <Text mb={2} fontWeight="medium">Category</Text>
          <Select 
            value={filters.category || ''} 
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </Box>

        <Box>
          <Text mb={2} fontWeight="medium">Price Range</Text>
          <RangeSlider
            aria-label={['min', 'max']}
            min={0}
            max={200}
            step={5}
            value={[filters.minPrice || 0, filters.maxPrice || 200]}
            onChange={handlePriceRangeChange}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>
          <HStack justify="space-between">
            <Text fontSize="sm">${filters.minPrice}</Text>
            <Text fontSize="sm">${filters.maxPrice}</Text>
          </HStack>
        </Box>

        <Box>
          <Text mb={2} fontWeight="medium">Sort By</Text>
          <Select 
            value={filters.sortBy || 'newest'} 
            onChange={handleSortChange}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Box>

        <Box>
          <Checkbox
            isChecked={filters.inStock}
            onChange={handleInStockChange}
          >
            In Stock Only
          </Checkbox>
        </Box>

        <Divider />

        <Button
          colorScheme="red"
          variant="outline"
          size="sm"
          onClick={onReset}
        >
          Reset Filters
        </Button>
      </VStack>
    </Box>
  );
};
