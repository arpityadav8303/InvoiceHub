import React from 'react';
import SearchBar from '../common/SearchBar';
import Select from '../forms/Select';
import { Filter } from 'lucide-react';

const InvoiceFilters = ({ filters, onFilterChange, onSearchChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
      
      {/* 1. Search */}
      <div className="flex-1">
        <SearchBar 
          placeholder="Search invoice # or client name..." 
          value={filters.search}
          onChange={onSearchChange}
        />
      </div>

      {/* 2. Filters Row */}
      <div className="flex flex-wrap md:flex-nowrap gap-3 items-center">
        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium px-2">
          <Filter size={16} />
          <span className="hidden lg:inline">Filters:</span>
        </div>

        {/* Status Filter */}
        <div className="w-36">
          <Select
            name="status"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'draft', label: 'Draft' }
            ]}
            className="mb-0"
          />
        </div>

        {/* Date Range Filter */}
        <div className="w-40">
          <Select
            name="dateRange"
            value={filters.dateRange}
            onChange={(e) => onFilterChange('dateRange', e.target.value)}
            options={[
              { value: 'all', label: 'All Time' },
              { value: 'this_month', label: 'This Month' },
              { value: 'last_month', label: 'Last Month' },
              { value: 'this_year', label: 'This Year' }
            ]}
            className="mb-0"
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilters;
