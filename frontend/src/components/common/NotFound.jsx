import React from 'react';
import { FileQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-6">
        <FileQuestion size={48} className="text-blue-600 dark:text-blue-400" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Page Not Found
      </h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
