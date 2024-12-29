import React from 'react';
import { Box, Container, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxW="container.md" py={20}>
      <VStack spacing={6} textAlign="center">
        <Heading size="2xl">404</Heading>
        <Heading size="xl">Page Not Found</Heading>
        <Text fontSize="lg" color="gray.600">
          The page you are looking for does not exist or has been moved.
        </Text>
        <Box pt={6}>
          <Button
            colorScheme="green"
            size="lg"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default NotFoundPage;
