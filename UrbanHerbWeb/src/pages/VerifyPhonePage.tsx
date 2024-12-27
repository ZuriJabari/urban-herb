import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  PinInput,
  PinInputField,
  HStack,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const VerifyPhonePage = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const { state: { isLoading, error }, verifyPhone, loginWithPhone } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const phone_number = location.state?.phone_number;

  useEffect(() => {
    if (!phone_number) {
      navigate('/register');
      return;
    }

    // Countdown timer for resend button
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, canResend, navigate, phone_number]);

  const handleVerifyOTP = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit code',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await verifyPhone({ phone_number, code: verificationCode });
      toast({
        title: 'Success',
        description: 'Phone number verified successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (err) {
      toast({
        title: 'Error',
        description: error || 'Failed to verify OTP',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleResendOTP = async () => {
    try {
      await loginWithPhone({ phone_number });
      setCountdown(30);
      setCanResend(false);
      
      toast({
        title: 'OTP Sent',
        description: 'A new verification code has been sent to your phone',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: error || 'Failed to resend OTP',
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
          <Heading size="xl">Verify Your Phone</Heading>
          
          <Text textAlign="center" color="gray.600">
            Enter the 6-digit code sent to{' '}
            <Text as="span" fontWeight="bold">
              {phone_number}
            </Text>
          </Text>

          <HStack spacing={4} justify="center">
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

          <Button
            colorScheme="green"
            width="100%"
            onClick={handleVerifyOTP}
            isLoading={isLoading}
          >
            Verify Code
          </Button>

          <HStack spacing={4}>
            <Button
              variant="ghost"
              isDisabled={!canResend}
              onClick={handleResendOTP}
              isLoading={isLoading}
            >
              Resend Code
            </Button>
            {!canResend && (
              <Text fontSize="sm" color="gray.500">
                ({countdown}s)
              </Text>
            )}
          </HStack>

          <Button
            variant="link"
            colorScheme="gray"
            onClick={() => navigate('/register')}
          >
            Change Phone Number
          </Button>
        </VStack>
      </MotionBox>
    </Container>
  );
};

export default VerifyPhonePage;
