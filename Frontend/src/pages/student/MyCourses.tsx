import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, SlidersHorizontal, Filter, ArrowUpDown, 
  Menu as MenuIcon, Mic, Bell, Play, Home, FileText, GraduationCap, Star, Settings, HelpCircle, Plus, LogOut, User, ChevronDown
} from 'lucide-react';
import { CourseCard } from '@/components/CourseCard';
import { CourseCardAlt } from '@/components/CourseCardAlt';
import { mockCourses, mockStudents } from '@/data/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { 
  fetchStudentProfile, 
  fetchStudentEnrollments, 
  formatEnrollmentProgress, 
  getProgressColor,
  testAuthentication
} from '@/ApiConfig/StudentConnection';

const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price_low' | 'price_high'>('popular');
  const [profile, setProfile] = useState<any | null>(() => {
    try {
      const raw = localStorage.getItem('studentProfile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Enrollment states
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const resp = await fetchStudentProfile();
        if (resp && resp.success && resp.data) {
          setProfile(resp.data);
          localStorage.setItem('studentProfile', JSON.stringify(resp.data));
        }
      } catch (e) {
        console.warn('Could not load profile in MyCourses', e);
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

        // First test authentication with a known working endpoint
        try {
          console.log('Testing authentication first...');
          await testAuthentication();
          console.log('Authentication test passed');
        } catch (authError) {
          console.error('Authentication test failed:', authError);
          setEnrollments([]);
          return;
        }
        
        const response = await fetchStudentEnrollments(0, 50); // Get up to 50 enrollments for My Courses
        
        if (response && response.success && response.data && response.data.content) {
          setEnrollments(response.data.content);
          console.log('Enrollments loaded in MyCourses:', response.data.content);
        } else {
          console.log('No enrollments found in MyCourses:', response);
          setEnrollments([]);
        }
      } catch (error: any) {
        console.error('Error loading enrollments in MyCourses:', error);
        
        // Handle authentication errors
        if (error.message && error.message.includes('Authentication failed')) {
          console.log('Authentication failed - redirecting to login');
          // Optionally redirect to login or show a message
          // navigate('/student/login?redirect=/student/mycourses');
        }
        
        setEnrollments([]);
      } finally {
        setEnrollmentsLoading(false);
      }
    };
    
    if (!profile) {
      loadProfile();
    }
    
    loadEnrollments();
  }, [profile]);

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

  const enrolledCourses = useMemo(() => {
    // Only use real enrollment data - no fallback to mock data
    if (enrollments && enrollments.length > 0) {
      return enrollments.map((enrollment) => ({
        id: enrollment.courseId || enrollment.id,
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
        level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced', // Default level since backend doesn't provide this
        rating: 4.5, // Default rating
        enrolledStudents: 0 // Default value
      }));
    }
    
    // Return empty array if no enrollments - no mock data fallback
    return [];
  }, [enrollments]);

  const filteredCourses = useMemo(() => {
    let list = [...enrolledCourses];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q));
    }
    if (level !== 'All') {
      list = list.filter((c) => c.level === level);
    }
    switch (sortBy) {
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'price_low':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        list.sort((a, b) => b.price - a.price);
        break;
      default:
        list.sort((a, b) => b.enrolledStudents - a.enrolledStudents);
    }
    return list;
  }, [enrolledCourses, level, query, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar (same style as dashboard) */}
      <div className="w-80 bg-blue-900 text-white flex flex-col">
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

        <div className="flex-1 p-6">
          <nav className="space-y-2">

            <Link 
              to="/student/dashboard"
              className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors"
            >
              <Home className="h-5 w-5" />
              My Progress
            </Link>
            <div 
              className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-teal-500 text-white font-medium"
            >
              <FileText className="h-5 w-5" />
              My Courses
            </div>
            <Link 
              to="/courses"
              className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Browse Courses
            </Link>
            <Link 
              to="/student/my-assignments"
              className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors"
            >
              <GraduationCap className="h-5 w-5" />
              My Assignments
            </Link>
            <Link 
              to="/student/my-grades"
              className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors"
            >
              <Star className="h-5 w-5" />
              Grades
            </Link>
            <Link 
              to="/student/profile"
              className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors"
            >
              <User className="h-5 w-5" />
              Profile Settings
            </Link>
          </nav>

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

      {/* Main content with header and filters/grid */}
      <div className="flex-1 flex flex-col">
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
              {/* Header actions can be added here if needed */}
            </div>
          </div>
        </header>

        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">My Courses</h1>
              <p className="text-muted-foreground">Manage and continue your enrolled courses</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2"><SlidersHorizontal className="h-4 w-4" /> Preferences</Button>
            </div>
          </div>

          <Card className="bg-white border border-gray-200 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search your courses..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Select value={level} onValueChange={(v) => setLevel(v as any)}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular"><div className="flex items-center gap-2"><Filter className="h-4 w-4" /> Most Popular</div></SelectItem>
                      <SelectItem value="rating"><div className="flex items-center gap-2"><ArrowUpDown className="h-4 w-4" /> Highest Rated</div></SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">Enrolled: {enrolledCourses.length}</Badge>
                <Badge variant="outline">Beginner</Badge>
                <Badge variant="outline">Intermediate</Badge>
                <Badge variant="outline">Advanced</Badge>
              </div>
            </CardContent>
          </Card>

          {enrollmentsLoading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Loading your enrolled courses...</span>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center text-muted-foreground py-20">
              {enrolledCourses.length === 0 ? "You haven't enrolled in any courses yet" : "No courses match your filters"}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <CourseCardAlt key={course.id} course={course} isEnrolled={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCourses;


