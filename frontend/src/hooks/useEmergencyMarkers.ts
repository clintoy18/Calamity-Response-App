// src/hooks/useEmergencyMarkers.ts
import { useRef, useCallback } from "react";
import L from "leaflet";
import type { EmergencyRecord, MarkerData } from "../types";
import { createMarkerIcon, createPopupContent } from "../utils/mapUtils";
import { updateEmergencyStatus } from "../services/api";

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

// Extend Leaflet Marker to store emergency data
interface EmergencyMarker extends L.Marker {
  emergencyData?: EmergencyRecord;
  emergencyId?: string;
}

export const useEmergencyMarkers = (
  mapInstanceRef: React.RefObject<L.Map | null>
): UseEmergencyMarkersReturn => {
  const markersRef = useRef<MarkerData[]>([]);

  // Utility function: Get marker color based on status or urgency
  const getMarkerColor = (emergency: EmergencyRecord | undefined) => {
    if (!emergency) return "#6366f1"; // default blue for temp markers

    if (emergency.status === "resolved") return "#10b981"; // green

    switch (emergency.urgencyLevel) {
      case "low":
        return "#facc15";
      case "medium":
        return "#f97316";
      case "high":
        return "#ef4444";
      case "critical":
        return "#b91c1c";
      default:
        return "#6366f1";
    }
  };

  // Update marker icon and circle color
  const updateMarkerColor = (
    markerData: MarkerData,
    newEmergencyData: EmergencyRecord
  ) => {
    const newColor = getMarkerColor(newEmergencyData);

    markerData.marker.setIcon(createMarkerIcon(newColor));
    markerData.circle.setStyle({
      color: newColor,
      fillColor: newColor,
    });

    markerData.data = newEmergencyData;
  };

  // Add emergency marker
  const addEmergencyMarker = useCallback(
    (
      lat: number,
      lng: number,
      accuracy: number,
      id: string,
      emergencyData?: EmergencyRecord
    ): boolean => {
      if (!mapInstanceRef.current) return false;

      const map = mapInstanceRef.current;
      const color = getMarkerColor(emergencyData);
      const markerIcon = createMarkerIcon(color);

      const marker: EmergencyMarker = L.marker([lat, lng], {
        icon: markerIcon,
      }) as EmergencyMarker;

      // Attach custom properties
      marker.emergencyData = emergencyData;
      marker.emergencyId = id;

      const accuracyCircle = L.circle([lat, lng], {
        radius: accuracy,
        color: color,
        fillColor: color,
        fillOpacity: 0.1,
        weight: 2,
      }).addTo(map);

      marker.on("click", () => {
        const currentData = marker.emergencyData;
        const popupContent = createPopupContent(lat, lng, id, currentData);
        marker.bindPopup(popupContent, { maxWidth: 300 });
        marker.openPopup();

        marker.once("popupopen", () => {
          if (currentData?.status !== "resolved" && currentData?.id) {
            const btn = document.getElementById(
              `resolve-btn-${currentData.id}`
            );
            if (btn) {
              btn.addEventListener("click", async () => {
                const confirmed = confirm(
                  "Are you sure you want to mark this emergency as resolved?"
                );
                if (!confirmed) return;

                try {
                  const updatedData = await updateEmergencyStatus(
                    currentData.id,
                    "resolved"
                  );
                  console.log(updatedData);

                  const markerData = markersRef.current.find(
                    (m) => m.data.id === currentData.id
                  );
                  if (markerData) {
                    updateMarkerColor(markerData, {
                      ...markerData.data,
                      status: "resolved",
                    });
                  }

                  alert("Marked as resolved");
                  marker.closePopup();
                } catch (err) {
                  console.error(err);
                  alert("Failed to update status");
                }
              });
            }
          }
        });
      });

      marker.addTo(map);

      const markerData: MarkerData = {
        marker,
        circle: accuracyCircle,
        data: emergencyData || ({} as EmergencyRecord),
      };
      markersRef.current.push(markerData);

      if (!emergencyData?.createdAt) {
        map.setView([lat, lng], 15, { animate: true });
      }

      return true;
    },
    [mapInstanceRef]
  );

  // Remove temporary marker
  const removeTempMarker = useCallback((): void => {
    if (markersRef.current.length > 0) {
      const tempMarkerIndex = markersRef.current.findIndex((m) =>
        m.data.id?.includes("TEMP")
      );
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
