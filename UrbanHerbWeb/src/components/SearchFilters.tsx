import {
  Box,
  VStack,
  Heading,
  Checkbox,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  HStack,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  Tag,
  Wrap,
  WrapItem,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { useSearch } from '../contexts/SearchContext';
import { useState, useEffect } from 'react';

export const SearchFilters = () => {
  const { filters, setFilters, resetFilters, getFacets } = useSearch();
  const [facets, setFacets] = useState<any>(null);
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const loadFacets = async () => {
      const results = await getFacets();
      setFacets(results);
    };
    loadFacets();
  }, [getFacets]);

  const handlePriceRangeChange = (range: number[]) => {
    setFilters({
      priceRange: { min: range[0], max: range[1] }
    });
  };

  const handleCBDContentChange = (range: number[]) => {
    setFilters({
      cbdContent: { min: range[0], max: range[1] }
    });
  };

  const handleCategoryChange = (category: string) => {
    setFilters({
      categories: filters.categories.includes(category)
        ? filters.categories.filter(c => c !== category)
        : [...filters.categories, category]
    });
  };

  const handleEffectChange = (effect: string) => {
    setFilters({
      effects: filters.effects.includes(effect)
        ? filters.effects.filter(e => e !== effect)
        : [...filters.effects, effect]
    });
  };

  const handleBenefitChange = (benefit: string) => {
    setFilters({
      benefits: filters.benefits.includes(benefit)
        ? filters.benefits.filter(b => b !== benefit)
        : [...filters.benefits, benefit]
    });
  };

  const handleBrandChange = (brand: string) => {
    setFilters({
      brands: filters.brands.includes(brand)
        ? filters.brands.filter(b => b !== brand)
        : [...filters.brands, brand]
    });
  };

  const removeFilter = (type: string, value: string) => {
    switch (type) {
      case 'category':
        setFilters({ categories: filters.categories.filter(c => c !== value) });
        break;
      case 'effect':
        setFilters({ effects: filters.effects.filter(e => e !== value) });
        break;
      case 'benefit':
        setFilters({ benefits: filters.benefits.filter(b => b !== value) });
        break;
      case 'brand':
        setFilters({ brands: filters.brands.filter(b => b !== value) });
        break;
    }
  };

  const hasActiveFilters = () => {
    return filters.categories.length > 0 ||
           filters.effects.length > 0 ||
           filters.benefits.length > 0 ||
           filters.brands.length > 0 ||
           filters.priceRange.min > 0 ||
           filters.priceRange.max < 1000;
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4}>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Heading size="md">
            <Icon as={FaFilter} mr={2} />
            Filters
          </Heading>
          {hasActiveFilters() && (
            <Button
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={resetFilters}
            >
              Clear All
            </Button>
          )}
        </HStack>

        {/* Active Filters */}
        {hasActiveFilters() && (
          <Box>
            <Text fontWeight="bold" mb={2}>Active Filters:</Text>
            <Wrap spacing={2}>
              {filters.categories.map(category => (
                <WrapItem key={category}>
                  <Tag
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="green"
                  >
                    <Text>{category}</Text>
                    <Icon
                      as={FaTimes}
                      ml={2}
                      cursor="pointer"
                      onClick={() => removeFilter('category', category)}
                    />
                  </Tag>
                </WrapItem>
              ))}
              {/* Similar tags for effects, benefits, and brands */}
            </Wrap>
          </Box>
        )}

        <Divider />

        {/* Sort By */}
        <Box>
          <Text fontWeight="bold" mb={2}>Sort By</Text>
          <Select
            value={filters.sortBy}
            onChange={(e) => setFilters({ sortBy: e.target.value as any })}
          >
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Rating</option>
            <option value="newest">Newest</option>
          </Select>
        </Box>

        <Accordion allowMultiple defaultIndex={[0, 1]}>
          {/* Price Range */}
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Price Range
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={4}>
                <RangeSlider
                  min={0}
                  max={1000}
                  step={10}
                  value={[filters.priceRange.min, filters.priceRange.max]}
                  onChange={handlePriceRangeChange}
                >
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} />
                  <RangeSliderThumb index={1} />
                </RangeSlider>
                <HStack width="100%">
                  <NumberInput
                    value={filters.priceRange.min}
                    min={0}
                    max={filters.priceRange.max}
                    onChange={(_, value) => handlePriceRangeChange([value, filters.priceRange.max])}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text>to</Text>
                  <NumberInput
                    value={filters.priceRange.max}
                    min={filters.priceRange.min}
                    max={1000}
                    onChange={(_, value) => handlePriceRangeChange([filters.priceRange.min, value])}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </HStack>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Categories */}
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Categories
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack align="start">
                {facets && Object.entries(facets.categories).map(([category, count]) => (
                  <Checkbox
                    key={category}
                    isChecked={filters.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  >
                    {category} ({count})
                  </Checkbox>
                ))}
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Effects */}
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Effects
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack align="start">
                {facets && Object.entries(facets.effects).map(([effect, count]) => (
                  <Checkbox
                    key={effect}
                    isChecked={filters.effects.includes(effect)}
                    onChange={() => handleEffectChange(effect)}
                  >
                    {effect} ({count})
                  </Checkbox>
                ))}
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Benefits */}
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Benefits
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack align="start">
                {facets && Object.entries(facets.benefits).map(([benefit, count]) => (
                  <Checkbox
                    key={benefit}
                    isChecked={filters.benefits.includes(benefit)}
                    onChange={() => handleBenefitChange(benefit)}
                  >
                    {benefit} ({count})
                  </Checkbox>
                ))}
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Brands */}
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Brands
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <VStack align="start">
                {facets && Object.entries(facets.brands).map(([brand, count]) => (
                  <Checkbox
                    key={brand}
                    isChecked={filters.brands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                  >
                    {brand} ({count})
                  </Checkbox>
                ))}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </Box>
  );
};
