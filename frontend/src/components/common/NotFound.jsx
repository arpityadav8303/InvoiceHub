import React from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
          <Search className="w-16 h-16 text-blue-600 dark:text-blue-400 opacity-50" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 font-bold text-gray-900 dark:text-white">
          404
        </div>
      </div>

      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
        Page Not Found
      </h1>
      
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>

      <Button onClick={() => navigate('/')} icon={ArrowLeft} size="lg">
        Back to Dashboard
      </Button>
    </div>
  );
};

export default NotFound;
