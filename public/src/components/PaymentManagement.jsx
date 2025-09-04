import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  Settings,
  RefreshCw,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const PaymentManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [payouts, setPayouts] = useState([]);
  
  // Dialog states
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [testGatewayDialogOpen, setTestGatewayDialogOpen] = useState(false);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  
  // Form states
  const [settingsForm, setSettingsForm] = useState({});
  const [testGatewayForm, setTestGatewayForm] = useState({ gateway: 'stripe', amount: 1 });
  const [payoutForm, setPayoutForm] = useState({ type: 'commission', period: 'current' });

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPaymentSettings(),
        fetchTransactions(),
        fetchCommissions(),
        fetchAnalytics(),
        fetchPayouts()
      ]);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const response = await axios.get('/api/admin/payment/settings');
      setPaymentSettings(response.data.data);
      setSettingsForm(response.data.data);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/admin/payment/transactions');
      setTransactions(response.data.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchCommissions = async () => {
    try {
      const response = await axios.get('/api/admin/payment/commissions');
      setCommissions(response.data.data.commissions || []);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/admin/payment/analytics');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchPayouts = async () => {
    try {
      const response = await axios.get('/api/payments/payouts/analytics');
      setPayouts(response.data.data);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      setLoading(true);
      await axios.put('/api/admin/payment/settings', { settings: settingsForm });
      toast.success('Payment settings updated successfully');
      setSettingsDialogOpen(false);
      fetchPaymentSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlatformFees = async () => {
    try {
      setLoading(true);
      await axios.put('/api/admin/payment/platform-fees', { 
        platformFees: settingsForm.paymentSystem?.platformFees 
      });
      toast.success('Platform fees updated successfully');
      fetchPaymentSettings();
    } catch (error) {
      console.error('Error updating platform fees:', error);
      toast.error(error.response?.data?.message || 'Failed to update platform fees');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMlmCommissions = async () => {
    try {
      setLoading(true);
      await axios.put('/api/admin/payment/mlm-commissions', { 
        mlmCommissionStructure: settingsForm.paymentSystem?.mlmCommissionStructure 
      });
      toast.success('MLM commission structure updated successfully');
      fetchPaymentSettings();
    } catch (error) {
      console.error('Error updating MLM commissions:', error);
      toast.error(error.response?.data?.message || 'Failed to update MLM commissions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGatewaySettings = async () => {
    try {
      setLoading(true);
      await axios.put('/api/admin/payment/gateway-settings', { 
        paymentGateways: settingsForm.paymentSystem?.paymentGateways 
      });
      toast.success('Gateway settings updated successfully');
      fetchPaymentSettings();
    } catch (error) {
      console.error('Error updating gateway settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update gateway settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestGateway = async () => {
    try {
      setLoading(true);
      await axios.post('/api/admin/payment/test-gateway', testGatewayForm);
      toast.success('Gateway test completed successfully');
      setTestGatewayDialogOpen(false);
    } catch (error) {
      console.error('Error testing gateway:', error);
      toast.error(error.response?.data?.message || 'Gateway test failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayouts = async () => {
    try {
      setLoading(true);
      await axios.post('/api/payments/payouts/process', payoutForm);
      toast.success('Payouts processed successfully');
      setPayoutDialogOpen(false);
      fetchPayouts();
    } catch (error) {
      console.error('Error processing payouts:', error);
      toast.error(error.response?.data?.message || 'Failed to process payouts');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      successful: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      failed: { variant: 'destructive', icon: XCircle, color: 'text-red-600' },
      pending: { variant: 'secondary', icon: Clock, color: 'text-yellow-600' },
      processing: { variant: 'outline', icon: Activity, color: 'text-blue-600' }
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !paymentSettings) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payment Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground">
            Manage payment gateways, fees, commissions, and payouts.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchPaymentData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setSettingsDialogOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Payment System Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.totalRevenue ? formatCurrency(analytics.totalRevenue) : '$0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{analytics?.revenueGrowth || 0}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Gateways</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {paymentSettings?.paymentSystem?.paymentGateways ? 
                    Object.values(paymentSettings.paymentSystem.paymentGateways).filter(g => g.enabled).length : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Payment gateways configured
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payouts?.summary?.totalPayouts || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(payouts?.summary?.totalAmount || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.successRate || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Payment success rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common payment management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setTestGatewayDialogOpen(true)}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Zap className="h-6 w-6 mb-2" />
                  Test Gateway
                </Button>
                <Button 
                  onClick={() => setPayoutDialogOpen(true)}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <DollarSign className="h-6 w-6 mb-2" />
                  Process Payouts
                </Button>
                <Button 
                  onClick={() => setSettingsDialogOpen(true)}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Settings className="h-6 w-6 mb-2" />
                  Payment Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 5).map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.transactionId}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(transaction.grossAmount, transaction.currency)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.paymentGateway}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                Complete transaction history and management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Platform Fee</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.transactionId}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {transaction.sourceType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(transaction.grossAmount, transaction.currency)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(transaction.platformFee, transaction.currency)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(transaction.netAmount, transaction.currency)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.paymentGateway}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Commission Distributions</CardTitle>
              <CardDescription>
                MLM commission tracking and management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Distribution ID</TableHead>
                    <TableHead>Source Transaction</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Total Coaches</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission._id}>
                      <TableCell className="font-mono text-sm">
                        {commission.distributionId}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {commission.sourceTransactionId}
                      </TableCell>
                      <TableCell>
                        {commission.commissionPeriod?.month}/{commission.commissionPeriod?.year}
                      </TableCell>
                      <TableCell>
                        {commission.summary?.totalEligibleCoaches || 0}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(commission.summary?.totalCommissionAmount || 0)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(commission.approvalStatus)}
                      </TableCell>
                      <TableCell>
                        {formatDate(commission.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout Management</CardTitle>
              <CardDescription>
                Process and monitor coach payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Payouts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {payouts?.summary?.totalPayouts || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Successful</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {payouts?.summary?.successfulPayouts || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Failed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {payouts?.summary?.failedPayouts || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={() => setPayoutDialogOpen(true)}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Process Payouts
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Analytics</CardTitle>
                <CardDescription>
                  Revenue and transaction insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-semibold">
                      {formatCurrency(analytics?.totalRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Transactions</span>
                    <span className="font-semibold">
                      {analytics?.totalTransactions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="font-semibold">
                      {analytics?.successRate || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Transaction</span>
                    <span className="font-semibold">
                      {formatCurrency(analytics?.averageTransaction || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gateway Performance</CardTitle>
                <CardDescription>
                  Payment gateway statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.gatewayStats?.map((gateway) => (
                    <div key={gateway.name} className="flex justify-between">
                      <span className="capitalize">{gateway.name}</span>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(gateway.totalAmount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {gateway.transactionCount} transactions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Settings</DialogTitle>
            <DialogDescription>
              Configure payment gateways, fees, and commission structures
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="gateways" className="space-y-4">
            <TabsList>
              <TabsTrigger value="gateways">Gateways</TabsTrigger>
              <TabsTrigger value="fees">Platform Fees</TabsTrigger>
              <TabsTrigger value="commissions">MLM Commissions</TabsTrigger>
              <TabsTrigger value="payouts">Payout Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="gateways" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Stripe</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settingsForm.paymentSystem?.paymentGateways?.stripe?.enabled || false}
                        onCheckedChange={(checked) => 
                          setSettingsForm(prev => ({
                            ...prev,
                            paymentSystem: {
                              ...prev.paymentSystem,
                              paymentGateways: {
                                ...prev.paymentSystem?.paymentGateways,
                                stripe: {
                                  ...prev.paymentSystem?.paymentGateways?.stripe,
                                  enabled: checked
                                }
                              }
                            }
                          }))
                        }
                      />
                      <Label>Enable Stripe</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripe-public-key">Public Key</Label>
                      <Input
                        id="stripe-public-key"
                        value={settingsForm.paymentSystem?.paymentGateways?.stripe?.publicKey || ''}
                        onChange={(e) => 
                          setSettingsForm(prev => ({
                            ...prev,
                            paymentSystem: {
                              ...prev.paymentSystem,
                              paymentGateways: {
                                ...prev.paymentSystem?.paymentGateways,
                                stripe: {
                                  ...prev.paymentSystem?.paymentGateways?.stripe,
                                  publicKey: e.target.value
                                }
                              }
                            }
                          }))
                        }
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripe-secret-key">Secret Key</Label>
                      <Input
                        id="stripe-secret-key"
                        type="password"
                        value={settingsForm.paymentSystem?.paymentGateways?.stripe?.secretKey || ''}
                        onChange={(e) => 
                          setSettingsForm(prev => ({
                            ...prev,
                            paymentSystem: {
                              ...prev.paymentSystem,
                              paymentGateways: {
                                ...prev.paymentSystem?.paymentGateways,
                                stripe: {
                                  ...prev.paymentSystem?.paymentGateways?.stripe,
                                  secretKey: e.target.value
                                }
                              }
                            }
                          }))
                        }
                        placeholder="sk_test_..."
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Razorpay</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settingsForm.paymentSystem?.paymentGateways?.razorpay?.enabled || false}
                        onCheckedChange={(checked) => 
                          setSettingsForm(prev => ({
                            ...prev,
                            paymentSystem: {
                              ...prev.paymentSystem,
                              paymentGateways: {
                                ...prev.paymentSystem?.paymentGateways,
                                razorpay: {
                                  ...prev.paymentSystem?.paymentGateways?.razorpay,
                                  enabled: checked
                                }
                              }
                            }
                          }))
                        }
                      />
                      <Label>Enable Razorpay</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="razorpay-key-id">Key ID</Label>
                      <Input
                        id="razorpay-key-id"
                        value={settingsForm.paymentSystem?.paymentGateways?.razorpay?.keyId || ''}
                        onChange={(e) => 
                          setSettingsForm(prev => ({
                            ...prev,
                            paymentSystem: {
                              ...prev.paymentSystem,
                              paymentGateways: {
                                ...prev.paymentSystem?.paymentGateways,
                                razorpay: {
                                  ...prev.paymentSystem?.paymentGateways?.razorpay,
                                  keyId: e.target.value
                                }
                              }
                            }
                          }))
                        }
                        placeholder="rzp_test_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="razorpay-secret">Secret Key</Label>
                      <Input
                        id="razorpay-secret"
                        type="password"
                        value={settingsForm.paymentSystem?.paymentGateways?.razorpay?.secretKey || ''}
                        onChange={(e) => 
                          setSettingsForm(prev => ({
                            ...prev,
                            paymentSystem: {
                              ...prev.paymentSystem,
                              paymentGateways: {
                                ...prev.paymentSystem?.paymentGateways,
                                razorpay: {
                                  ...prev.paymentSystem?.paymentGateways?.razorpay,
                                  secretKey: e.target.value
                                }
                              }
                            }
                          }))
                        }
                        placeholder="Secret key..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Button onClick={handleUpdateGatewaySettings} disabled={loading}>
                Update Gateway Settings
              </Button>
            </TabsContent>

            <TabsContent value="fees" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Fee Structure</CardTitle>
                  <CardDescription>
                    Configure platform fees for different payment types
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="default-fee">Default Fee Percentage</Label>
                      <Input
                        id="default-fee"
                        type="number"
                        step="0.01"
                        value={settingsForm.paymentSystem?.platformFees?.defaultPercentage || 0}
                        onChange={(e) => 
                          setSettingsForm(prev => ({
                            ...prev,
                            paymentSystem: {
                              ...prev.paymentSystem,
                              platformFees: {
                                ...prev.paymentSystem?.platformFees,
                                defaultPercentage: parseFloat(e.target.value)
                              }
                            }
                          }))
                        }
                        placeholder="2.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="min-fee">Minimum Fee</Label>
                      <Input
                        id="min-fee"
                        type="number"
                        step="0.01"
                        value={settingsForm.paymentSystem?.platformFees?.minimumFee || 0}
                        onChange={(e) => 
                          setSettingsForm(prev => ({
                            ...prev,
                            paymentSystem: {
                              ...prev.paymentSystem,
                              platformFees: {
                                ...prev.paymentSystem?.platformFees,
                                minimumFee: parseFloat(e.target.value)
                              }
                            }
                          }))
                        }
                        placeholder="0.50"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button onClick={handleUpdatePlatformFees} disabled={loading}>
                Update Platform Fees
              </Button>
            </TabsContent>

            <TabsContent value="commissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>MLM Commission Structure</CardTitle>
                  <CardDescription>
                    Configure commission percentages for different levels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(level => (
                      <div key={level} className="space-y-2">
                        <Label htmlFor={`level-${level}`}>Level {level}</Label>
                        <Input
                          id={`level-${level}`}
                          type="number"
                          step="0.01"
                          value={settingsForm.paymentSystem?.mlmCommissionStructure?.[`level${level}`] || 0}
                          onChange={(e) => 
                            setSettingsForm(prev => ({
                              ...prev,
                              paymentSystem: {
                                ...prev.paymentSystem,
                                mlmCommissionStructure: {
                                  ...prev.paymentSystem?.mlmCommissionStructure,
                                  [`level${level}`]: parseFloat(e.target.value)
                                }
                              }
                            }))
                          }
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Button onClick={handleUpdateMlmCommissions} disabled={loading}>
                Update MLM Commissions
              </Button>
            </TabsContent>

            <TabsContent value="payouts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payout Settings</CardTitle>
                  <CardDescription>
                    Configure automatic payout settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payout-frequency">Payout Frequency</Label>
                    <Select
                      value={settingsForm.payoutSettings?.frequency || 'manual'}
                      onValueChange={(value) => 
                        setSettingsForm(prev => ({
                          ...prev,
                          payoutSettings: {
                            ...prev.payoutSettings,
                            frequency: value
                          }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min-payout">Minimum Payout Amount</Label>
                    <Input
                      id="min-payout"
                      type="number"
                      step="0.01"
                      value={settingsForm.payoutSettings?.minimumPayoutAmount || 0}
                      onChange={(e) => 
                        setSettingsForm(prev => ({
                          ...prev,
                          payoutSettings: {
                            ...prev.payoutSettings,
                            minimumPayoutAmount: parseFloat(e.target.value)
                          }
                        }))
                      }
                      placeholder="10.00"
                    />
                  </div>
                </CardContent>
              </Card>
              <Button onClick={handleUpdateSettings} disabled={loading}>
                Update Payout Settings
              </Button>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSettings} disabled={loading}>
              Save All Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Gateway Dialog */}
      <Dialog open={testGatewayDialogOpen} onOpenChange={setTestGatewayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Payment Gateway</DialogTitle>
            <DialogDescription>
              Test the configured payment gateway with a small amount
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-gateway">Gateway</Label>
              <Select
                value={testGatewayForm.gateway}
                onValueChange={(value) => setTestGatewayForm(prev => ({ ...prev, gateway: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-amount">Test Amount</Label>
              <Input
                id="test-amount"
                type="number"
                step="0.01"
                value={testGatewayForm.amount}
                onChange={(e) => setTestGatewayForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                placeholder="1.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestGatewayDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTestGateway} disabled={loading}>
              Test Gateway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Payouts Dialog */}
      <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payouts</DialogTitle>
            <DialogDescription>
              Process automatic payouts for coaches
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payout-type">Payout Type</Label>
              <Select
                value={payoutForm.type}
                onValueChange={(value) => setPayoutForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commission">Commission</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payout-period">Period</Label>
              <Select
                value={payoutForm.period}
                onValueChange={(value) => setPayoutForm(prev => ({ ...prev, period: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Month</SelectItem>
                  <SelectItem value="previous">Previous Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessPayouts} disabled={loading}>
              Process Payouts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;
