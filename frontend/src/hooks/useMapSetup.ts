import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CEBU_CENTER } from "../constants";
import { addAffectedAreaMarkers } from "../utils/mapUtils";

interface UseMapSetupReturn {
  mapRef: React.RefObject<HTMLDivElement | null>;
  mapInstanceRef: React.MutableRefObject<L.Map | null>;
  flyToLocation: (coords: [number, number], zoom?: number) => void;
}

export const useMapSetup = (): UseMapSetupReturn => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [0, 0],
      zoom: 1,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      worldCopyJump: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    map.flyTo(CEBU_CENTER, 12, {
      duration: 2,
      easeLinearity: 0.2,
    });

    addAffectedAreaMarkers(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const flyToLocation = (coords: [number, number], zoom = 12) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, zoom, {
        duration: 2,
        easeLinearity: 0.2,
      });
    }
  };

  return { mapRef, mapInstanceRef, flyToLocation };
};
