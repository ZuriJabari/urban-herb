import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast, Center, Spinner, Text, VStack } from '@chakra-ui/react';

const SocialAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      // Store the token
      localStorage.setItem('access_token', token);
      
      // Show success message
      toast({
        title: 'Login Successful',
        description: 'Welcome to UrbanHerb!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect to home
      navigate('/');
    } else if (error) {
      // Show error message
      toast({
        title: 'Login Failed',
        description: error || 'An error occurred during login',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });

      // Redirect to login
      navigate('/login');
    }
  }, [location, navigate, toast]);

  return (
    <Center minH="100vh">
      <VStack spacing={4}>
        <Spinner size="xl" color="green.500" />
        <Text>Processing your login...</Text>
      </VStack>
    </Center>
  );
};

export default SocialAuthCallback;
