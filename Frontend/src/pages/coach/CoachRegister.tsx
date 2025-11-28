import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { BookOpen, Upload, User, GraduationCap, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { coachSignup } from '@/ApiConfig/CoachConnection';

const STEPS = [
  { title: 'Personal Info', icon: User },
  { title: 'Professional Info', icon: GraduationCap },
  { title: 'Documents', icon: Upload },
  { title: 'Review', icon: CheckCircle }
];

const CoachRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    areaOfExperience: '',
    yearsOfExperience: '',
    professionalBio: '',
    resume: null as File | null,
    certificate: null as File | null,
    image: null as File | null
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      areaOfExperience: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password ||
        !formData.phoneNumber || !formData.areaOfExperience || !formData.yearsOfExperience ||
        !formData.professionalBio || !formData.resume || !formData.certificate || !formData.image) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and upload all documents",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create FormData object for file uploads
      const submitData = new FormData();
      
      // Add all form fields
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('phoneNumber', formData.phoneNumber);
      submitData.append('areaOfExperience', formData.areaOfExperience);
      submitData.append('yearsOfExperience', formData.yearsOfExperience);
      submitData.append('professionalBio', formData.professionalBio);
      
      // Add file uploads
      if (formData.resume) submitData.append('resume', formData.resume);
      if (formData.certificate) submitData.append('certificate', formData.certificate);
      if (formData.image) submitData.append('image', formData.image);
      
      const response = await coachSignup(submitData);
      
      if (response.success) {
        toast({
          title: "Application submitted successfully!",
          description: "Your instructor application has been submitted. Please wait for admin approval before you can access your dashboard.",
        });
        navigate('/coach/login');
      }
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
          toast({
            title: "Required Fields",
            description: "Please fill in all required fields",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 1:
        if (!formData.phoneNumber || !formData.areaOfExperience || !formData.yearsOfExperience || !formData.professionalBio) {
          toast({
            title: "Required Fields",
            description: "Please fill in all required fields",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 2:
        if (!formData.resume || !formData.certificate || !formData.image) {
          toast({
            title: "Required Files",
            description: "Please upload all required documents",
            variant: "destructive"
          });
          return false;
        }
        return true;
      case 3:
        if (!agreeToTerms) {
          toast({
            title: "Terms Agreement",
            description: "Please agree to the terms and conditions",
            variant: "destructive"
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen flex">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto relative">
          <Link 
            to="/" 
            className="absolute top-8 left-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <div className="w-full max-w-lg space-y-8">
            {/* Header */}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">IGA</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Apply to teach</h1>
              <p className="text-muted-foreground">Join our community of expert instructors</p>
            </div>

            {/* Progress */}
            <div className="space-y-4">
              <div className="flex justify-between">
                {STEPS.map((step, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`p-3 rounded-full border-2 ${index <= currentStep ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'}`}>
                      <step.icon className="h-4 w-4" />
                    </div>
                    <span className={`text-xs mt-2 ${index <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
              <Progress value={(currentStep + 1) / STEPS.length * 100} className="h-2" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Step 0: Personal Info */}
              {currentStep === 0 && (
                <Card className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a secure password"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                    </p>
                  </div>
                </Card>
              )}

              {/* Step 1: Professional Info */}
              {currentStep === 1 && (
                <Card className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="areaOfExperience">Area of Expertise</Label>
                    <Select onValueChange={handleSelectChange} value={formData.areaOfExperience}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your area of expertise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="programming">Programming</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="data-science">Data Science</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, yearsOfExperience: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your years of experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2">1-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="professionalBio">Professional Bio</Label>
                    <Textarea
                      id="professionalBio"
                      name="professionalBio"
                      value={formData.professionalBio}
                      onChange={handleInputChange}
                      placeholder="Tell us about your professional background and what you can teach..."
                      rows={4}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum 500 characters
                    </p>
                  </div>
                </Card>
              )}

              {/* Step 2: Documents */}
              {currentStep === 2 && (
                <Card className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume/CV</Label>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'resume')}
                      required
                    />
                    {formData.resume && (
                      <p className="text-sm text-green-600">✓ {formData.resume.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certificate">Certificates/Diplomas</Label>
                    <Input
                      id="certificate"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'certificate')}
                      required
                    />
                    {formData.certificate && (
                      <p className="text-sm text-green-600">✓ {formData.certificate.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Profile Picture</Label>
                    <Input
                      id="image"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'image')}
                      required
                    />
                    {formData.image && (
                      <p className="text-sm text-green-600">✓ {formData.image.name}</p>
                    )}
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> All documents will be reviewed by our team. Please ensure they are clear and professional.
                    </p>
                  </div>
                </Card>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <Card className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Personal Information</h3>
                      <p className="text-sm text-muted-foreground">
                        {formData.firstName} {formData.lastName} - {formData.email}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Professional Details</h3>
                      <p className="text-sm text-muted-foreground">
                        {formData.areaOfExperience} - {formData.yearsOfExperience} experience
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Documents</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>✓ Resume: {formData.resume?.name}</p>
                        <p>✓ Certificate: {formData.certificate?.name}</p>
                        <p>✓ Profile Picture: {formData.image?.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <Checkbox 
                      id="terms" 
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the Terms of Service and Privacy Policy
                    </Label>
                  </div>
                </Card>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                {currentStep < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading || !agreeToTerms}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                )}
              </div>
            </form>

            <div className="text-center text-xs text-muted-foreground">
              <p>
                By submitting this application, you agree to our{' '}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
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
              alt="Professional coach teaching" 
              className="w-[500px] h-[600px] object-cover rounded-2xl shadow-2xl mb-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachRegister;