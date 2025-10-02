import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CEBU_CENTER, CEBU_BOUNDS } from '../constants';
import { addAffectedAreaMarkers } from '../utils/mapUtils';

export const useMapSetup = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [0, 0],
      zoom: 1,
      maxBounds: CEBU_BOUNDS,
      maxBoundsViscosity: 1.0,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: true,
      worldCopyJump: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    mapInstanceRef.current.flyTo(CEBU_CENTER, 12, { duration: 2, easeLinearity: 0.2 });
    
    addAffectedAreaMarkers(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return { mapRef, mapInstanceRef };
};