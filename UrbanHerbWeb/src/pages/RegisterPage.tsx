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
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const MotionBox = motion(Box);

const RegisterPage = () => {
  const { state: { isLoading, error }, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const formik = useFormik({
    initialValues: {
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      confirm_password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      first_name: Yup.string()
        .required('First name is required'),
      last_name: Yup.string()
        .required('Last name is required'),
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
      confirm_password: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: async (values) => {
      try {
        await register(values);
        // Registration successful - AuthContext will handle navigation
      } catch (error: any) {
        const errorData = error.response?.data;
        if (errorData) {
          // Handle field-specific errors
          Object.keys(errorData).forEach((field) => {
            if (field in values) {
              formik.setFieldError(field, errorData[field][0]);
            }
          });
        } else {
          toast({
            title: 'Registration failed',
            description: 'Please try again later',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    },
  });

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
              <FormControl isInvalid={formik.touched.first_name && formik.errors.first_name}>
                <FormLabel>First Name</FormLabel>
                <Input
                  name="first_name"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  placeholder="John"
                />
                <FormErrorMessage>{formik.errors.first_name}</FormErrorMessage>
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl isInvalid={formik.touched.last_name && formik.errors.last_name}>
                <FormLabel>Last Name</FormLabel>
                <Input
                  name="last_name"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  placeholder="Doe"
                />
                <FormErrorMessage>{formik.errors.last_name}</FormErrorMessage>
              </FormControl>
            </GridItem>
          </Grid>

          <FormControl isInvalid={formik.touched.email && formik.errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              placeholder="your@email.com"
            />
            <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
          </FormControl>

          <Grid templateColumns="repeat(2, 1fr)" gap={6} width="100%">
            <GridItem>
              <FormControl isInvalid={formik.touched.password && formik.errors.password}>
                <FormLabel>Password</FormLabel>
                <Input
                  name="password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  placeholder="********"
                />
                <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl isInvalid={formik.touched.confirm_password && formik.errors.confirm_password}>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  name="confirm_password"
                  type="password"
                  value={formik.values.confirm_password}
                  onChange={formik.handleChange}
                  placeholder="********"
                />
                <FormErrorMessage>{formik.errors.confirm_password}</FormErrorMessage>
              </FormControl>
            </GridItem>
          </Grid>

          <Button
            colorScheme="green"
            width="100%"
            onClick={formik.handleSubmit}
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
