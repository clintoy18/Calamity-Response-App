import React from "react";
import { AlertCircle } from "lucide-react";

// Shared button styling
const buttonBaseClass =
  "flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm";

const buttonVariants = {
  primary:
    "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700",
  secondary:
    "bg-white/95 text-gray-800 hover:bg-white border-2 border-gray-200",
  success:
    "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700",
  info: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
  cancel:
    "bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600",
};

// ActionButtons Component
interface ActionButtonsProps {
  status: string;
  onRequestHelp: () => void;
  isPinpointMode?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  status,
  onRequestHelp,
  isPinpointMode = false,
}) => {
  if (status !== "idle" || isPinpointMode) return null;

  return (
    <div className="fixed bottom-14 left-0 right-0 z-30  p-4 pb-6 sm:pb-4">
      <div className="max-w-2xl text-right mx-auto">
        <a className="text-sm" href="https://services.cebu.gov.ph/aidmap/rdm">
          Cebu Province Response Tracker App ⓘ
        </a>
        <button
          onClick={onRequestHelp}
          className={`w-full ${buttonBaseClass} ${buttonVariants.primary} text-lg py-4 `}
        >
          <AlertCircle className="w-6 h-6" />
          Request Emergency Assistance
        </button>
      </div>
    </div>
  );
};
