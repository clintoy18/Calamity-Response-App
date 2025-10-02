import { useState, useEffect, useCallback } from 'react';
import type { EmergencyRecord } from '../types';
import { fetchEmergencies as apiFetchEmergencies } from '../services/api';
import { getPlaceName } from '../utils/geocoding';

export const useEmergencies = () => {
  const [emergencies, setEmergencies] = useState<EmergencyRecord[]>([]);
  const [isLoadingEmergencies, setIsLoadingEmergencies] = useState<boolean>(false);

  const fetchEmergencies = useCallback(async (): Promise<EmergencyRecord[]> => {
    setIsLoadingEmergencies(true);
    try {
      const data = await apiFetchEmergencies();
      
      const formattedEmergencies = await Promise.all(
        data.map(async (emergency: any) => {
          const placeName = emergency.placeName || await getPlaceName(emergency.latitude, emergency.longitude);
          return {
            id: emergency.id,
            latitude: emergency.latitude,
            longitude: emergency.longitude,
            accuracy: emergency.accuracy,
            timestamp: emergency.timestamp || emergency.createdAt,
            needs: emergency.needs,
            numberOfPeople: emergency.numberOfPeople,
            urgencyLevel: emergency.urgencyLevel.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
            additionalNotes: emergency.additionalNotes || '',
            status: emergency.status?.toLowerCase() as 'pending' | 'responded' | 'resolved',
            createdAt: emergency.createdAt,
            updatedAt: emergency.updatedAt,
            contactNo: emergency.contactNo || emergency.contactno || '', 
            placeName,
          };
        })
      );

      setEmergencies(formattedEmergencies);
      return formattedEmergencies;
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      return [];
    } finally {
      setIsLoadingEmergencies(false);
    }
  }, []);

  useEffect(() => {
    fetchEmergencies();
    
    const pollInterval = setInterval(() => {
      fetchEmergencies();
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [fetchEmergencies]);

  return { emergencies, setEmergencies, isLoadingEmergencies, fetchEmergencies };
};