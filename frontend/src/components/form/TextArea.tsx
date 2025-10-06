interface TextAreaProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ 
  label, 
  value, 
  onChange, 
  rows = 4, 
  placeholder, 
  error 
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-900">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-white border rounded-xl transition-all duration-200 resize-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
        error 
          ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
          : "border-gray-200 focus:border-gray-900 focus:ring-gray-100"
      }`}
    />
    {error && (
      <p className="text-sm text-red-600 flex items-center gap-1">
        {error}
      </p>
    )}
  </div>
);