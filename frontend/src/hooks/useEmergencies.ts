import { useState, useEffect, useCallback, useRef } from "react";
import type { EmergencyRecord, NeedType } from "../types";
import { fetchEmergencies as apiFetchEmergencies } from "../services/api";

interface FetchEmergenciesOptions {
  signal?: AbortSignal;
}

interface RawEmergencyRecord {
  id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
  createdAt?: string;
  updatedAt?: string;
  needs?: string[];
  numberOfPeople?: number;
  urgencyLevel?: string;
  additionalNotes?: string;
  status?: string;
  contactNo?: string;
  contactno?: string;
  placename?: string;
}

interface UseEmergenciesReturn {
  emergencies: EmergencyRecord[];
  setEmergencies: React.Dispatch<React.SetStateAction<EmergencyRecord[]>>;
  isLoadingEmergencies: boolean;
  emergenciesError: string | null;
  refetchEmergencies: (force?: boolean) => Promise<void>;
  retryCount: number;
}

const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 1.8,
  timeout: 15000,
  cacheTTL: 15000, // 15 seconds cache
};

let lastFetchedData: EmergencyRecord[] | null = null;
let lastFetchedAt = 0;

export const useEmergencies = (): UseEmergenciesReturn => {
  const [emergencies, setEmergencies] = useState<EmergencyRecord[]>([]);

  console.log("Emergencies state:", emergencies);
  const [isLoadingEmergencies, setIsLoadingEmergencies] = useState(false);
  const [emergenciesError, setEmergenciesError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // ✅ Safe fetcher with retry logic
  const fetchEmergenciesWithRetry = useCallback(async (): Promise<EmergencyRecord[]> => {
    let attempt = 0;

    while (attempt <= RETRY_CONFIG.maxRetries) {
      try {
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), RETRY_CONFIG.timeout)
        );

        // Race API fetch with timeout
        const data = (await Promise.race([
          apiFetchEmergencies({ signal: controller.signal } as FetchEmergenciesOptions),
          timeoutPromise,
        ])) as RawEmergencyRecord[];

        if (!Array.isArray(data)) throw new Error("Invalid emergencies response");

        // ✅ Safely transform to typed EmergencyRecord[]
       const formatted: EmergencyRecord[] = data.map((e) => ({
          id: e.id,
          latitude: e.latitude,
          longitude: e.longitude,
          accuracy: e.accuracy ?? 0,
          timestamp: e.timestamp || e.createdAt || new Date().toISOString(),
          // 👇 Fix: convert raw strings to NeedType[]
          needs: (e.needs ?? []).map((n) => n.toLowerCase?.()) as NeedType[],
          numberOfPeople: e.numberOfPeople ?? 0,
          urgencyLevel: (e.urgencyLevel?.toLowerCase?.() || "medium") as
            | "low"
            | "medium"
            | "high"
            | "critical",
          additionalNotes: e.additionalNotes || "",
          status: (e.status?.toLowerCase?.() || "pending") as
            | "pending"
            | "in-progress"
            | "responded",
          createdAt: e.createdAt ?? new Date().toISOString(),
          updatedAt: e.updatedAt ?? new Date().toISOString(),
          contactNo: e.contactNo || e.contactno || "",
          placename: e.placename || "Unknown Location",
        }));


        lastFetchedAt = Date.now();
        lastFetchedData = formatted;
        setRetryCount(0);

        return formatted;
      } catch (err: unknown) {
        const error = err as Error & { code?: string; response?: { status?: number } };

        const isRetryable =
          error.message === "Request timeout" ||
          error.name === "AbortError" ||
          error.code === "ECONNABORTED" ||
          (error.response?.status ?? 0) >= 500 ||
          !navigator.onLine;

        if (!isRetryable || attempt === RETRY_CONFIG.maxRetries) {
          throw error;
        }

        const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
        await new Promise((res) => setTimeout(res, delay));
        attempt++;
        setRetryCount(attempt);
      }
    }

    return [];
  }, []);

  // ✅ Refetch with cache + background refresh
  const refetchEmergencies = useCallback(
    async (force = false) => {
      if (!force && lastFetchedData && Date.now() - lastFetchedAt < RETRY_CONFIG.cacheTTL) {
        setEmergencies(lastFetchedData);
        // Background refresh
        fetchEmergenciesWithRetry().then((fresh) => {
          if (isMountedRef.current && fresh) setEmergencies(fresh);
        });
        return;
      }

      try {
        setIsLoadingEmergencies(true);
        setEmergenciesError(null);
        const data = await fetchEmergenciesWithRetry();
        if (isMountedRef.current) setEmergencies(data);
      } catch (err: unknown) {
        const error = err as Error;
        if (isMountedRef.current) {
          setEmergenciesError(
            !navigator.onLine
              ? "No internet connection"
              : error.message === "Request timeout"
              ? "Request timed out"
              : "Failed to fetch emergencies"
          );
        }
      } finally {
        if (isMountedRef.current) setIsLoadingEmergencies(false);
      }
    },
    [fetchEmergenciesWithRetry]
  );

  // ✅ Initial load (cached + background)
  useEffect(() => {
    isMountedRef.current = true;
    refetchEmergencies();
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [refetchEmergencies]);

  return {
    emergencies,
    setEmergencies,
    isLoadingEmergencies,
    emergenciesError,
    refetchEmergencies,
    retryCount,
  };
};
