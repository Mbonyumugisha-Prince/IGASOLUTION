import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Menu, X, LogOut } from 'lucide-react';
import { AUTH_CHANGE_EVENT, fetchStudentProfile } from '@/ApiConfig/StudentConnection';

const BASE_NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Courses', path: '/courses' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

interface NavigationProps {
  userType?: 'student' | 'coach' | null;
  userName?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ userType, userName }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [resolvedUserType, setResolvedUserType] = useState<NavigationProps['userType']>(userType ?? null);
  const [resolvedUserName, setResolvedUserName] = useState<string | undefined>(userName);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    setResolvedUserType(userType ?? null);
    setResolvedUserName(userName);
  }, [userType, userName]);

  const hydrateStudentInfo = useCallback(
    async (options: { forceRefresh?: boolean } = {}) => {
      if (userType) {
        return;
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('authtoken') : null;

      if (!token) {
        setResolvedUserType(null);
        setResolvedUserName(undefined);
        return;
      }

      try {
        // First try to read from cache
        if (!options.forceRefresh) {
          const cachedProfile = typeof window !== 'undefined' 
            ? localStorage.getItem('studentProfile') 
            : null;
          if (cachedProfile) {
            const data = JSON.parse(cachedProfile);
            const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
            const fallback = data.email || 'Student';
            setResolvedUserType('student');
            setResolvedUserName(fullName || fallback);
            return;
          }
        }

        // If cache miss or forceRefresh, fetch from API
        const resp = await fetchStudentProfile();
        if (resp?.data) {
          const data = resp.data;
          const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
          const fallback = data.email || 'Student';
          setResolvedUserType('student');
          setResolvedUserName(fullName || fallback);
        }
      } catch (err) {
        console.warn('Unable to resolve student info for navigation', err);
      }
    },
    [userType],
  );

  useEffect(() => {
    hydrateStudentInfo();
  }, [hydrateStudentInfo, location.pathname, location.search]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleAuthChange = () => {
      hydrateStudentInfo({ forceRefresh: true });
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'authtoken') {
        handleAuthChange();
      }
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener('focus', handleAuthChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener('focus', handleAuthChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [hydrateStudentInfo]);

  const computedNavLinks = useMemo(() => {
    if (resolvedUserType === 'student') {
      // When logged in, only show Dashboard and Courses
      return [
        { name: 'Dashboard', path: '/student/dashboard' },
        { name: 'Courses', path: '/courses' }
      ];
    }
    return BASE_NAV_LINKS;
  }, [resolvedUserType]);

  const handleLogout = () => {
    // Clear all student data from localStorage
    localStorage.removeItem('studentProfile');
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    localStorage.removeItem('authtoken'); // Make sure to clear the main auth token
    
    // Reset navigation state
    setResolvedUserType(null);
    setResolvedUserName(undefined);
    
    // Navigate to home page
    navigate('/');
  };

  const renderAuthButtons = () => {
    if (resolvedUserType === 'student') {
      return (
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">Welcome, {resolvedUserName}</span>
          <Button 
            variant="outline" 
            onClick={() => {
              handleLogout();
              setIsOpen(false); // Close mobile menu if open
            }}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      );
    }

    if (resolvedUserType === 'coach') {
      return (
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">Welcome, Coach {resolvedUserName}</span>
          <Button className="bg-primary hover:bg-primary-hover text-primary-foreground" asChild>
            <Link to="/coach/dashboard">Dashboard</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Button variant="ghost" asChild>
          <Link to="/student/login">Login</Link>
        </Button>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground" asChild>
          <Link to="/student/signup">Sign Up</Link>
        </Button>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground" asChild>
          <Link to="/coach/register">Become a Coach</Link>
        </Button>
      </div>
    );
  };

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <BookOpen className="h-8 w-8" />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              IGA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center gap-8">
              {computedNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.path) ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:block">
            {renderAuthButtons()}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            {computedNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              {renderAuthButtons()}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;