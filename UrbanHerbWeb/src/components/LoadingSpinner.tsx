import React from 'react';
import { Spinner, Center, Text, VStack } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'Loading...' }) => {
  return (
    <Center h="100vh">
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="green.500"
          size="xl"
        />
        <Text color="gray.600">{text}</Text>
      </VStack>
    </Center>
  );
};

export default LoadingSpinner;
