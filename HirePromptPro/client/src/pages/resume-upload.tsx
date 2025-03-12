import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Trash2 } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function ResumeUpload() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<number | null>(null);
  
  // Fetch user's resumes
  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: [user ? `/api/resumes/user/${user.id}` : null],
    enabled: !!user,
  });
  
  // Handle resume upload
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadSuccess(false);
  };
  
  const uploadResume = async () => {
    if (!user || !selectedFile) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('userId', user.id.toString());
      
      const response = await fetch('/api/resumes', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload resume');
      }
      
      // Invalidate resumes query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/resumes/user/${user.id}`] });
      
      setUploadSuccess(true);
      setSelectedFile(null);
      
      toast({
        title: 'Resume uploaded successfully',
        description: 'Your resume has been uploaded and is ready for analysis.',
      });
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };
  
  // Handle resume deletion
  const deleteResumeMutation = useMutation({
    mutationFn: async (resumeId: number) => {
      return await apiRequest('DELETE', `/api/resumes/${resumeId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/resumes/user/${user?.id}`] });
      setResumeToDelete(null);
      toast({
        title: 'Resume deleted',
        description: 'The resume has been successfully deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Deletion failed',
        description: error instanceof Error ? error.message : 'Failed to delete resume',
        variant: 'destructive',
      });
    },
  });
  
  const handleDeleteResume = () => {
    if (resumeToDelete) {
      deleteResumeMutation.mutate(resumeToDelete);
    }
  };
  
  // Ensure user is authenticated
  if (!isAuthenticated && !user) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Resume Management</h1>
            <p className="mt-2 text-lg text-gray-500">
              Upload and manage candidate resumes for interview question generation
            </p>
          </header>
          
          <Tabs defaultValue="upload">
            <TabsList className="mb-6">
              <TabsTrigger value="upload">Upload Resume</TabsTrigger>
              <TabsTrigger value="manage">Manage Resumes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload a New Resume</CardTitle>
                  <CardDescription>
                    Upload a PDF resume to generate tailored interview questions. Acceptable format: PDF only, up to 10MB.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    accept=".pdf"
                    maxSize={10}
                    label="Upload Resume"
                    description="Drag and drop a PDF file here, or click to select"
                    uploading={uploading}
                    uploaded={uploadSuccess}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={uploadResume} 
                      disabled={!selectedFile || uploading} 
                      className="flex items-center"
                    >
                      {uploading ? (
                        <>
                          <span className="mr-2">Uploading...</span>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full" />
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Resume
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="manage">
              <Card>
                <CardHeader>
                  <CardTitle>Your Resumes</CardTitle>
                  <CardDescription>
                    Manage the resumes you've uploaded to the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {resumesLoading ? (
                    <div className="py-10 text-center">
                      <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                      <p className="mt-2 text-gray-500">Loading your resumes...</p>
                    </div>
                  ) : resumes && resumes.length > 0 ? (
                    <div className="space-y-4">
                      {resumes.map((resume: any) => (
                        <div key={resume.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-8 w-8 text-primary-500 mr-4" />
                            <div>
                              <h4 className="font-medium">{resume.fileName}</h4>
                              <p className="text-sm text-gray-500">
                                Uploaded on {new Date(resume.createdAt).toLocaleDateString()}
                              </p>
                              {resume.parsed && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                  Parsed
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <a 
                              href={resume.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                            >
                              View
                            </a>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => setResumeToDelete(resume.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Resume</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete this resume? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setResumeToDelete(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={handleDeleteResume}
                                    disabled={deleteResumeMutation.isPending}
                                  >
                                    {deleteResumeMutation.isPending ? 'Deleting...' : 'Delete'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No resumes yet</h3>
                      <p className="mt-1 text-gray-500">
                        You haven't uploaded any resumes yet. Start by uploading a resume.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => document.querySelector('[data-value="upload"]')?.click()}
                      >
                        Upload a Resume
                      </Button>
                    </div>
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
