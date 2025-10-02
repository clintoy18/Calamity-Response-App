import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  errorMessage: string;
  onRetry: () => void;
}

export const ErrorState = ({ errorMessage, onRetry }: ErrorStateProps) => {
  return (
    <div className="p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-10 h-10 text-red-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
      <p className="text-sm text-red-600 mb-6">{errorMessage}</p>
      
      <button
        onClick={onRetry}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
      >
        Try Again
      </button>
    </div>
  );
};