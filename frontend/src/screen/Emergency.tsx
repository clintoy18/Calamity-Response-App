/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { Loader } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { Status, Location, NeedType, EmergencyRecord } from "../types";
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
// import { useMostAffectedProvinces } from "../hooks/useMostAffectedProvinces";
import { useEmergencies as useEmergenciesHook } from "../hooks/useEmergencies";
import { useMapSetup } from "../hooks/useMapSetup";
import { createPopupContent, createMarkerIcon, addAffectedAreaMarkers } from "../utils/mapUtils";
import { urgencyColors, GENERAL_SANTOS_CENTER } from "../constants";

// const RETRY_CONFIG = {
//   maxRetries: 3,
//   retryDelay: 1000,
//   backoffMultiplier: 2,
// };

const Emergency: React.FC = () => {
  const { mapRef, mapInstanceRef, flyToLocation } = useMapSetup();

  // const { 
  //   data: provincesData, 
  //   // error: provincesError,
  //   isLoading: provincesLoading,
  //   refetch: refetchProvinces 
  // } = useMostAffectedProvinces();

  const { 
    emergencies, 
    setEmergencies, 
    isLoadingEmergencies,
    emergenciesError,
    refetchEmergencies 
  } = useEmergenciesHook();

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

  const markerClusterRef = React.useRef<L.MarkerClusterGroup | null>(null);
  const markersMapRef = React.useRef<Map<string, L.Marker>>(new Map());
  const tempMarkerRef = React.useRef<L.Marker | null>(null);
  const isClusterInitializedRef = React.useRef(false);

  // const [retryCount, setRetryCount] = useState(0);
  const [dataFetchError, setDataFetchError] = useState<string | null>(null);

  // ✅ Handle successful login without reload
  // const handleLoginSuccess = useCallback(() => {
  //   console.log("✅ Login successful - updating UI without reload");
    
  //   // Close the login modal
  //   setIsLoginModalOpen(false);
    
  //   // Refetch data to update UI based on new auth state
  //   if (refetchEmergencies) {
  //     refetchEmergencies();
  //   }
  //   if (refetchProvinces) {
  //     refetchProvinces();
  //   }
    
  //   // Close all open popups to force re-render with new permissions
  //   markersMapRef.current.forEach(marker => {
  //     if (marker.isPopupOpen()) {
  //       marker.closePopup();
  //     }
  //   });
    
  //   // Small delay to ensure state updates, then re-render markers
  //   setTimeout(() => {
  //     updateEmergencyMarkers();
  //   }, 100);
  // }, [refetchEmergencies, refetchProvinces]);

  // Add or update emergency markers with GREEN for responded
  const updateEmergencyMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    const cluster = markerClusterRef.current;
    
    if (!map) {
      console.warn("⚠️ Map not initialized yet");
      return;
    }
    
    if (!cluster) {
      console.warn("⚠️ Cluster not initialized yet");
      return;
    }

    const existingIds = new Set(markersMapRef.current.keys());
    const currentIds = new Set(emergencies.map(e => e.id));

    // Remove markers that no longer exist
    existingIds.forEach(id => {
      if (!currentIds.has(id)) {
        const marker = markersMapRef.current.get(id);
        if (marker) {
          cluster.removeLayer(marker);
          markersMapRef.current.delete(id);
        }
      }
    });

    // Add or update markers
    emergencies.forEach(emergency => {
      const existingMarker = markersMapRef.current.get(emergency.id);

      // Determine marker color
      const color = emergency.status === "responded" 
        ? "#10b981" // Green for resolved emergencies
        : urgencyColors[emergency.urgencyLevel]?.dark || urgencyColors[emergency.urgencyLevel]?.bg || "#6b7280";

      if (existingMarker) {
        // Update popup content if marker exists - FORCE RE-RENDER
        const popupContent = createPopupContent(
          emergency.latitude,
          emergency.longitude,
          emergency.id,
          emergency
        );
        
        // Close popup if open, update content, then reopen if it was open
        const wasOpen = existingMarker.isPopupOpen();
        if (wasOpen) {
          existingMarker.closePopup();
        }
        
        existingMarker.setPopupContent(popupContent);
        
        if (wasOpen) {
          existingMarker.openPopup();
        }
        
        // Update marker color based on status
        const newIcon = createMarkerIcon(color);
        existingMarker.setIcon(newIcon);
        
      } else {
        // Create marker with correct color based on status
        const icon = createMarkerIcon(color);
        
        const marker = L.marker([emergency.latitude, emergency.longitude], { icon });
        
        const popupContent = createPopupContent(
          emergency.latitude,
          emergency.longitude,
          emergency.id,
          emergency
        );
        
        marker.bindPopup(popupContent, { 
          maxWidth: 300,
          className: 'emergency-popup'
        });

        cluster.addLayer(marker);
        markersMapRef.current.set(emergency.id, marker);
      }
    });

  }, [emergencies, mapInstanceRef.current]);

  // Register refresh function globally for map popup buttons
  useEffect(() => {
    window.refreshEmergencies = async () => {
      
      // Close all open popups before refetching
      markersMapRef.current.forEach(marker => {
        if (marker.isPopupOpen()) {
          marker.closePopup();
        }
      });
      
      if (refetchEmergencies) {
        await refetchEmergencies();
      }
    };

    // Register logout handler that doesn't reload but refetches data
    window.handleLogout = () => {
      // Close all open popups
      markersMapRef.current.forEach(marker => {
        if (marker.isPopupOpen()) {
          marker.closePopup();
        }
      });
      
      if (logout) {
        logout();
        
        // Close any open modals
        setIsLoginModalOpen(false);
        setIsResponderModalOpen(false);
        
        // Refetch emergencies after logout to update UI based on new auth state
        if (refetchEmergencies) {
          setTimeout(() => {
            refetchEmergencies();
            updateEmergencyMarkers();
          }, 100);
        }
      }
    };

    return () => {
      delete window.refreshEmergencies;
      delete window.handleLogout;
    };
  }, [refetchEmergencies, logout, updateEmergencyMarkers]);

  // Initialize marker cluster group
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || isClusterInitializedRef.current) return;

    const cluster = (L as any).markerClusterGroup({
      chunkedLoading: true,
      chunkDelay: 50,
      chunkInterval: 200,
      maxClusterRadius: 40,
      spiderfyOnEveryZoom: false,
      showCoverageOnHover: false,
      disableClusteringAtZoom: 15,
    });

    map.addLayer(cluster);
    markerClusterRef.current = cluster;
    isClusterInitializedRef.current = true;

    addAffectedAreaMarkers(map);
    
    return () => {
      if (markerClusterRef.current && map) {
        map.removeLayer(markerClusterRef.current);
        markerClusterRef.current = null;
        isClusterInitializedRef.current = false;
      }
    };
  }, [mapInstanceRef.current]);

  // Update markers when emergencies change
  useEffect(() => {
    const timer = setTimeout(() => {
      updateEmergencyMarkers();
    }, 100);

    return () => clearTimeout(timer);
  }, [emergencies, updateEmergencyMarkers]);

  // Handle map click for pinpoint mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isPinpointMode) {
        const { lat, lng } = e.latlng;
        setSelectedMapLocation({ lat, lng });

        if (tempMarkerRef.current) {
          map.removeLayer(tempMarkerRef.current);
        }

        const icon = createMarkerIcon("#ef4444");
        const marker = L.marker([lat, lng], { icon });
        marker.addTo(map);
        tempMarkerRef.current = marker;
      }
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [isPinpointMode, mapInstanceRef.current]);

  // Handle provinces retry logic
  // useEffect(() => {
  //   if (provincesData) {
  //     console.log("✅ Successfully loaded provinces data");
  //     setRetryCount(0);
  //     setDataFetchError(null);
  //   }

  //   if (provincesError) {
  //     console.error("❌ Error fetching provinces:", provincesError);
  //     setDataFetchError("Failed to load affected areas data");

  //     if (retryCount < RETRY_CONFIG.maxRetries) {
  //       const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
  //       const timeout = setTimeout(() => {
  //         setRetryCount(p => p + 1);
  //         if (refetchProvinces) refetchProvinces();
  //       }, delay);
  //       return () => clearTimeout(timeout);
  //     }
  //   }
  // }, [provincesData, provincesError, retryCount, refetchProvinces]);

  // Handle emergencies error
  useEffect(() => {
    if (emergenciesError) {
      const timeout = setTimeout(() => {
        if (refetchEmergencies) refetchEmergencies();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [emergenciesError, refetchEmergencies]);

  const handleNavigate = useCallback((itemId: string) => {
    switch (itemId) {
      case 'login': setIsLoginModalOpen(true); break;
      case 'become_responder': setIsResponderModalOpen(true); break;
      case 'cebu': 
      case 'gensan': flyToLocation(GENERAL_SANTOS_CENTER, 12); break;
      case 'davao': flyToLocation([7.1136, 125.6436], 12); break;
      case 'tracker': navigate('/tracker'); break;
      case 'app_info': navigate('/info'); break;
      default: break;
    }
    setIsMenuOpen(false);
  }, [navigate, flyToLocation]);

  const handleCenterMap = useCallback((locationStr: string, lat: number, lng: number) => {
    let zoomLevel = 12;
    const parts = locationStr.split('_');
    if (parts.length === 1) zoomLevel = 10;
    else if (parts.length === 2) zoomLevel = 12;
    else if (parts.length >= 3) zoomLevel = 14;

    flyToLocation([lat, lng], zoomLevel);
  }, [flyToLocation]);

  const toggleNeed = useCallback((need: NeedType) => {
    setSelectedNeeds(prev => prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need]);
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

        const map = mapInstanceRef.current;
        if (map) {
          if (tempMarkerRef.current) {
            map.removeLayer(tempMarkerRef.current);
          }
          const icon = createMarkerIcon("#ef4444");
          const marker = L.marker([coords.latitude, coords.longitude], { icon });
          marker.addTo(map);
          tempMarkerRef.current = marker;
        }

        try {
          const name = await getPlaceName(coords.latitude, coords.longitude);
          setPlaceName(name);
        } catch (error) {
          console.error("Failed to get place name:", error);
          setPlaceName("Unknown location");
        }

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
  }, [mapInstanceRef.current]);

  const handleManualPinpointConfirm = useCallback(async (lat: number, lng: number) => {
    setStatus("loading");
    const coords: Location = { 
      latitude: lat, 
      longitude: lng, 
      accuracy: 50, 
      timestamp: new Date().toISOString() 
    };

    try {
      const name = await getPlaceName(lat, lng);
      setPlaceName(name);
    } catch (error) {
      console.error("Failed to get place name:", error);
      setPlaceName("Unknown location");
    }

    setLocation(coords);
    setIsPinpointMode(false);
    setSelectedMapLocation(null);
    setStatus("form");
  }, []);

  const handleSearchSelect = useCallback(async (lat: number, lng: number, name: string) => {
    const map = mapInstanceRef.current;
    if (map) {
      if (tempMarkerRef.current) {
        map.removeLayer(tempMarkerRef.current);
      }
      const icon = createMarkerIcon("#ef4444");
      const marker = L.marker([lat, lng], { icon });
      marker.addTo(map);
      tempMarkerRef.current = marker;
      flyToLocation([lat, lng], 16);
    }

    setLocation({ 
      latitude: lat, 
      longitude: lng, 
      accuracy: 50, 
      timestamp: new Date().toISOString() 
    });
    setPlaceName(name);
    setIsSearchOpen(false);
    setStatus("form");
  }, [mapInstanceRef.current, flyToLocation]);

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

      const map = mapInstanceRef.current;
      if (map && tempMarkerRef.current) {
        map.removeLayer(tempMarkerRef.current);
        tempMarkerRef.current = null;
      }

      setEmergencies(prev => [...prev, newEmergency]);
      setStatus("success");
    } catch (e: unknown) {
      console.error("Emergency submission failed:", e);
      const errorMsg = e instanceof Error ? e.message : "Failed to submit request";
      setErrorMessage(`${errorMsg}. Please try again.`);
      setStatus("error");
    }
  }, [selectedNeeds, location, placeName, contactNo, numberOfPeople, urgencyLevel, additionalNotes, emergencyDocument, mapInstanceRef.current, setEmergencies]);

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
    
    const map = mapInstanceRef.current;
    if (map && tempMarkerRef.current) {
      map.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }
  }, [mapInstanceRef.current]);

  const handleCancelPinpoint = useCallback(() => {
    setIsPinpointMode(false);
    setSelectedMapLocation(null);
    
    const map = mapInstanceRef.current;
    if (map && tempMarkerRef.current) {
      map.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }
  }, [mapInstanceRef.current]);

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
        timeout: 15000,
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
      let errorMsg = "Failed to submit responder application.";
      if (err.code === 'ECONNABORTED') {
        errorMsg = "Request timeout. Please check your connection and try again.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (!navigator.onLine) {
        errorMsg = "No internet connection. Please check your network.";
      }
      setErrorMessage(errorMsg);
      alert(errorMsg);
    }
  }, [fullName, email, password, contactNumber, document, notes, API_BASE]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" style={{ height: '100vh', width: '100vw' }}></div>

      <TopBar logoSrc={logo} emergencies={emergencies} showMenuButton onMenu={() => setIsMenuOpen(true)} />

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
        // provincesData={provincesData?.byRegion}
      />

      {(isLoadingEmergencies ) && ( // || provincesLoading
        <div className="fixed top-20 left-4 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-xl shadow-xl z-10 border-2 border-gray-200">
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin text-gray-600" />
            <span className="text-sm text-gray-600 font-medium">
              {isLoadingEmergencies && "Loading emergencies..."}
            </span>
          </div>
        </div>
      )}

      {(dataFetchError || emergenciesError) && (
        <div className="fixed top-20 left-4 bg-red-50 border-2 border-red-300 px-5 py-3 rounded-xl shadow-xl z-10 max-w-sm">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-red-700 font-medium">{dataFetchError || "Failed to load emergency data"}</span>
            <button
              onClick={() => {
                // setRetryCount(0);
                setDataFetchError(null);
                // if (refetchProvinces) refetchProvinces();
                if (refetchEmergencies) refetchEmergencies();
              }}
              className="text-xs text-red-700 font-semibold hover:underline text-left"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <EmergencyPanel
        status={status}
        onRequestHelp={handleEmergency}
        isPinpointMode={isPinpointMode}
        onActivate={() => setIsPinpointMode(true)}
        onDeactivate={handleCancelPinpoint}
        onConfirm={handleManualPinpointConfirm}
        selectedLocation={selectedMapLocation}
        isSearchOpen={isSearchOpen}
        onOpenSearch={() => setIsSearchOpen(true)}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={handleSearchSelect}
      />

   {status !== "idle" && (
  <UnifiedModal
    type="emergency"
    isOpen={true} // already gated by the condition
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
)}

      {isResponderModalOpen && (
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
      )}

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
          // onLoginSuccess={handleLoginSuccess}
          errors={errors}
          isLoading={isLoading}
          successMessage={message}
        />
      )}
    </div>
  );
};

export default Emergency;