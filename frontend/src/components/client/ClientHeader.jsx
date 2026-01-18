import React from 'react';
import { MapPin, Building, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { getInitials } from '../../utils/helpers';

const ClientHeader = ({ client, onEdit, onDelete }) => {
  if (!client) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* Identity Section */}
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-md">
            {getInitials(client.name)}
          </div>
          
          {/* Name & Details */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {client.name}
              </h1>
              <Badge variant={client.status === 'Active' ? 'success' : 'neutral'}>
                {client.status || 'Active'}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
              {client.companyName && (
                <div className="flex items-center gap-1.5">
                  <Building size={16} className="text-gray-400" />
                  {client.companyName}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Mail size={16} className="text-gray-400" />
                {client.email}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-gray-400" />
                {client.address || 'No address provided'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          <Button 
            variant="secondary" 
            icon={Edit} 
            onClick={onEdit}
          >
            Edit Profile
          </Button>
          <Button 
            variant="danger" 
            size="icon" 
            onClick={onDelete}
            title="Delete Client"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientHeader;