import { Box, Container, Heading, Text } from '@chakra-ui/react';

export const OrdersPage = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={4}>My Orders</Heading>
      <Text>Your order history will appear here.</Text>
    </Container>
  );
};
