import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { 
  MessageSquare, 
  Smartphone, 
  Users, 
  BarChart3, 
  Send, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  Search,
  Download,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import axios from 'axios';

const WhatsAppMessaging = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Overview data
  const [overview, setOverview] = useState(null);
  
  // Devices data
  const [devices, setDevices] = useState([]);
  const [devicesPage, setDevicesPage] = useState(1);
  const [devicesTotal, setDevicesTotal] = useState(0);
  
  // Messages data
  const [messages, setMessages] = useState([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesTotal, setMessagesTotal] = useState(0);
  
  // Conversations data
  const [conversations, setConversations] = useState([]);
  const [conversationsPage, setConversationsPage] = useState(1);
  const [conversationsTotal, setConversationsTotal] = useState(0);
  
  // Templates data
  const [templates, setTemplates] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    deviceStatus: 'all',
    messageStatus: 'all',
    coachId: '',
    dateFrom: '',
    dateTo: ''
  });

  // Custom hook for API calls with timeout
  const useWhatsAppAPI = () => {
    const [apiLoading, setApiLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    const apiCall = async (endpoint, options = {}) => {
      setApiLoading(true);
      setApiError(null);
      try {
        const response = await axios({
          url: endpoint,
          method: options.method || 'GET',
          data: options.data,
          timeout: 10000, // 10 second timeout
          ...options
        });
        if (!response.data.success) {
          throw new Error(response.data.message || 'API call failed');
        }
        return response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
        setApiError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setApiLoading(false);
      }
    };

    return { apiCall, loading: apiLoading, error: apiError };
  };

  const { apiCall } = useWhatsAppAPI();

  // Fetch overview data
  const fetchOverview = async () => {
    try {
      console.log('🔄 [WHATSAPP] Fetching overview...');
      const result = await apiCall('/admin/v1/whatsapp/overview');
      setOverview(result.data);
      console.log('✅ [WHATSAPP] Overview fetched successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error fetching overview:', err.message);
      setError(`Failed to load overview: ${err.message}`);
    }
  };

  // Fetch devices
  const fetchDevices = async (page = 1) => {
    try {
      console.log('🔄 [WHATSAPP] Fetching devices...');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (filters.deviceStatus && filters.deviceStatus !== 'all') params.append('status', filters.deviceStatus);
      if (filters.coachId) params.append('coachId', filters.coachId);
      
      const result = await apiCall(`/admin/v1/whatsapp/devices?${params}`);
      setDevices(result.data.devices);
      setDevicesTotal(result.data.pagination.total);
      setDevicesPage(page);
      console.log('✅ [WHATSAPP] Devices fetched successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error fetching devices:', err.message);
      setError(`Failed to load devices: ${err.message}`);
    }
  };

  // Fetch messages
  const fetchMessages = async (page = 1) => {
    try {
      console.log('🔄 [WHATSAPP] Fetching messages...');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      });
      
      if (filters.messageStatus && filters.messageStatus !== 'all') params.append('status', filters.messageStatus);
      if (filters.coachId) params.append('coachId', filters.coachId);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      
      const result = await apiCall(`/admin/v1/whatsapp/messages?${params}`);
      setMessages(result.data.messages);
      setMessagesTotal(result.data.pagination.total);
      setMessagesPage(page);
      console.log('✅ [WHATSAPP] Messages fetched successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error fetching messages:', err.message);
      setError(`Failed to load messages: ${err.message}`);
    }
  };

  // Fetch conversations
  const fetchConversations = async (page = 1) => {
    try {
      console.log('🔄 [WHATSAPP] Fetching conversations...');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (filters.coachId) params.append('coachId', filters.coachId);
      
      const result = await apiCall(`/admin/v1/whatsapp/conversations?${params}`);
      setConversations(result.data.conversations);
      setConversationsTotal(result.data.pagination.total);
      setConversationsPage(page);
      console.log('✅ [WHATSAPP] Conversations fetched successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error fetching conversations:', err.message);
      setError(`Failed to load conversations: ${err.message}`);
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      console.log('🔄 [WHATSAPP] Fetching templates...');
      const result = await apiCall('/admin/v1/whatsapp/templates');
      setTemplates(result.data.templates);
      console.log('✅ [WHATSAPP] Templates fetched successfully');
    } catch (err) {
      console.error('❌ [WHATSAPP] Error fetching templates:', err.message);
      setError(`Failed to load templates: ${err.message}`);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      
      try {
        switch (activeTab) {
          case 'overview':
            await fetchOverview();
            break;
          case 'devices':
            await fetchDevices();
            break;
          case 'messages':
            await fetchMessages();
            break;
          case 'conversations':
            await fetchConversations();
            break;
          case 'templates':
            await fetchTemplates();
            break;
        }
      } catch (err) {
        console.error('❌ [WHATSAPP] Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab]);

  // Refresh data
  const refreshData = () => {
    switch (activeTab) {
      case 'overview':
        fetchOverview();
        break;
      case 'devices':
        fetchDevices(devicesPage);
        break;
      case 'messages':
        fetchMessages(messagesPage);
        break;
      case 'conversations':
        fetchConversations(conversationsPage);
        break;
      case 'templates':
        fetchTemplates();
        break;
    }
  };

  // Handle device status update
  const updateDeviceStatus = async (deviceId, isActive) => {
    try {
      setLoading(true);
      await apiCall(`/admin/v1/whatsapp/devices/${deviceId}/status`, {
        method: 'PUT',
        data: { isActive, reason: isActive ? 'Admin activated' : 'Admin deactivated' }
      });
      setSuccess(`Device ${isActive ? 'activated' : 'deactivated'} successfully`);
      fetchDevices(devicesPage);
    } catch (err) {
      setError(`Failed to update device status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'sent':
      case 'delivered':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Overview Tab Content
  const OverviewContent = () => (
    <div className="space-y-6">
      {overview ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.devices.total}</div>
                <p className="text-xs text-muted-foreground">
                  {overview.devices.active} active, {overview.devices.inactive} inactive
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.messages.total}</div>
                <p className="text-xs text-muted-foreground">
                  {overview.messages.today} sent today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversations</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.conversations.total}</div>
                <p className="text-xs text-muted-foreground">
                  Active conversations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coaches</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.coaches.total}</div>
                <p className="text-xs text-muted-foreground">
                  Using WhatsApp
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Latest WhatsApp messages sent by coaches</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.messages.recent.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="max-w-xs truncate">
                        {message.content}
                      </TableCell>
                      <TableCell>{message.recipient}</TableCell>
                      <TableCell>{message.coach}</TableCell>
                      <TableCell>{message.device}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(message.status)}>
                          {message.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(message.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading overview...</p>
          </div>
        </div>
      )}
    </div>
  );

  // Devices Tab Content
  const DevicesContent = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="deviceStatus">Device Status</Label>
              <Select 
                value={filters.deviceStatus} 
                onValueChange={(value) => setFilters({...filters, deviceStatus: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="coachId">Coach</Label>
              <Input
                id="coachId"
                placeholder="Coach ID"
                value={filters.coachId}
                onChange={(e) => setFilters({...filters, coachId: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => fetchDevices()} className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Devices Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>WhatsApp Devices</CardTitle>
            <CardDescription>Manage all WhatsApp devices across coaches</CardDescription>
          </div>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>{device.deviceName}</TableCell>
                  <TableCell>{device.phoneNumber}</TableCell>
                  <TableCell>
                    {device.coach ? (
                      <div>
                        <div className="font-medium">{device.coach.name}</div>
                        <div className="text-sm text-muted-foreground">{device.coach.email}</div>
                      </div>
                    ) : (
                      'Unknown'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(device.isActive ? 'active' : 'inactive')}>
                      {device.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{device.messageCount}</TableCell>
                  <TableCell>
                    {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={device.isActive ? "destructive" : "default"}
                        onClick={() => updateDeviceStatus(device.id, !device.isActive)}
                        disabled={loading}
                      >
                        {device.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {devicesTotal > 20 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((devicesPage - 1) * 20) + 1} to {Math.min(devicesPage * 20, devicesTotal)} of {devicesTotal} devices
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDevices(devicesPage - 1)}
                  disabled={devicesPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDevices(devicesPage + 1)}
                  disabled={devicesPage * 20 >= devicesTotal}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Messages Tab Content
  const MessagesContent = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Message Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="messageStatus">Status</Label>
              <Select 
                value={filters.messageStatus} 
                onValueChange={(value) => setFilters({...filters, messageStatus: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="coachId">Coach ID</Label>
              <Input
                id="coachId"
                placeholder="Coach ID"
                value={filters.coachId}
                onChange={(e) => setFilters({...filters, coachId: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={() => fetchMessages()} className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Message History</CardTitle>
            <CardDescription>All WhatsApp messages sent by coaches</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Read</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell className="max-w-xs">
                    <div className="truncate">{message.content}</div>
                  </TableCell>
                  <TableCell>{message.recipient}</TableCell>
                  <TableCell>
                    {message.coach ? (
                      <div>
                        <div className="font-medium">{message.coach.name}</div>
                        <div className="text-sm text-muted-foreground">{message.coach.email}</div>
                      </div>
                    ) : (
                      'Unknown'
                    )}
                  </TableCell>
                  <TableCell>
                    {message.device ? (
                      <div>
                        <div className="font-medium">{message.device.name}</div>
                        <div className="text-sm text-muted-foreground">{message.device.phoneNumber}</div>
                      </div>
                    ) : (
                      'Unknown'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(message.status)}>
                      {message.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(message.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {message.deliveredAt ? new Date(message.deliveredAt).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    {message.readAt ? new Date(message.readAt).toLocaleString() : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {messagesTotal > 50 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((messagesPage - 1) * 50) + 1} to {Math.min(messagesPage * 50, messagesTotal)} of {messagesTotal} messages
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchMessages(messagesPage - 1)}
                  disabled={messagesPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchMessages(messagesPage + 1)}
                  disabled={messagesPage * 50 >= messagesTotal}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Conversations Tab Content
  const ConversationsContent = () => (
    <div className="space-y-6">
      {/* Conversations Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>WhatsApp conversations across all coaches</CardDescription>
          </div>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Last Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversations.map((conversation) => (
                <TableRow key={conversation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{conversation.contactName || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{conversation.contactNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {conversation.coach ? (
                      <div>
                        <div className="font-medium">{conversation.coach.name}</div>
                        <div className="text-sm text-muted-foreground">{conversation.coach.email}</div>
                      </div>
                    ) : (
                      'Unknown'
                    )}
                  </TableCell>
                  <TableCell>
                    {conversation.device ? (
                      <div>
                        <div className="font-medium">{conversation.device.name}</div>
                        <div className="text-sm text-muted-foreground">{conversation.device.phoneNumber}</div>
                      </div>
                    ) : (
                      'Unknown'
                    )}
                  </TableCell>
                  <TableCell>{conversation.messageCount}</TableCell>
                  <TableCell>
                    {conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(conversation.status)}>
                      {conversation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {conversationsTotal > 20 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((conversationsPage - 1) * 20) + 1} to {Math.min(conversationsPage * 20, conversationsTotal)} of {conversationsTotal} conversations
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchConversations(conversationsPage - 1)}
                  disabled={conversationsPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchConversations(conversationsPage + 1)}
                  disabled={conversationsPage * 20 >= conversationsTotal}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Templates Tab Content
  const TemplatesContent = () => (
    <div className="space-y-6">
      {/* Templates Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>WhatsApp Templates</CardTitle>
            <CardDescription>Manage WhatsApp message templates</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.category}</TableCell>
                  <TableCell>{template.language}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(template.status)}>
                      {template.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {template.coach ? (
                      <div>
                        <div className="font-medium">{template.coach.name}</div>
                        <div className="text-sm text-muted-foreground">{template.coach.email}</div>
                      </div>
                    ) : (
                      'System'
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(template.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Messaging</h1>
          <p className="text-muted-foreground">
            Central WhatsApp management and message history
          </p>
        </div>
        <Button onClick={refreshData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewContent />
        </TabsContent>

        <TabsContent value="devices">
          <DevicesContent />
        </TabsContent>

        <TabsContent value="messages">
          <MessagesContent />
        </TabsContent>

        <TabsContent value="conversations">
          <ConversationsContent />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppMessaging;
