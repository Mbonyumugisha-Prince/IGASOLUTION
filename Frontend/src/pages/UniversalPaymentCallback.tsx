import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Home, CreditCard, ArrowLeft, AlertCircle } from 'lucide-react';
import { handlePaymentCallback } from '@/ApiConfig/StudentConnection';

const UniversalPaymentCallback: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState<'processing' | 'success' | 'failed' | 'error'>('processing');
    const [message, setMessage] = useState('Processing your payment...');
    const [paymentDetails, setPaymentDetails] = useState<any>(null);
    const [debugInfo, setDebugInfo] = useState<any>(null);

    useEffect(() => {
        const processCallback = async () => {
            try {
                const searchParams = new URLSearchParams(location.search);
                const allParams = Object.fromEntries(searchParams);
                
                // Handle multiple parameter formats
                const transactionId = searchParams.get('transaction_id') || 
                                    searchParams.get('tx_ref') || 
                                    searchParams.get('payment_reference');
                
                const paymentReference = searchParams.get('payment_reference') || 
                                       searchParams.get('tx_ref') || 
                                       searchParams.get('reference');
                
                const paymentStatus = searchParams.get('status');
                const errorParam = searchParams.get('error');

                setDebugInfo({
                    url: location.pathname + location.search,
                    transactionId,
                    paymentReference,
                    paymentStatus,
                    errorParam,
                    allParams
                });

                console.log('Payment callback debug info:', {
                    url: location.pathname + location.search,
                    transactionId,
                    paymentReference,
                    paymentStatus,
                    errorParam,
                    allParams
                });

                // Handle error from backend redirect
                if (errorParam) {
                    setStatus('error');
                    setMessage(`Payment processing error: ${decodeURIComponent(errorParam)}`);
                    return;
                }

                if (!transactionId || !paymentReference) {
                    setStatus('error');
                    setMessage('Invalid payment callback parameters. Missing transaction details.');
                    return;
                }

                // Handle successful status directly (for backend callbacks)
                if (paymentStatus?.toLowerCase() === 'successful' || 
                    paymentStatus?.toLowerCase() === 'success' ||
                    paymentStatus?.toLowerCase() === 'completed') {
                    
                    setStatus('success');
                    setMessage('Payment completed successfully! You have been enrolled in the course.');
                    setPaymentDetails({
                        transactionId,
                        paymentReference,
                        status: paymentStatus,
                        source: 'direct_callback'
                    });
                    return;
                }

                // Handle failed/cancelled status directly
                if (paymentStatus?.toLowerCase() === 'failed' || 
                    paymentStatus?.toLowerCase() === 'cancelled') {
                    setStatus('failed');
                    setMessage(`Payment ${paymentStatus.toLowerCase()}. Please try again or contact support.`);
                    setPaymentDetails({
                        transactionId,
                        paymentReference,
                        status: paymentStatus,
                        source: 'direct_callback'
                    });
                    return;
                }

                // If status is not directly successful, verify with backend
                try {
                    setMessage('Verifying payment with our servers...');
                    const response = await handlePaymentCallback(transactionId, paymentReference, paymentStatus || undefined);

                    if (response && response.success) {
                        setStatus('success');
                        setMessage('Payment verified successfully! You have been enrolled in the course.');
                        setPaymentDetails(response);
                    } else {
                        setStatus('failed');
                        setMessage(response?.message || 'Payment verification failed');
                    }
                } catch (verifyError: any) {
                    console.error('Payment verification error:', verifyError);
                    
                    // If verification fails but we got a successful status, still show success
                    if (paymentStatus?.toLowerCase() === 'successful' || paymentStatus?.toLowerCase() === 'success') {
                        setStatus('success');
                        setMessage('Payment completed! (Note: Verification with our servers failed, but payment was successful)');
                        setPaymentDetails({
                            transactionId,
                            paymentReference,
                            status: paymentStatus,
                            source: 'fallback_success'
                        });
                    } else {
                        setStatus('error');
                        setMessage(`Payment verification failed: ${verifyError.message}`);
                    }
                }
            } catch (err: any) {
                console.error('Payment callback error:', err);
                setStatus('error');
                setMessage(err.message || 'An error occurred while processing your payment');
            }
        };

        processCallback();
    }, [location]);

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
                return <AlertCircle className="h-16 w-16 text-orange-500 mx-auto" />;
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
            <Card className="w-full max-w-lg mx-auto shadow-2xl border-0">
                <CardContent className="p-8 text-center">
                    <div className="mb-6">
                        {getStatusIcon()}
                    </div>

                    <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
                        {getStatusTitle()}
                    </h1>

                    <div className="mb-6">
                        <p className="text-gray-600 text-lg mb-4">{message}</p>
                        
                        {paymentDetails && (
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg text-left">
                                <h3 className="font-semibold text-sm text-gray-700 mb-2">Payment Details</h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Transaction ID:</span>
                                        <span className="font-mono text-xs">{paymentDetails.transactionId || paymentDetails.paymentReference}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Reference:</span>
                                        <span className="font-mono text-xs">{paymentDetails.paymentReference}</span>
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
                                    <div className="flex justify-between">
                                        <span>Status:</span>
                                        <span className="font-semibold capitalize">{paymentDetails.status || 'Completed'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Debug info in development */}
                        {process.env.NODE_ENV === 'development' && debugInfo && (
                            <details className="mb-4 p-3 bg-yellow-50 rounded-lg text-left">
                                <summary className="text-sm font-semibold text-yellow-700 cursor-pointer">Debug Info</summary>
                                <pre className="text-xs text-yellow-600 mt-2 overflow-auto">
                                    {JSON.stringify(debugInfo, null, 2)}
                                </pre>
                            </details>
                        )}
                    </div>

                    <div className="space-y-3">
                        {status === 'success' && (
                            <>
                                <Button
                                    onClick={() => {
                                        console.log('Navigating to dashboard...');
                                        navigate('/student/dashboard', { 
                                            state: { activeTab: 'payments' },
                                            replace: true 
                                        });
                                    }}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                                    size="lg"
                                >
                                    <Home className="mr-2 h-5 w-5" />
                                    Go to Dashboard
                                </Button>
                                <Button
                                    onClick={() => {
                                        console.log('Navigating to payment history...');
                                        navigate('/student/payments', { replace: true });
                                    }}
                                    variant="outline"
                                    className="w-full border-green-600 text-green-600 hover:bg-green-50 py-3"
                                    size="lg"
                                >
                                    <CreditCard className="mr-2 h-5 w-5" />
                                    View Payment History
                                </Button>
                                <Button
                                    onClick={() => {
                                        console.log('Navigating to courses...');
                                        navigate('/courses', { replace: true });
                                    }}
                                    variant="ghost"
                                    className="w-full text-green-600 hover:text-green-800 py-3"
                                    size="lg"
                                >
                                    Browse More Courses
                                </Button>
                            </>
                        )}
                        
                        {(status === 'failed' || status === 'error') && (
                            <>
                                <Button
                                    onClick={() => {
                                        console.log('Navigating back to courses...');
                                        navigate('/courses', { replace: true });
                                    }}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                                    size="lg"
                                >
                                    <ArrowLeft className="mr-2 h-5 w-5" />
                                    Back to Courses
                                </Button>
                                <Button
                                    onClick={() => {
                                        console.log('Navigating to dashboard...');
                                        navigate('/student/dashboard', { replace: true });
                                    }}
                                    variant="outline"
                                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-3"
                                    size="lg"
                                >
                                    <Home className="mr-2 h-5 w-5" />
                                    Go to Dashboard
                                </Button>
                                <Button
                                    onClick={() => {
                                        console.log('Navigating to contact...');
                                        navigate('/contact', { replace: true });
                                    }}
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

                    {(status === 'failed' || status === 'error') && (
                        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm text-red-700">
                                If you were charged but see this error, please contact support with your transaction details.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UniversalPaymentCallback;