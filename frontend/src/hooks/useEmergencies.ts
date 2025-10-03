import { useState, useEffect, useCallback, useRef } from 'react';
import type { EmergencyRecord } from '../types';
import { fetchEmergencies as apiFetchEmergencies } from '../services/api';
import { getPlaceName } from '../utils/geocoding';

interface UseEmergenciesReturn {
  emergencies: EmergencyRecord[];
  setEmergencies: React.Dispatch<React.SetStateAction<EmergencyRecord[]>>;
  isLoadingEmergencies: boolean;
  triggerFetch: () => void;
}

export const useEmergencies = (): UseEmergenciesReturn => {
  const [emergencies, setEmergencies] = useState<EmergencyRecord[]>([]);
  const [isLoadingEmergencies, setIsLoadingEmergencies] = useState(false);
  const pageRef = useRef(1);
  const fetchedIdsRef = useRef<Set<string>>(new Set()); // track fetched IDs
  const limit = 10;

  const fetchEmergencies = useCallback(async (page: number) => {
    setIsLoadingEmergencies(true);
    try {
      const data = await apiFetchEmergencies(page, limit);

      // Filter out already fetched emergencies
      const newEmergencies = data.filter((e) => !fetchedIdsRef.current.has(e.id));

      // Resolve place names in parallel
      const formattedEmergencies = await Promise.all(
        newEmergencies.map(async (emergency) => {
          const placeName =
            emergency.placeName ||
            (await getPlaceName(emergency.latitude, emergency.longitude));

          return {
            id: emergency.id,
            latitude: emergency.latitude,
            longitude: emergency.longitude,
            accuracy: emergency.accuracy,
            timestamp: emergency.timestamp || emergency.createdAt || new Date().toISOString(),
            needs: emergency.needs,
            numberOfPeople: emergency.numberOfPeople,
            urgencyLevel: (emergency.urgencyLevel || 'low').toLowerCase() as
              | 'low'
              | 'medium'
              | 'high'
              | 'critical',
            additionalNotes: emergency.additionalNotes || '',
            status: (emergency.status?.toLowerCase() || 'pending') as
              | 'pending'
              | 'responded'
              | 'resolved',
            createdAt: emergency.createdAt,
            updatedAt: emergency.updatedAt,
            contactNo: emergency.contactNo || emergency.contactno || '',
            placeName,
          };
        })
      );

      // Track fetched IDs to prevent duplicates
      formattedEmergencies.forEach((e) => fetchedIdsRef.current.add(e.id));

      setEmergencies((prev) => [...prev, ...formattedEmergencies]);
      return formattedEmergencies;
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      return [];
    } finally {
      setIsLoadingEmergencies(false);
    }
  }, []);

  // Auto-fetch every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEmergencies(pageRef.current);
      pageRef.current++;
    }, 10000);

    // Initial fetch
    fetchEmergencies(pageRef.current);

    return () => clearInterval(interval);
  }, [fetchEmergencies]);

  const triggerFetch = () => fetchEmergencies(pageRef.current);

  return { emergencies, setEmergencies, isLoadingEmergencies, triggerFetch };
};
