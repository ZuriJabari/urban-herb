import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Heading,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaBox, FaBoxOpen } from 'react-icons/fa';

interface StockFilterProps {
  inStock: boolean | null;
  onStockChange: (inStock: boolean | null) => void;
}

export const StockFilter = ({ inStock, onStockChange }: StockFilterProps) => {
  const bgSelected = useColorModeValue('green.500', 'green.400');
  const bgUnselected = useColorModeValue('gray.100', 'gray.700');
  const textSelected = useColorModeValue('white', 'white');
  const textUnselected = useColorModeValue('gray.800', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const options = [
    { value: true, label: 'In Stock', icon: FaBox },
    { value: false, label: 'Out of Stock', icon: FaBoxOpen },
  ];

  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Heading size="sm" mb={4}>Availability</Heading>
        <Divider mb={4} />
      </Box>

      <VStack align="stretch" spacing={2}>
        {options.map((option) => (
          <Box
            key={String(option.value)}
            as="button"
            onClick={() => onStockChange(inStock === option.value ? null : option.value)}
            bg={inStock === option.value ? bgSelected : bgUnselected}
            color={inStock === option.value ? textSelected : textUnselected}
            p={3}
            borderRadius="md"
            display="flex"
            alignItems="center"
            transition="all 0.2s"
            border="1px solid"
            borderColor={inStock === option.value ? bgSelected : borderColor}
            _hover={{
              bg: inStock === option.value ? 'green.600' : 'gray.200',
              transform: 'translateY(-2px)',
              shadow: 'md'
            }}
            _active={{
              transform: 'scale(0.95)'
            }}
          >
            <HStack spacing={2}>
              <Icon as={option.icon} />
              <Text fontSize="sm">{option.label}</Text>
            </HStack>
          </Box>
        ))}
      </VStack>
    </VStack>
  );
};
