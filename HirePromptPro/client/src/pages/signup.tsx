import { useState } from 'react';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest } from '@/lib/queryClient';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().optional()
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [, navigate] = useLocation();
  const location = useLocation()[0];
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Extract email from URL if present
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const emailFromURL = searchParams.get('email') || '';

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: emailFromURL,
      password: '',
      fullName: ''
    }
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/signup', data);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to sign up');
      }

      // Log in the user after successful signup
      const loginResponse = await apiRequest('POST', '/api/auth/login', {
        email: data.email,
        password: data.password
      });
      
      const loginResult = await loginResponse.json();
      
      if (!loginResponse.ok) {
        toast({
          title: 'Sign up successful',
          description: 'Your account has been created. Please log in.',
        });
        navigate('/login');
        return;
      }

      await login(loginResult.user, loginResult.session);
      
      toast({
        title: 'Sign up successful',
        description: 'Your account has been created and you are now logged in.',
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: 'Sign up failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="••••••••" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Sign up'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-500">
              Already have an account?{' '}
              <Link href="/login">
                <a className="text-primary-600 hover:text-primary-500 font-medium">
                  Log in
                </a>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
