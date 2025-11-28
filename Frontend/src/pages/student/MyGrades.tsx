import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  GraduationCap, TrendingUp, Star, Clock, Calendar, FileText, 
  Award, Target, BarChart3, ChevronDown, ArrowRight, AlertCircle,
  CheckCircle, BookOpen, Trophy, Filter, Download, RefreshCw,
  Bell, Play, Home, Plus, Settings, HelpCircle, LogOut, User,
  Eye, X, Info
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  fetchCourseGrades, 
  fetchOverallGrades, 
  fetchGradePercentages, 
  fetchStudentGradingDashboard,
  fetchStudentProfile,
  formatGradePercentage,
  getGradeLetterGrade,
  getGradeColor,
  formatGradeDate,
  GradeDto
} from '@/ApiConfig/StudentConnection';

interface GradeSummary {
  totalAssignments: number;
  gradedAssignments: number;
  ungradedAssignments: number;
  averageGrade: number;
  totalCourses: number;
}

interface CourseGradeStats {
  courseId: string;
  courseName: string;
  gradesCount: number;
  averageGrade: number;
  percentage: number;
}

const MyGrades: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // Data states
  const [overallGrades, setOverallGrades] = useState<Record<string, GradeDto[]>>({});
  const [gradePercentages, setGradePercentages] = useState<Record<string, number>>({});
  
  // Detail view states
  const [selectedGrade, setSelectedGrade] = useState<GradeDto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [courseStats, setCourseStats] = useState<CourseGradeStats[]>([]);
  const [gradeSummary, setGradeSummary] = useState<GradeSummary>({
    totalAssignments: 0,
    gradedAssignments: 0,
    ungradedAssignments: 0,
    averageGrade: 0,
    totalCourses: 0
  });
  
  const [profile, setProfile] = useState<any | null>(() => {
    try {
      const raw = localStorage.getItem('studentProfile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    loadGradingData();
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (!profile) {
        const resp = await fetchStudentProfile();
        if (resp && resp.success && resp.data) {
          setProfile(resp.data);
          localStorage.setItem('studentProfile', JSON.stringify(resp.data));
        }
      }
    } catch (e) {
      console.warn('Could not load profile in MyGrades', e);
    }
  };

  const loadGradingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dashboard = await fetchStudentGradingDashboard();
      
      if (dashboard.success && dashboard.data) {
        setOverallGrades(dashboard.data.overallGrades || {});
        setGradePercentages(dashboard.data.gradePercentages || {});
        setCourseStats(dashboard.data.courseStats || []);
        setGradeSummary(dashboard.data.summary || {
          totalAssignments: 0,
          gradedAssignments: 0,
          ungradedAssignments: 0,
          averageGrade: 0,
          totalCourses: 0
        });
      }
    } catch (error: any) {
      console.error('Error loading grading data:', error);
      setError(error.message || 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to clean course names by removing dots and unnecessary characters
  const cleanCourseName = (courseName: string): string => {
    return courseName ? courseName.replace(/\./g, '').trim() : 'Unknown Course';
  };

  // Helper function to calculate course average grade
  const getCourseAverageGrade = (courseId: string): number => {
    const course = coursesWithGrades.find(c => c.courseId === courseId);
    return course?.percentage || 0;
  };

  // Filter courses that have grades (at least 1 assignment)
  const coursesWithGrades = useMemo(() => {
    return courseStats.filter(course => course.gradesCount > 0);
  }, [courseStats]);

  // Filter grades based on selected course and type
  const filteredGrades = useMemo(() => {
    let allGrades: GradeDto[] = [];
    
    if (selectedCourse === 'all') {
      // Only include grades from courses that have assignments
      Object.entries(overallGrades).forEach(([courseName, grades]) => {
        const courseHasStats = courseStats.find(c => c.courseName === courseName);
        if (courseHasStats && courseHasStats.gradesCount > 0) {
          allGrades = [...allGrades, ...grades];
        }
      });
    } else {
      // Check if selected course has grades before showing them
      const selectedCourseData = courseStats.find(c => c.courseId === selectedCourse);
      if (selectedCourseData && selectedCourseData.gradesCount > 0) {
        allGrades = overallGrades[selectedCourseData.courseName] || [];
      }
    }
    
    if (selectedType !== 'all') {
      allGrades = allGrades.filter(grade => 
        grade.assignmentType?.toLowerCase() === selectedType.toLowerCase()
      );
    }
    
    return allGrades.sort((a, b) => 
      new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime()
    );
  }, [overallGrades, selectedCourse, selectedType, courseStats]);

  const handleLogout = () => {
    localStorage.removeItem('studentProfile');
    localStorage.removeItem('authtoken');
    localStorage.removeItem('token');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    navigate('/');
  };

  const openGradeDetails = (grade: GradeDto) => {
    setSelectedGrade(grade);
    setIsDetailModalOpen(true);
  };

  const closeGradeDetails = () => {
    setSelectedGrade(null);
    setIsDetailModalOpen(false);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressBgColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-green-100';
    if (percentage >= 80) return 'bg-blue-100';
    if (percentage >= 70) return 'bg-yellow-100';
    if (percentage >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your grades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
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
            <Link to="/student/dashboard" className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors">
              <Home className="h-5 w-5" />
              My Progress
            </Link>
            <Link to="/student/my-courses" className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors">
              <FileText className="h-5 w-5" />
              My Courses
            </Link>
            <Link to="/courses" className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors">
              <Plus className="h-5 w-5" />
              Browse Courses
            </Link>
            <Link to="/student/my-assignments" className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors">
              <GraduationCap className="h-5 w-5" />
              My Assignments
            </Link>
            <div className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-teal-500 text-white font-medium">
              <Star className="h-5 w-5" />
              Grades
            </div>
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
            <Link to="/settings" className="flex items-center gap-3 p-3 text-blue-200 hover:bg-blue-800 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
              System Settings
            </Link>
            <Link to="/help" className="flex items-center gap-3 p-3 text-blue-200 hover:bg-blue-800 rounded-lg transition-colors">
              <HelpCircle className="h-5 w-5" />
              Help Center
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-red-200 hover:bg-blue-800 rounded-lg transition-colors w-full text-left">
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">My Grades</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={loadGradingData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </header>

        <div className="px-6 py-8">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-blue-600">{gradeSummary.totalAssignments}</p>
                    <p className="text-sm text-gray-600">Total Assignments</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-green-600">{gradeSummary.gradedAssignments}</p>
                    <p className="text-sm text-gray-600">Graded</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-orange-600">{gradeSummary.ungradedAssignments}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-purple-600">
                      {gradeSummary?.averageGrade != null ? gradeSummary.averageGrade.toFixed(1) : '0.0'}%
                    </p>
                    <p className="text-sm text-gray-600">Average Grade</p>
                  </div>
                  <Trophy className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Performance Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Course Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coursesWithGrades.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No course grades available yet.</p>
                    <p className="text-sm">Complete some assignments to see your performance.</p>
                  </div>
                ) : (
                  coursesWithGrades.map((course) => (
                    <div key={course.courseId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{cleanCourseName(course.courseName)}</h3>
                        <p className="text-sm text-gray-600">{course.gradesCount} assignment{course.gradesCount !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-center min-w-[120px]">
                        <div className="flex items-center justify-between">
                          <Badge className={`${getGradeColor(course.percentage || 0)} px-2 py-1`}>
                            {getGradeLetterGrade(course.percentage || 0)}
                          </Badge>
                          <span className={`font-bold ${getProgressColor(course.percentage || 0)}`}>
                            {course.percentage != null ? course.percentage.toFixed(1) : '0.0'}%
                          </span>
                        </div>
                        <Progress value={course.percentage || 0} className="w-full mt-2" />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedCourse(course.courseId)}
                        className="ml-4"
                      >
                        View Details
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Filter by:</span>
            </div>
            
            <select 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Courses</option>
              {coursesWithGrades.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {cleanCourseName(course.courseName)}
                </option>
              ))}
            </select>

            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="quiz">Quiz</option>
              <option value="mid">Mid-term</option>
              <option value="summative">Summative</option>
            </select>
          </div>

          {/* Grades Table */}
          <Card>
            <CardHeader>
              <CardTitle>Average Grade</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredGrades.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No grades found</h3>
                  <p>No grades available for the selected filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assignment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Graded On
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Feedback
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredGrades.map((grade) => (
                        <tr key={grade.gradeId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {grade.assignmentTitle}
                              </div>
                              <div className="text-sm text-gray-500">
                                {(() => {
                                  // Find course name for this grade
                                  const course = Object.entries(overallGrades).find(([_, grades]) => 
                                    grades.some(g => g.gradeId === grade.gradeId)
                                  );
                                  return course ? course[0] : 'Course';
                                })()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant="outline"
                              className={`${
                                grade.assignmentType === 'QUIZ' ? 'border-blue-300 text-blue-700' :
                                grade.assignmentType === 'MID' ? 'border-orange-300 text-orange-700' :
                                'border-purple-300 text-purple-700'
                              }`}
                            >
                              {grade.assignmentType?.toLowerCase() || 'Assignment'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {grade.pointsAwarded} / {grade.maxPoints}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Badge className={getGradeColor(grade.percentage || 0)}>
                                {getGradeLetterGrade(grade.percentage || 0)}
                              </Badge>
                              <span className={`font-semibold ${getProgressColor(grade.percentage || 0)}`}>
                                {grade.percentage != null ? grade.percentage.toFixed(1) : '0.0'}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatGradeDate(grade.gradedAt)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="max-w-xs truncate">
                              {grade.feedback || '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openGradeDetails(grade)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Average Grade Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Average Grade
            </DialogTitle>
          </DialogHeader>
          
          {selectedGrade && (
            <div className="space-y-6">
              {/* Course Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-900">Course Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Course Name</label>
                    <p className="text-gray-900 mt-1">
                      {cleanCourseName(coursesWithGrades.find(c => 
                        overallGrades[c.courseName]?.some(g => g.gradeId === selectedGrade.gradeId)
                      )?.courseName || 'Unknown Course')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Average Grade</label>
                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          {(() => {
                            const courseId = coursesWithGrades.find(c => 
                              overallGrades[c.courseName]?.some(g => g.gradeId === selectedGrade.gradeId)
                            )?.courseId || '';
                            const avg = getCourseAverageGrade(courseId);
                            return avg >= 90 ? 'A' : avg >= 80 ? 'B' : avg >= 70 ? 'C' : avg >= 60 ? 'D' : 'F';
                          })()}
                        </Badge>
                        <span className="text-lg font-bold text-gray-900">
                          {(() => {
                            const courseId = coursesWithGrades.find(c => 
                              overallGrades[c.courseName]?.some(g => g.gradeId === selectedGrade.gradeId)
                            )?.courseId || '';
                            return getCourseAverageGrade(courseId).toFixed(1);
                          })()}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Modal */}
              <div className="flex justify-end">
                <Button onClick={() => setIsDetailModalOpen(false)} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyGrades;
