import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';

const MlmManagement = () => {
    const [commissionStructure, setCommissionStructure] = useState({});
    const [eligibilityRules, setEligibilityRules] = useState({});
    const [analytics, setAnalytics] = useState(null);
    const [pendingPayouts, setPendingPayouts] = useState([]);
    const [eligibilityReport, setEligibilityReport] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        fetchCommissionStructure();
        fetchAnalytics();
        fetchPendingPayouts();
        fetchEligibilityReport();
    }, []);

    const fetchCommissionStructure = async () => {
        try {
            const response = await axios.get('/api/admin/mlm/commission-structure');
            setCommissionStructure(response.data.data.commissionStructure);
            setEligibilityRules(response.data.data.eligibilityRules);
        } catch (error) {
            console.error('Error fetching commission structure:', error);
            showToast('Error fetching commission structure', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get('/api/admin/mlm/analytics');
            setAnalytics(response.data.data);
        } catch (error) {
            console.error('Error fetching MLM analytics:', error);
        }
    };

    const fetchPendingPayouts = async () => {
        try {
            const response = await axios.get('/api/admin/mlm/pending-payouts');
            setPendingPayouts(response.data.data);
        } catch (error) {
            console.error('Error fetching pending payouts:', error);
        }
    };

    const fetchEligibilityReport = async () => {
        try {
            const response = await axios.get('/api/admin/mlm/eligibility-report');
            setEligibilityReport(response.data.data.eligibilityReport);
        } catch (error) {
            console.error('Error fetching eligibility report:', error);
        }
    };

    const updateCommissionStructure = async () => {
        setSaving(true);
        try {
            const response = await axios.put('/api/admin/mlm/commission-structure', {
                commissionStructure,
                eligibilityRules
            });
            showToast('Commission structure updated successfully', 'success');
        } catch (error) {
            console.error('Error updating commission structure:', error);
            showToast('Error updating commission structure', 'error');
        } finally {
            setSaving(false);
        }
    };

    const processPayouts = async (payoutIds) => {
        try {
            const response = await axios.post('/api/admin/mlm/process-payouts', {
                payoutIds,
                payoutMethod: 'bank_transfer'
            });
            showToast('Payouts processed successfully', 'success');
            fetchPendingPayouts();
        } catch (error) {
            console.error('Error processing payouts:', error);
            showToast('Error processing payouts', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading MLM settings...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">MLM Management</h1>
                    <p className="text-muted-foreground">
                        Manage the 3-tier commission system, eligibility rules, and payout processing
                    </p>
                </div>
            </div>

            <Tabs defaultValue="commission" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="commission">Commission Structure</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="payouts">Payouts</TabsTrigger>
                    <TabsTrigger value="eligibility">Eligibility Report</TabsTrigger>
                </TabsList>

                <TabsContent value="commission" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Commission Structure</CardTitle>
                            <CardDescription>
                                Configure commission percentages for each level
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {Object.entries(commissionStructure).map(([level, percentage]) => (
                                    <div key={level} className="space-y-2">
                                        <Label htmlFor={level}>{level.toUpperCase()}</Label>
                                        <Input
                                            id={level}
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="100"
                                            value={percentage}
                                            onChange={(e) => 
                                                setCommissionStructure({
                                                    ...commissionStructure,
                                                    [level]: parseFloat(e.target.value)
                                                })
                                            }
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <Button onClick={updateCommissionStructure} disabled={saving}>
                                    {saving ? "Saving..." : "Save Commission Structure"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Eligibility Rules</CardTitle>
                            <CardDescription>
                                Configure minimum requirements for commission eligibility
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="minLevel">Minimum Coach Level</Label>
                                    <Input
                                        id="minLevel"
                                        type="number"
                                        min="1"
                                        value={eligibilityRules.minimumCoachLevel || 1}
                                        onChange={(e) => 
                                            setEligibilityRules({
                                                ...eligibilityRules,
                                                minimumCoachLevel: parseInt(e.target.value)
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minRating">Minimum Performance Rating</Label>
                                    <Input
                                        id="minRating"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        value={eligibilityRules.minimumPerformanceRating || 3.0}
                                        onChange={(e) => 
                                            setEligibilityRules({
                                                ...eligibilityRules,
                                                minimumPerformanceRating: parseFloat(e.target.value)
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minDays">Minimum Active Days</Label>
                                    <Input
                                        id="minDays"
                                        type="number"
                                        min="0"
                                        value={eligibilityRules.minimumActiveDays || 30}
                                        onChange={(e) => 
                                            setEligibilityRules({
                                                ...eligibilityRules,
                                                minimumActiveDays: parseInt(e.target.value)
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minRevenue">Minimum Monthly Revenue</Label>
                                    <Input
                                        id="minRevenue"
                                        type="number"
                                        min="0"
                                        value={eligibilityRules.minimumMonthlyRevenue || 100}
                                        onChange={(e) => 
                                            setEligibilityRules({
                                                ...eligibilityRules,
                                                minimumMonthlyRevenue: parseInt(e.target.value)
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>MLM Performance Analytics</CardTitle>
                            <CardDescription>
                                Overview of commission distributions and coach performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {analytics ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">${analytics.commissionStats.totalCommissions?.toFixed(2) || 0}</div>
                                            <div className="text-sm text-muted-foreground">Total Commissions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">{analytics.commissionStats.totalDistributions || 0}</div>
                                            <div className="text-sm text-muted-foreground">Total Distributions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">${analytics.commissionStats.averageCommission?.toFixed(2) || 0}</div>
                                            <div className="text-sm text-muted-foreground">Average Commission</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Top Performing Coaches</h3>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Level</TableHead>
                                                    <TableHead>Revenue</TableHead>
                                                    <TableHead>Team Size</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {analytics.coachPerformance?.map((coach) => (
                                                    <TableRow key={coach._id}>
                                                        <TableCell>{coach.firstName} {coach.lastName}</TableCell>
                                                        <TableCell>{coach.level}</TableCell>
                                                        <TableCell>${coach.totalRevenue?.toFixed(2) || 0}</TableCell>
                                                        <TableCell>{coach.teamSize || 0}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No analytics data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payouts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Payouts</CardTitle>
                            <CardDescription>
                                Process commission payouts for eligible coaches
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingPayouts.length > 0 ? (
                                <div className="space-y-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Coach</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Level</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pendingPayouts.map((payout) => (
                                                <TableRow key={payout._id}>
                                                    <TableCell>
                                                        {payout.coachId?.firstName} {payout.coachId?.lastName}
                                                    </TableCell>
                                                    <TableCell>${payout.amount?.toFixed(2)}</TableCell>
                                                    <TableCell>{payout.level}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{payout.status}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => processPayouts([payout._id])}
                                                        >
                                                            Process
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    
                                    <div className="flex justify-end">
                                        <Button onClick={() => processPayouts(pendingPayouts.map(p => p._id))}>
                                            Process All Payouts
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No pending payouts
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="eligibility" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Commission Eligibility Report</CardTitle>
                            <CardDescription>
                                Review coach eligibility for commission payments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {eligibilityReport.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Coach</TableHead>
                                            <TableHead>Level</TableHead>
                                            <TableHead>Rating</TableHead>
                                            <TableHead>Revenue</TableHead>
                                            <TableHead>Eligible</TableHead>
                                            <TableHead>Reasons</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {eligibilityReport.map((coach) => (
                                            <TableRow key={coach.coachId}>
                                                <TableCell>{coach.name}</TableCell>
                                                <TableCell>{coach.level}</TableCell>
                                                <TableCell>{coach.performanceRating}</TableCell>
                                                <TableCell>${coach.monthlyRevenue}</TableCell>
                                                <TableCell>
                                                    <Badge variant={coach.isEligible ? "default" : "destructive"}>
                                                        {coach.isEligible ? "Yes" : "No"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {coach.reasons.length > 0 ? (
                                                        <div className="text-sm text-muted-foreground">
                                                            {coach.reasons.join(', ')}
                                                        </div>
                                                    ) : (
                                                        <span className="text-green-600">All requirements met</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    No eligibility data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MlmManagement;
