import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import adminApiService from '../services/adminApiService';
import { useToast } from '../contexts/ToastContext';

const UserManagement = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    status: 'active',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  });

  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    status: 'active',
    coachId: '',
    notes: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    dateOfBirth: '',
    gender: '',
    occupation: '',
    company: '',
    website: '',
    bio: '',
    subscriptionPlan: '',
    paymentMethod: 'stripe',
    startDate: new Date().toISOString().split('T')[0],
    autoRenew: true
  });

  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    includeDeleted: false
  });

  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  // Load users data
  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        includeDeleted: showDeleted,
        sortBy,
        sortOrder
      };
      
      // Only add search if it's not empty
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      // Only add status if it's not 'all'
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      // Only add role if it's not 'all'
      if (roleFilter && roleFilter !== 'all') {
        params.role = roleFilter;
      }
      
      // Add date range filters
      if (startDate) {
        params.startDate = startDate;
      }
      
      if (endDate) {
        params.endDate = endDate;
      }
      
      const response = await adminApiService.getUsers(params);
      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
      } else {
        showToast('Failed to load users', 'error');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      const response = await adminApiService.getUserAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  // Load subscription plans
  const loadSubscriptionPlans = async () => {
    try {
      const response = await adminApiService.getSubscriptionPlans();
      if (response.success) {
        setSubscriptionPlans(response.data.plans || []);
      }
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      setSubscriptionPlans([]); // Set empty array on error
    }
  };

  useEffect(() => {
    loadUsers();
    loadAnalytics();
    loadSubscriptionPlans();
  }, [currentPage, searchTerm, statusFilter, roleFilter, startDate, endDate, sortBy, sortOrder]);

  // Handle user selection
  const handleUserSelect = (userId, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(users.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Open user dialog
  const openUserDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setEditMode(true);
      setUserForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'client',
        status: user.status || 'active',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        zipCode: user.zipCode || ''
      });
    } else {
      setSelectedUser(null);
      setEditMode(false);
      setUserForm({
        name: '',
        email: '',
        phone: '',
        role: 'client',
        status: 'active',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      });
    }
    setUserDialogOpen(true);
  };

  // Save user
  const saveUser = async () => {
    try {
      let response;
      if (editMode) {
        response = await adminApiService.updateUser(selectedUser._id, userForm);
      } else {
        // For new users, we'll use a different endpoint if available
        response = await adminApiService.createUser(userForm);
      }
      
      if (response.success) {
        showToast(editMode ? 'User updated successfully' : 'User created successfully', 'success');
        setUserDialogOpen(false);
        loadUsers();
      } else {
        showToast(response.message || 'Failed to save user', 'error');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showToast('Error saving user', 'error');
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await adminApiService.deleteUser(userId);
      if (response.success) {
        showToast('User deleted successfully', 'success');
        loadUsers();
      } else {
        showToast(response.message || 'Failed to delete user', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('Error deleting user', 'error');
    }
  };

  // Restore user
  const restoreUser = async (userId) => {
    if (!confirm('Are you sure you want to restore this user?')) return;
    
    try {
      const response = await adminApiService.restoreUser(userId);
      if (response.success) {
        showToast('User restored successfully', 'success');
        loadUsers();
      } else {
        showToast(response.message || 'Failed to restore user', 'error');
      }
    } catch (error) {
      console.error('Error restoring user:', error);
      showToast('Error restoring user', 'error');
    }
  };

  // Update user status
  const updateUserStatus = async (userId, status) => {
    try {
      const response = await adminApiService.updateUserStatus(userId, status);
      if (response.success) {
        showToast('User status updated successfully', 'success');
        loadUsers();
      } else {
        showToast(response.message || 'Failed to update user status', 'error');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      showToast('Error updating user status', 'error');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) {
      showToast('Please select users first', 'warning');
      return;
    }

    try {
      switch (bulkAction) {
        case 'activate':
          await handleBulkUpdate({ status: 'active' });
          break;
        case 'deactivate':
          await handleBulkUpdate({ status: 'inactive' });
          break;
        case 'delete':
          await handleBulkDelete(false);
          break;
        case 'permanent_delete':
          await handleBulkDelete(true);
          break;
        default:
          showToast('Invalid bulk action', 'error');
          return;
      }
      setBulkActionDialogOpen(false);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showToast('Error performing bulk action', 'error');
    }
  };

  // Export users
  const exportUsers = async (format = 'csv') => {
    try {
      const response = await adminApiService.exportUsers(format, exportOptions.includeDeleted);
      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast('Users exported successfully', 'success');
      } else {
        showToast(response.message || 'Failed to export users', 'error');
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      showToast('Error exporting users', 'error');
    }
  };

  // Create new user
  const handleCreateUser = async () => {
    try {
      if (!createUserForm.name || !createUserForm.email || !createUserForm.password) {
        showToast('Name, email, and password are required', 'error');
        return;
      }

      const response = await adminApiService.createUser(createUserForm);
      if (response.success) {
        showToast('User created successfully', 'success');
        setCreateUserDialogOpen(false);
        setCreateUserForm({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'user',
          status: 'active',
          coachId: '',
          notes: '',
          address: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          dateOfBirth: '',
          gender: '',
          occupation: '',
          company: '',
          website: '',
          bio: '',
          subscriptionPlan: '',
          paymentMethod: 'stripe',
          startDate: new Date().toISOString().split('T')[0],
          autoRenew: true
        });
        loadUsers();
      } else {
        showToast(response.message || 'Failed to create user', 'error');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showToast('Error creating user', 'error');
    }
  };

  // Handle bulk operations with new API
  const handleBulkUpdate = async (updateData) => {
    try {
      const updates = selectedUsers.map(userId => ({
        userId,
        ...updateData
      }));

      const response = await adminApiService.bulkUpdateUsers(updates);
      if (response.success) {
        showToast(`Bulk update completed. ${response.data.updated.length} users updated successfully.`, 'success');
        if (response.data.errors.length > 0) {
          showToast(`${response.data.errors.length} users failed to update`, 'warning');
        }
        setSelectedUsers([]);
        loadUsers();
      } else {
        showToast(response.message || 'Failed to perform bulk update', 'error');
      }
    } catch (error) {
      console.error('Error performing bulk update:', error);
      showToast('Error performing bulk update', 'error');
    }
  };

  // Handle bulk delete with new API
  const handleBulkDelete = async (permanent = false) => {
    try {
      if (!confirm(`Are you sure you want to ${permanent ? 'permanently delete' : 'delete'} ${selectedUsers.length} users?`)) {
        return;
      }

      const response = await adminApiService.bulkDeleteUsers(selectedUsers, permanent);
      if (response.success) {
        showToast(`Bulk delete completed. ${response.data.deleted.length} users ${permanent ? 'permanently deleted' : 'deleted'} successfully.`, 'success');
        if (response.data.errors.length > 0) {
          showToast(`${response.data.errors.length} users failed to delete`, 'warning');
        }
        setSelectedUsers([]);
        loadUsers();
      } else {
        showToast(response.message || 'Failed to perform bulk delete', 'error');
      }
    } catch (error) {
      console.error('Error performing bulk delete:', error);
      showToast('Error performing bulk delete', 'error');
    }
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><UserX className="w-3 h-3 mr-1" />Inactive</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'suspended':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get role badge variant
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Admin</Badge>;
      case 'coach':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Coach</Badge>;
      case 'customer':
        return <Badge variant="outline">Customer</Badge>;
      case 'staff':
        return <Badge variant="default" className="bg-orange-100 text-orange-800">Staff</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setShowDeleted(!showDeleted)} 
            variant={showDeleted ? "default" : "outline"} 
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
          </Button>
          <Button onClick={() => setExportDialogOpen(true)} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setCreateUserDialogOpen(true)} size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +{analytics.newUsersThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.activePercentage}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coaches</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.coaches}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.coachPercentage}% of users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.growthRate}%</div>
              <p className="text-xs text-muted-foreground">
                Monthly growth
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-48">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-48">
                  <Label htmlFor="role-filter">Role</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Advanced Filters Toggle */}
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Advanced Filters</span>
                  {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
              
              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sort-by">Sort By</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="createdAt">Created Date</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="role">Role</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="lastActiveAt">Last Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-4">
                    <div className="space-y-2">
                      <Label htmlFor="sort-order">Sort Order</Label>
                      <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Order" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">Descending</SelectItem>
                          <SelectItem value="asc">Ascending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStartDate('');
                          setEndDate('');
                          setSortBy('createdAt');
                          setSortOrder('desc');
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedUsers.length} user(s) selected
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBulkActionDialogOpen(true)}
                    >
                      <MoreHorizontal className="w-4 h-4 mr-2" />
                      Bulk Actions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUsers([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage all users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  Loading users...
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === users.length && users.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded"
                          />
                        </TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-12">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id} className={user.deletedAt ? 'opacity-60 bg-red-50' : ''}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user._id)}
                              onChange={(e) => handleUserSelect(user._id, e.target.checked)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium flex items-center space-x-2">
                                  <button
                                    onClick={() => {
                                      console.log('🔍 [UserManagement] Navigating to user:', user._id);
                                      navigate(`/users/${user._id}`);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                  >
                                    {user.name || 'N/A'}
                                  </button>
                                  {user.deletedAt && (
                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                      DELETED
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {user.phone && (
                                <div className="flex items-center text-sm">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {user.phone}
                                </div>
                              )}
                              <div className="flex items-center text-sm">
                                <Mail className="w-3 h-3 mr-1" />
                                {user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.city && user.country ? (
                              <div className="flex items-center text-sm">
                                <MapPin className="w-3 h-3 mr-1" />
                                {user.city}, {user.country}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openUserDialog(user)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {!user.deletedAt && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openUserDialog(user)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteUser(user._id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {user.deletedAt && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => restoreUser(user._id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly user registration trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.monthlyGrowth?.map((month, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{month.month}</span>
                          <span>{month.count} users</span>
                        </div>
                        <Progress value={(month.count / analytics.maxMonthlyUsers) * 100} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Role Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Role Distribution</CardTitle>
                  <CardDescription>User roles breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.roleDistribution?.map((role, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getRoleBadge(role.role)}
                        </div>
                        <div className="text-sm font-medium">{role.count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>User status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.statusDistribution?.map((status, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(status.status)}
                        </div>
                        <div className="text-sm font-medium">{status.count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest user activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.recentActivity?.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm">{activity.description}</div>
                          <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editMode ? 'Update user information' : 'Create a new user account'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={userForm.role} onValueChange={(value) => setUserForm({...userForm, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={userForm.status} onValueChange={(value) => setUserForm({...userForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={userForm.city}
                  onChange={(e) => setUserForm({...userForm, city: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={userForm.state}
                  onChange={(e) => setUserForm({...userForm, state: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={userForm.country}
                  onChange={(e) => setUserForm({...userForm, country: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={userForm.address}
                onChange={(e) => setUserForm({...userForm, address: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveUser}>
              {editMode ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Perform actions on {selectedUsers.length} selected users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-action">Action</Label>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activate Users</SelectItem>
                  <SelectItem value="deactivate">Deactivate Users</SelectItem>
                  <SelectItem value="delete">Delete Users (Soft Delete)</SelectItem>
                  <SelectItem value="permanent_delete">Permanently Delete Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAction} disabled={!bulkAction}>
              Execute Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a comprehensive user account with all details
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-name">Full Name *</Label>
                  <Input
                    id="create-name"
                    value={createUserForm.name}
                    onChange={(e) => setCreateUserForm({...createUserForm, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="create-email">Email Address *</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createUserForm.email}
                    onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-phone">Phone Number</Label>
                  <Input
                    id="create-phone"
                    value={createUserForm.phone}
                    onChange={(e) => setCreateUserForm({...createUserForm, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="create-password">Password *</Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={createUserForm.password}
                    onChange={(e) => setCreateUserForm({...createUserForm, password: e.target.value})}
                    placeholder="Enter password"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-confirm-password">Confirm Password *</Label>
                  <Input
                    id="create-confirm-password"
                    type="password"
                    value={createUserForm.confirmPassword}
                    onChange={(e) => setCreateUserForm({...createUserForm, confirmPassword: e.target.value})}
                    placeholder="Confirm password"
                  />
                </div>
                <div>
                  <Label htmlFor="create-role">Role</Label>
                  <Select value={createUserForm.role} onValueChange={(value) => setCreateUserForm({...createUserForm, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="premium">Premium User</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-status">Status</Label>
                  <Select value={createUserForm.status} onValueChange={(value) => setCreateUserForm({...createUserForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="create-coach">Assigned Coach ID</Label>
                  <Input
                    id="create-coach"
                    value={createUserForm.coachId}
                    onChange={(e) => setCreateUserForm({...createUserForm, coachId: e.target.value})}
                    placeholder="Enter coach ID (optional)"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-dob">Date of Birth</Label>
                  <Input
                    id="create-dob"
                    type="date"
                    value={createUserForm.dateOfBirth}
                    onChange={(e) => setCreateUserForm({...createUserForm, dateOfBirth: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="create-gender">Gender</Label>
                  <Select value={createUserForm.gender} onValueChange={(value) => setCreateUserForm({...createUserForm, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-occupation">Occupation</Label>
                  <Input
                    id="create-occupation"
                    value={createUserForm.occupation}
                    onChange={(e) => setCreateUserForm({...createUserForm, occupation: e.target.value})}
                    placeholder="Enter occupation"
                  />
                </div>
                <div>
                  <Label htmlFor="create-company">Company</Label>
                  <Input
                    id="create-company"
                    value={createUserForm.company}
                    onChange={(e) => setCreateUserForm({...createUserForm, company: e.target.value})}
                    placeholder="Enter company name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="create-website">Website</Label>
                <Input
                  id="create-website"
                  type="url"
                  value={createUserForm.website}
                  onChange={(e) => setCreateUserForm({...createUserForm, website: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="create-bio">Bio</Label>
                <textarea
                  id="create-bio"
                  className="w-full p-2 border rounded-md min-h-[80px]"
                  value={createUserForm.bio}
                  onChange={(e) => setCreateUserForm({...createUserForm, bio: e.target.value})}
                  placeholder="Enter user bio"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="subscription" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-subscription-plan">Subscription Plan</Label>
                  <Select value={createUserForm.subscriptionPlan} onValueChange={(value) => setCreateUserForm({...createUserForm, subscriptionPlan: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subscription plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Plan</SelectItem>
                      {Array.isArray(subscriptionPlans) && subscriptionPlans.map((plan) => (
                        <SelectItem key={plan._id || plan.id} value={plan._id || plan.id}>
                          {plan.name} - ${plan.price}/{plan.billingCycle || plan.interval}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="create-payment-method">Payment Method</Label>
                  <Select value={createUserForm.paymentMethod} onValueChange={(value) => setCreateUserForm({...createUserForm, paymentMethod: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-start-date">Subscription Start Date</Label>
                  <Input
                    id="create-start-date"
                    type="date"
                    value={createUserForm.startDate}
                    onChange={(e) => setCreateUserForm({...createUserForm, startDate: e.target.value})}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="create-auto-renew"
                    checked={createUserForm.autoRenew}
                    onChange={(e) => setCreateUserForm({...createUserForm, autoRenew: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="create-auto-renew">Auto Renew</Label>
                </div>
              </div>
              
              {createUserForm.subscriptionPlan && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Selected Plan Details:</h4>
                  {Array.isArray(subscriptionPlans) && subscriptionPlans.find(p => (p._id || p.id) === createUserForm.subscriptionPlan) && (
                    <div className="text-sm text-gray-600">
                      {(() => {
                        const selectedPlan = subscriptionPlans.find(p => (p._id || p.id) === createUserForm.subscriptionPlan);
                        return (
                          <>
                            <p><strong>Plan:</strong> {selectedPlan.name}</p>
                            <p><strong>Price:</strong> ${selectedPlan.price}/{selectedPlan.billingCycle || selectedPlan.interval}</p>
                            <p><strong>Features:</strong> {Array.isArray(selectedPlan.features) ? selectedPlan.features.join(', ') : 'N/A'}</p>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="additional" className="space-y-4">
              <div>
                <Label htmlFor="create-address">Address</Label>
                <Input
                  id="create-address"
                  value={createUserForm.address}
                  onChange={(e) => setCreateUserForm({...createUserForm, address: e.target.value})}
                  placeholder="Enter street address"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-city">City</Label>
                  <Input
                    id="create-city"
                    value={createUserForm.city}
                    onChange={(e) => setCreateUserForm({...createUserForm, city: e.target.value})}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor="create-state">State/Province</Label>
                  <Input
                    id="create-state"
                    value={createUserForm.state}
                    onChange={(e) => setCreateUserForm({...createUserForm, state: e.target.value})}
                    placeholder="Enter state/province"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-country">Country</Label>
                  <Input
                    id="create-country"
                    value={createUserForm.country}
                    onChange={(e) => setCreateUserForm({...createUserForm, country: e.target.value})}
                    placeholder="Enter country"
                  />
                </div>
                <div>
                  <Label htmlFor="create-zip">ZIP/Postal Code</Label>
                  <Input
                    id="create-zip"
                    value={createUserForm.zipCode}
                    onChange={(e) => setCreateUserForm({...createUserForm, zipCode: e.target.value})}
                    placeholder="Enter ZIP/postal code"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="create-notes">Admin Notes</Label>
                <textarea
                  id="create-notes"
                  className="w-full p-2 border rounded-md min-h-[80px]"
                  value={createUserForm.notes}
                  onChange={(e) => setCreateUserForm({...createUserForm, notes: e.target.value})}
                  placeholder="Enter admin notes about this user"
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Users</DialogTitle>
            <DialogDescription>
              Choose export format and options
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="export-format">Format</Label>
              <Select value={exportOptions.format} onValueChange={(value) => setExportOptions({...exportOptions, format: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-deleted"
                checked={exportOptions.includeDeleted}
                onChange={(e) => setExportOptions({...exportOptions, includeDeleted: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="include-deleted">Include deleted users</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              exportUsers(exportOptions.format);
              setExportDialogOpen(false);
            }}>
              Export Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;