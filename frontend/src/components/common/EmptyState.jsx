import React from 'react';
import { FolderOpen } from 'lucide-react'; // Default icon

const EmptyState = ({
  title = "No data found",
  description = "There are no items to display at the moment.",
  action = null,            // Pass a <Button> component here
  icon = FolderOpen         // You can override this (e.g., with specific icons like Users or FileText)
}) => {
  const Icon = icon;
  return (
    // 1. CONTAINER
    // "border-dashed" communicates that this is a placeholder
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">

      {/* 2. ICON CIRCLE */}
      {/* A subtle background circle to frame the icon */}
      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>

      {/* 3. TEXT CONTENT */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-8">
        {description}
      </p>

      {/* 4. ACTION BUTTON (Optional) */}
      {/* If you pass a button (like "Create Invoice"), it renders here */}
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;