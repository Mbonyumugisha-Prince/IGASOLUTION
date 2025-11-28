import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Eye, EyeOff, User, GraduationCap, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { coachLogin, checkInstructorApprovalStatus } from '@/ApiConfig/CoachConnection';

const CoachLogin = () => {
  const [coachId, setCoachId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('coach');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coachId.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Attempt to login
      const loginResponse = await coachLogin(coachId.trim(), password);
      
      if (loginResponse.success) {
        // Login successful means instructor is approved (backend checks this)
        toast({
          title: "Welcome back, Coach!",
          description: "Successfully logged into your instructor dashboard",
        });
        navigate('/coach/dashboard');
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive"
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen flex">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
          <Link 
            to="/" 
            className="absolute top-8 left-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <div className="w-full max-w-md space-y-8">
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
                <Label htmlFor="coachId" className="text-sm font-medium text-foreground">Coach Email</Label>
                <Input
                  id="coachId"
                  type="text"
                  placeholder="admin@gmail.com"
                  value={coachId}
                  onChange={(e) => setCoachId(e.target.value)}
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
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Or</p>
              <Link 
                to="/coach/register" 
                className="text-primary hover:underline font-medium"
              >
                Apply to become a coach →
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
        <div className="flex-1 bg-white from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
          <div className="absolute top-8 right-8">
            <BookOpen className="h-16 w-16 text-primary/20" />
          </div>
          <div className="text-center p-8 max-w-md">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1000&fit=crop" 
              alt="Coach teaching online" 
              className="w-[1000px] h-[600px] object-cover rounded-2xl shadow-2xl mb-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachLogin;