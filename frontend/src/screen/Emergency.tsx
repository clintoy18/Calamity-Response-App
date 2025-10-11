/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Loader } from "lucide-react";
import L from "leaflet";
import type { Status, Location, NeedType, EmergencyRecord } from "../types";
import { useMapSetup } from "../hooks/useMapSetup";
import { useEmergencies } from "../hooks/useEmergencies";
import { useEmergencyMarkers } from "../hooks/useEmergencyMarkers";
import { getPlaceName } from "../utils/geocoding";
import { submitEmergency } from "../services/api";
import { LoginModal } from "../components/Login";
import { useAuthActions } from "../hooks/useAuthActions";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserRole } from "../utils/authUtils";
import { TopBar } from "../components/common/TopBar";
import logo from '../assets/logo.png';
import { NavigationMenu } from "../components/common/NavigationMenu";
import { EmergencyPanel } from "../components/common/EmergencyPanel";
import { UnifiedModal } from "../components/common/modal/UnifiedFormModal";

const CEBU_CENTER: [number, number] = [10.3157, 123.8854];
const DAVAO_ORIENTAL_CENTER: [number, number] = [7.1136, 126.3436];
const ZOOM_THRESHOLD = 13;

const Emergency: React.FC = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [location, setLocation] = useState<Location | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [selectedNeeds, setSelectedNeeds] = useState<NeedType[]>([]);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [urgencyLevel, setUrgencyLevel] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResponderModalOpen, setIsResponderModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPinpointMode, setIsPinpointMode] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [emergencyDocument, setEmergencyDocument] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  const { handleLogin, errors, isLoading, message } = useAuthActions();
  const API_BASE = import.meta.env.VITE_API_URL;
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { mapRef, mapInstanceRef, flyToLocation } = useMapSetup();
  const { emergencies, setEmergencies, isLoadingEmergencies } = useEmergencies();
  const { addEmergencyMarker, removeTempMarker, markersRef } = useEmergencyMarkers(mapInstanceRef);

  const handleNavigate = useCallback((itemId: string) => {
    switch (itemId) {
      case 'login': break;
      case 'become_responder': break;
      case 'cebu': break;
      case 'davao': break;
      case 'tracker': break;
      case 'app_info': break;
      default: break;
    }
    setIsMenuOpen(false);
  }, []);

  const updateMarkersByZoomAndBounds = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

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

    const emergenciesToShow = zoom < ZOOM_THRESHOLD 
      ? emergencies.slice(0, 10) 
      : emergencies;

    emergenciesToShow.forEach((emergency) => {
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
  }, [emergencies, addEmergencyMarker, mapInstanceRef, markersRef]);

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
    map.on("moveend", updateMarkersByZoomAndBounds);
    map.on("zoomend", updateMarkersByZoomAndBounds);

    updateMarkersByZoomAndBounds();

    return () => {
      map.off("click", handleMapClick);
      map.off("moveend", updateMarkersByZoomAndBounds);
      map.off("zoomend", updateMarkersByZoomAndBounds);
    };
  }, [isPinpointMode, emergencies, updateMarkersByZoomAndBounds, addEmergencyMarker, removeTempMarker, mapInstanceRef]);

  const handleCenterMap = useCallback((location: string) => {
    if (location === "cebu") {
      flyToLocation(CEBU_CENTER, 12);
    } else if (location === "davao") {
      flyToLocation(DAVAO_ORIENTAL_CENTER, 10);
    }
  }, [flyToLocation]);

  const toggleNeed = useCallback((need: NeedType) => {
    setSelectedNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  }, []);

  const handleEmergency = useCallback(() => {
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
  }, [addEmergencyMarker]);

  const handleManualPinpointConfirm = useCallback(async (lat: number, lng: number) => {
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
  }, []);

  const handleSearchSelect = useCallback(async (lat: number, lng: number, name: string) => {
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
  }, [removeTempMarker, addEmergencyMarker, mapInstanceRef]);

  const handleSubmitRequest = useCallback(async () => {
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
      setErrorMessage(e instanceof Error ? e.message : "Failed to submit request");
      setStatus("error");
    }
  }, [selectedNeeds, location, placeName, contactNo, numberOfPeople, urgencyLevel, additionalNotes, emergencyDocument, removeTempMarker, addEmergencyMarker, setEmergencies]);

  const handleReset = useCallback(() => {
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
  }, [removeTempMarker]);

  const handleResponderSubmit = useCallback(async () => {
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
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(response.data.message || "Responder application submitted!");
      setIsResponderModalOpen(false);
      setFullName("");
      setEmail("");
      setPassword("");
      setContactNumber("");
      setDocument(null);
      setNotes("");
    } catch (err: any) {
      console.error("Registration error:", err);
      const errorMsg = err.response?.data?.message || "Failed to submit responder application.";
      setErrorMessage(errorMsg);
      alert(errorMsg);
    }
  }, [fullName, email, password, contactNumber, document, notes, API_BASE]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" style={{ height: '100vh', width: '100vw' }}></div>

      <TopBar
        logoSrc={logo}
        emergencies={emergencies}
        showMenuButton
        onMenu={() => setIsMenuOpen(true)}
      />

      <NavigationMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleNavigate}
        loggedIn={false}
        isAuthenticated={isAuthenticated}
        userRole={getUserRole()}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onResponderClick={() => setIsResponderModalOpen(true)}
        onDashboardClick={() => navigate("/admin")}
        onLogout={logout}
        onCenterMap={handleCenterMap}
      />

      {isLoadingEmergencies && (
        <div className="fixed top-20 left-4 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-xl shadow-xl z-10 border-2 border-gray-200">
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin text-gray-600" />
            <span className="text-sm text-gray-600 font-medium">Loading emergencies...</span>
          </div>
        </div>
      )}

      <EmergencyPanel
        status={status}
        onRequestHelp={handleEmergency}
        isPinpointMode={isPinpointMode}
        onActivate={() => setIsPinpointMode(true)}
        onDeactivate={() => setIsPinpointMode(false)}
        onConfirm={handleManualPinpointConfirm}
        selectedLocation={selectedMapLocation}
        isSearchOpen={isSearchOpen}
        onOpenSearch={() => setIsSearchOpen(true)}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={handleSearchSelect}
      />

      <UnifiedModal
        type="emergency"
        isOpen={status !== "idle"}
        onClose={handleReset}
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

      <UnifiedModal
        type="responder"
        isOpen={isResponderModalOpen}
        onClose={() => setIsResponderModalOpen(false)}
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
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        errors={errors}
        isLoading={isLoading}
        successMessage={message}
      />
    </div>
  );
};

export default Emergency;