function FormErrorMessage({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Error Icon */}
          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-4a1 1 0 11-2 0 1 1 0 012 0zM8 7a1 1 0 100-2 1 1 0 000 2zm5-1a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>

          {/* Error Text */}
          <p className="text-sm text-red-700">{message}</p>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 text-xl leading-none"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default FormErrorMessage;