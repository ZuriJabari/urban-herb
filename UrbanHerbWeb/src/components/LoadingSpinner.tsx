import { Spinner, Center, Text, VStack } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const LoadingSpinner = ({ text, size = 'xl' }: LoadingSpinnerProps) => {
  return (
    <Center minH="200px">
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="green.500"
          size={size}
        />
        {text && (
          <Text color="gray.600" fontSize="sm">
            {text}
          </Text>
        )}
      </VStack>
    </Center>
  );
};

export default LoadingSpinner;
