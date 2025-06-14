import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  Bell, 
  Shield, 
  Eye, 
  Moon,
  Sun,
  Globe,
  Smartphone,
  Mail,
  MessageCircle,
  Heart,
  User,
  Lock,
  Trash2,
  AlertTriangle,
  Check,
  Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: {
        newMatches: true,
        messages: true,
        propertyUpdates: true,
        marketing: false,
        weeklyDigest: true
      },
      push: {
        newMatches: true,
        messages: true,
        propertyUpdates: false,
        marketing: false
      },
      sms: {
        messages: false,
        emergencyOnly: true
      }
    },
    privacy: {
      profileVisibility: 'public', // public, friends, private
      showOnlineStatus: true,
      showLastSeen: false,
      allowMessageRequests: true,
      showPhoneNumber: false,
      showEmail: false
    },
    discovery: {
      showMeInDiscovery: true,
      maxDistance: 50,
      ageRange: { min: 18, max: 35 },
      autoLike: false,
      pauseDiscovery: false
    },
    account: {
      twoFactorEnabled: false,
      loginAlerts: true,
      dataDownload: false,
      accountDeletion: false
    },
    appearance: {
      theme: 'light', // light, dark, system
      language: 'en',
      timezone: 'America/Los_Angeles'
    }
  });

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleNestedSettingChange = (category: string, subcategory: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [subcategory]: {
          ...prev[category as keyof typeof prev][subcategory as any],
          [setting]: value
        }
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would save to the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    // This would show a confirmation dialog and handle account deletion
    toast.error('Account deletion is not implemented yet');
  };

  const handleDataDownload = () => {
    // This would trigger a data export
    toast.success('Data download request submitted');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Manage your account preferences</p>
              </div>
            </div>
            <Button onClick={handleSaveSettings} disabled={isLoading} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <Tabs defaultValue="notifications" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto">
            <TabsTrigger value="notifications" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Notify</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs sm:text-sm">Privacy</TabsTrigger>
            <TabsTrigger value="discovery" className="text-xs sm:text-sm">Discovery</TabsTrigger>
            <TabsTrigger value="account" className="text-xs sm:text-sm">Account</TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs sm:text-sm col-span-2 sm:col-span-1">
              <span className="hidden sm:inline">Appearance</span>
              <span className="sm:hidden">Theme</span>
            </TabsTrigger>
          </TabsList>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Email Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.notifications.email).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <p className="text-xs text-gray-600">
                        {key === 'newMatches' && 'Get notified when you have new roommate matches'}
                        {key === 'messages' && 'Receive email notifications for new messages'}
                        {key === 'propertyUpdates' && 'Updates about properties you\'re interested in'}
                        {key === 'marketing' && 'Promotional emails and feature updates'}
                        {key === 'weeklyDigest' && 'Weekly summary of your activity'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => 
                        handleNestedSettingChange('notifications', 'email', key, checked)
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5" />
                  <span>Push Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.notifications.push).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => 
                        handleNestedSettingChange('notifications', 'push', key, checked)
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Profile Privacy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Profile Visibility</Label>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="public">Public - Anyone can see your profile</option>
                    <option value="friends">Friends Only - Only matched users can see details</option>
                    <option value="private">Private - Hidden from discovery</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Show Online Status</Label>
                    <p className="text-xs text-gray-600">Let others see when you're online</p>
                  </div>
                  <Switch
                    checked={settings.privacy.showOnlineStatus}
                    onCheckedChange={(checked) => 
                      handleSettingChange('privacy', 'showOnlineStatus', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Show Last Seen</Label>
                    <p className="text-xs text-gray-600">Display when you were last active</p>
                  </div>
                  <Switch
                    checked={settings.privacy.showLastSeen}
                    onCheckedChange={(checked) => 
                      handleSettingChange('privacy', 'showLastSeen', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Allow Message Requests</Label>
                    <p className="text-xs text-gray-600">Let unmatched users send you messages</p>
                  </div>
                  <Switch
                    checked={settings.privacy.allowMessageRequests}
                    onCheckedChange={(checked) => 
                      handleSettingChange('privacy', 'allowMessageRequests', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discovery Settings */}
          <TabsContent value="discovery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Discovery Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Show Me in Discovery</Label>
                    <p className="text-xs text-gray-600">Allow others to find your profile</p>
                  </div>
                  <Switch
                    checked={settings.discovery.showMeInDiscovery}
                    onCheckedChange={(checked) => 
                      handleSettingChange('discovery', 'showMeInDiscovery', checked)
                    }
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Maximum Distance (miles)</Label>
                  <Input
                    type="number"
                    value={settings.discovery.maxDistance}
                    onChange={(e) => 
                      handleSettingChange('discovery', 'maxDistance', parseInt(e.target.value))
                    }
                    className="mt-1"
                    min="1"
                    max="100"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Pause Discovery</Label>
                    <p className="text-xs text-gray-600">Temporarily hide your profile</p>
                  </div>
                  <Switch
                    checked={settings.discovery.pauseDiscovery}
                    onCheckedChange={(checked) => 
                      handleSettingChange('discovery', 'pauseDiscovery', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Account Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                    <p className="text-xs text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Switch
                    checked={settings.account.twoFactorEnabled}
                    onCheckedChange={(checked) => 
                      handleSettingChange('account', 'twoFactorEnabled', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Login Alerts</Label>
                    <p className="text-xs text-gray-600">Get notified of new login attempts</p>
                  </div>
                  <Switch
                    checked={settings.account.loginAlerts}
                    onCheckedChange={(checked) => 
                      handleSettingChange('account', 'loginAlerts', checked)
                    }
                  />
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handleDataDownload}
                    className="w-full mb-3"
                  >
                    Download My Data
                  </Button>
                  
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <div className="flex items-center justify-between">
                        <span>Delete your account permanently</span>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={handleDeleteAccount}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sun className="w-5 h-5" />
                  <span>Appearance & Language</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Theme</Label>
                  <select
                    value={settings.appearance.theme}
                    onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Language</Label>
                  <select
                    value={settings.appearance.language}
                    onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Timezone</Label>
                  <select
                    value={settings.appearance.timezone}
                    onChange={(e) => handleSettingChange('appearance', 'timezone', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/New_York">Eastern Time</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
