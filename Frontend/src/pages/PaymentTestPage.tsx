import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, TestTube2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PaymentTestPage: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [customParams, setCustomParams] = useState({
        payment_reference: '',
        status: '',
        tx_ref: '',
        transaction_id: ''
    });

    // Test scenarios
    const testScenarios = [
        {
            id: 'success',
            title: 'Successful Payment',
            description: 'Test successful payment callback',
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
            color: 'text-green-700',
            params: {
                payment_reference: 'IGA_1764082569245_bdc3162f',
                status: 'successful',
                tx_ref: 'IGA_1764082569245_bdc3162f',
                transaction_id: '9819939'
            }
        },
        {
            id: 'failed',
            title: 'Failed Payment',
            description: 'Test failed payment callback',
            icon: <XCircle className="h-5 w-5 text-red-500" />,
            color: 'text-red-700',
            params: {
                payment_reference: 'IGA_1764082569245_failed',
                status: 'failed',
                tx_ref: 'IGA_1764082569245_failed',
                transaction_id: '9819940'
            }
        },
        {
            id: 'pending',
            title: 'Pending Payment',
            description: 'Test pending payment callback',
            icon: <Clock className="h-5 w-5 text-orange-500" />,
            color: 'text-orange-700',
            params: {
                payment_reference: 'IGA_1764082569245_pending',
                status: 'pending',
                tx_ref: 'IGA_1764082569245_pending',
                transaction_id: '9819941'
            }
        },
        {
            id: 'cancelled',
            title: 'Cancelled Payment',
            description: 'Test cancelled payment callback',
            icon: <XCircle className="h-5 w-5 text-gray-500" />,
            color: 'text-gray-700',
            params: {
                payment_reference: 'IGA_1764082569245_cancelled',
                status: 'cancelled',
                tx_ref: 'IGA_1764082569245_cancelled',
                transaction_id: '9819942'
            }
        }
    ];

    const handleTestScenario = (scenario: any) => {
        const queryParams = new URLSearchParams(scenario.params);
        navigate(`/payment/callback?${queryParams.toString()}`);
    };

    const handleBackendCallbackTest = (scenario: any) => {
        // For testing, open the backend URL directly in the current window
        const backendUrl = `http://localhost:5000/api/public/payments/callback`;
        const queryParams = new URLSearchParams(scenario.params);
        const fullBackendUrl = `${backendUrl}?${queryParams.toString()}`;
        
        console.log('Testing backend callback URL:', fullBackendUrl);
        
        // Navigate directly to backend URL to test the redirect
        window.location.href = fullBackendUrl;
    };

    const handleCustomTest = () => {
        const filteredParams = Object.entries(customParams)
            .filter(([_, value]) => value.trim() !== '')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        
        if (Object.keys(filteredParams).length === 0) {
            toast({
                title: "No Parameters",
                description: "Please enter at least one parameter to test",
                variant: "destructive"
            });
            return;
        }

        const queryParams = new URLSearchParams(filteredParams);
        navigate(`/payment/callback?${queryParams.toString()}`);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied",
            description: "URL copied to clipboard"
        });
    };

    const generateTestUrl = (scenario: any, isBackend: boolean = false) => {
        const baseUrl = isBackend ? 'http://localhost:5000' : window.location.origin;
        const path = isBackend ? '/api/public/payments/callback' : '/payment/callback';
        const queryParams = new URLSearchParams(scenario.params);
        return `${baseUrl}${path}?${queryParams.toString()}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Callback Testing</h1>
                    <p className="text-gray-600">Test different payment callback scenarios to ensure your payment flow works correctly</p>
                    <Badge variant="outline" className="mt-2">
                        <TestTube2 className="h-3 w-3 mr-1" />
                        Development Testing Tool
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-8">
                    {testScenarios.map((scenario) => (
                        <Card key={scenario.id} className="shadow-lg border-0">
                            <CardHeader className="pb-3">
                                <CardTitle className={`flex items-center gap-2 ${scenario.color}`}>
                                    {scenario.icon}
                                    {scenario.title}
                                </CardTitle>
                                <p className="text-sm text-gray-600">{scenario.description}</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-1 gap-2 text-xs">
                                    <div className="bg-gray-50 p-2 rounded">
                                        <strong>Parameters:</strong>
                                        <div className="mt-1 font-mono text-xs">
                                            {Object.entries(scenario.params).map(([key, value]) => (
                                                <div key={key} className="flex justify-between">
                                                    <span className="text-blue-600">{key}:</span>
                                                    <span className="text-gray-700">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Button
                                        onClick={() => handleTestScenario(scenario)}
                                        className="w-full"
                                        variant={scenario.id === 'success' ? 'default' : 'outline'}
                                    >
                                        Test Frontend Callback
                                    </Button>
                                    
                                    <Button
                                        onClick={() => handleBackendCallbackTest(scenario)}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Test Backend Callback URL
                                    </Button>
                                    
                                    <div className="flex gap-1">
                                        <Button
                                            onClick={() => copyToClipboard(generateTestUrl(scenario, false))}
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1"
                                        >
                                            <Copy className="h-3 w-3 mr-1" />
                                            Copy Frontend URL
                                        </Button>
                                        <Button
                                            onClick={() => copyToClipboard(generateTestUrl(scenario, true))}
                                            variant="ghost"
                                            size="sm"
                                            className="flex-1"
                                        >
                                            <Copy className="h-3 w-3 mr-1" />
                                            Copy Backend URL
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="shadow-lg border-0 mb-8">
                    <CardHeader>
                        <CardTitle className="text-purple-700">Custom Parameters Test</CardTitle>
                        <p className="text-sm text-gray-600">Enter your own parameters to test specific scenarios</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(customParams).map(([key, value]) => (
                                <div key={key}>
                                    <Label htmlFor={key} className="text-sm font-medium">
                                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Label>
                                    <Input
                                        id={key}
                                        value={value}
                                        onChange={(e) => setCustomParams(prev => ({ ...prev, [key]: e.target.value }))}
                                        placeholder={`Enter ${key}`}
                                        className="mt-1"
                                    />
                                </div>
                            ))}
                        </div>
                        <Button onClick={handleCustomTest} className="w-full md:w-auto">
                            Test Custom Parameters
                        </Button>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                    <CardHeader>
                        <CardTitle className="text-blue-700">Testing Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                <span><strong>Frontend Callback:</strong> Tests the direct React route /payment/callback</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                                <span><strong>Backend Callback URL:</strong> Tests the backend endpoint route /api/public/payments/callback</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5" />
                                <span><strong>Universal Handler:</strong> Both routes now use the same UniversalPaymentCallback component</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                                <span><strong>Debug Mode:</strong> In development, you'll see debug information showing all parsed parameters</span>
                            </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-700">
                                <strong>Real Payment Flow:</strong> In production, Flutterwave will redirect to your configured callback URL with the actual transaction parameters.
                            </p>
                        </div>

                        <div className="mt-4 space-y-2">
                            <Button
                                onClick={() => navigate('/student/dashboard')}
                                variant="outline"
                                size="sm"
                            >
                                Back to Dashboard
                            </Button>
                            <Button
                                onClick={() => navigate('/courses')}
                                variant="outline"
                                size="sm"
                                className="ml-2"
                            >
                                Browse Courses
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PaymentTestPage;