// hooks/queries/adminHooks.ts
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/authService";
import { useMutation, useQueryClient } from "@tanstack/react-query";


// -------------------
// Types
// -------------------
export interface IUser {
  _id: string;
  email: string;
  fullName: string;
  contactNo?: string;
  verificationDocument?: string;
  role?: string;
  notes?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  status: "Pending" | "In Progress" | "Resolved";
}


export interface IEmergency {
  _id: string;
  id: string;
  latitude: number;
  longitude: number;
  placename: string;
  contactno?: string;
  accuracy: number;
  timestamp: string;
  needs: string[];
  numberOfPeople: number;
  urgencyLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  additionalNotes?: string;
  status: "pending" | "in-progress" | "resolved";
  isVerified: boolean;
  imageVerification: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: T[];
}

export interface CityCount {
  city: string;
  count: number;
}

// -------------------
// Responders Hooks (Polling Enabled)
// -------------------
export const useFetchResponders = (
  page = 1,
  limit = 20
): UseQueryResult<PaginatedResponse<IUser>, Error> =>
  useQuery<PaginatedResponse<IUser>, Error>({
    queryKey: ["responders", page, limit],
    queryFn: async (): Promise<PaginatedResponse<IUser>> => {
      const { data } = await api.get<PaginatedResponse<IUser>>(
        `/admin/responders?page=${page}&limit=${limit}`
      );
      return data;
    },
    refetchInterval: 5000, // poll every 5 seconds
    refetchOnWindowFocus: true, // optional: refetch when window gets focus
  });

// -------------------
// Emergencies Hooks (Polling Enabled)
// -------------------
export const useFetchEmergencies = (page = 1, limit = 20) =>
  useQuery<PaginatedResponse<IEmergency>, Error>({
    queryKey: ["emergencies", page, limit],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<IEmergency>>(
        `/admin/emergencies?page=${page}&limit=${limit}`
      );

      return {
        success: data.success,
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
        data: data.data || [],
      };
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

export const useFetchEmergencyById = (
  id: string
): UseQueryResult<IEmergency, Error> =>
  useQuery<IEmergency, Error>({
    queryKey: ["emergency", id],
    queryFn: async (): Promise<IEmergency> => {
      const { data } = await api.get<{ success: boolean; data: IEmergency }>(
        `/admin/emergencies/${id}`
      );
      return data.data;
    },
    enabled: !!id,
    refetchInterval: 5000,
  });

// -------------------
// Emergency Counts by City (Polling Enabled)
// -------------------
export const useFetchEmergencyCountsByCity = (
  page = 1,
  limit = 20
): UseQueryResult<PaginatedResponse<CityCount>, Error> =>
  useQuery<PaginatedResponse<CityCount>, Error>({
    queryKey: ["emergencies-lgu", page, limit],
    queryFn: async (): Promise<PaginatedResponse<CityCount>> => {
      const { data } = await api.get<PaginatedResponse<CityCount>>(
        `/admin/emergencies/lgu?page=${page}&limit=${limit}`
      );
      return { ...data, data: data.data || [] };
    },
    refetchInterval: 5000,
  });

// -------------------
// Verify Emergency Hook
// -------------------
export const verifyEmergency = async (id: string): Promise<void> => {
  await api.put(`/admin/emergencies/${id}/verify`);
};

export const useVerifyEmergency = (currentPage = 1, currentLimit = 20) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => verifyEmergency(id),
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["emergencies"] });
      queryClient.invalidateQueries({ queryKey: ["emergency"] });
      queryClient.invalidateQueries({ queryKey: ["responders"] });
      // If using pagination
      queryClient.invalidateQueries({ queryKey: ["emergencies", currentPage, currentLimit] });
    },
    onError: (error: unknown) => {
      console.error("Error verifying emergency:", error);
    },
  });
};
