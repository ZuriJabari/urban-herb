import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';

export default function VerifyEmailPage() {
  const { state, resendVerificationEmail, verifyEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmailWithToken(token);
    }
  }, [searchParams]);

  const verifyEmailWithToken = async (token: string) => {
    try {
      setIsVerifying(true);
      await verifyEmail(token);
      toast({
        title: 'Email verified successfully!',
        description: 'You can now use all features of the application.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Force reload user state and redirect
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: 'Verification failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setIsResending(true);
      await resendVerificationEmail();
      toast({
        title: 'Verification email sent!',
        description: 'Please check your inbox for the verification link.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to send email',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsResending(false);
    }
  };

  // If user is already verified, redirect to home
  if (state.user?.is_email_verified) {
    navigate('/');
    return null;
  }

  if (isVerifying) {
    return (
      <Container maxW="md" py={10}>
        <VStack spacing={4} align="center">
          <Spinner size="xl" color="blue.500" />
          <Text>Verifying your email...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="md" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Verify Your Email</Heading>

        <Alert status="info">
          <AlertIcon />
          <Text>
            We've sent a verification email to{' '}
            <Text as="span" fontWeight="bold">
              {state.user?.email}
            </Text>
          </Text>
        </Alert>

        <Text color="gray.600">
          Please check your inbox and follow the instructions to verify your email address.
          If you don't see the email, check your spam folder.
        </Text>

        <Button
          colorScheme="blue"
          onClick={handleResendEmail}
          isLoading={isResending}
          loadingText="Sending..."
        >
          Resend Verification Email
        </Button>

        <Button variant="outline" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </VStack>
    </Container>
  );
}
