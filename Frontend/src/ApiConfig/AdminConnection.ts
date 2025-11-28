import axios from 'axios';
import { clearAuthState } from './StudentConnection';
import { throwDeprecation } from 'process';

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
          const redirectPath = '/admin/login';
          if (window.location.pathname !== redirectPath) {
            window.location.href = redirectPath;
          }
        }
      }
    }
    return Promise.reject(error);
  },
)

// Method to  get admin dashboard data
export const  adminLogin = async (adminEmail: string, password: string) => {
    try {

        const response = await ApiClient.post('/auth/login', {
            email: adminEmail,
            password: password
        });

        console.log('Admin login response:', response.data);

        if (response.data.success && (response.data.jwt || response.data.token)) {

            // Store the token (backend returns 'token' istead of 'jwt')
            const authToken = response.data.jwt || response.data.token;
            localStorage.setItem('authtoken', authToken);
            localStorage.setItem('userRole', 'ADMIN');

            // Store user info  if available 
            if (response.data.data) {
                localStorage.setItem('userInfo', JSON.stringify(response.data.data));
            }
            
            return response.data;
            }else {
                throw new Error(response.data.message || 'Login failed');
            }



    }
    catch (error : any) {
        console.error('Error during admin login:', error);

        // Handle specific error message from backend
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }

        throw error;
    }
}

// Method to get admin profile 
export const getAdminProfile = async () => {
    try {
        const response = await ApiClient.get('/admin/profile');
        
        console.log('Admin profile response:', response.data);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Profile fetched successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch profile');
        }
    }
    catch (error : any) {
        console.error("Error fetching admin profile :", error);

        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }

        if (error.response?.status === 403) {
            throw new Error('You do not have permission to access this resource.');
        }

        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        throw error;
    }
}

// Method to  get all instructors
export const getAllInstructors = async () => {
    try {

        const response = await ApiClient.get('/admin/instructors');

        if (response.data.success) {
            return {
                success: true,
                data : response.data.data || [],
                message : response.data.message || 'Instructors fetched successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch instructors');
        }

    }
    catch (error : any) {
        console.error("Error fetching instructors :", error);

        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }

        if (error.response?.status === 403) {
            throw new Error('You do not have permission to access this resource.');
        }

        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }
}


// Method to approve instructor 
export const approveInstructor = async (instructorId: string) => {
    try {
        const response = await ApiClient.put(`/admin/instructor/approve/${instructorId}`);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Instructor approved successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to approve instructor');
        }
    }
    catch (error : any) {
        console.error('Error approving instructor :', error);

        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }

        if (error.response?.status === 403) {
            throw new Error('You do not have permission to perform this action.');
        }

        if (error.response?.status === 404) {
           throw new Error('Instructor not found.');
        } 

        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        throw error;
    }
}

// Method to reject instructor 
export const rejectInstructor = async (instructorId: string) => {
    try {
        const response = await ApiClient.delete(`/admin/instructor/reject/${instructorId}`);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Instructor rejected successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to reject instructor');
        }
    }
    catch (error : any) {
        console.error('Error rejecting instructor :', error);

        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }

        if (error.response?.status === 403) {
            throw new Error('You do not have permission to perform this action.');
        }

        if (error.response?.status === 404) {
           throw new Error('Instructor not found.');
        } 

        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        throw error;
    }
}

// Method to get instructor details
export const getInstructorDetails = async (instructorId: string) => {
    try {
        const response = await ApiClient.get(`/admin/instructor/${instructorId}`);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Instructor details fetched successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch instructor details');
        }
    }
    catch (error : any) {
        console.error('Error fetching instructor details :', error);

        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }

        if (error.response?.status === 403) {
            throw new Error('You do not have permission to access this resource.');
        }

        if (error.response?.status === 404) {
           throw new Error('Instructor not found.');
        } 

        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        throw error;
    }
}

// Method to get all students
export const getAllStudents = async () => {
    try {
        const response = await ApiClient.get('/admin/students');
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data || [],
                message: response.data.message || 'Students fetched successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch students');
        }
    }
    catch (error : any) {
        console.error('Error fetching students :', error);

        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }

        if (error.response?.status === 403) {
            throw new Error('You do not have permission to access this resource.');
        }

        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        throw error;
    }
}

// Method to change student role to admin
export const changeStudentToAdmin = async (studentId: string) => {
    try {
        const response = await ApiClient.put(`/admin/change-role/${studentId}`);
        
        if (response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Student role changed to admin successfully'
            };
        } else {
            throw new Error(response.data.message || 'Failed to change student role');
        }
    }
    catch (error : any) {
        console.error('Error changing student role :', error);

        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }

        if (error.response?.status === 403) {
            throw new Error('You do not have permission to perform this action.');
        }

        if (error.response?.status === 404) {
           throw new Error('Student not found.');
        } 

        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        
        throw error;
    }
}

