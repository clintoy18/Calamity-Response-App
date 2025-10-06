/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import L from "leaflet";
import type { Status, Location, NeedType, EmergencyRecord } from "../types";
import { useMapSetup } from "../hooks/useMapSetup";
import { useEmergencies } from "../hooks/useEmergencies";
import { useEmergencyMarkers } from "../hooks/useEmergencyMarkers";
import { getPlaceName } from "../utils/geocoding";
import { submitEmergency } from "../services/api";
import { MapHeader } from "../components/MapHeader";
import { ActionButtons } from "../components/ActionButtons";
import { EmergencyModal } from "../components/EmergencyModal";
import { ManualPinpoint } from "../components/ManualPinPoint";
import { LocationSearch } from "../components/LocationSearch";
import { ResponderModal } from "../components/ResponderModal";
import { LoginModal } from "../components/Login";
import { NavigationPanel } from "../components/NavigationPanel";
import { useAuthActions } from "../hooks/useAuthActions";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserRole } from "../utils/authUtils";

const Emergency: React.FC = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [location, setLocation] = useState<Location | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [selectedNeeds, setSelectedNeeds] = useState<NeedType[]>([]);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [urgencyLevel, setUrgencyLevel] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const { handleLogin, errors, isLoading, message } = useAuthActions();

  const API_BASE = import.meta.env.VITE_API_URL;

  const { logout } = useAuth();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Responder form state
  const [isResponderModalOpen, setIsResponderModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [emergencyDocument, setEmergencyDocument] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [isPinpointMode, setIsPinpointMode] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { mapRef, mapInstanceRef } = useMapSetup();
  const { emergencies, setEmergencies, isLoadingEmergencies } =
    useEmergencies();
  const { addEmergencyMarker, removeTempMarker, markersRef } =
    useEmergencyMarkers(mapInstanceRef, setErrorMessage, setStatus);

  const ZOOM_THRESHOLD = 8;

  // Sync markers for all emergencies (real-time) based on zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const updateMarkersByZoomAndBounds = () => {
      const zoom = map.getZoom();
      const bounds = map.getBounds();

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
          const exists = markersRef.current.some(
            (m) => m.data.id === emergency.id
          );
          const inBounds = bounds.contains([
            emergency.latitude,
            emergency.longitude,
          ]);

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

  // Manual map click
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
        additionalNotes,
        emergencyDocument
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

  const handleResponderSubmit = async () => {
    try {
      if (!fullName || !email || !password || !contactNumber || !document) {
        alert("Please fill out all required fields.");
        return;
      }

      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("fullName", fullName);
      formData.append("contactNo", contactNumber);
      formData.append("notes", notes || "");
      formData.append("role", "respondent");
      formData.append("verificationDocument", document);

      const response = await axios.post(`${API_BASE}/auth/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(
        response.data.message || "Responder application submitted successfully!"
      );

      setIsResponderModalOpen(false);
      setFullName("");
      setEmail("");
      setPassword("");
      setContactNumber("");
      setDocument(null);
      setNotes("");
    } catch (err: any) {
      console.error("Registration error:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Failed to submit responder application.";
      setErrorMessage(errorMsg);
      alert(errorMsg);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 w-full h-full z-0"></div>

      <NavigationPanel
        isAuthenticated={isAuthenticated}
        userRole={getUserRole()}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onResponderClick={() => setIsResponderModalOpen(true)}
        onDashboardClick={() => navigate("/admin")}
        onLogout={logout}
      />
      <MapHeader emergencyCount={emergencies.length} />

      {isLoadingEmergencies && (
        <div className="fixed top-20 left-4 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-xl shadow-xl z-10 border-2 border-gray-200">
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin text-gray-600" />
            <span className="text-sm text-gray-600 font-medium">
              Loading emergencies...
            </span>
          </div>
        </div>
      )}

      <ActionButtons
        status={status}
        onRequestHelp={handleEmergency}
        isPinpointMode={isPinpointMode}
      />

      <ManualPinpoint
        isActive={isPinpointMode}
        onActivate={handleActivatePinpoint}
        onDeactivate={handleDeactivatePinpoint}
        onConfirm={handleManualPinpointConfirm}
        onOpenSearch={() => setIsSearchOpen(true)}
        selectedLocation={selectedMapLocation}
      />

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
        emergencyDocument={emergencyDocument}
        setEmergencyDocument={setEmergencyDocument}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        errors={errors}
        isLoading={isLoading}
        successMessage={message}
      />

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
