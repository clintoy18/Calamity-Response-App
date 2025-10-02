import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  errorMessage: string;
  hasLocation: boolean;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ errorMessage, hasLocation, onRetry }) => {
  return (
    <div className="p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-10 h-10 text-red-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
      <p className="text-sm text-red-600 mb-6">
        {hasLocation ? errorMessage : "Unable to detect your location. Please enable location services."}
      </p>

      <button
        onClick={onRetry}
        disabled={!hasLocation}
        className={`w-full font-semibold py-3 px-6 rounded-lg transition-all 
          ${hasLocation 
            ? "bg-red-500 hover:bg-red-600 text-white" 
            : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
      >
        {hasLocation ? "Try Again" : "Location Required"}
      </button>
    </div>
  );
};
