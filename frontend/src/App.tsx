import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, MapPin, CheckCircle, Loader, Package, Users, Droplet, Home } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

type Status = 'idle' | 'loading' | 'pinned' | 'form' | 'success' | 'error';

type NeedType = 'food' | 'water' | 'medical' | 'shelter' | 'clothing' | 'other';

interface EmergencyRequest {
  needs: NeedType[];
  numberOfPeople: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  additionalNotes: string;
}

interface EmergencyRecord extends Location, EmergencyRequest {
  id: string;
}

export default function EmergencyApp() {
  const [status, setStatus] = useState<Status>('idle');
  const [location, setLocation] = useState<Location | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [emergencyId, setEmergencyId] = useState<string | null>(null);
  const [emergencies, setEmergencies] = useState<EmergencyRecord[]>([]);
  
  // Form states
  const [selectedNeeds, setSelectedNeeds] = useState<NeedType[]>([]);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Array<{ marker: L.Marker; circle: L.Circle }>>([]);

  // Cebu City center coordinates
  const CEBU_CENTER: L.LatLngExpression = [10.3157, 123.8854];
  const CEBU_BOUNDS: L.LatLngBoundsExpression = [
    [9.8, 123.3],
    [10.8, 124.4]
  ];

  const needOptions: Array<{ value: NeedType; label: string; icon: React.ReactNode }> = [
    { value: 'food', label: 'Food', icon: <Package className="w-5 h-5" /> },
    { value: 'water', label: 'Water', icon: <Droplet className="w-5 h-5" /> },
    { value: 'medical', label: 'Medical', icon: <AlertCircle className="w-5 h-5" /> },
    { value: 'shelter', label: 'Shelter', icon: <Home className="w-5 h-5" /> },
    { value: 'clothing', label: 'Clothing', icon: <Users className="w-5 h-5" /> },
    { value: 'other', label: 'Other', icon: <Package className="w-5 h-5" /> },
  ];

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: CEBU_CENTER,
      zoom: 12,
      maxBounds: CEBU_BOUNDS,
      maxBoundsViscosity: 1.0,
      minZoom: 10,
      maxZoom: 18
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const addEmergencyMarker = (lat: number, lng: number, accuracy: number, id: string): boolean => {
    if (!mapInstanceRef.current) return false;

    const map = mapInstanceRef.current;

    const isInCebu = lat >= 9.8 && lat <= 10.8 && lng >= 123.3 && lng <= 124.4;

    if (!isInCebu) {
      setErrorMessage('Location is outside Cebu area. This service is only available in Cebu.');
      setStatus('error');
      return false;
    }

    const userIcon = L.divIcon({
      html: `<div style="background-color: #2563eb; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <div style="color: white; font-size: 14px; font-weight: bold;">📍</div>
      </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
      className: ''
    });

    const marker = L.marker([lat, lng], { icon: userIcon })
      .bindPopup(`
        <div style="text-align: center;">
          <strong>Your Location</strong><br>
          <small>ID: ${id}<br>
          Lat: ${lat.toFixed(6)}<br>
          Lng: ${lng.toFixed(6)}<br>
          Accuracy: ±${Math.round(accuracy)}m</small>
        </div>
      `)
      .addTo(map)
      .openPopup();

    const accuracyCircle = L.circle([lat, lng], {
      radius: accuracy,
      color: '#2563eb',
      fillColor: '#93c5fd',
      fillOpacity: 0.2,
      weight: 2
    }).addTo(map);

    markersRef.current.push({ marker, circle: accuracyCircle });
    map.setView([lat, lng], 15, { animate: true });

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

        const newEmergencyId = 'EMG-' + Date.now();

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
        setStatus('pinned');
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

  const handleContinueToForm = (): void => {
    setStatus('form');
  };

  const toggleNeed = (need: NeedType): void => {
    setSelectedNeeds(prev => 
      prev.includes(need) 
        ? prev.filter(n => n !== need)
        : [...prev, need]
    );
  };

  const handleSubmitRequest = (): void => {
    if (selectedNeeds.length === 0) {
      setErrorMessage('Please select at least one need');
      return;
    }

    if (!location || !emergencyId) return;

    const newEmergency: EmergencyRecord = {
      ...location,
      id: emergencyId,
      needs: selectedNeeds,
      numberOfPeople,
      urgencyLevel,
      additionalNotes
    };

    setEmergencies(prev => [...prev, newEmergency]);
    setStatus('success');
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

  const handleClearAll = (): void => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex flex-col">
      {/* Map Container */}
      <div className="relative w-full h-96 bg-gray-200">
        <div ref={mapRef} className="w-full h-full z-0"></div>
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
          <p className="text-sm font-semibold text-gray-700">📍 Cebu Area Coverage</p>
        </div>
        {emergencies.length > 0 && (
          <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
            <p className="text-sm font-semibold text-gray-700">Total Requests: {emergencies.length}</p>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Emergency Help</h1>
            <p className="text-gray-600">Request relief goods and emergency assistance in Cebu</p>
          </div>

          {status === 'idle' && (
            <>
              <button
                onClick={handleEmergency}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-8 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg text-xl mb-4"
              >
                <MapPin className="inline-block mr-2 w-6 h-6" />
                Pin My Location
              </button>
              
              {emergencies.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all text-sm"
                >
                  Clear All Requests
                </button>
              )}
            </>
          )}

          {status === 'loading' && (
            <div className="text-center py-6">
              <Loader className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-700 font-semibold">Getting your location...</p>
              <p className="text-gray-500 text-sm mt-2">Please wait</p>
            </div>
          )}

          {status === 'pinned' && location && (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Location Pinned!</h3>
              <p className="text-gray-600 mb-4">Now tell us what you need</p>
              
              <div className="bg-gray-50 rounded-lg p-4 text-left mb-4">
                <p className="text-sm text-gray-600 mb-1">Emergency ID: <span className="font-mono font-semibold">{emergencyId}</span></p>
                <p className="text-sm text-gray-600 mb-1">Latitude: <span className="font-mono">{location.latitude.toFixed(6)}</span></p>
                <p className="text-sm text-gray-600">Longitude: <span className="font-mono">{location.longitude.toFixed(6)}</span></p>
              </div>

              <button
                onClick={handleContinueToForm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Continue to Request Form
              </button>
            </div>
          )}

          {status === 'form' && (
            <div className="py-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">What do you need?</h3>
              
              {/* Needs Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Relief Items</label>
                <div className="grid grid-cols-2 gap-2">
                  {needOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleNeed(option.value)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        selectedNeeds.includes(option.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {option.icon}
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of People */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of People</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Urgency Level */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency Level</label>
                <select
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low - Can wait a few days</option>
                  <option value="medium">Medium - Within 24 hours</option>
                  <option value="high">High - Urgent, same day</option>
                  <option value="critical">Critical - Immediate</option>
                </select>
              </div>

              {/* Additional Notes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any specific needs or special circumstances..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              <button
                onClick={handleSubmitRequest}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all mb-2"
              >
                Submit Emergency Request
              </button>
              
              <button
                onClick={handleReset}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Request Submitted!</h3>
              <p className="text-gray-600 mb-4">Help is on the way</p>
              
              {location && (
                <div className="bg-gray-50 rounded-lg p-4 text-left mb-4">
                  <p className="text-sm text-gray-600 mb-2"><strong>Request ID:</strong> <span className="font-mono">{emergencyId}</span></p>
                  <p className="text-sm text-gray-600 mb-2"><strong>Needs:</strong> {selectedNeeds.join(', ')}</p>
                  <p className="text-sm text-gray-600 mb-2"><strong>People:</strong> {numberOfPeople}</p>
                  <p className="text-sm text-gray-600 mb-2"><strong>Urgency:</strong> <span className="capitalize">{urgencyLevel}</span></p>
                  {additionalNotes && (
                    <p className="text-sm text-gray-600"><strong>Notes:</strong> {additionalNotes}</p>
                  )}
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all mb-2"
              >
                Submit Another Request
              </button>
              
              <button
                onClick={handleClearAll}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-all text-sm"
              >
                Clear All & Close
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-6">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Error</h3>
              <p className="text-red-600 mb-6">{errorMessage}</p>
              
              <button
                onClick={() => setStatus('idle')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              All emergency requests are stored in memory. This system helps coordinate relief goods distribution in Cebu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}