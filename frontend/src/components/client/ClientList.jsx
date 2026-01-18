import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Button from '../common/Button';
import EmptyState from '../common/EmptyState';
import { formatDate, formatCurrency } from '../../utils/formatters';

const ClientList = ({ 
  clients, 
  isLoading, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  
  // Define Table Columns
  const columns = [
    {
      header: 'Client Name',
      accessor: 'name',
      render: (client) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">{client.name}</span>
          <span className="text-xs text-gray-500">{client.companyName}</span>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: 'email',
      render: (client) => (
        <div className="flex flex-col text-sm">
          <span>{client.email}</span>
          <span className="text-gray-400">{client.phone}</span>
        </div>
      )
    },
    {
      header: 'Total Revenue',
      accessor: 'totalRevenue',
      render: (client) => formatCurrency(client.totalRevenue || 0)
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (client) => (
        <Badge variant={client.status === 'Inactive' ? 'neutral' : 'success'}>
          {client.status || 'Active'}
        </Badge>
      )
    },
    {
      header: 'Joined',
      accessor: 'createdAt',
      render: (client) => formatDate(client.createdAt)
    },
    {
      header: 'Actions',
      accessor: 'id', // We don't use this accessor but need the column
      render: (client) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onView(client); }}>
            <Eye size={16} className="text-blue-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(client); }}>
            <Edit size={16} className="text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(client); }}>
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  if (!isLoading && clients.length === 0) {
    return (
      <EmptyState
        title="No clients found"
        description="Try adjusting your filters or add a new client to get started."
      />
    );
  }

  return (
    <Table 
      columns={columns} 
      data={clients} 
      isLoading={isLoading}
      onRowClick={onView} // Clicking the row opens details
    />
  );
};

export default ClientList;