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
  const pageRef = useRef(1); // avoid closure issues with setInterval
  const limit = 10;

  const fetchEmergencies = useCallback(async (page: number) => {
    setIsLoadingEmergencies(true);
    try {
      const data = await apiFetchEmergencies(page, limit);

      // Avoid duplicate emergencies
      const newEmergencies = data.filter(
        (e) => !emergencies.some((existing) => existing.id === e.id)
      );

      // Resolve place names in parallel, memoize if already present
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

      setEmergencies((prev) => [...prev, ...formattedEmergencies]);
      return formattedEmergencies;
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      return [];
    } finally {
      setIsLoadingEmergencies(false);
    }
  }, [emergencies]);

  // Auto-fetch every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const nextPage = pageRef.current;
      fetchEmergencies(nextPage);
      pageRef.current += 1;
    },10000);

    // initial fetch
    fetchEmergencies(pageRef.current);

    return () => clearInterval(interval);
  }, [fetchEmergencies]);

  const triggerFetch = () => fetchEmergencies(pageRef.current);

  return { emergencies, setEmergencies, isLoadingEmergencies, triggerFetch };
};
