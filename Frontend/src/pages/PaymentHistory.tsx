import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  fetchStudentPaymentHistory,
  formatPaymentStatus,
  formatPaymentAmount,
  PaymentHistoryItem
} from '@/ApiConfig/StudentConnection';
import { 
  Calendar,
  CreditCard,
  Download,
  Eye,
  RefreshCw,
  ArrowLeft,
  Filter,
  Clock,
  CheckCircle,
  Hash,
  Building,
  FileText,
  User,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentHistory = () => {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  const loadPaymentHistory = async (page: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchStudentPaymentHistory(page, 10);
      
      setPayments(response?.content || []);
      setTotalPages(response?.totalPages || 0);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Error loading payment history:', err);
      setError(err.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const handleRefresh = () => {
    loadPaymentHistory(currentPage);
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

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/student/dashboard" 
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <div className="border-l pl-4">
                <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                <p className="text-gray-600">Track your course payments and transactions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {error}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && payments.length === 0 && !error && (
          <Card className="text-center py-12 shadow-sm">
            <CardContent>
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">No Payment History</h3>
              <p className="text-gray-600 mb-6">You haven't made any payments yet. Start by enrolling in a course!</p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment History List */}
        {payments.length > 0 && (
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <Card key={payment.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-xl text-gray-900">
                          {payment.courseName || `Course Payment #${index + 1}`}
                        </h3>
                        <Badge className={`${getStatusColor(payment.paymentStatus)} flex items-center gap-1`}>
                          {getStatusIcon(payment.paymentStatus)}
                          {formatPaymentStatus(payment.paymentStatus)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="text-gray-500">Transaction ID:</span>
                            <p className="font-medium font-mono text-xs">
                              {payment.transactionReference || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="text-gray-500">Payment Method:</span>
                            <p className="font-medium">{payment.paymentMethod || 'FLUTTERWAVE'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="text-gray-500">Date:</span>
                            <p className="font-medium">
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold text-gray-900 mb-3">
                        {formatPaymentAmount(payment.amount)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewPaymentDetails(payment)}
                          className="hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {payment.paymentStatus === 'COMPLETED' && (
                          <Button variant="outline" size="sm" className="hover:bg-green-50">
                            <Download className="h-4 w-4 mr-2" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button 
              variant="outline" 
              disabled={currentPage === 0 || loading}
              onClick={() => loadPaymentHistory(currentPage - 1)}
              className="px-6"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + Math.max(0, Math.min(currentPage - 2, totalPages - 5));
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => loadPaymentHistory(pageNum)}
                    disabled={loading}
                    className="w-10 h-10"
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>
            
            <Button 
              variant="outline" 
              disabled={currentPage >= totalPages - 1 || loading}
              onClick={() => loadPaymentHistory(currentPage + 1)}
              className="px-6"
            >
              Next
            </Button>
          </div>
        )}

        {/* Payment Details Modal */}
        <Dialog open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
          <DialogContent className="max-w-3xl">
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
                  <h3 className="font-semibold text-lg border-b pb-2">Payment Information</h3>
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
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PaymentHistory;