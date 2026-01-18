import React, { useState } from 'react';
import { Search, ShieldAlert } from 'lucide-react';
import Button from '../common/Button';

const RiskSearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl mx-auto mb-8">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-gray-900 dark:text-white shadow-sm"
          placeholder="Enter Client Name, Email, or GSTIN to assess risk..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Button 
        type="submit" 
        size="lg" 
        icon={ShieldAlert}
        className="shrink-0"
      >
        Analyze Risk
      </Button>
    </form>
  );
};

export default RiskSearchBar;
