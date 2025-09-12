import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  BellIcon,
  SettingsIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleLogout = () => {
    logout();
  };

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/tasks':
        return 'Tasks';
      case '/performance':
        return 'Performance';
      case '/team':
        return 'Team';
      case '/achievements':
        return 'Achievements';
      case '/profile':
        return 'Profile';
      default:
        return 'Dashboard';
    }
  };

  return (
    <Flex h="100vh" bg="gray.50">
      {/* Desktop Sidebar */}
      <Box
        display={{ base: 'none', md: 'block' }}
        w="250px"
        bg={bgColor}
        borderRight="1px"
        borderColor={borderColor}
      >
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Flex direction="column" flex="1" overflow="hidden">
        {/* Header */}
        <Box
          bg={bgColor}
          px={6}
          py={4}
          borderBottom="1px"
          borderColor={borderColor}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <HStack spacing={4}>
            {/* Mobile menu button */}
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              onClick={onOpen}
              variant="outline"
              aria-label="Open menu"
              icon={<HamburgerIcon />}
            />
            
            <VStack align="start" spacing={0}>
              <Text fontSize="xl" fontWeight="bold">
                {getPageTitle()}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Welcome back, {user?.name || 'Staff Member'}
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={4}>
            {/* Notifications */}
            <IconButton
              icon={<BellIcon />}
              variant="ghost"
              aria-label="Notifications"
              position="relative"
            >
              <Badge
                position="absolute"
                top="2px"
                right="2px"
                colorScheme="red"
                borderRadius="full"
                w="6px"
                h="6px"
              />
            </IconButton>

            {/* User Menu */}
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                rightIcon={<ChevronDownIcon />}
                leftIcon={<Avatar size="sm" name={user?.name} />}
              >
                <Text display={{ base: 'none', md: 'block' }}>
                  {user?.name || 'Staff Member'}
                </Text>
              </MenuButton>
              <MenuList>
                <MenuItem icon={<SettingsIcon />} onClick={() => navigate('/profile')}>
                  Profile Settings
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Box>

        {/* Page Content */}
        <Box flex="1" overflow="auto" p={6}>
          <Outlet />
        </Box>
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} onClose={onClose} placement="left">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody p={0}>
            <Sidebar onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

export default DashboardLayout;
