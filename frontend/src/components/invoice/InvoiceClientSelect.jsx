import React from 'react';
import Select from '../forms/Select';
import { UserPlus } from 'lucide-react';
import Button from '../common/Button';

const InvoiceClientSelect = ({ 
  clients, 
  selectedClientId, 
  onChange, 
  error,
  onCreateNew // Callback to open "Add Client" modal if you want to add that feature later
}) => {
  
  // Convert your client objects into the format { value, label } for the Select component
  const clientOptions = clients.map(client => ({
    value: client.id,
    label: client.name
  }));

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Bill To Client <span className="text-red-500">*</span>
        </label>
        
        {/* Optional: Shortcut to create a client on the fly */}
        {onCreateNew && (
          <Button 
            variant="ghost" 
            size="sm" 
            icon={UserPlus} 
            onClick={onCreateNew}
            className="text-blue-600 h-8"
          >
            New Client
          </Button>
        )}
      </div>

      <Select
        name="clientId"
        value={selectedClientId}
        onChange={onChange}
        options={clientOptions}
        placeholder="Select a client..."
        error={error}
        className="bg-white"
      />

      {/* Show Client Address Preview if a client is selected */}
      {selectedClientId && (
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 pl-1">
          {(() => {
            const client = clients.find(c => c.id === selectedClientId);
            if (!client) return null;
            return (
              <>
                <p className="font-medium text-gray-900 dark:text-white">{client.companyName}</p>
                <p>{client.email}</p>
                <p>{client.address}</p>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default InvoiceClientSelect;