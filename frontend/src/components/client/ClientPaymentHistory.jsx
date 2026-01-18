import React from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import { formatDate, formatCurrency } from '../../utils/formatters';

const ClientPaymentHistory = ({ payments }) => {
  
  if (!payments || payments.length === 0) {
    return (
      <EmptyState
        title="No payments recorded"
        description="There is no payment history available for this client."
      />
    );
  }

  const columns = [
    {
      header: 'Payment ID',
      accessor: 'id',
      render: (pay) => <span className="font-mono text-xs text-gray-500">{pay.id.substring(0,8)}</span>
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (pay) => formatDate(pay.date)
    },
    {
      header: 'Invoice Linked',
      accessor: 'invoiceNumber',
      render: (pay) => <span className="text-blue-600 font-medium">#{pay.invoiceNumber}</span>
    },
    {
      header: 'Method',
      accessor: 'method',
      render: (pay) => pay.method
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (pay) => <span className="font-semibold text-green-600">+{formatCurrency(pay.amount)}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (pay) => (
        <Badge variant={pay.status === 'Completed' ? 'success' : 'warning'}>
          {pay.status}
        </Badge>
      )
    }
  ];

  return <Table columns={columns} data={payments} />;
};

export default ClientPaymentHistory;