import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  Shield,
  Map,
  Activity,
  X,
  ChevronDown,
  MapPin,
} from "lucide-react";

interface Municipality {
  name: string;
  latitude: number;
  longitude: number;
}

interface Province {
  province: string;
  count: number;
  mainshockCount: number;
  aftershockCount: number;
  municipalities: Municipality[];
  latitude: number;
  longitude: number;
  region: string;
}

interface RegionData {
  region: string;
  totalEarthquakes: number;
  totalMainshocks: number;
  totalAftershocks: number;
  provinces: Province[];
  latitude: number;
  longitude: number;
}

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
  onCenterMap?: (location: string, lat: number, lng: number) => void;
  loggedIn: boolean;
  isAuthenticated?: boolean;
  userRole?: string | null;
  onLoginClick?: () => void;
  onResponderClick?: () => void;
  onDashboardClick?: () => void;
  onLogout?: () => void;
  provincesData?: RegionData[];
}

const APP_VERSION = "v1.2.0";

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onCenterMap,
  isAuthenticated,
  userRole,
  onLoginClick,
  onResponderClick,
  onDashboardClick,
  onLogout,
  provincesData = [],
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["account", "map_locations"])
  );
  const [expandedProvinces, setExpandedProvinces] = useState<Set<string>>(new Set());
  const [expandedMunicipalities, setExpandedMunicipalities] = useState<Set<string>>(new Set());

  // ✅ Dynamic menu logic based on role & authentication + dynamic provinces
  const menuItems = useMemo(() => {
    const isAdmin = userRole === "admin";
    const isRespondent = userRole === "respondent";

    let accountItems = [];

    if (isRespondent) {
      accountItems = [{ id: "logout", label: "Logout", icon: Shield }];
    } else if (isAdmin) {
      accountItems = [
        { id: "dashboard", label: "Go to Dashboard", icon: Activity },
        { id: "logout", label: "Logout", icon: Shield },
      ];
    } else if (isAuthenticated) {
      accountItems = [
        { id: "dashboard", label: "Go to Dashboard", icon: Activity },
        { id: "logout", label: "Logout", icon: Shield },
      ];
    } else {
      accountItems = [
        { id: "login", label: "Login", icon: Activity },
        { id: "become_responder", label: "Become a Responder", icon: Shield },
      ];
    }

    // ✅ Build map locations dynamically from provinces data WITH MUNICIPALITY COORDINATES
    const mapLocationItems = provincesData.map((region) => ({
      id: region.region.toLowerCase().replace(/\s+/g, "_"),
      label: `${region.region} (${region.totalEarthquakes})`,
      icon: MapPin,
      latitude: region.latitude,
      longitude: region.longitude,
      provinces: region.provinces.map((province) => ({
        id: `${region.region}_${province.province}`.toLowerCase().replace(/\s+/g, "_"),
        label: `${province.province} (${province.count})`,
        icon: Map,
        latitude: province.latitude,
        longitude: province.longitude,
        municipalities: province.municipalities.map((municipality) => ({
          id: `${region.region}_${province.province}_${municipality.name}`.toLowerCase().replace(/\s+/g, "_"),
          name: municipality.name,
          latitude: municipality.latitude,
          longitude: municipality.longitude,
        })),
      })),
    }));

    return [
      {
        id: "account",
        label: "Account",
        icon: User,
        items: accountItems,
      },
      {
        id: "map_locations",
        label: "Map Locations",
        icon: Map,
        items: mapLocationItems,
      },
    ];
  }, [isAuthenticated, userRole, provincesData]);

  // ✅ Toggle expand for sections
  const toggleSection = (id: string) => {
    setExpanded((prev) => {
      const s = new Set(prev);
      if (s.has(id)) {
        s.delete(id);
      } else {
        s.add(id);
      }
      return s;
    });
  };

  // ✅ Toggle expand for provinces
  const toggleProvince = (id: string) => {
    setExpandedProvinces((prev) => {
      const s = new Set(prev);
      if (s.has(id)) {
        s.delete(id);
      } else {
        s.add(id);
      }
      return s;
    });
  };

  // ✅ Toggle expand for municipalities
  const toggleMunicipality = (id: string) => {
    setExpandedMunicipalities((prev) => {
      const s = new Set(prev);
      if (s.has(id)) {
        s.delete(id);
      } else {
        s.add(id);
      }
      return s;
    });
  };

  // ✅ Click handler with coordinates support and NO RELOAD on logout
  const handleClick = (id: string, latitude?: number, longitude?: number, closeMenu: boolean = true) => {
    switch (id) {
      case "login":
        onLoginClick?.();
        if (closeMenu) onClose();
        break;
      case "become_responder":
        onResponderClick?.();
        if (closeMenu) onClose();
        break;
      case "dashboard":
        onDashboardClick?.();
        if (closeMenu) onClose();
        break;
      case "logout":
        // ✅ Use global logout handler instead of window.location.reload()
        if (window.handleLogout) {
          window.handleLogout();
        } else {
          onLogout?.();
        }
        if (closeMenu) onClose();
        break;
      default:
        // ✅ Navigate using coordinates if available for map centering
        if (latitude !== undefined && longitude !== undefined) {
          onCenterMap?.(id, latitude, longitude);
          if (closeMenu) {
            // Close all expanded sections when navigating
            setExpandedProvinces(new Set());
            setExpandedMunicipalities(new Set());
            onClose();
          }
        } else {
          onNavigate(id);
          if (closeMenu) onClose();
        }
        break;
    }
  };

  const buttonBaseClass =
    "flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-all duration-150";
  const buttonVariants = {
    success: "bg-green-600 hover:bg-green-700 text-white shadow",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />

          {/* Slide-in Menu */}
          <motion.div
            className="fixed top-0 right-0 w-80 h-full bg-white z-50 shadow-xl flex flex-col border-l border-gray-200"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-bold tracking-wide">Menu</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-3 space-y-4 overflow-y-auto flex-1">
              {menuItems.map((section) => (
                <div key={section.id}>
                  <button
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-sm"
                    onClick={() =>
                      section.items.length
                        ? toggleSection(section.id)
                        : handleClick(section.id)
                    }
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100">
                        <section.icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium truncate">
                        {section.label}
                      </span>
                    </div>
                    {section.items.length > 0 && (
                      <ChevronDown 
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          expanded.has(section.id) ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Nested items - Regions or Account items */}
                  <AnimatePresence>
                    {section.items.length > 0 && expanded.has(section.id) && (
                      <motion.div
                        className="ml-3 border-l-2 border-gray-200 pl-3 space-y-1 overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                      >
                        {section.items.map((item: any) => (
                          <div key={item.id}>
                            {/* Region/Item Button */}
                            <button
                              onClick={() => {
                                if (item.provinces && item.provinces.length > 0) {
                                  toggleProvince(item.id);
                                } else {
                                  handleClick(item.id, item.latitude, item.longitude);
                                }
                              }}
                              className="w-full flex items-center justify-between gap-2 p-2 rounded-md hover:bg-blue-50 text-xs transition-colors duration-150"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <item.icon className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                <span className="truncate">{item.label}</span>
                              </div>
                              {item.provinces && item.provinces.length > 0 && (
                                <ChevronDown 
                                  className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                                    expandedProvinces.has(item.id) ? 'rotate-180' : ''
                                  }`}
                                />
                              )}
                            </button>

                            {/* Provinces nested under Region */}
                            <AnimatePresence>
                              {item.provinces && item.provinces.length > 0 && expandedProvinces.has(item.id) && (
                                <motion.div
                                  className="ml-3 border-l-2 border-blue-100 pl-2 space-y-1 mt-1"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.15, ease: "easeInOut" }}
                                >
                                  {item.provinces.map((province: any) => (
                                    <div key={province.id}>
                                      {/* Province Button */}
                                      <button
                                        onClick={() => {
                                          if (province.municipalities && province.municipalities.length > 0) {
                                            toggleMunicipality(province.id);
                                          } else {
                                            handleClick(province.id, province.latitude, province.longitude);
                                          }
                                        }}
                                        className="w-full flex items-center justify-between gap-2 p-1.5 rounded-md hover:bg-green-50 text-xs transition-colors duration-150"
                                      >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <province.icon className="w-3 h-3 text-green-600 flex-shrink-0" />
                                          <span className="truncate text-left">{province.label}</span>
                                        </div>
                                        {province.municipalities && province.municipalities.length > 0 && (
                                          <ChevronDown 
                                            className={`w-3 h-3 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                                              expandedMunicipalities.has(province.id) ? 'rotate-180' : ''
                                            }`}
                                          />
                                        )}
                                      </button>

                                      {/* Municipalities nested under Province */}
                                      <AnimatePresence>
                                        {province.municipalities && province.municipalities.length > 0 && expandedMunicipalities.has(province.id) && (
                                          <motion.div
                                            className="ml-3 border-l-2 border-green-100 pl-2 space-y-1 mt-1"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.15, ease: "easeInOut" }}
                                          >
                                            {province.municipalities.map((municipality: any) => (
                                              <button
                                                key={municipality.id}
                                                onClick={() =>
                                                  handleClick(
                                                    municipality.id,
                                                    municipality.latitude,
                                                    municipality.longitude
                                                  )
                                                }
                                                className="w-full flex items-center gap-2 p-1.5 rounded-md hover:bg-orange-50 text-xs transition-colors duration-150"
                                              >
                                                <MapPin className="w-2.5 h-2.5 text-orange-600 flex-shrink-0" />
                                                <span className="truncate text-left">{municipality.name}</span>
                                              </button>
                                            ))}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Quick Actions */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Quick Actions
                </h3>
                <div className="flex flex-col gap-3">
                  <a
                    href="https://services.cebu.gov.ph/aidmap/rdm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${buttonBaseClass} ${buttonVariants.success} text-sm no-underline`}
                    onClick={onClose}
                  >
                    <MapPin className="w-5 h-5" />
                    Response Tracker
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-gray-200 text-xs text-center text-gray-400">
                Cebu Calamity App {APP_VERSION}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};