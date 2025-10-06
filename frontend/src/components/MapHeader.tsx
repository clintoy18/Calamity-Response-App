import React from "react";

interface MapHeaderProps {
  emergencyCount: number;
}

export const MapHeader: React.FC<MapHeaderProps> = ({ emergencyCount }) => {
  return (
    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10 gap-2">
      <h1 className="text-white text-md sm:text-xl flex flex-row font-bold gap-2 items-center jusitfy-center">
        <img className="w-6 h-6" src="./197561.png"></img>
        Cebu Calamity Response App
      </h1>
      <div className="fixed top-14 flex items-center justify-center gap-2 z-20 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg border-2 border-gray-100">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-medium text-gray-700">
          {emergencyCount} active
        </span>
      </div>
    </div>
  );
};
