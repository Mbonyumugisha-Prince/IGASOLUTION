import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Menu as MenuIcon, Mic, Bell, Play, 
  Home, FileText, GraduationCap, Star, Settings, HelpCircle, Plus, LogOut,
  Clock, Calendar, User, ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchStudentProfile, fetchEnrolledCourses, fetchCourseAssignments, fetchStudentSubmissions } from '@/ApiConfig/StudentConnection';

type TaskType = 'Assignment' | 'Quiz' | 'Summative';

interface TaskItem {
  id: string;
  type: TaskType;
  courseId: string;
  courseTitle: string;
  title: string;
  dueDate: string;
  progress: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  description?: string;
  originalAssignment?: any;
}

interface Course {
  id: string;
  title: string;
}

const MyAssignments: React.FC = () => {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState<TaskType | 'All'>('All');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [profile, setProfile] = useState<any | null>(() => {
    try {
      const raw = localStorage.getItem('studentProfile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const resp = await fetchStudentProfile();
        if (resp && resp.success && resp.data) {
          setProfile(resp.data);
          localStorage.setItem('studentProfile', JSON.stringify(resp.data));
        }
      } catch (e) {
        console.warn('Could not load profile in MyAssignments', e);
      }
    };
    
    if (!profile) {
      loadProfile();
    }
  }, [profile]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load enrolled courses
        const coursesResp = await fetchEnrolledCourses();
        let courses: Course[] = [];
        
        if (coursesResp && coursesResp.success && coursesResp.data) {
          courses = coursesResp.data.map((course: any) => ({
            id: course.id || course.courseId,
            title: course.title || course.courseName || `Course ${course.id}`
          }));
          setEnrolledCourses(courses);
        }

        // Load assignments for each enrolled course
        const allTasks: TaskItem[] = [];
        
        for (const course of courses) {
          try {
            const assignmentsResp = await fetchCourseAssignments(course.id);
            if (Array.isArray(assignmentsResp)) {
              const assignments = assignmentsResp;
              
              // Get submissions for this course to determine progress
              let submissions: any[] = [];
              try {
                const submissionsResp = await fetchStudentSubmissions(course.id);
                if (Array.isArray(submissionsResp)) {
                  submissions = submissionsResp;
                }
              } catch (e) {
                console.warn('Could not load submissions for course', course.id, e);
              }

              // Convert assignments to task items
              assignments.forEach((assignment: any) => {
                const submission = submissions.find((s: any) => s.assignmentId === assignment.id);
                
                let status: 'Pending' | 'In Progress' | 'Completed' = 'Pending';
                let progress = 0;
                
                if (submission) {
                  if (submission.submissionStatus === 'SUBMITTED' || submission.submissionStatus === 'GRADED') {
                    status = 'Completed';
                    progress = 100;
                  } else if (submission.submissionStatus === 'DRAFT') {
                    status = 'In Progress';
                    progress = 50;
                  }
                }

                // Calculate due date display
                let dueDateDisplay = 'No due date';
                if (assignment.dueDate) {
                  const dueDate = new Date(assignment.dueDate);
                  const now = new Date();
                  const diffTime = dueDate.getTime() - now.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  if (diffDays < 0) {
                    dueDateDisplay = `${Math.abs(diffDays)} days overdue`;
                  } else if (diffDays === 0) {
                    dueDateDisplay = 'Due today';
                  } else {
                    dueDateDisplay = `in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
                  }
                }

                allTasks.push({
                  id: assignment.id,
                  type: 'Assignment',
                  courseId: course.id,
                  courseTitle: course.title,
                  title: assignment.title || 'Untitled Assignment',
                  dueDate: dueDateDisplay,
                  progress,
                  status,
                  description: assignment.description,
                  originalAssignment: assignment
                });
              });
            }
          } catch (e) {
            console.warn('Could not load assignments for course', course.id, e);
          }
        }
        
        setTasks(allTasks);
      } catch (error) {
        console.error('Error loading assignments data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  const filteredTasks = useMemo(() => {
    if (activeType === 'All') return tasks;
    return tasks.filter((t) => t.type === activeType);
  }, [activeType, tasks]);

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
            <Link 
              to="/student/my-courses"
              className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors"
            >
              <FileText className="h-5 w-5" />
              My Courses
            </Link>
            <Link 
              to="/courses"
              className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Browse Courses
            </Link>
            <div 
              className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-teal-500 text-white font-medium"
            >
              <GraduationCap className="h-5 w-5" />
              My Assignments
            </div>
            <Link 
              to="/student/dashboard#grades"
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

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">My Assignments</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Header actions can be added here if needed */}
            </div>
          </div>
        </header>

        <div className="px-6 py-8">
          {/* Type Tabs */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {(['All','Assignment','Quiz','Summative'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t as any)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${activeType === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading assignments...</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-600 mb-4">
                {activeType === 'All' 
                  ? "You don't have any assignments yet."
                  : `You don't have any ${activeType.toLowerCase()} assignments yet.`
                }
              </p>
              <Button asChild>
                <Link to="/courses">
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Courses
                </Link>
              </Button>
            </div>
          )}

          {/* Tasks List */}
          {!loading && filteredTasks.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="bg-white border border-gray-200 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${task.type === 'Assignment' ? 'bg-blue-600' : task.type === 'Quiz' ? 'bg-amber-500' : 'bg-purple-600'} text-white`}>{task.type}</Badge>
                          <span className="text-xs text-gray-500">{task.courseTitle}</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 truncate">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {task.dueDate}</span>
                          <Badge variant="outline" className="text-xs">{task.status}</Badge>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Button asChild className="rounded-full whitespace-nowrap">
                          <Link to={`/student/course/${task.courseId}/assignments`}>
                            <Play className="h-4 w-4 mr-2" /> {task.status === 'Completed' ? 'Review' : 'Continue'}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAssignments;


