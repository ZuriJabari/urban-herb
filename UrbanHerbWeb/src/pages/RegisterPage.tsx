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
  Grid,
  GridItem,
  Divider,
  Link,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { state: { isLoading, error }, register } = useAuth();
  const navigate = useNavigate();
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!validateUgandaPhone(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid Uganda phone number (+256 or 07)';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Format phone number to E.164 format
      const formattedPhoneNumber = formData.phone_number.startsWith('+')
        ? formData.phone_number
        : formData.phone_number.startsWith('0')
        ? `+256${formData.phone_number.slice(1)}`
        : `+256${formData.phone_number}`;

      const registerData = {
        ...formData,
        phone_number: formattedPhoneNumber,
      };

      await register(registerData);
      toast({
        title: 'Registration Successful',
        description: 'Please verify your phone number to complete registration',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/verify-phone', { state: { phone_number: formattedPhoneNumber } });
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.error || 
                         err.response?.data?.phone_number?.[0] || 
                         err.response?.data?.message ||
                         'An error occurred during registration';
      
      // Set field-specific errors if they exist
      const fieldErrors: Record<string, string> = {};
      if (err.response?.data) {
        Object.entries(err.response.data).forEach(([key, value]) => {
          if (key !== 'error' && key !== 'message') {
            fieldErrors[key] = Array.isArray(value) ? value[0] : value;
          }
        });
      }
      
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      }
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
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
          <Heading size="xl">Create Account</Heading>
          <Text color="gray.600">Join our community of CBD enthusiasts</Text>
          
          <Grid templateColumns="repeat(2, 1fr)" gap={6} width="100%">
            <GridItem>
              <FormControl isInvalid={!!errors.first_name}>
                <FormLabel>First Name</FormLabel>
                <Input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="John"
                />
                <FormErrorMessage>{errors.first_name}</FormErrorMessage>
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl isInvalid={!!errors.last_name}>
                <FormLabel>Last Name</FormLabel>
                <Input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Doe"
                />
                <FormErrorMessage>{errors.last_name}</FormErrorMessage>
              </FormControl>
            </GridItem>
          </Grid>

          <FormControl isInvalid={!!errors.phone_number}>
            <FormLabel>Phone Number (Required)</FormLabel>
            <Input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              placeholder="+256 or 07..."
            />
            <FormErrorMessage>{errors.phone_number}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.email}>
            <FormLabel>Email (Optional)</FormLabel>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <Grid templateColumns="repeat(2, 1fr)" gap={6} width="100%">
            <GridItem>
              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="********"
                />
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl isInvalid={!!errors.confirm_password}>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  name="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="********"
                />
                <FormErrorMessage>{errors.confirm_password}</FormErrorMessage>
              </FormControl>
            </GridItem>
          </Grid>

          <Button
            colorScheme="green"
            width="100%"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Create Account
          </Button>
          
          <Divider />
          
          <Text>
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="green.500">
              Sign In
            </Link>
          </Text>
        </VStack>
      </MotionBox>
    </Container>
  );
};

export default RegisterPage;
