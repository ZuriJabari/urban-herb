import React from 'react';
import {
  Box,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Heading,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';

interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
}

export const PriceFilter = ({ minPrice, maxPrice, onPriceChange }: PriceFilterProps) => {
  const [localMin, setLocalMin] = React.useState(minPrice);
  const [localMax, setLocalMax] = React.useState(maxPrice);
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSliderChange = (values: number[]) => {
    setLocalMin(values[0]);
    setLocalMax(values[1]);
    onPriceChange(values[0], values[1]);
  };

  const handleInputChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    if (type === 'min') {
      setLocalMin(numValue);
      if (numValue <= localMax) {
        onPriceChange(numValue, localMax);
      }
    } else {
      setLocalMax(numValue);
      if (numValue >= localMin) {
        onPriceChange(localMin, numValue);
      }
    }
  };

  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Heading size="sm" mb={4}>Price Range</Heading>
        <Divider mb={4} />
      </Box>

      <RangeSlider
        aria-label={['min', 'max']}
        min={0}
        max={1000}
        step={10}
        value={[localMin, localMax]}
        onChange={handleSliderChange}
        colorScheme="green"
      >
        <RangeSliderTrack>
          <RangeSliderFilledTrack />
        </RangeSliderTrack>
        <RangeSliderThumb index={0} boxSize={6} />
        <RangeSliderThumb index={1} boxSize={6} />
      </RangeSlider>

      <HStack spacing={4}>
        <InputGroup size="sm">
          <InputLeftElement
            pointerEvents="none"
            color="gray.400"
            fontSize="sm"
          >
            $
          </InputLeftElement>
          <Input
            type="number"
            value={localMin}
            onChange={(e) => handleInputChange('min', e.target.value)}
            borderColor={borderColor}
            min={0}
            max={localMax}
          />
        </InputGroup>
        <Text color="gray.500">to</Text>
        <InputGroup size="sm">
          <InputLeftElement
            pointerEvents="none"
            color="gray.400"
            fontSize="sm"
          >
            $
          </InputLeftElement>
          <Input
            type="number"
            value={localMax}
            onChange={(e) => handleInputChange('max', e.target.value)}
            borderColor={borderColor}
            min={localMin}
          />
        </InputGroup>
      </HStack>
    </VStack>
  );
};
