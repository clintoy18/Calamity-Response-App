import { useRef, useCallback } from 'react';
import L from 'leaflet';
import type { EmergencyRecord, MarkerData, Status } from '../types';
import { urgencyColors } from '../constants';
import { 
  createMarkerIcon, 
  createPopupContent
} from '../utils/mapUtils';

interface UseEmergencyMarkersReturn {
  addEmergencyMarker: (
    lat: number,
    lng: number,
    accuracy: number,
    id: string,
    emergencyData?: EmergencyRecord
  ) => boolean;
  removeTempMarker: () => void;
  markersRef: React.MutableRefObject<MarkerData[]>;
}

export const useEmergencyMarkers = (
  mapInstanceRef: React.RefObject<L.Map | null>,
  setErrorMessage: (msg: string) => void,
  setStatus: (status: Status) => void
): UseEmergencyMarkersReturn => {
  const markersRef = useRef<MarkerData[]>([]);

  const addEmergencyMarker = useCallback((
    lat: number,
    lng: number,
    accuracy: number,
    id: string,
    emergencyData?: EmergencyRecord
  ): boolean => {
    if (!mapInstanceRef.current) return false;

    const map = mapInstanceRef.current;

    const color = emergencyData ? urgencyColors[emergencyData.urgencyLevel].bg : '#6366f1';
    const userIcon = createMarkerIcon(color);
    const popupContent = createPopupContent(lat, lng, id, emergencyData);

    const marker = L.marker([lat, lng], { icon: userIcon })
      .bindPopup(popupContent, { maxWidth: 300 })
      .addTo(map);

    const accuracyCircle = L.circle([lat, lng], {
      radius: accuracy,
      color: color,
      fillColor: color,
      fillOpacity: 0.1,
      weight: 2,
    }).addTo(map);

    const markerData: MarkerData = { 
      marker, 
      circle: accuracyCircle, 
      data: emergencyData || {} as EmergencyRecord 
    };
    markersRef.current.push(markerData);

    if (!emergencyData?.createdAt) {
      map.setView([lat, lng], 15, { animate: true });
    }

    return true;
  }, [mapInstanceRef, setErrorMessage, setStatus]);

  const removeTempMarker = useCallback((): void => {
    if (markersRef.current.length > 0) {
      const tempMarkerIndex = markersRef.current.findIndex(m => m.data.id?.includes('TEMP'));
      if (tempMarkerIndex !== -1) {
        const tempMarker = markersRef.current[tempMarkerIndex];
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(tempMarker.marker);
          mapInstanceRef.current.removeLayer(tempMarker.circle);
        }
        markersRef.current.splice(tempMarkerIndex, 1);
      }
    }
  }, [mapInstanceRef]);

  return { addEmergencyMarker, removeTempMarker, markersRef };
};