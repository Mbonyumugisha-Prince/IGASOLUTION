import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Menu as MenuIcon, Bell, Play, Monitor,
  Home, FileText, GraduationCap, Star, Settings as Cog, 
  HelpCircle, Plus, LogOut, Moon, Sun
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Link } from 'react-router-dom';

const SystemSettings: React.FC = () => {
  const [email, setEmail] = useState('heymarcel@email.com');
  const [name, setName] = useState('Marcelino Hwang');
  const [notifications, setNotifications] = useState(true);
  const [newsletter, setNewsletter] = useState(true);
  const { theme, setTheme } = useTheme();

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
              <div className="text-blue-200 text-sm">{email}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <nav className="space-y-2">
            <Link to="/student/dashboard" className="block p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors flex items-center gap-3"><Home className="h-5 w-5" />My Progress</Link>
            <Link to="/student/my-courses" className="block p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors flex items-center gap-3"><FileText className="h-5 w-5" />My Courses</Link>
            <Link to="/student/my-assignments" className="block p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors flex items-center gap-3"><GraduationCap className="h-5 w-5" />My Assignments</Link>
            <Link to="/student/my-grades" className="block p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors flex items-center gap-3"><Star className="h-5 w-5" />Grades</Link>
            <div className="block p-3 rounded-lg bg-teal-500 text-white transition-colors flex items-center gap-3"><Cog className="h-5 w-5" />System Settings</div>
            <Link to="/help" className="block p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors flex items-center gap-3"><HelpCircle className="h-5 w-5" />Help Center</Link>
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
              <h1 className="text-2xl font-bold">System Settings</h1>
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

        <div className="px-6 py-8 space-y-6">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Enable Notifications</div>
                  <div className="text-sm text-gray-500">Get updates about assignments and grades</div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Theme Settings</div>
                  <div className="text-sm text-gray-500">Choose your preferred theme</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4 mr-1" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-4 w-4 mr-1" />
                    Dark
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Newsletter</div>
                  <div className="text-sm text-gray-500">Receive tips and product updates</div>
                </div>
                <Switch checked={newsletter} onCheckedChange={setNewsletter} />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button className="px-6">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;



