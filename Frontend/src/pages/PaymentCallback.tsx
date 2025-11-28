import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { handlePaymentCallback } from '@/ApiConfig/StudentConnection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Home, CreditCard, ArrowLeft } from 'lucide-react';

const PaymentCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState<'processing' | 'success' | 'failed' | 'error'>('processing');
    const [message, setMessage] = useState('Processing your payment...');
    const [paymentDetails, setPaymentDetails] = useState<any>(null);

    useEffect(() => {
        const processCallback = async () => {
            try {
                // Get parameters from URL - handle both frontend and backend callback formats
                const transactionId = searchParams.get('transaction_id') || 
                                    searchParams.get('tx_ref') || 
                                    searchParams.get('payment_reference');
                const paymentReference = searchParams.get('payment_reference') || 
                                       searchParams.get('tx_ref') || 
                                       searchParams.get('reference');
                const paymentStatus = searchParams.get('status');

                console.log('Payment callback parameters:', {
                    transactionId,
                    paymentReference,
                    paymentStatus,
                    allParams: Object.fromEntries(searchParams)
                });

                if (!transactionId || !paymentReference) {
                    setStatus('error');
                    setMessage('Invalid payment callback parameters. Missing transaction details.');
                    return;
                }

                // Check if payment was successful based on status
                if (paymentStatus?.toLowerCase() === 'successful' || paymentStatus?.toLowerCase() === 'success') {
                    setStatus('success');
                    setMessage('Payment completed successfully! You have been enrolled in the course.');
                    setPaymentDetails({
                        transactionId,
                        paymentReference,
                        status: paymentStatus
                    });
                    return;
                }

                // If not successful, try to verify with backend
                const response = await handlePaymentCallback(transactionId, paymentReference, paymentStatus || undefined);

                if (response && response.success) {
                    setStatus('success');
                    setMessage('Payment completed successfully! You have been enrolled in the course.');
                    setPaymentDetails(response);
                } else {
                    setStatus('failed');
                    setMessage(response?.message || 'Payment verification failed');
                }
            } catch (err: any) {
                console.error('Payment callback error:', err);
                setStatus('error');
                setMessage(err.message || 'An error occurred while processing your payment');
            }
        };

        processCallback();
    }, [searchParams, navigate]);

    const getStatusColor = () => {
        switch (status) {
            case 'success': return 'text-green-600';
            case 'failed':
            case 'error': return 'text-red-600';
            default: return 'text-blue-600';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'success': 
                return <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />;
            case 'failed':
            case 'error': 
                return <XCircle className="h-16 w-16 text-red-500 mx-auto" />;
            default: 
                return <Loader2 className="h-16 w-16 text-blue-500 mx-auto animate-spin" />;
        }
    };

    const getStatusTitle = () => {
        switch (status) {
            case 'success': return 'Payment Successful!';
            case 'failed': return 'Payment Failed';
            case 'error': return 'Payment Error';
            default: return 'Processing Payment...';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md mx-auto shadow-2xl border-0">
                <CardContent className="p-8 text-center">
                    <div className="mb-6">
                        {getStatusIcon()}
                    </div>

                    <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
                        {getStatusTitle()}
                    </h1>

                    <div className="mb-6">
                        <p className="text-gray-600 text-lg">{message}</p>
                        
                        {paymentDetails && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                                <h3 className="font-semibold text-sm text-gray-700 mb-2">Payment Details</h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Transaction ID:</span>
                                        <span className="font-mono text-xs">{paymentDetails.transactionId || paymentDetails.paymentReference}</span>
                                    </div>
                                    {paymentDetails.amount && (
                                        <div className="flex justify-between">
                                            <span>Amount:</span>
                                            <span className="font-semibold">RWF {paymentDetails.amount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {paymentDetails.courseName && (
                                        <div className="flex justify-between">
                                            <span>Course:</span>
                                            <span className="font-semibold">{paymentDetails.courseName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        {status === 'success' && (
                            <>
                                <Button
                                    onClick={() => navigate('/student/dashboard')}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                                    size="lg"
                                >
                                    <Home className="mr-2 h-5 w-5" />
                                    Go to Dashboard
                                </Button>
                                <Button
                                    onClick={() => navigate('/student/payments')}
                                    variant="outline"
                                    className="w-full border-green-600 text-green-600 hover:bg-green-50 py-3"
                                    size="lg"
                                >
                                    <CreditCard className="mr-2 h-5 w-5" />
                                    View Payment History
                                </Button>
                            </>
                        )}
                        
                        {(status === 'failed' || status === 'error') && (
                            <>
                                <Button
                                    onClick={() => navigate('/courses')}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                                    size="lg"
                                >
                                    <ArrowLeft className="mr-2 h-5 w-5" />
                                    Back to Courses
                                </Button>
                                <Button
                                    onClick={() => navigate('/student/dashboard')}
                                    variant="outline"
                                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-3"
                                    size="lg"
                                >
                                    <Home className="mr-2 h-5 w-5" />
                                    Go to Dashboard
                                </Button>
                                <Button
                                    onClick={() => navigate('/contact')}
                                    variant="ghost"
                                    className="w-full text-gray-600 hover:text-gray-800 py-3"
                                    size="lg"
                                >
                                    Contact Support
                                </Button>
                            </>
                        )}

                        {status === 'processing' && (
                            <div className="flex justify-center">
                                <div className="text-sm text-gray-500">Please wait while we verify your payment...</div>
                            </div>
                        )}
                    </div>

                    {status === 'success' && (
                        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700">
                                🎉 Congratulations! You can now access your course content from your dashboard.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentCallback;