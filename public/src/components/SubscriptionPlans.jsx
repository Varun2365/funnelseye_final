import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Search,
  BarChart3,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import adminApiService from '../services/adminApiService';

const SubscriptionPlans = () => {
  // State management
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Analytics
  const [analytics, setAnalytics] = useState(null);
  
  // Form state
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'INR',
    billingCycle: 'monthly',
    duration: 1,
    features: {
      maxFunnels: 5,
      maxStaff: 2,
      maxDevices: 1,
      aiFeatures: false,
      advancedAnalytics: false,
      prioritySupport: false,
      customDomain: false,
      apiAccess: false,
      whiteLabel: false,
      automationRules: 10,
      emailCredits: 1000,
      smsCredits: 100,
      storageGB: 10,
      integrations: [],
      customBranding: false,
      advancedReporting: false,
      teamCollaboration: false,
      mobileApp: true,
      webhooks: false,
      sso: false
    },
    limits: {
      maxLeads: 100,
      maxAppointments: 50,
      maxCampaigns: 5,
      maxAutomationRules: 10,
      maxWhatsAppMessages: 100,
      maxEmailTemplates: 10,
      maxLandingPages: 5,
      maxWebinars: 2,
      maxForms: 10,
      maxSequences: 5,
      maxTags: 50,
      maxCustomFields: 20
    },
    isPopular: false,
    trialDays: 0,
    setupFee: 0,
    sortOrder: 0,
    category: 'professional',
    tags: [],
    isActive: true
  });

  // Load subscription plans
  const loadPlans = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        limit: 20,
        sortBy: 'sortOrder',
        sortOrder: 'asc'
      };
      
      // Only add filters if they have valid values
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (categoryFilter && categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      if (searchTerm && searchTerm.trim() !== '') {
        params.search = searchTerm;
      }
      
      console.log('🔍 [Frontend] Loading plans with params:', params);
      const response = await adminApiService.getSubscriptionPlans(params);
      
      //console.log('Full API response:', response);
      
      if (response.success) {
        //console.log('Response data:', response.data);
        //console.log('Plans array:', response.data.plans);
        //console.log('Pagination:', response.data.pagination);
        
        setPlans(response.data.plans || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.totalItems || 0);
        //console.log('Plans loaded successfully:', response.data);
      } else {
        console.error('API returned error:', response);
        setError(response.message || 'Failed to load subscription plans');
      }
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      setError('Failed to load subscription plans: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    try {
      const response = await adminApiService.getSubscriptionPlanAnalytics({ timeRange: 30 });
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  // Debug function
  const debugSubscriptionPlans = async () => {
    try {
      console.log('🔍 [DEBUG] Testing subscription plans debug endpoint...');
      const response = await adminApiService.debugSubscriptionPlans();
      console.log('🔍 [DEBUG] Debug response:', response);
      
      if (response.success) {
        console.log('🔍 [DEBUG] Debug data:', response.debug);
        setSuccess('Debug completed - check console for details');
      } else {
        setError('Debug failed: ' + response.error);
      }
    } catch (error) {
      console.error('🔍 [DEBUG] Debug error:', error);
      setError('Debug failed: ' + error.message);
    }
  };

  // Create new plan
  const handleCreatePlan = async () => {
    try {
      // Validate required fields
      if (!planForm.name?.trim() || !planForm.description?.trim() || !planForm.price || !planForm.billingCycle || !planForm.duration) {
        setError('Please fill in all required fields: Name, Description, Price, Billing Cycle, and Duration');
        return;
      }

      // Prepare form data
      const formData = {
        name: planForm.name.trim(),
        description: planForm.description.trim(),
        price: parseFloat(planForm.price),
        currency: planForm.currency,
        billingCycle: planForm.billingCycle,
        duration: parseInt(planForm.duration),
        features: planForm.features,
        limits: planForm.limits,
        isPopular: planForm.isPopular,
        trialDays: parseInt(planForm.trialDays) || 0,
        setupFee: parseFloat(planForm.setupFee) || 0,
        sortOrder: parseInt(planForm.sortOrder) || 0,
        category: planForm.category,
        tags: planForm.tags || [],
        isActive: planForm.isActive
      };

      //console.log('Creating plan with data:', formData);
      const response = await adminApiService.createSubscriptionPlan(formData);
      
      if (response.success) {
        setSuccess('Subscription plan created successfully!');
        setIsCreateDialogOpen(false);
        resetForm();
        loadPlans();
        setError('');
      } else {
        setError(response.message || 'Failed to create subscription plan');
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      setError('Failed to create subscription plan: ' + error.message);
    }
  };

  // Update plan
  const handleUpdatePlan = async () => {
    try {
      if (!selectedPlan?._id) {
        setError('No plan selected for update');
        return;
      }

      // Validate required fields
      if (!planForm.name?.trim() || !planForm.description?.trim() || !planForm.price || !planForm.billingCycle || !planForm.duration) {
        setError('Please fill in all required fields: Name, Description, Price, Billing Cycle, and Duration');
        return;
      }

      // Prepare form data
      const formData = {
        name: planForm.name.trim(),
        description: planForm.description.trim(),
        price: parseFloat(planForm.price),
        currency: planForm.currency,
        billingCycle: planForm.billingCycle,
        duration: parseInt(planForm.duration),
        features: planForm.features,
        limits: planForm.limits,
        isPopular: planForm.isPopular,
        trialDays: parseInt(planForm.trialDays) || 0,
        setupFee: parseFloat(planForm.setupFee) || 0,
        sortOrder: parseInt(planForm.sortOrder) || 0,
        category: planForm.category,
        tags: planForm.tags || [],
        isActive: planForm.isActive
      };

      //console.log('Updating plan with data:', formData);
      const response = await adminApiService.updateSubscriptionPlan(selectedPlan._id, formData);
      
      if (response.success) {
        setSuccess('Subscription plan updated successfully!');
        setIsEditDialogOpen(false);
        resetForm();
        loadPlans();
        setError('');
      } else {
        setError(response.message || 'Failed to update subscription plan');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      setError('Failed to update subscription plan: ' + error.message);
    }
  };

  // Delete plan
  const handleDeletePlan = async () => {
    try {
      if (!selectedPlan?._id) {
        setError('No plan selected for deletion');
        return;
      }

      const response = await adminApiService.deleteSubscriptionPlan(selectedPlan._id);
      
      if (response.success) {
        setSuccess('Subscription plan deleted successfully!');
        setIsDeleteDialogOpen(false);
        setSelectedPlan(null);
        loadPlans();
        setError('');
      } else {
        setError(response.message || 'Failed to delete subscription plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      setError('Failed to delete subscription plan: ' + error.message);
    }
  };

  // Toggle plan status
  const handleToggleStatus = async (planId) => {
    try {
      const response = await adminApiService.toggleSubscriptionPlanStatus(planId);
      
      if (response.success) {
        setSuccess('Plan status updated successfully!');
        loadPlans();
        setError('');
      } else {
        setError(response.message || 'Failed to toggle plan status');
      }
    } catch (error) {
      console.error('Error toggling plan status:', error);
      setError('Failed to toggle plan status: ' + error.message);
    }
  };

  // Duplicate plan
  const handleDuplicatePlan = async (planId) => {
    try {
      const response = await adminApiService.duplicateSubscriptionPlan(planId);
      
      if (response.success) {
        setSuccess('Plan duplicated successfully!');
        loadPlans();
        setError('');
      } else {
        setError(response.message || 'Failed to duplicate plan');
      }
    } catch (error) {
      console.error('Error duplicating plan:', error);
      setError('Failed to duplicate plan: ' + error.message);
    }
  };

  // Reset form
  const resetForm = () => {
    setPlanForm({
      name: '',
      description: '',
      price: 0,
      currency: 'INR',
      billingCycle: 'monthly',
      duration: 1,
      features: {
        maxFunnels: 5,
        maxStaff: 2,
        maxDevices: 1,
        aiFeatures: false,
        advancedAnalytics: false,
        prioritySupport: false,
        customDomain: false,
        apiAccess: false,
        whiteLabel: false,
        automationRules: 10,
        emailCredits: 1000,
        smsCredits: 100,
        storageGB: 10,
        integrations: [],
        customBranding: false,
        advancedReporting: false,
        teamCollaboration: false,
        mobileApp: true,
        webhooks: false,
        sso: false
      },
      limits: {
        maxLeads: 100,
        maxAppointments: 50,
        maxCampaigns: 5,
        maxAutomationRules: 10,
        maxWhatsAppMessages: 100,
        maxEmailTemplates: 10,
        maxLandingPages: 5,
        maxWebinars: 2,
        maxForms: 10,
        maxSequences: 5,
        maxTags: 50,
        maxCustomFields: 20
      },
      isPopular: false,
      trialDays: 0,
      setupFee: 0,
      sortOrder: 0,
      category: 'professional',
      tags: [],
      isActive: true
    });
  };

  // Edit plan
  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name || '',
      description: plan.description || '',
      price: plan.price || 0,
      currency: plan.currency || 'INR',
      billingCycle: plan.billingCycle || 'monthly',
      duration: plan.duration || 1,
      features: plan.features || {},
      limits: plan.limits || {},
      isPopular: plan.isPopular || false,
      trialDays: plan.trialDays || 0,
      setupFee: plan.setupFee || 0,
      sortOrder: plan.sortOrder || 0,
      category: plan.category || 'professional',
      tags: plan.tags || [],
      isActive: plan.isActive !== undefined ? plan.isActive : true
    });
    setIsEditDialogOpen(true);
  };

  // Format currency
  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    return status ? 'default' : 'destructive';
  };

  // Clear messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Effects
  useEffect(() => {
    loadPlans();
  }, [currentPage, searchTerm, statusFilter, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(clearMessages, 5000);
    return () => clearTimeout(timer);
  }, [error, success]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-gray-600">Manage platform subscription plans and pricing</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={debugSubscriptionPlans}
          >
            🔍 Debug
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsAnalyticsDialogOpen(true);
              loadAnalytics();
            }}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans ({totalItems})</CardTitle>
          <CardDescription>Manage all platform subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No subscription plans found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          <div className="text-sm text-gray-500">{plan.description}</div>
                        </div>
                        {plan.isPopular && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{plan.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(plan.price, plan.currency)}
                      </div>
                      {plan.setupFee > 0 && (
                        <div className="text-sm text-gray-500">
                          +{formatCurrency(plan.setupFee, plan.currency)} setup
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{plan.billingCycle}</div>
                        <div className="text-gray-500">{plan.duration} month(s)</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Funnels: {plan.features?.maxFunnels || 'N/A'}</div>
                        <div>Staff: {plan.features?.maxStaff || 'N/A'}</div>
                        <div>AI: {plan.features?.aiFeatures ? 'Yes' : 'No'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(plan.isActive)}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(plan._id)}
                        >
                          {plan.isActive ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPlan(plan)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicatePlan(plan._id)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Plan Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Subscription Plan</DialogTitle>
            <DialogDescription>
              Create a new subscription plan with features and limits
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="limits">Limits</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                    placeholder="e.g., Professional Plan"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={planForm.category} onValueChange={(value) => setPlanForm({...planForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                  placeholder="Plan description..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({...planForm, price: parseFloat(e.target.value) || 0})}
                    placeholder="99.99"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={planForm.currency} onValueChange={(value) => setPlanForm({...planForm, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="billingCycle">Billing Cycle *</Label>
                  <Select value={planForm.billingCycle} onValueChange={(value) => setPlanForm({...planForm, billingCycle: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="duration">Duration (months) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={planForm.duration}
                  onChange={(e) => setPlanForm({...planForm, duration: parseInt(e.target.value) || 1})}
                  placeholder="1"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxFunnels">Max Funnels</Label>
                  <Input
                    id="maxFunnels"
                    type="number"
                    value={planForm.features.maxFunnels}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      features: {...planForm.features, maxFunnels: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxStaff">Max Staff</Label>
                  <Input
                    id="maxStaff"
                    type="number"
                    value={planForm.features.maxStaff}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      features: {...planForm.features, maxStaff: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxDevices">Max Devices</Label>
                  <Input
                    id="maxDevices"
                    type="number"
                    value={planForm.features.maxDevices}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      features: {...planForm.features, maxDevices: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="storageGB">Storage (GB)</Label>
                  <Input
                    id="storageGB"
                    type="number"
                    value={planForm.features.storageGB}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      features: {...planForm.features, storageGB: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Feature Toggles</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="aiFeatures"
                      className="h-6 w-11"
                      checked={planForm.features.aiFeatures}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                        features: {...planForm.features, aiFeatures: checked}
                      })}
                    />
                    <Label htmlFor="aiFeatures">AI Features</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="advancedAnalytics"
                      className="h-6 w-11"
                      checked={planForm.features.advancedAnalytics}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                        features: {...planForm.features, advancedAnalytics: checked}
                      })}
                    />
                    <Label htmlFor="advancedAnalytics">Advanced Analytics</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="prioritySupport"
                      className="h-6 w-11"
                      checked={planForm.features.prioritySupport}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                        features: {...planForm.features, prioritySupport: checked}
                      })}
                    />
                    <Label htmlFor="prioritySupport">Priority Support</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="customDomain"
                      className="h-6 w-11"
                      checked={planForm.features.customDomain}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                        features: {...planForm.features, customDomain: checked}
                      })}
                    />
                    <Label htmlFor="customDomain">Custom Domain</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="apiAccess"
                      className="h-6 w-11"
                      checked={planForm.features.apiAccess}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                        features: {...planForm.features, apiAccess: checked}
                      })}
                    />
                    <Label htmlFor="apiAccess">API Access</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="whiteLabel"
                      className="h-6 w-11"
                      checked={planForm.features.whiteLabel}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                        features: {...planForm.features, whiteLabel: checked}
                      })}
                    />
                    <Label htmlFor="whiteLabel">White Label</Label>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="limits" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxLeads">Max Leads</Label>
                  <Input
                    id="maxLeads"
                    type="number"
                    value={planForm.limits.maxLeads}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      limits: {...planForm.limits, maxLeads: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxAppointments">Max Appointments</Label>
                  <Input
                    id="maxAppointments"
                    type="number"
                    value={planForm.limits.maxAppointments}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      limits: {...planForm.limits, maxAppointments: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxCampaigns">Max Campaigns</Label>
                  <Input
                    id="maxCampaigns"
                    type="number"
                    value={planForm.limits.maxCampaigns}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      limits: {...planForm.limits, maxCampaigns: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxWhatsAppMessages">Max WhatsApp Messages</Label>
                  <Input
                    id="maxWhatsAppMessages"
                    type="number"
                    value={planForm.limits.maxWhatsAppMessages}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      limits: {...planForm.limits, maxWhatsAppMessages: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trialDays">Trial Days</Label>
                  <Input
                    id="trialDays"
                    type="number"
                    value={planForm.trialDays}
                    onChange={(e) => setPlanForm({...planForm, trialDays: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="setupFee">Setup Fee</Label>
                  <Input
                    id="setupFee"
                    type="number"
                    step="0.01"
                    value={planForm.setupFee}
                    onChange={(e) => setPlanForm({...planForm, setupFee: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={planForm.sortOrder}
                    onChange={(e) => setPlanForm({...planForm, sortOrder: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPopular"
                    className="h-6 w-11"
                    checked={planForm.isPopular}
                    onCheckedChange={(checked) => setPlanForm({...planForm, isPopular: checked})}
                  />
                  <Label htmlFor="isPopular">Mark as Popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    className="h-6 w-11"
                    checked={planForm.isActive}
                    onCheckedChange={(checked) => setPlanForm({...planForm, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlan}>
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the subscription plan details
            </DialogDescription>
          </DialogHeader>
          
          {/* Same form structure as create dialog */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="limits">Limits</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Plan Name *</Label>
                  <Input
                    id="edit-name"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                    placeholder="e.g., Professional Plan"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={planForm.category} onValueChange={(value) => setPlanForm({...planForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                  placeholder="Plan description..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({...planForm, price: parseFloat(e.target.value) || 0})}
                    placeholder="99.99"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-currency">Currency</Label>
                  <Select value={planForm.currency} onValueChange={(value) => setPlanForm({...planForm, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-billingCycle">Billing Cycle *</Label>
                  <Select value={planForm.billingCycle} onValueChange={(value) => setPlanForm({...planForm, billingCycle: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-duration">Duration (months) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={planForm.duration}
                  onChange={(e) => setPlanForm({...planForm, duration: parseInt(e.target.value) || 1})}
                  placeholder="1"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-maxFunnels">Max Funnels</Label>
                  <Input
                    id="edit-maxFunnels"
                    type="number"
                    value={planForm.features.maxFunnels}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      features: {...planForm.features, maxFunnels: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maxStaff">Max Staff</Label>
                  <Input
                    id="edit-maxStaff"
                    type="number"
                    value={planForm.features.maxStaff}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      features: {...planForm.features, maxStaff: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maxDevices">Max Devices</Label>
                  <Input
                    id="edit-maxDevices"
                    type="number"
                    value={planForm.features.maxDevices}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      features: {...planForm.features, maxDevices: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-storageGB">Storage (GB)</Label>
                  <Input
                    id="edit-storageGB"
                    type="number"
                    value={planForm.features.storageGB}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      features: {...planForm.features, storageGB: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Feature Toggles</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-aiFeatures"
                      className="h-6 w-11"
                      checked={planForm.features.aiFeatures}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                        features: {...planForm.features, aiFeatures: checked}
                      })}
                    />
                    <Label htmlFor="edit-aiFeatures">AI Features</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-advancedAnalytics"
                      className="h-6 w-11"
                      checked={planForm.features.advancedAnalytics}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                        features: {...planForm.features, advancedAnalytics: checked}
                      })}
                    />
                    <Label htmlFor="edit-advancedAnalytics">Advanced Analytics</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-prioritySupport"
                      className="h-6 w-11"
                      checked={planForm.features.prioritySupport}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                        features: {...planForm.features, prioritySupport: checked}
                      })}
                    />
                    <Label htmlFor="edit-prioritySupport">Priority Support</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-customDomain"
                      className="h-6 w-11"
                      checked={planForm.features.customDomain}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                        features: {...planForm.features, customDomain: checked}
                      })}
                    />
                    <Label htmlFor="edit-customDomain">Custom Domain</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-apiAccess"
                      className="h-6 w-11"
                      checked={planForm.features.apiAccess}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                        features: {...planForm.features, apiAccess: checked}
                      })}
                    />
                    <Label htmlFor="edit-apiAccess">API Access</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-whiteLabel"
                      className="h-6 w-11"
                      checked={planForm.features.whiteLabel}
                      onCheckedChange={(checked) => setPlanForm({
                        ...planForm, 
                        features: {...planForm.features, whiteLabel: checked}
                      })}
                    />
                    <Label htmlFor="edit-whiteLabel">White Label</Label>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="limits" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-maxLeads">Max Leads</Label>
                  <Input
                    id="edit-maxLeads"
                    type="number"
                    value={planForm.limits.maxLeads}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      limits: {...planForm.limits, maxLeads: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maxAppointments">Max Appointments</Label>
                  <Input
                    id="edit-maxAppointments"
                    type="number"
                    value={planForm.limits.maxAppointments}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      limits: {...planForm.limits, maxAppointments: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maxCampaigns">Max Campaigns</Label>
                  <Input
                    id="edit-maxCampaigns"
                    type="number"
                    value={planForm.limits.maxCampaigns}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      limits: {...planForm.limits, maxCampaigns: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maxWhatsAppMessages">Max WhatsApp Messages</Label>
                  <Input
                    id="edit-maxWhatsAppMessages"
                    type="number"
                    value={planForm.limits.maxWhatsAppMessages}
                    onChange={(e) => setPlanForm({
                      ...planForm, 
                      limits: {...planForm.limits, maxWhatsAppMessages: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-trialDays">Trial Days</Label>
                  <Input
                    id="edit-trialDays"
                    type="number"
                    value={planForm.trialDays}
                    onChange={(e) => setPlanForm({...planForm, trialDays: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-setupFee">Setup Fee</Label>
                  <Input
                    id="edit-setupFee"
                    type="number"
                    step="0.01"
                    value={planForm.setupFee}
                    onChange={(e) => setPlanForm({...planForm, setupFee: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-sortOrder">Sort Order</Label>
                  <Input
                    id="edit-sortOrder"
                    type="number"
                    value={planForm.sortOrder}
                    onChange={(e) => setPlanForm({...planForm, sortOrder: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isPopular"
                    className="h-6 w-11"
                    checked={planForm.isPopular}
                    onCheckedChange={(checked) => setPlanForm({...planForm, isPopular: checked})}
                  />
                  <Label htmlFor="edit-isPopular">Mark as Popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isActive"
                    className="h-6 w-11"
                    checked={planForm.isActive}
                    onCheckedChange={(checked) => setPlanForm({...planForm, isActive: checked})}
                  />
                  <Label htmlFor="edit-isActive">Active</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlan}>
              Update Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscription Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPlan?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={isAnalyticsDialogOpen} onOpenChange={setIsAnalyticsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Subscription Plan Analytics</DialogTitle>
            <DialogDescription>
              View analytics and insights for subscription plans
            </DialogDescription>
          </DialogHeader>
          
          {analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{analytics.plans?.total || 0}</div>
                    <div className="text-sm text-gray-500">Total Plans</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{analytics.plans?.active || 0}</div>
                    <div className="text-sm text-gray-500">Active Plans</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{analytics.subscriptions?.active || 0}</div>
                    <div className="text-sm text-gray-500">Active Subscriptions</div>
                  </CardContent>
                </Card>
              </div>
              
              {analytics.planPopularity && analytics.planPopularity.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Popularity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plan Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Subscribers</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.planPopularity.map((plan, index) => (
                          <TableRow key={index}>
                            <TableCell>{plan.planName}</TableCell>
                            <TableCell>{formatCurrency(plan.planPrice)}</TableCell>
                            <TableCell>{plan.subscriberCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsAnalyticsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPlans;