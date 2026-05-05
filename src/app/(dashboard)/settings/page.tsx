'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Lock, Bell, LogOut, Loader } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { logoutUser } from '@/lib/auth';
import { getUserRole } from '@/lib/roleGuard';

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    timezone: 'UTC-5',
    language: 'English',
  });

  useEffect(() => {
    // Load user settings from localStorage (from login response or user profile)
    const userEmail = localStorage.getItem('user_email') || 'User';
    const firstName = localStorage.getItem('user_firstName') || 'Admin';
    const lastName = localStorage.getItem('user_lastName') || 'User';
    const phone = localStorage.getItem('user_phone') || '+1-234-567-8900';
    
    setSettings(prev => ({
      ...prev,
      firstName,
      lastName,
      email: userEmail,
      phone,
    }));
    setIsLoading(false);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save - in production, you would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  const handleLogout = async () => {
    logout();
    logoutUser();
    router.push('/login');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background p-8'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-8'>
        <div className='p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg'>
          <Settings className='text-white' size={28} />
        </div>
        <div>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
            Settings
          </h1>
          <p className='text-muted-foreground'>Manage your account and preferences</p>
        </div>
      </div>

      {/* Settings Card */}
      <div className='bg-card rounded-xl border border-border backdrop-blur-xl overflow-hidden shadow-2xl'>
        <Tabs defaultValue='profile' className='w-full'>
          {/* Tab Navigation */}
          <TabsList className='w-full bg-card border-b border-border rounded-none p-0 grid grid-cols-3 lg:grid-cols-4'>
            <TabsTrigger value='profile' className='rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-card flex items-center gap-2'>
              <User size={16} />
              <span className='hidden sm:inline'>Profile</span>
            </TabsTrigger>
            <TabsTrigger value='security' className='rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-card flex items-center gap-2'>
              <Lock size={16} />
              <span className='hidden sm:inline'>Security</span>
            </TabsTrigger>
            <TabsTrigger value='notifications' className='rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-card flex items-center gap-2'>
              <Bell size={16} />
              <span className='hidden sm:inline'>Alerts</span>
            </TabsTrigger>
            <TabsTrigger value='account' className='rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-card flex items-center gap-2'>
              <LogOut size={16} />
              <span className='hidden sm:inline'>Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value='profile' className='p-6 space-y-6'>
            <div>
              <h3 className='text-lg font-semibold text-muted-foreground mb-4'>Personal Information</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-2'>First Name</label>
                  <Input
                    value={settings.firstName}
                    onChange={(e) => setSettings({ ...settings, firstName: e.target.value })}
                    className='bg-card border-border text-muted-foreground'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-2'>Last Name</label>
                  <Input
                    value={settings.lastName}
                    onChange={(e) => setSettings({ ...settings, lastName: e.target.value })}
                    className='bg-card border-border text-muted-foreground'
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className='text-lg font-semibold text-muted-foreground mb-4'>Contact Information</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-2'>Email</label>
                  <Input
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className='bg-card border-border text-muted-foreground'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-2'>Phone</label>
                  <Input
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className='bg-card border-border text-muted-foreground'
                  />
                </div>
              </div>
            </div>

            <div className='pt-4'>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value='security' className='p-6 space-y-6'>
            <div>
              <h3 className='text-lg font-semibold text-muted-foreground mb-4'>Change Password</h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-2'>Current Password</label>
                  <Input
                    type='password'
                    placeholder='Enter current password'
                    className='bg-card border-border text-muted-foreground'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-2'>New Password</label>
                  <Input
                    type='password'
                    placeholder='Enter new password'
                    className='bg-card border-border text-muted-foreground'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-muted-foreground mb-2'>Confirm Password</label>
                  <Input
                    type='password'
                    placeholder='Confirm new password'
                    className='bg-card border-border text-muted-foreground'
                  />
                </div>
              </div>
              <div className='pt-4'>
                <Button className='bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'>
                  Update Password
                </Button>
              </div>
            </div>

            <div className='border-t border-border pt-6'>
              <h3 className='text-lg font-semibold text-muted-foreground mb-4'>Two-Factor Authentication</h3>
              <p className='text-sm text-muted-foreground mb-4'>Add an extra layer of security to your account</p>
              <Button className='bg-card border border-border text-muted-foreground hover:bg-card'>
                Enable 2FA
              </Button>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value='notifications' className='p-6 space-y-6'>
            <div>
              <h3 className='text-lg font-semibold text-muted-foreground mb-4'>Alert Preferences</h3>
              <div className='space-y-4'>
                {[
                  { label: 'Employee Updates', desc: 'Get notified on new employee additions' },
                  { label: 'Attendance Alerts', desc: 'Receive alerts for attendance issues' },
                  { label: 'System Notifications', desc: 'Important system updates' },
                  { label: 'Weekly Reports', desc: 'Receive weekly summary reports' },
                ].map((item) => (
                  <div key={item.label} className='flex items-center justify-between p-4 bg-card rounded-lg border border-border'>
                    <div>
                      <p className='text-sm font-medium text-muted-foreground'>{item.label}</p>
                      <p className='text-xs text-muted-foreground'>{item.desc}</p>
                    </div>
                    <input
                      type='checkbox'
                      defaultChecked
                      className='w-4 h-4 rounded cursor-pointer'
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value='account' className='p-6 space-y-6'>
            <div>
              <h3 className='text-lg font-semibold text-muted-foreground mb-4'>Account Management</h3>
              <div className='space-y-3'>
                <div className='p-4 bg-card rounded-lg border border-border'>
                  <p className='text-sm text-muted-foreground mb-3'>
                    <strong>Account Status:</strong> <span className='text-emerald-400'>Active</span>
                  </p>
                  <p className='text-sm text-muted-foreground mb-3'>
                    <strong>Member Since:</strong> January 15, 2024
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    <strong>Last Login:</strong> Today at 10:30 AM
                  </p>
                </div>
              </div>
            </div>

            <div className='border-t border-border pt-6'>
              <h3 className='text-lg font-semibold text-muted-foreground mb-4'>Danger Zone</h3>
              <Button
                onClick={handleLogout}
                className='bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white gap-2'
              >
                <LogOut size={16} />
                Logout
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
