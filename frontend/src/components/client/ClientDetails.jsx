import React, { useState } from 'react';
import { Mail, Phone, MapPin, FileText, Globe, Building } from 'lucide-react';
import Card from '../common/Card';
import Tabs from '../common/Tabs';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';

const ClientDetails = ({ client, stats }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'payments', label: 'Payments' },
    { id: 'risk', label: 'Risk Profile' }
  ];

  if (!client) return null;

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
            {client.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1"><Building size={14} /> {client.companyName || 'Individual'}</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {client.address || 'No address'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
            <Badge variant="success" size="md">Active Client</Badge>
            <Button variant="secondary" size="sm">Edit Profile</Button>
        </div>
      </div>

      {/* 2. TABS */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* 3. CONTENT AREA */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left: Contact Info */}
          <Card title="Contact Information" className="md:col-span-1 h-fit">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <Mail className="text-blue-600" size={20} />
                <div className="overflow-hidden">
                  <p className="text-xs text-gray-500 uppercase">Email</p>
                  <p className="font-medium truncate" title={client.email}>{client.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <Phone className="text-green-600" size={20} />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Phone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <FileText className="text-purple-600" size={20} />
                <div>
                  <p className="text-xs text-gray-500 uppercase">GST / Tax ID</p>
                  <p className="font-medium">{client.gstIn || 'Not Provided'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Middle: Stats */}
          <Card title="Financial Overview" className="md:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {/* These would be populated by props */}
               <StatBox label="Total Invoiced" value="₹12,400" />
               <StatBox label="Paid" value="₹10,000" color="text-green-600" />
               <StatBox label="Outstanding" value="₹2,400" color="text-red-600" />
               <StatBox label="Invoices" value="12" />
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <h4 className="text-sm font-semibold mb-3">Recent Activity</h4>
                <p className="text-sm text-gray-500">No recent activity found.</p>
            </div>
          </Card>
        </div>
      )}

      {/* Placeholders for other tabs */}
      {activeTab === 'invoices' && <EmptyState title="Invoices" description="Invoice list component will go here." />}
      {activeTab === 'payments' && <EmptyState title="Payments" description="Payment history component will go here." />}
      {activeTab === 'risk' && <EmptyState title="Risk Assessment" description="Risk charts will go here." />}

    </div>
  );
};

// Helper for Stats
const StatBox = ({ label, value, color = "text-gray-900 dark:text-white" }) => (
    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-500 uppercase mb-1">{label}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
);

export default ClientDetails;