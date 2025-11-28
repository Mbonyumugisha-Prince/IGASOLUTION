import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, Play, 
  Home, FileText, GraduationCap, Star, Settings, HelpCircle, Plus, LogOut, User, ChevronDown,
  CreditCard, Clock, AlertTriangle, Download, Eye, CheckCircle, XCircle, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchStudentProfile } from '@/ApiConfig/StudentConnection';
import { PaymentDashboard } from '@/components/PaymentDashboard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PaymentRecord {
  id: string;
  courseName: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'overdue';
  date: string;
  dueDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  description: string;
}

const MyPayments: React.FC = () => {
  // Currency formatting function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RWF'
    }).format(amount);
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<any | null>(() => {
    try {
      const raw = localStorage.getItem('studentProfile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const resp = await fetchStudentProfile();
        if (resp && resp.success && resp.data) {
          setProfile(resp.data);
          localStorage.setItem('studentProfile', JSON.stringify(resp.data));
        }
      } catch (e) {
        console.warn('Could not load profile in MyPayments', e);
      }
    };
    
    if (!profile) {
      loadProfile();
    }
  }, [profile]);

  // Mock payment data
  const paymentRecords: PaymentRecord[] = [
    {
      id: '1',
      courseName: 'Advanced Mathematics',
      amount: 299.00,
      status: 'completed',
      date: '2024-12-10',
      paymentMethod: 'Credit Card',
      transactionId: 'TXN123456789',
      description: 'Course enrollment fee for Advanced Mathematics semester course'
    },
    {
      id: '2',
      courseName: 'Physics Lab',
      amount: 150.00,
      status: 'overdue',
      date: '2024-12-15',
      dueDate: '2024-12-15',
      description: 'Laboratory equipment and materials fee'
    },
    {
      id: '3',
      courseName: 'Chemistry Lab',
      amount: 120.00,
      status: 'completed',
      date: '2024-11-25',
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN987654321',
      description: 'Laboratory materials and safety equipment fee'
    },
    {
      id: '4',
      courseName: 'English Literature',
      amount: 199.00,
      status: 'pending',
      date: '2024-12-30',
      dueDate: '2024-12-30',
      description: 'Course enrollment fee and textbook materials'
    },
    {
      id: '5',
      courseName: 'Computer Science Fundamentals',
      amount: 349.00,
      status: 'completed',
      date: '2024-09-01',
      paymentMethod: 'Flutterwave',
      transactionId: 'FW_456789123',
      description: 'Semester registration fee for Computer Science course'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-50 border-green-200 text-green-700',
      pending: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      failed: 'bg-red-50 border-red-200 text-red-700',
      overdue: 'bg-red-50 border-red-200 text-red-700'
    };
    return (
      <Badge className={`${variants[status as keyof typeof variants]} border`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const PaymentDetailsModal = ({ payment }: { payment: PaymentRecord }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            Complete information for this payment transaction
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Course</label>
            <p className="text-sm text-gray-900">{payment.courseName}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Amount</label>
              <p className="text-sm text-gray-900">{formatCurrency(payment.amount)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="flex items-center gap-2">
                {getStatusIcon(payment.status)}
                <span className="text-sm text-gray-900">{payment.status}</span>
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Date</label>
            <p className="text-sm text-gray-900">{payment.date}</p>
          </div>
          {payment.dueDate && (
            <div>
              <label className="text-sm font-medium text-gray-700">Due Date</label>
              <p className="text-sm text-gray-900">{payment.dueDate}</p>
            </div>
          )}
          {payment.paymentMethod && (
            <div>
              <label className="text-sm font-medium text-gray-700">Payment Method</label>
              <p className="text-sm text-gray-900">{payment.paymentMethod}</p>
            </div>
          )}
          {payment.transactionId && (
            <div>
              <label className="text-sm font-medium text-gray-700">Transaction ID</label>
              <p className="text-sm text-gray-900 font-mono">{payment.transactionId}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <p className="text-sm text-gray-900">{payment.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-blue-900 text-white flex flex-col">
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

        <div className="flex-1 p-6">
          <nav className="space-y-2">
            <Link to="/student/dashboard" className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors">
              <Home className="h-5 w-5" />
              My Progress
            </Link>
            <Link to="/student/my-courses" className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors">
              <FileText className="h-5 w-5" />
              My Courses
            </Link>
            <Link to="/courses" className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors">
              <Plus className="h-5 w-5" />
              Browse Courses
            </Link>
            <Link to="/student/my-assignments" className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors">
              <GraduationCap className="h-5 w-5" />
              My Assignments
            </Link>
            <Link to="/student/my-grades" className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors">
              <Star className="h-5 w-5" />
              Grades
            </Link>
            <div className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-teal-500 text-white font-medium">
              <CreditCard className="h-5 w-5" />
              Payments
            </div>
            <Link 
              to="/student/profile"
              className="w-full block text-left flex items-center gap-3 p-3 rounded-lg text-blue-200 hover:bg-blue-800 transition-colors"
            >
              <User className="h-5 w-5" />
              Profile Settings
            </Link>
          </nav>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-blue-200">Quick Actions</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-sm text-blue-200">Paid</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-sm text-blue-200">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-sm text-blue-200">Overdue</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-blue-800">
          <nav className="space-y-2">
            <Link to="/settings" className="flex items-center gap-3 p-3 text-blue-200 hover:bg-blue-800 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
              System Settings
            </Link>
            <Link to="/help" className="flex items-center gap-3 p-3 text-blue-200 hover:bg-blue-800 rounded-lg transition-colors">
              <HelpCircle className="h-5 w-5" />
              Help Center
            </Link>
            <Link to="/" className="flex items-center gap-3 p-3 text-red-200 hover:bg-blue-800 rounded-lg transition-colors">
              <LogOut className="h-5 w-5" />
              Logout
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Payment Management</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Header actions can be added here if needed */}
            </div>
          </div>
        </header>

        <div className="px-6 py-4">
          {/* Sub Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && <PaymentDashboard />}

            {activeTab === 'history' && (
              <div>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Payment History</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-gray-600">
                            <th className="text-left px-4 py-3 font-medium">Course</th>
                            <th className="text-left px-4 py-3 font-medium">Amount</th>
                            <th className="text-left px-4 py-3 font-medium">Date</th>
                            <th className="text-left px-4 py-3 font-medium">Status</th>
                            <th className="text-left px-4 py-3 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentRecords.map((payment) => (
                            <tr key={payment.id} className="border-t hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-900">{payment.courseName}</td>
                              <td className="px-4 py-3 font-semibold">{formatCurrency(payment.amount)}</td>
                              <td className="px-4 py-3 text-gray-600">{payment.date}</td>
                              <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
                              <td className="px-4 py-3">
                                <PaymentDetailsModal payment={payment} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPayments;