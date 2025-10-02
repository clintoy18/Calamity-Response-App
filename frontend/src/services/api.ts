import { API_URL } from '../constants';
import type { EmergencyRecord, Location, NeedType } from '../types';

export const fetchEmergencies = async (): Promise<any[]> => {
  const response = await fetch(`${API_URL}/emergencies`);
  const data = await response.json();
  
  if (data.success && data.data) {
    return data.data;
  }
  throw new Error('Failed to fetch emergencies');
};

export const submitEmergency = async (
  location: Location,
  placeName: string,
  contactNo: string,
  selectedNeeds: NeedType[],
  numberOfPeople: number,
  urgencyLevel: string,
  additionalNotes: string
) => {
  const response = await fetch(`${API_URL}/emergencies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      latitude: location.latitude,
      longitude: location.longitude,
      placename: placeName,
      contactno: contactNo,
      accuracy: location.accuracy,
      needs: selectedNeeds,
      numberOfPeople,
      urgencyLevel: urgencyLevel.toUpperCase(),
      additionalNotes: additionalNotes || null,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit request');
  }

  return data;
};

export const clearAllEmergencies = async (): Promise<void> => {
  const response = await fetch(`${API_URL}/emergencies`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to clear emergencies');
  }
};