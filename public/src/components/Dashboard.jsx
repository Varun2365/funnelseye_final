import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Server,
  Database,
  Zap,
  Shield,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import adminApiService from '../services/adminApiService';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchSystemHealth();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('📊 [DASHBOARD] Fetching dashboard data...');
      const response = await adminApiService.getDashboard();
      console.log('📊 [DASHBOARD] Dashboard data received:', response);
      setDashboardData(response.data);
    } catch (error) {
      console.error('📊 [DASHBOARD] Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const response = await adminApiService.getSystemHealth();
      setSystemHealth(response.data);
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError('');
    fetchDashboardData();
    fetchSystemHealth();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 animate-pulse mb-2"></div>
                <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <Button onClick={handleRefresh} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const systemHealthData = systemHealth || {};
  const recentActivity = dashboardData?.recentActivity || [];
  const performanceMetrics = dashboardData?.performanceMetrics || {};

  // Sample chart data - replace with real data from backend
  const userGrowthData = [
    { month: 'Jan', users: 1200, revenue: 24000 },
    { month: 'Feb', users: 1900, revenue: 38000 },
    { month: 'Mar', users: 3000, revenue: 60000 },
    { month: 'Apr', users: 2780, revenue: 55600 },
    { month: 'May', users: 1890, revenue: 37800 },
    { month: 'Jun', users: 2390, revenue: 47800 },
  ];

  const paymentMethodData = [
    { name: 'Stripe', value: 45, color: '#8884d8' },
    { name: 'Razorpay', value: 35, color: '#82ca9d' },
    { name: 'PayPal', value: 20, color: '#ffc658' },
  ];

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the admin dashboard. Here's what's happening with your system.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisMonth || 0} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.revenueGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coaches</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCoaches || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.coachGrowth || 0} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getHealthStatusIcon(systemHealthData.status)}
              <span className={`text-sm font-medium ${getHealthStatusColor(systemHealthData.status)}`}>
                {systemHealthData.status || 'Unknown'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {systemHealthData.performance?.uptime ? Math.floor(systemHealthData.performance.uptime / 3600) : 0}h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* User Growth Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>User Growth & Revenue</CardTitle>
            <CardDescription>
              Monthly user growth and revenue trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Distribution of payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database</span>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <Badge variant={systemHealthData.database?.connected ? "default" : "destructive"}>
                  {systemHealthData.database?.connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Response Time</span>
              <span className="text-sm text-muted-foreground">
                {systemHealthData.performance?.responseTime ? 
                  `${systemHealthData.performance.responseTime.toFixed(2)}ms` : 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recent Errors</span>
              <Badge variant={systemHealthData.errors?.recent > 0 ? "destructive" : "default"}>
                {systemHealthData.errors?.recent || 0}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Collections</span>
              <span className="text-sm text-muted-foreground">
                {systemHealthData.database?.collections || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.action}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Performance Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {performanceMetrics.successRate || 0}%
              </div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {performanceMetrics.avgResponseTime || 0}ms
              </div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {performanceMetrics.totalRequests || 0}
              </div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;