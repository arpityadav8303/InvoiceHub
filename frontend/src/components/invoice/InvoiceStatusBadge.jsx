import React from 'react';
import Badge from '../common/Badge';

const InvoiceStatusBadge = ({ status }) => {
  const variants = {
    Paid: 'success',
    Pending: 'warning',
    Overdue: 'danger',
    Draft: 'neutral',
    Cancelled: 'neutral'
  };

  return (
    <Badge variant={variants[status] || 'neutral'}>
      {status}
    </Badge>
  );
};

export default InvoiceStatusBadge;
