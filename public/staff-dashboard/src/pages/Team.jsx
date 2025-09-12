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
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { apiService } from '../services/apiService';

const Team = () => {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTeamData(30);
      setTeamData(response.data.data);
    } catch (err) {
      console.error('Failed to load team data:', err);
      setError('Failed to load team data');
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

  const leaderboard = teamData?.leaderboard || [];
  const currentPosition = teamData?.currentPosition || 0;
  const teamAnalytics = teamData?.teamAnalytics || {};

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="lg">Team Overview</Heading>
          </CardHeader>
        </Card>

        {/* Team Stats */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Your Rank</StatLabel>
                  <StatNumber>#{currentPosition}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Out of {leaderboard.length} team members
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Team Size</StatLabel>
                  <StatNumber>{teamAnalytics.teamSize || 0}</StatNumber>
                  <StatHelpText>
                    Active team members
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Team Average</StatLabel>
                  <StatNumber>{teamAnalytics.averageScore || 0}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Performance score
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Team Goals</StatLabel>
                  <StatNumber>{teamAnalytics.goalsAchieved || 0}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Out of {teamAnalytics.totalGoals || 0}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Leaderboard */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Team Leaderboard</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {leaderboard.length > 0 ? (
                leaderboard.map((member, index) => (
                  <Box
                    key={member.staffId}
                    p={4}
                    border="1px"
                    borderColor={borderColor}
                    rounded="lg"
                    bg={index < 3 ? "brand.50" : "transparent"}
                  >
                    <HStack justify="space-between">
                      <HStack spacing={4}>
                        <Box
                          w={8}
                          h={8}
                          bg={index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "#CD7F32" : "gray.300"}
                          rounded="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="white"
                          fontWeight="bold"
                          fontSize="sm"
                        >
                          {index + 1}
                        </Box>
                        <Avatar
                          size="sm"
                          name={member.name}
                          src={member.avatar}
                        />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="semibold">
                            {member.name}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {member.role}
                          </Text>
                        </VStack>
                      </HStack>
                      
                      <VStack align="end" spacing={1}>
                        <Text fontSize="lg" fontWeight="bold" color="brand.500">
                          {member.score}
                        </Text>
                        <HStack spacing={2}>
                          <Badge colorScheme="green" size="sm">
                            {member.completedTasks} tasks
                          </Badge>
                          <Badge colorScheme="blue" size="sm">
                            {member.convertedLeads} leads
                          </Badge>
                        </HStack>
                      </VStack>
                    </HStack>
                  </Box>
                ))
              ) : (
                <Text color="gray.500" textAlign="center" py={8}>
                  No team members found
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Team Performance */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Team Performance</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="semibold">
                    Overall Team Performance
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {teamAnalytics.overallPerformance || 0}%
                  </Text>
                </HStack>
                <Progress
                  value={teamAnalytics.overallPerformance || 0}
                  colorScheme="brand"
                  size="lg"
                  rounded="full"
                />
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="semibold">
                    Goal Achievement
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {teamAnalytics.goalsAchieved || 0}/{teamAnalytics.totalGoals || 0}
                  </Text>
                </HStack>
                <Progress
                  value={teamAnalytics.totalGoals ? (teamAnalytics.goalsAchieved / teamAnalytics.totalGoals) * 100 : 0}
                  colorScheme="green"
                  size="lg"
                  rounded="full"
                />
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="semibold">
                    Collaboration Score
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {teamAnalytics.collaborationScore || 0}%
                  </Text>
                </HStack>
                <Progress
                  value={teamAnalytics.collaborationScore || 0}
                  colorScheme="purple"
                  size="lg"
                  rounded="full"
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default Team;
