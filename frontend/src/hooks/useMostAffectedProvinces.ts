import { useQuery } from "@tanstack/react-query";
import api from "../services/authService";

interface Municipality {
  name: string;
  latitude: number;
  longitude: number;
}

export interface Province {
  province: string;
  count: number;
  mainshockCount: number;
  aftershockCount: number;
  latitude: number;
  longitude: number;
  municipalities: Municipality[];
  region: string;
}

export interface RegionalData {
  region: string;
  totalEarthquakes: number;
  totalMainshocks: number;
  totalAftershocks: number;
  provinces: Province[];
  latitude: number;
  longitude: number;
}

export interface MostAffectedProvincesResponse {
  success: boolean;
  dateRange: string;
  CRITICAL_WARNING: {
    issue: string;
    explanation: string;
    missingEvents: string[];
    solutions: string[];
    recommendation: string;
  };
  summary: {
    totalEarthquakes: number;
    totalMainshocks: number;
    totalAftershocks: number;
    totalProvinces: number;
    totalRegions: number;
  };
  byRegion: RegionalData[];
  allProvinces: Province[];
  error?: string; // ✅ Added optional error field
}

let abortController: AbortController | null = null;

export const useMostAffectedProvinces = () => {
  return useQuery<MostAffectedProvincesResponse, Error>({
    queryKey: ["mostAffectedProvinces"],
    queryFn: async () => {
      // cancel any previous request if user navigates fast
      if (abortController) abortController.abort();
      abortController = new AbortController();

      try {
        const response = await api.get<MostAffectedProvincesResponse>(
          "/earthquakes/most-affected-provinces",
          {
            signal: abortController.signal,
            timeout: 60000, // Allow up to 1 minute for heavy data processing
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        );

        const data = response.data;

        if (!data.success) {
          throw new Error(data.error ?? "Unexpected response from server");
        }

        return data;
      } catch (error: unknown) {
        // ✅ Safely narrow the type
        if (error instanceof Error && (error.name === "CanceledError" || (error as any).code === "ERR_CANCELED")) {
          console.warn("⚠️ Request aborted or canceled");
          throw new Error("Request was canceled before completion");
        }

        if ((error as any)?.code === "ECONNABORTED") {
          console.error("⏱️ Request timed out");
          throw new Error("Request timed out — server took too long");
        }

        const axiosError = error as {
          response?: { status?: number; data?: { error?: string; details?: string } };
          message?: string;
        };

        if (axiosError.response?.status && axiosError.response.status >= 500) {
          console.error("🚨 Server internal error:", axiosError.response.data);
          throw new Error(
            axiosError.response.data?.error ||
              "Server failed to process most affected provinces"
          );
        }

        console.error("❌ Error fetching provinces:", error);
        throw new Error(
          axiosError.response?.data?.details ||
            axiosError.message ||
            "Failed to fetch earthquake data"
        );
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex) =>
      Math.min(2000 * 2 ** attemptIndex, 10000),
    placeholderData: (previousData) => previousData,
  });
};
