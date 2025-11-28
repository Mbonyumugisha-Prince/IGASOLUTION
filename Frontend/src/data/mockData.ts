import { Course } from '@/components/CourseCard';

// Mock course data
export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Complete React Development Bootcamp',
    description: 'Master React from basics to advanced concepts including hooks, context, and modern patterns.',
    instructor: 'Sarah Johnson',
    price: 89,
    rating: 4.8,
    enrolledStudents: 2547,
    duration: '12 hours',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    category: 'Web Development',
    level: 'Intermediate'
  },
  {
    id: '2',
    title: 'Machine Learning Fundamentals',
    description: 'Learn the core concepts of machine learning with practical examples and real-world applications.',
    instructor: 'Dr. Michael Chen',
    price: 129,
    rating: 4.9,
    enrolledStudents: 1823,
    duration: '18 hours',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
    category: 'Data Science',
    level: 'Advanced'
  },
  {
    id: '3',
    title: 'UI/UX Design Masterclass',
    description: 'Create stunning user interfaces and experiences with modern design principles and tools.',
    instructor: 'Emma Rodriguez',
    price: 79,
    rating: 4.7,
    enrolledStudents: 3891,
    duration: '15 hours',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    category: 'Design',
    level: 'Beginner'
  },
  {
    id: '4',
    title: 'Digital Marketing Strategy',
    description: 'Build comprehensive marketing strategies for the digital age including SEO, social media, and analytics.',
    instructor: 'James Wilson',
    price: 89,
    rating: 4.6,
    enrolledStudents: 2156,
    duration: '14 hours',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    category: 'Marketing',
    level: 'Intermediate'
  },
  {
    id: '5',
    title: 'Python for Data Analysis',
    description: 'Learn Python programming focused on data analysis, visualization, and scientific computing.',
    instructor: 'Dr. Lisa Park',
    price: 109,
    rating: 4.8,
    enrolledStudents: 4237,
    duration: '20 hours',
    image: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=400&h=300&fit=crop',
    category: 'Programming',
    level: 'Beginner'
  },
  {
    id: '6',
    title: 'Advanced JavaScript Patterns',
    description: 'Deep dive into advanced JavaScript concepts, design patterns, and modern ES6+ features.',
    instructor: 'Alex Turner',
    price: 119,
    rating: 4.9,
    enrolledStudents: 1654,
    duration: '16 hours',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
    category: 'Web Development',
    level: 'Advanced'
  },
  {
    id: '7',
    title: 'Mobile App Development with React Native',
    description: 'Build cross-platform mobile applications using React Native and modern development practices.',
    instructor: 'David Kim',
    price: 149,
    rating: 4.7,
    enrolledStudents: 2890,
    duration: '22 hours',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
    category: 'Mobile Development',
    level: 'Intermediate'
  },
  {
    id: '8',
    title: 'Cybersecurity Fundamentals',
    description: 'Learn essential cybersecurity concepts, threat detection, and defense strategies for modern businesses.',
    instructor: 'Dr. Rebecca Chen',
    price: 139,
    rating: 4.8,
    enrolledStudents: 1567,
    duration: '18 hours',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop',
    category: 'Security',
    level: 'Beginner'
  },
  {
    id: '9',
    title: 'Cloud Computing with AWS',
    description: 'Master Amazon Web Services, cloud architecture, and deployment strategies for scalable applications.',
    instructor: 'Mark Thompson',
    price: 179,
    rating: 4.9,
    enrolledStudents: 3245,
    duration: '25 hours',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
    category: 'Cloud Computing',
    level: 'Advanced'
  },
  {
    id: '10',
    title: 'Blockchain Technology and Cryptocurrency',
    description: 'Understand blockchain fundamentals, smart contracts, and cryptocurrency ecosystem development.',
    instructor: 'Jennifer Liu',
    price: 199,
    rating: 4.6,
    enrolledStudents: 1892,
    duration: '20 hours',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop',
    category: 'Blockchain',
    level: 'Intermediate'
  },
  {
    id: '11',
    title: 'Content Marketing & SEO Strategy',
    description: 'Create compelling content that ranks well and drives organic traffic to your business.',
    instructor: 'Sophie Anderson',
    price: 89,
    rating: 4.7,
    enrolledStudents: 2634,
    duration: '14 hours',
    image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=300&fit=crop',
    category: 'Marketing',
    level: 'Beginner'
  }
];

// Mock user data
export const mockStudents = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    enrolledCourses: ['1', '3'],
    completedCourses: ['5'],
    totalProgress: 65
  }
];

export const mockCoaches = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    courses: ['1'],
    totalStudents: 2547,
    totalEarnings: 12430
  }
];

// Dashboard stats
export const mockStudentStats = {
  enrolledCourses: 10,
  completedCourses: 1,
  totalHoursLearned: 28,
  certificatesEarned: 3,
  totalWorkshops: 4,
  averageQuizScore: 8
};

// Mock workshop data
export const mockWorkshops = [
  {
    id: 'w1',
    title: 'Figma for Beginners: Fundamentals of Figma App',
    instructor: 'Richardino Gueva',
    progress: 25,
    completedLessons: 4,
    totalLessons: 20,
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop',
    category: 'UI Design'
  },
  {
    id: 'w2',
    title: 'Complete Web Design: from Figma to Webflow',
    instructor: 'Richardino Gueva',
    progress: 50,
    completedLessons: 10,
    totalLessons: 20,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    category: 'UI Design'
  },
  {
    id: 'w3',
    title: 'Figma 2023: The Absolute Beginner to Pro Class',
    instructor: 'Richardino Gueva',
    progress: 89,
    completedLessons: 29,
    totalLessons: 30,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    category: 'UI Design'
  },
  {
    id: 'w4',
    title: 'Mastering Managing Project with Notion',
    instructor: 'Richardino Gueva',
    progress: 80,
    completedLessons: 8,
    totalLessons: 10,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    category: 'Productivity'
  }
];

// Mock webinar data
export const mockWebinars = [
  {
    id: 'web1',
    title: 'Getting started design with Wireframing',
    instructor: 'Richardino Gueva',
    category: 'UX Design',
    date: 'Dec 16, 2022',
    time: '09.00 - 12.00',
    status: 'live', // live, upcoming
    countdown: null,
    avatar: 'https://ui-avatars.com/api/?name=Richardino+Gueva&background=random'
  },
  {
    id: 'web2',
    title: 'Starting Career as an UX Writer',
    instructor: 'Richardino Gueva',
    category: 'UX Design',
    date: 'Dec 19, 2022',
    time: '09.00 - 12.00',
    status: 'upcoming',
    countdown: '12 03 49',
    avatar: 'https://ui-avatars.com/api/?name=Richardino+Gueva&background=random'
  },
  {
    id: 'web3',
    title: 'UI Designer Tasks and Functions',
    instructor: 'Richardino Gueva',
    category: 'UI Design',
    date: 'Dec 20, 2022',
    time: '09.00 - 12.00',
    status: 'upcoming',
    countdown: '12 03 49',
    avatar: 'https://ui-avatars.com/api/?name=Richardino+Gueva&background=random'
  },
  {
    id: 'web4',
    title: 'How to become UI Designer',
    instructor: 'Richardino Gueva',
    category: 'UI Design',
    date: 'Dec 22, 2022',
    time: '09.00 - 12.00',
    status: 'upcoming',
    countdown: '12 03 49',
    avatar: 'https://ui-avatars.com/api/?name=Richardino+Gueva&background=random'
  }
];

export const mockCoachStats = {
  totalCourses: 2,
  totalStudents: 2547,
  totalEarnings: 12430,
  averageRating: 4.8
};