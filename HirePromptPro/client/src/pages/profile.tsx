import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  Settings, 
  CreditCard, 
  Shield, 
  LogOut,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Profile update schema
const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  fullName: z.string().optional()
});

// Password update schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your new password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function Profile() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // Fetch subscription info
  const { data: subscription } = useQuery({
    queryKey: [user ? `/api/subscriptions/user/${user.id}` : null],
    enabled: !!user,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      fullName: user?.fullName || ''
    }
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  
  // Update profile form when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        username: user.username,
        email: user.email,
        fullName: user.fullName || ''
      });
    }
  }, [user, profileForm]);
  
  // Handle profile update
  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsUpdatingProfile(true);
    try {
      const response = await apiRequest('PATCH', `/api/users/${user.id}`, data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      updateUser(updatedUser);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  // Handle password update
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    if (!user) return;
    
    setIsUpdatingPassword(true);
    try {
      const response = await apiRequest('POST', '/api/auth/change-password', {
        userId: user.id,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }
      
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.',
      });
    } catch (error) {
      console.error('Password update error:', error);
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      const response = await apiRequest('DELETE', `/api/users/${user.id}`, undefined);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
      }
      
      await logout();
      
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted.',
      });
      
      navigate('/');
    } catch (error) {
      console.error('Account deletion error:', error);
      toast({
        title: 'Deletion failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };
  
  if (!isAuthenticated || !user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Profile</h1>
            <p className="mt-2 text-lg text-gray-500">
              Manage your account settings and preferences
            </p>
          </header>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarImage 
                        src={`https://ui-avatars.com/api/?name=${user.username || 'User'}&background=6366f1&color=fff&size=128`} 
                        alt={user.username} 
                      />
                      <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">{user.fullName || user.username}</h2>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="mt-2">
                      <Badge className="capitalize">{user.plan} Plan</Badge>
                    </div>
                  </div>
                  
                  <nav className="space-y-1">
                    <a 
                      href="#profile"
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary-50 text-primary-700"
                    >
                      <User className="mr-3 h-5 w-5" />
                      <span>Profile</span>
                    </a>
                    <a 
                      href="#subscription"
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <CreditCard className="mr-3 h-5 w-5" />
                      <span>Subscription</span>
                    </a>
                    <a 
                      href="#security"
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Shield className="mr-3 h-5 w-5" />
                      <span>Security</span>
                    </a>
                  </nav>
                  
                  <div className="mt-6 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={logout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main content */}
            <div className="lg:w-3/4 space-y-8">
              {/* Profile Section */}
              <Card id="profile">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and how others see you on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your public display name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormDescription>
                              We'll use this email to contact you.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Your full name helps personalize your experience.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        disabled={isUpdatingProfile || !profileForm.formState.isDirty}
                        className="flex items-center"
                      >
                        {isUpdatingProfile ? (
                          <>
                            <span className="mr-2">Updating...</span>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full" />
                          </>
                        ) : (
                          'Update Profile'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              {/* Subscription Section */}
              <Card id="subscription">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Subscription
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">Current Plan</h3>
                        <p className="text-sm text-gray-500">
                          You are currently on the <span className="font-medium capitalize">{user.plan}</span> plan
                        </p>
                      </div>
                      <Badge variant={user.plan === 'free' ? 'outline' : 'default'} className="capitalize">
                        {user.plan}
                      </Badge>
                    </div>
                  </div>
                  
                  {subscription && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Subscription Details</h3>
                      <dl className="divide-y divide-gray-200">
                        <div className="py-2 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="text-sm text-gray-900 flex items-center">
                            {subscription.status === 'active' ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                Active
                              </>
                            ) : subscription.status === 'trialing' ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
                                Trial
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                                {subscription.status}
                              </>
                            )}
                          </dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Current Period</dt>
                          <dd className="text-sm text-gray-900">
                            {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <Button 
                      variant={user.plan === 'free' ? 'default' : 'outline'} 
                      onClick={() => navigate('/subscribe')}
                    >
                      {user.plan === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                    </Button>
                    
                    {user.plan !== 'free' && (
                      <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Security Section */}
              <Card id="security">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Security
                  </CardTitle>
                  <CardDescription>
                    Manage your password and account security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="password">
                    <TabsList className="mb-6">
                      <TabsTrigger value="password">Change Password</TabsTrigger>
                      <TabsTrigger value="account">Account</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="password">
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Password must be at least 8 characters.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            disabled={isUpdatingPassword || !passwordForm.formState.isDirty}
                            className="flex items-center"
                          >
                            {isUpdatingPassword ? (
                              <>
                                <span className="mr-2">Updating...</span>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full" />
                              </>
                            ) : (
                              'Update Password'
                            )}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                    
                    <TabsContent value="account">
                      <div className="space-y-6">
                        <div className="border-b pb-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Account Management</h3>
                          <p className="text-sm text-gray-500">
                            Options for managing or deleting your account and data
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border border-red-200 rounded-lg bg-red-50">
                            <div>
                              <h4 className="font-medium text-red-800">Delete Account</h4>
                              <p className="text-sm text-red-600">
                                This will permanently delete your account and all associated data. This action cannot be undone.
                              </p>
                            </div>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="mt-4 sm:mt-0 bg-white text-red-600 hover:bg-red-100 hover:text-red-700"
                                >
                                  Delete Account
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your account
                                    and remove all of your data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={handleDeleteAccount} 
                                    className="bg-red-600 text-white hover:bg-red-700"
                                  >
                                    Yes, delete my account
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
