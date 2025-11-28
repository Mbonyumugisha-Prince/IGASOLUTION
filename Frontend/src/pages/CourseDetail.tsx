import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockCourses } from '@/data/mockData';
import { fetchCourseById } from '@/ApiConfig/CoursesConnection';
import { cleanEscapedQuotes } from '@/lib/stringCleanup';
import { 
  handleFlutterwavePayment, 
  fetchStudentProfile 
} from '@/ApiConfig/StudentConnection';
import { 
  Clock, 
  Users, 
  Star, 
  Play, 
  FileText, 
  Award, 
  Calendar,
  ChevronRight,
  CheckCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
interface CourseData {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  rating: number;
  enrolledStudents: number;
  duration: string;
  image: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch course by ID on component mount
  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        const response = await fetchCourseById(id!);
        if (response.success && response.data) {
          const courseData = response.data;
          // Map backend data to CourseData interface
          const inst = courseData.instructor || courseData.instructorData || {};
          const instructorName = ((inst.firstName || '').trim() + ' ' + (inst.lastName || '').trim()).trim() || inst.name || inst.email || 'Unknown Instructor';

          setCourse({
            id: courseData.id,
            title: cleanEscapedQuotes(courseData.courseName),
            description: cleanEscapedQuotes(courseData.courseDescription),
            instructor: instructorName,
            price: courseData.price,
            rating: courseData.rating,
            enrolledStudents: 0,
            duration: `${courseData.durationInHours}h`,
            image: courseData.imageUrl || 'https://via.placeholder.com/400x300',
            category: 'General',
            level: 'Beginner'
          });
        }
      } catch (err) {
        console.error('Error loading course:', err);
        // Fallback to mock data if API fails
        const mockCourse = mockCourses.find(c => c.id === id);
        if (mockCourse) {
          setCourse(mockCourse as CourseData);
        }
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCourse();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course || error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <Link to="/courses" className="text-primary hover:underline">
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  const curriculum = [
    {
      title: 'Getting Started',
      lessons: [
        { title: 'Course Introduction', duration: '10 min', type: 'video' },
        { title: 'Setting up your Environment', duration: '15 min', type: 'video' },
        { title: 'Course Resources', duration: '5 min', type: 'pdf' }
      ]
    },
    {
      title: 'Fundamentals',
      lessons: [
        { title: 'Core Concepts', duration: '25 min', type: 'video' },
        { title: 'Practical Examples', duration: '30 min', type: 'video' },
        { title: 'Practice Exercise 1', duration: '45 min', type: 'assignment' },
        { title: 'Quiz: Fundamentals', duration: '10 min', type: 'quiz' }
      ]
    },
    {
      title: 'Advanced Topics',
      lessons: [
        { title: 'Advanced Techniques', duration: '40 min', type: 'video' },
        { title: 'Case Studies', duration: '35 min', type: 'video' },
        { title: 'Final Project', duration: '120 min', type: 'assignment' }
      ]
    }
  ];

  const reviews = [
    {
      name: 'Alex Thompson',
      rating: 5,
      comment: 'Excellent course! Very well structured and easy to follow.',
      date: '2 weeks ago'
    },
    {
      name: 'Maria Rodriguez',
      rating: 4,
      comment: 'Great content, learned a lot. Would recommend to others.',
      date: '1 month ago'
    },
    {
      name: 'David Chen',
      rating: 5,
      comment: 'The instructor explains complex concepts very clearly.',
      date: '1 month ago'
    }
  ];

  const getIconForType = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'assignment': return <Award className="h-4 w-4" />;
      case 'quiz': return <CheckCircle className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/courses" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            All Courses
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>{course.category}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{course.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-primary text-primary-foreground">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-muted-foreground mb-6">{course.description}</p>
              
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-medium">{course.rating}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.enrolledStudents.toLocaleString()} students
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration} total
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Last updated: Dec 2024
                </span>
              </div>
            </div>

            {/* Course Image */}
            <div className="mb-8">
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <Card className="bg-gradient-card border-0">
                  <CardHeader>
                    <CardTitle>What You'll Learn</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span>Master the fundamentals and advanced concepts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span>Build real-world projects from scratch</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span>Learn industry best practices and standards</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span>Get hands-on experience with latest tools</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-0 mt-6">
                  <CardHeader>
                    <CardTitle>Course Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>• Basic computer skills and internet access</p>
                    <p>• No prior experience required - we start from the basics</p>
                    <p>• Enthusiasm to learn and practice</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-0 mt-6">
                  <CardHeader>
                    <CardTitle>About the Instructor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {course.instructor ? course.instructor.charAt(0) : ''}
                        </div>
                      <div>
                        <h4 className="font-semibold text-lg">{course.instructor}</h4>
                        <p className="text-sm text-muted-foreground mb-2">Senior Developer & Industry Expert</p>
                        <p className="text-sm">
                          With over 8 years of experience in the industry, {course.instructor} has worked with 
                          leading tech companies and has taught thousands of students worldwide.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="curriculum" className="mt-6">
                <div className="space-y-4">
                  {curriculum.map((section, sectionIndex) => (
                    <Card key={sectionIndex} className="bg-gradient-card border-0">
                      <CardHeader>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                            <div className="flex items-center gap-3">
                              {getIconForType(lesson.type)}
                              <span className="font-medium">{lesson.title}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <Card key={index} className="bg-gradient-card border-0">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{review.name}</h4>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? 'fill-warning text-warning' : 'text-muted-foreground'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 bg-gradient-card border-0 shadow-xl">
              <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-sm font-medium text-primary">FRW</span>
                        <span className="text-3xl font-bold text-primary">{new Intl.NumberFormat('en-RW').format(course.price)}</span>
                      </div>
                    <p className="text-sm text-muted-foreground">One-time payment</p>
                  </div>

                  <EnrollButton 
                    courseId={course.id} 
                    coursePrice={course.price}
                    courseTitle={course.title}
                  />

                <Separator className="my-6" />

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total duration</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Skill level</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Students enrolled</span>
                    <span className="font-medium">{course.enrolledStudents.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Certificate</span>
                    <span className="font-medium">Yes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Lifetime access</span>
                    <span className="font-medium">Yes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

// Enhanced component to handle payment integration
const EnrollButton: React.FC<{ courseId: string; coursePrice: number; courseTitle: string }> = ({ 
  courseId, 
  coursePrice, 
  courseTitle 
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleEnroll = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    try {
      const token = localStorage.getItem('authtoken');
      
      if (!token) {
        // Not authenticated -> redirect to login
        const redirect = encodeURIComponent(`/course/${courseId}`);
        navigate(`/student/login?redirect=${redirect}`);
        return;
      }

      setLoading(true);
      
      // Get student profile for payment details
      const profileResponse = await fetchStudentProfile();
      const studentData = profileResponse?.data;
      
      if (!studentData) {
        throw new Error('Unable to fetch student profile');
      }

      // Prepare customer info for payment
      const customerInfo = {
        email: studentData.email,
        phoneNumber: studentData.phoneNumber || '+250788000000', // Default if not available
        name: `${studentData.firstName} ${studentData.lastName}`
      };

      // Initiate Flutterwave payment
      await handleFlutterwavePayment(
        courseId,
        coursePrice,
        customerInfo,
        {
          onSuccess: (response) => {
            console.log('Payment initiated successfully:', response);
            // Payment link will redirect automatically
          },
          onError: (error) => {
            console.error('Payment initiation failed:', error);
            alert(`Payment failed: ${error}`);
            setLoading(false);
          },
          onClose: () => {
            setLoading(false);
          }
        }
      );
      
    } catch (error: any) {
      console.error('Error in enrollment process:', error);
      alert(`Enrollment failed: ${error.message || 'Please try again'}`);
      setLoading(false);
    }
  };

  return (
    <Button 
      size="lg" 
      onClick={handleEnroll} 
      disabled={loading}
      className="w-full bg-gradient-primary border-0 hover:opacity-90 mb-4"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Enroll Now'
      )}
    </Button>
  );
};