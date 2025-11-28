import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Star, ArrowRight } from 'lucide-react';

export interface Course {
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

interface CourseCardProps {
  course: Course;
  showEnrollButton?: boolean;
  isEnrolled?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, showEnrollButton = true, isEnrolled = false }) => {
  const navigate = useNavigate();

  const handleEnroll = (e?: React.MouseEvent) => {
    // prevent the card click from also firing
    e?.stopPropagation();
    try {
      const token = localStorage.getItem('authtoken');
      if (token) {
        // user is authenticated — go to course details/enroll flow
        navigate(`/course/${course.id}`);
      } else {
        // not authenticated — send to login and preserve intended redirect
        const redirect = encodeURIComponent(`/course/${course.id}`);
        navigate(`/student/login?redirect=${redirect}`);
      }
    } catch (err) {
      // fallback navigation
      navigate(`/student/login?redirect=${encodeURIComponent('/student/dashboard')}`);
    }
  };

  const handleCardClick = () => {
    navigate(`/course/${course.id}`);
  };

  return (
  <Card onClick={handleCardClick} className="group relative overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-white border border-gray-100 rounded-xl cursor-pointer">
      {/* Image Section with Overlay */}
      <div className="relative overflow-hidden aspect-video">
        <img 
          src={course.image} 
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between gap-2 z-10">
          <Badge 
            className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs font-medium tracking-wide shadow-lg shadow-blue-900/20"
          >
            {course.category}
          </Badge>
          <Badge 
            className="px-3 py-1.5 bg-white text-blue-600 rounded-full text-xs font-medium tracking-wide shadow-lg"
          >
            {course.level}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        {/* Course Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br  p-[2px]">
            <div className="h-full w-full rounded-full overflow-hidden bg-white">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor)}&background=random`}
                alt={course.instructor}
                className="h-full w-full object-cover bg-white"
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {course.instructor}
            </p>
            <p className="text-xs text-gray-500">
              Course Instructor
            </p>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-amber-500 mb-1">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-bold">{course.rating}</span>
            </div>
            <span className="text-xs text-gray-500">Rating</span>
          </div>
          <div className="flex flex-col items-center text-center border-x border-gray-100">
            <div className="flex items-center gap-1 text-blue-600 mb-1">
              <Users className="h-4 w-4" />
              <span className="font-bold">{course.enrolledStudents.toLocaleString()}</span>
            </div>
            <span className="text-xs text-gray-500">Students</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-blue-600 mb-1">
              <Clock className="h-4 w-4" />
              <span className="font-bold">{course.duration}</span>
            </div>
            <span className="text-xs text-gray-500">Duration</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex items-center justify-between">
        {!isEnrolled && (
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Price</span>
            <span className="text-2xl font-bold text-blue-600">
              {course.price.toLocaleString()} FRW
            </span>
          </div>
        )}
        {showEnrollButton && (
          <Button
            onClick={(e) => handleEnroll(e)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full px-6 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CourseCard;