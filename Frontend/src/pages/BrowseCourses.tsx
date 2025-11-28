import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { CourseCard } from '@/components/CourseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { mockCourses } from '@/data/mockData';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { fetchAllCourses } from '@/ApiConfig/CoursesConnection';
import { cleanEscapedQuotes } from '@/lib/stringCleanup';

const BrowseCourses = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const categories = ['Web Development', 'Data Science', 'Design', 'Marketing', 'Programming', 'Business'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const priceRanges = [
    { label: 'Free', value: 'free' },
    { label: '5,000 - 40,000 FRW', value: '1-50' },
    { label: '40,000 - 80,000 FRW', value: '51-100' },
    { label: '80,000 - 160,000 FRW', value: '101-200' },
    { label: '160,000+ FRW', value: '200+' }
  ];

  // Fetch courses on component mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const response = await fetchAllCourses();
        if (response.success && response.data) {
          // Map backend data to match CourseCard interface
          const mappedCourses = response.data.map((course: any) => {
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
          setAllCourses(mappedCourses);
        }
      } catch (err) {
        console.error('Error loading courses:', err);
        // Fallback to mock data if API fails
        setAllCourses(mockCourses);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === '' || selectedLevel === 'all' || course.level === selectedLevel;
    
    let matchesPrice = true;
    if (priceRange && priceRange !== 'all') {
      switch (priceRange) {
        case 'free':
          matchesPrice = course.price === 0;
          break;
        case '1-50':
          matchesPrice = course.price >= 1 && course.price <= 50;
          break;
        case '51-100':
          matchesPrice = course.price >= 51 && course.price <= 100;
          break;
        case '101-200':
          matchesPrice = course.price >= 101 && course.price <= 200;
          break;
        case '200+':
          matchesPrice = course.price > 200;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLevel('all');
    setPriceRange('all');
  };

  const hasActiveFilters = (selectedCategory && selectedCategory !== 'all') || 
                           (selectedLevel && selectedLevel !== 'all') || 
                           (priceRange && priceRange !== 'all');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Courses</h1>
          <p className="text-muted-foreground">Discover your next learning adventure from our extensive course library</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for courses, instructors, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                {priceRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {selectedCategory && selectedCategory !== 'all' && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory('all')}>
                  {selectedCategory} ✕
                </Badge>
              )}
              {selectedLevel && selectedLevel !== 'all' && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedLevel('all')}>
                  {selectedLevel} ✕
                </Badge>
              )}
              {priceRange && priceRange !== 'all' && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setPriceRange('all')}>
                  {priceRanges.find(r => r.value === priceRange)?.label} ✕
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredCourses.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Courses
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseCourses;