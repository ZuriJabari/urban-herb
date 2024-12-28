import { Button, VStack, FormControl, FormLabel, Input, Text, useToast, Center, Box } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { loginWithEmail } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('Attempting login with:', { email, password: '****' });
      await loginWithEmail({ email, password });
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Login error:', {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      const errorMessage = error.response?.data?.error || 
                       error.response?.data?.detail ||
                       error.response?.data?.non_field_errors?.[0] ||
                       'Login failed. Please check your email and password.';
      toast({
        title: 'Login failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center minH="100vh" bg="gray.50">
      <VStack spacing={8} w="full" maxW="md" bg="white" p={8} borderRadius="lg" boxShadow="md">
        <Text fontSize="2xl" fontWeight="bold">Welcome Back</Text>
        
        <form onSubmit={handleEmailLogin} style={{ width: '100%' }}>
          <VStack spacing={4} w="full">
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </FormControl>
            
            <Button
              type="submit"
              colorScheme="green"
              w="full"
              isLoading={isLoading}
            >
              Login with Email
            </Button>
          </VStack>
        </form>
        
        <Box w="full" textAlign="center">
          <Text mb={2}>
            Don't have an account?{' '}
            <Button
              variant="link"
              colorScheme="green"
              onClick={() => navigate('/register')}
            >
              Sign up
            </Button>
          </Text>
          
          <Button
            variant="link"
            colorScheme="green"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password?
          </Button>
        </Box>
      </VStack>
    </Center>
  );
};

export default LoginPage;
