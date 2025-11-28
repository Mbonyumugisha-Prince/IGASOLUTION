import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CourseCard } from '@/components/CourseCard';
import { mockCourses } from '@/data/mockData';
import Footer from '@/components/ui/footer';
import { ArrowRight, BookOpen, Users, Award, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import student1 from '@/assets/student.jpg';
import student2 from '@/assets/student2.webp';
import student3 from '@/assets/student3.webp';
import image3 from '@/assets/image3.webp';
import { useEffect, useState } from 'react';
import { fetchAllCourses } from '@/ApiConfig/CoursesConnection';
import { cleanEscapedQuotes } from '@/lib/stringCleanup';

const Index = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [student1, student2, student3, image3];

  // Fetch courses on component mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const response = await fetchAllCourses();
        if (response.success && response.data) {
          // Map backend data to match CourseCard interface
          const mappedCourses = response.data.slice(0, 6).map((course: any) => {
            const inst = course.instructor || course.instructorData || {};
            const instructorName = ((inst.firstName || '').trim() + ' ' + (inst.lastName || '').trim()).trim() || inst.name || inst.email || 'Unknown Instructor';

            return {
              id: course.id,
              title: cleanEscapedQuotes(course.courseName),
              description: cleanEscapedQuotes(course.courseDescription),
              instructor: instructorName,
              price: course.price,
              rating: course.rating,
              enrolledStudents: 0,
              duration: `${course.durationInHours}h`,
              image: course.imageUrl || 'https://via.placeholder.com/400x300',
              category: 'General',
              level: 'Beginner' as const
            };
          });
          setFeaturedCourses(mappedCourses);
        }
      } catch (err) {
        console.error('Error loading courses:', err);
        // Fallback to mock data if API fails
        setFeaturedCourses(mockCourses.slice(0, 6));
        setError('Failed to load courses from server');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: 'Expert-Led Courses',
      description: 'Learn from industry professionals and certified instructors'
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Interactive Learning',
      description: 'Engage with peers and instructors in live sessions and discussions'
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: 'Certified Programs',
      description: 'Earn recognized certificates upon successful course completion'
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: 'Learn Anywhere',
      description: 'Access courses on any device, anytime, anywhere in the world'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[90vh] overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        
        {/* Image Slider */}
        <div className="absolute inset-0">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 opacity-0 animate-[fadeSlideUp_1s_ease-out_0.2s_forwards]">
                Transform Your Future with
                <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent block mt-2">
                  Expert Learning
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 opacity-0 animate-[fadeSlideUp_1s_ease-out_0.4s_forwards]">
                Join thousands of learners worldwide and master new skills with our comprehensive courses taught by industry experts.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center opacity-0 animate-[fadeSlideUp_1s_ease-out_0.6s_forwards]">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold text-base px-6 py-3 shadow-lg transition-all duration-300 hover:transform hover:scale-105" asChild>
                  <Link to="/courses">
                    Explore Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  className="relative overflow-hidden group bg-blue-600 text-white border-none font-semibold text-base px-6 py-3 shadow-lg transition-all duration-300 hover:transform hover:scale-105" 
                  asChild
                >
                  <Link to="/coach/register" className="flex items-center gap-2 relative z-10">
                    <Award className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    <span className="relative">
                      Become an Instructor
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                    </span>
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-700 to-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out shadow-xl" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-white to-blue-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-4 block animate-[fadeSlideUp_1s_ease-out]">
              Why Choose IGA?
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gray-600 from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Elevate Your Learning Experience
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We provide cutting-edge tools and a supportive community to help you achieve your learning goals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden rounded-xl border-0 bg-white/70 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-200/20 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-8 relative">
                  <div className="mb-6 flex justify-center">
                    <div className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                      {React.cloneElement(feature.icon, {
                        className: "h-8 w-8 text-blue-600 group-hover:scale-110 transform transition-transform duration-300"
                      })}
                    </div>
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground/90 leading-relaxed group-hover:text-gray-600 transition-colors duration-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our most popular courses taught by industry experts
            </p>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-96 bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
          
          <div className="text-center">
            <Button size="lg" variant="outline" asChild className='bg-blue-600  text-white'>
              <Link to="/courses">
                View All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
