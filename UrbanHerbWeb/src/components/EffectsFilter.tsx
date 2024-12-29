import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  Text,
  Icon,
  Tooltip,
  SimpleGrid,
  useColorModeValue,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { 
  FaPrescriptionBottle, 
  FaHeart, 
  FaMoon, 
  FaLeaf, 
  FaBrain, 
  FaSmile, 
  FaHandHoldingMedical,
  FaMedkit 
} from 'react-icons/fa';
import { CBDEffect } from '../types/product';
import { ProductService } from '../services/product.service';

const iconMap: { [key: string]: any } = {
  FaPrescriptionBottle,
  FaHeart,
  FaMoon,
  FaLeaf,
  FaBrain,
  FaSmile,
  FaHandHoldingMedical,
  FaStomach: FaMedkit,
};

interface EffectsFilterProps {
  selectedEffects: number[];
  onEffectsChange: (effects: number[]) => void;
}

export const EffectsFilter = ({ selectedEffects, onEffectsChange }: EffectsFilterProps) => {
  const [effects, setEffects] = useState<CBDEffect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const bgSelected = useColorModeValue('green.500', 'green.400');
  const bgUnselected = useColorModeValue('gray.100', 'gray.700');
  const textSelected = useColorModeValue('white', 'white');
  const textUnselected = useColorModeValue('gray.800', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchEffects = async () => {
      try {
        setIsLoading(true);
        const response = await ProductService.getCBDEffects();
        setEffects(response);
      } catch (error: any) {
        console.error('Error fetching effects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load CBD effects. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEffects();
  }, [toast]);

  const handleEffectToggle = (effectId: number) => {
    const newEffects = selectedEffects.includes(effectId)
      ? selectedEffects.filter(id => id !== effectId)
      : [...selectedEffects, effectId];
    onEffectsChange(newEffects);
  };

  if (isLoading) {
    return (
      <Box>
        <Heading size="sm" mb={4}>Effects</Heading>
        <Divider mb={4} />
        <Text fontSize="sm" color="gray.500">Loading effects...</Text>
      </Box>
    );
  }

  if (effects.length === 0) {
    return (
      <Box>
        <Heading size="sm" mb={4}>Effects</Heading>
        <Divider mb={4} />
        <Text fontSize="sm" color="gray.500">No effects available</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Heading size="sm" mb={4}>Effects</Heading>
        <Divider mb={4} />
      </Box>
      <SimpleGrid columns={2} spacing={2}>
        {effects.map(effect => (
          <Tooltip 
            key={effect.id} 
            label={effect.description}
            placement="top"
            hasArrow
          >
            <Box
              as="button"
              onClick={() => handleEffectToggle(effect.id)}
              bg={selectedEffects.includes(effect.id) ? bgSelected : bgUnselected}
              color={selectedEffects.includes(effect.id) ? textSelected : textUnselected}
              p={3}
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
              transition="all 0.2s"
              border="1px solid"
              borderColor={selectedEffects.includes(effect.id) ? bgSelected : borderColor}
              _hover={{
                bg: selectedEffects.includes(effect.id) ? 'green.600' : 'gray.200',
                transform: 'translateY(-2px)',
                shadow: 'md'
              }}
              _active={{
                transform: 'scale(0.95)'
              }}
              width="100%"
            >
              {iconMap[effect.icon] && (
                <Icon 
                  as={iconMap[effect.icon]} 
                  mr={2}
                  fontSize="lg"
                />
              )}
              <Text 
                fontSize="sm" 
                fontWeight="medium"
                noOfLines={1}
              >
                {effect.name}
              </Text>
            </Box>
          </Tooltip>
        ))}
      </SimpleGrid>
    </VStack>
  );
};
