import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, ExternalLink } from 'lucide-react';

// Components
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PaymentMethodBadge from '../../components/payment/PaymentMethodBadge';

// Utils
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';

const PaymentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);

  // MOCK FETCH
  useEffect(() => {
    setTimeout(() => {
      setPayment({
        id: id,
        amount: 5000.00,
        date: '2024-03-15T14:30:00Z',
        method: 'Bank Transfer',
        status: 'Completed',
        transactionId: 'TXN-88992211',
        notes: 'Monthly retainer fee for March',
        invoice: {
          id: 'inv-123',
          number: 'INV-2024-001',
          total: 5000.00
        },
        client: {
          id: 'cli-456',
          name: 'Tech Solutions Inc.',
          email: 'accounts@techsolutions.com'
        }
      });
      setLoading(false);
    }, 800);
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!payment) return <div>Payment not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* 1. Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Details</h1>
      </div>

      {/* 2. Main Receipt Card */}
      <Card className="p-0 overflow-hidden print:shadow-none print:border-none">
        {/* Receipt Header */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-8 text-center border-b border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <span className="text-2xl font-bold">✓</span>
          </div>
          <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Payment Received</p>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {formatCurrency(payment.amount)}
          </h2>
          <Badge variant={payment.status === 'Completed' ? 'success' : 'warning'}>
            {payment.status}
          </Badge>
        </div>

        {/* Receipt Body */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Payment Date</p>
                <p className="font-medium">{formatDateTime(payment.date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Payment Method</p>
                <div className="mt-1">
                  <PaymentMethodBadge method={payment.method} />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Transaction ID</p>
                <p className="font-mono text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700 inline-block">
                  {payment.transactionId || 'N/A'}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Client</p>
                <p className="font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => navigate(`/clients/${payment.client.id}`)}>
                  {payment.client.name}
                </p>
                <p className="text-sm text-gray-500">{payment.client.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Linked Invoice</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-medium">#{payment.invoice.number}</p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    icon={ExternalLink} 
                    className="h-6 text-gray-400"
                    onClick={() => navigate(`/invoices/${payment.invoice.id}`)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {payment.notes && (
            <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 uppercase mb-2">Notes</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                "{payment.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
            Print Receipt
          </Button>
          <Button variant="primary" icon={Download}>
            Download PDF
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentDetailsPage;
