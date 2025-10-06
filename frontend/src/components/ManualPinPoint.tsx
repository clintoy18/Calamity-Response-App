import { MapPin, Save, Search, X } from "lucide-react";

interface ManualPinpointProps {
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onConfirm: (lat: number, lng: number) => void;
  onOpenSearch: () => void;
  selectedLocation: { lat: number; lng: number } | null;
}

export const ManualPinpoint: React.FC<ManualPinpointProps> = ({
  isActive,
  onActivate,
  onDeactivate,
  onConfirm,
  onOpenSearch,
  selectedLocation,
}) => {
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
  return (
    <>
      {/* Alternative Location Methods - shown when not in pinpoint mode */}
      {!isActive && (
        <div className="fixed bottom-0 left-0 right-0 z-30  p-4 pb-6 sm:pb-4">
          <div className="max-w-2xl mx-auto">
            <div className="mt-3 flex flex-row gap-2">
              <button
                onClick={onActivate}
                className={`flex-1 ${buttonBaseClass} ${buttonVariants.secondary} text-sm py-2.5`}
              >
                <MapPin className="w-4 h-4" />
                Pin Location
              </button>
              <button
                onClick={onOpenSearch}
                className={`flex-1 ${buttonBaseClass} ${buttonVariants.secondary} text-sm py-2.5`}
              >
                <Search className="w-4 h-4" />
                Search Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Overlay */}
      {isActive && (
        <div className="absolute top-36 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="bg-white/95 backdrop-blur px-6 py-4 rounded-lg shadow-2xl text-center">
            <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800 mb-1">
              Tap anywhere on the map
            </p>
            <p className="text-xs text-gray-600">
              to mark an emergency location
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isActive && (
        <div className="absolute bottom-12 left-4 right-4 z-20 flex gap-2 max-w-md mx-auto">
          <button
            onClick={onDeactivate}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-full shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>

          {selectedLocation && (
            <button
              onClick={() =>
                onConfirm(selectedLocation.lat, selectedLocation.lng)
              }
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-full shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Confirm Location
            </button>
          )}
        </div>
      )}
    </>
  );
};
