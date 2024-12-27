import { useState } from 'react';
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
  PinInput,
  PinInputField,
  HStack,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const PasswordRecoveryPage = () => {
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [identifier, setIdentifier] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { requestPasswordReset, verifyResetCode, resetPassword } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const validateIdentifier = () => {
    // Validate phone number (Uganda format) or email
    const phoneRegex = /^(\+256|0)[7][0-9]{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!phoneRegex.test(identifier) && !emailRegex.test(identifier)) {
      setError('Please enter a valid Uganda phone number or email address');
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleRequestReset = async () => {
    if (!validateIdentifier()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await requestPasswordReset(identifier);
      setStep('verify');
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast({
        title: 'Code Sent',
        description: 'A verification code has been sent to your phone/email',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      setError('Failed to send verification code. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to send verification code',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await verifyResetCode(identifier, verificationCode);
      setStep('reset');
      toast({
        title: 'Success',
        description: 'Code verified successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      setError('Invalid verification code. Please try again.');
      toast({
        title: 'Error',
        description: 'Invalid verification code',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await resetPassword(identifier, verificationCode, newPassword);
      toast({
        title: 'Success',
        description: 'Password reset successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
    } catch (error) {
      setError('Failed to reset password. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to reset password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          p={8}
          borderWidth={1}
          borderRadius="lg"
          bg={bgColor}
          borderColor={borderColor}
          shadow="lg"
        >
          <VStack spacing={8}>
            <Heading>Reset Password</Heading>

            {step === 'request' && (
              <VStack spacing={4} width="100%">
                <Text textAlign="center">
                  Enter your phone number or email to receive a verification code
                </Text>
                <FormControl isInvalid={!!error}>
                  <FormLabel>Phone Number or Email</FormLabel>
                  <Input
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setError('');
                    }}
                    placeholder="+256... or email@example.com"
                  />
                  <FormErrorMessage>{error}</FormErrorMessage>
                </FormControl>
                <Button
                  colorScheme="green"
                  width="100%"
                  onClick={handleRequestReset}
                  isLoading={isLoading}
                >
                  Send Code
                </Button>
              </VStack>
            )}

            {step === 'verify' && (
              <VStack spacing={6} width="100%">
                <Text textAlign="center">
                  Enter the 6-digit code sent to {identifier}
                </Text>
                <HStack justify="center">
                  <PinInput
                    otp
                    size="lg"
                    value={verificationCode}
                    onChange={setVerificationCode}
                  >
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                  </PinInput>
                </HStack>
                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
                <Button
                  colorScheme="green"
                  width="100%"
                  onClick={handleVerifyCode}
                  isLoading={isLoading}
                >
                  Verify Code
                </Button>
                <Button
                  variant="ghost"
                  isDisabled={countdown > 0}
                  onClick={handleRequestReset}
                >
                  {countdown > 0
                    ? `Resend code in ${countdown}s`
                    : 'Resend Code'}
                </Button>
                <Button
                  variant="link"
                  onClick={() => {
                    setStep('request');
                    setError('');
                  }}
                >
                  Change Phone/Email
                </Button>
              </VStack>
            )}

            {step === 'reset' && (
              <VStack spacing={4} width="100%">
                <FormControl isInvalid={!!error}>
                  <FormLabel>New Password</FormLabel>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter new password"
                  />
                </FormControl>
                <FormControl isInvalid={!!error}>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Confirm new password"
                  />
                  <FormErrorMessage>{error}</FormErrorMessage>
                </FormControl>
                <Button
                  colorScheme="green"
                  width="100%"
                  onClick={handleResetPassword}
                  isLoading={isLoading}
                >
                  Reset Password
                </Button>
              </VStack>
            )}

            <Button variant="link" onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </VStack>
        </Box>
      </MotionBox>
    </Container>
  );
};

export default PasswordRecoveryPage;
