import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Stack,
  Heading,
  Text,
  Button,
  useToast,
  Avatar,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Divider,
  useColorModeValue,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FaEdit, FaKey, FaHistory, FaHeart, FaStar } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Order } from '../types/order';
import { Product } from '../types/product';
import { Review } from '../types/review';

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  avatar_url: string;
  address: string;
}

interface PasswordChange {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<UserData>>({});
  const [passwordData, setPasswordData] = useState<PasswordChange>({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchUserData();
    fetchOrders();
    fetchWishlist();
    fetchReviews();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/users/profile/');
      setUserData(response.data);
      setEditedData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist/');
      setWishlist(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews/user/');
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await api.put('/users/profile/', editedData);
      setUserData({ ...userData, ...editedData } as UserData);
      setIsEditing(false);
      toast({
        title: 'Profile Updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await api.post('/users/change-password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      onClose();
      toast({
        title: 'Password Changed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: 'Failed to change password',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="7xl" py={10}>
      <Stack spacing={8}>
        {/* Profile Header */}
        <Box
          bg={bgColor}
          boxShadow="sm"
          borderRadius="lg"
          p={6}
        >
          <HStack spacing={6} align="start">
            <Avatar
              size="2xl"
              src={userData?.avatar_url}
              name={`${userData?.first_name} ${userData?.last_name}`}
            />
            <VStack align="start" flex={1} spacing={4}>
              <HStack justify="space-between" w="100%">
                <Box>
                  <Heading size="lg">
                    {userData?.first_name} {userData?.last_name}
                  </Heading>
                  <Text color="gray.500">{userData?.email}</Text>
                </Box>
                <HStack>
                  <IconButton
                    aria-label="Edit Profile"
                    icon={<FaEdit />}
                    onClick={() => setIsEditing(!isEditing)}
                  />
                  <IconButton
                    aria-label="Change Password"
                    icon={<FaKey />}
                    onClick={onOpen}
                  />
                </HStack>
              </HStack>
            </VStack>
          </HStack>
        </Box>

        {/* Main Content */}
        <Tabs isLazy>
          <TabList>
            <Tab><HStack><FaEdit /><Text>Profile</Text></HStack></Tab>
            <Tab><HStack><FaHistory /><Text>Orders</Text></HStack></Tab>
            <Tab><HStack><FaHeart /><Text>Wishlist</Text></HStack></Tab>
            <Tab><HStack><FaStar /><Text>Reviews</Text></HStack></Tab>
          </TabList>

          <TabPanels>
            {/* Profile Tab */}
            <TabPanel>
              <Card>
                <CardBody>
                  <Stack spacing={4}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>First Name</FormLabel>
                        <Input
                          value={editedData.first_name || ''}
                          onChange={(e) => setEditedData({ ...editedData, first_name: e.target.value })}
                          isReadOnly={!isEditing}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Last Name</FormLabel>
                        <Input
                          value={editedData.last_name || ''}
                          onChange={(e) => setEditedData({ ...editedData, last_name: e.target.value })}
                          isReadOnly={!isEditing}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Phone Number</FormLabel>
                        <Input
                          value={editedData.phone_number || ''}
                          onChange={(e) => setEditedData({ ...editedData, phone_number: e.target.value })}
                          isReadOnly={!isEditing}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Address</FormLabel>
                        <Input
                          value={editedData.address || ''}
                          onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                          isReadOnly={!isEditing}
                        />
                      </FormControl>
                    </SimpleGrid>
                    {isEditing && (
                      <Button colorScheme="green" onClick={handleUpdateProfile}>
                        Save Changes
                      </Button>
                    )}
                  </Stack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Orders Tab */}
            <TabPanel>
              <Stack spacing={4}>
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardBody>
                      <HStack justify="space-between">
                        <VStack align="start">
                          <Text fontWeight="bold">Order #{order.id}</Text>
                          <Text>{new Date(order.created_at).toLocaleDateString()}</Text>
                        </VStack>
                        <Badge
                          colorScheme={
                            order.status === 'completed' ? 'green' :
                            order.status === 'processing' ? 'blue' :
                            'yellow'
                          }
                        >
                          {order.status}
                        </Badge>
                        <Text fontWeight="bold">${order.total_amount}</Text>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            {/* Wishlist Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {wishlist.map((product) => (
                  <Card key={product.id}>
                    <CardBody>
                      <HStack spacing={4}>
                        <Avatar
                          size="lg"
                          src={product.images[0]?.image}
                          name={product.name}
                        />
                        <VStack align="start" flex={1}>
                          <Text fontWeight="bold">{product.name}</Text>
                          <Text color="green.500">${product.price}</Text>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </TabPanel>

            {/* Reviews Tab */}
            <TabPanel>
              <Stack spacing={4}>
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" width="100%">
                          <Text fontWeight="bold">{review.product.name}</Text>
                          <HStack>
                            {[...Array(5)].map((_, i) => (
                              <Icon
                                key={i}
                                as={FaStar}
                                color={i < review.rating ? 'yellow.400' : 'gray.300'}
                              />
                            ))}
                          </HStack>
                        </HStack>
                        <Text>{review.comment}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Stack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>

      {/* Password Change Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Current Password</FormLabel>
                <Input
                  type="password"
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handlePasswordChange}>
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default UserProfile;
