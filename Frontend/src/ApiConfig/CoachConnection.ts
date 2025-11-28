import axios from 'axios';
import { clearAuthState } from './StudentConnection';

// Use environment variable or default to the backend URL
const CONNECTIONURL = import.meta.env.VITE_APPCONNECTION || 'http://localhost:5000/api/v1';

console.log('API Connection URL:', CONNECTIONURL);

const ApiClient = axios.create({
  baseURL: CONNECTIONURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

ApiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authtoken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Request made with token:', token)
        } else {
            console.log('No authToken found in localStorage', config.url);
        }
        return config;
    }, 

    (error) => {
        return Promise.reject(error);
    }
);


ApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const failingUrl = error.config?.url || 'unknown';
      console.warn(`[Auth] 401 received from ${failingUrl} (courses client). Clearing auth state.`);

      if (!failingUrl.includes('/auth')) {
        clearAuthState();
        if (typeof window !== 'undefined') {
          const redirectPath = '/student/login';
          if (window.location.pathname !== redirectPath) {
            window.location.href = redirectPath;
          }
        }
      }
    }
    return Promise.reject(error);
  },
)

// Method to login  coach  
export const coachLogin = async (email: string, password: string) => {
    try {
        const response = await ApiClient.post('/auth/login', {
            email,
            password
        });
        
        console.log('Coach login response:', response.data);
        
        if (response.data.success && (response.data.jwt || response.data.token)) {
            // Store the token (backend returns 'token' instead of 'jwt')
            const authToken = response.data.jwt || response.data.token;
            localStorage.setItem('authtoken', authToken);
            localStorage.setItem('userRole', 'INSTRUCTOR');
            
            // Store user info if available
            if (response.data.data) {
                localStorage.setItem('userInfo', JSON.stringify(response.data.data));
            }
            
            return response.data;
        } else {
            throw new Error(response.data.message || 'Login failed');
        }

    } catch (error: any) {
        console.error('Error during coach login:', error);
        
        // Handle specific error messages from backend
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        throw error;
    }
}

// Method to register coach/instructor
export const coachSignup = async (instructorData: FormData) => {
    try {
        const response = await ApiClient.post('/auth/signup/instructor', instructorData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        console.log('Coach signup response:', response.data);
        
        if (response.data.success) {
            // Store token if provided (for pending approval state)
            const authToken = response.data.jwt || response.data.token;
            if (authToken) {
                localStorage.setItem('authtoken', authToken);
                localStorage.setItem('userRole', 'INSTRUCTOR');
                localStorage.setItem('userInfo', JSON.stringify(response.data.data));
                localStorage.setItem('approvalStatus', 'PENDING');
            }
            
            return response.data;
        } else {
            throw new Error(response.data.message || 'Registration failed');
        }

    } catch (error: any) {
        console.error('Error during coach signup:', error);
        
        // Handle specific error messages from backend
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        throw error;
    }
}

// Method to check instructor approval status
export const checkInstructorApprovalStatus = async () => {
    try {
        const response = await ApiClient.get('/instructor/profile');
        
        if (response.data.success && response.data.data) {
            const instructorData = response.data.data;
            const approvalStatus = instructorData.instructorData?.approvalStatus || 'PENDING';
            
            // Update localStorage with current status
            localStorage.setItem('approvalStatus', approvalStatus);
            
            return {
                isApproved: approvalStatus === 'APPROVED',
                status: approvalStatus,
                data: instructorData
            };
        }
        
        return { isApproved: false, status: 'UNKNOWN', data: null };

    } catch (error: any) {
        console.error('Error checking approval status:', error);
        throw error;
    }
}

// Method to get coach profile information
export const getCoachProfile = async () => {
    try {
        const response = await ApiClient.get('/instructor/profile');
        
        console.log('Coach profile response:', response.data);
        
        if (response.data.success && response.data.data) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Profile fetched successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch profile');
        }

    } catch (error: any) {
        console.error('Error fetching coach profile:', error);
        
        // Handle 401 unauthorized
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        // Handle 403 forbidden
        if (error.response?.status === 403) {
            throw new Error('Access denied. Please contact admin.');
        }
        
        // Handle other backend errors
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        // Handle network errors
        if (error.code === 'NETWORK_ERROR' || !error.response) {
            throw new Error('Network error. Please check your connection.');
        }
        
        throw error;
    }
}

// Method to update coach profile information
export const updateCoachProfile = async (profileData: FormData) => {
    try {
        console.log('Updating coach profile...');
        
        const response = await ApiClient.put('/instructor/profile/update', profileData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        console.log('Coach profile update response:', response.data);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Profile updated successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to update profile');
        }

    } catch (error: any) {
        console.error('Error updating coach profile:', error);
        
        // Handle validation errors
        if (error.response?.status === 400) {
            const message = error.response.data?.message || 'Invalid data provided';
            throw new Error(message);
        }
        
        // Handle 401 unauthorized
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        // Handle 403 forbidden
        if (error.response?.status === 403) {
            throw new Error('Access denied. Please contact admin.');
        }
        
        // Handle file upload errors
        if (error.response?.status === 413) {
            throw new Error('File size too large. Please upload smaller files.');
        }
        
        // Handle other backend errors
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        // Handle network errors
        if (error.code === 'NETWORK_ERROR' || !error.response) {
            throw new Error('Network error. Please check your connection.');
        }
        
        throw error;
    }
}

// ...existing code...
// method to  create  the  course 
export const createCourse = async (courseData: FormData) => {
    try {
        console.log('Creating course with data...');
        
        // Debug FormData contents
        for (let [key, value] of courseData.entries()) {
            console.log(`${key}: ${value}`);
        }
        
        const response = await ApiClient.post('/courses/create', courseData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        console.log('Course creation response:', response.data);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Course created successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to create course');
        }

    } catch (error: any) {
        console.error('Error creating course:', error);
        
        // Handle validation errors
        if (error.response?.status === 400) {
            const message = error.response.data?.message || 'Invalid course data provided';
            throw new Error(message);
        }
        
        // Handle 401 unauthorized
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        // Handle 403 forbidden (no INSTRUCTOR role)
        if (error.response?.status === 403) {
            throw new Error('Access denied. Only instructors can create courses.');
        }
        
        // Handle file upload errors
        if (error.response?.status === 413) {
            throw new Error('File size too large. Please upload smaller images.');
        }
        
        // Handle other backend errors
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        // Handle network errors
        if (error.code === 'NETWORK_ERROR' || !error.response) {
            throw new Error('Network error. Please check your connection.');
        }
        
        throw error;
    }
}

// Method to get instructor's courses
export const getInstructorCourses = async () => {
    try {
        console.log('Fetching instructor courses...');
        
        const response = await ApiClient.get('/courses/instructor/courses');
        
        console.log('Instructor courses response:', response.data);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data || [],
                message: response.data.message || 'Courses fetched successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch courses');
        }

    } catch (error: any) {
        console.error('Error fetching instructor courses:', error);
        
        // Handle 401 unauthorized
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        // Handle 403 forbidden (no INSTRUCTOR role)
        if (error.response?.status === 403) {
            throw new Error('Access denied. Only instructors can view their courses.');
        }
        
        // Handle other backend errors
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        // Handle network errors
        if (error.code === 'NETWORK_ERROR' || !error.response) {
            throw new Error('Network error. Please check your connection.');
        }
        
        throw error;
    }
}

// Method to update course
export const updateCourse = async (courseId: string, courseData: FormData) => {
    try {
        console.log(`Updating course ${courseId}...`);
        
        const response = await ApiClient.put(`/courses/update/${courseId}`, courseData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        console.log('Course update response:', response.data);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Course updated successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to update course');
        }

    } catch (error: any) {
        console.error('Error updating course:', error);
        
        // Handle validation errors
        if (error.response?.status === 400) {
            const message = error.response.data?.message || 'Invalid course data provided';
            throw new Error(message);
        }
        
        // Handle 401 unauthorized
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        // Handle 403 forbidden (no INSTRUCTOR role)
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only update your own courses.');
        }
        
        // Handle course not found
        if (error.response?.status === 404) {
            throw new Error('Course not found.');
        }
        
        // Handle file upload errors
        if (error.response?.status === 413) {
            throw new Error('File size too large. Please upload smaller images.');
        }
        
        // Handle other backend errors
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        // Handle network errors
        if (error.code === 'NETWORK_ERROR' || !error.response) {
            throw new Error('Network error. Please check your connection.');
        }
        
        throw error;
    }
}

// Method to delete course
export const deleteCourse = async (courseId: string) => {
    try {
        console.log(`Deleting course ${courseId}...`);
        
        const response = await ApiClient.delete(`/courses/delete/${courseId}`);
        
        console.log('Course deletion response:', response.data);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Course deleted successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to delete course');
        }

    } catch (error: any) {
        console.error('Error deleting course:', error);
        
        // Handle 401 unauthorized
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        // Handle 403 forbidden (no INSTRUCTOR role)
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only delete your own courses.');
        }
        
        // Handle course not found
        if (error.response?.status === 404) {
            throw new Error('Course not found.');
        }
        
        // Handle courses with enrollments
        if (error.response?.status === 409) {
            throw new Error('Cannot delete course with enrolled students.');
        }
        
        // Handle other backend errors
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        // Handle network errors
        if (error.code === 'NETWORK_ERROR' || !error.response) {
            throw new Error('Network error. Please check your connection.');
        }
        
        throw error;
    }
}

// Method to get course students (for instructor to see enrollments)
export const getCourseStudents = async (courseId: string) => {
    try {
        console.log(`Fetching students for course ${courseId}...`);
        
        // This endpoint would need to be created in backend - for now using placeholder
        const response = await ApiClient.get(`/instructor/courses/${courseId}/students`);
        
        console.log('Course students response:', response.data);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data || [],
                message: response.data.message || 'Students fetched successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch course students');
        }

    } catch (error: any) {
        console.error('Error fetching course students:', error);
        
        // Handle 401 unauthorized
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        // Handle 403 forbidden (no INSTRUCTOR role)
        if (error.response?.status === 403) {
            throw new Error('Access denied. Only instructors can view course enrollments.');
        }
        
        // Handle course not found
        if (error.response?.status === 404) {
            throw new Error('Course not found.');
        }
        
        // Handle other backend errors
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        // Handle network errors
        if (error.code === 'NETWORK_ERROR' || !error.response) {
            throw new Error('Network error. Please check your connection.');
        }
        
        // Return empty array as fallback for now
        return {
            success: true,
            data: [],
            message: 'Students fetched successfully (placeholder)'
        };
    }
}

// Method to get course analytics (for instructor dashboard)
export const getCourseAnalytics = async (courseId: string) => {
    try {
        console.log(`Fetching analytics for course ${courseId}...`);
        
        // This endpoint would need to be created in backend - for now using placeholder
        const response = await ApiClient.get(`/instructor/courses/${courseId}/analytics`);
        
        console.log('Course analytics response:', response.data);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data || {},
                message: response.data.message || 'Analytics fetched successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch course analytics');
        }

    } catch (error: any) {
        console.error('Error fetching course analytics:', error);
        
        // Handle 401 unauthorized
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        // Handle 403 forbidden (no INSTRUCTOR role)
        if (error.response?.status === 403) {
            throw new Error('Access denied. Only instructors can view course analytics.');
        }
        
        // Handle course not found
        if (error.response?.status === 404) {
            throw new Error('Course not found.');
        }
        
        // Handle other backend errors
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        // Handle network errors
        if (error.code === 'NETWORK_ERROR' || !error.response) {
            throw new Error('Network error. Please check your connection.');
        }
        
        // Return placeholder data as fallback for now
        return {
            success: true,
            data: {
                totalEnrollments: 0,
                completionRate: 0,
                averageRating: 0,
                revenue: 0,
                monthlyEnrollments: []
            },
            message: 'Analytics fetched successfully (placeholder)'
        };
    }
}





// Method to get all enrollments for instructor's courses
export const getInstructorEnrollments = async (page: number = 0, size: number = 10) => {
    try {
        console.log(`Fetching instructor enrollments (page: ${page}, size: ${size})...`);
        
        const response = await ApiClient.get('/instructor/enrollments/my-courses', {
            params: { page, size }
        });
        
        console.log('Instructor enrollments response:', response.data);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Enrollments fetched successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch enrollments');
        }

    } catch (error: any) {
        console.error('Error fetching instructor enrollments:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. Only instructors can view enrollments.');
        }
        
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        throw error;
    }
}

// Method to get enrollments for a specific course
export const getCourseEnrollments = async (courseId: string, page: number = 0, size: number = 10) => {
    try {
        console.log(`Fetching enrollments for course ${courseId}...`);
        
        const response = await ApiClient.get(`/instructor/enrollments/course/${courseId}`, {
            params: { page, size }
        });
        
        console.log('Course enrollments response:', response.data);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Course enrollments fetched successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch course enrollments');
        }

    } catch (error: any) {
        console.error('Error fetching course enrollments:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only view your own course enrollments.');
        }
        
        if (error.response?.status === 404) {
            throw new Error('Course not found or you do not have access to it.');
        }
        
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        throw error;
    }
}

// Method to get student enrollment details (the specific endpoint you requested)
export const getStudentEnrollmentDetails = async (courseId: string, studentId: string) => {
    try {
        console.log(`Fetching enrollment details for student ${studentId} in course ${courseId}...`);
        
        const response = await ApiClient.get(`/instructor/enrollments/course/${courseId}/student/${studentId}`);
        
        console.log('Student enrollment details response:', response.data);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Student enrollment details fetched successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch student enrollment details');
        }

    } catch (error: any) {
        console.error('Error fetching student enrollment details:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only view your own course enrollments.');
        }
        
        if (error.response?.status === 404) {
            throw new Error('Student enrollment not found in this course.');
        }
        
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        throw error;
    }
}

// Method to get enrollment statistics
export const getEnrollmentStatistics = async () => {
    try {
        console.log('Fetching enrollment statistics...');
        
        const response = await ApiClient.get('/instructor/enrollments/statistics');
        
        console.log('Enrollment statistics response:', response.data);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Enrollment statistics fetched successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch enrollment statistics');
        }

    } catch (error: any) {
        console.error('Error fetching enrollment statistics:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. Only instructors can view enrollment statistics.');
        }
        
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        throw error;
    }
}

// Method to get enrollment count for a specific course
export const getCourseEnrollmentCount = async (courseId: string) => {
    try {
        console.log(`Fetching enrollment count for course ${courseId}...`);
        
        const response = await ApiClient.get(`/instructor/enrollments/course/${courseId}/count`);
        
        console.log('Course enrollment count response:', response.data);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Enrollment count fetched successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch enrollment count');
        }

    } catch (error: any) {
        console.error('Error fetching course enrollment count:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only view your own course enrollment counts.');
        }
        
        if (error.response?.status === 404) {
            throw new Error('Course not found or you do not have access to it.');
        }
        
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        throw error;
    }
}

