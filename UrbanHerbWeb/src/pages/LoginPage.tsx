import { Button, VStack, FormControl, FormLabel, Input, Text, useToast, Center, Box, useColorModeValue } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { loginWithEmail, user, loading } = useAuth();

  // Debug logging for component state
  useEffect(() => {
    console.log('LoginPage - Component State:', {
      isLoading,
      loading,
      user,
      hasToken: !!localStorage.getItem('token'),
      hasRefreshToken: !!localStorage.getItem('refresh_token'),
      location: location.pathname,
      from: location.state?.from
    });
  }, [isLoading, loading, user, location]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      console.log('LoginPage - User already logged in, redirecting');
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('LoginPage - Attempting login:', { email });
      await loginWithEmail(email, password);
      console.log('LoginPage - Login successful');
      
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Navigation will be handled by the useEffect
    } catch (error) {
      console.error('LoginPage - Login error:', error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An error occurred during login',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center minH="calc(100vh - 60px)" bg={useColorModeValue('gray.50', 'gray.800')}>
      <Box
        p={8}
        maxWidth="400px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        bg={useColorModeValue('white', 'gray.700')}
      >
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Text fontSize="2xl" fontWeight="bold">
              Sign In
            </Text>
            
            <FormControl id="email" isRequired>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="green"
              width="full"
              mt={4}
              isLoading={isLoading}
              loadingText="Signing in..."
            >
              Sign In
            </Button>

            <Text pt={2}>
              Don't have an account?{' '}
              <Button
                variant="link"
                colorScheme="green"
                onClick={() => navigate('/register')}
                disabled={isLoading}
              >
                Register
              </Button>
            </Text>
          </VStack>
        </form>
      </Box>
    </Center>
  );
};

export default LoginPage;
