import axios from 'axios';

// Create axios client for instructor services
const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    timeout: 10000,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authtoken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==================== MODULE MANAGEMENT ====================

export const createModule = async (moduleData: {
    courseId: string;
    title: string;
    description?: string;
    position?: number;
}) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.post('/modules/create', moduleData);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to create module');
        }

    } catch (error: any) {
        console.error('Error creating module:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. Only instructors can create modules.');
        }
        
        throw error;
    }
};

export const getCourseModules = async (courseId: string) => {
    try {
        const response = await apiClient.get(`/modules/course/${courseId}`);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch modules');
        }

    } catch (error: any) {
        console.error('Error fetching course modules:', error);
        
        if (error.response?.status === 404) {
            throw new Error('Course not found');
        }
        
        throw error;
    }
};

export const updateModule = async (moduleId: string, moduleData: {
    title?: string;
    description?: string;
    position?: number;
}) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.put(`/modules/update/${moduleId}`, moduleData);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to update module');
        }

    } catch (error: any) {
        console.error('Error updating module:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only update your own modules.');
        }
        
        throw error;
    }
};

export const deleteModule = async (moduleId: string) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.delete(`/modules/delete/${moduleId}`);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to delete module');
        }

    } catch (error: any) {
        console.error('Error deleting module:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only delete your own modules.');
        }
        
        throw error;
    }
};

// ==================== ASSIGNMENT MANAGEMENT ====================

export const createAssignment = async (assignmentData: FormData) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.post('/assignment/create', assignmentData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to create assignment');
        }

    } catch (error: any) {
        console.error('Error creating assignment:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. Only instructors can create assignments.');
        }
        
        throw error;
    }
};

export const getModuleAssignments = async (moduleId: string) => {
    try {
        const response = await apiClient.get(`/assignment/module/${moduleId}`);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch assignments');
        }

    } catch (error: any) {
        console.error('Error fetching module assignments:', error);
        
        if (error.response?.status === 404) {
            throw new Error('Module not found');
        }
        
        throw error;
    }
};

export const updateAssignment = async (assignmentId: string, assignmentData: FormData) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.put(`/assignment/update/${assignmentId}`, assignmentData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to update assignment');
        }

    } catch (error: any) {
        console.error('Error updating assignment:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only update your own assignments.');
        }
        
        throw error;
    }
};

export const deleteAssignment = async (assignmentId: string) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.delete(`/assignment/delete/${assignmentId}`);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to delete assignment');
        }

    } catch (error: any) {
        console.error('Error deleting assignment:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only delete your own assignments.');
        }
        
        throw error;
    }
};

// Get all assignments
export const getAllAssignments = async () => {
    try {
        const response = await apiClient.get('/assignment/all');

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch assignments');
        }

    } catch (error: any) {
        console.error('Error fetching all assignments:', error);
        throw error;
    }
};

// Get specific assignment by ID
export const getAssignmentById = async (assignmentId: string) => {
    try {
        const response = await apiClient.get(`/assignment/${assignmentId}`);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch assignment');
        }

    } catch (error: any) {
        console.error('Error fetching assignment:', error);
        
        if (error.response?.status === 404) {
            throw new Error('Assignment not found');
        }
        
        throw error;
    }
};

// ==================== RESOURCE MANAGEMENT ====================

export const createResource = async (resourceData: FormData) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.post('/resources/create', resourceData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to create resource');
        }

    } catch (error: any) {
        console.error('Error creating resource:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. Only instructors can create resources.');
        }
        
        throw error;
    }
};

export const getModuleResources = async (moduleId: string) => {
    try {
        const response = await apiClient.get(`/resources/module/${moduleId}`);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch resources');
        }

    } catch (error: any) {
        console.error('Error fetching module resources:', error);
        
        if (error.response?.status === 404) {
            throw new Error('Module not found');
        }
        
        throw error;
    }
};

export const updateResource = async (resourceId: string, resourceData: FormData) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.put(`/resources/update/${resourceId}`, resourceData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to update resource');
        }

    } catch (error: any) {
        console.error('Error updating resource:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only update your own resources.');
        }
        
        throw error;
    }
};

export const deleteResource = async (resourceId: string) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.delete(`/resources/delete/${resourceId}`);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to delete resource');
        }

    } catch (error: any) {
        console.error('Error deleting resource:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only delete your own resources.');
        }
        
        throw error;
    }
};

// Get all resources
export const getAllResources = async () => {
    try {
        const response = await apiClient.get('/resources/all');

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch resources');
        }

    } catch (error: any) {
        console.error('Error fetching all resources:', error);
        throw error;
    }
};

// Get specific resource by ID
export const getResourceById = async (resourceId: string) => {
    try {
        const response = await apiClient.get(`/resources/${resourceId}`);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch resource');
        }

    } catch (error: any) {
        console.error('Error fetching resource:', error);
        
        if (error.response?.status === 404) {
            throw new Error('Resource not found');
        }
        
        throw error;
    }
};

// ==================== SUBMISSION MANAGEMENT ====================

export const getAssignmentSubmissions = async (assignmentId: string) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.get(`/submissions/assignment/${assignmentId}`);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch submissions');
        }

    } catch (error: any) {
        console.error('Error fetching assignment submissions:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only view submissions for your own assignments.');
        }
        
        throw error;
    }
};

export const getCourseSubmissions = async (courseId: string) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.get(`/submissions/course/${courseId}`);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch course submissions');
        }

    } catch (error: any) {
        console.error('Error fetching course submissions:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only view submissions for your own courses.');
        }
        
        throw error;
    }
};

export const getSubmissionStatistics = async (courseId: string) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.get(`/submissions/statistics/${courseId}`);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch submission statistics');
        }

    } catch (error: any) {
        console.error('Error fetching submission statistics:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only view statistics for your own courses.');
        }
        
        throw error;
    }
};

export const gradeSubmission = async (gradeData: {
    submissionId: string;
    pointsAwarded: number;
    feedback?: string;
}) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.post('/submissions/grade', {
            submissionId: gradeData.submissionId,
            pointsAwarded: gradeData.pointsAwarded,
            feedback: gradeData.feedback || ''
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to grade submission');
        }

    } catch (error: any) {
        console.error('Error grading submission:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only grade submissions for your own assignments.');
        }
        
        throw error;
    }
};

// Update an existing grade
export const updateGrade = async (gradeId: string, gradeData: {
    submissionId: string;
    pointsAwarded: number;
    feedback?: string;
}) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.put(`/submissions/grade/${gradeId}`, {
            submissionId: gradeData.submissionId,
            pointsAwarded: gradeData.pointsAwarded,
            feedback: gradeData.feedback || ''
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to update grade');
        }

    } catch (error: any) {
        console.error('Error updating grade:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only update grades for your own assignments.');
        }
        
        throw error;
    }
};

// Get ungraded submissions for a course
export const getUngradedSubmissions = async (courseId: string) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.get(`/submissions/ungraded/${courseId}`);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch ungraded submissions');
        }

    } catch (error: any) {
        console.error('Error fetching ungraded submissions:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only view submissions for your own courses.');
        }
        
        throw error;
    }
};

// ==================== GRADES MANAGEMENT ====================

export const getCourseGrades = async (courseId: string) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.get(`/grades/instructor/course/${courseId}`);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch course grades');
        }

    } catch (error: any) {
        console.error('Error fetching course grades:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only view grades for your own courses.');
        }
        
        throw error;
    }
};

export const getStudentGrades = async (studentId: string, courseId: string) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.get(`/grades/instructor/student/${studentId}/course/${courseId}`);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch student grades');
        }

    } catch (error: any) {
        console.error('Error fetching student grades:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only view grades for your own courses.');
        }
        
        throw error;
    }
};

export const getGradeStatistics = async (courseId: string) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.get(`/grades/instructor/course/${courseId}/summary`);

        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch grade statistics');
        }

    } catch (error: any) {
        console.error('Error fetching grade statistics:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only view statistics for your own courses.');
        }
        
        throw error;
    }
};

// ==================== EARNINGS/PAYMENTS MANAGEMENT ====================

export const getInstructorEarnings = async () => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.get('/instructor/payments/earnings');

        if (response.data) {
            return {
                success: true,
                data: response.data
            };
        } else {
            throw new Error('Failed to fetch earnings data');
        }

    } catch (error: any) {
        console.error('Error fetching instructor earnings:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. Only instructors can view earnings.');
        }
        
        throw error;
    }
};

export const getCoursePayments = async (courseId: string) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.get(`/instructor/payments/course/${courseId}`);

        if (response.data) {
            return {
                success: true,
                data: response.data
            };
        } else {
            throw new Error('Failed to fetch course payments');
        }

    } catch (error: any) {
        console.error('Error fetching course payments:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only view payments for your own courses.');
        }
        
        throw error;
    }
};

export const getAllInstructorPayments = async () => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.get('/instructor/payments/all');

        if (response.data) {
            return {
                success: true,
                data: response.data
            };
        } else {
            throw new Error('Failed to fetch instructor payments');
        }

    } catch (error: any) {
        console.error('Error fetching instructor payments:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. Only instructors can view payments.');
        }
        
        throw error;
    }
};

export const getCoursePaymentAnalytics = async (courseId: string) => {
    try {
        const token = localStorage.getItem('authtoken');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        const response = await apiClient.get(`/instructor/payments/analytics/course/${courseId}`);

        if (response.data) {
            return {
                success: true,
                data: response.data
            };
        } else {
            throw new Error('Failed to fetch course payment analytics');
        }

    } catch (error: any) {
        console.error('Error fetching course payment analytics:', error);
        
        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.');
        }
        
        if (error.response?.status === 403) {
            throw new Error('Access denied. You can only view analytics for your own courses.');
        }
        
        throw error;
    }
};