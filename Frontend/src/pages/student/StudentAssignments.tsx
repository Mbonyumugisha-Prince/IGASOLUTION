import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Download,
  Trash2,
  Edit
} from 'lucide-react';
import { 
  fetchCourseAssignments, 
  fetchStudentSubmissions,
  submitAssignment,
  updateAssignmentSubmission,
  deleteAssignmentSubmission,
  Assignment,
  SubmissionDto
} from '@/ApiConfig/StudentConnection';

const StudentAssignments: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [currentAssignmentId, setCurrentAssignmentId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSubmissionId, setUpdateSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      loadAssignments();
    }
  }, [courseId]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [assignmentsData, submissionsData] = await Promise.all([
        fetchCourseAssignments(courseId!),
        fetchStudentSubmissions(courseId!)
      ]);
      
      setAssignments(assignmentsData || []);
      setSubmissions(submissionsData || []);
    } catch (err: any) {
      console.error('Error loading assignments:', err);
      setError(err.message || 'Failed to load assignments');
      
      if (err.message.includes('Authentication failed')) {
        navigate('/student/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !currentAssignmentId) {
      return;
    }

    try {
      setSubmitLoading(currentAssignmentId);

      if (isUpdating && updateSubmissionId) {
        await updateAssignmentSubmission(updateSubmissionId, selectedFile);
      } else {
        await submitAssignment(currentAssignmentId, selectedFile);
      }

      // Reload assignments and submissions
      await loadAssignments();
      
      // Reset form
      setSelectedFile(null);
      setSubmissionDialogOpen(false);
      setCurrentAssignmentId(null);
      setIsUpdating(false);
      setUpdateSubmissionId(null);
      
    } catch (err: any) {
      console.error('Error submitting assignment:', err);
      setError(err.message || 'Failed to submit assignment');
    } finally {
      setSubmitLoading(null);
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      await deleteAssignmentSubmission(submissionId);
      await loadAssignments();
    } catch (err: any) {
      console.error('Error deleting submission:', err);
      setError(err.message || 'Failed to delete submission');
    }
  };

  const openSubmissionDialog = (assignmentId: string, isUpdate = false, submissionId?: string) => {
    setCurrentAssignmentId(assignmentId);
    setIsUpdating(isUpdate);
    setUpdateSubmissionId(submissionId || null);
    setSelectedFile(null);
    setSubmissionDialogOpen(true);
  };

  const getSubmissionForAssignment = (assignmentId: string): SubmissionDto | undefined => {
    return submissions.find(sub => sub.assignmentId === assignmentId);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAssignmentTypeColor = (type: string): string => {
    switch (type) {
      case 'QUIZ': return 'bg-blue-100 text-blue-800';
      case 'MID': return 'bg-orange-100 text-orange-800';
      case 'SUMMATIVE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isAssignmentOverdue = (dueDate: string): boolean => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/student/my-courses')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to My Courses</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Assignments</h1>
            <p className="text-gray-600">Submit your assignments and track your progress</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Assignments List */}
      <div className="grid gap-6">
        {assignments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments available</h3>
              <p className="text-gray-600">There are currently no assignments for this course.</p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => {
            const submission = getSubmissionForAssignment(assignment.id);
            const isOverdue = isAssignmentOverdue(assignment.dueDate);
            const isSubmitted = !!submission;
            
            return (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <Badge className={getAssignmentTypeColor(assignment.assignmentType)}>
                          {assignment.assignmentType}
                        </Badge>
                        {isSubmitted && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Submitted
                          </Badge>
                        )}
                        {isOverdue && !isSubmitted && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      
                      <CardDescription className="mb-4">
                        {assignment.description}
                      </CardDescription>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {formatDate(assignment.dueDate)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Max Points: {assignment.maxPoints}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Assignment document */}
                  {assignment.documentUrl && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Assignment Document</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(assignment.documentUrl, '_blank')}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Submission section */}
                  <div className="border-t pt-4">
                    {isSubmitted ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">Your Submission</h4>
                          <div className="flex items-center space-x-2">
                            {submission.isGraded ? (
                              <Badge className="bg-blue-100 text-blue-800">
                                Grade: {submission.grade}/{assignment.maxPoints}
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Pending Review
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">
                                Submitted on: {formatDate(submission.submittedAt)}
                              </p>
                              {submission.feedback && (
                                <p className="text-sm text-gray-700 mt-1">
                                  <strong>Feedback:</strong> {submission.feedback}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(submission.submissionFile, '_blank')}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              
                              {!submission.isGraded && !isOverdue && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openSubmissionDialog(assignment.id, true, submission.id)}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Update
                                </Button>
                              )}
                              
                              {!submission.isGraded && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteSubmission(submission.id)}
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        {isOverdue ? (
                          <p className="text-red-600 mb-2">This assignment is overdue</p>
                        ) : (
                          <>
                            <p className="text-gray-600 mb-4">You haven't submitted this assignment yet</p>
                            <Button 
                              onClick={() => openSubmissionDialog(assignment.id)}
                              disabled={!!submitLoading}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {submitLoading === assignment.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Submit Assignment
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Submission Dialog */}
      <Dialog open={submissionDialogOpen} onOpenChange={setSubmissionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isUpdating ? 'Update Submission' : 'Submit Assignment'}
            </DialogTitle>
            <DialogDescription>
              {isUpdating 
                ? 'Upload a new file to update your submission'
                : 'Choose a file to submit for this assignment'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">Assignment File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.zip,.rar"
              />
              <p className="text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX, TXT, ZIP, RAR
              </p>
            </div>
            
            {selectedFile && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-blue-700">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setSubmissionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedFile || !!submitLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isUpdating ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                isUpdating ? 'Update Submission' : 'Submit Assignment'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentAssignments;