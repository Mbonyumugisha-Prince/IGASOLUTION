import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  fetchStudentPaymentHistory,
  formatPaymentStatus,
  formatPaymentAmount
} from '@/ApiConfig/StudentConnection';
import { 
  CreditCard, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Wallet,
  Eye,
  Calendar,
  User,
  DollarSign,
  Hash,
  Building,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PaymentDashboard = () => {
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPayments: 0,
    completedPayments: 0,
    pendingPayments: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const response = await fetchStudentPaymentHistory(0, 5);
      const payments = response?.content || [];
      
      setRecentPayments(payments);
      
      // Calculate stats
      const completed = payments.filter((p: any) => p.paymentStatus === 'COMPLETED');
      const pending = payments.filter((p: any) => p.paymentStatus === 'PENDING');
      const totalSpent = completed.reduce((sum: number, p: any) => sum + p.amount, 0);
      
      setStats({
        totalPayments: payments.length,
        completedPayments: completed.length,
        pendingPayments: pending.length,
        totalSpent
      });
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'FAILED': return <CreditCard className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const handleViewPaymentDetails = (payment: any) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Payment Overview</h1>
            <p className="text-blue-100">Manage and track your payment history</p>
          </div>
          <div className="hidden md:flex">
            <Wallet className="h-12 w-12 opacity-20" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatPaymentAmount(stats.totalSpent)}</p>
                <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedPayments}</p>
                <p className="text-xs text-green-600 mt-1">Successful payments</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
                <p className="text-xs text-yellow-600 mt-1">In processing</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
                <p className="text-xs text-purple-600 mt-1">All transactions</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <CreditCard className="h-6 w-6 text-blue-600" />
              Recent Payments
            </CardTitle>
            <Button asChild variant="outline" size="sm" className="hover:bg-blue-50">
              <Link to="/student/payments">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {recentPayments.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500 mb-6">You haven't made any payments yet. Start by enrolling in a course!</p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPayments.map((payment, index) => (
                <div 
                  key={payment.id} 
                  className="group p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all duration-200 bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                            {payment.courseName || `Course Payment #${index + 1}`}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(payment.paymentDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {payment.paymentMethod || 'FLUTTERWAVE'}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPaymentDetails(payment)}
                          className="ml-4 hover:bg-blue-50 hover:border-blue-300 group-hover:opacity-100 opacity-0 transition-opacity duration-200"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={`${getStatusColor(payment.paymentStatus)} flex items-center gap-1`}>
                            {getStatusIcon(payment.paymentStatus)}
                            {formatPaymentStatus(payment.paymentStatus)}
                          </Badge>
                          {payment.transactionReference && (
                            <span className="text-xs text-gray-400 font-mono">
                              #{payment.transactionReference.slice(-8)}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">
                            {formatPaymentAmount(payment.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Modal */}
      <Dialog open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Status Banner */}
              <div className={`p-4 rounded-lg border ${
                selectedPayment.paymentStatus === 'COMPLETED' 
                  ? 'bg-green-50 border-green-200' 
                  : selectedPayment.paymentStatus === 'PENDING'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedPayment.paymentStatus)}
                    <span className="font-semibold">
                      Payment {formatPaymentStatus(selectedPayment.paymentStatus)}
                    </span>
                  </div>
                  <Badge className={getStatusColor(selectedPayment.paymentStatus)}>
                    {formatPaymentStatus(selectedPayment.paymentStatus)}
                  </Badge>
                </div>
              </div>

              {/* Payment Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Course Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Course Name</p>
                        <p className="font-medium">{selectedPayment.courseName || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium text-lg">{formatPaymentAmount(selectedPayment.amount)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Transaction Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Transaction Reference</p>
                        <p className="font-mono text-sm">{selectedPayment.transactionReference || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-medium">{selectedPayment.paymentMethod || 'FLUTTERWAVE'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Payment Date</p>
                        <p className="font-medium">{formatDate(selectedPayment.paymentDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Student Name</p>
                      <p className="font-medium">{selectedPayment.studentName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Payment ID</p>
                      <p className="font-mono text-xs">{selectedPayment.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowPaymentDetails(false)}>
                  Close
                </Button>
                {selectedPayment.paymentStatus === 'COMPLETED' && (
                  <Button className="bg-green-600 hover:bg-green-700">
                    Download Receipt
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentDashboard;