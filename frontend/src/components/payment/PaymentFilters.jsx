import React from 'react';
import SearchBar from '../common/SearchBar';
import Select from '../forms/Select';
import { Filter } from 'lucide-react';

const PaymentFilters = ({ filters, onFilterChange, onSearchChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
      
      {/* 1. Search */}
      <div className="flex-1">
        <SearchBar 
          placeholder="Search transaction ID or invoice #..." 
          value={filters.search}
          onChange={onSearchChange}
        />
      </div>

      {/* 2. Filters */}
      <div className="flex flex-wrap md:flex-nowrap gap-3 items-center">
        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium px-2">
          <Filter size={16} />
          <span className="hidden lg:inline">Filters:</span>
        </div>

        {/* Method Filter */}
        <div className="w-40">
          <Select
            name="method"
            value={filters.method}
            onChange={(e) => onFilterChange('method', e.target.value)}
            options={[
              { value: 'all', label: 'All Methods' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'Credit Card', label: 'Credit Card' },
              { value: 'UPI', label: 'UPI' },
              { value: 'Cash', label: 'Cash' }
            ]}
            className="mb-0"
          />
        </div>

        {/* Status Filter */}
        <div className="w-36">
          <Select
            name="status"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Failed', label: 'Failed' }
            ]}
            className="mb-0"
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentFilters;
