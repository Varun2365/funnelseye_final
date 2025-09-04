import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit,
  Server,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import axios from 'axios';

const SystemSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [envVars, setEnvVars] = useState([]);
  const [newEnvVar, setNewEnvVar] = useState({ key: '', value: '', description: '' });
  const [addEnvDialogOpen, setAddEnvDialogOpen] = useState(false);
  const [editingEnvVar, setEditingEnvVar] = useState(null);

  useEffect(() => {
    fetchSettings();
    fetchEnvVars();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      console.log('⚙️ [SYSTEM_SETTINGS] Fetching system settings...');
      
      const response = await axios.get('/admin/system/settings');
      console.log('⚙️ [SYSTEM_SETTINGS] Settings received:', response.data);
      
      setSettings(response.data.data);
    } catch (error) {
      console.error('⚙️ [SYSTEM_SETTINGS] Error fetching settings:', error);
      setError('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnvVars = async () => {
    try {
      // This would be a custom endpoint to get environment variables
      // For now, we'll simulate with common env vars
      const commonEnvVars = [
        { key: 'NODE_ENV', value: process.env.NODE_ENV || 'development', description: 'Application environment' },
        { key: 'PORT', value: process.env.PORT || '8080', description: 'Server port' },
        { key: 'JWT_SECRET', value: '***hidden***', description: 'JWT secret key' },
        { key: 'MONGODB_URI', value: '***hidden***', description: 'MongoDB connection string' },
        { key: 'CORS_ORIGIN', value: process.env.CORS_ORIGIN || '*', description: 'CORS allowed origins' },
      ];
      setEnvVars(commonEnvVars);
    } catch (error) {
      console.error('Error fetching environment variables:', error);
    }
  };

  const handleSaveSettings = async (section, data) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      console.log('⚙️ [SYSTEM_SETTINGS] Saving settings for section:', section, data);
      
      const response = await axios.put('/admin/system/settings', {
        section,
        data
      });
      
      console.log('⚙️ [SYSTEM_SETTINGS] Settings saved:', response.data);
      setSuccess('Settings saved successfully');
      
      // Refresh settings
      fetchSettings();
    } catch (error) {
      console.error('⚙️ [SYSTEM_SETTINGS] Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEnvVar = async () => {
    try {
      if (!newEnvVar.key || !newEnvVar.value) {
        setError('Key and value are required');
        return;
      }

      // This would be a custom endpoint to add environment variables
      console.log('⚙️ [SYSTEM_SETTINGS] Adding new env var:', newEnvVar);
      
      setEnvVars(prev => [...prev, { ...newEnvVar, id: Date.now() }]);
      setNewEnvVar({ key: '', value: '', description: '' });
      setAddEnvDialogOpen(false);
      setSuccess('Environment variable added successfully');
    } catch (error) {
      console.error('Error adding environment variable:', error);
      setError('Failed to add environment variable');
    }
  };

  const handleDeleteEnvVar = async (key) => {
    if (!confirm(`Are you sure you want to delete the environment variable "${key}"?`)) {
      return;
    }

    try {
      console.log('⚙️ [SYSTEM_SETTINGS] Deleting env var:', key);
      
      setEnvVars(prev => prev.filter(env => env.key !== key));
      setSuccess('Environment variable deleted successfully');
    } catch (error) {
      console.error('Error deleting environment variable:', error);
      setError('Failed to delete environment variable');
    }
  };

  const handleEditEnvVar = (envVar) => {
    setEditingEnvVar(envVar);
    setNewEnvVar({ ...envVar });
    setAddEnvDialogOpen(true);
  };

  const handleUpdateEnvVar = async () => {
    try {
      if (!newEnvVar.key || !newEnvVar.value) {
        setError('Key and value are required');
        return;
      }

      console.log('⚙️ [SYSTEM_SETTINGS] Updating env var:', newEnvVar);
      
      setEnvVars(prev => prev.map(env => 
        env.key === editingEnvVar.key ? { ...newEnvVar } : env
      ));
      
      setNewEnvVar({ key: '', value: '', description: '' });
      setEditingEnvVar(null);
      setAddEnvDialogOpen(false);
      setSuccess('Environment variable updated successfully');
    } catch (error) {
      console.error('Error updating environment variable:', error);
      setError('Failed to update environment variable');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">System Settings</h1>
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
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and environment variables.
          </p>
        </div>
        <Button onClick={fetchSettings} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
              <CardDescription>
                Basic system configuration and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appName">Application Name</Label>
                  <Input
                    id="appName"
                    value={settings?.general?.appName || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev?.general, appName: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appVersion">Application Version</Label>
                  <Input
                    id="appVersion"
                    value={settings?.general?.appVersion || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev?.general, appVersion: e.target.value }
                    }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appDescription">Application Description</Label>
                <Textarea
                  id="appDescription"
                  value={settings?.general?.appDescription || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                      general: { ...prev?.general, appDescription: e.target.value }
                    }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={settings?.general?.maintenanceMode || false}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev?.general, maintenanceMode: checked }
                  }))}
                />
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              </div>

              <Button 
                onClick={() => handleSaveSettings('general', settings?.general)}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save General Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environment Variables */}
        <TabsContent value="environment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>Environment Variables</span>
              </CardTitle>
              <CardDescription>
                Manage environment variables and configuration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {envVars.length} environment variables configured
                </p>
                <Dialog open={addEnvDialogOpen} onOpenChange={setAddEnvDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Variable
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingEnvVar ? 'Edit Environment Variable' : 'Add Environment Variable'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingEnvVar ? 'Update the environment variable.' : 'Add a new environment variable to the system.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="envKey">Key</Label>
                        <Input
                          id="envKey"
                          value={newEnvVar.key}
                          onChange={(e) => setNewEnvVar(prev => ({ ...prev, key: e.target.value }))}
                          placeholder="e.g., API_KEY"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="envValue">Value</Label>
                        <Input
                          id="envValue"
                          value={newEnvVar.value}
                          onChange={(e) => setNewEnvVar(prev => ({ ...prev, value: e.target.value }))}
                          placeholder="e.g., your-secret-value"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="envDescription">Description</Label>
                        <Textarea
                          id="envDescription"
                          value={newEnvVar.description}
                          onChange={(e) => setNewEnvVar(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe what this variable is used for"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setAddEnvDialogOpen(false);
                        setEditingEnvVar(null);
                        setNewEnvVar({ key: '', value: '', description: '' });
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={editingEnvVar ? handleUpdateEnvVar : handleAddEnvVar}>
                        {editingEnvVar ? 'Update' : 'Add'} Variable
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {envVars.map((envVar, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {envVar.key}
                        </code>
                        <Badge variant="outline">{envVar.value}</Badge>
                      </div>
                      {envVar.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {envVar.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEnvVar(envVar)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEnvVar(envVar.key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>
                Configure security policies and authentication settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings?.security?.sessionTimeout || 30}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev?.security, sessionTimeout: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings?.security?.maxLoginAttempts || 5}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      security: { ...prev?.security, maxLoginAttempts: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requireEmailVerification"
                  checked={settings?.security?.requireEmailVerification || false}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev?.security, requireEmailVerification: checked }
                  }))}
                />
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableTwoFactor"
                  checked={settings?.security?.enableTwoFactor || false}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev?.security, enableTwoFactor: checked }
                  }))}
                />
                <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
              </div>

              <Button 
                onClick={() => handleSaveSettings('security', settings?.security)}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Settings */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Maintenance Settings</span>
              </CardTitle>
              <CardDescription>
                System maintenance and cleanup operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="logRetentionDays">Log Retention (days)</Label>
                  <Input
                    id="logRetentionDays"
                    type="number"
                    value={settings?.maintenance?.logRetentionDays || 30}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      maintenance: { ...prev?.maintenance, logRetentionDays: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency (hours)</Label>
                  <Input
                    id="backupFrequency"
                    type="number"
                    value={settings?.maintenance?.backupFrequency || 24}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      maintenance: { ...prev?.maintenance, backupFrequency: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoCleanup"
                  checked={settings?.maintenance?.autoCleanup || false}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    maintenance: { ...prev?.maintenance, autoCleanup: checked }
                  }))}
                />
                <Label htmlFor="autoCleanup">Enable Auto Cleanup</Label>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleSaveSettings('maintenance', settings?.maintenance)}
                  disabled={saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Maintenance Settings'}
                </Button>
                <Button variant="outline" onClick={() => {
                  // This would trigger a manual cleanup
                  console.log('Manual cleanup triggered');
                }}>
                  Run Cleanup Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;