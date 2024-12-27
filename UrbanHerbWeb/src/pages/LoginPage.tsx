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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  PinInput,
  PinInputField,
  HStack,
  Divider,
  useColorModeValue,
  Link,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const LoginPage = () => {
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const { state: { isLoading, error }, loginWithPhone, loginWithEmail, verifyPhone } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const validateUgandaPhone = (phone: string): boolean => {
    const ugandaPhoneRegex = /^(?:\+256|0)7[0-9]{8}$/;
    return ugandaPhoneRegex.test(phone);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePhoneSubmit = async () => {
    if (!validateUgandaPhone(phoneNumber)) {
      setPhoneError('Please enter a valid Uganda phone number (+256 or 07)');
      return;
    }
    setPhoneError('');

    try {
      await loginWithPhone({ phone_number: phoneNumber });
      setShowOTPInput(true);
      toast({
        title: 'OTP Sent',
        description: 'Please check your phone for the verification code',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                         err.response?.data?.detail || 
                         'Failed to send verification code';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEmailSubmit = async () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');

    if (password.length < 6) {
      setEmailError('Password must be at least 6 characters');
      return;
    }

    try {
      await loginWithEmail({ email, password });
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    } catch (err) {
      toast({
        title: 'Error',
        description: error || 'Failed to login',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

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
      await verifyPhone({ phone_number: phoneNumber, code: verificationCode });
      const from = location.state?.from?.pathname || '/';
      navigate(from);
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
          <Heading size="xl">Welcome Back</Heading>
          <Text color="gray.600">Sign in to continue shopping</Text>

          <Tabs isFitted variant="enclosed" onChange={(index) => setAuthMethod(index === 0 ? 'phone' : 'email')}>
            <TabList mb="1em">
              <Tab>Phone</Tab>
              <Tab>Email</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {!showOTPInput ? (
                  <VStack spacing={4} w="100%">
                    <FormControl isInvalid={!!phoneError}>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        type="tel"
                        placeholder="+256 or 07..."
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                      <FormErrorMessage>{phoneError}</FormErrorMessage>
                    </FormControl>
                    <Button
                      w="100%"
                      colorScheme="green"
                      onClick={handlePhoneSubmit}
                      isLoading={isLoading}
                    >
                      Send Code
                    </Button>
                  </VStack>
                ) : (
                  <VStack spacing={4} w="100%">
                    <Text>Enter the code sent to {phoneNumber}</Text>
                    <HStack>
                      <PinInput value={verificationCode} onChange={setVerificationCode}>
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                      </PinInput>
                    </HStack>
                    <Button
                      w="100%"
                      colorScheme="green"
                      onClick={handleVerifyOTP}
                      isLoading={isLoading}
                    >
                      Verify Code
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowOTPInput(false);
                        setVerificationCode('');
                      }}
                    >
                      Change Phone Number
                    </Button>
                  </VStack>
                )}
              </TabPanel>

              <TabPanel>
                <VStack spacing={4} w="100%">
                  <FormControl isInvalid={!!emailError}>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormControl>
                  <FormControl isInvalid={!!emailError}>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <FormErrorMessage>{emailError}</FormErrorMessage>
                  </FormControl>
                  <Button
                    w="100%"
                    colorScheme="green"
                    onClick={handleEmailSubmit}
                    isLoading={isLoading}
                  >
                    Sign In
                  </Button>
                  <Link as={RouterLink} to="/password-recovery" color="green.500">
                    Forgot Password?
                  </Link>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <Divider />

          <Text>
            Don't have an account?{' '}
            <Link as={RouterLink} to="/register" color="green.500">
              Sign Up
            </Link>
          </Text>
        </VStack>
      </MotionBox>
    </Container>
  );
};

export default LoginPage;
