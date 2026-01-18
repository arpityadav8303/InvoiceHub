import React from 'react';
import SearchBar from '../common/SearchBar';
import Select from '../forms/Select';
import { Filter } from 'lucide-react';

const ClientFilters = ({ 
  filters, 
  onFilterChange, 
  onSearchChange 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      
      {/* 1. Search (Left side) */}
      <div className="w-full md:w-1/3">
        <SearchBar 
          placeholder="Search by name, email or company..." 
          value={filters.search}
          onChange={onSearchChange}
        />
      </div>

      {/* 2. Filter Controls (Right side) */}
      <div className="flex w-full md:w-auto gap-3 items-center">
        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mr-2">
          <Filter size={16} />
          <span className="hidden sm:inline">Filters:</span>
        </div>

        <div className="w-40">
          <Select
            name="status"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
            className="mb-0" // Override default margin
          />
        </div>

        <div className="w-40">
          <Select
            name="sortBy"
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'revenue', label: 'Highest Revenue' }
            ]}
            className="mb-0"
          />
        </div>
      </div>
    </div>
  );
};

export default ClientFilters;