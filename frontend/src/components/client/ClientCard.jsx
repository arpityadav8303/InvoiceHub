import React from 'react';
import { Building, Phone, Mail, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Dropdown from '../common/Dropdown';
import { getInitials } from '../../utils/helpers';

const ClientCard = ({ client, onEdit, onDelete, onView }) => {
  const { name, companyName, email, phone, status, totalRevenue } = client;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        {/* Avatar & Name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
            {getInitials(name)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]" title={name}>
              {name}
            </h3>
            {companyName && (
              <p className="text-sm text-gray-500 flex items-center gap-1 truncate max-w-[150px]">
                <Building size={12} /> {companyName}
              </p>
            )}
          </div>
        </div>

        {/* Actions Dropdown */}
        <Dropdown 
          trigger={<MoreVertical size={18} />}
          items={[
            { label: 'View Details', icon: <Eye size={14}/>, onClick: () => onView(client) },
            { label: 'Edit Client', icon: <Edit size={14}/>, onClick: () => onEdit(client) },
            { label: 'Delete', icon: <Trash2 size={14}/>, variant: 'danger', onClick: () => onDelete(client) },
          ]}
        />
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between py-3 border-y border-gray-50 dark:border-gray-700/50 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase">Revenue</p>
          <p className="font-semibold text-gray-900 dark:text-gray-200">
            ₹{totalRevenue?.toLocaleString() || '0'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase">Status</p>
          <Badge variant={status === 'Active' ? 'success' : 'neutral'} size="sm">
            {status || 'Active'}
          </Badge>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2 truncate">
          <Mail size={14} className="text-gray-400" />
          <span title={email}>{email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-gray-400" />
          <span>{phone}</span>
        </div>
      </div>
    </Card>
  );
};

export default ClientCard;
