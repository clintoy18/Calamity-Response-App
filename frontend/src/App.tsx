import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, MapPin, CheckCircle, Loader, Package, Users, Droplet, Home, Heart, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

type Status = 'idle' | 'loading' | 'form' | 'success' | 'error';

type NeedType = 'food' | 'water' | 'medical' | 'shelter' | 'clothing' | 'other';

interface EmergencyRequest {
  needs: NeedType[];
  numberOfPeople: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  additionalNotes: string;
}

interface EmergencyRecord extends Location, EmergencyRequest {
  id: string;
  status?: 'pending' | 'responded' | 'resolved';
  createdAt?: string;
  updatedAt?: string;
}

export default function EmergencyApp() {
  const [status, setStatus] = useState<Status>('idle');
  const [location, setLocation] = useState<Location | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [emergencyId, setEmergencyId] = useState<string | null>(null);
  const [emergencies, setEmergencies] = useState<EmergencyRecord[]>([]);
  const [isLoadingEmergencies, setIsLoadingEmergencies] = useState<boolean>(false);
  
  // Form states
  const [selectedNeeds, setSelectedNeeds] = useState<NeedType[]>([]);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Array<{ marker: L.Marker; circle: L.Circle; data: EmergencyRecord }>>([]);

  // Cebu City center coordinates
  const CEBU_CENTER: L.LatLngExpression = [10.3157, 123.8854];
  const CEBU_BOUNDS: L.LatLngBoundsExpression = [
    [9.4, 123.1],
    [11.4, 124.1]   
  ];

  const needOptions: Array<{ value: NeedType; label: string; icon: React.ReactNode }> = [
    { value: 'food', label: 'Food', icon: <Package className="w-5 h-5" /> },
    { value: 'water', label: 'Water', icon: <Droplet className="w-5 h-5" /> },
    { value: 'medical', label: 'Medical', icon: <Heart className="w-5 h-5" /> },
    { value: 'shelter', label: 'Shelter', icon: <Home className="w-5 h-5" /> },
    { value: 'clothing', label: 'Clothing', icon: <Users className="w-5 h-5" /> },
    { value: 'other', label: 'Other', icon: <Package className="w-5 h-5" /> },
  ];

  const urgencyColors = {
    low: { bg: '#10b981', text: 'Low', light: '#d1fae5' },
    medium: { bg: '#f59e0b', text: 'Medium', light: '#fef3c7' },
    high: { bg: '#f97316', text: 'High', light: '#ffedd5' },
    critical: { bg: '#ef4444', text: 'Critical', light: '#fee2e2' }
  };

  // Initialize map
  useEffect(() => {
  if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: CEBU_CENTER,
      zoom: 12,
      maxBounds: CEBU_BOUNDS,
      maxBoundsViscosity: 1.0,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: true
    });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
  }).addTo(map);

  mapInstanceRef.current = map;

  // 🚀 Animate fly to Cebu after 2 seconds
  setTimeout(() => {
    map.flyTo(CEBU_CENTER, 12, {
      animate: true,
      duration: 3 // seconds
    });
  }, 2000);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch all emergencies on mount
  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async (): Promise<void> => {
    setIsLoadingEmergencies(true);
    try {
      const response = await fetch(`${API_URL}/emergencies`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const formattedEmergencies = data.data.map((emergency: any) => ({
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
          updatedAt: emergency.updatedAt
        }));

        setEmergencies(formattedEmergencies);

        // Add markers for all emergencies
        formattedEmergencies.forEach((emergency: EmergencyRecord) => {
          addEmergencyMarker(
            emergency.latitude,
            emergency.longitude,
            emergency.accuracy,
            emergency.id,
            emergency
          );
        });
      }
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    } finally {
      setIsLoadingEmergencies(false);
    }
  };

  const addEmergencyMarker = (lat: number, lng: number, accuracy: number, id: string, emergencyData?: EmergencyRecord): boolean => {
    if (!mapInstanceRef.current) return false;

    const map = mapInstanceRef.current;
    const isInCebu = lat >= 9.8 && lat <= 10.8 && lng >= 123.3 && lng <= 124.4;

    if (!isInCebu) {
      setErrorMessage('Location is outside Cebu area. This service is only available in Cebu.');
      setStatus('error');
      return false;
    }

    // Choose color based on urgency if emergency data is provided
    const color = emergencyData ? urgencyColors[emergencyData.urgencyLevel].bg : '#6366f1';

    const userIcon = L.divIcon({
      html: `<div style="background: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <div style="color: white; font-size: 16px;">📍</div>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
      className: ''
    });

    // Build popup content
    let popupContent = `
      <div style="min-width: 200px;">
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #1f2937;">Emergency Request</div>
        <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
          <strong>ID:</strong> ${id}<br>
          <strong>Location:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}
        </div>
    `;

    if (emergencyData) {
      popupContent += `
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
          <div style="font-size: 12px; margin-bottom: 6px;">
            <strong style="color: #374151;">Relief Items:</strong><br>
            <span style="color: #6b7280;">${emergencyData.needs.join(', ')}</span>
          </div>
          <div style="font-size: 12px; margin-bottom: 6px;">
            <strong style="color: #374151;">People:</strong> 
            <span style="color: #6b7280;">${emergencyData.numberOfPeople}</span>
          </div>
          <div style="font-size: 12px; margin-bottom: 6px;">
            <strong style="color: #374151;">Urgency:</strong>
            <span style="background: ${urgencyColors[emergencyData.urgencyLevel].light}; color: ${urgencyColors[emergencyData.urgencyLevel].bg}; padding: 2px 8px; border-radius: 12px; font-weight: 600; font-size: 11px; margin-left: 4px;">
              ${urgencyColors[emergencyData.urgencyLevel].text}
            </span>
          </div>
          ${emergencyData.status ? `
            <div style="font-size: 12px; margin-bottom: 6px;">
              <strong style="color: #374151;">Status:</strong>
              <span style="color: #6b7280; text-transform: capitalize; margin-left: 4px;">
                ${emergencyData.status}
              </span>
            </div>
          ` : ''}
          ${emergencyData.additionalNotes ? `
            <div style="font-size: 12px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <strong style="color: #374151;">Notes:</strong><br>
              <span style="color: #6b7280;">${emergencyData.additionalNotes}</span>
            </div>
          ` : ''}
          ${emergencyData.createdAt ? `
            <div style="font-size: 11px; margin-top: 8px; color: #9ca3af;">
              <strong>Created:</strong> ${new Date(emergencyData.createdAt).toLocaleString()}
            </div>
          ` : ''}
        </div>
      `;
    }

    popupContent += `</div>`;

    const marker = L.marker([lat, lng], { icon: userIcon })
      .bindPopup(popupContent, { maxWidth: 300 })
      .addTo(map);

    const accuracyCircle = L.circle([lat, lng], {
      radius: accuracy,
      color: color,
      fillColor: color,
      fillOpacity: 0.1,
      weight: 2
    }).addTo(map);

    const markerData = { marker, circle: accuracyCircle, data: emergencyData || {} as EmergencyRecord };
    markersRef.current.push(markerData);
    
    // Only pan to location if it's a new emergency request
    if (!emergencyData?.createdAt) {
      map.setView([lat, lng], 15, { animate: true });
    }

    return true;
  };

  const handleEmergency = (): void => {
    setStatus('loading');
    setErrorMessage('');

    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('GPS not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const coords: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };

        const newEmergencyId = 'EMG-TEMP-' + Date.now();

        const isValidLocation = addEmergencyMarker(
          coords.latitude,
          coords.longitude,
          coords.accuracy,
          newEmergencyId
        );

        if (!isValidLocation) {
          return;
        }

        setLocation(coords);
        setEmergencyId(newEmergencyId);
        setStatus('form');
      },
      (error: GeolocationPositionError) => {
        setStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage('Location permission denied. Please enable GPS access.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setErrorMessage('Location request timed out.');
            break;
          default:
            setErrorMessage('An unknown error occurred.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const toggleNeed = (need: NeedType): void => {
    setSelectedNeeds(prev => 
      prev.includes(need) 
        ? prev.filter(n => n !== need)
        : [...prev, need]
    );
  };

  const handleSubmitRequest = async (): Promise<void> => {
    if (selectedNeeds.length === 0) {
      setErrorMessage('Please select at least one relief item');
      return;
    }

    if (!location) return;

    setStatus('loading');

    try {
      const response = await fetch(`${API_URL}/emergencies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          needs: selectedNeeds,
          numberOfPeople,
          urgencyLevel: urgencyLevel.toUpperCase(),
          additionalNotes: additionalNotes || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit request');
      }

      const newEmergency: EmergencyRecord = {
        ...location,
        id: data.data.id,
        needs: selectedNeeds,
        numberOfPeople,
        urgencyLevel,
        additionalNotes,
        status: 'pending',
        createdAt: data.data.createdAt,
        updatedAt: data.data.updatedAt
      };

      // Remove the temporary marker
      if (markersRef.current.length > 0) {
        const tempMarkerIndex = markersRef.current.findIndex(m => m.data.id?.includes('TEMP'));
        if (tempMarkerIndex !== -1) {
          const tempMarker = markersRef.current[tempMarkerIndex];
          if (mapInstanceRef.current) {
            mapInstanceRef.current.removeLayer(tempMarker.marker);
            mapInstanceRef.current.removeLayer(tempMarker.circle);
          }
          markersRef.current.splice(tempMarkerIndex, 1);
        }
      }

      // Add new marker with full emergency data
      addEmergencyMarker(
        location.latitude,
        location.longitude,
        location.accuracy,
        data.data.id,
        newEmergency
      );

      setEmergencies(prev => [...prev, newEmergency]);
      setStatus('success');
    } catch (error) {
      console.error('Error submitting request:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit request. Please try again.');
      setStatus('error');
    }
  };

  const handleReset = (): void => {
    setStatus('idle');
    setLocation(null);
    setEmergencyId(null);
    setSelectedNeeds([]);
    setNumberOfPeople(1);
    setUrgencyLevel('medium');
    setAdditionalNotes('');
    setErrorMessage('');
  };

  const handleClearAll = async (): Promise<void> => {
    if (!window.confirm('Are you sure you want to clear all emergency requests? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/emergencies`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear emergencies');
      }

      // Clear all markers from map
      if (mapInstanceRef.current) {
        markersRef.current.forEach(({ marker, circle }) => {
          mapInstanceRef.current?.removeLayer(marker);
          mapInstanceRef.current?.removeLayer(circle);
        });
        markersRef.current = [];
        mapInstanceRef.current.setView(CEBU_CENTER, 12, { animate: true });
      }

      setEmergencies([]);
      handleReset();
    } catch (error) {
      console.error('Error clearing emergencies:', error);
      alert('Failed to clear emergencies. Please try again.');
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Full Screen Map */}
      <div ref={mapRef} className="absolute inset-0 w-full h-full z-0"></div>

      {/* Minimal Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg">
          <span className="text-sm font-semibold text-gray-800">Emergency Relief - Cebu</span>
        </div>
        {emergencies.length > 0 && (
          <div className="bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg text-sm font-semibold">
            {emergencies.length} Active
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoadingEmergencies && (
        <div className="absolute top-20 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg z-10">
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin text-gray-600" />
            <span className="text-sm text-gray-600">Loading emergencies...</span>
          </div>
        </div>
      )}

      {/* Bottom Action Button */}
      {status === 'idle' && (
        <div className="absolute bottom-6 left-4 right-4 z-10">
          <div className="max-w-md mx-auto space-y-2">
            <button
              onClick={handleEmergency}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-full shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              Request Help
            </button>
            {emergencies.length > 0 && (
              <button
                onClick={handleClearAll}
                className="w-full bg-white/90 backdrop-blur hover:bg-white text-gray-700 font-medium py-2 px-6 rounded-full shadow-lg transition-all text-sm"
              >
                Clear All ({emergencies.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {(status === 'loading' || status === 'form' || status === 'success' || status === 'error') && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto">
            
            {/* Loading Modal */}
            {status === 'loading' && (
              <div className="p-10 text-center">
                <Loader className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-700 font-medium">
                  {location ? 'Submitting request...' : 'Locating you...'}
                </p>
              </div>
            )}

            {/* Form Modal */}
            {status === 'form' && location && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Request Relief</h3>
                  <button onClick={handleReset} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Location Info */}
                <div className="mb-5 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                  </div>
                </div>

                {/* Needs Selection */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-3">What do you need? *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {needOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => toggleNeed(option.value)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                          selectedNeeds.includes(option.value)
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {option.icon}
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of People */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of People *</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* Urgency Level */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['low', 'medium', 'high', 'critical'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setUrgencyLevel(level)}
                        className={`px-3 py-2 rounded-lg border font-medium text-sm transition-all ${
                          urgencyLevel === level
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Special needs, medical conditions, number of children, etc."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                  />
                </div>

                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmitRequest}
                  disabled={selectedNeeds.length === 0}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Submit Request
                </button>
              </div>
            )}

            {/* Success Modal */}
            {status === 'success' && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted!</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Your emergency request has been recorded. Help will be dispatched soon. Check the map for your marker.
                </p>
                
                <div className="space-y-2">
                  <button
                    onClick={handleReset}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-all"
                  >
                    Submit Another Request
                  </button>
                  
                  <button
                    onClick={() => setStatus('idle')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-6 rounded-lg transition-all text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Error Modal */}
            {status === 'error' && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
                <p className="text-sm text-red-600 mb-6">{errorMessage}</p>
                
                <button
                  onClick={() => {
                    setErrorMessage('');
                    if (location) {
                      setStatus('form');
                    } else {
                      setStatus('idle');
                    }
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}