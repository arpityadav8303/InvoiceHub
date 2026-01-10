function FormInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  name,
}) {
  return (
    <div className="mb-4">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Field */}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full px-4 py-2 border rounded-lg outline-none transition
          ${
            error
              ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500'
              : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
          }
        `}
      />

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

export default FormInput;