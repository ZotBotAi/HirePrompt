import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export function DashboardPreview() {
  return (
    <div className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Powerful Dashboard
            </h2>
            <p className="mt-3 max-w-3xl text-lg text-gray-500">
              Manage all your interview questions, candidate assessments, and job specifications in one place with our intuitive dashboard.
            </p>
            <div className="mt-8 sm:flex">
              <div className="rounded-md shadow">
                <Link href="/signup">
                  <a>
                    <Button size="lg">
                      Try It Free
                    </Button>
                  </a>
                </Link>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <a href="#" className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Watch Demo
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10 lg:mt-0 rounded-lg shadow-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
              alt="Dashboard preview" 
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
