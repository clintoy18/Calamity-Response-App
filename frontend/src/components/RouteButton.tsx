import React from 'react';
import { Navigation } from 'lucide-react';

interface RouteButtonProps {
  lat: number;
  lng: number;
  emergencyId: string;
}

export const RouteButton: React.FC<RouteButtonProps> = ({ lat, lng, emergencyId }) => {
  const handleGetDirections = () => {
    // Option 1: Google Maps (most popular)
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    
    // Option 2: Waze
    // const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    
    // Option 3: Apple Maps
    // const appleMapsUrl = `http://maps.apple.com/?daddr=${lat},${lng}`;
    
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <button
      onClick={handleGetDirections}
      className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
    >
      <Navigation className="w-4 h-4" />
      Get Directions
    </button>
  );
};