import React from "react";

interface MapHeaderProps {
  emergencyCount: number;
}

export const MapHeader: React.FC<MapHeaderProps> = ({ emergencyCount }) => {
  return (
    <div className="absolute top-4 right-4 md:left-1/2 md:transform md:-translate-x-1/2 z-10 flex items-center justify-center">
      {/* Emergency Requests Badge */}
      {emergencyCount > 0 && (
        <div className="bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg text-sm font-semibold">
          {emergencyCount} Requests
        </div>
      )}
    </div>
  );
};
