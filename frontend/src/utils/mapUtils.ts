// frontend/src/utils/mapUtils.ts
import L from "leaflet";
import { urgencyColors, affectedAreas } from "../constants";
import type { EmergencyRecord } from "../types";
import { hasRole } from "./authUtils";
import { unverifyEmergencyById, updateEmergencyStatus } from "../services/api";
import "leaflet.markercluster";

const API_BASE = import.meta.env.VITE_API_URL;

// Add Lucide icons CDN
const LUCIDE_ICONS = {
  alert: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  mapPin: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  package: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
  users: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  phone: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  fileText: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
  clock: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  checkCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  navigation: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
  trash: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
  eye: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
};

// Add global type declarations
declare global {
  interface Window {
    handleResolveEmergency: (id: string) => Promise<void>;
    handleDeleteEmergency: (id: string) => Promise<void>;
    refreshEmergencies?: () => Promise<void>;
    handleLogout?: () => void;
  }
}

// Initialize global handlers
if (typeof window !== 'undefined') {
  window.handleResolveEmergency = async (id: string) => {
    const confirmAction = confirm(
      "Are you sure you want to mark this emergency as resolved?"
    );
    if (!confirmAction) return;

    try {
      await updateEmergencyStatus(id, "resolved");
      alert("Emergency marked as resolved ✅");
      
      if (window.refreshEmergencies) {
        await window.refreshEmergencies();
      }
    } catch (error) {
      console.error("Failed to resolve emergency:", error);
      alert("❌ Failed to update status");
    }
  };

  window.handleDeleteEmergency = async (id: string) => {
    if (!confirm("Are you sure you want to delete this emergency?")) return;
    
    try {
      await unverifyEmergencyById(id);
      alert("Emergency deleted successfully");
      
      if (window.refreshEmergencies) {
        await window.refreshEmergencies();
      }
    } catch (error) {
      console.error("Failed to delete emergency:", error);
      alert("Failed to delete emergency");
    }
  };
}

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

  const isResponder = hasRole("respondent");
  const isAdmin = hasRole("admin");

  const urgency = emergencyData
    ? urgencyColors[emergencyData.urgencyLevel]
    : null;

  let popupContent = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 10px; margin: -12px -12px 10px -12px; border-radius: 8px 8px 0 0;">
        <div style="display: flex; align-items: center; gap: 6px; color: white;">
          <span style="display: flex;">${LUCIDE_ICONS.alert}</span>
          <div>
            <div style="font-weight: 700; font-size: 13px; line-height: 1.2;">Emergency</div>
            <div style="font-size: 10px; opacity: 0.9; margin-top: 1px;">ID: ${id}</div>
          </div>
        </div>
      </div>

      <!-- Location -->
      <div style="background: #f9fafb; padding: 8px; border-radius: 4px; margin-bottom: 8px; font-size: 11px;">
        <div style="display: grid; grid-template-columns: 16px 1fr; gap: 6px; align-items: start;">
          <span style="color: #6b7280; display: flex;">${LUCIDE_ICONS.mapPin}</span>
          <div>
            <div style="font-weight: 600; color: #374151; margin-bottom: 1px;">${emergencyData?.placename || "Unknown Location"}</div>
            <div style="color: #9ca3af; font-size: 10px;">${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
          </div>
        </div>
      </div>
  `;

  if (emergencyData) {
    // Main Info Grid
    popupContent += `
      <div style="display: grid; gap: 6px; margin-bottom: 8px; font-size: 11px;">
    `;

    // Relief Items
    popupContent += `
        <div style="display: grid; grid-template-columns: 16px 1fr; gap: 6px; align-items: start;">
          <span style="color: #6b7280; display: flex;">${LUCIDE_ICONS.package}</span>
          <div>
            <div style="font-weight: 600; color: #374151;">Items</div>
            <div style="color: #6b7280;">${emergencyData.needs.join(", ")}</div>
          </div>
        </div>
    `;

    // People & Urgency in 2 columns
    popupContent += `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div style="display: grid; grid-template-columns: 16px 1fr; gap: 4px; align-items: start;">
            <span style="color: #6b7280; display: flex;">${LUCIDE_ICONS.users}</span>
            <div>
              <div style="font-weight: 600; color: #374151;">People</div>
              <div style="color: #6b7280;">${emergencyData.numberOfPeople}</div>
            </div>
          </div>
    `;

    if (urgency) {
      popupContent += `
          <div style="display: grid; grid-template-columns: 16px 1fr; gap: 4px; align-items: start;">
            <span style="color: #6b7280; display: flex;">${LUCIDE_ICONS.alert}</span>
            <div>
              <div style="font-weight: 600; color: #374151;">Urgency</div>
              <div style="background: ${urgency.light}; color: ${urgency.bg}; padding: 2px 6px; border-radius: 8px; font-weight: 600; font-size: 10px; display: inline-block;">${urgency.text}</div>
            </div>
          </div>
      `;
    } else {
      popupContent += `<div></div>`;
    }

    popupContent += `
        </div>
    `;

    // Contact
    if (emergencyData.contactNo) {
      popupContent += `
        <div style="display: grid; grid-template-columns: 16px 1fr; gap: 6px; align-items: start;">
          <span style="color: #6b7280; display: flex;">${LUCIDE_ICONS.phone}</span>
          <div>
            <div style="font-weight: 600; color: #374151;">Contact</div>
            <a href="tel:${emergencyData.contactNo}" style="color: #2563eb; text-decoration: none;">${emergencyData.contactNo}</a>
          </div>
        </div>
      `;
    }

    // Status
    if (emergencyData.status) {
      const statusColor = emergencyData.status === 'resolved' ? '#10b981' : emergencyData.status === 'pending' ? '#f59e0b' : '#6b7280';
      const statusIcon = emergencyData.status === 'resolved' ? LUCIDE_ICONS.checkCircle : LUCIDE_ICONS.clock;
      
      popupContent += `
        <div style="display: grid; grid-template-columns: 16px 1fr; gap: 6px; align-items: start;">
          <span style="color: ${statusColor}; display: flex;">${statusIcon}</span>
          <div>
            <div style="font-weight: 600; color: #374151;">Status</div>
            <div style="color: ${statusColor}; text-transform: capitalize; font-weight: 600;">${emergencyData.status}</div>
          </div>
        </div>
      `;
    }

    popupContent += `
      </div>
    `;

    // Additional Notes (Full Width)
    if (emergencyData.additionalNotes) {
      popupContent += `
        <div style="display: grid; grid-template-columns: 16px 1fr; gap: 6px; align-items: start; margin-bottom: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 11px;">
          <span style="color: #6b7280; display: flex;">${LUCIDE_ICONS.fileText}</span>
          <div>
            <div style="font-weight: 600; color: #374151;">Notes</div>
            <div style="color: #6b7280; line-height: 1.3;">${emergencyData.additionalNotes}</div>
          </div>
        </div>
      `;
    }

    // Timestamp
    if (emergencyData.createdAt) {
      popupContent += `
        <div style="display: grid; grid-template-columns: 16px 1fr; gap: 6px; align-items: start; margin-bottom: 8px; padding-top: 6px; border-top: 1px solid #e5e7eb; font-size: 10px;">
          <span style="color: #9ca3af; display: flex;">${LUCIDE_ICONS.clock}</span>
          <div style="color: #9ca3af;">${new Date(emergencyData.createdAt).toLocaleString()}</div>
        </div>
      `;
    }

    // Navigation Buttons
    popupContent += `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
        <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" 
           style="display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 12px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 600; transition: background 0.2s;">
          ${LUCIDE_ICONS.navigation}
          <span>Google Maps</span>
        </a>
        <a href="https://waze.com/ul?ll=${lat},${lng}&navigate=yes" target="_blank" 
           style="display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 12px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 600; transition: background 0.2s;">
          ${LUCIDE_ICONS.navigation}
          <span>Waze</span>
        </a>
      </div>
    `;

    // Action Buttons for Responders
    if (isResponder && emergencyData.status === "pending" && emergencyData.id) {
      popupContent += `
        <button 
          onclick="handleResolveEmergency('${emergencyData.id}')"
          style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 12px; background: #f59e0b; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; margin-bottom: 8px; transition: background 0.2s;">
          ${LUCIDE_ICONS.checkCircle}
          <span>Mark as Resolved</span>
        </button>
      `;
    }

    // Delete Button for Admins
    if (isAdmin && emergencyData.id) {
      popupContent += `
        <button 
          onclick="handleDeleteEmergency('${emergencyData.id}')"
          style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; margin-bottom: 8px; transition: background 0.2s;">
          ${LUCIDE_ICONS.trash}
          <span>Delete Emergency</span>
        </button>
      `;
    }

    // View Donation Details
    if (emergencyData.status === "resolved" && emergencyData.id) {
      popupContent += `
        <a href="#" target="_blank" 
           style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 12px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 600; transition: background 0.2s;">
          ${LUCIDE_ICONS.eye}
          <span>View Donation Details</span>
        </a>
      `;
    }
  }

  popupContent += `</div>`;

  return popupContent;
};

export const createMarkerIcon = (color: string): L.DivIcon => {
  return L.divIcon({
    html: `
      <div style="
        background:${color};
        width:26px;
        height:26px;
        border-radius:50%;
        border:3px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <div style="color:white; font-size:14px; line-height:1;">📍</div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
    className: "",
  });
};

export const addAffectedAreaMarkers = (map: L.Map): void => {
  const markerCluster = L.markerClusterGroup({
    maxClusterRadius: 60,
    spiderfyOnEveryZoom: false,
    disableClusteringAtZoom: 12,
  });

  affectedAreas.forEach((area) => {
    const [lat, lng] = area.coords;
    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        html: `
          <div style="position: relative; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">
            <span style="position:absolute; width:100%; height:100%; background:#f97316; border-radius:50%; opacity:0.5; animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;"></span>
            <div style="width:14px; height:14px; border-radius:50%; background:#f97316; border:2px solid white; display:flex; align-items:center; justify-content:center;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="10" height="10" fill="white"><path d="M12 2C6 2 2 6 2 12s4 10 10 10 10-4 10-10S18 2 12 2z"/></svg>
            </div>
          </div>`,
        iconSize: [28, 28],
        iconAnchor: [10, 10],
        popupAnchor: [0, -12],
        className: "",
      }),
    });

    marker.bindPopup(`
      <div style="font-weight:bold; font-size:14px;">Earthquake Affected Area</div>
      <div style="font-size:12px; color:#6b7280;">${area.name}</div>
    `);

    markerCluster.addLayer(marker);
  });

  map.addLayer(markerCluster);
};