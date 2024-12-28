import React from 'react';
import { Box, Container, Stack, Text, Link } from '@chakra-ui/react';

const Footer: React.FC = () => {
  return (
    <Box as="footer" bg="gray.50" py={8}>
      <Container maxW="container.xl">
        <Stack spacing={8} direction={{ base: 'column', md: 'row' }} justify="space-between">
          <Stack spacing={4}>
            <Text fontSize="lg" fontWeight="bold" color="green.500">
              UrbanHerb
            </Text>
            <Text color="gray.600">
              Your one-stop shop for organic herbs and plants
            </Text>
          </Stack>

          <Stack direction={{ base: 'column', md: 'row' }} spacing={8}>
            <Stack spacing={4}>
              <Text fontWeight="bold">Quick Links</Text>
              <Link href="/products" color="gray.600">Products</Link>
              <Link href="/about" color="gray.600">About Us</Link>
              <Link href="/contact" color="gray.600">Contact</Link>
            </Stack>

            <Stack spacing={4}>
              <Text fontWeight="bold">Customer Service</Text>
              <Link href="/shipping" color="gray.600">Shipping Info</Link>
              <Link href="/returns" color="gray.600">Returns</Link>
              <Link href="/faq" color="gray.600">FAQ</Link>
            </Stack>

            <Stack spacing={4}>
              <Text fontWeight="bold">Legal</Text>
              <Link href="/privacy" color="gray.600">Privacy Policy</Link>
              <Link href="/terms" color="gray.600">Terms of Service</Link>
            </Stack>
          </Stack>
        </Stack>

        <Text mt={8} pt={8} borderTopWidth={1} textAlign="center" color="gray.500">
          © {new Date().getFullYear()} UrbanHerb. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
};

export default Footer;
