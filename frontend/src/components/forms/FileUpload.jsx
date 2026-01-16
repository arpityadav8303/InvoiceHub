import React, { useRef } from 'react';
import { UploadCloud, X, FileText } from 'lucide-react';
import Button from '../common/Button'; // Reusing your existing Button

const FileUpload = ({
  label,
  onChange, // Returns the File object
  error,
  accept = "image/*,.pdf",
  currentFile = null, // If a file is already selected, show its name
  onRemove, // Function to clear the file
  disabled = false,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {!currentFile ? (
        // STATE A: NO FILE SELECTED (Show Drop Zone)
        <div 
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`
            relative group flex flex-col items-center justify-center w-full h-32 
            border-2 border-dashed rounded-xl cursor-pointer transition-colors
            ${error 
              ? 'border-red-300 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/10' 
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700'
            }
          `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className={`w-8 h-8 mb-2 ${error ? 'text-red-500' : 'text-gray-400'}`} />
            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              SVG, PNG, JPG or PDF (MAX. 2MB)
            </p>
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
      ) : (
        // STATE B: FILE SELECTED (Show Preview Card)
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                {currentFile.name}
              </span>
              <span className="text-xs text-gray-500">
                {(currentFile.size / 1024).toFixed(0)} KB
              </span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X size={18} />
          </Button>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
