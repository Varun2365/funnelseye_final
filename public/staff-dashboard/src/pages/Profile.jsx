import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Avatar,
  Button,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  Badge,
  Grid,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    company: user?.company || '',
    country: user?.country || '',
    city: user?.city || '',
  });
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await apiService.updateProfile(profileData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // This would open a modal or navigate to a password change form
    // For now, just show a placeholder
    setSuccess('Password change functionality would be implemented here');
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="lg">Profile Settings</Heading>
          </CardHeader>
        </Card>

        {/* Profile Overview */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Profile Overview</Heading>
          </CardHeader>
          <CardBody>
            <HStack spacing={6}>
              <Avatar
                size="2xl"
                name={user?.name}
                src={user?.profilePictureUrl}
              />
              <VStack align="start" spacing={2}>
                <Text fontSize="2xl" fontWeight="bold">
                  {user?.name || 'Staff Member'}
                </Text>
                <Text fontSize="lg" color="gray.600">
                  {user?.email}
                </Text>
                <HStack spacing={2}>
                  <Badge colorScheme="blue">
                    {user?.role || 'staff'}
                  </Badge>
                  <Badge colorScheme="green">
                    {user?.status || 'active'}
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  Member since {new Date(user?.createdAt).toLocaleDateString()}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Profile Form */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Edit Profile</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              {error && (
                <Alert status="error" rounded="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert status="success" rounded="md">
                  <AlertIcon />
                  {success}
                </Alert>
              )}

              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                <FormControl>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Company</FormLabel>
                  <Input
                    value={profileData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Enter your company"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Country</FormLabel>
                  <Input
                    value={profileData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Enter your country"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>City</FormLabel>
                  <Input
                    value={profileData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Enter your city"
                  />
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </FormControl>

              <HStack spacing={4}>
                <Button
                  colorScheme="brand"
                  onClick={handleSaveProfile}
                  isLoading={loading}
                  loadingText="Saving..."
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setProfileData({
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    bio: user?.bio || '',
                    company: user?.company || '',
                    country: user?.country || '',
                    city: user?.city || '',
                  })}
                >
                  Reset
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Security Settings */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Security Settings</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="semibold">Password</Text>
                  <Text fontSize="sm" color="gray.600">
                    Change your password
                  </Text>
                </VStack>
                <Button variant="outline" onClick={handleChangePassword}>
                  Change Password
                </Button>
              </HStack>
              
              <Divider />
              
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="semibold">Two-Factor Authentication</Text>
                  <Text fontSize="sm" color="gray.600">
                    Add an extra layer of security
                  </Text>
                </VStack>
                <Button variant="outline" isDisabled>
                  Coming Soon
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Account Information */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Account Information</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="semibold">User ID</Text>
                <Text fontSize="sm" color="gray.600" fontFamily="mono">
                  {user?._id}
                </Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="semibold">Role</Text>
                <Badge colorScheme="blue">
                  {user?.role || 'staff'}
                </Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="semibold">Status</Text>
                <Badge colorScheme="green">
                  {user?.status || 'active'}
                </Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="semibold">Last Login</Text>
                <Text fontSize="sm" color="gray.600">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                </Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="semibold">Account Created</Text>
                <Text fontSize="sm" color="gray.600">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default Profile;
