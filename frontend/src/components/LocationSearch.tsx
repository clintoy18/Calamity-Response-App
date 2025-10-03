// frontend/src/components/LocationSearch.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader, MapPin } from 'lucide-react';

interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

interface LocationSearchProps {
  isActive: boolean;
  onClose: () => void;
  onSelectLocation: (lat: number, lng: number, name: string) => void;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  isActive,
  onClose,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string>('');
  const searchTimeoutRef = useRef<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const performSearch = async (query: string) => {
    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      // Add delay to respect Nominatim's usage policy
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if we're in development mode (proxy available) or production
      const isDev = import.meta.env.DEV;
      const baseUrl = isDev 
        ? '/api/nominatim' // Use proxy in development
        : 'https://nominatim.openstreetmap.org'; // Direct URL in production

      const searchUrl = `${baseUrl}/search?` +
        `format=json&` +
        `q=${encodeURIComponent(query + ', Cebu, Philippines')}&` +
        `limit=5&` +
        `countrycodes=ph&` +
        `viewbox=123.3,9.5,124.5,11.5&` +
        `bounded=1`;

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'CalamityResponseApp/1.0',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const data: SearchResult[] = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      setSearchResults(data);

      if (data.length === 0) {
        setError('No results found in Cebu. Try a different search term.');
      }
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err instanceof Error 
        ? `Search failed: ${err.message}` 
        : 'Search failed. Please try again.';
      setError(errorMessage);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    if (value.trim().length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(value);
      }, 800);
    } else {
      setSearchResults([]);
      setError('');
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onSelectLocation(lat, lng, result.display_name);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError('');
    setIsSearching(false);
    onClose();
  };

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-start justify-center p-4 pt-20">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Search Location</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search address, barangay, or landmark in Cebu..."
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {isSearching && (
              <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
            )}
            {searchQuery && !isSearching && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Type at least 3 characters to search
          </p>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            </div>
          )}

          {!error && searchResults.length === 0 && searchQuery.length >= 3 && !isSearching && (
            <div className="p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No locations found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try searching for a barangay, street, or landmark
              </p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="divide-y divide-gray-200">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleSelectResult(result)}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left flex items-start gap-3"
                >
                  <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {result.display_name.split(',')[0]}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {result.display_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Search for a location</p>
              <p className="text-xs text-gray-400">
                Enter an address, barangay, or landmark name
              </p>
              <div className="mt-4 text-left max-w-md mx-auto">
                <p className="text-xs font-medium text-gray-700 mb-2">Example searches:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• SM City Cebu</li>
                  <li>• Barangay Lahug</li>
                  <li>• Cebu City Hall</li>
                  <li>• Carbon Market</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};