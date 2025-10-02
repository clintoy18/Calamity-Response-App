// frontend/src/utils/mapUtils.ts
import L from 'leaflet';
import { urgencyColors, affectedAreas } from '../constants';
import type { EmergencyRecord } from '../types';

/**
 * Create popup content for an emergency marker
 */
export const createPopupContent = (
  lat: number,
  lng: number,
  id: string,
  emergencyData?: EmergencyRecord
): string => {
  let popupContent = `
    <div style="min-width: 200px;">
      <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #1f2937;">Emergency Request</div>
      <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
        <strong>ID:</strong> ${id}<br>
        <strong>Location:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}<br>
        ${emergencyData?.placeName ? `<strong>Place:</strong> ${emergencyData.placeName}<br>` : ''}
      </div>
  `;

  if (emergencyData) {
    popupContent += `
      <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
        <div style="font-size: 12px; margin-bottom: 6px;">
          <strong style="color: #374151;">Relief Items:</strong><br>
          <span style="color: #6b7280;">${emergencyData.needs.join(', ')}</span>
        </div>
        <div style="font-size: 12px; margin-bottom: 6px;">
          <strong style="color: #374151;">People:</strong> 
          <span style="color: #6b7280;">${emergencyData.numberOfPeople}</span>
        </div>
        <div style="font-size: 12px; margin-bottom: 6px;">
          <strong style="color: #374151;">Urgency:</strong>
          <span style="background: ${urgencyColors[emergencyData.urgencyLevel].light}; color: ${urgencyColors[emergencyData.urgencyLevel].bg}; padding: 2px 8px; border-radius: 12px; font-weight: 600; font-size: 11px; margin-left: 4px;">
            ${urgencyColors[emergencyData.urgencyLevel].text}
          </span>
        </div>
      ${emergencyData.contactNo ? `
        <div style="font-size: 12px; margin-bottom: 6px;">
          <strong style="color: #374151;">Contact:</strong>
          <a href="tel:${emergencyData.contactNo}" style="color: #2563eb; margin-left: 4px; text-decoration: underline;">
            ${emergencyData.contactNo}
          </a>
        </div>
      ` : ''}
        ${emergencyData.status ? `
          <div style="font-size: 12px; margin-bottom: 6px;">
            <strong style="color: #374151;">Status:</strong>
            <span style="color: #6b7280; text-transform: capitalize; margin-left: 4px;">
              ${emergencyData.status}
            </span>
          </div>
        ` : ''}
        ${emergencyData.additionalNotes ? `
          <div style="font-size: 12px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <strong style="color: #374151;">Notes:</strong><br>
            <span style="color: #6b7280;">${emergencyData.additionalNotes}</span>
          </div>
        ` : ''}
        ${emergencyData.createdAt ? `
          <div style="font-size: 11px; margin-top: 8px; color: #9ca3af;">
            <strong>Created:</strong> ${new Date(emergencyData.createdAt).toLocaleString()}
          </div>
        ` : ''}
      </div>
      
      <!-- Add Navigation Buttons -->
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px;">
        <a 
          href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" 
          target="_blank"
          style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 12px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 600; transition: background 0.2s;"
          onmouseover="this.style.background='#2563eb'"
          onmouseout="this.style.background='#3b82f6'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
          Google Maps
        </a>
        <a 
          href="https://waze.com/ul?ll=${lat},${lng}&navigate=yes" 
          target="_blank"
          style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 12px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 600; transition: background 0.2s;"
          onmouseover="this.style.background='#059669'"
          onmouseout="this.style.background='#10b981'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
          Waze
        </a>
      </div>
    `;
  } else {
    // For non-emergency markers (like manual pin), still show navigation
    popupContent += `
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
        <a 
          href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" 
          target="_blank"
          style="display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 12px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 600; transition: background 0.2s;"
          onmouseover="this.style.background='#2563eb'"
          onmouseout="this.style.background='#3b82f6'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
          Get Directions
        </a>
      </div>
    `;
  }

  popupContent += `</div>`;
  return popupContent;
};

/**
 * Create a colored marker icon
 */
export const createMarkerIcon = (color: string): L.DivIcon => {
  return L.divIcon({
    html: `<div style="background: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <div style="color: white; font-size: 16px;">📍</div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    className: '',
  });
};

/**
 * Add affected area markers for reference
 */
export const addAffectedAreaMarkers = (map: L.Map): void => {
  affectedAreas.forEach(area => {
    const [lat, lng] = area.coords;

    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <span style="
            position: absolute;
            display: block;
            width: 100%;
            height: 100%;
            background: #f97316;
            border-radius: 50%;
            opacity: 0.5;
            animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></span>
          <div style="
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #f97316;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="white">
              <path d="M12 2 C6 2, 2 6, 2 12 s4 10, 10 10 s10 -4, 10 -10 s-4 -10, -10 -10zm0 18 c-4.418 0 -8 -3.582 -8 -8 s3.582 -8, 8 -8 s8 3.582, 8 8 s-3.582 8 -8 8zm0 -14 c-3.314 0 -6 2.686 -6 6 s2.686 6, 6 6 s6 -2.686, 6 -6 s-2.686 -6 -6 -6z"/>
            </svg>
          </div>
        </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
        className: '',
      }),
    }).addTo(map);

    marker.bindPopup(`
      <div style="font-weight:bold; font-size:14px;">Earthquake Affected Area</div>
      <div style="font-size:12px; color:#6b7280;">${area.name}</div>
    `);
  });
};

/**
 * Check if a coordinate is inside Cebu bounds
 */
// export const isInCebu = (lat: number, lng: number): boolean => {
//   return lat >= 9.55 && lat <= 11.35 && lng >= 123.35 && lng <= 124.65;
// };
