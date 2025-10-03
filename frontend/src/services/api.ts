import { API_URL } from '../constants';
import type { Location, NeedType } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface EmergencyApiData {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp?: string;
  needs: NeedType[];
  numberOfPeople: number;
  urgencyLevel: string;
  additionalNotes?: string;
  contactno?: string;
  contactPerson?: string;
  placeName?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const fetchEmergencies = async (): Promise<EmergencyApiData[]> => {
  const response = await fetch(`${API_URL}/emergencies`);
  const data: ApiResponse<EmergencyApiData[]> = await response.json();
  
  if (data.success && data.data) {
    return data.data;
  }
  throw new Error('Failed to fetch emergencies');
};

export const submitEmergency = async (
  location: Location,
  placeName: string,
  contactNo: string,
  contactName: string, // new
  selectedNeeds: NeedType[],
  numberOfPeople: number,
  urgencyLevel: string,
  additionalNotes: string
): Promise<ApiResponse<EmergencyApiData>> => {
  const response = await fetch(`${API_URL}/emergencies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      placename: placeName,
      contactno: contactNo,
      contactPerson: contactName,          // send contactName
      needs: selectedNeeds,
      numberOfPeople,
      urgencyLevel: urgencyLevel.toUpperCase(),
      additionalNotes: additionalNotes || null,
    }),
  });

  const data: ApiResponse<EmergencyApiData> = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit request');
  }

  return data;
};
