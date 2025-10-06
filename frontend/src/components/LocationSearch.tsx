import { Loader, MapPin, Search, X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string>("");
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
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `format=json&` +
          `q=${encodeURIComponent(query + ", Cebu, Philippines")}&` +
          `limit=5&` +
          `countrycodes=ph&` +
          `viewbox=123.3,9.5,124.5,11.5&` +
          `bounded=1`,
        {
          headers: {
            "User-Agent": "EmergencyReliefApp/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data: SearchResult[] = await response.json();
      setSearchResults(data);

      if (data.length === 0) {
        setError("No results found in Cebu. Try a different search term.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(value);
      }, 800);
    } else {
      setSearchResults([]);
      setError("");
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onSelectLocation(lat, lng, result.display_name);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setError("");
    setIsSearching(false);
    onClose();
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-start justify-center p-4 pt-20">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border-2 border-gray-100">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Search Location
              </h3>
              <p className="text-xs text-gray-500">
                Find your emergency location
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-all hover:rotate-90 duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-5 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search address, barangay, or landmark in Cebu..."
              className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium bg-white shadow-sm"
            />
            {isSearching && (
              <Loader className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
            )}
            {searchQuery && !isSearching && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 ml-1 font-medium">
            💡 Type at least 3 characters to search
          </p>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-5">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-orange-800">{error}</p>
              </div>
            </div>
          )}

          {!error &&
            searchResults.length === 0 &&
            searchQuery.length >= 3 &&
            !isSearching && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-base font-semibold text-gray-700 mb-2">
                  No locations found
                </p>
                <p className="text-sm text-gray-500">
                  Try searching for a barangay, street, or landmark
                </p>
              </div>
            )}

          {searchResults.length > 0 && (
            <div className="divide-y divide-gray-100">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleSelectResult(result)}
                  className="w-full p-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all text-left flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 mb-1.5">
                      {result.display_name.split(",")[0]}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {result.display_name}
                    </p>
                    <div className="inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <p className="text-xs text-gray-600 font-mono">
                        {parseFloat(result.lat).toFixed(4)},{" "}
                        {parseFloat(result.lon).toFixed(4)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-blue-600" />
              </div>
              <p className="text-base font-bold text-gray-800 mb-2">
                Search for a location
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Enter an address, barangay, or landmark name
              </p>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 text-left max-w-md mx-auto border-2 border-blue-100">
                <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Example searches:
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  {[
                    "SM City Cebu",
                    "Barangay Lahug",
                    "Cebu City Hall",
                    "Carbon Market",
                  ].map((example) => (
                    <li key={example} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
