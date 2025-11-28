import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Eye, EyeOff, User, GraduationCap, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { studentLogin } from '@/ApiConfig/StudentConnection';

const StudentLogin = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect') || '/courses';
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate inputs
    if (!studentId.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your email address',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }
    
    if (!password.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your password',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('🔐 Attempting student login...');
      const resp = await studentLogin(studentId.trim(), password);
      console.log('🔐 Login response:', resp);
      
      // Check if token was successfully persisted
      const token = localStorage.getItem('authtoken');
      console.log('🔐 Token in localStorage after login:', token ? 'Present' : 'Missing');
      
      if (resp && resp.success && token) {
        toast({
          title: 'Login successful!',
          description: 'Welcome back to Grade Wave',
        });
        // Navigate immediately — let the dashboard fetch profile
        navigate(redirect);
      } else {
        const errorMessage = resp?.message || 'Login failed - please check your credentials';
        console.error('🔐 Login failed:', errorMessage);
        toast({
          title: 'Login failed',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      console.error('🔐 Login error:', err);
      
      let errorMessage = 'Failed to login - please try again';
      
      if (err.name === 'LoginConflictError') {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: 'Login Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-white relative">
          <Link 
            to="/" 
            className="absolute top-4 md:top-8 left-4 md:left-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <div className="w-full max-w-md space-y-6 md:space-y-8">
            {/* Header */}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">IGA</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="studentEmail" className="text-sm font-medium text-foreground">Student email</Label>
                <Input
                  id="studentEmail"
                  type="text"
                  placeholder="student@gmail.com"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary-hover text-primary-foreground text-base font-medium rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Continue"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Or</p>
              <Link
                to={`/student/signup?redirect=${encodeURIComponent(redirect)}`}
                className="text-primary hover:underline font-medium"
              >
                if you don't have an account signup here →
              </Link>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              <p>
                By Signing in you agree to our{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Right side - Image */}
        <div className="hidden md:flex flex-1 bg-white from-primary/10 to-primary/5 items-center justify-center relative overflow-hidden">
          <div className="absolute top-8 right-8">
            <BookOpen className="h-16 w-16 text-primary/20" />
          </div>
          <div className="text-center p-4 md:p-8 max-w-md">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1000&fit=crop" 
              alt="Student learning online" 
              className="w-full max-w-[500px] h-auto aspect-[4/5] object-cover rounded-2xl shadow-2xl mb-8"
            />
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;