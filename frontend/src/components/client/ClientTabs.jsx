import React from 'react';
import Tabs from '../common/Tabs'; // Reusing your generic Tabs component

const ClientTabs = ({ activeTab, onChange }) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'payments', label: 'Payment History' },
    { id: 'risk', label: 'Risk Profile' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm px-6 pt-4 mb-6">
      <Tabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onChange={onChange} 
      />
    </div>
  );
};

export default ClientTabs;