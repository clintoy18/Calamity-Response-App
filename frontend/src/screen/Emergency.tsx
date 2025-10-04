import React, { useState, useEffect } from "react";
import { Loader, Users, MapPin  } from "lucide-react";
import L from "leaflet";
import type { Status, Location, NeedType, EmergencyRecord } from "../types";
import { useMapSetup } from "../hooks/useMapSetup";
import { useEmergencies } from "../hooks/useEmergencies";
import { useEmergencyMarkers } from "../hooks/useEmergencyMarkers";
import { getPlaceName } from "../utils/geocoding";
import { submitEmergency } from "../services/api";
import { MapHeader } from "../components/MapHeader";
import { AffectedAreasPanel } from "../components/AffectedAreasPanel";
import { ActionButtons } from "../components/ActionButtons";
import { EmergencyModal } from "../components/EmergencyModal";
import { ManualPinpoint } from "../components/ManualPinPoint";
import { LocationSearch } from "../components/LocationSearch";
import { ResponderModal } from "../components/ResponderModal";

const Emergency: React.FC = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [location, setLocation] = useState<Location | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [selectedNeeds, setSelectedNeeds] = useState<NeedType[]>([]);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [urgencyLevel, setUrgencyLevel] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // ✅ Responder form state
  const [isResponderModalOpen, setIsResponderModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  const [isPinpointMode, setIsPinpointMode] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { mapRef, mapInstanceRef } = useMapSetup();
  const { emergencies, setEmergencies, isLoadingEmergencies } = useEmergencies();
  const { addEmergencyMarker, removeTempMarker, markersRef } =
    useEmergencyMarkers(mapInstanceRef, setErrorMessage, setStatus);

  const ZOOM_THRESHOLD = 12;

  // ✅ Sync markers for all emergencies (real-time) based on zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const updateMarkersByZoomAndBounds = () => {
      const zoom = map.getZoom();
      const bounds = map.getBounds();

      // Remove all non-TEMP markers first
      markersRef.current = markersRef.current.filter((m) => {
        if (!m.data.id?.includes("TEMP")) {
          map.removeLayer(m.marker);
          map.removeLayer(m.circle);
          return false;
        }
        return true;
      });

      if (zoom >= ZOOM_THRESHOLD) {
        emergencies.forEach((emergency) => {
          const exists = markersRef.current.some((m) => m.data.id === emergency.id);
          const inBounds = bounds.contains([emergency.latitude, emergency.longitude]);

          if (!exists && inBounds) {
            addEmergencyMarker(
              emergency.latitude,
              emergency.longitude,
              emergency.accuracy,
              emergency.id,
              emergency
            );
          }
        });
      }
    };

    updateMarkersByZoomAndBounds();
    map.on("zoomend moveend", updateMarkersByZoomAndBounds);

    return () => {
      map.off("zoomend moveend", updateMarkersByZoomAndBounds);
    };
  }, [emergencies, addEmergencyMarker, mapInstanceRef, markersRef]);

  // ✅ Manual map click
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isPinpointMode) {
        const { lat, lng } = e.latlng;
        setSelectedMapLocation({ lat, lng });
        removeTempMarker();
        addEmergencyMarker(lat, lng, 50, "EMG-TEMP-" + Date.now());
      }
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [isPinpointMode, mapInstanceRef, addEmergencyMarker, removeTempMarker]);

  const toggleNeed = (need: NeedType) => {
    setSelectedNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const handleEmergency = () => {
    setStatus("loading");
    setErrorMessage("");

    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage("GPS not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: Location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
        const newEmergencyId = "EMG-TEMP-" + Date.now();
        const isValid = addEmergencyMarker(
          coords.latitude,
          coords.longitude,
          coords.accuracy,
          newEmergencyId
        );
        if (!isValid) return;
        const name = await getPlaceName(coords.latitude, coords.longitude);
        setPlaceName(name);
        setLocation(coords);
        setStatus("form");
      },
      (err) => {
        setStatus("error");
        if (err.code === 1) setErrorMessage("Location permission denied.");
        else if (err.code === 2) setErrorMessage("Position unavailable.");
        else if (err.code === 3) setErrorMessage("Timeout.");
        else setErrorMessage("Unknown error.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleManualPinpointConfirm = async (lat: number, lng: number) => {
    setStatus("loading");
    const coords: Location = {
      latitude: lat,
      longitude: lng,
      accuracy: 50,
      timestamp: new Date().toISOString(),
    };
    const name = await getPlaceName(lat, lng);
    setPlaceName(name);
    setLocation(coords);
    setIsPinpointMode(false);
    setSelectedMapLocation(null);
    setStatus("form");
  };

  const handleSearchSelect = async (lat: number, lng: number, name: string) => {
    removeTempMarker();
    const newId = "EMG-TEMP-" + Date.now();
    addEmergencyMarker(lat, lng, 50, newId);
    mapInstanceRef.current?.setView([lat, lng], 16, { animate: true });
    setLocation({
      latitude: lat,
      longitude: lng,
      accuracy: 50,
      timestamp: new Date().toISOString(),
    });
    setPlaceName(name);
    setIsSearchOpen(false);
    setStatus("form");
  };

  const handleSubmitRequest = async () => {
    if (selectedNeeds.length === 0) {
      setErrorMessage("Select at least one relief item");
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
        status: "pending",
        createdAt: data.data.createdAt,
        updatedAt: data.data.updatedAt,
        placename: data.data.placename || placeName,
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
    } catch (e: unknown) {
      console.error(e);
      setErrorMessage(
        e instanceof Error ? e.message : "Failed to submit request"
      );
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setLocation(null);
    setPlaceName("");
    setSelectedNeeds([]);
    setNumberOfPeople(1);
    setUrgencyLevel("medium");
    setAdditionalNotes("");
    setContactNo("");
    setErrorMessage("");
    setIsPinpointMode(false);
    setSelectedMapLocation(null);
    removeTempMarker();
  };

  const handleActivatePinpoint = () => {
    setIsPinpointMode(true);
    setSelectedMapLocation(null);
  };
  const handleDeactivatePinpoint = () => {
    setIsPinpointMode(false);
    setSelectedMapLocation(null);
    removeTempMarker();
  };

  // ✅ Handle Responder Form Submit
  const handleResponderSubmit = async () => {
    try {
      if (!fullName || !email || !password || !contactNumber || !document) {
        alert("Please fill out all required fields.");
        return;
      }
      console.log("Responder Application:", {
        fullName,
        email,
        password,
        contactNumber,
        notes,
        document,
      });
      alert("Responder application submitted successfully!");
      setIsResponderModalOpen(false);
      setFullName("");
      setEmail("");
      setPassword("");
      setContactNumber("");
      setDocument(null);
      setNotes("");
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to submit responder application.");
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 w-full h-full z-0"></div>

        <MapHeader emergencyCount={emergencies.length} />
        <div className="absolute top-16 right-4 sm:top-32 sm:left-4 z-20 flex flex-col sm:flex-col space-y-2">
        {/* Be a Responder Button */}
        <button
          onClick={() => setIsResponderModalOpen(true)}
          className="bg-gradient-to-r from-orange-400 to-orange-600 text-white w-24 sm:w-48 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-105 transition transform duration-200 ease-in-out flex items-center justify-center gap-1"
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="leading-none">Become a responder</span>
        </button>

        {/* Emergency Responder Tracker Button */}
        <button
          className="bg-gradient-to-r from-green-400 to-green-600 text-white w-24 sm:w-48 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-105 transition transform duration-200 ease-in-out flex items-center justify-center gap-1"
        >
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="leading-none" ><a href="https://services.cebu.gov.ph/aidmap/rdm">Response Tracker</a></span>
        </button>
      </div>
      {isLoadingEmergencies && (
        <div className="absolute top-20 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg z-10">
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin text-gray-600" />
            <span className="text-sm text-gray-600">Loading emergencies...</span>
          </div>
        </div>
      )}

      <ActionButtons
        status={status}
        onRequestHelp={handleEmergency}
        isPinpointMode={isPinpointMode}
      />

      <div className="absolute bottom-28 left-4 right-4 z-10">
        <div className="max-w-md mx-auto">
          <ManualPinpoint
            isActive={isPinpointMode}
            onActivate={handleActivatePinpoint}
            onDeactivate={handleDeactivatePinpoint}
            onConfirm={handleManualPinpointConfirm}
            onOpenSearch={() => setIsSearchOpen(true)}
            selectedLocation={selectedMapLocation}
          />
        </div>
      </div>

      <LocationSearch
        isActive={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={handleSearchSelect}
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
      <AffectedAreasPanel
          isVisible={isVisible}
          setIsVisible={setIsVisible}
        />


      {/* ✅ Responder Modal */}
      <ResponderModal
        isOpen={isResponderModalOpen}
        setIsOpen={setIsResponderModalOpen}
        fullName={fullName}
        setFullName={setFullName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        contactNumber={contactNumber}
        setContactNumber={setContactNumber}
        document={document}
        setDocument={setDocument}
        notes={notes}
        setNotes={setNotes}
        errorMessage={errorMessage}
        onSubmit={handleResponderSubmit}
        onClose={() => setIsResponderModalOpen(false)}
      />
    </div>
  );
};

export default Emergency;
