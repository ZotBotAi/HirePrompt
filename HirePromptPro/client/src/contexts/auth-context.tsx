import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, getCurrentUser, getSession, signOut } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  plan: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  supabaseId?: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, session: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session and user on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check for existing session
        const { data: { session } } = await getSession();
        
        if (!session) {
          setIsLoading(false);
          return;
        }
        
        // Get the user data from our API
        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Clear any invalid session
          await signOut();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        toast({
          title: 'Authentication Error',
          description: 'There was an error with your authentication. Please log in again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'SIGNED_IN' && session) {
          try {
            // Get the user data from our API
            const response = await fetch('/api/auth/user', {
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            });
            
            if (response.ok) {
              const userData = await response.json();
              setUser(userData);
            }
          } catch (error) {
            console.error('Error getting user after auth change:', error);
          }
        }
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [toast]);
  
  const login = async (user: User, session: any) => {
    setUser(user);
  };
  
  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: 'Logout failed',
        description: 'There was an error logging you out. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
