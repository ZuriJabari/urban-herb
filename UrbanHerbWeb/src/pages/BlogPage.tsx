import { Box, Container, Heading, Text } from '@chakra-ui/react';

export const BlogPage = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={4}>Blog</Heading>
      <Text>Read our latest articles and updates.</Text>
    </Container>
  );
};
