import { useState, useEffect, useCallback, useRef } from 'react';
import type { EmergencyRecord } from '../types';
import { fetchEmergencies as apiFetchEmergencies } from '../services/api';
import { getPlaceName } from '../utils/geocoding';

interface UseEmergenciesReturn {
  emergencies: EmergencyRecord[];
  setEmergencies: React.Dispatch<React.SetStateAction<EmergencyRecord[]>>;
  isLoadingEmergencies: boolean;
  fetchEmergencies: () => Promise<void>;
  triggerFetch: () => void;
}

export const useEmergencies = (): UseEmergenciesReturn => {
  const [emergencies, setEmergencies] = useState<EmergencyRecord[]>([]);
  const [isLoadingEmergencies, setIsLoadingEmergencies] = useState(false);
  const [page, setPage] = useState(1);

  const placeNameCache = useRef<Map<string, string>>(new Map());

  const normalizeStatus = (status?: string) =>
    status === 'responded' || status === 'resolved' ? status : 'pending';

  const normalizeUrgency = (level?: string) =>
    ['low', 'medium', 'high', 'critical'].includes(level?.toLowerCase() || '')
      ? (level!.toLowerCase() as 'low' | 'medium' | 'high' | 'critical')
      : 'low';

  // Append emergencies in batches to prevent heavy rendering
  const appendEmergenciesInBatches = async (
    items: EmergencyRecord[],
    batchSize = 1,
    delay = 1000
  ) => {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      setEmergencies((prev) => [...prev, ...batch]);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  };

  const fetchEmergencies = useCallback(async (): Promise<void> => {
    if (isLoadingEmergencies) return;

    setIsLoadingEmergencies(true);
    try {
      const data = await apiFetchEmergencies(page, 20);

      const formattedEmergencies: EmergencyRecord[] = data.map((e) => ({
        id: e.id,
        latitude: e.latitude,
        longitude: e.longitude,
        accuracy: e.accuracy,
        timestamp: e.timestamp || e.createdAt || new Date().toISOString(),
        needs: e.needs,
        numberOfPeople: e.numberOfPeople,
        urgencyLevel: normalizeUrgency(e.urgencyLevel),
        additionalNotes: e.additionalNotes || '',
        status: normalizeStatus(e.status),
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        contactNo: e.contactNo || e.contactno || '',
        placeName: '', // initially empty
      }));

      // Append in small batches
      await appendEmergenciesInBatches(formattedEmergencies);

      // Load place names asynchronously in the background
      formattedEmergencies.forEach(async (emergency) => {
        const key = `${emergency.latitude},${emergency.longitude}`;
        if (!placeNameCache.current.has(key)) {
          const name = await getPlaceName(emergency.latitude, emergency.longitude);
          placeNameCache.current.set(key, name);
          setEmergencies((prev) =>
            prev.map((e) => (e.id === emergency.id ? { ...e, placeName: name } : e))
          );
        }
      });

      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    } finally {
      setIsLoadingEmergencies(false);
    }
  }, [page, isLoadingEmergencies]);

  // Delay initial fetch by 10 seconds to avoid blocking UI
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchEmergencies();
    }, 10000); // 10 seconds

    return () => clearTimeout(timeout);
  }, [fetchEmergencies]);

  const triggerFetch = () => {
    setEmergencies([]);
    setPage(1);
  };

  return { emergencies, setEmergencies, isLoadingEmergencies, fetchEmergencies, triggerFetch };
};
