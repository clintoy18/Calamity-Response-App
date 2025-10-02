import { Loader } from 'lucide-react';

interface LoadingStateProps {
  hasLocation: boolean;
}

export const LoadingState = ({ hasLocation }: LoadingStateProps) => {
  return (
    <div className="p-10 text-center">
      <Loader className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
      <p className="text-gray-700 font-medium">
        {hasLocation ? 'Submitting request...' : 'Locating you...'}
      </p>
    </div>
  );
};