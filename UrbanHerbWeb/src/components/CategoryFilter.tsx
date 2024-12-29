import React from 'react';
import {
  Box,
  Heading,
  VStack,
  Text,
  Icon,
  SimpleGrid,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import {
  FaSeedling,
  FaCannabis,
  FaWineBottle,
  FaVial,
  FaOilCan,
  FaCookieBite,
  FaBox,
  FaJoint,
} from 'react-icons/fa';

const categories = [
  { id: 'FLOWERS', name: 'Flowers', icon: FaCannabis },
  { id: 'EDIBLES', name: 'Edibles', icon: FaCookieBite },
  { id: 'CONCENTRATES', name: 'Concentrates', icon: FaVial },
  { id: 'VAPES', name: 'Vapes', icon: FaWineBottle },
  { id: 'TINCTURES', name: 'Tinctures', icon: FaOilCan },
  { id: 'TOPICALS', name: 'Topicals', icon: FaBox },
  { id: 'PRE_ROLLS', name: 'Pre-Rolls', icon: FaJoint },
  { id: 'SEEDS', name: 'Seeds', icon: FaSeedling },
  { id: 'OILS', name: 'Oils', icon: FaOilCan },
  { id: 'ACCESSORIES', name: 'Accessories', icon: FaBox },
  { id: 'BUNDLES', name: 'Bundles', icon: FaBox },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const bgSelected = useColorModeValue('green.500', 'green.400');
  const bgUnselected = useColorModeValue('gray.100', 'gray.700');
  const textSelected = useColorModeValue('white', 'white');
  const textUnselected = useColorModeValue('gray.800', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Heading size="sm" mb={4}>Categories</Heading>
        <Divider mb={4} />
      </Box>
      <SimpleGrid columns={2} spacing={2}>
        <Box
          key=""
          as="button"
          onClick={() => onCategoryChange('')}
          bg={selectedCategory === '' ? bgSelected : bgUnselected}
          color={selectedCategory === '' ? textSelected : textUnselected}
          p={3}
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          transition="all 0.2s"
          border="1px solid"
          borderColor={selectedCategory === '' ? bgSelected : borderColor}
          _hover={{
            bg: selectedCategory === '' ? 'green.600' : 'gray.200',
            transform: 'translateY(-2px)',
            shadow: 'md'
          }}
          _active={{
            transform: 'scale(0.95)'
          }}
          width="100%"
        >
          <Text 
            fontSize="sm" 
            fontWeight="medium"
            noOfLines={1}
          >
            All
          </Text>
        </Box>
        {categories.map(category => (
          <Box
            key={category.id}
            as="button"
            onClick={() => onCategoryChange(category.id === selectedCategory ? '' : category.id)}
            bg={selectedCategory === category.id ? bgSelected : bgUnselected}
            color={selectedCategory === category.id ? textSelected : textUnselected}
            p={3}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            transition="all 0.2s"
            border="1px solid"
            borderColor={selectedCategory === category.id ? bgSelected : borderColor}
            _hover={{
              bg: selectedCategory === category.id ? 'green.600' : 'gray.200',
              transform: 'translateY(-2px)',
              shadow: 'md'
            }}
            _active={{
              transform: 'scale(0.95)'
            }}
            width="100%"
          >
            <Icon 
              as={category.icon} 
              mr={2}
              fontSize="lg"
            />
            <Text 
              fontSize="sm" 
              fontWeight="medium"
              noOfLines={1}
            >
              {category.name}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
};
