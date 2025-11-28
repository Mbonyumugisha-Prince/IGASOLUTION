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

// Method to fetch all courses 
export const fetchAllCourses = async () => {
    try {
         const response = await ApiClient.get('/courses/all');
         console.log('Fetched courses:', response.data);
         return response.data;

    }
    catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
}

// Method to fetch course by ID
export const fetchCourseById = async (courseId: string) => {
    try {
        const response = await ApiClient.get(`/courses/${courseId}`);
        return response.data;
        
    } catch (error) {
        console.error(`Error fetching course with ID ${courseId}:`, error);
        throw error;
    }
}