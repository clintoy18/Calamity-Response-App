// frontend/src/components/ActionButtons.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { Status } from '../types';

interface ActionButtonsProps {
  status: Status;
  onRequestHelp: () => void;
  isPinpointMode?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  status, 
  onRequestHelp,
  isPinpointMode = false 
}) => {
  if (status !== 'idle' || isPinpointMode) return null;

  return (
    <div className="absolute bottom-16 sm:bottom-20 left-4 sm:left-4 right-4 sm:right-4 z-10">
      <div className="max-w-md mx-auto">
        <button
          onClick={onRequestHelp}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 sm:py-3 px-4 rounded-full shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <AlertCircle className="w-5 h-5" />
          Request Help
        </button>
      </div>
    </div>
  );
};
