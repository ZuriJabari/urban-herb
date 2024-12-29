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
import { FaStar } from 'react-icons/fa';

interface RatingFilterProps {
  selectedRating: number;
  onRatingChange: (rating: number) => void;
}

export const RatingFilter = ({ selectedRating, onRatingChange }: RatingFilterProps) => {
  const bgSelected = useColorModeValue('green.500', 'green.400');
  const bgUnselected = useColorModeValue('gray.100', 'gray.700');
  const textSelected = useColorModeValue('white', 'white');
  const textUnselected = useColorModeValue('gray.800', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const ratings = [4, 3, 2, 1];

  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Heading size="sm" mb={4}>Rating</Heading>
        <Divider mb={4} />
      </Box>

      <VStack align="stretch" spacing={2}>
        {ratings.map((rating) => (
          <Box
            key={rating}
            as="button"
            onClick={() => onRatingChange(rating === selectedRating ? 0 : rating)}
            bg={selectedRating === rating ? bgSelected : bgUnselected}
            color={selectedRating === rating ? textSelected : textUnselected}
            p={3}
            borderRadius="md"
            display="flex"
            alignItems="center"
            transition="all 0.2s"
            border="1px solid"
            borderColor={selectedRating === rating ? bgSelected : borderColor}
            _hover={{
              bg: selectedRating === rating ? 'green.600' : 'gray.200',
              transform: 'translateY(-2px)',
              shadow: 'md'
            }}
            _active={{
              transform: 'scale(0.95)'
            }}
          >
            <HStack spacing={1}>
              {[...Array(rating)].map((_, i) => (
                <Icon
                  key={i}
                  as={FaStar}
                  color={selectedRating === rating ? 'white' : 'yellow.400'}
                />
              ))}
              <Text ml={2} fontSize="sm">& Up</Text>
            </HStack>
          </Box>
        ))}
      </VStack>
    </VStack>
  );
};
