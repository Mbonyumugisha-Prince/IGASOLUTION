import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Award, Target, Heart, Lightbulb } from 'lucide-react';
import Footer from '@/components/ui/footer';

const About = () => {
  const values = [
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: 'Excellence',
      description: 'We strive for the highest quality in everything we do, from course content to student support.'
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: 'Accessibility',
      description: 'Education should be available to everyone, regardless of background or circumstances.'
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      title: 'Innovation',
      description: 'We embrace new technologies and teaching methods to enhance the learning experience.'
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Community',
      description: 'We build strong connections between learners, instructors, and industry professionals.'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Active Students' },
    { number: '1,200+', label: 'Expert Instructors' },
    { number: '300+', label: 'Courses Available' },
    { number: '95%', label: 'Completion Rate' }
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Founder',
      background: 'Former Google Executive with 15+ years in EdTech',
      expertise: 'Strategic Leadership, Product Development'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Education',
      background: 'PhD in Education Technology from Stanford',
      expertise: 'Curriculum Design, Learning Analytics'
    },
    {
      name: 'Emily Watson',
      role: 'VP of Engineering',
      background: 'Former Netflix Senior Engineer',
      expertise: 'Platform Architecture, AI/ML Integration'
    },
    {
      name: 'David Kim',
      role: 'Head of Content',
      background: 'Award-winning Course Creator and Author',
      expertise: 'Content Strategy, Quality Assurance'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-hero">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            About IGA
          </h1>
          <p className="text-xl mb-8 opacity-90 animate-slide-up">
            Empowering millions of learners worldwide to achieve their goals through expert-led education
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="/src/assets/student.jpg" 
                alt="Students learning"
                className="rounded-lg shadow-xl w-full object-cover h-[400px]"
              />
              <div className="absolute -bottom-6 -right-6 bg-background p-4 rounded-lg shadow-lg">
                <img 
                  src="/src/assets/student2.webp" 
                  alt="Student success"
                  className="w-32 h-32 rounded-lg object-cover"
                />
              </div>
            </div>
            <div>
              <Badge className="mb-4 bg-primary text-primary-foreground">Our Mission</Badge>
              <h2 className="text-4xl font-bold mb-6">
                Democratizing Quality Education for Everyone
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                At IGA, we believe that everyone deserves access to high-quality education. 
                Our platform connects learners with world-class instructors, providing the tools 
                and resources needed to master new skills and advance careers.
              </p>
              <p className="text-lg text-muted-foreground">
                Founded in 2020, we've grown from a small startup to a global platform serving 
                students and professionals across 150+ countries. Our commitment to excellence 
                and innovation drives everything we do.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center p-6 bg-gradient-card border-0 hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="relative mb-16">
            <img 
              src="/src/assets/student3.webp" 
              alt="Students collaborating"
              className="w-full h-[300px] object-cover rounded-xl mb-12 shadow-lg"
            />
          </div>
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary text-secondary-foreground">Our Values</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Drives Us Forward
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our core values shape every decision we make and every product we build
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-0">
                <CardContent className="p-0">
                  <div className="mb-4 flex justify-center">{value.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="/src/assets/image3.webp" 
            alt="Background pattern"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary text-primary-foreground">Leadership Team</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet the Experts Behind IGA
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our diverse team brings together decades of experience in education, technology, and business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow bg-gradient-card border-0">
                <CardHeader className="p-0 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <p className="text-primary font-medium">{member.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  <p className="text-sm text-muted-foreground">{member.background}</p>
                  <div>
                    <span className="text-sm font-medium text-foreground">Expertise: </span>
                    <span className="text-sm text-muted-foreground">{member.expertise}</span>
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

export default About;