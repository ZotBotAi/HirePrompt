import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MobileNav } from '@/components/ui/mobile-nav';
import { useAuth } from '@/contexts/auth-context';

export function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  // Determine if we're on the landing page
  const isLanding = location === '/';
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <svg className="h-8 w-auto text-primary-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900">HirePrompt</span>
              </Link>
            </div>
            
            {isLanding && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="#features" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition">
                  Features
                </a>
                <a href="#howitworks" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition">
                  How It Works
                </a>
                <a href="#pricing" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition">
                  Pricing
                </a>
              </div>
            )}
            
            {!isLanding && user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${location === '/dashboard' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} text-sm font-medium leading-5 transition`}>
                  Dashboard
                </Link>
                <Link href="/resume-upload" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${location === '/resume-upload' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} text-sm font-medium leading-5 transition`}>
                  Upload Resume
                </Link>
                <Link href="/interview-questions" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 ${location.startsWith('/interview-questions') ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} text-sm font-medium leading-5 transition`}>
                  Interview Questions
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <div className="hidden sm:flex sm:items-center sm:ml-6">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${user.username || 'User'}&background=6366f1&color=fff`} alt={user.username || 'User'} />
                        <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="w-full cursor-pointer">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="w-full cursor-pointer">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/subscribe" className="w-full cursor-pointer">
                        Subscription
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex space-x-4">
                  <Button variant="outline" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign up</Link>
                  </Button>
                </div>
              )}
            </div>
            
            <MobileNav />
          </div>
        </div>
      </div>
    </nav>
  );
}
