import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  VStack,
  HStack,
  Text,
  IconButton,
  useColorModeValue,
  Box,
  Divider,
} from '@chakra-ui/react';
import {
  ViewIcon,
  CalendarIcon,
  StarIcon,
  SettingsIcon,
  BellIcon,
  InfoIcon,
} from '@chakra-ui/icons';

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const activeBgColor = useColorModeValue('brand.50', 'brand.900');
  const activeColor = useColorModeValue('brand.600', 'brand.200');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');

  const menuItems = [
    {
      name: 'Dashboard',
      icon: ViewIcon,
      path: '/dashboard',
    },
    {
      name: 'Tasks',
      icon: CalendarIcon,
      path: '/tasks',
    },
    {
      name: 'Performance',
      icon: StarIcon,
      path: '/performance',
    },
    {
      name: 'Team',
      icon: InfoIcon,
      path: '/team',
    },
    {
      name: 'Achievements',
      icon: BellIcon,
      path: '/achievements',
    },
    {
      name: 'Profile',
      icon: SettingsIcon,
      path: '/profile',
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <VStack
      align="stretch"
      spacing={0}
      h="full"
      bg={bgColor}
      p={4}
    >
      {/* Logo */}
      <Box mb={6}>
        <HStack spacing={3}>
          <Box
            w={10}
            h={10}
            bg="brand.500"
            rounded="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontSize="lg"
            fontWeight="bold"
          >
            S
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontSize="lg" fontWeight="bold">
              Staff Portal
            </Text>
            <Text fontSize="xs" color="gray.500">
              Dashboard
            </Text>
          </VStack>
        </HStack>
      </Box>

      <Divider mb={4} />

      {/* Menu Items */}
      <VStack align="stretch" spacing={1}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Box
              key={item.path}
              as="button"
              onClick={() => handleNavigation(item.path)}
              w="full"
              p={3}
              rounded="lg"
              bg={isActive ? activeBgColor : 'transparent'}
              color={isActive ? activeColor : 'gray.600'}
              _hover={{
                bg: isActive ? activeBgColor : hoverBgColor,
              }}
              transition="all 0.2s"
              textAlign="left"
            >
              <HStack spacing={3}>
                <Icon size="20px" />
                <Text fontWeight={isActive ? 'semibold' : 'normal'}>
                  {item.name}
                </Text>
              </HStack>
            </Box>
          );
        })}
      </VStack>
    </VStack>
  );
};

export default Sidebar;
