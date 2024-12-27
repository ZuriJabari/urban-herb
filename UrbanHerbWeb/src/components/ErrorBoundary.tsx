import { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  useToast,
} from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box minH="100vh" bg="gray.50" py={20}>
          <Container maxW="container.md">
            <VStack spacing={8} textAlign="center">
              <Heading color="red.500">Oops! Something went wrong</Heading>
              <Text color="gray.600">
                We apologize for the inconvenience. An error has occurred while
                rendering this page.
              </Text>
              {this.state.error && (
                <Text color="gray.500" fontSize="sm">
                  Error: {this.state.error.message}
                </Text>
              )}
              <Button
                colorScheme="green"
                size="lg"
                onClick={this.handleReset}
              >
                Return to Home Page
              </Button>
            </VStack>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
