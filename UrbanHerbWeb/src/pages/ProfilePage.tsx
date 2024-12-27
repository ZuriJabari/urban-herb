import { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
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
  Grid,
  GridItem,
  useColorModeValue,
  Avatar,
  AvatarBadge,
  IconButton,
  Divider,
  Badge
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { FaCamera, FaEdit, FaTrash } from 'react-icons/fa';
import { Address } from '../types/auth';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const ProfilePage = () => {
  const { user, updateUser, isLoading } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [addresses, setAddresses] = useState<Address[]>(user?.addresses || []);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({});
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (addressErrors[name]) {
      setAddressErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateAddress = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!newAddress.streetAddress?.trim()) {
      errors.streetAddress = 'Street address is required';
    }
    if (!newAddress.city?.trim()) {
      errors.city = 'City is required';
    }
    if (!newAddress.district?.trim()) {
      errors.district = 'District is required';
    }
    if (!newAddress.phoneNumber?.trim()) {
      errors.phoneNumber = 'Phone number is required';
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAddress = async () => {
    if (!validateAddress()) return;

    const newAddressItem: Address = {
      id: Date.now().toString(),
      userId: user?.id || '',
      streetAddress: newAddress.streetAddress || '',
      city: newAddress.city || '',
      district: newAddress.district || '',
      phoneNumber: newAddress.phoneNumber || '',
      isDefault: addresses.length === 0, // First address is default
      label: newAddress.label,
    };

    try {
      const updatedAddresses = [...addresses, newAddressItem];
      await updateUser({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      setNewAddress({});
      toast({
        title: 'Success',
        description: 'Address added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add address',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));

    try {
      await updateUser({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      toast({
        title: 'Success',
        description: 'Default address updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update default address',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      await updateUser({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      toast({
        title: 'Success',
        description: 'Address deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete address',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateUser(formData);
      setEditMode(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.lg" py={10}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Tabs isFitted>
          <TabList mb={8}>
            <Tab>Profile</Tab>
            <Tab>Addresses</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Box
                p={8}
                borderWidth={1}
                borderRadius="lg"
                bg={bgColor}
                borderColor={borderColor}
                shadow="lg"
              >
                <VStack spacing={8} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="lg">Profile Information</Heading>
                    <Button
                      leftIcon={<FaEdit />}
                      onClick={() => setEditMode(!editMode)}
                      variant="ghost"
                    >
                      {editMode ? 'Cancel' : 'Edit'}
                    </Button>
                  </HStack>

                  <VStack spacing={6} align="center">
                    <Box position="relative">
                      <Avatar
                        size="2xl"
                        name={`${user?.firstName} ${user?.lastName}`}
                      />
                      <IconButton
                        aria-label="Change profile picture"
                        icon={<FaCamera />}
                        size="sm"
                        colorScheme="green"
                        position="absolute"
                        bottom={0}
                        right={0}
                        rounded="full"
                      />
                    </Box>

                    {editMode ? (
                      <Grid templateColumns="repeat(2, 1fr)" gap={6} width="100%">
                        <GridItem>
                          <FormControl>
                            <FormLabel>First Name</FormLabel>
                            <Input
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                            />
                          </FormControl>
                        </GridItem>
                        <GridItem>
                          <FormControl>
                            <FormLabel>Last Name</FormLabel>
                            <Input
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                            />
                          </FormControl>
                        </GridItem>
                        <GridItem>
                          <FormControl>
                            <FormLabel>Phone Number</FormLabel>
                            <Input
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              isReadOnly={user?.isPhoneVerified}
                            />
                          </FormControl>
                        </GridItem>
                        <GridItem>
                          <FormControl>
                            <FormLabel>Email</FormLabel>
                            <Input
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              isReadOnly={user?.isEmailVerified}
                            />
                          </FormControl>
                        </GridItem>
                      </Grid>
                    ) : (
                      <VStack spacing={4} align="stretch" width="100%">
                        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                          <GridItem>
                            <Text fontWeight="bold">First Name</Text>
                            <Text>{user?.firstName}</Text>
                          </GridItem>
                          <GridItem>
                            <Text fontWeight="bold">Last Name</Text>
                            <Text>{user?.lastName}</Text>
                          </GridItem>
                          <GridItem>
                            <Text fontWeight="bold">Phone Number</Text>
                            <HStack>
                              <Text>{user?.phoneNumber}</Text>
                              {user?.isPhoneVerified && (
                                <Badge colorScheme="green">Verified</Badge>
                              )}
                            </HStack>
                          </GridItem>
                          <GridItem>
                            <Text fontWeight="bold">Email</Text>
                            <HStack>
                              <Text>{user?.email || 'Not provided'}</Text>
                              {user?.isEmailVerified && (
                                <Badge colorScheme="green">Verified</Badge>
                              )}
                            </HStack>
                          </GridItem>
                        </Grid>
                      </VStack>
                    )}

                    {editMode && (
                      <Button
                        colorScheme="green"
                        onClick={handleUpdateProfile}
                        isLoading={isLoading}
                        width="100%"
                      >
                        Save Changes
                      </Button>
                    )}
                  </VStack>
                </VStack>
              </Box>
            </TabPanel>

            <TabPanel>
              <Box
                p={8}
                borderWidth={1}
                borderRadius="lg"
                bg={bgColor}
                borderColor={borderColor}
                shadow="lg"
              >
                <VStack spacing={8} align="stretch">
                  <Heading size="lg">Addresses</Heading>

                  {addresses.map((address) => (
                    <Box
                      key={address.id}
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      position="relative"
                    >
                      <Grid templateColumns="1fr auto" gap={4}>
                        <VStack align="stretch" spacing={2}>
                          {address.label && (
                            <Badge colorScheme="green">{address.label}</Badge>
                          )}
                          <Text fontWeight="bold">
                            {address.streetAddress}
                          </Text>
                          <Text>
                            {address.city}, {address.district}
                          </Text>
                          <Text>{address.phoneNumber}</Text>
                          {address.isDefault && (
                            <Badge colorScheme="green">Default Address</Badge>
                          )}
                        </VStack>
                        <VStack>
                          {!address.isDefault && (
                            <Button
                              size="sm"
                              onClick={() => handleSetDefaultAddress(address.id)}
                            >
                              Set as Default
                            </Button>
                          )}
                          <IconButton
                            aria-label="Delete address"
                            icon={<FaTrash />}
                            colorScheme="red"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                          />
                        </VStack>
                      </Grid>
                    </Box>
                  ))}

                  <Divider />

                  <Box>
                    <Heading size="md" mb={4}>
                      Add New Address
                    </Heading>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <GridItem colSpan={2}>
                        <FormControl isInvalid={!!addressErrors.streetAddress}>
                          <FormLabel>Street Address</FormLabel>
                          <Input
                            name="streetAddress"
                            value={newAddress.streetAddress || ''}
                            onChange={handleAddressChange}
                          />
                          <FormErrorMessage>
                            {addressErrors.streetAddress}
                          </FormErrorMessage>
                        </FormControl>
                      </GridItem>
                      <GridItem>
                        <FormControl isInvalid={!!addressErrors.city}>
                          <FormLabel>City</FormLabel>
                          <Input
                            name="city"
                            value={newAddress.city || ''}
                            onChange={handleAddressChange}
                          />
                          <FormErrorMessage>
                            {addressErrors.city}
                          </FormErrorMessage>
                        </FormControl>
                      </GridItem>
                      <GridItem>
                        <FormControl isInvalid={!!addressErrors.district}>
                          <FormLabel>District</FormLabel>
                          <Input
                            name="district"
                            value={newAddress.district || ''}
                            onChange={handleAddressChange}
                          />
                          <FormErrorMessage>
                            {addressErrors.district}
                          </FormErrorMessage>
                        </FormControl>
                      </GridItem>
                      <GridItem>
                        <FormControl isInvalid={!!addressErrors.phoneNumber}>
                          <FormLabel>Phone Number</FormLabel>
                          <Input
                            name="phoneNumber"
                            value={newAddress.phoneNumber || ''}
                            onChange={handleAddressChange}
                          />
                          <FormErrorMessage>
                            {addressErrors.phoneNumber}
                          </FormErrorMessage>
                        </FormControl>
                      </GridItem>
                      <GridItem>
                        <FormControl>
                          <FormLabel>Label (Optional)</FormLabel>
                          <Input
                            name="label"
                            value={newAddress.label || ''}
                            onChange={handleAddressChange}
                            placeholder="e.g., Home, Work"
                          />
                        </FormControl>
                      </GridItem>
                      <GridItem colSpan={2}>
                        <Button
                          colorScheme="green"
                          onClick={handleAddAddress}
                          isLoading={isLoading}
                          width="100%"
                        >
                          Add Address
                        </Button>
                      </GridItem>
                    </Grid>
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </MotionBox>
    </Container>
  );
};

export default ProfilePage;
