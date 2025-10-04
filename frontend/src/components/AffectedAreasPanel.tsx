import React, { useState } from 'react';
import { X, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { affectedAreas } from '../constants';

interface AffectedAreasPanelProps {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  emergencyCount: number;
}

export const AffectedAreasPanel: React.FC<AffectedAreasPanelProps> = ({
  isVisible,
  setIsVisible,
  emergencyCount,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

 return (
    <>
       <MapPin className="w-4 h-4" />
        {isVisible ? 'Hide Areas' : 'Show Areas'}
      {/* 📱 Mobile toggle button */}
      <button
        className="sm:hidden fixed bottom-4 right-4 z-20 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-orange-600 transition"
        onClick={() => setIsVisible(!isVisible)}
      >
      </button>
      

      {/* 🗺️ Affected Areas Panel */}
      <div
        className={`
          absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200
          max-w-xs w-full transition-all duration-300 overflow-hidden
          ${isVisible ? 'block' : 'hidden'} sm:block
          ${isMinimized ? 'h-[60px] px-4 py-2' : 'p-4'}
        `}
      >
        {/* Header Section */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-800">Affected Areas</h3>

            {/* 🔴 Emergency Count Badge */}
            {emergencyCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-md">
                {emergencyCount} Requests
              </span>
            )}
          </div>

          {/* 🔽 Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-gray-100 rounded-full p-1.5 transition"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? (
                <ChevronUp className="w-4 h-4 text-gray-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Affected Area List */}
        {!isMinimized && (
          <ul className="space-y-2 mt-2">
            {affectedAreas.map((area, index) => (
              <li
                key={index}
                className="text-xs text-gray-600 flex items-center gap-3 bg-gray-50 hover:bg-gray-100 rounded-lg p-2 transition"
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-50 animate-ping"></span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="#f97316"
                    className="w-5 h-5 relative"
                  >
                    <path d="M12 2C6 2 2 6 2 12s4 10 10 10 10-4 10-10S18 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm0-14c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z" />
                  </svg>
                </div>

                <div>
                  <span className="font-medium">{area.name}</span>
                  <br />
                  <span className="text-gray-500 text-[11px]">
                    ({area.coords[0].toFixed(4)}, {area.coords[1].toFixed(4)})
                  </span>
                  {area.intensity && (
                    <>
                      <br />
                      <span className="text-red-500 font-semibold text-[11px]">
                        Intensity: {area.intensity}
                      </span>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};