import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Upload, FileText, Search, Calendar, Settings } from 'lucide-react';
import { Link } from 'wouter';

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch resumes
  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: [user ? `/api/resumes/user/${user.id}` : null],
    enabled: !!user,
  });
  
  // Fetch job specs
  const { data: jobSpecs, isLoading: jobSpecsLoading } = useQuery({
    queryKey: [user ? `/api/job-specs/user/${user.id}` : null],
    enabled: !!user,
  });
  
  // Fetch interview questions
  const { data: interviewQuestions, isLoading: questionsLoading } = useQuery({
    queryKey: [user ? `/api/interview-questions/user/${user.id}` : null],
    enabled: !!user,
  });
  
  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <p className="mt-2 text-lg text-gray-500">
              Welcome back, {user?.fullName || user?.username}
            </p>
          </header>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Resumes</p>
                    <p className="text-3xl font-bold">{resumesLoading ? '...' : resumes?.length || 0}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Job Specs</p>
                    <p className="text-3xl font-bold">{jobSpecsLoading ? '...' : jobSpecs?.length || 0}</p>
                  </div>
                  <Search className="h-8 w-8 text-primary-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Interview Questions</p>
                    <p className="text-3xl font-bold">{questionsLoading ? '...' : interviewQuestions?.length || 0}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-primary-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Plan</p>
                    <p className="text-3xl font-bold capitalize">{user?.plan || 'Free'}</p>
                  </div>
                  <Settings className="h-8 w-8 text-primary-500" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="actions">
            <TabsList className="mb-6">
              <TabsTrigger value="actions">Quick Actions</TabsTrigger>
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="actions">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Upload className="h-5 w-5" />
                      <span>Upload Resume</span>
                    </CardTitle>
                    <CardDescription>
                      Upload candidate resumes to start the analysis process.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/upload-resume">
                      <a>
                        <Button className="w-full">Upload Resume</Button>
                      </a>
                    </Link>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Search className="h-5 w-5" />
                      <span>Create Job Spec</span>
                    </CardTitle>
                    <CardDescription>
                      Define job requirements to match with candidate resumes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">Create Job Spec</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Generate Questions</span>
                    </CardTitle>
                    <CardDescription>
                      Generate tailored interview questions for candidates.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/interview-questions">
                      <a>
                        <Button className="w-full" variant="outline">Generate Questions</Button>
                      </a>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="recent">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent actions and activity within the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {resumesLoading || jobSpecsLoading || questionsLoading ? (
                    <p className="text-center py-10 text-gray-500">Loading recent activity...</p>
                  ) : (
                    resumes?.length === 0 && jobSpecs?.length === 0 && interviewQuestions?.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-gray-500">No recent activity yet.</p>
                        <p className="text-gray-500 mt-1">Start by uploading a resume or creating a job spec.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {interviewQuestions?.slice(0, 3).map((question) => (
                          <div key={question.id} className="flex items-start p-3 border rounded-lg">
                            <Calendar className="h-5 w-5 mr-3 text-primary-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">Generated Interview Questions</p>
                              <p className="text-sm text-gray-500">
                                {new Date(question.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {resumes?.slice(0, 3).map((resume) => (
                          <div key={resume.id} className="flex items-start p-3 border rounded-lg">
                            <FileText className="h-5 w-5 mr-3 text-primary-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">Uploaded Resume: {resume.fileName}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(resume.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {jobSpecs?.slice(0, 3).map((spec) => (
                          <div key={spec.id} className="flex items-start p-3 border rounded-lg">
                            <Search className="h-5 w-5 mr-3 text-primary-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">Created Job Spec: {spec.title}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(spec.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
