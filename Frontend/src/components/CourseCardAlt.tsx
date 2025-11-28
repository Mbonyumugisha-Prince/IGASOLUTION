import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, Star, Play, Lock, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Course } from '@/components/CourseCard';

interface ExtendedCourse extends Course {
  progress?: string;
  enrollmentDate?: string;
  enrollmentId?: string | number;
}

interface CourseCardAltProps {
  course: ExtendedCourse;
  isEnrolled?: boolean;
}

const computeProgress = (progressStatus: string): number => {
  // Map progress status to percentage
  const progressMap: Record<string, number> = {
    'NOT_STARTED': 0,
    'IN_PROGRESS': 45,
    'COMPLETED': 100,
    'DROPPED': 0
  };
  
  return progressMap[progressStatus?.toUpperCase()] || 0;
};

export const CourseCardAlt: React.FC<CourseCardAltProps> = ({ course, isEnrolled = false }) => {
  const navigate = useNavigate();
  
  // Use actual progress for enrolled courses, computed progress for others
  const progress = isEnrolled && course.progress 
    ? computeProgress(course.progress) 
    : (() => {
        // Fallback hash computation for demo purposes
        let hash = 0;
        for (let i = 0; i < course.id.length; i++) {
          hash = (hash * 31 + course.id.charCodeAt(i)) % 1000;
        }
        return 20 + (hash % 75); // 20-94
      })();

  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is authenticated
    const token = localStorage.getItem('authtoken');
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate(`/student/login?redirect=${encodeURIComponent(`/student/course/${course.id}/learn`)}`);
      return;
    }
    
    // Navigate to learning page
    navigate(`/student/course/${course.id}/learn`);
  };

  const handleViewAssignments = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is authenticated
    const token = localStorage.getItem('authtoken');
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate(`/student/login?redirect=${encodeURIComponent(`/student/course/${course.id}/assignments`)}`);
      return;
    }
    
    // Navigate to assignments page
    navigate(`/student/course/${course.id}/assignments`);
  };

  return (
    <Card className="group overflow-hidden border border-gray-200 rounded-2xl bg-white hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
          <Badge className="bg-white/95 text-blue-700 shadow-sm">{course.category}</Badge>
          <Badge className="bg-blue-600 text-white">{course.level}</Badge>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-semibold text-base line-clamp-2 drop-shadow">{course.title}</h3>
        </div>
      </div>

      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-4 min-h-[44px]">
          <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-white shadow">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor)}&background=random`}
              alt={course.instructor}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{course.instructor}</p>
            <p className="text-xs text-gray-500">Instructor</p>
          </div>
        </div>

        <div className="grid grid-cols-3 rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 p-3 justify-center bg-white">
            <Star className="h-4 w-4 text-amber-500 fill-current" />
            <div className="text-left">
              <div className="text-sm font-semibold leading-4">{course.rating}</div>
              <div className="text-[11px] text-gray-500 leading-3">Rating</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 justify-center bg-white border-x border-gray-100">
            <Users className="h-4 w-4 text-blue-600" />
            <div className="text-left">
              <div className="text-sm font-semibold leading-4">{course.enrolledStudents.toLocaleString()}</div>
              <div className="text-[11px] text-gray-500 leading-3">Students</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 justify-center bg-white">
            <Clock className="h-4 w-4 text-blue-600" />
            <div className="text-left">
              <div className="text-sm font-semibold leading-4">{course.duration}</div>
              <div className="text-[11px] text-gray-500 leading-3">Duration</div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>

      <CardFooter className="px-5 pb-5 pt-0 mt-auto">
        {!isEnrolled && (
          <div className="flex items-center justify-between w-full">
            <div className="min-w-0">
              <span className="block text-xs text-gray-500">Price</span>
              <div className="text-xl font-extrabold text-blue-700 tracking-tight">{(course.price * 800).toLocaleString()} FRW</div>
            </div>
            <Button asChild className="rounded-full gap-2 px-5 whitespace-nowrap">
              <Link to={`/course/${course.id}`}>
                <Play className="h-4 w-4" /> Enroll Now
              </Link>
            </Button>
          </div>
        )}
        
        {isEnrolled && (
          <div className="flex gap-2 w-full">
            <Button onClick={handleContinue} className="rounded-full gap-2 px-4 flex-1">
              <Play className="h-4 w-4" /> Continue
            </Button>
            <Button 
              onClick={handleViewAssignments} 
              variant="outline" 
              className="rounded-full gap-2 px-4"
            >
              <FileText className="h-4 w-4" /> Assignments
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default CourseCardAlt;


