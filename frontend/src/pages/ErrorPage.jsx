import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import Button from '../components/common/Button';

const ErrorPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <AlertOctagon className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          500
        </h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Internal Server Error
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          The server encountered an internal error and was unable to complete your request. 
          This is likely a temporary issue.
        </p>

        <div className="flex justify-center gap-4">
          <Button 
            onClick={() => window.location.reload()} 
            icon={RefreshCw}
            size="lg"
          >
            Try Again
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={() => window.location.href = '/dashboard'}
            size="lg"
          >
            Dashboard
          </Button>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-400">
            Error Code: REF_500_SERVER_CRASH
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
