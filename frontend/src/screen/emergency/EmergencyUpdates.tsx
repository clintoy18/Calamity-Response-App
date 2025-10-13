import React, { useMemo, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Globe, 
  RefreshCw, 
  X, 
  MapPin,
  AlertCircle,
} from "lucide-react";

interface Municipality {
  name: string;
  latitude: number;
  longitude: number;
}

interface ProvinceData {
  province: string;
  count: number;
  latitude: number;
  longitude: number;
  municipalities: Municipality[];
}

interface Props {
  provinces: ProvinceData[];
  loading: boolean;
  error: string | null;
  selectedProvince: ProvinceData | null;
  isMobile: boolean;
  onProvinceClick: (province: ProvinceData) => void;
  onRefresh: () => void;
  showSidebar: boolean;
  toggleSidebar: () => void;
}

const EarthquakeUpdates: React.FC<Props> = ({
  provinces,
  loading,
  error,
  selectedProvince,
  onProvinceClick,
  onRefresh,
  showSidebar,
  toggleSidebar,
}) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const getSeverityColor = useCallback((count: number) => {
    if (count > 500) return "bg-red-500";
    if (count > 100) return "bg-orange-500";
    if (count > 50) return "bg-yellow-500";
    if (count > 10) return "bg-blue-500";
    return "bg-green-500";
  }, []);

  const getSeverityBorderColor = useCallback((count: number) => {
    if (count > 500) return "border-red-500";
    if (count > 100) return "border-orange-500";
    if (count > 50) return "border-yellow-500";
    if (count > 10) return "border-blue-500";
    return "border-green-500";
  }, []);

  const getSeverityLabel = useCallback((count: number) => {
    if (count > 500) return "Critical";
    if (count > 100) return "High";
    if (count > 50) return "Medium";
    if (count > 10) return "Moderate";
    return "Low";
  }, []);

  const displayedProvinces = useMemo(() => {
    return isDesktop ? provinces.slice(0, 10) : provinces.slice(0, 6);
  }, [provinces, isDesktop]);

  const maxCount = useMemo(() => provinces[0]?.count || 1, [provinces]);

  return (
    <AnimatePresence>
      {showSidebar && (
        <motion.div
          initial={isDesktop ? { x: "-100%", opacity: 0 } : { y: "100%", opacity: 0 }}
          animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
          exit={isDesktop ? { x: "-100%", opacity: 0 } : { y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="fixed z-[999] bg-white shadow-xl flex flex-col overflow-hidden bottom-0 left-0 w-full h-[45vh] rounded-t-2xl md:top-0 md:h-full md:w-80 md:rounded-r-xl md:rounded-t-none"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <h2 className="text-lg font-bold">Earthquake Hotspots</h2>
                <p className="text-xs opacity-90">Real-time monitoring</p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-2" />
              <p className="text-gray-600 text-sm">Loading data...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-red-600 mb-1 font-semibold text-sm">{error}</p>
              <p className="text-gray-500 text-xs mb-3">Unable to fetch data</p>
              <button
                onClick={onRefresh}
                className="px-4 py-2 bg-blue-600 rounded-lg text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {/* Province List */}
          {!loading && !error && (
            <>
              <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
                {displayedProvinces.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Globe className="w-10 h-10 mb-2" />
                    <p className="text-sm">No data available</p>
                  </div>
                ) : (
                  displayedProvinces.map((province) => (
                    <div
                      key={province.province}
                      onClick={() => onProvinceClick(province)}
                      className={`
                        p-2.5 rounded-lg cursor-pointer border-2 bg-white transition-all
                        ${selectedProvince?.province === province.province
                          ? `${getSeverityBorderColor(province.count)} shadow-md`
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }
                      `}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 truncate">
                            {province.province}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{province.municipalities.length} municipalities</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end ml-2">
                          <div className={`px-1.5 py-0.5 rounded-full text-white text-xs font-bold ${getSeverityColor(province.count)} flex items-center gap-1`}>
                            {getSeverityLabel(province.count)}
                          </div>
                          <span className="text-lg font-bold text-gray-900 mt-0.5">
                            {province.count}
                          </span>
                          <span className="text-xs text-gray-500">events</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min((province.count / maxCount) * 100, 100)}%` }}
                          className={`${getSeverityColor(province.count)} h-1.5 rounded-full transition-all duration-500`}
                        />
                      </div>

                      {/* Severity Indicator */}
                      <div className="mt-1.5 flex items-center justify-between text-xs text-gray-500">
                        <span>Severity</span>
                        <span className="font-semibold">
                          {Math.round((province.count / maxCount) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-gray-200 bg-white">
                <button
                  onClick={onRefresh}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Data
                </button>
                <p className="text-center text-xs text-gray-500 mt-1.5">
                  Updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EarthquakeUpdates;