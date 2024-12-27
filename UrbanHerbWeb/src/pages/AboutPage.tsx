import { Box, Container, Heading, Text } from '@chakra-ui/react';

export const AboutPage = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={4}>About Us</Heading>
      <Text>Learn more about UrbanHerb and our mission.</Text>
    </Container>
  );
};
