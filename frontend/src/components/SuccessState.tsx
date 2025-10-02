import { CheckCircle } from 'lucide-react';

interface SuccessStateProps {
  onReset: () => void;
  onClose: () => void;
}

export const SuccessState = ({ onReset, onClose }: SuccessStateProps) => {
  return (
    <div className="p-8 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted!</h3>
      <p className="text-sm text-gray-600 mb-6">
        Your emergency request has been recorded. Help will be dispatched soon. Check the map for your marker.
      </p>
      
      <div className="space-y-2">
        <button
          onClick={onReset}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-all"
        >
          Submit Another Request
        </button>
        <button
          onClick={onClose}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-6 rounded-lg transition-all text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
};