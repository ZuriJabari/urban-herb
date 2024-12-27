import { Box, Container, Heading, Text } from '@chakra-ui/react';

export const SettingsPage = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={4}>Settings</Heading>
      <Text>Your account settings will appear here.</Text>
    </Container>
  );
};
