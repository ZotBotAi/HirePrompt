import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pt-10">
        <div className="flex flex-col gap-4">
          <Link href="/">
            <a onClick={() => setOpen(false)} className="text-lg font-semibold">
              Home
            </a>
          </Link>
          <Link href="/#features">
            <a onClick={() => setOpen(false)} className="text-lg">
              Features
            </a>
          </Link>
          <Link href="/#howitworks">
            <a onClick={() => setOpen(false)} className="text-lg">
              How It Works
            </a>
          </Link>
          <Link href="/#pricing">
            <a onClick={() => setOpen(false)} className="text-lg">
              Pricing
            </a>
          </Link>
          
          <div className="border-t my-4"></div>
          
          {user ? (
            <>
              <Link href="/dashboard">
                <a onClick={() => setOpen(false)} className="text-lg">
                  Dashboard
                </a>
              </Link>
              <Link href="/upload-resume">
                <a onClick={() => setOpen(false)} className="text-lg">
                  Upload Resume
                </a>
              </Link>
              <Link href="/profile">
                <a onClick={() => setOpen(false)} className="text-lg">
                  My Profile
                </a>
              </Link>
              <Button 
                variant="destructive" 
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <a onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">Log in</Button>
                </a>
              </Link>
              <Link href="/signup">
                <a onClick={() => setOpen(false)}>
                  <Button className="w-full">Sign up</Button>
                </a>
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
