import React from 'react';
import { X, MapPin } from 'lucide-react';
import { affectedAreas } from '../constants';

interface AffectedAreasPanelProps {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

export const AffectedAreasPanel: React.FC<AffectedAreasPanelProps> = ({ isVisible, setIsVisible }) => {
  return (
    <>
      <button
        className="sm:hidden fixed bottom-4 right-4 z-20 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
        onClick={() => setIsVisible(!isVisible)}
      >
        <MapPin className="w-4 h-4" />
        {isVisible ? "Hide Areas" : "Show Areas"}
      </button>

      <div
        className={`
          absolute top-4 right-4 z-10 bg-white/90 backdrop-blur px-4 py-4 rounded-lg shadow-lg max-w-xs w-full
          sm:block
          ${isVisible ? "block" : "hidden"} sm:block
        `}
      >
        <div className="flex justify-between items-center mb-2 sm:hidden">
          <h3 className="text-sm font-semibold text-gray-800">Affected Areas</h3>
          <button onClick={() => setIsVisible(false)}>
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <ul className="space-y-2">
          {affectedAreas.map((area, index) => (
            <li key={index} className="text-xs text-gray-600 flex items-center gap-3">
              <div className="relative w-5 h-5 flex items-center justify-center">
                <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-50 animate-ping"></span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f97316" className="w-5 h-5 relative">
                  <path d="M12 2 C6 2, 2 6, 2 12 s4 10, 10 10 s10 -4, 10 -10 s-4 -10, -10 -10zm0 18 c-4.418 0 -8 -3.582 -8 -8 s3.582 -8, 8 -8 s8 3.582, 8 8 s-3.582 8 -8 8zm0 -14 c-3.314 0 -6 2.686 -6 6 s2.686 6, 6 6 s6 -2.686, 6 -6 s-2.686 -6 -6 -6z"/>
                </svg>
              </div>
              <div>
                <span className="font-medium">{area.name}</span>
                <br />
                <span className="text-gray-500 text-[11px]">
                  ({area.coords[0].toFixed(4)}, {area.coords[1].toFixed(4)})
                </span>
                <br />
                {area.intensity && <span className="text-red-500 font-semibold text-[11px]">Intensity: {area.intensity}</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};