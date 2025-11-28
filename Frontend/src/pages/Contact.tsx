import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/ui/footer';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle, 
  HeadphonesIcon,
  Send,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: '', email: '', subject: '', category: '', message: '' });
      setIsLoading(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email Support',
      details: 'support@learnhub.com',
      description: 'General inquiries and technical support'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Phone Support',
      details: '+1 (555) 123-4567',
      description: 'Available Monday to Friday, 9 AM - 6 PM EST'
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Headquarters',
      details: '123 Education St, San Francisco, CA 94105',
      description: 'Visit us for partnership opportunities'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Business Hours',
      details: 'Mon - Fri: 9:00 AM - 6:00 PM EST',
      description: 'Weekend support via email only'
    }
  ];

  const supportOptions = [
    {
      icon: <MessageCircle className="h-8 w-8 text-primary" />,
      title: 'Live Chat',
      description: 'Get instant help with our 24/7 live chat support',
      action: 'Start Chat',
      available: true
    },
    {
      icon: <HeadphonesIcon className="h-8 w-8 text-primary" />,
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      action: 'Call Now',
      available: true
    },
    {
      icon: <Mail className="h-8 w-8 text-primary" />,
      title: 'Email Support',
      description: 'Send us a detailed message and get a response within 24 hours',
      action: 'Send Email',
      available: true
    }
  ];

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking the "Forgot Password" link on the login page.'
    },
    {
      question: 'Can I get a refund for my course?',
      answer: 'Yes, we offer a 30-day money-back guarantee for all courses.'
    },
    {
      question: 'How do I become an instructor?',
      answer: 'Apply through our "Become a Coach" page and we\'ll review your application within 2-3 business days.'
    },
    {
      question: 'Are certificates recognized by employers?',
      answer: 'Our certificates are industry-recognized and accepted by thousands of companies worldwide.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-hero">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Get in Touch
          </h1>
          <p className="text-xl mb-8 opacity-90 animate-slide-up">
            Have questions? We're here to help. Reach out to our friendly support team.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-gradient-card border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-6 w-6" />
                  Send us a Message
                </CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={handleSelectChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing & Payments</SelectItem>
                        <SelectItem value="course">Course Content</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      placeholder="Tell us more about your inquiry..."
                      className="transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary border-0 hover:opacity-90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Message"}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <Badge className="mb-4 bg-primary text-primary-foreground">Contact Information</Badge>
                <h2 className="text-3xl font-bold mb-6">
                  Multiple Ways to Reach Us
                </h2>
                <p className="text-muted-foreground mb-8">
                  Choose the contact method that works best for you. Our team is ready to assist with any questions or concerns.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="p-6 hover:shadow-md transition-shadow bg-gradient-card border-0">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-full text-primary">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{info.title}</h3>
                        <p className="font-medium text-primary mb-1">{info.details}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary text-secondary-foreground">Support Options</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Help When You Need It
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our dedicated support team is available to assist you through multiple channels
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {supportOptions.map((option, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-0">
                <CardContent className="p-0">
                  <div className="mb-4 flex justify-center">{option.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{option.description}</p>
                  <Button variant="outline" className="w-full">
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary text-primary-foreground">Frequently Asked Questions</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Quick Answers to Common Questions
            </h2>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6 bg-gradient-card border-0">
                <CardContent className="p-0">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;