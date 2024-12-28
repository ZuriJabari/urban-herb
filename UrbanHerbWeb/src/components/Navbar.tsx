import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Flex, 
  Button, 
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { state, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Box as="nav" bg="green.500" px={4} py={2}>
      <Flex maxW="container.xl" mx="auto" align="center" justify="space-between">
        <Flex align="center">
          <Link to="/">
            <Box fontSize="xl" fontWeight="bold" color="white">
              UrbanHerb
            </Box>
          </Link>
        </Flex>

        <Flex align="center" gap={4}>
          <Link to="/products">
            <Button variant="ghost" color="white" _hover={{ bg: 'green.600' }}>
              Products
            </Button>
          </Link>
          
          <Link to="/cart">
            <Button variant="ghost" color="white" _hover={{ bg: 'green.600' }}>
              Cart
            </Button>
          </Link>
          
          <Link to="/wishlist">
            <Button variant="ghost" color="white" _hover={{ bg: 'green.600' }}>
              Wishlist
            </Button>
          </Link>
          
          {state.user ? (
            <Menu>
              <MenuButton>
                <Avatar 
                  size="sm" 
                  name={`${state.user.first_name} ${state.user.last_name}`}
                  src=""
                  bg="white"
                  color="green.500"
                />
              </MenuButton>
              <MenuList>
                <Text px={3} py={2} fontWeight="bold">
                  {state.user.first_name} {state.user.last_name}
                </Text>
                <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
                <MenuItem onClick={() => navigate('/orders')}>Orders</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Link to="/login">
              <Button variant="solid" bg="white" color="green.500" _hover={{ bg: 'gray.100' }}>
                Login
              </Button>
            </Link>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
