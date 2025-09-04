import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';

const FinancialDashboard = () => {
    const [creditSystem, setCreditSystem] = useState({});
    const [creditPackages, setCreditPackages] = useState([]);
    const [revenueAnalytics, setRevenueAnalytics] = useState(null);
    const [paymentFailures, setPaymentFailures] = useState(null);
    const [gatewayMarkup, setGatewayMarkup] = useState(null);
    const [creditUsage, setCreditUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [timeRange, setTimeRange] = useState(30);
    const { showToast } = useToast();

    useEffect(() => {
        fetchAllData();
    }, [timeRange]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchCreditSystem(),
                fetchCreditPackages(),
                fetchRevenueAnalytics(),
                fetchPaymentFailures(),
                fetchGatewayMarkup(),
                fetchCreditUsage()
            ]);
        } catch (error) {
            console.error('Error fetching financial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCreditSystem = async () => {
        try {
            const response = await axios.get('/api/admin/financial/credit-system');
            setCreditSystem(response.data.data);
        } catch (error) {
            console.error('Error fetching credit system:', error);
        }
    };

    const fetchCreditPackages = async () => {
        try {
            const response = await axios.get('/api/admin/financial/credit-packages');
            setCreditPackages(response.data.data);
        } catch (error) {
            console.error('Error fetching credit packages:', error);
        }
    };

    const fetchRevenueAnalytics = async () => {
        try {
            const response = await axios.get(`/api/admin/financial/revenue-analytics?timeRange=${timeRange}`);
            setRevenueAnalytics(response.data.data);
        } catch (error) {
            console.error('Error fetching revenue analytics:', error);
        }
    };

    const fetchPaymentFailures = async () => {
        try {
            const response = await axios.get(`/api/admin/financial/payment-failures?timeRange=${timeRange}`);
            setPaymentFailures(response.data.data);
        } catch (error) {
            console.error('Error fetching payment failures:', error);
        }
    };

    const fetchGatewayMarkup = async () => {
        try {
            const response = await axios.get(`/api/admin/financial/gateway-markup?timeRange=${timeRange}`);
            setGatewayMarkup(response.data.data);
        } catch (error) {
            console.error('Error fetching gateway markup:', error);
        }
    };

    const fetchCreditUsage = async () => {
        try {
            const response = await axios.get(`/api/admin/financial/credit-usage?timeRange=${timeRange}`);
            setCreditUsage(response.data.data);
        } catch (error) {
            console.error('Error fetching credit usage:', error);
        }
    };

    const updateCreditSystem = async () => {
        setSaving(true);
        try {
            const response = await axios.put('/api/admin/financial/credit-system', creditSystem);
            showToast('Credit system updated successfully', 'success');
            await fetchCreditSystem();
        } catch (error) {
            console.error('Error updating credit system:', error);
            showToast('Error updating credit system', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading financial data...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage credit systems, revenue analytics, and payment processing
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="timeRange">Time Range:</Label>
                    <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(parseInt(value))}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="credit-system">Credit System</TabsTrigger>
                    <TabsTrigger value="packages">Credit Packages</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
                    <TabsTrigger value="failures">Payment Failures</TabsTrigger>
                    <TabsTrigger value="gateway">Gateway Markup</TabsTrigger>
                    <TabsTrigger value="usage">Credit Usage</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${revenueAnalytics?.paymentStats?.totalRevenue?.toFixed(2) || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Last {timeRange} days
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">MRR</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${revenueAnalytics?.mrr?.toFixed(2) || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Monthly Recurring Revenue
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {paymentFailures?.failedPayments?.length || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Last {timeRange} days
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="credit-system" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Credit System Configuration</CardTitle>
                            <CardDescription>
                                Configure credit types, pricing, and markup settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(creditSystem.creditTypes || {}).map(([type, config]) => (
                                    <div key={type} className="space-y-2">
                                        <Label htmlFor={`${type}-base`}>{config.name} Base Price</Label>
                                        <Input
                                            id={`${type}-base`}
                                            type="number"
                                            step="0.001"
                                            min="0"
                                            value={config.basePrice}
                                            onChange={(e) => 
                                                setCreditSystem({
                                                    ...creditSystem,
                                                    creditTypes: {
                                                        ...creditSystem.creditTypes,
                                                        [type]: {
                                                            ...config,
                                                            basePrice: parseFloat(e.target.value)
                                                        }
                                                    }
                                                })
                                            }
                                        />
                                        <Label htmlFor={`${type}-markup`}>Markup</Label>
                                        <Input
                                            id={`${type}-markup`}
                                            type="number"
                                            step="0.001"
                                            min="0"
                                            value={config.markup}
                                            onChange={(e) => 
                                                setCreditSystem({
                                                    ...creditSystem,
                                                    creditTypes: {
                                                        ...creditSystem.creditTypes,
                                                        [type]: {
                                                            ...config,
                                                            markup: parseFloat(e.target.value)
                                                        }
                                                    }
                                                })
                                            }
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <Button onClick={updateCreditSystem} disabled={saving}>
                                    {saving ? "Saving..." : "Save Credit System"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="packages" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Credit Packages</CardTitle>
                            <CardDescription>
                                Manage credit packages and pricing tiers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Package</TableHead>
                                        <TableHead>AI Credits</TableHead>
                                        <TableHead>WhatsApp Credits</TableHead>
                                        <TableHead>Email Credits</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Auto Recharge</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {creditPackages.map((pkg) => (
                                        <TableRow key={pkg.id}>
                                            <TableCell className="font-medium">{pkg.name}</TableCell>
                                            <TableCell>{pkg.aiCredits.toLocaleString()}</TableCell>
                                            <TableCell>{pkg.whatsappCredits.toLocaleString()}</TableCell>
                                            <TableCell>{pkg.emailCredits.toLocaleString()}</TableCell>
                                            <TableCell>${pkg.price}</TableCell>
                                            <TableCell>
                                                <Badge variant={pkg.autoRecharge ? "default" : "secondary"}>
                                                    {pkg.autoRecharge ? "Yes" : "No"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Analytics</CardTitle>
                            <CardDescription>
                                Detailed revenue breakdown and subscription analytics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {revenueAnalytics ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">
                                                ${revenueAnalytics.paymentStats.totalRevenue?.toFixed(2) || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Total Revenue</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">
                                                {revenueAnalytics.paymentStats.totalPayments || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Total Payments</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">
                                                ${revenueAnalytics.paymentStats.averagePayment?.toFixed(2) || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Average Payment</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Subscription Analytics</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Plan Type</TableHead>
                                                    <TableHead>Count</TableHead>
                                                    <TableHead>Total Revenue</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {revenueAnalytics.subscriptionStats?.map((stat) => (
                                                    <TableRow key={stat._id}>
                                                        <TableCell className="font-medium">{stat._id}</TableCell>
                                                        <TableCell>{stat.count}</TableCell>
                                                        <TableCell>${stat.totalRevenue?.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                ${revenueAnalytics.mrr?.toFixed(2) || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Monthly Recurring Revenue</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">
                                                {revenueAnalytics.churnStats.churnedCount || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Churned Subscriptions</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No revenue data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="failures" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Failures</CardTitle>
                            <CardDescription>
                                Monitor and analyze payment failures and retry attempts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {paymentFailures ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">
                                                {paymentFailures.failedPayments?.length || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Failed Payments</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {paymentFailures.retryStats.totalRetries || 0}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Total Retries</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Failure Reasons</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Reason</TableHead>
                                                    <TableHead>Count</TableHead>
                                                    <TableHead>Total Amount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {paymentFailures.failedPayments?.map((failure) => (
                                                    <TableRow key={failure._id}>
                                                        <TableCell className="font-medium">{failure._id}</TableCell>
                                                        <TableCell>{failure.count}</TableCell>
                                                        <TableCell>${failure.totalAmount?.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No payment failure data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="gateway" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gateway Markup Analytics</CardTitle>
                            <CardDescription>
                                Monitor payment gateway performance and markup earnings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {gatewayMarkup ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Gateway</TableHead>
                                            <TableHead>Total Amount</TableHead>
                                            <TableHead>Total Payments</TableHead>
                                            <TableHead>Total Fees</TableHead>
                                            <TableHead>Markup %</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {gatewayMarkup.gatewayStats?.map((gateway) => (
                                            <TableRow key={gateway._id}>
                                                <TableCell className="font-medium">{gateway._id}</TableCell>
                                                <TableCell>${gateway.totalAmount?.toFixed(2)}</TableCell>
                                                <TableCell>{gateway.totalPayments}</TableCell>
                                                <TableCell>${gateway.totalFees?.toFixed(2)}</TableCell>
                                                <TableCell>{gateway.markupPercentage?.toFixed(2)}%</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No gateway markup data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="usage" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Credit Usage Analytics</CardTitle>
                            <CardDescription>
                                Monitor credit consumption patterns and usage trends
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {creditUsage ? (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Top Credit Users</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Coach</TableHead>
                                                    <TableHead>AI Credits</TableHead>
                                                    <TableHead>WhatsApp Credits</TableHead>
                                                    <TableHead>Email Credits</TableHead>
                                                    <TableHead>Total Used</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {creditUsage.creditUsage?.map((user) => (
                                                    <TableRow key={user._id}>
                                                        <TableCell className="font-medium">
                                                            {user.firstName} {user.lastName}
                                                        </TableCell>
                                                        <TableCell>{user.aiCredits || 0}</TableCell>
                                                        <TableCell>{user.whatsappCredits || 0}</TableCell>
                                                        <TableCell>{user.emailCredits || 0}</TableCell>
                                                        <TableCell>{user.totalCreditsUsed || 0}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No credit usage data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default FinancialDashboard;
