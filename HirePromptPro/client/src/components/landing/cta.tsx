import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <div className="bg-primary-700">
      <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          <span className="block">Ready to transform your hiring process?</span>
          <span className="block">Start using HirePrompt today.</span>
        </h2>
        <p className="mt-4 text-lg leading-6 text-primary-200">
          Join thousands of recruiters and hiring managers who are making better hiring decisions with AI-powered interview questions.
        </p>
        <Link href="/signup">
          <a>
            <Button 
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 sm:w-auto"
              variant="outline"
              size="lg"
            >
              Sign up for free
            </Button>
          </a>
        </Link>
      </div>
    </div>
  );
}
