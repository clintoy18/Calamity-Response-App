import { useRef, useCallback } from "react";
import L from "leaflet";
import type { EmergencyRecord, MarkerData, Status } from "../types";
import { urgencyColors } from "../constants";
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

export const useEmergencyMarkers = (
  mapInstanceRef: React.RefObject<L.Map | null>,
  setErrorMessage: (msg: string) => void,
  setStatus: (status: Status) => void
): UseEmergencyMarkersReturn => {
  const markersRef = useRef<MarkerData[]>([]);

  // Utility function: Get marker color based on status or urgency
  const getMarkerColor = (emergency: EmergencyRecord | undefined) => {
    if (!emergency) return "#6366f1"; // default blue for temp markers

    // Only resolved is green
    if (emergency.status === "resolved") return "#10b981"; // green

    // Otherwise, color by urgency
    switch (emergency.urgencyLevel) {
      case "low":
        return "#facc15"; // yellow
      case "medium":
        return "#f97316"; // orange
      case "high":
        return "#ef4444"; // red
      case "critical":
        return "#b91c1c"; // dark red
      default:
        return "#6366f1"; // fallback blue
    }
  };

  // Utility function: Update marker icon and circle color dynamically
  const updateMarkerColor = (markerData: MarkerData, newEmergencyData: EmergencyRecord) => {
    const newColor = getMarkerColor(newEmergencyData);

    // Update marker icon
    const newIcon = createMarkerIcon(newColor);
    markerData.marker.setIcon(newIcon);

    // Update accuracy circle color
    markerData.circle.setStyle({
      color: newColor,
      fillColor: newColor,
    });

    // Update stored data
    markerData.data = newEmergencyData;
  };

  // Add a marker to the map
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

    // Determine marker color
    const color = getMarkerColor(emergencyData);

    // Create the marker icon
    const markerIcon = createMarkerIcon(color);

    const marker = L.marker([lat, lng], { icon: markerIcon });

    // Store emergency data with the marker
    // @ts-expect-error
    marker.emergencyId = id;
    // @ts-expect-error
    marker.emergencyData = emergencyData;

    // Create accuracy circle with same color
    const accuracyCircle = L.circle([lat, lng], {
      radius: accuracy,
      color: color,
      fillColor: color,
      fillOpacity: 0.1,
      weight: 2,
    }).addTo(map);

    // Create popup with dynamic content
    marker.on("click", () => {
      // @ts-expect-error
      const currentData = marker.emergencyData as EmergencyRecord | undefined;

      const popupContent = createPopupContent(lat, lng, id, currentData);

      marker.bindPopup(popupContent, { maxWidth: 300 });
      marker.openPopup();

      // Only show "Mark as Resolved" if not already resolved
      marker.once("popupopen", () => {
        if (currentData?.status !== "resolved" && currentData?.id) {
          const btn = document.getElementById(`resolve-btn-${currentData.id}`);
          if (btn) {
            btn.addEventListener("click", async () => {
              try {
                const updatedData = await updateEmergencyStatus(currentData.id, "resolved");

                const markerData = markersRef.current.find(
                  (m) => m.data.id === currentData.id
                );
                if (markerData) {
                  // Update the color to green when resolved
                  updateMarkerColor(markerData, { ...markerData.data, status: "resolved" });
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

    // Store marker data
    const markerData: MarkerData = {
      marker,
      circle: accuracyCircle,
      data: emergencyData || ({} as EmergencyRecord),
    };
    markersRef.current.push(markerData);

    // Center the map if it's a new temporary marker
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
