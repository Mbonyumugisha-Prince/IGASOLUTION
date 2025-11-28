import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CourseCard } from '@/components/CourseCard';
import { mockCourses, mockStudents } from '@/data/mockData';
import { 
  fetchStudentProfile, 
  fetchStudentEnrollments, 
  checkStudentEnrollment, 
  updateStudentEnrollmentProgress,
  formatEnrollmentProgress, 
  getProgressColor,
  fetchStudentPaymentHistory,
  fetchStudentGradingDashboard,
  GradeDto
} from '@/ApiConfig/StudentConnection';
import { 
  BookOpen, Clock, Award, TrendingUp, Play, Calendar, Bell, LogOut, Menu, 
  Home, FileText, GraduationCap, Plus, Settings, HelpCircle, Search, 
  Mic, ChevronDown, ArrowRight, CheckCircle, Star, User, CreditCard, AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type EnrollmentSummary = {
  id: number;
  courseId: number;
  courseName: string;
  courseDescription?: string;
  instructorName?: string;
  courseImageUrl?: string;
  progress: string;
  coursePrice?: number;
  enrollmentDate?: string;
  courseDurationInHours?: number;
};

type PaymentSummary = {
  id: string;
  courseName?: string;
  amount?: number;
  paymentStatus?: string;
  transactionReference?: string;
  paymentMethod?: string;
  paymentDate?: string;
};

const progressPercentMap: Record<string, number> = {
  NOT_STARTED: 5,
  IN_PROGRESS: 55,
  COMPLETED: 100,
};

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
  }).format(value ?? 0);

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatProgressLabel = (value?: string) => {
  if (!value) return 'Not started';
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

// Helper function to validate if a grade has proper assignment and submission data
const isValidGradeData = (grade: any): boolean => {
  const hasAssignmentData = !!(grade.assignmentId || grade.assignmentTitle || grade.assignmentName || grade.assignment);
  const hasSubmissionData = !!(grade.pointsAwarded !== undefined || grade.percentage !== undefined || grade.feedback);
  const hasValidData = hasAssignmentData && hasSubmissionData;
  
  if (!hasValidData) {
    console.log(`🔍 Grade validation failed:`, {
      gradeId: grade.gradeId,
      hasAssignmentData,
      hasSubmissionData,
      assignmentId: grade.assignmentId,
      pointsAwarded: grade.pointsAwarded,
      percentage: grade.percentage,
      feedback: grade.feedback
    });
  }
  
  return hasValidData;
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'progress' | 'courses' | 'assignments' | 'grades'>('progress');
  const [profile, setProfile] = useState<any | null>(() => {
    try {
      const raw = localStorage.getItem('studentProfile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Enrollment states
  const [enrollments, setEnrollments] = useState<EnrollmentSummary[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  
  // Payment states
  const [payments, setPayments] = useState<PaymentSummary[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Grading states
  const [gradingSummary, setGradingSummary] = useState<any>(null);
  const [overallGrades, setOverallGrades] = useState<Record<string, GradeDto[]>>({});
  const [gradesLoading, setGradesLoading] = useState(false);

  // Define loadGradingData outside useEffect so it can be called from onClick handlers
  const loadGradingData = async () => {
    try {
      setGradesLoading(true);
      
      // Check if user is authenticated before making API call
      const token = localStorage.getItem('authtoken');
      if (!token) {
        console.log('No auth token found, skipping grading data fetch');
        setGradingSummary(null);
        setOverallGrades({});
        return;
      }
      
      console.log('🎓 Fetching student grading dashboard data...');
      const response = await fetchStudentGradingDashboard();
      console.log('🎓 Raw grading API response:', response);
      
      if (response && response.success && response.data) {
        console.log('🎓 Grading data successfully received:');
        console.log('   - Summary:', response.data.summary);
        console.log('   - Overall grades keys:', Object.keys(response.data.overallGrades || {}));
        console.log('   - Course stats:', response.data.courseStats);
        
        setGradingSummary(response.data.summary || null);
        
        // Filter out courses that don't have proper assignment/submission data
        const filteredGrades: Record<string, GradeDto[]> = {};
        const filteredOutCourses: string[] = [];
        const filteredOutGrades: any[] = [];
        
        if (response.data.overallGrades) {
          Object.entries(response.data.overallGrades).forEach(([courseName, grades]) => {
            console.log(`🎓 Checking course: ${courseName} with ${(grades as any[]).length} grades`);
            
            // Filter grades that have proper assignment and submission data
            const validGrades = (grades as any[]).filter(grade => {
              const isValid = isValidGradeData(grade);
              
              if (!isValid) {
                console.log(`🚫 Filtering out invalid grade from ${courseName}`);
                filteredOutGrades.push({ course: courseName, grade });
              }
              
              return isValid;
            });
            
            // Only include courses that have at least one valid grade
            if (validGrades.length > 0) {
              filteredGrades[courseName] = validGrades;
              console.log(`✅ Course "${courseName}" included with ${validGrades.length} valid grades`);
            } else {
              console.log(`🚫 Course "${courseName}" excluded - no valid grades found`);
              filteredOutCourses.push(courseName);
            }
          });
          
          // Summary log
          console.log(`🎓 Filtering Summary:`);
          console.log(`   - Courses included: ${Object.keys(filteredGrades).length}`);
          console.log(`   - Courses filtered out: ${filteredOutCourses.length}`, filteredOutCourses);
          console.log(`   - Individual grades filtered out: ${filteredOutGrades.length}`);
        }
        
        setOverallGrades(filteredGrades);
        
        // Log filtered course grade data for debugging
        Object.entries(filteredGrades).forEach(([courseName, grades]) => {
          console.log(`🎓 Final course: ${courseName} has ${grades.length} valid grades`);
        });
        
        console.log('🎓 Dashboard grading data loaded successfully!');
      } else {
        console.log('🎓 No grading data found or failed response:', response);
        setGradingSummary(null);
        setOverallGrades({});
      }
    } catch (error: any) {
      console.error('🎓 Error loading grading data:', error);
      
      // Handle authentication errors gracefully
      if (error.message && error.message.includes('Authentication failed')) {
        console.log('🎓 Authentication failed in dashboard grading data');
      }
      
      // Set empty state on error
      setGradingSummary(null);
      setOverallGrades({});
    } finally {
      setGradesLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Add console helper for manual testing
    (window as any).testGradesFetch = async () => {
      console.log('🔧 Manual grade fetch test started...');
      try {
        const result = await fetchStudentGradingDashboard();
        console.log('🔧 Manual fetch result:', result);
        return result;
      } catch (error) {
        console.error('🔧 Manual fetch error:', error);
        return error;
      }
    };

    const loadProfileAndData = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authtoken') : null;

      if (!token) {
        setErrorMessage('Your session expired. Please log in again.');
        if (typeof window !== 'undefined') {
          window.location.href = '/student/login?redirect=/student/dashboard';
        }
        return;
      }

      setDashboardLoading(true);
      setErrorMessage(null);

      try {
        const profileResult = await Promise.allSettled([
          fetchStudentProfile(),
        ]);

        if (!isMounted) {
          return;
        }

        if (profileResult[0]?.status === 'fulfilled' && profileResult[0].value?.success && profileResult[0].value.data) {
          setProfile(profileResult[0].value.data);
          localStorage.setItem('studentProfile', JSON.stringify(profileResult[0].value.data));
        } else if (profileResult[0]?.status === 'rejected') {
          console.warn('Could not load student profile', profileResult[0].reason);
        }
      } catch (err) {
        console.warn('Unexpected dashboard error', err);
        if (isMounted) {
          setErrorMessage('Something went wrong while loading your dashboard.');
        }
      } finally {
        if (isMounted) {
          setDashboardLoading(false);
        }
      }
    };

    const loadEnrollments = async () => {
      try {
        setEnrollmentsLoading(true);
        
        // Check if user is authenticated before making API call
        const token = localStorage.getItem('authtoken');
        if (!token) {
          console.log('No auth token found, skipping enrollment fetch');
          setEnrollments([]);
          return;
        }
        
        const response = await fetchStudentEnrollments(0, 20); // Get up to 20 enrollments
        
        if (response && response.success && response.data && response.data.content) {
          const enrollmentData: EnrollmentSummary[] = response.data.content.map((enrollment: any) => ({
            id: enrollment.id,
            courseId: enrollment.courseId,
            courseName: enrollment.courseName,
            courseDescription: enrollment.courseDescription,
            instructorName: enrollment.instructorName,
            courseImageUrl: enrollment.courseImageUrl,
            progress: enrollment.progress,
            coursePrice: enrollment.coursePrice,
            enrollmentDate: enrollment.enrollmentDate,
            courseDurationInHours: enrollment.courseDurationInHours
          }));
          
          setEnrollments(enrollmentData);
          console.log('Enrollments loaded:', enrollmentData);
        } else {
          console.log('No enrollments found or failed response:', response);
          setEnrollments([]);
        }
      } catch (error: any) {
        console.error('Error loading enrollments:', error);
        
        // Handle authentication errors
        if (error.message && error.message.includes('Authentication failed')) {
          console.log('Authentication failed in dashboard');
          // Don't redirect here since we're already handling auth in the main useEffect
        }
        
        // Fall back to empty array, we can still show the dashboard
        setEnrollments([]);
      } finally {
        setEnrollmentsLoading(false);
      }
    };

    const loadPayments = async () => {
      try {
        setPaymentsLoading(true);
        
        // Check if user is authenticated before making API call
        const token = localStorage.getItem('authtoken');
        if (!token) {
          console.log('No auth token found, skipping payment fetch');
          setPayments([]);
          return;
        }
        
        const response = await fetchStudentPaymentHistory(0, 10); // Get up to 10 recent payments
        
        if (response && response.success && response.data) {
          // Handle both paginated and non-paginated responses
          const paymentContent = response.data.content || response.data;
          
          if (Array.isArray(paymentContent) && paymentContent.length > 0) {
            const paymentData: PaymentSummary[] = paymentContent.map((payment: any) => ({
              id: payment.id || payment.transactionReference || Math.random().toString(),
              courseName: payment.courseName || 'Unknown Course',
              amount: payment.amount || 0,
              paymentStatus: payment.paymentStatus || 'PENDING',
              transactionReference: payment.transactionReference || '—',
              paymentMethod: payment.paymentMethod || '—',
              paymentDate: payment.paymentDate || new Date().toISOString()
            }));
            
            setPayments(paymentData);
            console.log('Payments loaded from API:', paymentData);
          } else {
            console.log('No payment content found in response');
            setPayments([]);
          }
        } else if (response && response.data && Array.isArray(response.data)) {
          // Handle direct array response
          const paymentData: PaymentSummary[] = response.data.map((payment: any) => ({
            id: payment.id || payment.transactionReference || Math.random().toString(),
            courseName: payment.courseName || 'Unknown Course',
            amount: payment.amount || 0,
            paymentStatus: payment.paymentStatus || 'PENDING',
            transactionReference: payment.transactionReference || '—',
            paymentMethod: payment.paymentMethod || '—',
            paymentDate: payment.paymentDate || new Date().toISOString()
          }));
          
          setPayments(paymentData);
          console.log('Payments loaded from API (direct array):', paymentData);
        } else {
          console.log('No payments found or unexpected response structure:', response);
          setPayments([]);
        }
      } catch (error: any) {
        console.error('Error loading payments:', error);
        
        // Handle authentication errors
        if (error.message && error.message.includes('Authentication failed')) {
          console.log('Authentication failed in dashboard payments');
          // Redirect to login if authentication fails
          if (typeof window !== 'undefined') {
            window.location.href = '/student/login?redirect=/student/dashboard';
          }
        }
        
        // Set empty array on error - no mock data fallback
        setPayments([]);
      } finally {
        setPaymentsLoading(false);
      }
    };

    loadProfileAndData();
    loadEnrollments();
    loadPayments();
    
    // Force fresh grade data load
    setTimeout(() => {
      console.log('🎓 Auto-loading grading data after initial page load...');
      loadGradingData();
    }, 1000); // Delay slightly to let other data load first

    return () => {
      isMounted = false;
    };
  }, []);

  const enrolledCourses = useMemo(() => {
    // Only use real enrollment data - no fallback to mock data
    if (enrollments && enrollments.length > 0) {
      return enrollments.map((enrollment) => ({
        id: String(enrollment.courseId || enrollment.id),
        title: enrollment.courseName || 'Unknown Course',
        description: enrollment.courseDescription || 'No description available',
        instructor: enrollment.instructorName || 'Unknown Instructor',
        image: enrollment.courseImageUrl || '/placeholder.png',
        price: enrollment.coursePrice || 0,
        duration: enrollment.courseDurationInHours ? `${enrollment.courseDurationInHours} hours` : 'N/A',
        category: 'Course',
        progress: enrollment.progress || 'NOT_STARTED',
        enrollmentDate: enrollment.enrollmentDate,
        enrollmentId: enrollment.id,
        rating: 0,
        enrolledStudents: 0,
        level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced'
      }));
    }
    
    // Return empty array if no enrollments - no mock data fallback
    return [];
  }, [enrollments]);

  const totalCourses = enrolledCourses.length;
  const completedCourses = enrollments.filter(e => e.progress === 'COMPLETED').length;
  const inProgressCourses = enrollments.filter(e => e.progress === 'IN_PROGRESS').length;
  const totalAmountPaid = enrollments.reduce((total, e) => total + (e.coursePrice || 0), 0);
  const latestEnrollments = enrolledCourses.slice(0, 4);
  const latestPayments = payments.slice(0, 4); // Get recent 4 payments
  const pendingPayments = payments.filter(p => p.paymentStatus === 'PENDING');
  const totalPendingAmount = pendingPayments.reduce((total, p) => total + (p.amount || 0), 0);

  const handleLogout = () => {
    // Clear all student data from localStorage
    localStorage.removeItem('studentProfile');
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    
    // Navigate to home page
    navigate('/');
  };

  const paymentStatusBadge = (status?: string) => {
    const normalized = (status || '').toUpperCase();
    switch (normalized) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const renderHeader = () => (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
            <Mic className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/student/profile">
            <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-100">
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );

  const renderProgress = () => (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-blue-900 text-white flex flex-col">
        {/* User Profile Section */}
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-700">
              <img
                src={
                  profile?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    (profile?.firstName || 'Student') + ' ' + (profile?.lastName || '')
                  )}&background=random&color=fff`
                }
                alt={profile?.firstName || 'Student'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : 'Student'}</h3>
              <div className="flex items-center gap-2 text-blue-200">
                <span className="text-sm">{profile?.email || '—'}</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-6">
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('progress')}
              className={`w-full text-left flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'progress' ? 'bg-teal-500 text-white' : 'text-blue-200 hover:bg-blue-800 transition-colors'}`}
            >
              <Home className="h-5 w-5" />
              My Progress
            </button>
            <Link 
              to="/student/my-courses"
              className={`w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors`}
            >
              <FileText className="h-5 w-5" />
              My Courses
            </Link>
            <Link 
              to="/courses"
              className={`w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors`}
            >
              <Plus className="h-5 w-5" />
              Browse Courses
            </Link>
            <Link 
              to="/student/my-assignments"
              className={`w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors`}
            >
              <GraduationCap className="h-5 w-5" />
              My Assignments
            </Link>
            <Link 
              to="/student/my-grades"
              className={`w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors`}
            >
              <Star className="h-5 w-5" />
              Grades
            </Link>
            <Link 
              to="/student/my-payments"
              className={`w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors`}
            >
              <CreditCard className="h-5 w-5" />
              Payments
            </Link>
            <Link 
              to="/student/profile"
              className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors"
            >
              <User className="h-5 w-5" />
              Profile Settings
            </Link>
          </nav>

          {/* Labels Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-blue-200">Labels</h4>
              <Plus className="h-4 w-4 text-blue-200 cursor-pointer" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-sm text-blue-200">UI Design</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-sm text-blue-200">UX Design</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-6 border-t border-blue-800">
          <nav className="space-y-2">
            <Link 
              to="/settings" 
              className="flex items-center gap-3 p-3 text-blue-200 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
              System Settings
            </Link>
            <Link 
              to="/help" 
              className="flex items-center gap-3 p-3 text-blue-200 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
              Help Center
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 text-red-200 hover:bg-blue-800 rounded-lg transition-colors w-full text-left"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {renderHeader()}

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50">
          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}
          {dashboardLoading ? (
            <div className="py-20 text-center text-gray-500">Loading your dashboard...</div>
          ) : (
          <>
          {/* Course Overview Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-green-600">{totalCourses}</p>
                      <p className="text-sm text-gray-600">Total Enrollments</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <Button variant="ghost" size="sm" className="mt-4 text-green-600 hover:text-green-700">
                    View Courses <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-purple-600">{completedCourses}</p>
                      <p className="text-sm text-gray-600">Completed Courses</p>
                    </div>
                    <GraduationCap className="h-8 w-8 text-purple-600" />
                  </div>
                  <Button variant="ghost" size="sm" className="mt-4 text-purple-600 hover:text-purple-700">
                    See Progress <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-orange-600">{inProgressCourses}</p>
                      <p className="text-sm text-gray-600">In Progress</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                  <Button variant="ghost" size="sm" className="mt-4 text-orange-600 hover:text-orange-700">
                    Continue Learning <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalAmountPaid)}</p>
                      <p className="text-sm text-gray-600">Total Paid</p>
                    </div>
                    <Award className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Pending Payments Alert */}
          {pendingPayments.length > 0 && (
            <div className="mb-8">
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-800">Pending Payments</h3>
                      <p className="text-sm text-yellow-700">
                        You have {pendingPayments.length} pending payment{pendingPayments.length > 1 ? 's' : ''} totaling {formatCurrency(totalPendingAmount)}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      onClick={() => navigate('/student/my-payments')}
                    >
                      View Payments
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Enrolled Course Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Enrolled Courses</h2>
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {enrollmentsLoading ? (
                <div className="col-span-1 sm:col-span-2 xl:col-span-4 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
                  <div className="inline-flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                    <span>Loading your enrolled courses...</span>
                  </div>
                </div>
              ) : latestEnrollments.length > 0 ? (
                latestEnrollments.map((enrollment) => (
                    <Card key={enrollment.id} className="bg-white border border-gray-200">
                      <CardContent className="p-0">
                        <div className="relative">
                          <img 
                            src={enrollment.image || '/placeholder.png'} 
                            alt={enrollment.title || 'Course cover'}
                            className="w-full h-32 object-cover rounded-t-lg"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-white/90 text-gray-600 text-xs">
                              {enrollment.category || 'Course'}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <p className="text-xs text-gray-500">
                            {enrollment.instructor ? `Instructor: ${enrollment.instructor}` : '—'}
                          </p>
                          <h3 className="font-semibold text-sm line-clamp-2">{enrollment.title || 'Course'}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {enrollment.description || 'Keep learning and track your progress here.'}
                          </p>
                          <div className="space-y-2 pt-1">
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>{formatCurrency(enrollment.price)}</span>
                              <span>{enrollment.duration}</span>
                            </div>
                            <Progress value={progressPercentMap[enrollment.progress] || 5} className="h-2" />
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {formatProgressLabel(enrollment.progress)}
                              </span>
                              <Button
                                size="sm"
                                className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                                onClick={() => navigate(`/student/course/${enrollment.id}/learn`)}
                              >
                                Continue
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500 col-span-1 sm:col-span-2 xl:col-span-4">
                  You have not enrolled in any courses yet. Browse the catalog to get started.
                </div>
              )}
            </div>
          </div>

          {/* Grading Overview Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Academic Progress</h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={loadGradingData}
                  disabled={gradesLoading}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {gradesLoading ? 'Refreshing...' : 'Refresh Grades'}
                </Button>
                <Link to="/student/my-grades">
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                    View All Grades
                  </Button>
                </Link>
              </div>
            </div>
            
            {gradesLoading ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
                <div className="inline-flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                  <span>Loading your academic progress from database...</span>
                </div>
              </div>
            ) : gradingSummary ? (
              <div className="space-y-6">
                {/* Overall Grade Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-emerald-600">
                            {gradingSummary.overallGPA ? gradingSummary.overallGPA.toFixed(2) : '—'}
                          </p>
                          <p className="text-sm text-gray-600">Overall GPA</p>
                        </div>
                        <Award className="h-8 w-8 text-emerald-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {gradingSummary.totalCourses || 0}
                          </p>
                          <p className="text-sm text-gray-600">Courses Graded</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-violet-600">
                            {gradingSummary.totalAssignments || 0}
                          </p>
                          <p className="text-sm text-gray-600">Assignments</p>
                        </div>
                        <FileText className="h-8 w-8 text-violet-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-amber-600">
                            {gradingSummary.averageScore ? `${gradingSummary.averageScore.toFixed(1)}%` : '—'}
                          </p>
                          <p className="text-sm text-gray-600">Avg Score</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-amber-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Grade Performance */}
                {Object.keys(overallGrades).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Grade Performance 
                      <span className="text-sm text-blue-600 font-normal ml-2">
                        ({Object.keys(overallGrades).length} course{Object.keys(overallGrades).length !== 1 ? 's' : ''} with valid assignments)
                      </span>
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(overallGrades)
                        .filter(([courseName, grades]) => {
                          // Double-check: Only show courses with valid assignment data
                          const hasValidGrades = grades.some(grade => isValidGradeData(grade));
                          if (!hasValidGrades) {
                            console.log(`🚫 Filtering out course in render: ${courseName} - no valid assignment data`);
                          }
                          return hasValidGrades;
                        })
                        .slice(0, 3)
                        .map(([courseName, grades]) => {
                        console.log(`🎓 Rendering course: ${courseName} with ${grades.length} valid grades`);
                        
                        // Filter grades again to ensure only valid assignment/submission data is shown
                        const validGrades = grades.filter(grade => isValidGradeData(grade));
                        
                        const recentGrades = validGrades.slice(0, 3);
                        const courseAverage = validGrades.length > 0 
                          ? validGrades.reduce((sum, grade) => {
                              // Handle both percentage and pointsAwarded formats
                              const percentage = grade.percentage || (grade.pointsAwarded ? (grade.pointsAwarded > 1 ? grade.pointsAwarded : grade.pointsAwarded * 100) : 0);
                              console.log(`🎓 Valid grade data:`, { 
                                assignmentId: grade.assignmentId, 
                                pointsAwarded: grade.pointsAwarded, 
                                percentage: grade.percentage, 
                                calculated: percentage 
                              });
                              return sum + percentage;
                            }, 0) / validGrades.length 
                          : 0;
                        
                        // Skip rendering if no valid grades
                        if (validGrades.length === 0) {
                          console.log(`🎓 Skipping course ${courseName} - no valid grades after filtering`);
                          return null;
                        }
                        
                        return (
                          <Card key={courseName} className="bg-white border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="font-medium text-gray-900">{courseName.replace(/\./g, '').trim()}</h4>
                                  <p className="text-sm text-gray-500">
                                    {validGrades.length} valid assignment{validGrades.length !== 1 ? 's' : ''} • 
                                    Average: {courseAverage.toFixed(1)}%
                                    <span className="text-xs text-blue-500 ml-2">(Filtered real data)</span>
                                  </p>
                                </div>
                                <Badge 
                                  variant={courseAverage >= 90 ? "default" : courseAverage >= 80 ? "secondary" : courseAverage >= 70 ? "outline" : "destructive"}
                                  className="ml-2"
                                >
                                  {courseAverage >= 90 ? 'A' : courseAverage >= 80 ? 'B' : courseAverage >= 70 ? 'C' : courseAverage >= 60 ? 'D' : 'F'}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2">
                                {recentGrades.map((grade, index) => {
                                  console.log(`🎓 Rendering grade ${index + 1}:`, grade);
                                  
                                  // Extract grade percentage - handle both formats
                                  const gradePercentage = grade.percentage || (grade.pointsAwarded ? (grade.pointsAwarded > 1 ? grade.pointsAwarded : grade.pointsAwarded * 100) : 0);
                                  
                                  // Extract assignment name - try multiple fields
                                  const assignmentName = grade.assignmentTitle || `Assignment ${index + 1}`;
                                  
                                  // Extract assignment type
                                  const assignmentType = grade.assignmentType || 'Assignment';
                                  
                                  return (
                                    <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                      <span className="text-gray-600 truncate flex-1 mr-2">
                                        {assignmentName}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span 
                                          className={`font-medium ${
                                            gradePercentage >= 90 ? 'text-green-600' : 
                                            gradePercentage >= 80 ? 'text-blue-600' : 
                                            gradePercentage >= 70 ? 'text-yellow-600' : 'text-red-600'
                                          }`}
                                        >
                                          {gradePercentage?.toFixed(1) || '0.0'}%
                                        </span>
                                        {grade.pointsAwarded && (
                                          <span className="text-xs text-gray-500">
                                            ({grade.pointsAwarded} pts)
                                          </span>
                                        )}
                                        <Badge 
                                          variant="outline" 
                                          className="text-xs px-1 py-0"
                                        >
                                          {assignmentType.toLowerCase()}
                                        </Badge>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {validGrades.length > 3 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700">
                                    View {validGrades.length - 3} more valid assignment{validGrades.length - 3 !== 1 ? 's' : ''}
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
                <div className="space-y-2">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="font-medium">No grades available yet</p>
                  <p className="text-sm">Your grades will appear here once assignments are graded.</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Payments */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Payments</h2>
              <Link to="/student/my-payments">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {paymentsLoading ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
                  <div className="inline-flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                    <span>Loading your payment history...</span>
                  </div>
                </div>
              ) : latestPayments.length > 0 ? (
                latestPayments.map((payment) => (
                  <Card 
                    key={payment.id} 
                    className={`border ${
                      payment.paymentStatus === 'PENDING' 
                        ? 'bg-yellow-50 border-yellow-200 shadow-sm' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${paymentStatusBadge(payment.paymentStatus)} text-xs`}>
                              {formatProgressLabel(payment.paymentStatus)}
                            </Badge>
                            {payment.paymentStatus === 'PENDING' && (
                              <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                                Action Required
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">Ref: {payment.transactionReference || '—'}</span>
                          </div>
                          <h3 className="font-semibold text-sm mb-1">{payment.courseName || 'Course payment'}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(payment.paymentDate)}</span>
                            </div>
                            {payment.paymentMethod && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{payment.paymentMethod}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="text-xl font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                          {payment.paymentStatus === 'PENDING' && (
                            <div className="mt-2 space-x-2">
                              <Button 
                                size="sm" 
                                className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  // Handle payment completion
                                  console.log('Complete payment for:', payment.id);
                                  alert(`Redirecting to payment gateway for ${payment.courseName}`);
                                }}
                              >
                                Pay Now
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-7 px-3 text-xs"
                                onClick={() => {
                                  // Handle payment details view
                                  console.log('View payment details for:', payment.id);
                                  navigate('/student/my-payments');
                                }}
                              >
                                Details
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
                  No payments recorded yet.
                </div>
              )}
            </div>
          </div>
          </>
          )}
        </main>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Placeholder sidebar space to keep layout consistent */}
      <div className="w-80" />
      <div className="flex-1 flex flex-col">
        {renderHeader()}
        <main className="flex-1 p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrolledCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course}
                isEnrolled={true}
                showEnrollButton={true}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-80" />
      <div className="flex-1 flex flex-col">
        {renderHeader()}
        <main className="flex-1 p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Assignments</h2>
          </div>
          <div className="space-y-4">
            {enrolledCourses.map((course, idx) => (
              <Card key={course.id} className="bg-white border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600">Assignment {idx + 1}: {course.category} Basics</p>
                      <p className="text-xs text-gray-500 mt-1">Due: Next week</p>
                    </div>
                    <div className="min-w-[180px] text-right">
                      <div className="text-xs text-gray-500 mb-1">Progress</div>
                      <Progress value={(idx + 1) * 20} />
                      <div className="text-xs text-gray-500 mt-1">{(idx + 1) * 20}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );

  const renderGrades = () => (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-80" />
      <div className="flex-1 flex flex-col">
        {renderHeader()}
        <main className="flex-1 p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Grades</h2>
          </div>
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-0 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="text-left px-4 py-3 font-medium">Course</th>
                    <th className="text-left px-4 py-3 font-medium">Quizzes</th>
                    <th className="text-left px-4 py-3 font-medium">Summative</th>
                    <th className="text-left px-4 py-3 font-medium">Final</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledCourses.map((course, i) => {
                    const quiz = 60 + (i * 7) % 40;
                    const summative = 55 + (i * 11) % 45;
                    const finalScore = Math.round((quiz * 0.4) + (summative * 0.6));
                    return (
                      <tr key={course.id} className="border-t">
                        <td className="px-4 py-3 text-gray-900">{course.title}</td>
                        <td className="px-4 py-3">{quiz}%</td>
                        <td className="px-4 py-3">{summative}%</td>
                        <td className="px-4 py-3 font-semibold">{finalScore}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );

  const renderByTab = () => {
    switch (activeTab) {
      case 'courses':
        return renderCourses();
      case 'assignments':
        return renderAssignments();
      case 'grades':
        return renderGrades();
      default:
        return renderProgress();
    }
  };

  return renderByTab();
};

export default StudentDashboard;