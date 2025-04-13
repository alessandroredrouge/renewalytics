
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Lock, 
  Bell, 
  Database, 
  Layout, 
  Share2, 
  Save,
  Cloud, 
  Sliders,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Settings = () => {
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-energy-blue">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your application preferences</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-4 grid grid-cols-2 md:grid-cols-6 lg:w-fit">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="data">Data Sources</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={18} />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>
                Manage your account profile and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue="Alex Johnson" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="alex@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" defaultValue="Energy Solutions Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" defaultValue="Energy Project Developer" />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock size={18} />
                <span>Security</span>
              </CardTitle>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable 2FA</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSave}>Update Security</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={18} />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive project updates via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">In-App Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications in the application</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Simulation Completion</p>
                    <p className="text-sm text-muted-foreground">Get notified when simulations complete</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Analysis Reports</p>
                    <p className="text-sm text-muted-foreground">Get notified when new analysis reports are available</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSave}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout size={18} />
                <span>Interface</span>
              </CardTitle>
              <CardDescription>
                Customize the application interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Enable dark mode for the application</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compact View</p>
                    <p className="text-sm text-muted-foreground">Display more content with reduced spacing</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-save</p>
                    <p className="text-sm text-muted-foreground">Automatically save your work</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time (ET)</SelectItem>
                    <SelectItem value="cst">Central Time (CT)</SelectItem>
                    <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                    <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select defaultValue="mdy">
                  <SelectTrigger id="dateFormat">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSave}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database size={18} />
                <span>Data Sources</span>
              </CardTitle>
              <CardDescription>
                Configure data sources for simulations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="marketData">Default Market Data Source</Label>
                <Select defaultValue="internal">
                  <SelectTrigger id="marketData">
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal Database</SelectItem>
                    <SelectItem value="custom">Custom Upload</SelectItem>
                    <SelectItem value="api">API Connection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weatherData">Weather Data Source</Label>
                <Select defaultValue="nrel">
                  <SelectTrigger id="weatherData">
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nrel">NREL Database</SelectItem>
                    <SelectItem value="nasa">NASA Power</SelectItem>
                    <SelectItem value="custom">Custom Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="techData">Technical Data Presets</Label>
                <Select defaultValue="lithium">
                  <SelectTrigger id="techData">
                    <SelectValue placeholder="Select preset database" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lithium">Lithium-Ion Battery</SelectItem>
                    <SelectItem value="flow">Flow Battery</SelectItem>
                    <SelectItem value="custom">Custom Parameters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataRetention">Data Retention Period</Label>
                <Select defaultValue="1y">
                  <SelectTrigger id="dataRetention">
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 Month</SelectItem>
                    <SelectItem value="6m">6 Months</SelectItem>
                    <SelectItem value="1y">1 Year</SelectItem>
                    <SelectItem value="forever">Indefinite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSave}>Save Data Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 size={18} />
                <span>API Integrations</span>
              </CardTitle>
              <CardDescription>
                Manage API keys and external service connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">NREL API</p>
                    <p className="text-sm text-muted-foreground">Connect to National Renewable Energy Laboratory</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">EIA Data</p>
                    <p className="text-sm text-muted-foreground">Connect to Energy Information Administration</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">ISO Market Data</p>
                    <p className="text-sm text-muted-foreground">Connect to ISO market data feeds</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weather API</p>
                    <p className="text-sm text-muted-foreground">Connect to weather data services</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
              <div className="pt-4">
                <Button onClick={handleSave}>Save Integration Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save size={18} />
                <span>Backup & Export</span>
              </CardTitle>
              <CardDescription>
                Manage your data backup and export options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Backup</p>
                    <p className="text-sm text-muted-foreground">Automatically backup your projects</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger id="backupFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Manual Backup</Label>
                  <Button variant="outline" className="flex items-center gap-2 w-full md:w-auto justify-center">
                    <Cloud size={16} />
                    <span>Backup All Projects</span>
                  </Button>
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                  <Label>Export Options</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Button variant="outline" className="flex items-center gap-2 justify-center">
                      <Download size={16} />
                      <span>Export as Excel</span>
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 justify-center">
                      <Download size={16} />
                      <span>Export as CSV</span>
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Import Data</Label>
                  <Button variant="outline" className="flex items-center gap-2 w-full justify-center">
                    <Upload size={16} />
                    <span>Import Project Data</span>
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSave}>Save Backup Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders size={18} />
                <span>Advanced Settings</span>
              </CardTitle>
              <CardDescription>
                Configure advanced application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Developer Mode</p>
                    <p className="text-sm text-muted-foreground">Enable additional debugging tools</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">High Performance Mode</p>
                    <p className="text-sm text-muted-foreground">Optimize for computation speed (uses more memory)</p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calculationMethod">Calculation Method</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger id="calculationMethod">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Precision</SelectItem>
                      <SelectItem value="high">High Precision</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxThreads">Max Processing Threads</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger id="maxThreads">
                      <SelectValue placeholder="Select thread count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (Recommended)</SelectItem>
                      <SelectItem value="1">1 Thread</SelectItem>
                      <SelectItem value="2">2 Threads</SelectItem>
                      <SelectItem value="4">4 Threads</SelectItem>
                      <SelectItem value="8">8 Threads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Danger Zone</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-destructive flex items-center gap-1">
                      <AlertTriangle size={16} />
                      <span>Clear All Data</span>
                    </p>
                    <p className="text-sm text-muted-foreground">Delete all projects and settings</p>
                  </div>
                  <Button variant="destructive" size="sm">Reset</Button>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSave}>Save Advanced Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
