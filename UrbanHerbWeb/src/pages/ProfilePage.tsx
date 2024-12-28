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
  Badge,
  Select,
  Checkbox,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { FaCamera, FaEdit, FaTrash } from 'react-icons/fa';
import { Address } from '../types/auth';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const ProfilePage = () => {
  const { state: { user }, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    date_of_birth: user?.date_of_birth || '',
    gender: user?.gender || 'prefer_not_to_say',
  });
  
  const [preferences, setPreferences] = useState({
    language: user?.preferences?.language || 'en',
    currency: user?.preferences?.currency || 'USD',
    theme: user?.preferences?.theme || 'system',
    email_notifications: user?.preferences?.email_notifications ?? true,
    push_notifications: user?.preferences?.push_notifications ?? true,
    order_updates: user?.preferences?.order_updates ?? true,
    promotional_emails: user?.preferences?.promotional_emails ?? true,
    newsletter: user?.preferences?.newsletter ?? true,
  });
  
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

  const handlePreferenceChange = (name: string, value: string | boolean) => {
    setPreferences(prev => ({
      ...prev,
      [name]: value,
    }));
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
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      await updateUser({ preferences });
      toast({
        title: 'Success',
        description: 'Preferences updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update preferences',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box p={6} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Tabs>
              <TabList>
                <Tab>Profile</Tab>
                <Tab>Preferences</Tab>
                <Tab>Addresses</Tab>
                <Tab>Security</Tab>
              </TabList>

              <TabPanels>
                {/* Profile Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <HStack justifyContent="space-between">
                      <Heading size="md">Profile Information</Heading>
                      <Button
                        leftIcon={<FaEdit />}
                        onClick={() => setEditMode(!editMode)}
                        size="sm"
                      >
                        {editMode ? 'Cancel' : 'Edit'}
                      </Button>
                    </HStack>

                    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                      <FormControl>
                        <FormLabel>First Name</FormLabel>
                        <Input
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          isReadOnly={!editMode}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Last Name</FormLabel>
                        <Input
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          isReadOnly={!editMode}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                          name="email"
                          value={formData.email}
                          isReadOnly
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Date of Birth</FormLabel>
                        <Input
                          name="date_of_birth"
                          type="date"
                          value={formData.date_of_birth}
                          onChange={handleInputChange}
                          isReadOnly={!editMode}
                        />
                      </FormControl>
                    </Grid>

                    <FormControl>
                      <FormLabel>Bio</FormLabel>
                      <Input
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        isReadOnly={!editMode}
                      />
                    </FormControl>

                    {editMode && (
                      <Button
                        colorScheme="green"
                        onClick={handleUpdateProfile}
                        isLoading={false}
                      >
                        Save Changes
                      </Button>
                    )}
                  </VStack>
                </TabPanel>

                {/* Preferences Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Heading size="md">User Preferences</Heading>

                    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                      <FormControl>
                        <FormLabel>Language</FormLabel>
                        <Select
                          value={preferences.language}
                          onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          value={preferences.currency}
                          onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                        >
                          <option value="USD">US Dollar</option>
                          <option value="EUR">Euro</option>
                          <option value="GBP">British Pound</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Theme</FormLabel>
                        <Select
                          value={preferences.theme}
                          onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System</option>
                        </Select>
                      </FormControl>
                    </Grid>

                    <VStack spacing={4} align="stretch">
                      <Heading size="sm">Notifications</Heading>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Email Notifications</FormLabel>
                        <Checkbox
                          isChecked={preferences.email_notifications}
                          onChange={(e) => handlePreferenceChange('email_notifications', e.target.checked)}
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Push Notifications</FormLabel>
                        <Checkbox
                          isChecked={preferences.push_notifications}
                          onChange={(e) => handlePreferenceChange('push_notifications', e.target.checked)}
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Order Updates</FormLabel>
                        <Checkbox
                          isChecked={preferences.order_updates}
                          onChange={(e) => handlePreferenceChange('order_updates', e.target.checked)}
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Promotional Emails</FormLabel>
                        <Checkbox
                          isChecked={preferences.promotional_emails}
                          onChange={(e) => handlePreferenceChange('promotional_emails', e.target.checked)}
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Newsletter</FormLabel>
                        <Checkbox
                          isChecked={preferences.newsletter}
                          onChange={(e) => handlePreferenceChange('newsletter', e.target.checked)}
                        />
                      </FormControl>
                    </VStack>

                    <Button
                      colorScheme="green"
                      onClick={handleUpdatePreferences}
                      isLoading={false}
                    >
                      Save Preferences
                    </Button>
                  </VStack>
                </TabPanel>

                {/* Addresses Tab */}
                <TabPanel>
                  <Text>Address management will be implemented in the next phase</Text>
                </TabPanel>

                {/* Security Tab */}
                <TabPanel>
                  <Text>Security settings will be implemented in the next phase</Text>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </MotionBox>
      </VStack>
    </Container>
  );
};

export default ProfilePage;
