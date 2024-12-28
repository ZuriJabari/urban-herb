import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  useToast,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthTest() {
  const { state, register, loginWithEmail, logout, sendEmailVerification, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ email, password, first_name: firstName, last_name: lastName });
      toast({
        title: 'Registration successful!',
        description: 'Please check your email for verification.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Clear form
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithEmail({ email, password });
      toast({
        title: 'Login successful!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Clear form
      setEmail('');
      setPassword('');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Logout failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendEmailVerification();
      toast({
        title: 'Verification email sent!',
        description: 'Please check your inbox.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to send verification email',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(resetEmail);
      toast({
        title: 'Password reset email sent!',
        description: 'Please check your inbox for further instructions.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setResetEmail('');
      onClose();
    } catch (error: any) {
      toast({
        title: 'Password reset failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="md" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Authentication Test</Heading>
        
        {state.user ? (
          <VStack spacing={4} align="stretch">
            <Text>Logged in as: {state.user.email}</Text>
            <Text>
              Email verification status:{' '}
              <Text as="span" color={state.user.is_email_verified ? 'green.500' : 'red.500'} fontWeight="bold">
                {state.user.is_email_verified ? 'Verified' : 'Not Verified'}
              </Text>
            </Text>
            
            {!state.user.is_email_verified && (
              <Button colorScheme="blue" onClick={handleResendVerification}>
                Resend Verification Email
              </Button>
            )}
            
            <Button colorScheme="red" onClick={handleLogout}>
              Logout
            </Button>
          </VStack>
        ) : (
          <VStack spacing={6} align="stretch">
            <Box as="form" onSubmit={handleRegister}>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Register</Heading>
                <FormControl isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>
                <Button type="submit" colorScheme="blue">
                  Register
                </Button>
              </VStack>
            </Box>

            <Divider />

            <Box as="form" onSubmit={handleLogin}>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Login</Heading>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>
                <Button type="submit" colorScheme="green">
                  Login
                </Button>
                <Button variant="link" colorScheme="blue" onClick={onOpen}>
                  Forgot Password?
                </Button>
              </VStack>
            </Box>
          </VStack>
        )}

        {state.error && (
          <Alert status="error">
            <AlertIcon />
            {state.error}
          </Alert>
        )}

        {/* Password Reset Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Reset Password</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <form onSubmit={handlePasswordReset}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Email Address</FormLabel>
                    <Input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </FormControl>
                  <Button type="submit" colorScheme="blue" width="full">
                    Send Reset Link
                  </Button>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
}
