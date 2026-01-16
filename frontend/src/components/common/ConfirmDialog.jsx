import React from 'react';
import { AlertTriangle, Info } from 'lucide-react'; 
import Modal from './Modal';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false, 
}) => {

  const footerContent = (
    <>
      {/* CANCEL BUTTON: Neutral Gray */}
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
      >
        {cancelText}
      </button>

      {/* CONFIRM BUTTON: Dynamic Color */}
      <button
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm transition-colors ${
          isDangerous
            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' // Red for Delete
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' // Blue for Safe Actions
        }`}
      >
        {confirmText}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={footerContent}
    >
      <div className="flex items-start gap-4">
        {/* ICON: Visual indicator of the action type */}
        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${
          isDangerous 
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          {isDangerous ? <AlertTriangle size={24} /> : <Info size={24} />}
        </div>
        
        {/* MESSAGE */}
        <div className="mt-1">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;