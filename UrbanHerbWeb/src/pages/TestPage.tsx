import { Box, Container, Text, VStack } from '@chakra-ui/react';

const TestPage = () => {
  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold">Welcome to UrbanHerb</Text>
          <Text>Your trusted source for premium herbal products</Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default TestPage;
