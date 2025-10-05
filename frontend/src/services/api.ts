import { API_URL } from "../constants";
import type { Location, NeedType } from "../types";
import axios from "axios";

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
  contactNo?: string;
  contactno?: string;
  placename?: string;
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
  throw new Error("Failed to fetch emergencies");
};

export const submitEmergency = async (
  location: Location,
  placeName: string,
  contactNo: string,
  selectedNeeds: NeedType[],
  numberOfPeople: number,
  urgencyLevel: string,
  additionalNotes: string,
  emergencyDocument: File | null
): Promise<ApiResponse<EmergencyApiData>> => {
  const formData = new FormData();

  // Append all fields to FormData
  formData.append("latitude", location.latitude.toString());
  formData.append("longitude", location.longitude.toString());
  formData.append("placename", placeName);
  formData.append("contactno", contactNo);
  formData.append("accuracy", location.accuracy.toString());
  formData.append("needs", JSON.stringify(selectedNeeds));
  formData.append("numberOfPeople", numberOfPeople.toString());
  formData.append("urgencyLevel", urgencyLevel.toUpperCase());
  formData.append("additionalNotes", additionalNotes || "");

  // Append the file
  if (emergencyDocument) {
    formData.append("imageVerification", emergencyDocument);
  }

  try {
    const response = await axios.post<ApiResponse<EmergencyApiData>>(
      `${API_URL}/emergencies`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "Failed to submit request"
      );
    }
    throw new Error("Failed to submit request");
  }
};

// ✅ Update emergency status (e.g., mark as resolved)
export const updateEmergencyStatus = async (
  id: string,
  status: "pending" | "resolved"
): Promise<ApiResponse<EmergencyApiData>> => {
  const token = localStorage.getItem("token"); // include auth token if needed
  const response = await fetch(`${API_URL}/emergencies/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  console.log("API URL:", `${API_URL}/emergencies/${id}`);

  const data: ApiResponse<EmergencyApiData> = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update emergency status");
  }

  return data;
};
