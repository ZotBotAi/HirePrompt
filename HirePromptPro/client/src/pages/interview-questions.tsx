import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Search, ArrowRight, Loader, Copy, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function InterviewQuestions() {
  const [, navigate] = useLocation();
  const params = useParams();
  const { id: questionSetId } = params;
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedJobSpecId, setSelectedJobSpecId] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});
  
  // Fetch user's resumes
  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: [user ? `/api/resumes/user/${user.id}` : null],
    enabled: !!user,
  });
  
  // Fetch user's job specs
  const { data: jobSpecs, isLoading: jobSpecsLoading } = useQuery({
    queryKey: [user ? `/api/job-specs/user/${user.id}` : null],
    enabled: !!user,
  });
  
  // Fetch user's interview questions
  const { data: interviewQuestionsList, isLoading: questionListLoading } = useQuery({
    queryKey: [user ? `/api/interview-questions/user/${user.id}` : null],
    enabled: !!user,
  });
  
  // Fetch specific question set if ID is provided
  const { data: questionSet, isLoading: questionSetLoading } = useQuery({
    queryKey: [questionSetId ? `/api/interview-questions/${questionSetId}` : null],
    enabled: !!questionSetId,
  });
  
  // Generate questions mutation
  const generateQuestionsMutation = useMutation({
    mutationFn: async (data: { userId: number, resumeId: number, jobSpecId: number }) => {
      return await apiRequest('POST', `/api/generate-questions`, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/interview-questions/user/${user?.id}`] });
      const result = data.json();
      result.then(questionData => {
        navigate(`/interview-questions/${questionData.id}`);
      });
      
      toast({
        title: 'Questions generated successfully',
        description: 'Your interview questions have been generated based on the resume and job specification.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Failed to generate interview questions',
        variant: 'destructive',
      });
    },
  });
  
  // Handle question generation
  const handleGenerateQuestions = () => {
    if (!user || !selectedResumeId || !selectedJobSpecId) {
      toast({
        title: 'Missing information',
        description: 'Please select both a resume and a job specification.',
        variant: 'destructive',
      });
      return;
    }
    
    generateQuestionsMutation.mutate({
      userId: user.id,
      resumeId: parseInt(selectedResumeId),
      jobSpecId: parseInt(selectedJobSpecId),
    });
  };
  
  // Handle copy to clipboard
  const handleCopyQuestion = (question: string, id: string) => {
    navigator.clipboard.writeText(question)
      .then(() => {
        setCopyStatus(prev => ({ ...prev, [id]: true }));
        
        // Reset copy status after 2 seconds
        setTimeout(() => {
          setCopyStatus(prev => ({ ...prev, [id]: false }));
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({
          title: 'Copy failed',
          description: 'Failed to copy the question to clipboard.',
          variant: 'destructive',
        });
      });
  };
  
  // Function to find associated data 
  const findAssociatedData = (questionSet: any) => {
    if (!questionSet) return { resume: null, jobSpec: null };
    
    const resume = resumes?.find((r: any) => r.id === questionSet.resumeId);
    const jobSpec = jobSpecs?.find((j: any) => j.id === questionSet.jobSpecId);
    
    return { resume, jobSpec };
  };
  
  // Ensure user is authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);
  
  if (!isAuthenticated && !user) {
    return null;
  }
  
  const { resume: associatedResume, jobSpec: associatedJobSpec } = questionSet ? findAssociatedData(questionSet) : { resume: null, jobSpec: null };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Interview Questions</h1>
            <p className="mt-2 text-lg text-gray-500">
              Generate tailored interview questions based on resumes and job specifications
            </p>
          </header>
          
          {questionSetId ? (
            // Display specific question set
            <>
              {questionSetLoading ? (
                <div className="py-20 text-center">
                  <Loader className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
                  <p className="text-lg text-gray-500">Loading interview questions...</p>
                </div>
              ) : questionSet ? (
                <div className="space-y-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Interview Questions</h2>
                        <p className="text-gray-500 mt-1">
                          Generated on {new Date(questionSet.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0 space-y-2 md:space-y-0 md:flex md:space-x-3">
                        {associatedResume && (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-primary-500 mr-1" />
                            <span className="text-sm font-medium">
                              Resume: {associatedResume.fileName}
                            </span>
                          </div>
                        )}
                        {associatedJobSpec && (
                          <div className="flex items-center">
                            <Search className="h-4 w-4 text-primary-500 mr-1" />
                            <span className="text-sm font-medium">
                              Job: {associatedJobSpec.title}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-6">
                      <Accordion type="single" collapsible className="w-full">
                        {questionSet.questions.map((q: any, idx: number) => (
                          <AccordionItem value={`q-${idx}`} key={idx}>
                            <AccordionTrigger className="py-4 px-4 hover:bg-gray-50 rounded-lg">
                              <div className="flex items-start">
                                <Badge className="mr-3 mt-1" variant={
                                  q.type === 'Technical' ? 'default' :
                                  q.type === 'Behavioral' ? 'secondary' :
                                  q.type === 'Situational' ? 'outline' : 'default'
                                }>
                                  {q.type}
                                </Badge>
                                <span className="text-left font-medium">{q.question}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <div className="mt-2 text-gray-700">
                                <h4 className="font-medium mb-1">Rationale:</h4>
                                <p className="text-gray-600">{q.rationale}</p>
                                
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-4 text-xs"
                                  onClick={() => handleCopyQuestion(q.question, `q-${idx}`)}
                                >
                                  {copyStatus[`q-${idx}`] ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3 mr-1" />
                                      Copy Question
                                    </>
                                  )}
                                </Button>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                    
                    <div className="mt-8 flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/interview-questions')}
                      >
                        Back to All Questions
                      </Button>
                      <Button 
                        onClick={() => handleCopyQuestion(
                          questionSet.questions.map((q: any) => q.question).join('\n\n'),
                          'all'
                        )}
                      >
                        {copyStatus['all'] ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            All Questions Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy All Questions
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center">
                  <p className="text-lg text-gray-500">Question set not found.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/interview-questions')}
                  >
                    Back to All Questions
                  </Button>
                </div>
              )}
            </>
          ) : (
            // Main interview questions page
            <Tabs defaultValue="generate">
              <TabsList className="mb-6">
                <TabsTrigger value="generate">Generate Questions</TabsTrigger>
                <TabsTrigger value="history">Question History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="generate">
                <Card>
                  <CardHeader>
                    <CardTitle>Generate Interview Questions</CardTitle>
                    <CardDescription>
                      Select a resume and job specification to generate tailored interview questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="resume">Select Resume</Label>
                      <Select 
                        value={selectedResumeId} 
                        onValueChange={setSelectedResumeId}
                      >
                        <SelectTrigger id="resume" className="w-full">
                          <SelectValue placeholder="Select a resume" />
                        </SelectTrigger>
                        <SelectContent>
                          {resumesLoading ? (
                            <div className="p-2 text-center">Loading resumes...</div>
                          ) : resumes && resumes.length > 0 ? (
                            resumes.map((resume: any) => (
                              <SelectItem key={resume.id} value={resume.id.toString()}>
                                {resume.fileName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center">No resumes available</div>
                          )}
                        </SelectContent>
                      </Select>
                      {!resumes || resumes.length === 0 ? (
                        <p className="text-sm text-amber-600">
                          You need to upload at least one resume first.{' '}
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-primary-600" 
                            onClick={() => navigate('/upload-resume')}
                          >
                            Upload a resume
                          </Button>
                        </p>
                      ) : null}
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="jobSpec">Select Job Specification</Label>
                      <Select 
                        value={selectedJobSpecId} 
                        onValueChange={setSelectedJobSpecId}
                      >
                        <SelectTrigger id="jobSpec" className="w-full">
                          <SelectValue placeholder="Select a job specification" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobSpecsLoading ? (
                            <div className="p-2 text-center">Loading job specs...</div>
                          ) : jobSpecs && jobSpecs.length > 0 ? (
                            jobSpecs.map((jobSpec: any) => (
                              <SelectItem key={jobSpec.id} value={jobSpec.id.toString()}>
                                {jobSpec.title}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center">No job specs available</div>
                          )}
                        </SelectContent>
                      </Select>
                      {!jobSpecs || jobSpecs.length === 0 ? (
                        <p className="text-sm text-amber-600">
                          You need to create at least one job specification first.
                        </p>
                      ) : null}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      onClick={handleGenerateQuestions}
                      disabled={!selectedResumeId || !selectedJobSpecId || generateQuestionsMutation.isPending}
                      className="flex items-center"
                    >
                      {generateQuestionsMutation.isPending ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate Questions
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Question Sets</CardTitle>
                    <CardDescription>
                      Previously generated interview question sets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {questionListLoading ? (
                      <div className="py-10 text-center">
                        <Loader className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
                        <p className="text-gray-500">Loading your question sets...</p>
                      </div>
                    ) : interviewQuestionsList && interviewQuestionsList.length > 0 ? (
                      <div className="space-y-4">
                        {interviewQuestionsList.map((questionSet: any) => {
                          const relatedResume = resumes?.find((r: any) => r.id === questionSet.resumeId);
                          const relatedJobSpec = jobSpecs?.find((j: any) => j.id === questionSet.jobSpecId);
                          
                          return (
                            <div 
                              key={questionSet.id} 
                              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/interview-questions/${questionSet.id}`)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium flex items-center">
                                    <span>Interview Question Set #{questionSet.id}</span>
                                    <Badge className="ml-2" variant="outline">
                                      {questionSet.questions.length} Questions
                                    </Badge>
                                  </h4>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Generated on {new Date(questionSet.createdAt).toLocaleDateString()}
                                  </p>
                                  
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {relatedResume && (
                                      <div className="flex items-center text-xs text-gray-600">
                                        <FileText className="h-3 w-3 mr-1" />
                                        Resume: {relatedResume.fileName}
                                      </div>
                                    )}
                                    {relatedJobSpec && (
                                      <div className="flex items-center text-xs text-gray-600">
                                        <Search className="h-3 w-3 mr-1" />
                                        Job: {relatedJobSpec.title}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-10 text-center">
                        <h3 className="text-lg font-medium text-gray-900">No question sets yet</h3>
                        <p className="mt-1 text-gray-500">
                          You haven't generated any interview questions yet.
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => document.querySelector('[data-value="generate"]')?.click()}
                        >
                          Generate Your First Questions
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
