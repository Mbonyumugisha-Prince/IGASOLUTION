import axios from 'axios';

// Use environment variable or default to the backend URL
const CONNECTIONURL = import.meta.env.VITE_APPCONNECTION || 'http://localhost:5000/api/v1';

console.log('API Connection URL:', CONNECTIONURL);

const ApiClient = axios.create({
  baseURL: CONNECTIONURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const STUDENT_PROFILE_KEY = 'studentProfile';
export const AUTH_CHANGE_EVENT = 'iga:auth-changed';

/**
 * Debug function to check authentication state
 */
export const debugAuthState = () => {
    console.log('=== Authentication Debug ===');
    
    // Check all possible token locations
    const tokenKeys = ['authtoken', 'token', 'authToken', 'studentToken', 'jwt'];
    tokenKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            console.log(`✅ ${key}: ${value.substring(0, 30)}...`);
        } else {
            console.log(`❌ ${key}: null`);
        }
    });
    
    // Check if user profile exists
    const profile = localStorage.getItem('studentProfile');
    console.log(`Profile: ${profile ? 'exists' : 'null'}`);
    
    // Check all localStorage keys
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('===========================');
    
    return getAuthToken();
};

const dispatchAuthChange = () => {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
    }
  } catch {
    // ignore notification issues
  }
};

const persistStudentProfile = (profile: any) => {
  try {
    if (profile) {
      localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(profile));
    }
  } catch (err) {
    console.warn('Failed to persist student profile cache', err);
  }
};

const readCachedStudentProfile = () => {
  try {
    const raw = localStorage.getItem(STUDENT_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Failed to parse cached student profile', err);
    return null;
  }
};

const clearStudentProfileCache = () => {
  try {
    localStorage.removeItem(STUDENT_PROFILE_KEY);
  } catch {
    // ignore cache errors
  }
};

export const clearAuthState = () => {
  try {
    localStorage.removeItem('authtoken');
    localStorage.removeItem('userrole');
    clearStudentProfileCache();
  } catch (err) {
    console.warn('Failed to clear auth state', err);
  } finally {
    dispatchAuthChange();
  }
};

const persistAuthToken = (token?: string | null) => {
  if (token) {
    localStorage.setItem('authtoken', token);
    dispatchAuthChange();
  }
};

const persistUserRole = (role?: string | null) => {
  if (role) {
    localStorage.setItem('userrole', role);
  }
};

const extractTokenFromResponse = (respData: any, response: any) => {
  const authorization = response?.headers?.authorization;
  const candidates = [
    respData?.token,
    respData?.Token,
    respData?.data?.token,
    respData?.data?.Token,
    respData?.data?.accessToken,
    respData?.accessToken,
    typeof authorization === 'string' ? authorization.split(' ')[1] : null,
  ];

  return (
    candidates.find(
      (candidate) => typeof candidate === 'string' && candidate.trim().length > 0,
    ) || null
  );
};

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
      console.warn(`[Auth] 401 received from ${failingUrl}. Clearing auth state.`);

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
);

// Method to login  the  student
export const studentLogin = async (email: string, password: string) => {
     try {
        console.log('Attempting login for:', email);
        
        const response = await ApiClient.post('/auth/login',  {
            email, 
            password
        });

        console.log('Login response status:', response.status);
        console.log('Login response data:', response.data);

        // Safely persist token and optional role when present.
        // Use optional chaining to avoid reading properties on null/undefined.
        const respData = response?.data;

        // token may be in different locations depending on backend shape
        const possibleToken = extractTokenFromResponse(respData, response);

        persistAuthToken(possibleToken);

        // role may also be in different places
        const role = respData?.data?.role ?? respData?.role;
        persistUserRole(role);

        return respData;

     }
     catch (error: any) {
        console.error('Error logging in student:', error);
        
        // Enhanced error logging for 409 status
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            
            if (error.response.status === 409) {
                const errorMessage = error.response.data?.message || 'Login conflict - please check credentials';
                console.error('409 Conflict Error:', errorMessage);
                
                // Create a more user-friendly error
                const friendlyError = new Error(errorMessage);
                friendlyError.name = 'LoginConflictError';
                throw friendlyError;
            }
        } else if (error.request) {
            console.error('Network error - no response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
        
        throw error;
     }
}

// Method  to  register the student 
export const studentRegister = async (
    firstName: string, 
    lastName: string,
    email: string,
    password: string

) => {
     try {
    const payload = { firstName, lastName, email, password};
    const response = await ApiClient.post("/auth/signup/student", payload);
    const respData = response?.data;

    const possibleToken = extractTokenFromResponse(respData, response);

    persistAuthToken(possibleToken);

    const role = respData?.data?.role ?? respData?.role;
    persistUserRole(role);

    return respData;

}  
catch (error) {
    console.error('Error registering student:', error);
    throw error;    
}
}


// method to getting  student profile 
export const fetchStudentProfile = async () => {
    try  {
        const response = await ApiClient.get('/student/profile');
        // return the  backend ApiResponse object 
        if (response.data) {
            if (response.data?.data) {
                persistStudentProfile(response.data.data);
            }
            return response.data;
        }
        throw new Error("Unexpected response format");


    }
    catch (error) {
        console.error('Error fetching student profile:', error);
        // Surface a readable error message
        const message = error?.response?.data?.message || error.message || 'Failed to fetch student profile';
        clearStudentProfileCache();
        throw new Error(message);
    }

}

// method to update student profile
export const updateStudentProfile = async (profileData: {
    firstName: string;
    lastName: string;
    email : string;
    password: string | null;
}) => {
    try {
        const payload : Record<string, any>  = { 
            firstName: profileData.firstName,
            lastName : profileData.lastName,
            email : profileData.email
        };

        // Only include password when it's non-empty after trimming
        if (profileData.password && profileData.password.trim() !== '') {
            payload.password = profileData.password;
        }

        const response = await ApiClient.put('/student/update/profile', payload);
        const respData = response?.data;

        const possibleToken = extractTokenFromResponse(respData, response);

        persistAuthToken(possibleToken);

        const role = respData?.data?.role ?? respData?.role;
        persistUserRole(role);

        return respData;
    }
    catch (error) {
        console.error('Error updating student profile:', error);
        const message = (error as any)?.response?.data?.message || (error as any).message || 'Failed to update student profile';
        throw new Error(message);
    }
}


// method for deleting the user profile 
export const deletingStudentProfile = async () => {
    try {
        const response = await ApiClient.delete('/student/delete/profile');
        if (response.data && response.data.success) {
            clearAuthState();
        }
        return response.data;
    }
    catch (error) {
        console.error('Error deleting student profile:', error);
        const message = (error as any)?.response?.data?.message || (error as any).message || 'Failed to delete student profile';
        throw new Error(message);
    }
}

export interface CoursePaymentRequest {
    courseId: string;
    amount: number;
    currency?: string;
    email: string;
    phoneNumber: string;
    name: string;
    redirectUrl: string;
    callbackUrl?: string;
    description?: string;

}

export interface PaymentVerificationRequest {
    transactionId: string;
    paymentReference: string;
    status?: string;
    amount? : number;
}

export interface PaymentHistoryItem {
    id : string;
    courseName: string;
    courseId: string;
    studentName: string;
    studentId: string;
    amount: number;
    paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
    transactionReference: string;
    paymentMethod : string;
    paymentDate: string;

}

export interface PaymentResponse {
    success: boolean;
    message: string;
    errorCode?: string;
    timestamp: string;
    paymentLink?: string;
    paymentReference?: string;
    paymentId?: string;
    transactionId?: string;
    amount?: number;
    currency?: string;
    paymentStatus?: string;
    courseId?: string;
    courseName?: string;
    userId?: string;
    customerName?: string;
    customerEmail?: string;
    enrollmentId?: string;
    enrollmentStatus?: string;
    enrollmentDate?: string;
    metadata?: Record<string, any>;
    gatewayResponse?: any;
}


// Method to initiate payment services for student 
export const fetchStudentPaymentServices = async (paymentData: CoursePaymentRequest): Promise<PaymentResponse> => {
    try {
        const response = await ApiClient.post('/student/payments/initiate/course', paymentData);
        if (response.data &&  response.data.success) {
              console.log('Payment initiation response successfully:', response.data);

              return response.data
        }

        throw new Error(response.data?.message || 'Failed to initiate payment');
    }
    catch (error) {
        console.error('Error fetching student payment services:', error);
        const message = (error as any)?.response?.data?.message || (error as any).message || 'Failed to fetch payment services';
        throw new Error(message);
    }
}

// Method to verify  payment
export const verifyPayment = async (verificationData: PaymentVerificationRequest): Promise<PaymentResponse> => {
    try {
        const response = await ApiClient.post('/student/payments/course/verify', verificationData);
        if (response.data && response.data.success) {
            console.log('payment verication response successfully:', response.data);
            return response.data;
        }

        throw new Error(response.data?.message || 'Failed to verify payment');

    }
    catch (error) {
        console.error('Error verifying payment:', error);
        const message = (error as any)?.response?.data?.message || (error as any).message || 'Failed to verify payment';
        throw new Error(message);
    }
}

// Method  to fetch student payment history 
export const fetchStudentPaymentHistory = async (page :number = 1 , size: number = 10): Promise<any> => {
    try {
        const response = await ApiClient.get('/student/payments/history', {
            params: {
                page,
                size,
                sort: 'paymentDate',
            }
        });

        if (response.data) {
            console.log('Fetched student payment history successfully:', response.data);
            return response.data;

        }


        throw new Error('Unexpected response format');
    }
    catch (error: any) {
        console.error('Error fetching student payment history:', error);
        const message = error?.response?.data?.message || error.message || 'Failed to fetch payment history';
        throw new Error(message);
    }
}

// Method to  get  specific payment details
export const fetchPaymentById = async (paymentId: string) : Promise<any> => {
    try {

        const response = await ApiClient.get(`/student/payment/${paymentId}`);

        if (response.data) {
            return response.data;
        }

        throw new Error('Unexpected response format');

    }
    catch (error) {
        console.error('Error fetching payment by ID:', error);
        const message = (error as any)?.response?.data?.message || (error as any).message || 'Failed to fetch payment details';
        throw new Error(message);
    }
}

// Method to  get payment by reference 
export const fetchPaymentByReference = async (reference: string): Promise<any> => {
    try {
        try {
        const response = await ApiClient.get(`/student/payments/reference/${reference}`);
        
        if (response.data) {
            return response.data;
        }
        
        throw new Error('Payment not found');
    } catch (error: any) {
        console.error('Error fetching payment by reference:', error);
        const message = error?.response?.data?.message || error.message || 'Failed to fetch payment';
        throw new Error(message);
    }

    }
    catch (error) {
        console.error('Error fetching payment by reference:', error);
        const message = (error as any)?.response?.data?.message || (error as any).message || 'Failed to fetch payment by reference';
        throw new Error(message);
    }
}

//Method to check if student has paid for course 
export const checkStudentCoursePaymentStatus = async(courseId: string): Promise<boolean> => {
    try {

        const response = await ApiClient.get(`/student/payments/check/${courseId}`);
        return response.data === true;

    }
    catch (error) {
        console.error('Error checking course payment status:', error);
        const message = (error as any)?.response?.data?.message || (error as any).message || 'Failed to check course payment status';
        throw new Error(message);
    }
}

//Method to request refund 
export const requestPaymentRefund = async (paymentId: string, reason: string): Promise<PaymentResponse> => {
    try {

        const response = await ApiClient.post(`/student/payments/refund/${paymentId}`, null, {
            params: {reason}
        });

        if (response.data &&  response.data.success) {
            console.log('Payment refund request response successfully:', response.data);

            return response.data
      }

      throw new Error(response.data?.message || 'Failed to request payment refund');
        }

    
    catch (error) {
        console.error('Error requesting payment refund:', error);
        const message = (error as any)?.response?.data?.message || (error as any).message || 'Failed to request payment refund';
        throw new Error(message);
    }
}

// Helper method to handle Flutterwave payment flow
export const handleFlutterwavePayment = async (
    courseId: string, 
    amount: number, 
    customerInfo: { 
        email: string; 
        phoneNumber: string; 
        name: string; 
    },
    callbacks: {
        onSuccess?: (response: PaymentResponse) => void;
        onError?: (error: string) => void;
        onClose?: () => void;
    } = {}
): Promise<void> => {
    try {
        // Get current domain for redirect URL
        const currentDomain = typeof window !== 'undefined' ? window.location.origin : '';
        // Using universal callback handler that works for both frontend and backend redirects
        const redirectUrl = `${currentDomain}/payment/callback`;
        const callbackUrl = `${currentDomain}/payment/webhook`;

        // Initiate payment
        const paymentRequest: CoursePaymentRequest = {
            courseId,
            amount,
            currency: 'RWF', // Default to Rwandan Francs
            email: customerInfo.email,
            phoneNumber: customerInfo.phoneNumber,
            name: customerInfo.name,
            redirectUrl,
            callbackUrl,
            description: `Payment for course ${courseId}`
        };

        const paymentResponse = await fetchStudentPaymentServices(paymentRequest);

        if (paymentResponse.success && paymentResponse.paymentLink) {
            // Redirect to Flutterwave payment page
            if (typeof window !== 'undefined') {
                window.location.href = paymentResponse.paymentLink;
            }
        } else {
            const errorMessage = paymentResponse.message || 'Failed to initiate payment';
            callbacks.onError?.(errorMessage);
        }
    } catch (error: any) {
        console.error('Error handling Flutterwave payment:', error);
        callbacks.onError?.(error.message || 'Payment initiation failed');
    }
};

// Method to handle payment callback from Flutterwave
export const handlePaymentCallback = async (
    transactionId: string, 
    paymentReference: string, 
    status?: string
): Promise<PaymentResponse> => {
    try {
        const verificationRequest: PaymentVerificationRequest = {
            transactionId,
            paymentReference,
            status
        };

        const verificationResponse = await verifyPayment(verificationRequest);
        
        if (verificationResponse.success) {
            console.log('Payment completed successfully:', verificationResponse);
            
            // Dispatch a custom event for payment completion
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('iga:payment-completed', {
                    detail: verificationResponse
                }));
            }
        }
        
        return verificationResponse;
    } catch (error: any) {
        console.error('Error handling payment callback:', error);
        throw error;
    }
};

// Updated method to fetch student payment dashboard info (now complete)
export const fetchStudentPaymentDashboardInfo = async () => {
    try {
        const [paymentHistory, userProfile] = await Promise.all([
            fetchStudentPaymentHistory(0, 5), // Get recent payments
            fetchStudentProfile()
        ]);

        return {
            paymentHistory: paymentHistory?.content || [],
            totalPayments: paymentHistory?.totalElements || 0,
            userProfile: userProfile?.data,
            paymentMethods: ['FLUTTERWAVE'], // Supported payment methods
            supportedCurrencies: ['RWF', 'USD', 'EUR'] // Supported currencies
        };
    } catch (error: any) {
        console.error('Error fetching student payment dashboard info:', error);
        const message = error?.response?.data?.message || error.message || 'Failed to fetch payment dashboard info';
        throw new Error(message);
    }
};

// Utility function to format payment status for display
export const formatPaymentStatus = (status: string): string => {
    switch (status?.toUpperCase()) {
        case 'PENDING':
            return 'Pending';
        case 'COMPLETED':
            return 'Completed';
        case 'FAILED':
            return 'Failed';
        case 'REFUNDED':
            return 'Refunded';
        case 'CANCELLED':
            return 'Cancelled';
        default:
            return 'Unknown';
    }
};

// Utility function to format currency amounts
export const formatPaymentAmount = (amount: number, currency: string = 'RWF'): string => {
    try {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    } catch (error) {
        return `${currency} ${amount.toLocaleString()}`;
    }
};

// Method to getting my  enrollments
export const fetchMyEnrollmets  = async () : Promise<any> => {
    try {

    }
    catch (error) {
        console.error('Error fetching my enrollments:', error);
        const message = (error as any)?.response?.data?.message || (error as any).message || 'Failed to fetch enrollments';
        throw new Error(message);
    }
}


// Enrollment interfaces to match backend DTOs
export interface EnrollmentItem {
    id: string;
    courseId: string;
    courseName: string;
    courseDescription?: string;
    instructorName?: string;
    enrollmentDate: string;
    progress: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
    completionDate?: string;
}

export interface EnrollmentResponse {
    success: boolean;
    message: string;
    data?: EnrollmentItem;
    errorCode?: string;
}

export interface EnrollmentPage {
    content: EnrollmentItem[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

// Method to get enrolled courses (simplified course list from enrollments)
export const fetchEnrolledCourses = async (): Promise<any> => {
    try {
        const enrollmentsResponse = await fetchMyEnrollments(0, 100); // Get all enrollments
        
        if (enrollmentsResponse && enrollmentsResponse.content) {
            // Transform enrollment data to course format
            const courses = enrollmentsResponse.content.map((enrollment: EnrollmentItem) => ({
                id: enrollment.courseId,
                courseId: enrollment.courseId,
                title: enrollment.courseName,
                courseName: enrollment.courseName,
                description: enrollment.courseDescription,
                instructorName: enrollment.instructorName,
                enrollmentDate: enrollment.enrollmentDate,
                progress: enrollment.progress
            }));
            
            return {
                success: true,
                data: courses,
                message: 'Enrolled courses fetched successfully'
            };
        }
        
        return {
            success: true,
            data: [],
            message: 'No enrolled courses found'
        };
    }
    catch (error: any) {
        console.error('Error fetching enrolled courses:', error);
        const message = error?.response?.data?.message || error.message || 'Failed to fetch enrolled courses';
        throw new Error(message);
    }
}

// Method to get my enrollments (completing the existing method)
export const fetchMyEnrollments = async (page: number = 0, size: number = 10): Promise<EnrollmentPage> => {
    try {
        const response = await ApiClient.get('/student/enrollments/my-enrollments', {
            params: {
                page,
                size
            }
        });

        if (response.data && response.data.success) {
            console.log('Fetched student enrollments successfully:', response.data);
            return response.data.data; // The Page<EnrollmentDto> is in the data field
        }

        throw new Error(response.data?.message || 'Failed to fetch enrollments');
    }
    catch (error: any) {
        console.error('Error fetching my enrollments:', error);
        const message = error?.response?.data?.message || error.message || 'Failed to fetch enrollments';
        throw new Error(message);
    }
}

// Method to update enrollment progress
export const updateEnrollmentProgress = async (
    enrollmentId: string, 
    progress: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED'
): Promise<EnrollmentResponse> => {
    try {
        const response = await ApiClient.put(`/student/enrollments/${enrollmentId}/progress`, null, {
            params: {
                progress
            }
        });

        if (response.data && response.data.success) {
            console.log('Enrollment progress updated successfully:', response.data);
            return response.data;
        }

        throw new Error(response.data?.message || 'Failed to update progress');
    }
    catch (error: any) {
        console.error('Error updating enrollment progress:', error);
        const message = error?.response?.data?.message || error.message || 'Failed to update enrollment progress';
        throw new Error(message);
    }
}

// Method to check if student is enrolled in a course
export const checkEnrollmentStatus = async (courseId: string): Promise<boolean> => {
    try {
        const response = await ApiClient.get(`/student/enrollments/check/${courseId}`);
        
        if (response.data && response.data.success) {
            return response.data.data; // Boolean value
        }

        return false;
    }
    catch (error: any) {
        console.error('Error checking enrollment status:', error);
        return false;
    }
}

// Method to get enrollment count for a course (public endpoint)
export const getCourseEnrollmentCount = async (courseId: string): Promise<number> => {
    try {
        const response = await ApiClient.get(`/student/enrollments/course/${courseId}/count`);
        
        if (response.data && response.data.success) {
            return response.data.data; // Number value
        }

        return 0;
    }
    catch (error: any) {
        console.error('Error getting course enrollment count:', error);
        return 0;
    }
}

// Method to get enrollment dashboard info including enrollments
export const fetchStudentEnrollmentDashboard = async () => {
    try {
        const [enrollments, profile] = await Promise.all([
            fetchMyEnrollments(0, 5), // Get recent enrollments
            fetchStudentProfile()
        ]);

        const enrollmentStats = {
            totalEnrollments: enrollments.totalElements,
            activeEnrollments: enrollments.content.filter(e => e.progress === 'IN_PROGRESS').length,
            completedEnrollments: enrollments.content.filter(e => e.progress === 'COMPLETED').length,
            notStartedEnrollments: enrollments.content.filter(e => e.progress === 'NOT_STARTED').length
        };

        return {
            enrollments: enrollments.content,
            enrollmentStats,
            totalEnrollments: enrollments.totalElements,
            userProfile: profile?.data
        };
    } catch (error: any) {
        console.error('Error fetching enrollment dashboard:', error);
        const message = error?.response?.data?.message || error.message || 'Failed to fetch enrollment dashboard';
        throw new Error(message);
    }
};

// Utility function to format enrollment progress for display
export const formatEnrollmentProgress = (progress: string): string => {
    switch (progress?.toUpperCase()) {
        case 'NOT_STARTED':
            return 'Not Started';
        case 'IN_PROGRESS':
            return 'In Progress';
        case 'COMPLETED':
            return 'Completed';
        case 'DROPPED':
            return 'Dropped';
        default:
            return 'Unknown';
    }
};

// Utility function to get progress color for UI
export const getProgressColor = (progress: string): string => {
    switch (progress?.toUpperCase()) {
        case 'NOT_STARTED':
            return 'bg-gray-100 text-gray-800';
        case 'IN_PROGRESS':
            return 'bg-blue-100 text-blue-800';
        case 'COMPLETED':
            return 'bg-green-100 text-green-800';
        case 'DROPPED':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

// =============== ENROLLMENT API FUNCTIONS ===============

// Debug function to test authentication
export const testAuthentication = async (): Promise<any> => {
    const token = localStorage.getItem('authtoken');
    console.log('Testing authentication with token:', token ? 'Present' : 'Missing');
    
    if (!token) {
        throw new Error('No authentication token found');
    }

    try {
        const response = await fetch(`${CONNECTIONURL}/student/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Test auth response status:', response.status);
        
        if (!response.ok) {
            console.log('Test auth failed with status:', response.status);
            const errorText = await response.text();
            console.log('Error response:', errorText);
            throw new Error(`Authentication test failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Test auth successful:', data);
        return data;
    } catch (error) {
        console.error('Authentication test error:', error);
        throw error;
    }
};

// Fetch student enrollments with pagination
export const fetchStudentEnrollments = async (page: number = 0, size: number = 10): Promise<any> => {
    const token = localStorage.getItem('authtoken');
    if (!token) {
        throw new Error('No authentication token found');
    }

    try {
        console.log('Making enrollment request with token:', token ? 'Present' : 'Missing');
        console.log('Request URL:', `${CONNECTIONURL}/student/enrollments/my-enrollments?page=${page}&size=${size}`);
        
        const response = await fetch(`${CONNECTIONURL}/student/enrollments/my-enrollments?page=${page}&size=${size}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
            // Handle different error status codes
            if (response.status === 401) {
                console.error('Authentication failed - token may be expired');
                // Clear invalid token
                localStorage.removeItem('authtoken');
                throw new Error('Authentication failed. Please login again.');
            }
            
            // Try to get error message from response
            let errorMessage = 'Failed to fetch enrollments';
            try {
                const errorData = await response.text(); // Use text() instead of json() for error responses
                console.log('Error response:', errorData);
                const parsedError = JSON.parse(errorData);
                errorMessage = parsedError.message || errorMessage;
            } catch (e) {
                console.log('Could not parse error response as JSON');
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Enrollment API response:', data);
        
        return data;
    } catch (error) {
        console.error('Error fetching student enrollments:', error);
        throw error;
    }
};

// Check if student is enrolled in a specific course
export const checkStudentEnrollment = async (courseId: string): Promise<any> => {
    const token = localStorage.getItem('authtoken');
    if (!token) {
        throw new Error('No authentication token found');
    }

    try {
        const response = await fetch(`${CONNECTIONURL}/student/enrollments/check/${courseId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('authtoken');
                throw new Error('Authentication failed. Please login again.');
            }
            
            let errorMessage = 'Failed to check enrollment status';
            try {
                const errorData = await response.text();
                const parsedError = JSON.parse(errorData);
                errorMessage = parsedError.message || errorMessage;
            } catch (e) {
                console.log('Could not parse error response as JSON');
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking enrollment status:', error);
        throw error;
    }
};

// Update student enrollment progress
export const updateStudentEnrollmentProgress = async (enrollmentId: string, progress: string): Promise<any> => {
    const token = localStorage.getItem('authtoken');
    if (!token) {
        throw new Error('No authentication token found');
    }

    try {
        const response = await fetch(`${CONNECTIONURL}/student/enrollments/${enrollmentId}/progress?progress=${progress}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('authtoken');
                throw new Error('Authentication failed. Please login again.');
            }
            
            let errorMessage = 'Failed to update enrollment progress';
            try {
                const errorData = await response.text();
                const parsedError = JSON.parse(errorData);
                errorMessage = parsedError.message || errorMessage;
            } catch (e) {
                console.log('Could not parse error response as JSON');
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating enrollment progress:', error);
        throw error;
    }
};

// Course Modules and Resources API Functions

/**
 * Get authentication token from localStorage with fallback options
 */
const getAuthToken = (): string | null => {
    // Try different possible token keys
    const possibleKeys = ['authtoken', 'token', 'authToken', 'studentToken'];
    
    for (const key of possibleKeys) {
        const token = localStorage.getItem(key);
        if (token) {
            console.log(`Found token with key: ${key}`);
            // Remove Bearer prefix if it already exists to avoid double Bearer
            return token.startsWith('Bearer ') ? token.substring(7) : token;
        }
    }
    
    console.error('No authentication token found in localStorage');
    console.log('Available localStorage keys:', Object.keys(localStorage));
    return null;
};

export interface ModuleDto {
    id: string;
    title: string;
    description: string;
    position: number;
    courseId: string;
    resources?: ResourceDto[];
}

export interface ResourceDto {
    id: string;
    resourceType: 'VIDEO' | 'PDF' | 'QUIZ' | 'ASSIGNMENT' | 'LINK';
    title: string;
    fileUrl?: string;  // Changed from MultipartFile to string
    link?: string;
    description?: string;
    moduleId: string;
}

export interface ModuleResponse {
    message: string;
    success: boolean;
    data: ModuleDto[] | ModuleDto;
    statusCode: number;
}

export interface ResourceResponse {
    message: string;
    success: boolean;
    data: ResourceDto[] | ResourceDto;
    statusCode: number;
}

/**
 * Fetch all modules for a specific course
 */
export const fetchCourseModules = async (courseId: string): Promise<ModuleDto[]> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }

        console.log(`Fetching modules for course: ${courseId}`);
        console.log('Using token (first 20 chars):', token.substring(0, 20) + '...');

        const response = await fetch(`${CONNECTIONURL}/modules/course/${courseId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.status === 401) {
            console.log('Token expired or invalid, clearing auth state');
            clearAuthState();
            throw new Error('Authentication failed. Please login again.');
        }

        if (!response.ok) {
            const responseText = await response.text();
            console.log('Error response body:', responseText);
            const errorMessage = response.status === 404 
                ? 'Course modules not found' 
                : `Failed to fetch course modules: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
        }

        const result: ModuleResponse = await response.json();
        console.log('Modules fetch result:', result);

        if (result.success && result.data) {
            return Array.isArray(result.data) ? result.data : [result.data];
        } else {
            throw new Error(result.message || 'Failed to fetch modules');
        }
    } catch (error) {
        console.error('Error fetching course modules:', error);
        throw error;
    }
};

/**
 * Fetch all resources for a specific module
 */
export const fetchModuleResources = async (moduleId: string): Promise<ResourceDto[]> => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }

        console.log(`Fetching resources for module: ${moduleId}`);

        const response = await fetch(`${CONNECTIONURL}/resources/module/${moduleId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('Resources response status:', response.status);

        if (response.status === 401) {
            console.log('Token expired or invalid, clearing auth state');
            clearAuthState();
            throw new Error('Authentication failed. Please login again.');
        }

        if (!response.ok) {
            const responseText = await response.text();
            console.log('Error response body:', responseText);
            const errorMessage = response.status === 404 
                ? 'Module resources not found' 
                : `Failed to fetch module resources: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
        }

        // Check content type and response content
        const contentType = response.headers.get('content-type');
        console.log('Response content-type:', contentType);
        
        // Check if response has content before trying to parse JSON
        const responseText = await response.text();
        console.log('Raw response text length:', responseText.length);
        
        if (!responseText || responseText.trim() === '') {
            console.log('Empty response received for module resources');
            return []; // Return empty array for empty response
        }

        let result: ResourceResponse;
        try {
            result = JSON.parse(responseText);
            console.log('Resources fetch result:', result);
        } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            console.log('Response text that failed to parse:', responseText.substring(0, 200));
            throw new Error('Invalid JSON response from server');
        }

        if (result.success && result.data) {
            return Array.isArray(result.data) ? result.data : [result.data];
        } else {
            throw new Error(result.message || 'Failed to fetch resources');
        }
    } catch (error) {
        console.error('Error fetching module resources:', error);
        throw error;
    }
};

/**
 * Fetch course content (modules with their resources)
 */
export const fetchCourseContent = async (courseId: string): Promise<ModuleDto[]> => {
    try {
        console.log(`Fetching complete course content for: ${courseId}`);
        
        // First, fetch all modules for the course
        const modules = await fetchCourseModules(courseId);
        
        // Then, fetch resources for each module
        const modulesWithResources = await Promise.all(
            modules.map(async (module) => {
                try {
                    const resources = await fetchModuleResources(module.id);
                    return {
                        ...module,
                        resources
                    };
                } catch (error) {
                    console.warn(`Failed to fetch resources for module ${module.id}:`, error);
                    return {
                        ...module,
                        resources: []
                    };
                }
            })
        );

        console.log('Complete course content:', modulesWithResources);
        return modulesWithResources;
    } catch (error) {
        console.error('Error fetching course content:', error);
        throw error;
    }
};


// Assignment interfaces
export interface Assignment {
    id: string;
    title: string;
    description: string;
    assignmentType: 'QUIZ' | 'MID' | 'SUMMATIVE';
    documentUrl?: string;
    maxPoints: number;
    dueDate: string;
    moduleId: string;
}

export interface SubmissionDto {
    id: string;
    assignmentId: string;
    assignmentTitle: string;
    studentId: string;
    studentName: string;
    submissionFile: string;
    feedback?: string;
    submittedAt: string;
    grade?: number;
    gradedAt?: string;
    isGraded: boolean;
}

export interface SubmissionResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Fetch assignments for a specific course
export const fetchCourseAssignments = async (courseId: string): Promise<Assignment[]> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Authentication token not found. Please login again.');
    }

    try {
        console.log(`Fetching assignments for course: ${courseId}`);
        
        const response = await ApiClient.get(`/submissions/available-assignments/${courseId}`);
        
        if (response.data?.success && response.data?.data) {
            console.log('Assignments fetched successfully:', response.data.data);
            return response.data.data;
        }
        
        throw new Error(response.data?.message || 'Failed to fetch assignments');
    } catch (error: any) {
        console.error('Error fetching course assignments:', error);
        
        if (error.response?.status === 401) {
            console.log('Token expired or invalid, clearing auth state');
            clearAuthState();
            throw new Error('Authentication failed. Please login again.');
        }
        
        const message = error?.response?.data?.message || error.message || 'Failed to fetch assignments';
        throw new Error(message);
    }
};

// Fetch student's submissions for a course
export const fetchStudentSubmissions = async (courseId: string): Promise<SubmissionDto[]> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Authentication token not found. Please login again.');
    }

    try {
        console.log(`Fetching submissions for course: ${courseId}`);
        
        const response = await ApiClient.get(`/submissions/my-submissions/${courseId}`);
        
        if (response.data?.success && response.data?.data) {
            console.log('Submissions fetched successfully:', response.data.data);
            return response.data.data;
        }
        
        return []; // Return empty array if no submissions
    } catch (error: any) {
        console.error('Error fetching student submissions:', error);
        
        if (error.response?.status === 401) {
            console.log('Token expired or invalid, clearing auth state');
            clearAuthState();
            throw new Error('Authentication failed. Please login again.');
        }
        
        const message = error?.response?.data?.message || error.message || 'Failed to fetch submissions';
        throw new Error(message);
    }
};

// Submit an assignment
export const submitAssignment = async (assignmentId: string, file: File): Promise<SubmissionDto> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Authentication token not found. Please login again.');
    }

    try {
        console.log(`Submitting assignment: ${assignmentId}`);
        
        const formData = new FormData();
        formData.append('assignmentId', assignmentId);
        formData.append('submissionFile', file);

        const response = await ApiClient.post('/submissions/submit', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        if (response.data?.success && response.data?.data) {
            console.log('Assignment submitted successfully:', response.data.data);
            return response.data.data;
        }
        
        throw new Error(response.data?.message || 'Failed to submit assignment');
    } catch (error: any) {
        console.error('Error submitting assignment:', error);
        
        if (error.response?.status === 401) {
            console.log('Token expired or invalid, clearing auth state');
            clearAuthState();
            throw new Error('Authentication failed. Please login again.');
        }
        
        const message = error?.response?.data?.message || error.message || 'Failed to submit assignment';
        throw new Error(message);
    }
};

// Update an assignment submission
export const updateAssignmentSubmission = async (submissionId: string, file: File): Promise<SubmissionDto> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Authentication token not found. Please login again.');
    }

    try {
        console.log(`Updating submission: ${submissionId}`);
        
        const formData = new FormData();
        formData.append('submissionFile', file);

        const response = await ApiClient.put(`/submissions/update/${submissionId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        if (response.data?.success && response.data?.data) {
            console.log('Submission updated successfully:', response.data.data);
            return response.data.data;
        }
        
        throw new Error(response.data?.message || 'Failed to update submission');
    } catch (error: any) {
        console.error('Error updating submission:', error);
        
        if (error.response?.status === 401) {
            console.log('Token expired or invalid, clearing auth state');
            clearAuthState();
            throw new Error('Authentication failed. Please login again.');
        }
        
        const message = error?.response?.data?.message || error.message || 'Failed to update submission';
        throw new Error(message);
    }
};

// Delete an assignment submission
export const deleteAssignmentSubmission = async (submissionId: string): Promise<void> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Authentication token not found. Please login again.');
    }

    try {
        console.log(`Deleting submission: ${submissionId}`);
        
        const response = await ApiClient.delete(`/submissions/delete/${submissionId}`);
        
        if (!response.data?.success) {
            throw new Error(response.data?.message || 'Failed to delete submission');
        }
        
        console.log('Submission deleted successfully');
    } catch (error: any) {
        console.error('Error deleting submission:', error);
        
        if (error.response?.status === 401) {
            console.log('Token expired or invalid, clearing auth state');
            clearAuthState();
            throw new Error('Authentication failed. Please login again.');
        }
        
        const message = error?.response?.data?.message || error.message || 'Failed to delete submission';
        throw new Error(message);
    }
};

// Get a specific submission by ID
export const fetchSubmissionById = async (submissionId: string): Promise<SubmissionDto> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Authentication token not found. Please login again.');
    }

    try {
        console.log(`Fetching submission: ${submissionId}`);
        
        const response = await ApiClient.get(`/submissions/my-submission/${submissionId}`);
        
        if (response.data?.success && response.data?.data) {
            console.log('Submission fetched successfully:', response.data.data);
            return response.data.data;
        }
        
        throw new Error(response.data?.message || 'Failed to fetch submission');
    } catch (error: any) {
        console.error('Error fetching submission:', error);
        
        if (error.response?.status === 401) {
            console.log('Token expired or invalid, clearing auth state');
            clearAuthState();
            throw new Error('Authentication failed. Please login again.');
        }
        
        const message = error?.response?.data?.message || error.message || 'Failed to fetch submission';
        throw new Error(message);
    }
};

// =============== STUDENT GRADING API FUNCTIONS ===============

// Interfaces for grading data
export interface GradeDto {
    gradeId: string;
    assignmentId: string;
    assignmentTitle: string;
    pointsAwarded: number;
    maxPoints: number;
    percentage: number;
    feedback?: string;
    gradedAt: string;
    assignmentType: 'QUIZ' | 'MID' | 'SUMMATIVE';
}

export interface GradeResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Get student's grades for a specific course
export const fetchCourseGrades = async (courseId: string): Promise<GradeDto[]> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Authentication token not found. Please login again.');
    }

    try {
        console.log(`Fetching grades for course: ${courseId}`);
        
        const response = await ApiClient.get(`/grades/course/${courseId}`);
        
        if (response.data?.success && response.data?.data) {
            console.log('Course grades fetched successfully:', response.data.data);
            return response.data.data;
        }
        
        return []; // Return empty array if no grades
    } catch (error: any) {
        console.error('Error fetching course grades:', error);
        
        if (error.response?.status === 401) {
            console.log('Token expired or invalid, clearing auth state');
            clearAuthState();
            throw new Error('Authentication failed. Please login again.');
        }
        
        const message = error?.response?.data?.message || error.message || 'Failed to fetch course grades';
        throw new Error(message);
    }
};

// Get student's overall grades for all enrolled courses
export const fetchOverallGrades = async (): Promise<Record<string, GradeDto[]>> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Authentication token not found. Please login again.');
    }

    try {
        console.log('Fetching overall grades for all courses');
        
        const response = await ApiClient.get('/grades/overall');
        
        if (response.data?.success && response.data?.data) {
            console.log('Overall grades fetched successfully:', response.data.data);
            return response.data.data;
        }
        
        return {}; // Return empty object if no grades
    } catch (error: any) {
        console.error('Error fetching overall grades:', error);
        
        if (error.response?.status === 401) {
            console.log('Token expired or invalid, clearing auth state');
            clearAuthState();
            throw new Error('Authentication failed. Please login again.');
        }
        
        const message = error?.response?.data?.message || error.message || 'Failed to fetch overall grades';
        throw new Error(message);
    }
};

// Get student's grade percentages for all courses
export const fetchGradePercentages = async (): Promise<Record<string, number>> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Authentication token not found. Please login again.');
    }

    try {
        console.log('Fetching grade percentages for all courses');
        
        const response = await ApiClient.get('/grades/percentages');
        
        if (response.data?.success && response.data?.data) {
            console.log('Grade percentages fetched successfully:', response.data.data);
            return response.data.data;
        }
        
        return {}; // Return empty object if no percentages
    } catch (error: any) {
        console.error('Error fetching grade percentages:', error);
        
        if (error.response?.status === 401) {
            console.log('Token expired or invalid, clearing auth state');
            clearAuthState();
            throw new Error('Authentication failed. Please login again.');
        }
        
        const message = error?.response?.data?.message || error.message || 'Failed to fetch grade percentages';
        throw new Error(message);
    }
};

// Get comprehensive grading dashboard info for student
export const fetchStudentGradingDashboard = async (): Promise<any> => {
    try {
        console.log('Fetching comprehensive student grading dashboard');
        
        // Fetch all grading data in parallel
        const [overallGrades, gradePercentages, enrolledCourses] = await Promise.all([
            fetchOverallGrades().catch(error => {
                console.warn('Failed to fetch overall grades:', error);
                return {};
            }),
            fetchGradePercentages().catch(error => {
                console.warn('Failed to fetch grade percentages:', error);
                return {};
            }),
            fetchEnrolledCourses().catch(error => {
                console.warn('Failed to fetch enrolled courses:', error);
                return { success: false, data: [] };
            })
        ]);

        // Calculate statistics
        const allGrades = Object.values(overallGrades).flat() as GradeDto[];
        const totalAssignments = allGrades.length;
        const gradedAssignments = allGrades.filter(grade => grade.pointsAwarded !== undefined).length;
        const averageGrade = totalAssignments > 0 
            ? allGrades.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / totalAssignments
            : 0;

        // Get course statistics
        const courseStats = Object.entries(overallGrades).map(([courseId, grades]) => {
            const courseGrades = grades as GradeDto[];
            const courseAverage = courseGrades.length > 0 
                ? courseGrades.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / courseGrades.length
                : 0;
            
            const courseName = enrolledCourses.data?.find((course: any) => 
                course.id === courseId || course.courseId === courseId
            )?.title || `Course ${courseId}`;

            return {
                courseId,
                courseName,
                gradesCount: courseGrades.length,
                averageGrade: courseAverage,
                percentage: gradePercentages[courseId] || courseAverage
            };
        });

        return {
            success: true,
            data: {
                overallGrades,
                gradePercentages,
                courseStats,
                summary: {
                    totalAssignments,
                    gradedAssignments,
                    ungradedAssignments: totalAssignments - gradedAssignments,
                    averageGrade: Math.round(averageGrade * 100) / 100,
                    totalCourses: Object.keys(overallGrades).length
                }
            },
            message: 'Student grading dashboard fetched successfully'
        };
    } catch (error: any) {
        console.error('Error fetching student grading dashboard:', error);
        const message = error?.response?.data?.message || error.message || 'Failed to fetch grading dashboard';
        throw new Error(message);
    }
};

// Utility functions for grading display
export const formatGradePercentage = (percentage: number): string => {
    return `${Math.round(percentage * 100) / 100}%`;
};

export const getGradeLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
};

export const getGradeColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 80) return 'text-blue-600 bg-blue-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
};

export const formatGradeDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}; 