import type * as L from "leaflet";

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export type Status = "idle" | "loading" | "form" | "success" | "error";

export type NeedType =
  | "food"
  | "water"
  | "medical"
  | "shelter"
  | "clothing"
  | "other";

export interface EmergencyRequest {
  needs: NeedType[];
  numberOfPeople: number;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  additionalNotes: string;
  contactNo?: string;
}

export interface EmergencyRecord extends Location, EmergencyRequest {
  id: string;
  status?: "pending" | "in-progress" | "responded";
  createdAt?: string;
  updatedAt?: string;
  placename?: string;
}

export interface EmergencyApiData {
  id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
  createdAt?: string;
  updatedAt?: string;
  needs?: string;
  numberOfPeople?: number;
  urgencyLevel?: string;
  additionalNotes?: string;
  status?: string;
  contactNo?: string;
  contactno?: string;
  placename?: string;
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
  dark?: string; // optional

}

export type AshfallLevel = "LIGHT" | "MODERATE" | "HEAVY";
export type AshfallVisibility = "CLEAR" | "HAZY" | "LOW" | "DANGEROUS";
export type AshfallStatus = "unverified" | "verified" | "archived";

export interface AshfallReport {
  _id?: string;
  id: string;
  latitude: number;
  longitude: number;
  placename: string;
  accuracy: number;
  timestamp?: string;
  ashLevel: AshfallLevel;
  visibility: AshfallVisibility;
  sulfurSmell: boolean;
  needs: string[];
  contactno?: string;
  reporterName?: string;
  additionalNotes?: string;
  status: AshfallStatus;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AshfallReportPayload {
  latitude: number;
  longitude: number;
  placename: string;
  accuracy: number;
  ashLevel: AshfallLevel;
  visibility: AshfallVisibility;
  sulfurSmell: boolean;
  needs: string[];
  contactno?: string;
  reporterName?: string;
  additionalNotes?: string;
}

export interface VolcanoAdvisory {
  _id?: string;
  id: string;
  volcanoName: string;
  title: string;
  alertLevel?: string;
  sourceName: string;
  sourceUrl?: string;
  affectedAreas: string[];
  summary: string;
  instructions: string[];
  status: "active" | "expired";
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VolcanoAdvisoryPayload {
  volcanoName?: string;
  title: string;
  alertLevel?: string;
  sourceName: string;
  sourceUrl?: string;
  affectedAreas: string[];
  summary: string;
  instructions: string[];
}


export interface Respondent {
  id: string;
  fullName: string;
  email: string;
  contactNo: string;
  isVerified: boolean;
  notes?: string;
}
