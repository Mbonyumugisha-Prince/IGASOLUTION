import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { coachLogin, checkInstructorApprovalStatus } from '@/ApiConfig/CoachConnection';

const CoachIntegrationTest = () => {
  const [testCredentials, setTestCredentials] = useState({
    email: 'testcoach@example.com',
    password: 'TestPass123!'
  });
  const [results, setResults] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testLogin = async () => {
    setIsLoading(true);
    setResults('Testing login...\n');
    
    try {
      const loginResult = await coachLogin(testCredentials.email, testCredentials.password);
      setResults(prev => prev + `✓ Login successful: ${loginResult.message}\n`);
      
      // Check approval status
      const approvalResult = await checkInstructorApprovalStatus();
      setResults(prev => prev + `✓ Approval status: ${approvalResult.status}\n`);
      
      if (approvalResult.isApproved) {
        setResults(prev => prev + `✓ Coach can access dashboard\n`);
        toast({
          title: "Test Successful",
          description: "Coach login and approval check completed successfully!"
        });
      } else {
        setResults(prev => prev + `⚠ Coach needs admin approval\n`);
        toast({
          title: "Approval Required", 
          description: "Coach account is pending admin approval."
        });
      }
      
    } catch (error: any) {
      setResults(prev => prev + `✗ Error: ${error.message}\n`);
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnectionStatus = async () => {
    setIsLoading(true);
    setResults('Testing backend connection...\n');
    
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' })
      });
      
      setResults(prev => prev + `✓ Backend is reachable (Status: ${response.status})\n`);
      
      if (response.status === 409 || response.status === 400) {
        setResults(prev => prev + `✓ Authentication endpoint is working\n`);
      }
      
    } catch (error: any) {
      setResults(prev => prev + `✗ Backend connection failed: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('authtoken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('approvalStatus');
    setResults('Auth data cleared\n');
    toast({
      title: "Auth Cleared",
      description: "All authentication data has been cleared."
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Coach Integration Test Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Test Email</Label>
              <Input
                id="testEmail"
                value={testCredentials.email}
                onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter test email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testPassword">Test Password</Label>
              <Input
                id="testPassword"
                type="password"
                value={testCredentials.password}
                onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter test password"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={testConnectionStatus} disabled={isLoading}>
              Test Backend Connection
            </Button>
            <Button onClick={testLogin} disabled={isLoading}>
              Test Login Flow
            </Button>
            <Button onClick={clearAuthData} variant="outline">
              Clear Auth Data
            </Button>
          </div>
          
          <div className="mt-4">
            <Label>Test Results:</Label>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-sm h-40 overflow-auto whitespace-pre-wrap">
              {results || 'No tests run yet...'}
            </pre>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <h3 className="font-medium text-blue-800 mb-2">Test Instructions:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Click "Test Backend Connection" to verify backend is running</li>
              <li>2. Register a new coach account via /coach/register</li>
              <li>3. Use the same email/password here to test login flow</li>
              <li>4. Check approval status and dashboard access</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachIntegrationTest;