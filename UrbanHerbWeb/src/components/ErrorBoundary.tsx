import React from 'react';
import { Box, Button, Heading, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

interface ErrorUIProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export const ErrorUI: React.FC<ErrorUIProps> = ({ error, resetErrorBoundary }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  let heading = 'Oops! Something went wrong';
  let message = 'An unexpected error occurred. Please try again later.';

  if (error?.message) {
    if (error.message.includes('404')) {
      heading = 'Page Not Found';
      message = 'The page you are looking for does not exist.';
    } else if (error.message.includes('401')) {
      heading = 'Unauthorized';
      message = 'You need to be logged in to access this page.';
    } else if (error.message.includes('403')) {
      heading = 'Forbidden';
      message = 'You do not have permission to access this page.';
    } else if (error.message.includes('503')) {
      heading = 'Service Unavailable';
      message = 'Our service is currently unavailable. Please try again later.';
    }
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <VStack
        spacing={6}
        bg={bgColor}
        p={8}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        shadow="lg"
        maxW="md"
        w="full"
        textAlign="center"
      >
        <Heading size="xl">{heading}</Heading>
        <Text fontSize="lg" color="gray.600">
          {message}
        </Text>
        <Button
          colorScheme="green"
          onClick={resetErrorBoundary}
        >
          Try Again
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/'}
        >
          Go Home
        </Button>
      </VStack>
    </Box>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorUI
          error={this.state.error}
          resetErrorBoundary={() => {
            this.setState({ hasError: false });
            window.location.reload();
          }}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
