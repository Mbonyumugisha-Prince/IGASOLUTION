import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  GraduationCap, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  UserPlus,
  LogOut,
  Shield,
  BookOpen,
  MoreVertical
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getAdminProfile, 
  getAllInstructors, 
  getAllStudents, 
  approveInstructor, 
  rejectInstructor, 
  getInstructorDetails,
  changeStudentToAdmin 
} from '@/ApiConfig/AdminConnection';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface Instructor extends User {
  instructorData?: {
    phoneNumber: string;
    areaOfExperience: string;
    yearOfExperience: string;
    professionBio: string;
    resumeUrl: string;
    certificateUrl: string;
    imageUrl: string;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  };
}

interface AdminProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const AdminDashboard = () => {
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showInstructorDetails, setShowInstructorDetails] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [profileResponse, instructorsResponse, studentsResponse] = await Promise.all([
        getAdminProfile(),
        getAllInstructors(),
        getAllStudents()
      ]);

      if (profileResponse.success) {
        setAdminProfile(profileResponse.data);
      }

      if (instructorsResponse.success) {
        setInstructors(instructorsResponse.data);
      }

      if (studentsResponse.success) {
        setStudents(studentsResponse.data);
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveInstructor = async (instructorId: string) => {
    setIsProcessing(instructorId);
    try {
      const response = await approveInstructor(instructorId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Instructor approved successfully",
        });
        await loadDashboardData(); // Reload data
      }
    } catch (error: any) {
      console.error('Error approving instructor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve instructor",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectInstructor = async (instructorId: string) => {
    setIsProcessing(instructorId);
    try {
      const response = await rejectInstructor(instructorId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Instructor rejected successfully",
        });
        await loadDashboardData(); // Reload data
      }
    } catch (error: any) {
      console.error('Error rejecting instructor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject instructor",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleViewInstructorDetails = async (instructor: Instructor) => {
    try {
      const response = await getInstructorDetails(instructor.id);
      if (response.success) {
        setSelectedInstructor(response.data);
        setShowInstructorDetails(true);
      }
    } catch (error: any) {
      console.error('Error fetching instructor details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch instructor details",
        variant: "destructive"
      });
    }
  };

  const handlePromoteToAdmin = async (studentId: string) => {
    setIsProcessing(studentId);
    try {
      const response = await changeStudentToAdmin(studentId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Student promoted to admin successfully",
        });
        await loadDashboardData(); // Reload data
      }
    } catch (error: any) {
      console.error('Error promoting student:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to promote student",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authtoken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userInfo');
    navigate('/admin/login');
  };

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'PENDING':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    }
  };

  const pendingInstructors = instructors.filter(inst => 
    inst.instructorData?.approvalStatus === 'PENDING'
  );
  const approvedInstructors = instructors.filter(inst => 
    inst.instructorData?.approvalStatus === 'APPROVED'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {adminProfile?.firstName} {adminProfile?.lastName}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Instructors</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{instructors.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingInstructors.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Instructors</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedInstructors.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="instructors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="instructors">Instructor Management</TabsTrigger>
            <TabsTrigger value="students">Student Management</TabsTrigger>
          </TabsList>

          {/* Instructors Tab */}
          <TabsContent value="instructors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Instructor Applications</CardTitle>
                <CardDescription>
                  Review and manage instructor applications and approvals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {instructors.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No instructors found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {instructors.map((instructor) => (
                      <div key={instructor.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={instructor.instructorData?.imageUrl} />
                            <AvatarFallback>
                              {instructor.firstName[0]}{instructor.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {instructor.firstName} {instructor.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">{instructor.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {instructor.instructorData?.areaOfExperience} • {instructor.instructorData?.yearOfExperience} years
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {getApprovalStatusBadge(instructor.instructorData?.approvalStatus || 'PENDING')}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewInstructorDetails(instructor)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                          
                          {instructor.instructorData?.approvalStatus === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveInstructor(instructor.id)}
                                disabled={isProcessing === instructor.id}
                                className="gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRejectInstructor(instructor.id)}
                                disabled={isProcessing === instructor.id}
                                className="gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>
                  Manage students and promote to admin roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No students found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {student.firstName[0]}{student.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {student.firstName} {student.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                            <Badge variant="secondary">{student.role}</Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {student.role === 'STUDENT' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePromoteToAdmin(student.id)}
                              disabled={isProcessing === student.id}
                              className="gap-2"
                            >
                              <UserPlus className="h-4 w-4" />
                              Promote to Admin
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Instructor Details Modal */}
      <Dialog open={showInstructorDetails} onOpenChange={setShowInstructorDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Instructor Details</DialogTitle>
            <DialogDescription>
              Complete information about the instructor application
            </DialogDescription>
          </DialogHeader>
          
          {selectedInstructor && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Personal Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedInstructor.firstName} {selectedInstructor.lastName}</p>
                    <p><span className="font-medium">Email:</span> {selectedInstructor.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedInstructor.instructorData?.phoneNumber}</p>
                    <p><span className="font-medium">Status:</span> {getApprovalStatusBadge(selectedInstructor.instructorData?.approvalStatus || 'PENDING')}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Professional Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Area of Experience:</span> {selectedInstructor.instructorData?.areaOfExperience}</p>
                    <p><span className="font-medium">Years of Experience:</span> {selectedInstructor.instructorData?.yearOfExperience}</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="font-semibold mb-3">Professional Bio</h3>
                <p className="text-sm text-muted-foreground border p-3 rounded bg-muted/50">
                  {selectedInstructor.instructorData?.professionBio}
                </p>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-semibold mb-3">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedInstructor.instructorData?.resumeUrl && (
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-3"
                      onClick={() => window.open(selectedInstructor.instructorData?.resumeUrl, '_blank')}
                    >
                      <div className="text-left">
                        <div className="font-medium">Resume</div>
                        <div className="text-xs text-muted-foreground">View Document</div>
                      </div>
                    </Button>
                  )}
                  
                  {selectedInstructor.instructorData?.certificateUrl && (
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-3"
                      onClick={() => window.open(selectedInstructor.instructorData?.certificateUrl, '_blank')}
                    >
                      <div className="text-left">
                        <div className="font-medium">Certificate</div>
                        <div className="text-xs text-muted-foreground">View Document</div>
                      </div>
                    </Button>
                  )}
                  
                  {selectedInstructor.instructorData?.imageUrl && (
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-3"
                      onClick={() => window.open(selectedInstructor.instructorData?.imageUrl, '_blank')}
                    >
                      <div className="text-left">
                        <div className="font-medium">Profile Photo</div>
                        <div className="text-xs text-muted-foreground">View Image</div>
                      </div>
                    </Button>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedInstructor.instructorData?.approvalStatus === 'PENDING' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleApproveInstructor(selectedInstructor.id);
                      setShowInstructorDetails(false);
                    }}
                    disabled={isProcessing === selectedInstructor.id}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Instructor
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleRejectInstructor(selectedInstructor.id);
                      setShowInstructorDetails(false);
                    }}
                    disabled={isProcessing === selectedInstructor.id}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
