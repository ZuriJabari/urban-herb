import { Box, Container, Heading, Text } from '@chakra-ui/react';

export const CategoriesPage = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={4}>Categories</Heading>
      <Text>Browse products by category.</Text>
    </Container>
  );
};
