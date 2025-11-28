import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BackendCallbackRedirect: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Extract query parameters from the current URL
        const searchParams = new URLSearchParams(location.search);
        
        // Get the payment parameters
        const paymentReference = searchParams.get('payment_reference');
        const status = searchParams.get('status');
        const txRef = searchParams.get('tx_ref');
        const transactionId = searchParams.get('transaction_id');

        // Build the new URL for the frontend callback
        const callbackParams = new URLSearchParams();
        
        if (paymentReference) callbackParams.set('payment_reference', paymentReference);
        if (status) callbackParams.set('status', status);
        if (txRef) callbackParams.set('tx_ref', txRef);
        if (transactionId) callbackParams.set('transaction_id', transactionId);

        // Redirect to the frontend payment callback page
        navigate(`/payment/callback?${callbackParams.toString()}`, { replace: true });
    }, [navigate, location]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to payment confirmation...</p>
            </div>
        </div>
    );
};

export default BackendCallbackRedirect;