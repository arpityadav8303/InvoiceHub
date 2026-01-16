import React from 'react';

const Card = ({ 
  children,       // The content inside the card
  title,          // Optional: The text in the header
  subtitle,       // Optional: Small gray text below title
  action,         // Optional: A button or menu to show in the top-right
  footer,         // Optional: Content for the bottom section
  className = '', // Allow adding extra width/margin classes
  noPadding = false // If true, removes padding (good for Tables inside cards)
}) => {
  
  return (
    // 1. THE CONTAINER
    // "bg-white" and "rounded-xl" give it the card shape
    // "border-gray-100" creates a subtle, professional hairline border
    <div className={`
      bg-white dark:bg-gray-800 
      rounded-xl 
      border border-gray-100 dark:border-gray-700 
      shadow-sm 
      flex flex-col 
      ${className}
    `}>
      
      {/* 2. THE HEADER (Only renders if title or action exists) */}
      {(title || action) && (
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          
          {/* Title Section */}
          <div>
            {title && (
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>

          {/* Action Section (e.g., "Edit" button or "..." menu) */}
          {action && (
            <div className="flex-shrink-0 ml-4">
              {action}
            </div>
          )}
        </div>
      )}

      {/* 3. THE BODY */}
      {/* If "noPadding" is true, we remove p-6. This is useful when putting a Table inside a card 
          so the table rows touch the very edge. */}
      <div className={`flex-1 ${noPadding ? '' : 'p-6'}`}>
        {children}
      </div>

      {/* 4. THE FOOTER (Only renders if footer exists) */}
      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 rounded-b-xl">
          {footer}
        </div>
      )}

    </div>
  );
};

export default Card;
