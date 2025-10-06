// frontend/src/utils/mapUtils.ts
import L from "leaflet";
import { urgencyColors, affectedAreas } from "../constants";
import type { EmergencyRecord } from "../types";
import { hasRole } from "./authUtils";
import { updateEmergencyStatus, unverifyEmergencyById } from "../services/api"; // Make sure deleteEmergency exists

const isResponder = hasRole("respondent");
const isAdmin = hasRole("admin");
const API_BASE = import.meta.env.VITE_API_URL;

export const createPopupContent = (
  lat: number,
  lng: number,
  id: string,
  emergencyData?: EmergencyRecord,
  respondUrl?: string
): string => {
  if (!respondUrl && emergencyData?.id) {
    respondUrl = `${API_BASE}/emergencies/${emergencyData.id}/respond`;
  }

  const urgency = emergencyData ? urgencyColors[emergencyData.urgencyLevel] : null;

  let popupContent = `
    <div style="min-width: 220px; font-family: 'Inter', sans-serif; color: #374151;">
      <div style="font-weight: 700; font-size: 16px; margin-bottom: 6px; color: #111827;">🚨 Emergency Request</div>
      <div style="font-size: 13px; color: #6b7280; line-height: 1.4;">
        <strong>ID:</strong> ${id}<br>
        <strong>Location:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}<br>
        <strong>Place:</strong> ${emergencyData?.placename || "Unknown Location"}
      </div>
  `;

  if (emergencyData) {
    popupContent += `
      <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
        <div style="font-size: 12px; margin-bottom: 6px;"><strong style="color: #374151;">Relief Items:</strong> <span style="color: #6b7280;">${emergencyData.needs.join(", ")}</span></div>
        <div style="font-size: 12px; margin-bottom: 6px;"><strong style="color: #374151;">People:</strong> <span style="color: #6b7280;">${emergencyData.numberOfPeople}</span></div>
        ${urgency ? `<div style="font-size: 12px; margin-bottom: 6px;"><strong style="color: #374151;">Urgency:</strong> <span style="background:${urgency.light}; color:${urgency.bg}; padding:2px 8px; border-radius:12px; font-weight:600; font-size:11px; margin-left:4px;">${urgency.text}</span></div>` : ""}
        ${emergencyData.contactNo ? `<div style="font-size: 12px; margin-bottom:6px;"><strong style="color:#374151;">Contact:</strong> <a href="tel:${emergencyData.contactNo}" style="color:#2563eb; margin-left:4px; text-decoration:underline;">${emergencyData.contactNo}</a></div>` : ""}
        ${emergencyData.status ? `<div style="font-size:12px; margin-bottom:6px;"><strong style="color:#374151;">Status:</strong> <span style="color:#6b7280; text-transform:capitalize; margin-left:4px;">${emergencyData.status}</span></div>` : ""}
        ${emergencyData.additionalNotes ? `<div style="font-size:12px; margin-top:8px; padding-top:8px; border-top:1px solid #e5e7eb;"><strong style="color:#374151;">Notes:</strong> <span style="color:#6b7280;">${emergencyData.additionalNotes}</span></div>` : ""}
        ${emergencyData.createdAt ? `<div style="font-size:11px; margin-top:8px; color:#9ca3af;"><strong>Created:</strong> ${new Date(emergencyData.createdAt).toLocaleString()}</div>` : ""}
      </div>

      <!-- Navigation Buttons -->
      <div style="margin-top:12px; padding-top:12px; border-top:1px solid #e5e7eb; display:flex; gap:8px;">
        <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:8px 12px; background:#3b82f6; color:white; text-decoration:none; border-radius:6px; font-size:12px; font-weight:600;">Google Maps</a>
        <a href="https://waze.com/ul?ll=${lat},${lng}&navigate=yes" target="_blank" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:8px 12px; background:#10b981; color:white; text-decoration:none; border-radius:6px; font-size:12px; font-weight:600;">Waze</a>
      </div>
    `;

    // Buttons for responders only
    if (isResponder) {
      popupContent += `<div style="margin-top:10px; display:flex; flex-direction:column; gap:6px;">`;

      if (emergencyData.status === "pending" && emergencyData.id) {
        popupContent += `<button id="resolve-btn-${emergencyData.id}" style="padding:6px 12px; background:#f59e0b; color:white; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; width:100%;">Mark as Resolved</button>`;
        setTimeout(() => {
          const btn = document.getElementById(`resolve-btn-${emergencyData.id}`);
          if (btn) btn.addEventListener("click", async () => {
            try {
              await unverifyEmergencyById(emergencyData.id);
              alert("Emergency marked as resolved");
              location.reload();
            } catch {
              alert("Failed to update status");
            }
          });
        }, 0);
      }

      popupContent += `</div>`;
    }

    // Delete button for admins only
    if (isAdmin && emergencyData.id) {
      popupContent += `<button id="delete-btn-${emergencyData.id}" style="margin-top:6px; padding:6px 12px; background:#ef4444; color:white; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; width:100%;">Delete Emergency</button>`;
      setTimeout(() => {
        const deleteBtn = document.getElementById(`delete-btn-${emergencyData.id}`);
        if (deleteBtn) deleteBtn.addEventListener("click", async () => {
          if (!confirm("Are you sure you want to delete this emergency?")) return;
          try {
            await unverifyEmergencyById(emergencyData.id);
            alert("Emergency deleted successfully");
            location.reload();
          } catch {
            alert("Failed to delete emergency");
          }
        });
      }, 0);
    }

    // ✅ View Donation Details for everyone if resolved
    if (emergencyData.status === "resolved" && emergencyData.id) {
      popupContent += `<a href="#" target="_blank" style="margin-top:6px; padding:6px 12px; background:#3b82f6; color:white; border:none; border-radius:6px; font-size:12px; font-weight:600; text-decoration:none; display:flex; justify-content:center; width:100%;"> View Donation Details</a>`;
    }
  }

  popupContent += `</div>`;

  return popupContent;
};

export const createMarkerIcon = (color: string): L.DivIcon => {
  return L.divIcon({
    html: `<div style="background: ${color}; width:32px; height:32px; border-radius:50%; border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center;"><div style="color:white; font-size:16px;">📍</div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    className: "",
  });
};

export const addAffectedAreaMarkers = (map: L.Map): void => {
  affectedAreas.forEach((area) => {
    const [lat, lng] = area.coords;
    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        html: `
        <div style="position: relative; width:32px; height:32px; display:flex; align-items:center; justify-content:center;">
          <span style="position:absolute; width:100%; height:100%; background:#f97316; border-radius:50%; opacity:0.5; animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;"></span>
          <div style="width:16px; height:16px; border-radius:50%; background:#f97316; border:2px solid white; display:flex; align-items:center; justify-content:center;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="white"><path d="M12 2 C6 2, 2 6, 2 12 s4 10, 10 10 s10 -4, 10 -10 s-4 -10, -10 -10zm0 18 c-4.418 0 -8 -3.582 -8 -8 s3.582 -8, 8 -8 s8 3.582, 8 8 s-3.582 8 -8 8zm0 -14 c-3.314 0 -6 2.686 -6 6 s2.686 6, 6 6 s6 -2.686, 6 -6 s-2.686 -6 -6 -6z"/></svg>
          </div>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
        className: "",
      }),
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-weight:bold; font-size:14px;">Earthquake Affected Area</div>
      <div style="font-size:12px; color:#6b7280;">${area.name}</div>
    `);
  });
};
