import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import { apiService } from '../services/apiService';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState(null);
  const [timeSpent, setTimeSpent] = useState('');
  const [description, setDescription] = useState('');
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTasks();
      console.log('Tasks API response:', response.data);
      setTasks(response.data.data?.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await apiService.updateTaskStatus(taskId, newStatus);
      loadTasks(); // Reload tasks
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleTimeLog = async () => {
    if (!selectedTask || !timeSpent || !description) return;
    
    try {
      await apiService.addTimeLog(selectedTask._id, timeSpent, description);
      onClose();
      setTimeSpent('');
      setDescription('');
      loadTasks(); // Reload tasks
    } catch (err) {
      console.error('Failed to add time log:', err);
    }
  };

  const openTimeLogModal = (task) => {
    setSelectedTask(task);
    onOpen();
  };

  const filteredTasks = (tasks || []).filter(task => {
    const matchesFilter = filter === 'all' || task.status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'green';
      case 'in progress':
        return 'blue';
      case 'pending':
        return 'yellow';
      case 'overdue':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'gray';
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

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="lg">Tasks</Heading>
              <Button leftIcon={<AddIcon />} colorScheme="brand">
                New Task
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            <HStack spacing={4}>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                maxW="200px"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </Select>
            </HStack>
          </CardBody>
        </Card>

        {/* Tasks List */}
        <VStack spacing={4} align="stretch">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card key={task._id} bg={cardBg} border="1px" borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="lg" fontWeight="semibold">
                          {task.title}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {task.description}
                        </Text>
                      </VStack>
                      <HStack spacing={2}>
                        <Badge colorScheme={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <Badge colorScheme={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </HStack>
                    </HStack>

                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Assigned: {new Date(task.createdAt).toLocaleDateString()}
                        </Text>
                      </VStack>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openTimeLogModal(task)}
                        >
                          Log Time
                        </Button>
                        {task.status !== 'completed' && (
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleStatusUpdate(task._id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                        )}
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleStatusUpdate(task._id, 'in progress')}
                          >
                            Start Task
                          </Button>
                        )}
                      </HStack>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))
          ) : (
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Text color="gray.500" textAlign="center" py={8}>
                  No tasks found matching your criteria
                </Text>
              </CardBody>
            </Card>
          )}
        </VStack>
      </VStack>

      {/* Time Log Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log Time for Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text fontWeight="semibold">{selectedTask?.title}</Text>
              
              <FormControl>
                <FormLabel>Time Spent (hours)</FormLabel>
                <Input
                  type="number"
                  placeholder="e.g., 2.5"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="What did you work on?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FormControl>

              <HStack spacing={4} w="full">
                <Button variant="outline" onClick={onClose} flex="1">
                  Cancel
                </Button>
                <Button colorScheme="brand" onClick={handleTimeLog} flex="1">
                  Log Time
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Tasks;
