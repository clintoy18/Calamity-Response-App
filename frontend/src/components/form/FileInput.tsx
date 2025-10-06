import { FileText, Upload } from "lucide-react";

interface FileInputProps {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  error?: string;
}

export const FileInput: React.FC<FileInputProps> = ({ 
  label, 
  file, 
  onChange, 
  accept = ".pdf,.jpg,.jpeg,.png", 
  error 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.files?.[0] || null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        {label}
      </label>
      <label className={`group relative flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
        error 
          ? "border-red-300 bg-red-50/50 hover:bg-red-50" 
          : file
          ? "border-gray-300 bg-gray-50"
          : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300"
      }`}>
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        {file ? (
          <>
            <FileText className="w-8 h-8 text-gray-600 mb-2" />
            <p className="text-sm font-medium text-gray-900 truncate max-w-full px-4">
              {file.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-gray-600 transition-colors" />
            <p className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {accept.split(',').join(', ').toUpperCase()}
            </p>
          </>
        )}
      </label>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
};