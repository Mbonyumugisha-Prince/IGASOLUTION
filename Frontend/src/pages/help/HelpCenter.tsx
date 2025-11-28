import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Menu as MenuIcon, Bell, Play,
  Home, FileText, GraduationCap, Star, Settings, HelpCircle, LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpCenter: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-blue-900 text-white flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-700">
              <img src="https://ui-avatars.com/api/?name=Marcelino+Hwang&background=random&color=fff" alt="avatar" className="w-full h-full object-cover"/>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Marcelino Hwang</h3>
              <div className="text-blue-200 text-sm">heymarcel@email.com</div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <nav className="space-y-2">
            <Link to="/student/dashboard" className="block p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors flex items-center gap-3"><Home className="h-5 w-5" />My Progress</Link>
            <Link to="/student/my-courses" className="block p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors flex items-center gap-3"><FileText className="h-5 w-5" />My Courses</Link>
            <Link to="/student/my-assignments" className="block p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors flex items-center gap-3"><GraduationCap className="h-5 w-5" />My Assignments</Link>
            <Link to="/student/my-grades" className="block p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors flex items-center gap-3"><Star className="h-5 w-5" />Grades</Link>
            <Link to="/settings" className="block p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors flex items-center gap-3"><Settings className="h-5 w-5" />System Settings</Link>
            <div className="block p-3 rounded-lg bg-teal-500 text-white transition-colors flex items-center gap-3"><HelpCircle className="h-5 w-5" />Help Center</div>
          </nav>
        </div>

        <div className="p-6 border-t border-blue-800">
          <nav className="space-y-2">
            <Link to="/" className="flex items-center gap-3 p-3 text-red-200 hover:bg-blue-800 rounded-lg transition-colors"><LogOut className="h-5 w-5" />Logout</Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MenuIcon className="h-6 w-6 text-gray-600" />
              <h1 className="text-2xl font-bold">Help Center</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600 cursor-pointer" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Play className="h-4 w-4" />See Tutorial</Button>
            </div>
          </div>
        </header>

        <div className="px-6 py-8 space-y-6 max-w-5xl">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-2">Search Help</h2>
              <Input placeholder="Describe your issue or search topics..." />
              <div className="text-xs text-gray-500 mt-2">Popular: account, payments, assignments, grades</div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">FAQs</h3>
                <ul className="text-sm list-disc pl-4 space-y-2 text-gray-700">
                  <li>How to reset my password?</li>
                  <li>How to view my grades?</li>
                  <li>How to contact my coach?</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Contact Support</h3>
                <div className="space-y-3">
                  <Input placeholder="Subject" />
                  <Textarea placeholder="Describe the issue..." rows={6} />
                  <Button>Submit Ticket</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;



