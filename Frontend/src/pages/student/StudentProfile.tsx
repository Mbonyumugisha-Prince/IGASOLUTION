import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { fetchStudentProfile, updateStudentProfile } from '@/ApiConfig/StudentConnection';
import { 
  BookOpen, Clock, Award, TrendingUp, Play, Calendar, Bell, LogOut, Menu, 
  Home, FileText, GraduationCap, Plus, Settings, HelpCircle, Search, 
  Mic, ChevronDown, ArrowRight, CheckCircle, Star, User
} from 'lucide-react';

const StudentProfile = () => {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState<any | null>(() => {
    try {
      const raw = localStorage.getItem('studentProfile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetchStudentProfile();
        if (resp && resp.success && resp.data) {
          const p = resp.data;
          setProfile(p);
          setFirstName(p.firstName || '');
          setLastName(p.lastName || '');
          setEmail(p.email || '');
        } else {
          // fallback to localStorage
          const raw = localStorage.getItem('studentProfile');
          if (raw) {
            const p = JSON.parse(raw);
            setProfile(p);
            setFirstName(p.firstName || '');
            setLastName(p.lastName || '');
            setEmail(p.email || '');
          }
        }
      } catch (e) {
        console.warn('Could not load profile', e);
        const raw = localStorage.getItem('studentProfile');
        if (raw) {
          const p = JSON.parse(raw);
          setProfile(p);
          setFirstName(p.firstName || '');
          setLastName(p.lastName || '');
          setEmail(p.email || '');
        }
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await updateStudentProfile({ firstName, lastName, email, password: password || null });
      if (resp && resp.success) {
        toast({ title: 'Profile updated', description: resp.message || 'Your profile was updated' });
        // refresh stored profile
        try {
          const profileResp = await fetchStudentProfile();
          if (profileResp && profileResp.success && profileResp.data) {
            localStorage.setItem('studentProfile', JSON.stringify(profileResp.data));
            setProfile(profileResp.data);
          }
        } catch (e) {
          console.warn('Could not refresh profile after update', e);
        }
        navigate('/student/dashboard');
      } else {
        toast({ title: 'Update failed', description: resp?.message || 'Could not update profile', variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Profile update error', err);
      toast({ title: 'Error', description: err?.message || 'Failed to update profile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
            <Mic className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-100">
            Edit Profile
          </Button>
        </div>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-blue-900 text-white flex flex-col">
        {/* User Profile Section */}
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-700">
              <img
                src={
                  profile?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    (profile?.firstName || 'Student') + ' ' + (profile?.lastName || '')
                  )}&background=random&color=fff`
                }
                alt={profile?.firstName || 'Student'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : 'Student'}</h3>
              <div className="flex items-center gap-2 text-blue-200">
                <span className="text-sm">{profile?.email || '—'}</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-6">
          <nav className="space-y-2">
            <Link 
              to="/student/dashboard"
              className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors"
            >
              <Home className="h-5 w-5" />
              My Progress
            </Link>
            <Link 
              to="/student/my-courses"
              className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors"
            >
              <FileText className="h-5 w-5" />
              My Courses
            </Link>
            <Link 
              to="/courses"
              className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Browse Courses
            </Link>
            <Link 
              to="/student/my-assignments"
              className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors"
            >
              <GraduationCap className="h-5 w-5" />
              My Assignments
            </Link>
            <Link 
              to="/student/my-grades"
              className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors"
            >
              <Star className="h-5 w-5" />
              Grades
            </Link>
            <div className="w-full flex items-center gap-3 p-3 rounded-lg bg-teal-500 text-white font-medium">
              <User className="h-5 w-5" />
              Profile Settings
            </div>
          </nav>

          {/* Labels Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-blue-200">Labels</h4>
              <Plus className="h-4 w-4 text-blue-200 cursor-pointer" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-sm text-blue-200">UI Design</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-sm text-blue-200">UX Design</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-6 border-t border-blue-800">
          <nav className="space-y-2">
            <Link 
              to="/settings" 
              className="flex items-center gap-3 p-3 text-blue-200 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
              System Settings
            </Link>
            <Link 
              to="/help" 
              className="flex items-center gap-3 p-3 text-blue-200 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
              Help Center
            </Link>
            <Link 
              to="/" 
              className="flex items-center gap-3 p-3 text-red-200 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {renderHeader()}

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-4xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Picture Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100">
                    <img
                      src={
                        profile?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          (profile?.firstName || 'Student') + ' ' + (profile?.lastName || '')
                        )}&background=random&color=fff&size=96`
                      }
                      alt={profile?.firstName || 'Student'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                    Change Picture
                  </Button>
                </CardContent>
              </Card>

              {/* Profile Information Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)} 
                          required 
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)} 
                          required 
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">New Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave blank to keep current password"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave blank if you don't want to change your password</p>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => navigate('/student/dashboard')}
                        className="text-gray-600 border-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Account Actions Card */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-lg">Account Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="flex items-center gap-2 h-auto p-4 justify-start">
                      <Settings className="h-5 w-5 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium">Privacy Settings</div>
                        <div className="text-sm text-gray-500">Manage your privacy preferences</div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="flex items-center gap-2 h-auto p-4 justify-start">
                      <Bell className="h-5 w-5 text-blue-600" />
                      <div className="text-left">
                        <div className="font-medium">Notifications</div>
                        <div className="text-sm text-gray-500">Configure notification settings</div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="flex items-center gap-2 h-auto p-4 justify-start text-red-600 border-red-200 hover:bg-red-50">
                      <LogOut className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Delete Account</div>
                        <div className="text-sm text-gray-500">Permanently delete your account</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentProfile;
