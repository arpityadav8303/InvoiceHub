import React from 'react';
import { Download, Mail, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Button from '../common/Button';
import Dropdown from '../common/Dropdown';

const InvoiceActions = ({ 
  invoice, 
  onEdit, 
  onDelete, 
  onMarkPaid, 
  onDownload, 
  onSendEmail 
}) => {
  const isPaid = invoice.status === 'Paid';

  return (
    <div className="flex items-center gap-2">
      {/* Desktop: Primary Actions visible */}
      <div className="hidden sm:flex items-center gap-2">
        {!isPaid && (
          <Button 
            variant="secondary" 
            size="sm" 
            icon={CheckCircle} 
            onClick={onMarkPaid}
            className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            Mark Paid
          </Button>
        )}
        
        <Button 
          variant="secondary" 
          size="sm" 
          icon={Mail} 
          onClick={onSendEmail}
        >
          Send
        </Button>
        
        <Button 
          variant="secondary" 
          size="sm" 
          icon={Download} 
          onClick={onDownload}
        >
          PDF
        </Button>
      </div>

      {/* Mobile/Dropdown: All Actions */}
      <Dropdown
        items={[
          // Actions that are hidden on desktop
          { label: 'Edit Invoice', icon: <Edit size={16}/>, onClick: onEdit },
          { label: 'Download PDF', icon: <Download size={16}/>, onClick: onDownload },
          { label: 'Send Email', icon: <Mail size={16}/>, onClick: onSendEmail },
          { 
            label: isPaid ? 'Mark Unpaid' : 'Mark as Paid', 
            icon: isPaid ? <XCircle size={16}/> : <CheckCircle size={16}/>, 
            onClick: onMarkPaid 
          },
          { label: 'Delete', icon: <Trash2 size={16}/>, variant: 'danger', onClick: onDelete },
        ]}
      />
    </div>
  );
};

export default InvoiceActions;
