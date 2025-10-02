import { AlertCircle } from 'lucide-react';
import type { Status } from '../types';

interface ActionButtonsProps {
  status: Status;
  emergencyCount: number;
  onRequestHelp: () => void;
  onClearAll: () => void;
}

export const ActionButtons = ({ status, emergencyCount, onRequestHelp, onClearAll }: ActionButtonsProps) => {
  if (status !== 'idle') return null;

  return (
    <div className="absolute bottom-12 left-4 right-4 z-10">
      <div className="max-w-md mx-auto space-y-2">
        <button
          onClick={onRequestHelp}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-full shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <AlertCircle className="w-5 h-5" />
          Request Help
        </button>
        {emergencyCount > 0 && (
          <button
            onClick={onClearAll}
            className="w-full bg-white/90 backdrop-blur hover:bg-white text-gray-700 font-medium py-2 px-6 rounded-full shadow-lg transition-all text-sm"
          >
            Clear All ({emergencyCount})
          </button>
        )}
      </div>
    </div>
  );
};