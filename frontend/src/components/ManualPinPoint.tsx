// frontend/src/components/ManualPinpoint.tsx
import React from 'react';
import { MapPin, X, Save, Search } from 'lucide-react';

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
  return (
    <>
      {/* Toggle Buttons */}
      {!isActive && (
     <div className="absolute bottom-1 sm:bottom-8 left-4 right-4 z-10">
      <div className="max-w-md mx-auto flex gap-2">
        <button
          onClick={onOpenSearch}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 sm:py-3 px-4 rounded-full shadow-xl transition-all flex items-center justify-center gap-2"
          title="Search for a location"
        >
          <Search className="w-5 h-5" />
          <span className="text-sm">Search Location</span>
        </button>
        <button
          onClick={onActivate}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 sm:py-3 px-4 rounded-full shadow-xl transition-all flex items-center justify-center gap-2"
          title="Mark location on map"
        >
          <MapPin className="w-5 h-5" />
          <span className="text-sm">Pin on Map</span>
        </button>
      </div>
    </div>

      )}

      {/* Instructions Overlay */}
      {isActive && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
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
              onClick={() => onConfirm(selectedLocation.lat, selectedLocation.lng)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-full shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Confirm Location
            </button>
          )}
        </div>
      )}

      {/* Selected Location Info */}
      {isActive && selectedLocation && (
        <div className="absolute top-20 left-4 right-4 z-20 max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur px-4 py-3 rounded-lg shadow-lg">
            <p className="text-xs text-gray-600 mb-1">Selected Location:</p>
            <p className="text-sm font-mono text-gray-800">
              {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}
    </>
  );
};