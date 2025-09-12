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
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Select,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { apiService } from '../services/apiService';

const Performance = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30');
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    loadPerformanceData();
  }, [timeRange]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPerformanceData(parseInt(timeRange));
      setPerformanceData(response.data.data);
    } catch (err) {
      console.error('Failed to load performance data:', err);
      setError('Failed to load performance data');
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

  const performance = performanceData?.performance || {};
  const metrics = performanceData?.metrics || {};
  const trends = performanceData?.trends || {};
  const recommendations = performanceData?.recommendations || [];

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { level: 'Elite', color: 'green' };
    if (score >= 80) return { level: 'High Achiever', color: 'blue' };
    if (score >= 70) return { level: 'Consistent', color: 'yellow' };
    if (score >= 60) return { level: 'Rising Star', color: 'orange' };
    return { level: 'Needs Support', color: 'red' };
  };

  const performanceLevel = getPerformanceLevel(performance.currentScore || 0);

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="lg">Performance Overview</Heading>
              <Select
                maxW="200px"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </Select>
            </HStack>
          </CardHeader>
        </Card>

        {/* Performance Score */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={6}>
              <HStack spacing={8}>
                <VStack>
                  <Text fontSize="6xl" fontWeight="bold" color="brand.500">
                    {performance.currentScore || 0}
                  </Text>
                  <Text fontSize="lg" color="gray.600">
                    Performance Score
                  </Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Badge colorScheme={performanceLevel.color} size="lg">
                    {performanceLevel.level}
                  </Badge>
                  <Text fontSize="sm" color="gray.600">
                    Current Level
                  </Text>
                </VStack>
              </HStack>
              
              <Box w="full">
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

        {/* Score Breakdown */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Task Completion</StatLabel>
                  <StatNumber>{metrics.taskCompletion || 0}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {trends.taskCompletion || 0}% vs last period
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Lead Conversion</StatLabel>
                  <StatNumber>{metrics.leadConversion || 0}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {trends.leadConversion || 0}% vs last period
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Response Time</StatLabel>
                  <StatNumber>{metrics.responseTime || 0}h</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    {trends.responseTime || 0}% improvement
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Quality Score</StatLabel>
                  <StatNumber>{metrics.qualityScore || 0}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {trends.qualityScore || 0}% vs last period
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Progress Tracking */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Progress Tracking</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="semibold">
                    Task Completion Rate
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {metrics.taskCompletion || 0}%
                  </Text>
                </HStack>
                <Progress
                  value={metrics.taskCompletion || 0}
                  colorScheme="green"
                  size="lg"
                  rounded="full"
                />
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="semibold">
                    Lead Conversion Rate
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {metrics.leadConversion || 0}%
                  </Text>
                </HStack>
                <Progress
                  value={metrics.leadConversion || 0}
                  colorScheme="blue"
                  size="lg"
                  rounded="full"
                />
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="semibold">
                    Quality Score
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {metrics.qualityScore || 0}/100
                  </Text>
                </HStack>
                <Progress
                  value={metrics.qualityScore || 0}
                  colorScheme="purple"
                  size="lg"
                  rounded="full"
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Recommendations</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {recommendations.map((rec, index) => (
                  <Box
                    key={index}
                    p={4}
                    border="1px"
                    borderColor={borderColor}
                    rounded="lg"
                    bg="brand.50"
                  >
                    <Text fontWeight="semibold" mb={2}>
                      {rec.title}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {rec.description}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default Performance;
