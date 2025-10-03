import type * as L from 'leaflet';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export type Status = 'idle' | 'loading' | 'form' | 'success' | 'error';

export type NeedType = 'food' | 'water' | 'medical' | 'shelter' | 'clothing' | 'other';

export interface EmergencyRequest {
  needs: NeedType[];
  numberOfPeople: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  additionalNotes: string;
  contactNo?: string;
  contactPerson?: string;
}

export interface EmergencyRecord extends Location, EmergencyRequest {
  id: string;
  status?: 'pending' | 'responded' | 'resolved';
  createdAt?: string;
  updatedAt?: string;
  placeName?: string;
}

export interface AffectedArea {
  name: string;
  coords: [number, number];
  intensity: string;
}

export interface MarkerData {
  marker: L.Marker;
  circle: L.Circle;
  data: EmergencyRecord;
}

export interface NeedOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export interface UrgencyColor {
  bg: string;
  text: string;
  light: string;
}