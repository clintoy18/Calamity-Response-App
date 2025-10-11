import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AlertCircle, MapPin, Search, X, CheckCircle, Loader2, Navigation, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";

// Nominatim search result type
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// Modern search result card
const SearchResultItem = React.memo(
  ({ result, onClick }: { result: NominatimResult; onClick: (r: NominatimResult) => void }) => {
    // Parse display name into parts
    const parts = result.display_name.split(',').map(p => p.trim());
    const primary = parts[0];
    const secondary = parts.slice(1, 3).join(', ');
    
    return (
      <motion.button
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        onClick={() => onClick(result)}
        className="w-full text-left p-3 rounded-xl bg-surface hover:bg-background border border-border hover:border-action/40 transition-all duration-200 group shadow-soft hover:shadow-medium"
        style={{ willChange: "transform, opacity" }}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-action/20 to-action/10 flex items-center justify-center flex-shrink-0 group-hover:from-action/30 group-hover:to-action/20 transition-all">
            <MapPin size={18} className="text-action" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text mb-0.5">{primary}</p>
            {secondary && (
              <p className="text-xs text-text-muted line-clamp-1">{secondary}</p>
            )}
          </div>
          <Navigation size={16} className="text-action mt-1.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>
      </motion.button>
    );
  }
);

interface EmergencyPanelProps {
  status: string;
  onRequestHelp: () => void;
  isPinpointMode: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onConfirm: (lat: number, lng: number) => void;
  selectedLocation: { lat: number; lng: number } | null;
  isSearchOpen: boolean;
  onOpenSearch: () => void;
  onClose: () => void;
  onSelectLocation: (lat: number, lng: number, name: string) => void;
}

export const EmergencyPanel: React.FC<EmergencyPanelProps> = ({
  onRequestHelp,
  isPinpointMode,
  onActivate,
  onDeactivate,
  onConfirm,
  selectedLocation,
  isSearchOpen,
  onOpenSearch,
  onClose,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400);
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const cacheRef = useRef<Record<string, NominatimResult[]>>({});
  const [messagePosition, setMessagePosition] = useState<"top" | "bottom">("bottom");

  // Fetch results with caching
  const fetchSearchResults = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    if (cacheRef.current[query]) {
      setSearchResults(cacheRef.current[query]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
        { headers: { "User-Agent": "EmergencyApp/1.0 (contact@example.com)" } }
      );
      const data: NominatimResult[] = await response.json();
      const limited = data.slice(0, 8);
      cacheRef.current[query] = limited;
      setSearchResults(limited);
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery) {
      fetchSearchResults(debouncedQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery, fetchSearchResults]);

  // Handle responsive message bubble position
  useEffect(() => {
    const updatePosition = () => {
      const isSmallScreen = window.innerHeight < 600;
      const hasScrolled = window.scrollY > 100;
      setMessagePosition(isSmallScreen || hasScrolled ? "top" : "bottom");
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, []);

  const handleSelectResult = useCallback(
    (result: NominatimResult) => {
      onSelectLocation(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
      setSearchQuery("");
      setSearchResults([]);
      onClose();
    },
    [onSelectLocation, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchResults([]);
      setSearchQuery("");
      onClose();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  // Memoized search list for performance
  const searchList = useMemo(() => {
    return searchResults.map((result) => (
      <SearchResultItem key={result.place_id} result={result} onClick={handleSelectResult} />
    ));
  }, [searchResults, handleSelectResult]);

  return (
    <>
      {/* Floating Pinpoint Message Bubble */}
      <AnimatePresence>
        {isPinpointMode && (
          <motion.div
            key="pin-message"
            className={`w-full flex justify-center absolute ${
              messagePosition === "top" ? "top-4" : "bottom-36"
            } left-0 z-40 pointer-events-none px-4`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ willChange: "transform, opacity" }}
          >
            <div className="relative bg-surface shadow-strong backdrop-blur-lg px-5 py-3.5 rounded-2xl text-sm text-text font-sans max-w-sm mx-auto flex items-center gap-3 border border-border">
              {selectedLocation ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={18} className="text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text mb-0.5">Location Confirmed!</p>
                    <p className="text-xs text-text-muted">Tap confirm to continue</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-action/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <MapPin size={18} className="text-action" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text">Select Your Location</p>
                    <p className="text-xs text-text-muted">Tap anywhere on the map</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Main Panel */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 flex justify-center z-20 sm:px-2 pointer-events-none"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        style={{ willChange: "transform, opacity" }}
      >
        <div className="pointer-events-auto w-full max-w-md bg-surface shadow-strong backdrop-blur-xl rounded-t-3xl border-t-2 border-x-2 border-border/50">
          <div className="p-5 space-y-3 font-sans">
            {isPinpointMode ? (
              <>
                {selectedLocation && (
                  <Button
                    label="Confirm Location"
                    icon={<CheckCircle size={18} />}
                    variant="success"
                    fullWidth
                    onClick={() =>
                      onConfirm(selectedLocation.lat, selectedLocation.lng)
                    }
                  />
                )}
                <Button
                  label="Cancel"
                  icon={<X size={16} />}
                  variant="warning"
                  fullWidth
                  onClick={onDeactivate}
                />
              </>
            ) : (
              <>
                <Button
                  label="Request Emergency Help"
                  icon={<AlertCircle size={18} />}
                  variant="emergency"
                  fullWidth
                  onClick={onRequestHelp}
                />
                <div className="pt-2 border-t border-border/30">
                  <p className="text-xs text-text-muted text-center mb-3 font-medium">
                    Choose location method
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      label="Pin on Map"
                      icon={<MapPin size={16} />}
                      variant="primary"
                      fullWidth
                      onClick={onActivate}
                    />
                    <Button
                      label="Search Place"
                      icon={<Search size={16} />}
                      variant="primary"
                      fullWidth
                      onClick={onOpenSearch}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Ultra-Modern Search Modal */}
      <AnimatePresence mode="wait">
        {isSearchOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSearchResults([]);
              setSearchQuery("");
              onClose();
            }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="bg-surface rounded-3xl w-full max-w-md shadow-strong overflow-hidden border border-border/30"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              style={{ willChange: "transform, opacity" }}
            >
              {/* Sleek Search Header */}
              <div className="p-5 border-b border-border/30 bg-gradient-to-br from-action/5 to-transparent">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-action/20 to-action/10 flex items-center justify-center shadow-soft">
                      <Search size={22} className="text-action" />
                    </div>
                    <div>
                      <h2 className="text-lg font-heading font-bold text-text">Find Location</h2>
                      <p className="text-xs text-text-muted">Search any place or address</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSearchResults([]);
                      setSearchQuery("");
                      onClose();
                    }}
                    className="w-10 h-10 rounded-xl hover:bg-background flex items-center justify-center transition-all duration-150 hover:rotate-90"
                    aria-label="Close search"
                  >
                    <X size={20} className="text-text-muted" />
                  </button>
                </div>

                {/* Modern Search Input */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Search size={20} className="text-text-muted" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a place, street, or landmark..."
                    autoFocus
                    className="w-full pl-12 pr-12 py-3.5 bg-background/50 border-2 border-border hover:border-action/30 focus:border-action rounded-xl focus:outline-none text-sm font-sans placeholder:text-text-muted transition-all duration-150 shadow-soft"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {searchQuery && !isSearching && (
                      <button
                        onClick={handleClearSearch}
                        className="w-7 h-7 rounded-lg hover:bg-border/50 flex items-center justify-center transition-colors"
                      >
                        <X size={16} className="text-text-muted" />
                      </button>
                    )}
                    {isSearching && (
                      <div className="w-7 h-7 flex items-center justify-center">
                        <Loader2 size={18} className="text-action animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Results Area */}
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between px-2 mb-2">
                      <p className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={12} />
                        {searchResults.length} Location{searchResults.length !== 1 ? 's' : ''} Found
                      </p>
                    </div>
                    <AnimatePresence mode="popLayout">
                      {searchList}
                    </AnimatePresence>
                  </div>
                )}

                {/* Loading State */}
                {isSearching && searchQuery && (
                  <div className="px-4 py-20 text-center">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-action/20 to-action/10 flex items-center justify-center shadow-soft">
                      <Loader2 size={32} className="text-action animate-spin" />
                    </div>
                    <p className="text-base font-semibold text-text mb-1">Searching...</p>
                    <p className="text-xs text-text-muted">Finding the best matches</p>
                  </div>
                )}

                {/* Empty State - No Query */}
                {!searchQuery && !isSearching && (
                  <div className="px-4 py-20 text-center">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-action/10 to-transparent flex items-center justify-center shadow-soft">
                      <MapPin size={36} className="text-action" />
                    </div>
                    <p className="text-base font-semibold text-text mb-2">Search for a Location</p>
                    <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
                      Enter a street address, landmark, or place name to find your exact location
                    </p>
                  </div>
                )}

                {/* Empty State - No Results */}
                {!isSearching && searchQuery && searchResults.length === 0 && (
                  <div className="px-4 py-20 text-center">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-background flex items-center justify-center shadow-soft">
                      <Search size={36} className="text-text-muted" />
                    </div>
                    <p className="text-base font-semibold text-text mb-2">No Results Found</p>
                    <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed mb-4">
                      We couldn't find any locations matching <span className="font-medium text-text">"{searchQuery}"</span>
                    </p>
                    <p className="text-xs text-action font-medium">
                      Try different keywords or check spelling
                    </p>
                  </div>
                )}
              </div>

              {/* Helpful Footer */}
              {searchResults.length === 0 && !isSearching && searchQuery && (
                <div className="p-4 border-t border-border/30 bg-gradient-to-br from-background/50 to-transparent">
                  <div className="flex items-start gap-2 text-xs text-text-muted">
                    <Sparkles size={14} className="text-action mt-0.5 flex-shrink-0" />
                    <p>
                      <span className="font-semibold text-text">Pro tip:</span> Try searching for "City Hall", "Hospital", or nearby landmarks
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};  