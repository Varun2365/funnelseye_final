import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Progress,
  Badge,
  Button,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { apiService } from '../services/apiService';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardData(30);
      setDashboardData(response.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
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

  const stats = dashboardData?.stats || {};
  const recentTasks = dashboardData?.recentTasks || [];
  const performance = dashboardData?.performance || {};

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Welcome Section */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="start">
              <Heading size="lg">Welcome to your Dashboard</Heading>
              <Text color="gray.600">
                Here's an overview of your current performance and tasks.
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Stats Grid */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Tasks</StatLabel>
                  <StatNumber>{stats.totalTasks || 0}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    This month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Completed Tasks</StatLabel>
                  <StatNumber>{stats.completedTasks || 0}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {stats.taskCompletionRate || 0}% completion rate
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Performance Score</StatLabel>
                  <StatNumber>{performance.currentScore || 0}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Rank #{performance.rank || 'N/A'}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Leads Converted</StatLabel>
                  <StatNumber>{stats.convertedLeads || 0}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {stats.conversionRate || 0}% conversion rate
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Main Content Grid */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* Recent Tasks */}
          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">Recent Tasks</Heading>
                  <Button size="sm" variant="outline">
                    View All
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {recentTasks.length > 0 ? (
                    recentTasks.map((task, index) => (
                      <Box
                        key={index}
                        p={4}
                        border="1px"
                        borderColor={borderColor}
                        rounded="lg"
                      >
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="semibold">{task.title}</Text>
                          <Badge
                            colorScheme={
                              task.status === 'Completed' ? 'green' :
                              task.status === 'In Progress' ? 'blue' :
                              task.status === 'Pending' ? 'yellow' : 'gray'
                            }
                          >
                            {task.status}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600" mb={2}>
                          {task.description}
                        </Text>
                        <HStack justify="space-between">
                          <Text fontSize="xs" color="gray.500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Priority: {task.priority}
                          </Text>
                        </HStack>
                      </Box>
                    ))
                  ) : (
                    <Text color="gray.500" textAlign="center" py={8}>
                      No recent tasks found
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Performance Overview */}
          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Performance Overview</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="semibold">
                        Task Completion
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {stats.taskCompletionRate || 0}%
                      </Text>
                    </HStack>
                    <Progress
                      value={stats.taskCompletionRate || 0}
                      colorScheme="green"
                      size="lg"
                      rounded="full"
                    />
                  </Box>

                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="semibold">
                        Lead Conversion
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {stats.conversionRate || 0}%
                      </Text>
                    </HStack>
                    <Progress
                      value={stats.conversionRate || 0}
                      colorScheme="blue"
                      size="lg"
                      rounded="full"
                    />
                  </Box>

                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="semibold">
                        Overall Performance
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {performance.currentScore || 0}/100
                      </Text>
                    </HStack>
                    <Progress
                      value={performance.currentScore || 0}
                      colorScheme="brand"
                      size="lg"
                      rounded="full"
                    />
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

export default Dashboard;
