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
  Badge,
  Progress,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
  Icon,
} from '@chakra-ui/react';
import { StarIcon, CheckIcon } from '@chakra-ui/icons';
import { apiService } from '../services/apiService';

const Achievements = () => {
  const [achievementsData, setAchievementsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    loadAchievementsData();
  }, []);

  const loadAchievementsData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAchievementsData(30);
      setAchievementsData(response.data.data);
    } catch (err) {
      console.error('Failed to load achievements data:', err);
      setError('Failed to load achievements data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" color="brand.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" rounded="lg">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  const earnedAchievements = achievementsData?.earnedAchievements || [];
  const availableAchievements = achievementsData?.availableAchievements || [];
  const progress = achievementsData?.progress || {};

  const getAchievementIcon = (achievement) => {
    // You can customize icons based on achievement type
    return StarIcon;
  };

  const getAchievementColor = (achievement) => {
    const colors = {
      'task_master': 'green',
      'lead_converter': 'blue',
      'team_player': 'purple',
      'high_performer': 'yellow',
      'early_bird': 'orange',
      'quality_focused': 'pink',
    };
    return colors[achievement.type] || 'gray';
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="lg">Achievements</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <HStack spacing={8}>
                <VStack>
                  <Text fontSize="4xl" fontWeight="bold" color="brand.500">
                    {earnedAchievements.length}
                  </Text>
                  <Text fontSize="lg" color="gray.600">
                    Achievements Earned
                  </Text>
                </VStack>
                <VStack>
                  <Text fontSize="4xl" fontWeight="bold" color="gray.500">
                    {availableAchievements.length}
                  </Text>
                  <Text fontSize="lg" color="gray.600">
                    Available
                  </Text>
                </VStack>
              </HStack>
              
              <Box w="full">
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="semibold">
                    Overall Progress
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {progress.percentage || 0}%
                  </Text>
                </HStack>
                <Progress
                  value={progress.percentage || 0}
                  colorScheme="brand"
                  size="lg"
                  rounded="full"
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Earned Achievements */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Earned Achievements</Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
              {earnedAchievements.length > 0 ? (
                earnedAchievements.map((achievement) => (
                  <GridItem key={achievement.id}>
                    <Card
                      bg="brand.50"
                      border="2px"
                      borderColor="brand.200"
                      position="relative"
                    >
                      <CardBody>
                        <VStack spacing={3}>
                          <Box
                            w={12}
                            h={12}
                            bg="brand.500"
                            rounded="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                          >
                            <Icon as={getAchievementIcon(achievement)} boxSize={6} />
                          </Box>
                          <VStack spacing={1}>
                            <Text fontWeight="bold" textAlign="center">
                              {achievement.name}
                            </Text>
                            <Text fontSize="sm" color="gray.600" textAlign="center">
                              {achievement.description}
                            </Text>
                          </VStack>
                          <Badge colorScheme="green" size="sm">
                            <CheckIcon mr={1} />
                            Earned
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  </GridItem>
                ))
              ) : (
                <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
                  <Text color="gray.500" textAlign="center" py={8}>
                    No achievements earned yet. Keep working to unlock your first achievement!
                  </Text>
                </GridItem>
              )}
            </Grid>
          </CardBody>
        </Card>

        {/* Available Achievements */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Available Achievements</Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
              {availableAchievements.length > 0 ? (
                availableAchievements.map((achievement) => (
                  <GridItem key={achievement.id}>
                    <Card border="1px" borderColor={borderColor}>
                      <CardBody>
                        <VStack spacing={3}>
                          <Box
                            w={12}
                            h={12}
                            bg="gray.200"
                            rounded="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="gray.500"
                          >
                            <Icon as={getAchievementIcon(achievement)} boxSize={6} />
                          </Box>
                          <VStack spacing={1}>
                            <Text fontWeight="bold" textAlign="center">
                              {achievement.name}
                            </Text>
                            <Text fontSize="sm" color="gray.600" textAlign="center">
                              {achievement.description}
                            </Text>
                          </VStack>
                          <Box w="full">
                            <HStack justify="space-between" mb={1}>
                              <Text fontSize="xs" color="gray.500">
                                Progress
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {achievement.progress || 0}%
                              </Text>
                            </HStack>
                            <Progress
                              value={achievement.progress || 0}
                              colorScheme={getAchievementColor(achievement)}
                              size="sm"
                              rounded="full"
                            />
                          </Box>
                          <Badge colorScheme="gray" size="sm">
                            Locked
                          </Badge>
                        </VStack>
                      </CardBody>
                    </Card>
                  </GridItem>
                ))
              ) : (
                <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
                  <Text color="gray.500" textAlign="center" py={8}>
                    All achievements have been earned! Great job!
                  </Text>
                </GridItem>
              )}
            </Grid>
          </CardBody>
        </Card>

        {/* Next Achievement */}
        {progress.nextAchievement && (
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Next Achievement</Heading>
            </CardHeader>
            <CardBody>
              <HStack spacing={6}>
                <Box
                  w={16}
                  h={16}
                  bg="brand.100"
                  rounded="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="brand.500"
                >
                  <Icon as={getAchievementIcon(progress.nextAchievement)} boxSize={8} />
                </Box>
                <VStack align="start" spacing={2} flex="1">
                  <Text fontWeight="bold" fontSize="lg">
                    {progress.nextAchievement.name}
                  </Text>
                  <Text color="gray.600">
                    {progress.nextAchievement.description}
                  </Text>
                  <Box w="full">
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm" color="gray.500">
                        Progress
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {progress.nextAchievement.progress || 0}%
                      </Text>
                    </HStack>
                    <Progress
                      value={progress.nextAchievement.progress || 0}
                      colorScheme="brand"
                      size="md"
                      rounded="full"
                    />
                  </Box>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default Achievements;
