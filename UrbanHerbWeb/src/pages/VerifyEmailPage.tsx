import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const VerifyEmailPage = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { state: { user }, authApi } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await authApi.verifyEmail({
        email: user?.email || '',
        code: verificationCode,
      });

      toast({
        title: 'Email verified successfully',
        description: 'You can now proceed to login',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Verification failed');
      toast({
        title: 'Verification failed',
        description: err.response?.data?.detail || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await authApi.resendEmailVerification(user?.email || '');
      toast({
        title: 'Verification code sent',
        description: 'Please check your email for the new code',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: 'Failed to send verification code',
        description: err.response?.data?.detail || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <MotionBox
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={8}
        boxShadow="lg"
      >
        <VStack spacing={6}>
          <Heading size="xl">Verify Your Email</Heading>
          <Text color="gray.600" textAlign="center">
            We've sent a verification code to your email address.
            Please enter it below to verify your account.
          </Text>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4} width="100%">
              <FormControl isInvalid={!!error}>
                <FormLabel>Verification Code</FormLabel>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                />
                <FormErrorMessage>{error}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                colorScheme="green"
                width="100%"
                isLoading={isSubmitting}
              >
                Verify Email
              </Button>

              <Button
                variant="ghost"
                width="100%"
                onClick={handleResendCode}
                isDisabled={isSubmitting}
              >
                Resend Code
              </Button>
            </VStack>
          </form>
        </VStack>
      </MotionBox>
    </Container>
  );
};

export default VerifyEmailPage;
