import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockCoachStats } from '@/data/mockData';
import { 
  Users, DollarSign, BookOpen, Star, Plus, Calendar, MessageCircle, BarChart3, 
  Loader2, ChevronDown, ArrowRight, CheckCircle, TrendingUp, 
  Award, Home, FileText, GraduationCap, Settings, HelpCircle, LogOut, 
  Clock, User, CreditCard, AlertTriangle, Play, Edit, Eye, 
  Activity, Upload, Save, Camera, EyeOff, Trash2, MoreVertical, RefreshCw,
  MoreHorizontal, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  checkInstructorApprovalStatus, 
  getCoachProfile, 
  updateCoachProfile,
  getInstructorCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorEnrollments,
  getCourseEnrollments,
  getStudentEnrollmentDetails,
  getEnrollmentStatistics,
  getCourseEnrollmentCount
} from '@/ApiConfig/CoachConnection';
import {
  createModule,
  getCourseModules,
  updateModule,
  deleteModule,
  createAssignment,
  getModuleAssignments,
  updateAssignment,
  deleteAssignment,
  getAllAssignments,
  getAssignmentById,
  createResource,
  getModuleResources,
  updateResource,
  deleteResource,
  getAllResources,
  getResourceById,
  getAssignmentSubmissions,
  getCourseSubmissions,
  getSubmissionStatistics,
  gradeSubmission,
  updateGrade,
  getUngradedSubmissions,
  getCourseGrades,
  getStudentGrades,
  getGradeStatistics,
  getInstructorEarnings,
  getCoursePayments,
  getAllInstructorPayments,
  getCoursePaymentAnalytics
} from '@/ApiConfig/InstructorServices';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const CoachDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students' | 'modules' | 'assignments' | 'resources' | 'submissions' | 'grades' | 'analytics' | 'profile'>('overview');
  const [coachProfile, setCoachProfile] = useState<any>(null);
  
  // Course management states
  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    price: '',
    duration: '',
    thumbnail: null as File | null
  });
  
  // Profile management states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    areaOfExperience: '',
    yearsOfExperience: '',
    professionalBio: '',
    resume: null as File | null,
    certificate: null as File | null,
    image: null as File | null
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // Enrollment management states
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [enrollmentStatistics, setEnrollmentStatistics] = useState<any>(null);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<any>(null);
  const [isViewingStudentDetails, setIsViewingStudentDetails] = useState(false);
  const [enrollmentPage, setEnrollmentPage] = useState(0);
  const [enrollmentPageSize] = useState(10);
  
  // Instructor service states
  const [modules, setModules] = useState<any[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [grades, setGrades] = useState<any[]>([]);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradeStatistics, setGradeStatistics] = useState<any>(null);
  const [submissionStatistics, setSubmissionStatistics] = useState<any>(null);
  
  // Earnings and payment states
  const [earnings, setEarnings] = useState<any>(null);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentAnalytics, setPaymentAnalytics] = useState<any>(null);

  // Overview dashboard states
  const [overviewStats, setOverviewStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalEnrollments: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0
  });
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  
  // Modal and form states
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [isCreatingResource, setIsCreatingResource] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    position: 1
  });
  
  const [assignmentForm, setAssignmentForm] = useState({
    moduleId: '',
    title: '',
    description: '',
    assignmentType: '',
    maxPoints: 100,
    dueDate: '',
    document: null as File | null
  });
  
  const [resourceForm, setResourceForm] = useState({
    moduleId: '',
    title: '',
    description: '',
    resourceType: '',
    link: '',
    file: null as File | null
  });

  // Grading and submission states
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isGradingSubmission, setIsGradingSubmission] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    pointsAwarded: 0,
    feedback: ''
  });
  const [gradingLoading, setGradingLoading] = useState(false);
  
  // Grade details viewing states
  const [selectedGrade, setSelectedGrade] = useState<any>(null);
  const [isViewingGradeDetails, setIsViewingGradeDetails] = useState(false);
  
  // Manual grade entry states
  const [isCreatingManualGrade, setIsCreatingManualGrade] = useState(false);
  const [manualGradeForm, setManualGradeForm] = useState({
    studentId: '',
    assignmentId: '',
    pointsAwarded: 0,
    feedback: ''
  });

  // Analytics states
  const [analyticsData, setAnalyticsData] = useState<any>({
    courseAnalytics: [],
    overallStats: null,
    enrollmentTrends: [],
    revenueTrends: [],
    performanceMetrics: null,
    earningsData: null
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem('authtoken');
        const userRole = localStorage.getItem('userRole');
        
        if (!token || userRole !== 'INSTRUCTOR') {
          toast({
            title: "Access Denied",
            description: "Please login as an instructor to access this page.",
            variant: "destructive"
          });
          navigate('/coach/login');
          return;
        }

        // Check approval status and get profile data from backend
        const approvalStatus = await checkInstructorApprovalStatus();
        
        if (!approvalStatus.isApproved) {
          toast({
            title: "Account Pending",
            description: "Your instructor account is still pending approval. Please wait for admin approval.",
            variant: "destructive"
          });
          navigate('/coach/login');
          return;
        }

        // Set coach profile from API response
        if (approvalStatus.data) {
          setCoachProfile(approvalStatus.data);
          
          // Initialize profile form with existing data from API
          const instructorData = approvalStatus.data.instructorData;
          if (instructorData) {
            setProfileForm({
              firstName: approvalStatus.data.firstName || '',
              lastName: approvalStatus.data.lastName || '',
              email: approvalStatus.data.email || '',
              password: '',
              phoneNumber: instructorData.phoneNumber || '',
              areaOfExperience: instructorData.areaOfExperience || '',
              yearsOfExperience: instructorData.yearOfExperience || '',
              professionalBio: instructorData.professionBio || '',
              resume: null,
              certificate: null,
              image: null
            });
          }
          
          // Also update localStorage for consistency
          localStorage.setItem('userInfo', JSON.stringify(approvalStatus.data));
        }

        // Load enrollment data and statistics
        try {
          await fetchEnrollments();
          await fetchEnrollmentStatistics();
          await fetchCourses(); // Load courses data
          await fetchOverviewData(); // Load comprehensive dashboard data
        } catch (enrollmentError) {
          console.error('Failed to load enrollment data:', enrollmentError);
          // Don't block the dashboard if enrollment data fails
        }

      } catch (error) {
        console.error('Authentication check failed:', error);
        toast({
          title: "Authentication Error",
          description: "Please login again.",
          variant: "destructive"
        });
        navigate('/coach/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [navigate, toast]);

  const handleLogout = () => {
    // Clear all coach data from localStorage
    localStorage.removeItem('authtoken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('approvalStatus');
    
    // Navigate to home page
    navigate('/');
  };

  // Course management functions
  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await getInstructorCourses();
      
      if (response.success && response.data) {
        console.log('Raw courses data received:', response.data);
        console.log('Number of courses:', response.data.length);
        
        // Clean up course names by removing extra quotes
        const cleanedCourses = response.data.map(course => ({
          ...course,
          courseName: course.courseName?.replace(/"/g, '') || course.courseName
        }));
        
        console.log('Cleaned courses data:', cleanedCourses);
        setCourses(cleanedCourses);
      } else {
        setCourses([]);
      }
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch courses",
        variant: "destructive"
      });
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCourseForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCourseSelectChange = (value: string, field: string) => {
    setCourseForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCourseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCourseForm(prev => ({
      ...prev,
      thumbnail: file
    }));
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      description: '',
      category: '',
      level: '',
      price: '',
      duration: '',
      thumbnail: null
    });
    setEditingCourseId(null);
    setIsCreatingCourse(false);
  };

  const handleCreateCourse = async () => {
    // Validate required fields
    if (!courseForm.title.trim() || !courseForm.description.trim() || 
        !courseForm.price || !courseForm.duration) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setCoursesLoading(true);
      
      // Create FormData object that matches backend CourseRequest DTO
      const formData = new FormData();
      formData.append('courseName', courseForm.title.trim());
      formData.append('courseDescription', courseForm.description.trim());
      formData.append('durationInHours', courseForm.duration);
      formData.append('price', courseForm.price);
      
      // Add thumbnail image if provided
      if (courseForm.thumbnail) {
        formData.append('image', courseForm.thumbnail);
      }
      
      const response = await createCourse(formData);
      
      if (response.success) {
        toast({
          title: "Course Created",
          description: "Your course has been successfully created.",
        });
        
        resetCourseForm();
        fetchCourses(); // Refresh courses list
      }
      
    } catch (error: any) {
      console.error('Course creation error:', error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourseId) return;

    // Validate required fields
    if (!courseForm.title.trim() || !courseForm.description.trim() || 
        !courseForm.price || !courseForm.duration) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setCoursesLoading(true);
      
      // Create FormData object that matches backend CourseRequest DTO
      const formData = new FormData();
      formData.append('courseName', courseForm.title.trim());
      formData.append('courseDescription', courseForm.description.trim());
      formData.append('durationInHours', courseForm.duration);
      formData.append('price', courseForm.price);
      
      // Add thumbnail image if provided
      if (courseForm.thumbnail) {
        formData.append('image', courseForm.thumbnail);
      }
      
      const response = await updateCourse(editingCourseId, formData);
      
      if (response.success) {
        toast({
          title: "Course Updated",
          description: "Your course has been successfully updated.",
        });
        
        resetCourseForm();
        fetchCourses(); // Refresh courses list
      }
      
    } catch (error: any) {
      console.error('Course update error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleEditCourse = (course: any) => {
    setCourseForm({
      title: course.courseName || '',
      description: course.courseDescription || '',
      category: course.category || '',
      level: course.level || '',
      price: course.price?.toString() || '',
      duration: course.durationInHours?.toString() || '',
      thumbnail: null
    });
    setEditingCourseId(course.id);
    setIsCreatingCourse(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      setCoursesLoading(true);
      
      const response = await deleteCourse(courseId);

      // Ensure response is not void before accessing its properties
      if (response && response.success) {
        toast({
          title: "Course Deleted",
          description: "Your course has been successfully deleted.",
        });

        fetchCourses(); // Refresh courses list
      }
      
    } catch (error: any) {
      console.error('Course deletion error:', error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCoursesLoading(false);
    }
  };

  // Load courses when switching to courses tab
  useEffect(() => {
    console.log('Course loading useEffect - activeTab:', activeTab, 'courses.length:', courses.length, 'coursesLoading:', coursesLoading);
    
    if (activeTab === 'courses' && courses.length === 0 && !coursesLoading) {
      console.log('Triggering fetchCourses...');
      fetchCourses();
    }
  }, [activeTab]);

  // Auto-select course and load instructor service data when needed
  useEffect(() => {
    const instructorServiceTabs = ['modules', 'assignments', 'resources', 'submissions', 'grades'];
    
    if (instructorServiceTabs.includes(activeTab) && courses.length === 0 && !coursesLoading) {
      console.log('Loading courses for instructor service tab:', activeTab);
      fetchCourses();
    }
    
    // Auto-select first course if none selected and we have courses
    if (instructorServiceTabs.includes(activeTab) && courses.length > 0 && !selectedCourseId) {
      const firstCourse = courses[0];
      const displayName = getCourseDisplayName(firstCourse);
      console.log('Auto-selecting first course:', displayName);
      setSelectedCourseId(firstCourse.id);
      toast({
        title: "Course Auto-Selected",
        description: `Automatically selected "${displayName}" course.`,
      });
    }
  }, [activeTab, courses, selectedCourseId, coursesLoading]);

  // Load assignments when assignments tab is selected or course changes
  useEffect(() => {
    if (activeTab === 'assignments' && selectedCourseId) {
      console.log('Loading assignments for course:', selectedCourseId);
      fetchAllAssignments();
    }
  }, [activeTab, selectedCourseId]);

  // Load resources when resources tab is selected or course changes
  useEffect(() => {
    if (activeTab === 'resources' && selectedCourseId) {
      console.log('Loading resources for course:', selectedCourseId);
      fetchAllResources();
    }
  }, [activeTab, selectedCourseId]);

  // Load analytics data when analytics tab is selected
  useEffect(() => {
    if (activeTab === 'analytics' && courses.length > 0) {
      console.log('Loading analytics data for all courses...');
      fetchAnalyticsData();
    }
  }, [activeTab, courses]);

  // Load earnings data when component mounts or when switching to overview/analytics tabs
  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'analytics') {
      fetchOverviewData(); // Use comprehensive data fetch for overview
      fetchEarningsData(); // Keep separate earnings fetch for analytics
    }
  }, [activeTab]);

  // Enrollment management functions
  const fetchEnrollments = async () => {
    try {
      setEnrollmentsLoading(true);
      console.log('Fetching instructor enrollments...');
      
      // Check authentication before making API call
      const token = localStorage.getItem('authtoken');
      const userRole = localStorage.getItem('userRole');
      
      if (!token || userRole !== 'INSTRUCTOR') {
        console.error('Authentication error: Missing token or incorrect role');
        toast({
          title: "Authentication Error",
          description: "Please login again as an instructor.",
          variant: "destructive"
        });
        navigate('/coach/login');
        return;
      }
      
      const response = await getInstructorEnrollments(enrollmentPage, enrollmentPageSize);
      
      if (response.success && response.data) {
        // Ensure we're setting an array, handle both array and paginated response formats
        const enrollmentsData = Array.isArray(response.data) 
          ? response.data 
          : response.data.content || [];
        
        setEnrollments(enrollmentsData);
        console.log('Enrollments fetched successfully:', enrollmentsData);
        
        toast({
          title: "Enrollments Loaded",
          description: "Student enrollments have been successfully loaded.",
        });
      } else {
        throw new Error(response.message || 'Failed to load enrollments');
      }
    } catch (error: any) {
      console.error('Error fetching enrollments:', error);
      
      // Handle specific error types
      if (error.message?.includes('Session expired') || error.message?.includes('401')) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please login again.",
          variant: "destructive"
        });
        navigate('/coach/login');
      } else if (error.message?.includes('Access denied') || error.message?.includes('403')) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view enrollment data.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Loading Failed",
          description: error.message || "Failed to load student enrollments. Please try again.",
          variant: "destructive"
        });
      }
      setEnrollments([]);
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const fetchEnrollmentStatistics = async () => {
    try {
      console.log('Fetching enrollment statistics...');
      
      const response = await getEnrollmentStatistics();
      
      if (response.success && response.data) {
        setEnrollmentStatistics(response.data);
        console.log('Enrollment statistics fetched successfully:', response.data);
      } else {
        console.warn('Failed to fetch enrollment statistics:', response.message);
      }
    } catch (error: any) {
      console.error('Error fetching enrollment statistics:', error);
      // Don't show error toast for statistics as it's not critical
    }
  };

  const fetchStudentDetails = async (courseId: string, studentId: string) => {
    try {
      setEnrollmentsLoading(true);
      console.log(`Fetching details for student ${studentId} in course ${courseId}...`);
      
      const response = await getStudentEnrollmentDetails(courseId, studentId);
      
      if (response.success && response.data) {
        setSelectedStudentDetails(response.data);
        setIsViewingStudentDetails(true);
        console.log('Student enrollment details fetched successfully:', response.data);
        
        toast({
          title: "Student Details",
          description: "Student enrollment details loaded successfully.",
        });
      } else {
        throw new Error(response.message || 'Failed to fetch student enrollment details');
      }
    } catch (error: any) {
      console.error('Error fetching student enrollment details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load student enrollment details.",
        variant: "destructive"
      });
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  // Load enrollments when switching to students tab
  useEffect(() => {
    if (activeTab === 'students' && Array.isArray(enrollments) && enrollments.length === 0 && !enrollmentsLoading) {
      fetchEnrollments();
      fetchEnrollmentStatistics();
    }
  }, [activeTab]);

  // ==================== INSTRUCTOR SERVICE FUNCTIONS ====================

  // Module management functions
  const fetchModules = async (courseId: string) => {
    if (!courseId) return;
    
    try {
      setModulesLoading(true);
      const response = await getCourseModules(courseId);
      
      if (response.success && response.data) {
        setModules(response.data);
      } else {
        throw new Error(response.message || 'Failed to load modules');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load course modules",
        variant: "destructive"
      });
    } finally {
      setModulesLoading(false);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourseId || !moduleForm.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setModulesLoading(true);
      
      // Check token before making request
      const token = localStorage.getItem('authtoken');
      console.log('Current token exists:', !!token);
      console.log('Token length:', token ? token.length : 0);
      
      if (!token) {
        toast({
          title: "Authentication Error", 
          description: "Please login again to continue",
          variant: "destructive"
        });
        navigate('/coach/login');
        return;
      }
      
      const moduleData = {
        courseId: selectedCourseId,
        title: moduleForm.title,
        description: moduleForm.description,
        position: moduleForm.position
      };

      console.log('Creating module with data:', moduleData);
      const response = await createModule(moduleData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Module created successfully"
        });
        
        setModuleForm({
          title: '',
          description: '',
          position: 1
        });
        setIsCreatingModule(false);
        
        // Refresh courses list to get updated modules
        await fetchCourses();
      } else {
        throw new Error(response.message || 'Failed to create module');
      }
    } catch (error: any) {
      console.error('Error creating module:', error);
      
      // Handle 401 specifically
      if (error.response?.status === 401 || error.message?.includes('401')) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please login again.",
          variant: "destructive"
        });
        localStorage.removeItem('authtoken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userInfo');
        navigate('/coach/login');
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to create module",
        variant: "destructive"
      });
    } finally {
      setModulesLoading(false);
    }
  };

  const handleEditModule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingModuleId || !moduleForm.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setModulesLoading(true);
      const moduleData = {
        title: moduleForm.title,
        description: moduleForm.description,
        position: moduleForm.position
      };

      const response = await updateModule(editingModuleId, moduleData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Module updated successfully"
        });
        
        setModuleForm({
          title: '',
          description: '',
          position: 1
        });
        setEditingModuleId(null);
        
        // Refresh courses list to get updated modules
        await fetchCourses();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update module",
        variant: "destructive"
      });
    } finally {
      setModulesLoading(false);
    }
  };

  // Assignment management functions
  const fetchAssignments = async (moduleId: string) => {
    if (!moduleId) return;
    
    try {
      setAssignmentsLoading(true);
      const response = await getModuleAssignments(moduleId);
      
      if (response.success && response.data) {
        setAssignments(response.data);
      } else {
        throw new Error(response.message || 'Failed to load assignments');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load assignments",
        variant: "destructive"
      });
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assignmentForm.moduleId || !assignmentForm.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setAssignmentsLoading(true);
      const formData = new FormData();
      formData.append('moduleId', assignmentForm.moduleId);
      formData.append('title', assignmentForm.title);
      formData.append('description', assignmentForm.description);
      formData.append('assignmentType', assignmentForm.assignmentType);
      formData.append('maxPoints', assignmentForm.maxPoints.toString());
      
      if (assignmentForm.dueDate) {
        formData.append('dueDate', assignmentForm.dueDate);
      }
      
      if (assignmentForm.document) {
        formData.append('documentUrl', assignmentForm.document);
      }

      const response = await createAssignment(formData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Assignment created successfully"
        });
        
        setAssignmentForm({
          moduleId: '',
          title: '',
          description: '',
          assignmentType: '',
          maxPoints: 100,
          dueDate: '',
          document: null
        });
        setIsCreatingAssignment(false);
        
        // Refresh courses list to get updated assignments
        await fetchCourses();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive"
      });
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAssignmentId || !assignmentForm.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setAssignmentsLoading(true);
      const formData = new FormData();
      formData.append('moduleId', assignmentForm.moduleId);
      formData.append('title', assignmentForm.title);
      formData.append('description', assignmentForm.description);
      formData.append('assignmentType', assignmentForm.assignmentType);
      formData.append('maxPoints', assignmentForm.maxPoints.toString());
      
      if (assignmentForm.dueDate) {
        formData.append('dueDate', assignmentForm.dueDate);
      }
      
      if (assignmentForm.document) {
        formData.append('documentUrl', assignmentForm.document);
      }

      const response = await updateAssignment(editingAssignmentId, formData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Assignment updated successfully"
        });
        
        setAssignmentForm({
          moduleId: '',
          title: '',
          description: '',
          assignmentType: '',
          maxPoints: 100,
          dueDate: '',
          document: null
        });
        setEditingAssignmentId(null);
        
        // Refresh assignments list
        if (selectedCourseId) {
          await fetchCourses();
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update assignment",
        variant: "destructive"
      });
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      setAssignmentsLoading(true);
      const response = await deleteAssignment(assignmentId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Assignment deleted successfully"
        });
        
        // Refresh courses list
        await fetchCourses();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete assignment",
        variant: "destructive"
      });
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleEditAssignment = async (assignment: any) => {
    setAssignmentForm({
      moduleId: assignment.module?.id || '',
      title: assignment.title || '',
      description: assignment.description || '',
      assignmentType: assignment.assignmentType || '',
      maxPoints: assignment.maxPoints || 100,
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '',
      document: null
    });
    setEditingAssignmentId(assignment.id);
    setIsCreatingAssignment(true);
  };

  const fetchAllAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      const response = await getAllAssignments();
      
      if (response.success && response.data) {
        setAssignments(response.data);
      } else {
        throw new Error(response.message || 'Failed to load assignments');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load assignments",
        variant: "destructive"
      });
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const fetchAssignmentSubmissions = async (assignmentId: string) => {
    try {
      setSubmissionsLoading(true);
      const response = await getAssignmentSubmissions(assignmentId);
      
      if (response.success && response.data) {
        setSubmissions(response.data);
        toast({
          title: "Success",
          description: "Assignment submissions loaded successfully"
        });
      } else {
        throw new Error(response.message || 'Failed to load submissions');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load assignment submissions",
        variant: "destructive"
      });
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Resource management functions
  const fetchResources = async (moduleId: string) => {
    if (!moduleId) return;
    
    try {
      setResourcesLoading(true);
      const response = await getModuleResources(moduleId);
      
      if (response.success && response.data) {
        setResources(response.data);
      } else {
        throw new Error(response.message || 'Failed to load resources');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load resources",
        variant: "destructive"
      });
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resourceForm.moduleId || !resourceForm.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setResourcesLoading(true);
      const formData = new FormData();
      formData.append('moduleId', resourceForm.moduleId);
      formData.append('title', resourceForm.title);
      formData.append('description', resourceForm.description);
      formData.append('resourceType', resourceForm.resourceType);
      
      if (resourceForm.link) {
        formData.append('link', resourceForm.link);
      }
      
      if (resourceForm.file) {
        formData.append('fileUrl', resourceForm.file);
      }

      const response = await createResource(formData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Resource created successfully"
        });
        
        setResourceForm({
          moduleId: '',
          title: '',
          description: '',
          resourceType: '',
          link: '',
          file: null
        });
        setIsCreatingResource(false);
        
        // Refresh courses list to get updated resources
        await fetchCourses();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create resource",
        variant: "destructive"
      });
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleUpdateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingResourceId || !resourceForm.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setResourcesLoading(true);
      const formData = new FormData();
      formData.append('moduleId', resourceForm.moduleId);
      formData.append('title', resourceForm.title);
      formData.append('description', resourceForm.description);
      formData.append('resourceType', resourceForm.resourceType);
      
      if (resourceForm.link) {
        formData.append('link', resourceForm.link);
      }
      
      if (resourceForm.file) {
        formData.append('fileUrl', resourceForm.file);
      }

      const response = await updateResource(editingResourceId, formData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Resource updated successfully"
        });
        
        setResourceForm({
          moduleId: '',
          title: '',
          description: '',
          resourceType: '',
          link: '',
          file: null
        });
        setEditingResourceId(null);
        
        // Refresh courses list to get updated resources
        await fetchCourses();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update resource",
        variant: "destructive"
      });
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }

    try {
      setResourcesLoading(true);
      const response = await deleteResource(resourceId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Resource deleted successfully"
        });
        
        // Refresh courses list
        await fetchCourses();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete resource",
        variant: "destructive"
      });
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleEditResource = async (resource: any) => {
    setResourceForm({
      moduleId: resource.module?.id || '',
      title: resource.title || '',
      description: resource.description || '',
      resourceType: resource.resourceType || '',
      link: resource.link || '',
      file: null
    });
    setEditingResourceId(resource.id);
    setIsCreatingResource(true);
  };

  const fetchAllResources = async () => {
    try {
      setResourcesLoading(true);
      const response = await getAllResources();
      
      if (response.success && response.data) {
        setResources(response.data);
      } else {
        throw new Error(response.message || 'Failed to load resources');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load resources",
        variant: "destructive"
      });
    } finally {
      setResourcesLoading(false);
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Play className="h-4 w-4" />;
      case 'DOCUMENT':
        return <FileText className="h-4 w-4" />;
      case 'SLIDE':
        return <BookOpen className="h-4 w-4" />;
      case 'LINK':
        return <Eye className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'bg-red-100 text-red-800';
      case 'DOCUMENT':
        return 'bg-blue-100 text-blue-800';
      case 'SLIDE':
        return 'bg-green-100 text-green-800';
      case 'LINK':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Submission management functions
  const fetchSubmissions = async (courseId: string) => {
    if (!courseId) return;
    
    try {
      setSubmissionsLoading(true);
      const response = await getCourseSubmissions(courseId);
      
      if (response.success && response.data) {
        setSubmissions(response.data);
      } else {
        throw new Error(response.message || 'Failed to load submissions');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load submissions",
        variant: "destructive"
      });
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const fetchSubmissionStatistics = async (courseId: string) => {
    if (!courseId) return;
    
    try {
      // Calculate statistics from the submissions data
      if (submissions.length > 0) {
        const totalSubmissions = submissions.length;
        const gradedSubmissions = submissions.filter(sub => sub.isGraded).length;
        const pendingSubmissions = totalSubmissions - gradedSubmissions;
        
        // Calculate average grade from graded submissions
        const gradedSubs = submissions.filter(sub => sub.isGraded && sub.grade !== null);
        const avgGrade = gradedSubs.length > 0 
          ? gradedSubs.reduce((sum, sub) => sum + (sub.grade || 0), 0) / gradedSubs.length
          : 0;
        
        setSubmissionStatistics({
          totalSubmissions,
          gradedSubmissions,
          pendingSubmissions,
          averageGrade: Math.round(avgGrade * 100) / 100
        });
      } else {
        setSubmissionStatistics({
          totalSubmissions: 0,
          gradedSubmissions: 0,
          pendingSubmissions: 0,
          averageGrade: 0
        });
      }
    } catch (error: any) {
      console.error('Failed to calculate submission statistics:', error);
      // Set default values on error
      setSubmissionStatistics({
        totalSubmissions: 0,
        gradedSubmissions: 0,
        pendingSubmissions: 0,
        averageGrade: 0
      });
    }
  };

  const handleGradeSubmission = async (submissionId: string, pointsAwarded: number, feedback: string = '') => {
    try {
      const response = await gradeSubmission({ submissionId, pointsAwarded, feedback });
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Submission graded successfully"
        });
        
        // Refresh submissions and grades
        if (selectedCourseId) {
          await fetchSubmissions(selectedCourseId);
          await fetchGrades(selectedCourseId);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to grade submission",
        variant: "destructive"
      });
    }
  };

  // Open grading dialog
  const openGradingDialog = (submission: any) => {
    setSelectedSubmission(submission);
    setGradeForm({
      pointsAwarded: submission.grade || 0,
      feedback: submission.feedback || ''
    });
    setIsGradingSubmission(true);
  };

  // Handle grading form submission
  const handleGradeFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      setGradingLoading(true);
      
      if (selectedSubmission.isGraded && selectedSubmission.gradeId) {
        // Update existing grade
        await updateGrade(selectedSubmission.gradeId, {
          submissionId: selectedSubmission.id,
          pointsAwarded: gradeForm.pointsAwarded,
          feedback: gradeForm.feedback
        });
      } else {
        // Create new grade
        await gradeSubmission({
          submissionId: selectedSubmission.id,
          pointsAwarded: gradeForm.pointsAwarded,
          feedback: gradeForm.feedback
        });
      }

      toast({
        title: "Success",
        description: selectedSubmission.isGraded ? "Grade updated successfully" : "Submission graded successfully"
      });

      setIsGradingSubmission(false);
      setSelectedSubmission(null);
      setGradeForm({ pointsAwarded: 0, feedback: '' });

      // Refresh data
      if (selectedCourseId) {
        await fetchSubmissions(selectedCourseId);
        await fetchSubmissionStatistics(selectedCourseId);
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save grade",
        variant: "destructive"
      });
    } finally {
      setGradingLoading(false);
    }
  };

  // Grade management functions
  const fetchGrades = async (courseId: string) => {
    if (!courseId) return;
    
    try {
      setGradesLoading(true);
      const response = await getCourseGrades(courseId);
      
      if (response.success && response.data) {
        setGrades(response.data);
      } else {
        throw new Error(response.message || 'Failed to load grades');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load grades",
        variant: "destructive"
      });
    } finally {
      setGradesLoading(false);
    }
  };

  const fetchGradeStatistics = async (courseId: string) => {
    if (!courseId) return;
    
    try {
      const response = await getGradeStatistics(courseId);
      
      if (response.success && response.data) {
        setGradeStatistics(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load grade statistics:', error);
    }
  };

  const handleViewGradeDetails = (grade: any) => {
    setSelectedGrade(grade);
    setIsViewingGradeDetails(true);
  };

  const handleCreateManualGrade = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualGradeForm.studentId || !manualGradeForm.assignmentId || manualGradeForm.pointsAwarded < 0 || manualGradeForm.pointsAwarded > 100) {
      toast({
        title: "Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive"
      });
      return;
    }

    try {
      setGradingLoading(true);
      
      // Create a manual grade entry - this might need a different endpoint
      const response = await gradeSubmission({
        submissionId: manualGradeForm.assignmentId, // This might need adjustment based on your API
        pointsAwarded: manualGradeForm.pointsAwarded,
        feedback: manualGradeForm.feedback
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Manual grade created successfully",
        });
        
        setIsCreatingManualGrade(false);
        resetManualGradeForm();
        
        // Refresh grades data
        if (selectedCourseId) {
          await fetchGrades(selectedCourseId);
          await fetchGradeStatistics(selectedCourseId);
        }
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create manual grade",
        variant: "destructive"
      });
    } finally {
      setGradingLoading(false);
    }
  };

  const resetManualGradeForm = () => {
    setManualGradeForm({
      studentId: '',
      assignmentId: '',
      pointsAwarded: 0,
      feedback: ''
    });
  };

  // Analytics functions
  const fetchAnalyticsData = async () => {
    if (!courses.length) return;

    try {
      setAnalyticsLoading(true);
      
      // Fetch overall earnings data first
      let earningsData = null;
      try {
        const earningsResponse = await getInstructorEarnings();
        if (earningsResponse.success) {
          earningsData = earningsResponse.data;
          setEarnings(earningsData);
        }
      } catch (error) {
        console.warn('Failed to fetch earnings data:', error);
      }
      
      // Fetch analytics for each course
      const courseAnalyticsPromises = courses.map(async (course) => {
        const [
          enrollmentStats,
          enrollmentCount,
          gradeStats,
          submissionStats,
          paymentAnalytics
        ] = await Promise.allSettled([
          getEnrollmentStatistics(),
          getCourseEnrollmentCount(course.id),
          getGradeStatistics(course.id),
          getSubmissionStatistics(course.id),
          getCoursePaymentAnalytics(course.id)
        ]);

        return {
          courseId: course.id,
          courseName: course.title,
          courseImage: course.thumbnail,
          enrollmentCount: enrollmentCount.status === 'fulfilled' && enrollmentCount.value?.success ? 
            enrollmentCount.value.data || 0 : 0,
          gradeStats: gradeStats.status === 'fulfilled' && gradeStats.value?.success ? 
            gradeStats.value.data : null,
          submissionStats: submissionStats.status === 'fulfilled' && submissionStats.value?.success ? 
            submissionStats.value.data : null,
          paymentAnalytics: paymentAnalytics.status === 'fulfilled' && paymentAnalytics.value?.success ? 
            paymentAnalytics.value.data : null,
          moduleCount: course.modules?.length || 0,
          assignmentCount: course.modules?.flatMap(m => m.assignments || []).length || 0,
          resourceCount: course.modules?.flatMap(m => m.resources || []).length || 0
        };
      });

      const courseAnalytics = await Promise.all(courseAnalyticsPromises);
      
      // Calculate overall statistics
      const totalEnrollments = courseAnalytics.reduce((sum, course) => sum + course.enrollmentCount, 0);
      const totalCourses = courses.length;
      const totalModules = courseAnalytics.reduce((sum, course) => sum + course.moduleCount, 0);
      const totalAssignments = courseAnalytics.reduce((sum, course) => sum + course.assignmentCount, 0);
      const totalResources = courseAnalytics.reduce((sum, course) => sum + course.resourceCount, 0);
      
      // Calculate revenue statistics
      const totalRevenue = earningsData?.totalRevenue || 0;
      const successfulPayments = earningsData?.successfulPayments || 0;
      const pendingPayments = earningsData?.pendingPayments || 0;
      const failedPayments = earningsData?.failedPayments || 0;
      const averagePayment = earningsData?.averagePaymentAmount || 0;
      
      // Calculate average grade across all courses
      const gradesData = courseAnalytics.filter(course => course.gradeStats).map(course => course.gradeStats);
      const averageGrade = gradesData.length > 0 
        ? gradesData.reduce((sum, stats) => sum + (stats.averageGrade || 0), 0) / gradesData.length 
        : 0;

      // Calculate overall submission statistics
      const submissionsData = courseAnalytics.filter(course => course.submissionStats?.totalSubmissions);
      const totalSubmissions = submissionsData.reduce((sum, course) => sum + (course.submissionStats?.totalSubmissions || 0), 0);
      const totalGradedSubmissions = submissionsData.reduce((sum, course) => sum + (course.submissionStats?.gradedSubmissions || 0), 0);

      setAnalyticsData({
        courseAnalytics,
        earningsData,
        overallStats: {
          totalEnrollments,
          totalCourses,
          totalModules,
          totalAssignments,
          totalResources,
          averageGrade: Math.round(averageGrade * 100) / 100,
          totalSubmissions,
          totalGradedSubmissions,
          pendingGrades: totalSubmissions - totalGradedSubmissions,
          totalRevenue,
          successfulPayments,
          pendingPayments,
          failedPayments,
          averagePayment
        },
        enrollmentTrends: courseAnalytics.map(course => ({
          courseName: course.courseName,
          enrollmentCount: course.enrollmentCount
        })),
        revenueTrends: courseAnalytics.map(course => ({
          courseName: course.courseName,
          revenue: course.paymentAnalytics?.totalRevenue || 0,
          payments: course.paymentAnalytics?.successfulPayments || 0
        })),
        performanceMetrics: {
          bestPerformingCourse: courseAnalytics.reduce((best, current) => 
            (current.gradeStats?.averageGrade || 0) > (best?.gradeStats?.averageGrade || 0) ? current : best
          , null),
          mostPopularCourse: courseAnalytics.reduce((popular, current) => 
            current.enrollmentCount > (popular?.enrollmentCount || 0) ? current : popular
          , null),
          highestEarningCourse: courseAnalytics.reduce((highest, current) => 
            (current.paymentAnalytics?.totalRevenue || 0) > (highest?.paymentAnalytics?.totalRevenue || 0) ? current : highest
          , null)
        }
      });

    } catch (error: any) {
      console.error('Failed to fetch analytics data:', error);
      toast({
        title: "Analytics Error",
        description: "Failed to load analytics data. Some features may not be available.",
        variant: "destructive"
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch earnings data independently
  const fetchEarningsData = async () => {
    try {
      setEarningsLoading(true);
      
      const earningsResponse = await getInstructorEarnings();
      if (earningsResponse.success) {
        setEarnings(earningsResponse.data);
        toast({
          title: "Earnings Updated",
          description: "Latest earnings data has been loaded.",
        });
      }

      const paymentsResponse = await getAllInstructorPayments();
      if (paymentsResponse.success) {
        setPayments(paymentsResponse.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch earnings data:', error);
      toast({
        title: "Earnings Error",
        description: "Failed to load earnings data.",
        variant: "destructive"
      });
    } finally {
      setEarningsLoading(false);
    }
  };

  // Fetch comprehensive overview data for dashboard
  const fetchOverviewData = async () => {
    try {
      setOverviewLoading(true);
      console.log('Fetching comprehensive overview data...');
      
      // Initialize stats object
      let stats = {
        totalCourses: 0,
        totalStudents: 0,
        totalEarnings: 0,
        averageRating: 0,
        totalEnrollments: 0,
        successfulPayments: 0,
        pendingPayments: 0,
        failedPayments: 0
      };

      // 1. Fetch instructor courses
      try {
        const coursesResponse = await getInstructorCourses();
        if (coursesResponse.success && coursesResponse.data) {
          setCourses(coursesResponse.data);
          stats.totalCourses = coursesResponse.data.length;
          
          // Calculate average rating from courses
          const coursesWithRatings = coursesResponse.data.filter(course => course.averageRating > 0);
          if (coursesWithRatings.length > 0) {
            stats.averageRating = coursesWithRatings.reduce((sum, course) => sum + course.averageRating, 0) / coursesWithRatings.length;
          }
          
          console.log('Courses loaded:', coursesResponse.data.length);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }

      // 2. Fetch enrollment statistics
      try {
        const enrollmentStatsResponse = await getEnrollmentStatistics();
        if (enrollmentStatsResponse.success && enrollmentStatsResponse.data) {
          setEnrollmentStatistics(enrollmentStatsResponse.data);
          stats.totalEnrollments = enrollmentStatsResponse.data.totalEnrollments || 0;
          stats.totalStudents = enrollmentStatsResponse.data.totalStudents || 0;
          
          console.log('Enrollment stats loaded:', enrollmentStatsResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch enrollment statistics:', error);
      }

      // 3. Fetch earnings and payment data
      try {
        const earningsResponse = await getInstructorEarnings();
        if (earningsResponse.success && earningsResponse.data) {
          setEarnings(earningsResponse.data);
          stats.totalEarnings = earningsResponse.data.totalRevenue || 0;
          stats.successfulPayments = earningsResponse.data.successfulPayments || 0;
          stats.pendingPayments = earningsResponse.data.pendingPayments || 0;
          stats.failedPayments = earningsResponse.data.failedPayments || 0;
          
          console.log('Earnings data loaded:', earningsResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch earnings data:', error);
      }

      // 4. Fetch all instructor payments for recent activity
      try {
        const paymentsResponse = await getAllInstructorPayments();
        if (paymentsResponse.success && paymentsResponse.data) {
          setPayments(paymentsResponse.data);
          
          // Generate recent activity from payments and enrollments
          const recentPayments = paymentsResponse.data
            .slice(0, 3)
            .map(payment => ({
              type: 'payment',
              message: `New payment from ${payment.student?.firstName || 'Student'} for ${payment.course?.courseName || 'course'}`,
              time: payment.paymentDate || new Date().toISOString(),
              amount: payment.amount,
              status: payment.paymentStatus
            }));
          
          setRecentActivity(recentPayments);
          console.log('Payments data loaded:', paymentsResponse.data.length);
        }
      } catch (error) {
        console.error('Failed to fetch payments data:', error);
      }

      // 5. Fetch instructor enrollments for additional activity data
      try {
        const enrollmentsResponse = await getInstructorEnrollments(0, 5);
        if (enrollmentsResponse.success && enrollmentsResponse.data) {
          // Ensure we're setting an array, handle both array and paginated response formats
          const enrollmentsData = Array.isArray(enrollmentsResponse.data) 
            ? enrollmentsResponse.data 
            : enrollmentsResponse.data.content || [];
          
          setEnrollments(enrollmentsData);
          
          // Add recent enrollments to activity
          const recentEnrollments = enrollmentsData
            .slice(0, 2)
            .map(enrollment => ({
              type: 'enrollment',
              message: `${enrollment.student?.firstName || 'Student'} enrolled in ${enrollment.course?.courseName || 'course'}`,
              time: enrollment.enrollmentDate || new Date().toISOString(),
              status: enrollment.progress
            }));
          
          setRecentActivity(prev => [...prev, ...recentEnrollments].slice(0, 5));
          console.log('Enrollments data loaded:', enrollmentsData.length);
        }
      } catch (error) {
        console.error('Failed to fetch enrollments data:', error);
      }

      // Update overview stats
      setOverviewStats(stats);
      console.log('Overview stats updated:', stats);

    } catch (error) {
      console.error('Failed to fetch overview data:', error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setOverviewLoading(false);
    }
  };

  // Effect to load instructor data when course is selected
  useEffect(() => {
    console.log('useEffect triggered - selectedCourseId:', selectedCourseId, 'courses.length:', courses.length);
    
    if (selectedCourseId && courses.length > 0) {
      // Find the selected course from already loaded courses
      const selectedCourse = courses.find(course => course.id === selectedCourseId);
      console.log('Selected course found:', selectedCourse);
      
      if (selectedCourse && selectedCourse.modules) {
        console.log('Course modules:', selectedCourse.modules);
        // Set modules directly from course data
        setModules(selectedCourse.modules || []);
        
        // Extract all assignments and resources from all modules
        const allAssignments = selectedCourse.modules.flatMap(module => 
          (module.assignments || []).map(assignment => ({
            ...assignment,
            moduleName: module.title,
            moduleId: module.id
          }))
        );
        console.log('All assignments extracted:', allAssignments);
        setAssignments(allAssignments);
        
        const allResources = selectedCourse.modules.flatMap(module => 
          (module.resources || []).map(resource => ({
            ...resource,
            moduleName: module.title,
            moduleId: module.id
          }))
        );
        console.log('All resources extracted:', allResources);
        setResources(allResources);
      }
      
      // Still fetch submission and grade data as these come from separate APIs
      fetchSubmissions(selectedCourseId);
      fetchGrades(selectedCourseId);
      fetchGradeStatistics(selectedCourseId);
    } else {
      // Clear data when no course selected
      console.log('Clearing data - no course selected or no courses loaded');
      setModules([]);
      setAssignments([]);
      setResources([]);
    }
  }, [selectedCourseId, courses]);

  // Calculate submission statistics when submissions data changes
  useEffect(() => {
    if (selectedCourseId && submissions.length >= 0) {
      fetchSubmissionStatistics(selectedCourseId);
    }
  }, [submissions, selectedCourseId]);

  // Utility functions
  const cleanCourseName = (courseName: string) => {
    return courseName ? courseName.replace(/^"|"$/g, '').trim() : '';
  };

  const getCourseDisplayName = (course: any) => {
    const cleanName = cleanCourseName(course.courseName);
    return cleanName || 'Unnamed Course';
  };

  // Profile management functions
  const refreshProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await getCoachProfile();
      
      if (response.success && response.data) {
        setCoachProfile(response.data);
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        
        // Update form data if not editing
        if (!isEditingProfile) {
          const instructorData = response.data.instructorData;
          if (instructorData) {
            setProfileForm({
              firstName: response.data.firstName || '',
              lastName: response.data.lastName || '',
              email: response.data.email || '',
              password: '',
              phoneNumber: instructorData.phoneNumber || '',
              areaOfExperience: instructorData.areaOfExperience || '',
              yearsOfExperience: instructorData.yearOfExperience || '',
              professionalBio: instructorData.professionBio || '',
              resume: null,
              certificate: null,
              image: null
            });
          }
        }
        
        toast({
          title: "Profile Refreshed",
          description: "Profile data has been updated from the server.",
        });
      }
    } catch (error: any) {
      console.error('Error refreshing profile:', error);
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh profile data.",
        variant: "destructive"
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setProfileForm(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const handleUpdateProfile = async () => {
    // Validate required fields
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim() || 
        !profileForm.email.trim() || !profileForm.phoneNumber.trim() ||
        !profileForm.areaOfExperience || !profileForm.yearsOfExperience ||
        !profileForm.professionalBio.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileForm.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    setProfileLoading(true);
    
    try {
      // Create FormData object for file uploads
      const submitData = new FormData();
      
      // Add all form fields
      submitData.append('firstName', profileForm.firstName.trim());
      submitData.append('lastName', profileForm.lastName.trim());
      submitData.append('email', profileForm.email.trim());
      
      if (profileForm.password && profileForm.password.trim()) {
        submitData.append('password', profileForm.password.trim());
      }
      
      submitData.append('phoneNumber', profileForm.phoneNumber.trim());
      submitData.append('areaOfExperience', profileForm.areaOfExperience);
      submitData.append('yearsOfExperience', profileForm.yearsOfExperience);
      submitData.append('professionalBio', profileForm.professionalBio.trim());
      
      // Add files if they exist
      if (profileForm.resume) {
        submitData.append('resume', profileForm.resume);
      }
      if (profileForm.certificate) {
        submitData.append('certificate', profileForm.certificate);
      }
      if (profileForm.image) {
        submitData.append('image', profileForm.image);
      }
      
      const response = await updateCoachProfile(submitData);
      
      if (response.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        
        // Refresh profile data from backend
        const updatedProfile = await getCoachProfile();
        if (updatedProfile.success) {
          setCoachProfile(updatedProfile.data);
          localStorage.setItem('userInfo', JSON.stringify(updatedProfile.data));
          
          // Update form with fresh data
          const instructorData = updatedProfile.data.instructorData;
          if (instructorData) {
            setProfileForm({
              firstName: updatedProfile.data.firstName || '',
              lastName: updatedProfile.data.lastName || '',
              email: updatedProfile.data.email || '',
              password: '',
              phoneNumber: instructorData.phoneNumber || '',
              areaOfExperience: instructorData.areaOfExperience || '',
              yearsOfExperience: instructorData.yearOfExperience || '',
              professionalBio: instructorData.professionBio || '',
              resume: null,
              certificate: null,
              image: null
            });
          }
        }
        
        // Exit edit mode
        setIsEditingProfile(false);
      }
      
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelEdit = async () => {
    try {
      // Reload fresh data from backend
      const profileResponse = await getCoachProfile();
      if (profileResponse.success && profileResponse.data) {
        const freshData = profileResponse.data;
        const instructorData = freshData.instructorData;
        
        setProfileForm({
          firstName: freshData.firstName || '',
          lastName: freshData.lastName || '',
          email: freshData.email || '',
          password: '',
          phoneNumber: instructorData?.phoneNumber || '',
          areaOfExperience: instructorData?.areaOfExperience || '',
          yearsOfExperience: instructorData?.yearOfExperience || '',
          professionalBio: instructorData?.professionBio || '',
          resume: null,
          certificate: null,
          image: null
        });
        
        setCoachProfile(freshData);
      }
    } catch (error) {
      // Fallback to existing data if API fails
      if (coachProfile) {
        const instructorData = coachProfile.instructorData;
        setProfileForm({
          firstName: coachProfile.firstName || '',
          lastName: coachProfile.lastName || '',
          email: coachProfile.email || '',
          password: '',
          phoneNumber: instructorData?.phoneNumber || '',
          areaOfExperience: instructorData?.areaOfExperience || '',
          yearsOfExperience: instructorData?.yearOfExperience || '',
          professionalBio: instructorData?.professionBio || '',
          resume: null,
          certificate: null,
          image: null
        });
      }
    }
    setIsEditingProfile(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Verifying your credentials...</p>
        </div>
      </div>
    );
  }

  const myCourses = courses.slice(0, 3); // Use real courses data for overview

  const upcomingLessons = [
    { course: 'React Development', lesson: 'Advanced Patterns', scheduledAt: 'Today, 2:00 PM', students: 15 },
    { course: 'UI/UX Design', lesson: 'User Research Methods', scheduledAt: 'Tomorrow, 10:00 AM', students: 12 },
    { course: 'JavaScript Fundamentals', lesson: 'Async Programming', scheduledAt: 'Friday, 3:00 PM', students: 8 }
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(value);

  const renderHeader = () => (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Header content removed */}
        </div>
        <div className="flex items-center gap-4">
          {/* Notifications and create course buttons removed */}
        </div>
      </div>
    </header>
  );

  const renderSidebar = () => (
    <div className="w-80 bg-blue-900 text-white flex flex-col">
      {/* Coach Profile Section */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-700">
            <img
              src={
                coachProfile?.imageUrl || 
                coachProfile?.instructorData?.imageUrl || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  (coachProfile?.firstName || 'Coach') + ' ' + (coachProfile?.lastName || '')
                )}&background=random&color=fff`
              }
              alt={coachProfile?.firstName || 'Coach'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {coachProfile?.firstName ? `${coachProfile.firstName} ${coachProfile.lastName || ''}` : 'Coach'}
            </h3>
            <div className="flex items-center gap-2 text-blue-200">
              <span className="text-sm">{coachProfile?.email || '—'}</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-6">
        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'overview' ? 'bg-teal-500 text-white' : 'text-blue-200 hover:bg-blue-800 transition-colors'}`}
          >
            <Home className="h-5 w-5" />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`w-full text-left flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'courses' ? 'bg-teal-500 text-white' : 'text-blue-200 hover:bg-blue-800 transition-colors'}`}
          >
            <BookOpen className="h-5 w-5" />
            My Courses
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`w-full text-left flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'students' ? 'bg-teal-500 text-white' : 'text-blue-200 hover:bg-blue-800 transition-colors'}`}
          >
            <Users className="h-5 w-5" />
            Students
          </button>
          
          {/* Instructor Service Tabs */}
          <button 
            onClick={() => setActiveTab('modules')}
            className={`w-full text-left flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'modules' ? 'bg-teal-500 text-white' : 'text-blue-200 hover:bg-blue-800 transition-colors'}`}
          >
            <BookOpen className="h-5 w-5" />
            Course Modules
          </button>
          <button 
            onClick={() => setActiveTab('assignments')}
            className={`w-full text-left flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'assignments' ? 'bg-teal-500 text-white' : 'text-blue-200 hover:bg-blue-800 transition-colors'}`}
          >
            <FileText className="h-5 w-5" />
            Assignments
          </button>
          <button 
            onClick={() => setActiveTab('resources')}
            className={`w-full text-left flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'resources' ? 'bg-teal-500 text-white' : 'text-blue-200 hover:bg-blue-800 transition-colors'}`}
          >
            <Upload className="h-5 w-5" />
            Resources
          </button>
          <button 
            onClick={() => setActiveTab('submissions')}
            className={`w-full text-left flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'submissions' ? 'bg-teal-500 text-white' : 'text-blue-200 hover:bg-blue-800 transition-colors'}`}
          >
            <Edit className="h-5 w-5" />
            Submissions
          </button>
          <button 
            onClick={() => setActiveTab('grades')}
            className={`w-full text-left flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'grades' ? 'bg-teal-500 text-white' : 'text-blue-200 hover:bg-blue-800 transition-colors'}`}
          >
            <GraduationCap className="h-5 w-5" />
            Grades
          </button>
          
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full text-left flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'analytics' ? 'bg-teal-500 text-white' : 'text-blue-200 hover:bg-blue-800 transition-colors'}`}
          >
            <Activity className="h-5 w-5" />
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left flex items-center gap-3 p-3 rounded-lg font-medium ${activeTab === 'profile' ? 'bg-teal-500 text-white' : 'text-blue-200 hover:bg-blue-800 transition-colors'}`}
          >
            <User className="h-5 w-5" />
            Profile Management
          </button>
          
          {/* External Navigation Links */}
          <div className="mt-6 pt-4 border-t border-blue-800">
            <p className="text-xs text-blue-300 uppercase tracking-wider mb-3">Quick Links</p>
            <Link 
              to="/coach/earnings"
              className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors font-medium"
            >
              <DollarSign className="h-5 w-5" />
              Earnings Management
            </Link>
          </div>
        </nav>

        {/* Course Labels Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-blue-200">Course Categories</h4>
            <Plus className="h-4 w-4 text-blue-200 cursor-pointer" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="text-sm text-blue-200">Development</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-400"></div>
              <span className="text-sm text-blue-200">Design</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              <span className="text-sm text-blue-200">Marketing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-6 border-t border-blue-800">
        <nav className="space-y-2">
          <Link 
            to="/coach/settings" 
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
  );

  const renderOverview = () => (
    <main className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {coachProfile?.firstName || 'Coach'}! 👋</h1>
          <p className="text-blue-100 text-lg">Ready to inspire and educate your students today?</p>
        </div>
      </div>

      {/* Stats Overview Section - Enhanced Design */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          Performance Overview
          {overviewLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Total Courses Card */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">
                    {overviewLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : overviewStats.totalCourses}
                  </p>
                  <p className="text-sm text-green-700 font-medium">Active Courses</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600">Published courses</p>
                  <p className="text-sm font-semibold text-green-600">
                    {courses.filter(course => course.isPublished).length} live
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-green-600 hover:text-green-700 hover:bg-green-100"
                  onClick={() => setActiveTab('courses')}
                >
                  Manage <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Total Students Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    {overviewLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : overviewStats.totalStudents.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-700 font-medium">Total Students</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600">Total enrollments</p>
                  <p className="text-sm font-semibold text-blue-600">
                    {overviewStats.totalEnrollments.toLocaleString()}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                  onClick={() => setActiveTab('students')}
                >
                  View <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Total Earnings Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-purple-600">
                    {overviewLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatCurrency(overviewStats.totalEarnings)}
                  </p>
                  <p className="text-sm text-purple-700 font-medium">Total Earnings</p>
                  <p className="text-xs text-purple-500 mt-1">
                    {overviewStats.successfulPayments} successful payments
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600">Payment status</p>
                  <p className="text-sm font-semibold text-purple-600">
                    {overviewStats.pendingPayments} pending
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                    onClick={() => setActiveTab('analytics')}
                  >
                    Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Rating Card */}
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Star className="h-6 w-6 text-orange-600 fill-orange-600" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-orange-600">
                    {overviewLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : overviewStats.averageRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-orange-700 font-medium">Average Rating</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600">Course ratings</p>
                  <p className="text-sm font-semibold text-orange-600">
                    {overviewStats.averageRating >= 4.5 ? 'Excellent' : 
                     overviewStats.averageRating >= 4.0 ? 'Great' : 
                     overviewStats.averageRating >= 3.0 ? 'Good' : 'Average'}
                  </p>
                </div>
                <div className="flex">
                  {[1,2,3,4,5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-3 w-3 ${star <= overviewStats.averageRating ? 'text-orange-400 fill-orange-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOverviewData}
            disabled={overviewLoading}
            className="flex items-center gap-2"
          >
            {overviewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Courses - Enhanced */}
          <Card className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <BookOpen className="h-5 w-5 text-blue-600" />
                My Courses
                <Badge variant="outline" className="ml-auto">{myCourses.length} active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {myCourses.length > 0 ? myCourses.map((course) => (
                <Card key={course.id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={course.thumbnailUrl || '/default-course.png'} 
                          alt={course.courseName || course.title}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMkg0NE0yMCAzMkg0NE0yMCA0Mkg0NCIgc3Ryb2tlPSIjOUIxM0E5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K';
                          }}
                        />
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${course.isPublished ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2 text-gray-800">{course.courseName || course.title || 'Untitled Course'}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course.enrolledStudents || course.totalEnrollments || 0} students
                          </span>
                          {course.averageRating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                              {course.averageRating.toFixed(1)}
                            </span>
                          )}
                          <Badge variant="secondary" className="text-xs">{course.level || 'Beginner'}</Badge>
                          <Badge variant={course.isPublished ? 'default' : 'secondary'} className="text-xs">
                            {course.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Price</span>
                            <span>{formatCurrency(course.price || 0)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1 hover:bg-gray-100"
                          onClick={() => {
                            setEditingCourseId(course.id);
                            setActiveTab('courses');
                          }}
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setActiveTab('modules');
                          }}
                        >
                          <Eye className="h-3 w-3" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No courses yet</p>
                  <p>Create your first course to start teaching!</p>
                </div>
              )}
              <Button 
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white" 
                variant="default"
                onClick={() => {
                  setIsCreatingCourse(true);
                  setActiveTab('courses');
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Course
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity - Enhanced */}
          <Card className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Recent Activity
                <Badge variant="outline" className="ml-auto">
                  {recentActivity.length > 0 ? 'Live updates' : 'No activity'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => {
                const isPayment = activity.type === 'payment';
                const isEnrollment = activity.type === 'enrollment';
                
                return (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className={`p-2 rounded-full ${
                      isPayment ? 'bg-green-100 text-green-600' :
                      isEnrollment ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {isPayment && <DollarSign className="h-4 w-4" />}
                      {isEnrollment && <Users className="h-4 w-4" />}
                      {!isPayment && !isEnrollment && <Activity className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{new Date(activity.time).toLocaleString()}</span>
                        {activity.amount && (
                          <span className="text-green-600 font-medium">
                            {formatCurrency(activity.amount)}
                          </span>
                        )}
                        {activity.status && (
                          <Badge 
                            variant={activity.status === 'COMPLETED' || activity.status === 'IN_PROGRESS' ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No recent activity</p>
                  <p>Activity from students and payments will appear here.</p>
                </div>
              )}
              <Button 
                className="w-full mt-4" 
                variant="outline"
                onClick={() => setActiveTab('analytics')}
              >
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Enhanced */}
        <div className="space-y-6">
          {/* Earnings Summary Card */}
          <Card className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Earnings Summary
                {earningsLoading && <Loader2 className="h-4 w-4 animate-spin text-green-600" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {earnings ? (
                <>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(earnings.totalRevenue || 0)}
                    </p>
                    <p className="text-sm text-green-700">Total Revenue</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-lg bg-blue-50">
                      <p className="text-lg font-semibold text-blue-600">{earnings.successfulPayments || 0}</p>
                      <p className="text-xs text-blue-700">Completed</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-yellow-50">
                      <p className="text-lg font-semibold text-yellow-600">{earnings.pendingPayments || 0}</p>
                      <p className="text-xs text-yellow-700">Pending</p>
                    </div>
                  </div>
                  
                  {earnings.averagePaymentAmount > 0 && (
                    <div className="text-center p-3 rounded-lg bg-purple-50">
                      <p className="text-sm text-purple-700">Average per payment</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {formatCurrency(earnings.averagePaymentAmount)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No earnings data yet</p>
                </div>
              )}
              <Button 
                className="w-full" 
                size="sm" 
                variant="outline"
                onClick={() => setActiveTab('analytics')}
              >
                View Full Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Live Sessions - Enhanced */}
          <Card className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {upcomingLessons.map((lesson, index) => (
                <div key={index} className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 hover:shadow-md transition-all duration-300">
                  <p className="font-medium text-sm text-blue-900">{lesson.lesson}</p>
                  <p className="text-xs text-blue-700 font-medium">{lesson.course}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.scheduledAt}
                    </p>
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {lesson.students} students
                    </p>
                  </div>
                </div>
              ))}
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule New Session
              </Button>
            </CardContent>
          </Card>

          {/* Messages - Enhanced */}
          <Card className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                Recent Messages
                <Badge className="ml-auto bg-red-500 text-white text-xs">3 new</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium text-purple-900">Question about assignment</p>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <p className="text-xs text-purple-700">from Alex Johnson</p>
                <p className="text-xs text-purple-600">2 hours ago</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-sm font-medium text-gray-800">Course feedback</p>
                <p className="text-xs text-gray-600">from Maria Garcia</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
              <Button className="w-full" size="sm" variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                View All Messages
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions - Enhanced */}
          <Card className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button className="w-full justify-start hover:bg-green-50 hover:text-green-700 transition-colors" variant="outline">
                <GraduationCap className="h-4 w-4 mr-2" />
                Grade Assignments
                <Badge variant="secondary" className="ml-auto">12 pending</Badge>
              </Button>
              <Button className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors" variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Announcement
              </Button>
              <Button 
                className="w-full justify-start hover:bg-purple-50 hover:text-purple-700 transition-colors" 
                variant="outline"
                onClick={() => setActiveTab('analytics')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );

  const renderCourses = () => (
    <main className="flex-1 p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <div className="flex gap-2">
          <Button
            onClick={fetchCourses}
            disabled={coursesLoading}
            variant="outline"
          >
            {coursesLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button 
            onClick={() => setIsCreatingCourse(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Course
          </Button>
        </div>
      </div>

      {/* Course Creation/Edit Form */}
      {isCreatingCourse && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingCourseId ? 'Edit Course' : 'Create New Course'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              editingCourseId ? handleUpdateCourse() : handleCreateCourse(); 
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={courseForm.title}
                    onChange={handleCourseInputChange}
                    placeholder="Enter course title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (FRW) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={courseForm.price}
                    onChange={handleCourseInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Course Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={courseForm.description}
                  onChange={handleCourseInputChange}
                  placeholder="Describe your course..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={courseForm.category} 
                    onValueChange={(value) => handleCourseSelectChange(value, 'category')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web-development">Web Development</SelectItem>
                      <SelectItem value="mobile-development">Mobile Development</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                      <SelectItem value="ui-ux-design">UI/UX Design</SelectItem>
                      <SelectItem value="digital-marketing">Digital Marketing</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="level">Difficulty Level</Label>
                  <Select 
                    value={courseForm.level} 
                    onValueChange={(value) => handleCourseSelectChange(value, 'level')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Hours) *</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="1"
                    value={courseForm.duration}
                    onChange={handleCourseInputChange}
                    placeholder="e.g. 10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Course Thumbnail</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleCourseFileChange}
                />
                <p className="text-sm text-gray-500">
                  Upload a course thumbnail image (optional)
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={coursesLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {coursesLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : editingCourseId ? (
                    <Save className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {editingCourseId ? 'Update Course' : 'Create Course'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetCourseForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Courses Grid */}
      {coursesLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading courses...</span>
        </div>
      ) : courses.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first course to start teaching students.
            </p>
            <Button 
              onClick={() => setIsCreatingCourse(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative">
                  <img 
                    src={course.imageUrl || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop&crop=center`} 
                    alt={course.courseName}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-2 right-2 bg-blue-600 text-white">
                    {formatCurrency(course.price || 0)}
                  </Badge>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{course.courseName}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.courseDescription}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.durationInHours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {course.rating || 0}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditCourse(course)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          Manage Students
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                              handleDeleteCourse(course.id);
                            }
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );

  const renderStudents = () => (
    <main className="flex-1 p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchEnrollments()}
            disabled={enrollmentsLoading}
            variant="outline"
          >
            {enrollmentsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Enrollment Statistics */}
      {enrollmentStatistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{enrollmentStatistics.totalStudents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Enrollments</p>
                  <p className="text-2xl font-bold">{enrollmentStatistics.activeEnrollments || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold">{enrollmentStatistics.completionRate || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg. Rating</p>
                  <p className="text-2xl font-bold">{enrollmentStatistics.averageRating || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollmentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading enrollments...</span>
            </div>
          ) : Array.isArray(enrollments) && enrollments.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No students enrolled yet</h3>
              <p className="text-gray-600">Students will appear here once they enroll in your courses.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-semibold">Student</th>
                    <th className="text-left p-4 font-semibold">Course</th>
                    <th className="text-left p-4 font-semibold">Enrollment Date</th>
                    <th className="text-left p-4 font-semibold">Progress</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(enrollments) && enrollments.length > 0 ? enrollments.map((enrollment) => (
                    <tr key={`${enrollment.studentId || enrollment.student?.id}-${enrollment.courseId || enrollment.course?.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {enrollment.student?.firstName} {enrollment.student?.lastName} 
                              {!enrollment.student && enrollment.studentName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {enrollment.student?.email || enrollment.studentEmail || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">
                            {enrollment.course?.courseName || enrollment.courseName || 'Unknown Course'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {enrollment.course?.price && formatCurrency(enrollment.course.price)}
                            {enrollment.course?.durationInHours && ` • ${enrollment.course.durationInHours}h`}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">
                          {enrollment.enrollmentDate 
                            ? new Date(enrollment.enrollmentDate).toLocaleDateString() 
                            : 'N/A'}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${enrollment.progress === 'COMPLETED' ? 100 : 
                                         enrollment.progress === 'IN_PROGRESS' ? 50 : 
                                         enrollment.progressPercentage || 0}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {enrollment.progress === 'COMPLETED' ? '100%' : 
                             enrollment.progress === 'IN_PROGRESS' ? '50%' : 
                             `${enrollment.progressPercentage || 0}%`}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={enrollment.progress === 'COMPLETED' ? 'default' : 
                                   enrollment.progress === 'IN_PROGRESS' ? 'secondary' : 'outline'}
                        >
                          {enrollment.progress || enrollment.status || 'ACTIVE'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => fetchStudentDetails(
                                enrollment.course?.id || enrollment.courseId, 
                                enrollment.student?.id || enrollment.studentId
                              )}
                              size="sm"
                              variant="outline"
                              disabled={enrollmentsLoading}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Student Enrollment Details</DialogTitle>
                            </DialogHeader>
                            {selectedStudentDetails ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Student Name</Label>
                                    <p className="text-lg font-medium">
                                      {selectedStudentDetails.student?.firstName} {selectedStudentDetails.student?.lastName}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Student Email</Label>
                                    <p className="text-lg">{selectedStudentDetails.student?.email}</p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Course</Label>
                                    <p className="text-lg font-medium">
                                      {selectedStudentDetails.course?.courseName}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Enrollment Date</Label>
                                    <p className="text-lg">
                                      {selectedStudentDetails.enrollmentDate 
                                        ? new Date(selectedStudentDetails.enrollmentDate).toLocaleDateString() 
                                        : 'N/A'}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Progress Status</Label>
                                    <Badge 
                                      variant={selectedStudentDetails.progress === 'COMPLETED' ? 'default' : 
                                               selectedStudentDetails.progress === 'IN_PROGRESS' ? 'secondary' : 'outline'}
                                      className="mt-1"
                                    >
                                      {selectedStudentDetails.progress || 'ACTIVE'}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label>Course Price</Label>
                                    <p className="text-lg">{formatCurrency(selectedStudentDetails.course?.price || 0)}</p>
                                  </div>
                                </div>

                                <div>
                                  <Label>Course Description</Label>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {selectedStudentDetails.course?.courseDescription || 'No description available'}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                <span className="ml-2">Loading student details...</span>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">No students enrolled yet</p>
                        <p>Students will appear here once they enroll in your courses.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );

  const renderAnalytics = () => (
    <main className="flex-1 p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAnalyticsData}
          disabled={analyticsLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
          Refresh Analytics
        </Button>
      </div>

      {analyticsLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Loading analytics data...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Statistics Cards */}
          {analyticsData.overallStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-blue-600">{analyticsData.overallStats.totalEnrollments}</p>
                  <p className="text-sm text-gray-600">Total Enrollments</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-green-600">{analyticsData.overallStats.totalCourses}</p>
                  <p className="text-sm text-gray-600">Active Courses</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-purple-600">{analyticsData.overallStats.totalSubmissions}</p>
                  <p className="text-sm text-gray-600">Total Submissions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-yellow-600">{analyticsData.overallStats.averageGrade}%</p>
                  <p className="text-sm text-gray-600">Average Grade</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Earnings Statistics Cards */}
          {analyticsData.overallStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(analyticsData.overallStats.totalRevenue || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-blue-600">{analyticsData.overallStats.successfulPayments || 0}</p>
                  <p className="text-sm text-gray-600">Successful Payments</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-yellow-600">{analyticsData.overallStats.pendingPayments || 0}</p>
                  <p className="text-sm text-gray-600">Pending Payments</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <CreditCard className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-indigo-600">
                    {formatCurrency(analyticsData.overallStats.averagePayment || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Avg Payment</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Course Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Course Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.courseAnalytics?.length > 0 ? (
                    analyticsData.courseAnalytics.map((course) => (
                      <div key={course.courseId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{course.courseName}</p>
                            <p className="text-sm text-gray-500">{course.enrollmentCount} students enrolled</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {course.gradeStats?.averageGrade ? `${course.gradeStats.averageGrade}%` : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">Avg. Grade</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No course data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Enrollment Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.enrollmentTrends?.length > 0 ? (
                    analyticsData.enrollmentTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{trend.courseName}</p>
                          <p className="text-sm text-gray-500">Course enrollments</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">{trend.enrollmentCount}</p>
                          <Progress 
                            value={analyticsData.overallStats?.totalEnrollments > 0 ? (trend.enrollmentCount / analyticsData.overallStats.totalEnrollments) * 100 : 0} 
                            className="h-2 w-20" 
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No enrollment data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Revenue by Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.revenueTrends?.length > 0 ? (
                    analyticsData.revenueTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{trend.courseName}</p>
                            <p className="text-sm text-gray-500">{trend.payments} payments</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">
                            {formatCurrency(trend.revenue || 0)}
                          </p>
                          <Progress 
                            value={analyticsData.overallStats?.totalRevenue > 0 ? (trend.revenue / analyticsData.overallStats.totalRevenue) * 100 : 0} 
                            className="h-2 w-20" 
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No revenue data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Payment Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Successful</p>
                        <p className="text-sm text-green-600">Completed payments</p>
                      </div>
                    </div>
                    <p className="font-bold text-xl text-green-600">
                      {analyticsData.overallStats?.successfulPayments || 0}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-8 w-8 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800">Pending</p>
                        <p className="text-sm text-yellow-600">Processing payments</p>
                      </div>
                    </div>
                    <p className="font-bold text-xl text-yellow-600">
                      {analyticsData.overallStats?.pendingPayments || 0}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                      <div>
                        <p className="font-medium text-red-800">Failed</p>
                        <p className="text-sm text-red-600">Failed payments</p>
                      </div>
                    </div>
                    <p className="font-bold text-xl text-red-600">
                      {analyticsData.overallStats?.failedPayments || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Content Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Modules</span>
                  <span className="font-bold text-indigo-600">{analyticsData.overallStats?.totalModules || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Assignments</span>
                  <span className="font-bold text-purple-600">{analyticsData.overallStats?.totalAssignments || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Resources</span>
                  <span className="font-bold text-green-600">{analyticsData.overallStats?.totalResources || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Grading Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Submissions</span>
                  <span className="font-bold">{analyticsData.overallStats?.totalSubmissions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Graded</span>
                  <span className="font-bold text-green-600">{analyticsData.overallStats?.totalGradedSubmissions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-bold text-orange-600">{analyticsData.overallStats?.pendingGrades || 0}</span>
                </div>
                {analyticsData.overallStats?.totalSubmissions > 0 && (
                  <Progress 
                    value={(analyticsData.overallStats.totalGradedSubmissions / analyticsData.overallStats.totalSubmissions) * 100} 
                    className="h-2" 
                  />
                )}
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.performanceMetrics?.bestPerformingCourse && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Best Academic Performance</p>
                    <p className="font-medium">{analyticsData.performanceMetrics.bestPerformingCourse.courseName}</p>
                    <p className="text-sm text-green-600">{analyticsData.performanceMetrics.bestPerformingCourse.gradeStats?.averageGrade}% avg</p>
                  </div>
                )}
                
                {analyticsData.performanceMetrics?.mostPopularCourse && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Most Popular Course</p>
                    <p className="font-medium">{analyticsData.performanceMetrics.mostPopularCourse.courseName}</p>
                    <p className="text-sm text-blue-600">{analyticsData.performanceMetrics.mostPopularCourse.enrollmentCount} students</p>
                  </div>
                )}

                {analyticsData.performanceMetrics?.highestEarningCourse && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Highest Earning Course</p>
                    <p className="font-medium">{analyticsData.performanceMetrics.highestEarningCourse.courseName}</p>
                    <p className="text-sm text-green-600">
                      {formatCurrency(analyticsData.performanceMetrics.highestEarningCourse.paymentAnalytics?.totalRevenue || 0)} revenue
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Course Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-600" />
                Detailed Course Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Course Name</th>
                      <th className="text-center py-3 px-4">Enrollments</th>
                      <th className="text-center py-3 px-4">Revenue</th>
                      <th className="text-center py-3 px-4">Modules</th>
                      <th className="text-center py-3 px-4">Assignments</th>
                      <th className="text-center py-3 px-4">Resources</th>
                      <th className="text-center py-3 px-4">Avg Grade</th>
                      <th className="text-center py-3 px-4">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.courseAnalytics?.length > 0 ? (
                      analyticsData.courseAnalytics.map((course) => (
                        <tr key={course.courseId} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium">{course.courseName}</div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge variant="outline">{course.enrollmentCount}</Badge>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="font-medium text-green-600">
                              {formatCurrency(course.paymentAnalytics?.totalRevenue || 0)}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">{course.moduleCount}</td>
                          <td className="text-center py-3 px-4">{course.assignmentCount}</td>
                          <td className="text-center py-3 px-4">{course.resourceCount}</td>
                          <td className="text-center py-3 px-4">
                            <span className={`font-medium ${
                              (course.gradeStats?.averageGrade || 0) >= 85 ? 'text-green-600' :
                              (course.gradeStats?.averageGrade || 0) >= 70 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {course.gradeStats?.averageGrade ? `${course.gradeStats.averageGrade}%` : 'N/A'}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            {(course.gradeStats?.averageGrade || 0) >= 85 ? (
                              <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                            ) : (course.gradeStats?.averageGrade || 0) >= 70 ? (
                              <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
                            ) : course.gradeStats?.averageGrade ? (
                              <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>
                            ) : (
                              <Badge variant="outline">No Data</Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-8">
                          <div className="text-gray-500">
                            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>No detailed analytics available</p>
                            <p className="text-sm">Create courses to see detailed analytics</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );

  const renderProfile = () => (
    <main className="flex-1 p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile Management</h2>
        <div className="flex gap-2">
          {!isEditingProfile && (
            <>
              <Button
                onClick={refreshProfile}
                disabled={profileLoading}
                variant="outline"
              >
                {profileLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Refresh Data
                  </>
                )}
              </Button>
              <Button
                onClick={() => setIsEditingProfile(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {coachProfile?.instructorData?.imageUrl ? (
                  <img 
                    src={coachProfile.instructorData.imageUrl} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-blue-600" />
                )}
              </div>
              <h3 className="text-xl font-semibold">
                {coachProfile?.firstName || 'N/A'} {coachProfile?.lastName || 'N/A'}
              </h3>
              <p className="text-gray-600">{coachProfile?.email || 'N/A'}</p>
              <Badge variant="secondary" className="mt-2">
                {coachProfile?.instructorData?.approvalStatus || 'PENDING'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{coachProfile?.instructorData?.phoneNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Experience:</span>
                <span className="font-medium">{coachProfile?.instructorData?.yearOfExperience || 'N/A'} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Area:</span>
                <span className="font-medium">{coachProfile?.instructorData?.areaOfExperience || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details/Edit Form */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{isEditingProfile ? 'Edit Profile Information' : 'Profile Information'}</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingProfile ? (
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profileForm.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={profileForm.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileForm.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">New Password (optional)</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={profileForm.password}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={profileForm.phoneNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
                    <Select 
                      value={profileForm.yearsOfExperience}
                      onValueChange={(value) => handleSelectChange(value, 'yearsOfExperience')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select years of experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="2-5">2-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="11-15">11-15 years</SelectItem>
                        <SelectItem value="16-20">16-20 years</SelectItem>
                        <SelectItem value="20+">20+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="areaOfExperience">Area of Experience *</Label>
                  <Select 
                    value={profileForm.areaOfExperience}
                    onValueChange={(value) => handleSelectChange(value, 'areaOfExperience')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your area of experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                      <SelectItem value="Backend Development">Backend Development</SelectItem>
                      <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                      <SelectItem value="Full Stack Development">Full Stack Development</SelectItem>
                      <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professionalBio">Professional Bio *</Label>
                  <Textarea
                    id="professionalBio"
                    name="professionalBio"
                    value={profileForm.professionalBio}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Tell us about your professional background and expertise"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume</Label>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'resume')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certificate">Certificate</Label>
                    <Input
                      id="certificate"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'certificate')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Profile Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'image')}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {profileLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={profileLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h4>
                    <div className="space-y-2">
                      <p><span className="text-gray-600">Name:</span> {coachProfile?.firstName} {coachProfile?.lastName}</p>
                      <p><span className="text-gray-600">Email:</span> {coachProfile?.email}</p>
                      <p><span className="text-gray-600">Phone:</span> {coachProfile?.instructorData?.phoneNumber}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Professional Information</h4>
                    <div className="space-y-2">
                      <p><span className="text-gray-600">Experience:</span> {coachProfile?.instructorData?.yearOfExperience} years</p>
                      <p><span className="text-gray-600">Area:</span> {coachProfile?.instructorData?.areaOfExperience}</p>
                      <p><span className="text-gray-600">Status:</span> 
                        <Badge variant="secondary" className="ml-2">
                          {coachProfile?.instructorData?.approvalStatus}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Professional Bio</h4>
                  <p className="text-gray-700">{coachProfile?.instructorData?.professionBio || 'No bio available'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Documents</h4>
                  <div className="flex gap-4">
                    {coachProfile?.instructorData?.resumeUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={coachProfile.instructorData.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" />
                          View Resume
                        </a>
                      </Button>
                    )}
                    {coachProfile?.instructorData?.certificateUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={coachProfile.instructorData.certificateUrl} target="_blank" rel="noopener noreferrer">
                          <Award className="h-4 w-4 mr-2" />
                          View Certificate
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );

  // ==================== INSTRUCTOR SERVICE RENDER FUNCTIONS ====================

  const renderInstructorServiceHeader = (title: string, showAddButton = false, addButtonText = "", onAddClick = () => {}) => {
    const selectedCourse = selectedCourseId ? courses.find(c => c.id === selectedCourseId) : null;
    
    return (
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {selectedCourse && (
            <p className="text-sm text-gray-600 mt-1">
              Managing: <span className="font-medium text-teal-600">{getCourseDisplayName(selectedCourse)}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId} disabled={coursesLoading}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={
                coursesLoading ? "Loading courses..." : 
                courses.length === 0 ? "No courses available" :
                "Select a course..."
              } />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {getCourseDisplayName(course)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showAddButton && (
            <Button
              onClick={onAddClick}
              disabled={!selectedCourseId || (addButtonText.includes("Assignment") && modules.length === 0) || (addButtonText.includes("Resource") && modules.length === 0)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {addButtonText}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderModules = () => (
    <main className="flex-1 p-6 bg-gray-50">
      {renderInstructorServiceHeader("Course Modules", true, "Add Module", () => setIsCreatingModule(true))}

      {selectedCourseId ? (
        <Card>
          <CardContent className="p-6">
            {modulesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading modules...</span>
              </div>
            ) : modules.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No modules yet</h3>
                <p className="text-gray-600">Create your first module to start organizing course content.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module, index) => (
                  <Card key={module.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{module.title}</h3>
                          <p className="text-gray-600 mt-1">{module.description}</p>
                          <span className="text-sm text-gray-500">Position: {module.position}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingModuleId(module.id);
                              setModuleForm({
                                title: module.title,
                                description: module.description,
                                position: module.position
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await deleteModule(module.id);
                                toast({ title: "Success", description: "Module deleted successfully" });
                                await fetchModules(selectedCourseId);
                              } catch (error: any) {
                                toast({
                                  title: "Error",
                                  description: error.message || "Failed to delete module",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Course</h3>
            <p className="text-gray-600">Choose a course from the dropdown to view and manage its modules.</p>
          </CardContent>
        </Card>
      )}
    </main>
  );

  const renderAssignments = () => (
    <main className="flex-1 p-6 bg-gray-50">
      {renderInstructorServiceHeader("Assignments", true, "Create Assignment", () => setIsCreatingAssignment(true))}

      {!selectedCourseId ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Course</h3>
              <p className="text-gray-600">Please select a course to view and manage assignments.</p>
            </CardContent>
          </Card>

          {/* Assignment Management Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                Assignment Management Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-600" />
                    Creating Assignments
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Click "Create Assignment" to add new assignments</li>
                    <li>• Choose the target module for organization</li>
                    <li>• Set assignment type (Quiz, Mid-term, Summative)</li>
                    <li>• Define point values and due dates</li>
                    <li>• Upload assignment documents if needed</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Managing Submissions
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• View student submissions by clicking the users icon</li>
                    <li>• Grade submissions and provide feedback</li>
                    <li>• Track submission statistics and progress</li>
                    <li>• Download submitted files for review</li>
                    <li>• Send notifications to students</li>
                  </ul>
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Assignments are organized by course modules. Create modules first before adding assignments for better organization.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : modules.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Modules Available</h3>
            <p className="text-gray-600">Create course modules first before adding assignments.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* All Assignments Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Course Assignments</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchAllAssignments}
                    disabled={assignmentsLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${assignmentsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsCreatingAssignment(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assignment
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
                  <p className="text-gray-600 mb-4">Start by creating assignments for your course modules.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-900 mb-1">{assignment.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {assignment.module?.title || 'No Module'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              {assignment.maxPoints} points
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={assignment.assignmentType === 'QUIZ' ? 'default' : assignment.assignmentType === 'MID' ? 'secondary' : 'outline'}>
                            {assignment.assignmentType}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => fetchAssignmentSubmissions(assignment.id)}
                              title="View Submissions"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditAssignment(assignment)}
                              title="Edit Assignment"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              disabled={assignmentsLoading}
                              title="Delete Assignment"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {assignment.documentUrl && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <FileText className="h-4 w-4" />
                          <a href={assignment.documentUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            View Assignment Document
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignments by Module */}
          {modules.map((module) => (
            <Card key={module.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{module.title} - Assignments</span>
                  <Button
                    size="sm"
                    onClick={() => {
                      setAssignmentForm({
                        ...assignmentForm,
                        moduleId: module.id
                      });
                      setIsCreatingAssignment(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Assignment
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignments.filter(a => a.module?.id === module.id).length === 0 ? (
                  <div className="text-center py-6">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No assignments in this module yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignments.filter(a => a.module?.id === module.id).map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{assignment.title}</h5>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              {assignment.maxPoints} pts
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                            </span>
                            <Badge variant="outline">{assignment.assignmentType}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditAssignment(assignment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            disabled={assignmentsLoading}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );

  const renderResources = () => (
    <main className="flex-1 p-6 bg-gray-50">
      {renderInstructorServiceHeader("Learning Resources", true, "Add Resource", () => setIsCreatingResource(true))}

      {!selectedCourseId ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Course</h3>
              <p className="text-gray-600">Please select a course to view and manage learning resources.</p>
            </CardContent>
          </Card>

          {/* Resource Management Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                Resource Management Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Upload className="h-4 w-4 text-green-600" />
                    Adding Resources
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Click "Add Resource" to upload new materials</li>
                    <li>• Support for videos, documents, slides, and links</li>
                    <li>• Organize resources by course modules</li>
                    <li>• Add descriptions for better organization</li>
                    <li>• Upload files or provide external links</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    Resource Types
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Video - Lectures, tutorials, demonstrations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Document - PDFs, handouts, readings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Slide - Presentations, slideshows</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Link - External resources, websites</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Tip:</strong> Organize resources by modules to help students find materials easily. Use descriptive titles and include helpful descriptions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : modules.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Modules Available</h3>
            <p className="text-gray-600">Create course modules first before adding resources.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Resource Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Upload className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold">{resources.length}</p>
                <p className="text-xs text-gray-600">Total Resources</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Play className="h-6 w-6 text-red-600 mx-auto mb-1" />
                <p className="text-lg font-bold">{resources.filter(r => r.resourceType === 'VIDEO').length}</p>
                <p className="text-xs text-gray-600">Videos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold">{resources.filter(r => r.resourceType === 'DOCUMENT').length}</p>
                <p className="text-xs text-gray-600">Documents</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <p className="text-lg font-bold">{resources.filter(r => r.resourceType === 'LINK').length}</p>
                <p className="text-xs text-gray-600">Links</p>
              </CardContent>
            </Card>
          </div>

          {/* Resources by Module */}
          {modules.map((module) => {
            const moduleResources = resources.filter(resource => resource.module?.id === module.id);
            
            return (
              <Card key={module.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-teal-600" />
                      <span>{module.title}</span>
                      <Badge variant="outline">{moduleResources.length} resources</Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setResourceForm({
                          ...resourceForm,
                          moduleId: module.id
                        });
                        setIsCreatingResource(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Resource
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resourcesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading resources...</span>
                    </div>
                  ) : moduleResources.length === 0 ? (
                    <div className="text-center py-8">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No resources added to this module yet.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          setResourceForm({
                            ...resourceForm,
                            moduleId: module.id
                          });
                          setIsCreatingResource(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Resource
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {moduleResources.map((resource) => (
                        <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${getResourceTypeColor(resource.resourceType)}`}>
                                {getResourceTypeIcon(resource.resourceType)}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{resource.description || 'No description provided'}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {resource.resourceType}
                                  </Badge>
                                  {resource.link && (
                                    <a 
                                      href={resource.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      <Eye className="h-3 w-3" />
                                      View Resource
                                    </a>
                                  )}
                                  {resource.fileUrl && (
                                    <a 
                                      href={resource.fileUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      <Upload className="h-3 w-3" />
                                      Download File
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditResource(resource)}
                                title="Edit Resource"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteResource(resource.id)}
                                disabled={resourcesLoading}
                                title="Delete Resource"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );

  const renderSubmissions = () => (
    <main className="flex-1 p-6 bg-gray-50">
      {renderInstructorServiceHeader("Assignment Submissions")}

      {selectedCourseId ? (
        <div className="space-y-6">
          {/* Submission Statistics */}
          {submissionStatistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Edit className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{submissionStatistics.totalSubmissions || 0}</p>
                  <p className="text-sm text-gray-600">Total Submissions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{submissionStatistics.gradedSubmissions || 0}</p>
                  <p className="text-sm text-gray-600">Graded</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{submissionStatistics.pendingSubmissions || 0}</p>
                  <p className="text-sm text-gray-600">Pending Review</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{submissionStatistics.averageGrade || 0}</p>
                  <p className="text-sm text-gray-600">Average Grade</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Submissions List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assignment Submissions</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedCourseId && fetchSubmissions(selectedCourseId)}
                disabled={submissionsLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${submissionsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {submissionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading submissions...</span>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12">
                  <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                  <p className="text-gray-600">Student submissions will appear here once they start submitting assignments.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Sort submissions: ungraded first, then by submission date (newest first) */}
                  {submissions
                    .sort((a, b) => {
                      // First sort by grading status (ungraded first)
                      if (a.isGraded !== b.isGraded) {
                        return a.isGraded ? 1 : -1;
                      }
                      // Then sort by submission date (newest first)
                      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
                    })
                    .map((submission) => (
                    <Card key={submission.id} className="border border-gray-200 hover:border-gray-300 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <FileText className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {submission.assignmentTitle || 'Assignment Submission'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  by {submission.studentName || 'Unknown Student'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {submission.isGraded ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-green-600 font-medium">
                                      Graded: {submission.grade || 0} points
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm text-yellow-600 font-medium">
                                      Pending Review
                                    </span>
                                  </>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {submission.submissionFile && (
                                  <a
                                    href={submission.submissionFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View File
                                  </a>
                                )}
                              </div>
                            </div>

                            {submission.feedback && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-700 mb-2">Feedback:</h4>
                                <p className="text-sm text-gray-600">{submission.feedback}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              variant={submission.isGraded ? "outline" : "default"}
                              size="sm"
                              onClick={() => openGradingDialog(submission)}
                              className={submission.isGraded ? "border-green-200 text-green-700 hover:bg-green-50" : "bg-teal-600 hover:bg-teal-700 text-white"}
                            >
                              {submission.isGraded ? (
                                <>
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit Grade
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4 mr-1" />
                                  Grade
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Course</h3>
            <p className="text-gray-600">Choose a course to view and manage assignment submissions.</p>
          </CardContent>
        </Card>
      )}
    </main>
  );

  const renderGrades = () => (
    <main className="flex-1 p-6 bg-gray-50">
      {renderInstructorServiceHeader("Grades & Assessment")}

      {selectedCourseId ? (
        <div className="space-y-6">
          {/* Grade Statistics */}
          {gradeStatistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <GraduationCap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{gradeStatistics.totalGrades || 0}</p>
                  <p className="text-sm text-gray-600">Total Grades</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{gradeStatistics.averageGrade || 0}%</p>
                  <p className="text-sm text-gray-600">Class Average</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{gradeStatistics.passingRate || 0}%</p>
                  <p className="text-sm text-gray-600">Pass Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{gradeStatistics.highestGrade || 0}%</p>
                  <p className="text-sm text-gray-600">Highest Grade</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Grade Distribution Chart */}
          {gradeStatistics?.gradeDistribution && (
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{gradeStatistics.gradeDistribution.A || 0}</div>
                    <div className="text-sm text-gray-600">A (90-100%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{gradeStatistics.gradeDistribution.B || 0}</div>
                    <div className="text-sm text-gray-600">B (80-89%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{gradeStatistics.gradeDistribution.C || 0}</div>
                    <div className="text-sm text-gray-600">C (70-79%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{gradeStatistics.gradeDistribution.D || 0}</div>
                    <div className="text-sm text-gray-600">D (60-69%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{gradeStatistics.gradeDistribution.F || 0}</div>
                    <div className="text-sm text-gray-600">F (0-59%)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Student Grades List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Student Grades</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingManualGrade(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Manual Grade
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedCourseId && fetchGrades(selectedCourseId)}
                  disabled={gradesLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${gradesLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {gradesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading grades...</span>
                </div>
              ) : grades.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No grades yet</h3>
                  <p className="text-gray-600">Grades will appear here once you start grading student submissions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {grades.map((grade) => (
                    <div key={grade.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Student ID: {grade.studentId}
                              </p>
                              <p className="text-sm text-gray-500">
                                Assignment ID: {grade.assignmentId}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              grade.pointsAwarded >= 90 ? 'bg-green-100 text-green-800' :
                              grade.pointsAwarded >= 80 ? 'bg-blue-100 text-blue-800' :
                              grade.pointsAwarded >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              grade.pointsAwarded >= 60 ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {grade.pointsAwarded} points
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Graded: {new Date(grade.gradedAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewGradeDetails(grade)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Course</h3>
            <p className="text-gray-600">Choose a course to view and manage student grades.</p>
          </CardContent>
        </Card>
      )}
    </main>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return renderCourses();
      case 'students':
        return renderStudents();
      case 'modules':
        return renderModules();
      case 'assignments':
        return renderAssignments();
      case 'resources':
        return renderResources();
      case 'submissions':
        return renderSubmissions();
      case 'grades':
        return renderGrades();
      case 'analytics':
        return renderAnalytics();
      case 'profile':
        return renderProfile();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {renderSidebar()}
      <div className="flex-1 flex flex-col">
        {renderHeader()}
        {renderContent()}
      </div>

      {/* ==================== MODULE DIALOGS ==================== */}
      <Dialog open={isCreatingModule} onOpenChange={setIsCreatingModule}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Create New Module</DialogTitle>
            <DialogDescription className="text-base">
              Add a new module to organize course content and structure your learning materials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateModule}>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="module-title" className="text-sm font-medium">
                  Module Title *
                </Label>
                <Input
                  id="module-title"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className="w-full"
                  placeholder="Enter module title (e.g., 'Introduction to Python Basics')"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module-description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="module-description"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  className="w-full"
                  rows={4}
                  placeholder="Describe what students will learn in this module..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module-position" className="text-sm font-medium">
                  Position Order
                </Label>
                <Input
                  id="module-position"
                  type="number"
                  value={moduleForm.position}
                  onChange={(e) => setModuleForm({ ...moduleForm, position: Number(e.target.value) })}
                  className="w-full"
                  min="1"
                  placeholder="1"
                  required
                />
                <p className="text-xs text-gray-500">Order in which this module appears in the course</p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreatingModule(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={modulesLoading}>
                {modulesLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Module
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editingModuleId !== null} onOpenChange={(open) => !open && setEditingModuleId(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Module</DialogTitle>
            <DialogDescription className="text-base">
              Update module information and content details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditModule}>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-module-title" className="text-sm font-medium">
                  Module Title *
                </Label>
                <Input
                  id="edit-module-title"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className="w-full"
                  placeholder="Enter module title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-module-description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="edit-module-description"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  className="w-full"
                  rows={4}
                  placeholder="Describe what students will learn in this module..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-module-position" className="text-sm font-medium">
                  Position Order
                </Label>
                <Input
                  id="edit-module-position"
                  type="number"
                  value={moduleForm.position}
                  onChange={(e) => setModuleForm({ ...moduleForm, position: Number(e.target.value) })}
                  className="w-full"
                  min="1"
                  placeholder="1"
                  required
                />
                <p className="text-xs text-gray-500">Order in which this module appears in the course</p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingModuleId(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={modulesLoading}>
                {modulesLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Module
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==================== ASSIGNMENT DIALOGS ==================== */}
      <Dialog open={isCreatingAssignment} onOpenChange={setIsCreatingAssignment}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              {editingAssignmentId ? 'Update Assignment' : 'Create New Assignment'}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              {editingAssignmentId 
                ? 'Modify the assignment details and save changes.'
                : 'Create an engaging assignment for students to complete and assess their learning progress.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingAssignmentId ? handleUpdateAssignment : handleCreateAssignment}>
            <div className="grid gap-8 py-6">
              {/* Module Selection */}
              <div className="space-y-3">
                <Label htmlFor="assignment-module" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-teal-600" />
                  Target Module *
                </Label>
                <Select
                  value={assignmentForm.moduleId}
                  onValueChange={(value) => setAssignmentForm({ ...assignmentForm, moduleId: value })}
                >
                  <SelectTrigger className="w-full h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500">
                    <SelectValue placeholder="Select the module for this assignment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id} className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                          {module.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Choose which course module this assignment belongs to</p>
              </div>

              {/* Assignment Title */}
              <div className="space-y-3">
                <Label htmlFor="assignment-title" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Assignment Title *
                </Label>
                <Input
                  id="assignment-title"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="w-full h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  placeholder="Enter assignment title (e.g., 'Python Functions Quiz')"
                  required
                />
                <p className="text-xs text-gray-500">Give your assignment a clear and descriptive title</p>
              </div>

              {/* Assignment Description */}
              <div className="space-y-3">
                <Label htmlFor="assignment-description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-purple-600" />
                  Assignment Description
                </Label>
                <Textarea
                  id="assignment-description"
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  className="w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  rows={4}
                  placeholder="Provide detailed instructions for this assignment..."
                />
                <p className="text-xs text-gray-500">Explain what students need to do and any specific requirements</p>
              </div>

              {/* Assignment Type and Points Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="assignment-type" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    Assignment Type *
                  </Label>
                  <Select
                    value={assignmentForm.assignmentType}
                    onValueChange={(value) => setAssignmentForm({ ...assignmentForm, assignmentType: value })}
                  >
                    <SelectTrigger className="w-full h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select assignment type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUIZ" className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-medium">Quiz</span>
                          <span className="text-xs text-gray-500 ml-2">Quick knowledge check</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="MID" className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <span className="font-medium">Mid-term</span>
                          <span className="text-xs text-gray-500 ml-2">Mid-semester assessment</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SUMMATIVE" className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="font-medium">Summative</span>
                          <span className="text-xs text-gray-500 ml-2">Final comprehensive assessment</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Choose the appropriate assignment category</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="assignment-max-points" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Maximum Points *
                  </Label>
                  <Input
                    id="assignment-max-points"
                    type="number"
                    value={assignmentForm.maxPoints}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, maxPoints: Number(e.target.value) })}
                    className="w-full h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    min="1"
                    max="1000"
                    placeholder="100"
                    required
                  />
                  <p className="text-xs text-gray-500">Total points students can earn</p>
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-3">
                <Label htmlFor="assignment-due-date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-600" />
                  Due Date
                </Label>
                <Input
                  id="assignment-due-date"
                  type="date"
                  value={assignmentForm.dueDate}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                  className="w-full h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500">Set when students must submit their work (optional)</p>
              </div>

              {/* Assignment Document Upload */}
              <div className="space-y-3">
                <Label htmlFor="assignment-document" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-green-600" />
                  Assignment Document
                </Label>
                <Input
                  id="assignment-document"
                  type="file"
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, document: e.target.files?.[0] || null })}
                  className="w-full h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-gray-500">Upload assignment instructions or materials (PDF, DOC, images)</p>
              </div>
            </div>

            <DialogFooter className="gap-3 pt-4 border-t border-gray-100">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsCreatingAssignment(false);
                  setEditingAssignmentId(null);
                  setAssignmentForm({
                    moduleId: '',
                    title: '',
                    description: '',
                    assignmentType: '',
                    maxPoints: 100,
                    dueDate: '',
                    document: null
                  });
                }}
                className="h-11 px-6"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={assignmentsLoading}
                className="h-11 px-6 bg-teal-600 hover:bg-teal-700"
              >
                {assignmentsLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {editingAssignmentId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {editingAssignmentId ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Assignment
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Assignment
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==================== RESOURCE DIALOGS ==================== */}
      <Dialog open={isCreatingResource} onOpenChange={setIsCreatingResource}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg">
                <Upload className="h-5 w-5 text-teal-700" />
              </div>
              {editingResourceId ? 'Update Learning Resource' : 'Create New Learning Resource'}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 mt-2">
              {editingResourceId 
                ? 'Modify the learning resource details and save your changes to help students access updated materials.'
                : 'Add a new learning resource to enrich your course content and provide valuable materials for student learning and reference.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingResourceId ? handleUpdateResource : handleCreateResource}>
            <div className="grid gap-8 py-6">
              {/* Module Selection */}
              <div className="space-y-3">
                <Label htmlFor="resource-module" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-teal-600" />
                  Target Module *
                </Label>
                <Select
                  value={resourceForm.moduleId}
                  onValueChange={(value) => setResourceForm({ ...resourceForm, moduleId: value })}
                >
                  <SelectTrigger className="w-full h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500 transition-all duration-200">
                    <SelectValue placeholder="Select the module for this resource..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id} className="py-3 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                          <span className="font-medium">{module.title}</span>
                          <span className="text-xs text-gray-400 ml-auto">Module {module.position || '1'}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Choose which course module this resource belongs to
                </p>
              </div>

              {/* Resource Title */}
              <div className="space-y-3">
                <Label htmlFor="resource-title" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Resource Title *
                </Label>
                <Input
                  id="resource-title"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  className="w-full h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500 transition-all duration-200"
                  placeholder="Enter resource title (e.g., 'Python Basics Tutorial Video')"
                  required
                />
                <p className="text-xs text-gray-500">Give your resource a clear and descriptive title that students will recognize</p>
              </div>

              {/* Resource Description */}
              <div className="space-y-3">
                <Label htmlFor="resource-description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-purple-600" />
                  Resource Description
                </Label>
                <Textarea
                  id="resource-description"
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                  className="w-full border-gray-200 focus:border-teal-500 focus:ring-teal-500 transition-all duration-200"
                  rows={4}
                  placeholder="Describe what this resource covers and how it helps students learn. Include key topics, learning objectives, or special instructions..."
                />
                <p className="text-xs text-gray-500">Explain what students will learn from this resource and how they should use it</p>
              </div>

              {/* Resource Type Selection */}
              <div className="space-y-3">
                <Label htmlFor="resource-type" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-600" />
                  Resource Type *
                </Label>
                <Select
                  value={resourceForm.resourceType}
                  onValueChange={(value) => setResourceForm({ ...resourceForm, resourceType: value })}
                >
                  <SelectTrigger className="w-full h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500 transition-all duration-200">
                    <SelectValue placeholder="Select the type of resource you're adding..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIDEO" className="py-4 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                          <Play className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">Video Content</span>
                          <p className="text-xs text-gray-500">Lectures, tutorials, demonstrations</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="DOCUMENT" className="py-4 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">Document</span>
                          <p className="text-xs text-gray-500">PDFs, handouts, reading materials</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="SLIDE" className="py-4 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <BookOpen className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">Presentation</span>
                          <p className="text-xs text-gray-500">Slideshows, presentation files</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="LINK" className="py-4 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <Eye className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">External Link</span>
                          <p className="text-xs text-gray-500">Websites, online tools, references</p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Choose the appropriate type based on your resource content</p>
              </div>

              {/* Conditional Content Fields */}
              {resourceForm.resourceType === 'LINK' ? (
                <div className="space-y-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <Label htmlFor="resource-link" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-600" />
                    Resource URL *
                  </Label>
                  <Input
                    id="resource-link"
                    type="url"
                    value={resourceForm.link}
                    onChange={(e) => setResourceForm({ ...resourceForm, link: e.target.value })}
                    className="w-full h-11 border-purple-200 focus:border-purple-500 focus:ring-purple-500 bg-white"
                    placeholder="https://example.com/learning-resource"
                    required={resourceForm.resourceType === 'LINK'}
                  />
                  <div className="flex items-center gap-2 text-xs text-purple-700 bg-purple-100 p-2 rounded">
                    <CheckCircle className="h-3 w-3" />
                    <span>Enter the complete URL to the external learning resource</span>
                  </div>
                </div>
              ) : resourceForm.resourceType ? (
                <div className="space-y-6">
                  <div className="space-y-3 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                    <Label htmlFor="resource-file" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Upload className="h-4 w-4 text-teal-600" />
                      Upload Resource File *
                    </Label>
                    <Input
                      id="resource-file"
                      type="file"
                      onChange={(e) => setResourceForm({ ...resourceForm, file: e.target.files?.[0] || null })}
                      className="w-full h-12 border-teal-200 focus:border-teal-500 focus:ring-teal-500 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                      accept={
                        resourceForm.resourceType === 'VIDEO' 
                          ? '.mp4,.mov,.avi,.wmv,.webm,.mkv'
                          : resourceForm.resourceType === 'DOCUMENT'
                          ? '.pdf,.doc,.docx,.txt,.rtf,.epub'
                          : resourceForm.resourceType === 'SLIDE'
                          ? '.ppt,.pptx,.pdf,.odp,.key'
                          : '*'
                      }
                      required={resourceForm.resourceType && resourceForm.resourceType !== 'LINK' && !editingResourceId}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      {resourceForm.resourceType === 'VIDEO' && (
                        <div className="bg-red-100 text-red-700 p-2 rounded flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          <span>MP4, MOV, AVI, WebM</span>
                        </div>
                      )}
                      {resourceForm.resourceType === 'DOCUMENT' && (
                        <div className="bg-blue-100 text-blue-700 p-2 rounded flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>PDF, DOC, DOCX, TXT</span>
                        </div>
                      )}
                      {resourceForm.resourceType === 'SLIDE' && (
                        <div className="bg-green-100 text-green-700 p-2 rounded flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          <span>PPT, PPTX, PDF, ODP</span>
                        </div>
                      )}
                      <div className="bg-gray-100 text-gray-700 p-2 rounded flex items-center gap-1 col-span-2">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Max file size: 100MB</span>
                      </div>
                    </div>
                  </div>

                  {/* Optional URL field for file types */}
                  <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <Label htmlFor="resource-link-optional" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-500" />
                      Alternative Online URL (Optional)
                    </Label>
                    <Input
                      id="resource-link-optional"
                      type="url"
                      value={resourceForm.link}
                      onChange={(e) => setResourceForm({ ...resourceForm, link: e.target.value })}
                      className="w-full h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500 bg-white"
                      placeholder="https://example.com/online-version (optional)"
                    />
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Provide a backup URL if this resource is also available online
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <DialogFooter className="gap-4 pt-6 border-t border-gray-100">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsCreatingResource(false);
                  setEditingResourceId(null);
                  setResourceForm({
                    moduleId: '',
                    title: '',
                    description: '',
                    resourceType: '',
                    link: '',
                    file: null
                  });
                }}
                className="h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={resourcesLoading || !resourceForm.moduleId || !resourceForm.title || !resourceForm.resourceType}
                className="h-11 px-6 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resourcesLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {editingResourceId ? 'Updating Resource...' : 'Creating Resource...'}
                  </>
                ) : (
                  <>
                    {editingResourceId ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Resource
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Resource
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==================== GRADING DIALOG ==================== */}
      <Dialog open={isGradingSubmission} onOpenChange={setIsGradingSubmission}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg">
                <Star className="h-5 w-5 text-yellow-700" />
              </div>
              {selectedSubmission?.isGraded ? 'Edit Grade' : 'Grade Submission'}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              {selectedSubmission?.isGraded 
                ? 'Update the grade and feedback for this student submission.'
                : 'Provide a grade and feedback for this student submission.'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <form onSubmit={handleGradeFormSubmit}>
              <div className="grid gap-6 py-4">
                {/* Submission Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Submission Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Assignment:</span> {selectedSubmission.assignmentTitle}</p>
                    <p><span className="font-medium">Student:</span> {selectedSubmission.studentName}</p>
                    <p><span className="font-medium">Submitted:</span> {new Date(selectedSubmission.submittedAt).toLocaleDateString()}</p>
                    {selectedSubmission.submissionFile && (
                      <p>
                        <span className="font-medium">File:</span> 
                        <a
                          href={selectedSubmission.submissionFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-700 underline"
                        >
                          View Submission
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Grade Input */}
                <div className="space-y-3">
                  <Label htmlFor="points-awarded" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    Points Awarded *
                  </Label>
                  <Input
                    id="points-awarded"
                    type="number"
                    min="0"
                    max="100"
                    value={gradeForm.pointsAwarded}
                    onChange={(e) => setGradeForm({ ...gradeForm, pointsAwarded: Number(e.target.value) })}
                    className="w-full h-11 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500"
                    placeholder="Enter points (0-100)"
                    required
                  />
                  <p className="text-xs text-gray-500">Enter the points awarded for this submission</p>
                </div>

                {/* Feedback */}
                <div className="space-y-3">
                  <Label htmlFor="feedback" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-purple-600" />
                    Feedback
                  </Label>
                  <Textarea
                    id="feedback"
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    className="w-full border-gray-200 focus:border-yellow-500 focus:ring-yellow-500"
                    rows={4}
                    placeholder="Provide feedback to help the student improve..."
                  />
                  <p className="text-xs text-gray-500">Optional feedback to help the student understand their performance</p>
                </div>
              </div>

              <DialogFooter className="gap-3 pt-4 border-t border-gray-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsGradingSubmission(false);
                    setSelectedSubmission(null);
                    setGradeForm({ pointsAwarded: 0, feedback: '' });
                  }}
                  className="h-11 px-6"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={gradingLoading || gradeForm.pointsAwarded < 0 || gradeForm.pointsAwarded > 100}
                  className="h-11 px-6 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white"
                >
                  {gradingLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {selectedSubmission?.isGraded ? 'Updating...' : 'Grading...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {selectedSubmission?.isGraded ? 'Update Grade' : 'Save Grade'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ==================== GRADE DETAILS DIALOG ==================== */}
      <Dialog open={isViewingGradeDetails} onOpenChange={setIsViewingGradeDetails}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Grade Details
            </DialogTitle>
            <DialogDescription className="text-base">
              Detailed information about this student's grade.
            </DialogDescription>
          </DialogHeader>
          
          {selectedGrade && (
            <div className="space-y-6 py-4">
              {/* Grade Overview */}
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">Grade Awarded</h3>
                      <p className="text-sm text-blue-700">Points earned by the student</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${
                        selectedGrade.pointsAwarded >= 90 ? 'text-green-600' :
                        selectedGrade.pointsAwarded >= 80 ? 'text-blue-600' :
                        selectedGrade.pointsAwarded >= 70 ? 'text-yellow-600' :
                        selectedGrade.pointsAwarded >= 60 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {selectedGrade.pointsAwarded}
                      </div>
                      <p className="text-sm text-blue-700">points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Grade Information */}
              <div className="grid gap-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Student ID:</span>
                  <span className="text-gray-900">{selectedGrade.studentId}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Assignment ID:</span>
                  <span className="text-gray-900">{selectedGrade.assignmentId}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Graded Date:</span>
                  <span className="text-gray-900">
                    {new Date(selectedGrade.gradedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                {/* Grade Letter */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Letter Grade:</span>
                  <span className={`font-bold text-lg ${
                    selectedGrade.pointsAwarded >= 90 ? 'text-green-600' :
                    selectedGrade.pointsAwarded >= 80 ? 'text-blue-600' :
                    selectedGrade.pointsAwarded >= 70 ? 'text-yellow-600' :
                    selectedGrade.pointsAwarded >= 60 ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {selectedGrade.pointsAwarded >= 90 ? 'A' :
                     selectedGrade.pointsAwarded >= 80 ? 'B' :
                     selectedGrade.pointsAwarded >= 70 ? 'C' :
                     selectedGrade.pointsAwarded >= 60 ? 'D' : 'F'}
                  </span>
                </div>
              </div>

              {/* Feedback Section */}
              {selectedGrade.feedback && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Instructor Feedback
                  </Label>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedGrade.feedback}</p>
                  </div>
                </div>
              )}
              
              {/* Performance Indicator */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Performance Analysis</h4>
                <div className="flex items-center gap-2">
                  {selectedGrade.pointsAwarded >= 90 ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-700 font-medium">Excellent Performance</span>
                    </>
                  ) : selectedGrade.pointsAwarded >= 80 ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-700 font-medium">Good Performance</span>
                    </>
                  ) : selectedGrade.pointsAwarded >= 70 ? (
                    <>
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span className="text-yellow-700 font-medium">Satisfactory Performance</span>
                    </>
                  ) : selectedGrade.pointsAwarded >= 60 ? (
                    <>
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span className="text-orange-700 font-medium">Below Average Performance</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-700 font-medium">Needs Improvement</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsViewingGradeDetails(false);
                setSelectedGrade(null);
              }}
              className="h-11 px-6"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== MANUAL GRADE CREATION DIALOG ==================== */}
      <Dialog open={isCreatingManualGrade} onOpenChange={setIsCreatingManualGrade}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Add Manual Grade
            </DialogTitle>
            <DialogDescription className="text-base">
              Create a manual grade entry for a student assignment.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateManualGrade}>
            <div className="space-y-6 py-4">
              {/* Student ID */}
              <div className="space-y-2">
                <Label htmlFor="manual-student-id" className="text-sm font-medium">
                  Student ID *
                </Label>
                <Input
                  id="manual-student-id"
                  value={manualGradeForm.studentId}
                  onChange={(e) => setManualGradeForm({ ...manualGradeForm, studentId: e.target.value })}
                  className="w-full"
                  placeholder="Enter student ID"
                  required
                />
                <p className="text-xs text-gray-500">The unique identifier for the student</p>
              </div>

              {/* Assignment ID */}
              <div className="space-y-2">
                <Label htmlFor="manual-assignment-id" className="text-sm font-medium">
                  Assignment ID *
                </Label>
                <Input
                  id="manual-assignment-id"
                  value={manualGradeForm.assignmentId}
                  onChange={(e) => setManualGradeForm({ ...manualGradeForm, assignmentId: e.target.value })}
                  className="w-full"
                  placeholder="Enter assignment ID"
                  required
                />
                <p className="text-xs text-gray-500">The unique identifier for the assignment</p>
              </div>

              {/* Points Awarded */}
              <div className="space-y-2">
                <Label htmlFor="manual-points" className="text-sm font-medium">
                  Points Awarded *
                </Label>
                <Input
                  id="manual-points"
                  type="number"
                  min="0"
                  max="100"
                  value={manualGradeForm.pointsAwarded}
                  onChange={(e) => setManualGradeForm({ ...manualGradeForm, pointsAwarded: Number(e.target.value) })}
                  className="w-full"
                  placeholder="0"
                  required
                />
                <p className="text-xs text-gray-500">Points awarded (0-100)</p>
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <Label htmlFor="manual-feedback" className="text-sm font-medium">
                  Feedback
                </Label>
                <Textarea
                  id="manual-feedback"
                  value={manualGradeForm.feedback}
                  onChange={(e) => setManualGradeForm({ ...manualGradeForm, feedback: e.target.value })}
                  className="w-full"
                  rows={4}
                  placeholder="Provide feedback for the student (optional)"
                />
                <p className="text-xs text-gray-500">Optional feedback to help the student understand their performance</p>
              </div>
            </div>

            <DialogFooter className="gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreatingManualGrade(false);
                  resetManualGradeForm();
                }}
                className="h-11 px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={gradingLoading || manualGradeForm.pointsAwarded < 0 || manualGradeForm.pointsAwarded > 100}
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700"
              >
                {gradingLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Grade
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoachDashboard;