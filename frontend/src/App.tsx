import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import type { Status, Location, NeedType, EmergencyRecord } from './types';
import { useMapSetup } from './hooks/useMapSetup';
import { useEmergencies } from './hooks/useEmergencies';
import { useEmergencyMarkers } from './hooks/useEmergencyMarkers';
import { getPlaceName } from './utils/geocoding';
import { submitEmergency } from './services/api';
import { MapHeader } from './components/MapHeader';
import { AffectedAreasPanel } from './components/AffectedAreasPanel';
import { ActionButtons } from './components/ActionButtons';
import { EmergencyModal } from './components/EmergencyModal';

const EmergencyApp: React.FC = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [location, setLocation] = useState<Location | null>(null);
  const [placeName, setPlaceName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [contactNo, setContactNo] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [selectedNeeds, setSelectedNeeds] = useState<NeedType[]>([]);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  const { mapRef, mapInstanceRef } = useMapSetup();
  const { emergencies, setEmergencies, isLoadingEmergencies } = useEmergencies();
  const { addEmergencyMarker, removeTempMarker } = useEmergencyMarkers(
    mapInstanceRef,
    setErrorMessage,
    setStatus
  );

  const toggleNeed = (need: NeedType): void => {
    setSelectedNeeds(prev => 
      prev.includes(need) 
        ? prev.filter(n => n !== need)
        : [...prev, need]
    );
  };

  const handleEmergency = async (): Promise<void> => {
    setStatus("loading");
    setErrorMessage("");

    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage("GPS not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position: GeolocationPosition) => {
        const coords: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        };

        const newEmergencyId = "EMG-TEMP-" + Date.now();

        const isValidLocation = addEmergencyMarker(
          coords.latitude,
          coords.longitude,
          coords.accuracy,
          newEmergencyId
        );

        if (!isValidLocation) {
          return;
        }

        const name = await getPlaceName(coords.latitude, coords.longitude);
        setPlaceName(name);
        setLocation(coords);
        setStatus('form');
      },
      (error: GeolocationPositionError) => {
        setStatus("error");
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage(
              "Location permission denied. Please enable GPS access."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage("Location information unavailable.");
            break;
          case error.TIMEOUT:
            setErrorMessage("Location request timed out.");
            break;
          default:
            setErrorMessage("An unknown error occurred.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmitRequest = async (): Promise<void> => {
    if (selectedNeeds.length === 0) {
      setErrorMessage("Please select at least one relief item");
      return;
    }

    if (!location) return;

    setStatus("loading");

    try {
      const data = await submitEmergency(
        location,
        placeName,
        contactNo,
        selectedNeeds,
        numberOfPeople,
        urgencyLevel,
        additionalNotes
      );

      const newEmergency: EmergencyRecord = {
        ...location,
        id: data.data.id,
        needs: selectedNeeds,
        numberOfPeople,
        urgencyLevel,
        additionalNotes,
        contactNo,
        status: 'pending',
        createdAt: data.data.createdAt,
        updatedAt: data.data.updatedAt,
        placeName: data.data.placeName || placeName,
      };

      removeTempMarker();

      addEmergencyMarker(
        location.latitude,
        location.longitude,
        location.accuracy,
        data.data.id,
        newEmergency
      );

      setEmergencies((prev) => [...prev, newEmergency]);
      setStatus("success");
    } catch (error) {
      console.error("Error submitting request:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to submit request. Please try again."
      );
      setStatus("error");
    }
  };

  const handleReset = (): void => {
    setStatus("idle");
    setLocation(null);
    setPlaceName('');
    setSelectedNeeds([]);
    setNumberOfPeople(1);
    setUrgencyLevel('medium');
    setAdditionalNotes('');
    setContactNo('');
    setErrorMessage('');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 w-full h-full z-0"></div>

      <MapHeader emergencyCount={emergencies.length} />
      <AffectedAreasPanel isVisible={isVisible} setIsVisible={setIsVisible} />

      {isLoadingEmergencies && (
        <div className="absolute top-20 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg z-10">
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin text-gray-600" />
            <span className="text-sm text-gray-600">
              Loading emergencies...
            </span>
          </div>
        </div>
      )}

      <ActionButtons
        status={status}
        onRequestHelp={handleEmergency}
      />

      <EmergencyModal
        status={status}
        location={location}
        placeName={placeName}
        contactNo={contactNo}
        setContactNo={setContactNo}
        selectedNeeds={selectedNeeds}
        toggleNeed={toggleNeed}
        numberOfPeople={numberOfPeople}
        setNumberOfPeople={setNumberOfPeople}
        urgencyLevel={urgencyLevel}
        setUrgencyLevel={setUrgencyLevel}
        additionalNotes={additionalNotes}
        setAdditionalNotes={setAdditionalNotes}
        errorMessage={errorMessage}
        onSubmit={handleSubmitRequest}
        onReset={handleReset}
        setStatus={setStatus}
      />
    </div>
  );
};

export default EmergencyApp;