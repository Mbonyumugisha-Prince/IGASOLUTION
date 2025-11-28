import { useState, useCallback } from 'react';
import { 
    fetchStudentPaymentServices, 
    verifyPayment, 
    fetchStudentPaymentHistory,
    checkStudentCoursePaymentStatus,
    requestPaymentRefund,
    handleFlutterwavePayment,
    handlePaymentCallback,
    CoursePaymentRequest,
    PaymentVerificationRequest,
    PaymentResponse 
} from '@/ApiConfig/StudentConnection';

interface UsePaymentReturn {
    loading: boolean;
    error: string | null;
    paymentData: PaymentResponse | null;
    paymentHistory: any[];
    initiatePayment: (data: CoursePaymentRequest) => Promise<PaymentResponse | null>;
    verifyPaymentStatus: (data: PaymentVerificationRequest) => Promise<PaymentResponse | null>;
    getPaymentHistory: (page?: number, size?: number) => Promise<void>;
    checkPaymentStatus: (courseId: string) => Promise<boolean>;
    requestRefund: (paymentId: string, reason: string) => Promise<PaymentResponse | null>;
    processFlutterwavePayment: (
        courseId: string, 
        amount: number, 
        customerInfo: { email: string; phoneNumber: string; name: string; }
    ) => Promise<void>;
    handleCallback: (transactionId: string, paymentReference: string, status?: string) => Promise<PaymentResponse | null>;
    clearError: () => void;
}

export const usePayment = (): UsePaymentReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const initiatePayment = useCallback(async (data: CoursePaymentRequest): Promise<PaymentResponse | null> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetchStudentPaymentServices(data);
            setPaymentData(response);
            return response;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const verifyPaymentStatus = useCallback(async (data: PaymentVerificationRequest): Promise<PaymentResponse | null> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await verifyPayment(data);
            setPaymentData(response);
            return response;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getPaymentHistory = useCallback(async (page: number = 0, size: number = 10): Promise<void> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetchStudentPaymentHistory(page, size);
            setPaymentHistory(response?.content || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const checkPaymentStatus = useCallback(async (courseId: string): Promise<boolean> => {
        try {
            return await checkStudentCoursePaymentStatus(courseId);
        } catch (err: any) {
            setError(err.message);
            return false;
        }
    }, []);

    const requestRefund = useCallback(async (paymentId: string, reason: string): Promise<PaymentResponse | null> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await requestPaymentRefund(paymentId, reason);
            return response;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const processFlutterwavePayment = useCallback(async (
        courseId: string, 
        amount: number, 
        customerInfo: { email: string; phoneNumber: string; name: string; }
    ): Promise<void> => {
        setLoading(true);
        setError(null);
        
        try {
            await handleFlutterwavePayment(courseId, amount, customerInfo, {
                onError: (errorMessage) => {
                    setError(errorMessage);
                },
                onClose: () => {
                    setLoading(false);
                }
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCallback = useCallback(async (
        transactionId: string, 
        paymentReference: string, 
        status?: string
    ): Promise<PaymentResponse | null> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await handlePaymentCallback(transactionId, paymentReference, status);
            setPaymentData(response);
            return response;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        paymentData,
        paymentHistory,
        initiatePayment,
        verifyPaymentStatus,
        getPaymentHistory,
        checkPaymentStatus,
        requestRefund,
        processFlutterwavePayment,
        handleCallback,
        clearError
    };
};