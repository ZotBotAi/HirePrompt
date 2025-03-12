import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';

export function Hero() {
  const [email, setEmail] = useState('');
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/signup?email=' + encodeURIComponent(email));
  };

  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>
          <div className="pt-10 sm:pt-16 lg:pt-8 xl:pt-16">
            <div className="sm:text-center lg:text-left px-4 sm:px-8 xl:pr-16">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Turn Resumes into</span>
                <span className="block text-primary-600">Interview Questions</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0">
                HirePrompt analyzes resumes and job specifications to generate tailored interview questions, helping recruiters conduct more effective interviews and make better hiring decisions.
              </p>
              <div className="mt-8 sm:mt-10">
                {user ? (
                  <div className="sm:flex sm:justify-center lg:justify-start">
                    <Link href="/dashboard">
                      <a>
                        <Button size="lg" className="px-8 py-3 text-base">
                          Go to Dashboard
                        </Button>
                      </a>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="sm:max-w-xl sm:mx-auto lg:mx-0">
                    <div className="sm:flex">
                      <div className="min-w-0 flex-1">
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          className="block w-full px-4 py-3 rounded-md text-sm"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mt-3 sm:mt-0 sm:ml-3">
                        <Button 
                          type="submit" 
                          className="block w-full py-3 px-4"
                        >
                          Get Started Free
                        </Button>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                      Start your 14-day free trial. No credit card required.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1590650046871-92c887180603?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
          alt="People interviewing candidates"
        />
      </div>
    </div>
  );
}
