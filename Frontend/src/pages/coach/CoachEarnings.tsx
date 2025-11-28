import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, Users, BookOpen, TrendingUp, Calendar, 
  Search, Filter, Download, RefreshCw, Eye, CheckCircle,
  Clock, AlertTriangle, CreditCard, ArrowLeft, Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  getInstructorEarnings,
  getAllInstructorPayments,
  getCoursePaymentAnalytics,
  getCoursePayments
} from '@/ApiConfig/InstructorServices';
import { getInstructorCourses } from '@/ApiConfig/CoachConnection';

interface PaymentData {
  id: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  course: {
    id: string;
    courseName: string;
    price: number;
  };
  amount: number;
  paymentStatus: string;
  transactionReference: string;
  paymentDate: string;
  paymentMethod: string;
}

interface EarningsData {
  totalRevenue: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalPayments: number;
  averagePaymentAmount: number;
}

const CoachEarnings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentData[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');
  
  // Selected payment for details
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);

  useEffect(() => {
    fetchEarningsData();
    fetchCoursesData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, searchTerm, statusFilter, courseFilter, sortBy]);

  const fetchEarningsData = async () => {
    try {
      setIsLoading(true);
      
      const [earningsResponse, paymentsResponse] = await Promise.all([
        getInstructorEarnings(),
        getAllInstructorPayments()
      ]);
      
      if (earningsResponse.success) {
        setEarningsData(earningsResponse.data);
      }
      
      if (paymentsResponse.success) {
        setPayments(paymentsResponse.data);
      }
      
      toast({
        title: "Success",
        description: "Earnings data loaded successfully"
      });
    } catch (error: any) {
      console.error('Error fetching earnings:', error);
      toast({
        title: "Error",
        description: "Failed to load earnings data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCoursesData = async () => {
    try {
      const response = await getInstructorCourses();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionReference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(payment => payment.paymentStatus === statusFilter);
    }

    // Course filter
    if (courseFilter !== 'ALL') {
      filtered = filtered.filter(payment => payment.course.id === courseFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
        case 'date_asc':
          return new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
        case 'amount_desc':
          return b.amount - a.amount;
        case 'amount_asc':
          return a.amount - b.amount;
        case 'student_name':
          return `${a.student.firstName} ${a.student.lastName}`.localeCompare(
            `${b.student.firstName} ${b.student.lastName}`
          );
        default:
          return 0;
      }
    });

    setFilteredPayments(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('', {
      style: 'currency',
      currency: 'RWF'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-purple-100 text-purple-800">Refunded</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportPayments = () => {
    const csvContent = [
      ['Date', 'Student Name', 'Student Email', 'Course', 'Amount', 'Status', 'Reference'].join(','),
      ...filteredPayments.map(payment => [
        formatDate(payment.paymentDate),
        `${payment.student.firstName} ${payment.student.lastName}`,
        payment.student.email,
        payment.course.courseName,
        payment.amount,
        payment.paymentStatus,
        payment.transactionReference
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `earnings_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/coach/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Earnings Management</h1>
              <p className="text-gray-600">Manage and track student payments for your courses</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchEarningsData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportPayments} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Earnings Overview Cards */}
      {earningsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(earningsData.totalRevenue)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-blue-600">{earningsData.totalPayments}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {earningsData.totalPayments > 0 
                      ? Math.round((earningsData.successfulPayments / earningsData.totalPayments) * 100)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Payment</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(earningsData.averagePaymentAmount)}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Status Summary */}
      {earningsData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payment Status Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{earningsData.successfulPayments}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-800">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{earningsData.pendingPayments}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{earningsData.failedPayments}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-800">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{earningsData.totalPayments}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Payment Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students, courses, or references..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Newest First</SelectItem>
                <SelectItem value="date_asc">Oldest First</SelectItem>
                <SelectItem value="amount_desc">Highest Amount</SelectItem>
                <SelectItem value="amount_asc">Lowest Amount</SelectItem>
                <SelectItem value="student_name">Student Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Student Payments ({filteredPayments.length})</span>
            <div className="text-sm text-gray-500">
              Total: {formatCurrency(filteredPayments.reduce((sum, p) => p.paymentStatus === 'COMPLETED' ? sum + p.amount : sum, 0))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Student</th>
                    <th className="text-left py-3 px-4">Course</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Reference</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{payment.student.firstName} {payment.student.lastName}</p>
                          <p className="text-sm text-gray-500">{payment.student.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{payment.course.courseName}</p>
                          <p className="text-sm text-gray-500">Course Price: {formatCurrency(payment.course.price)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-green-600">{formatCurrency(payment.amount)}</span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(payment.paymentStatus)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{formatDate(payment.paymentDate)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {payment.transactionReference}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Payment Details</DialogTitle>
                            </DialogHeader>
                            {selectedPayment && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold text-gray-700">Student Information</h4>
                                    <p><strong>Name:</strong> {selectedPayment.student.firstName} {selectedPayment.student.lastName}</p>
                                    <p><strong>Email:</strong> {selectedPayment.student.email}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-700">Course Information</h4>
                                    <p><strong>Course:</strong> {selectedPayment.course.courseName}</p>
                                    <p><strong>Price:</strong> {formatCurrency(selectedPayment.course.price)}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold text-gray-700">Payment Details</h4>
                                    <p><strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}</p>
                                    <p><strong>Status:</strong> {getStatusBadge(selectedPayment.paymentStatus)}</p>
                                    <p><strong>Method:</strong> {selectedPayment.paymentMethod}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-700">Transaction Details</h4>
                                    <p><strong>Reference:</strong> {selectedPayment.transactionReference}</p>
                                    <p><strong>Date:</strong> {formatDate(selectedPayment.paymentDate)}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">No payments found</h3>
              <p className="text-gray-500">No payments match your current filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoachEarnings;