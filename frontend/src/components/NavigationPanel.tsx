// frontend/src/components/NavigationPanel.tsx
import React, { useState } from "react";
import { LogIn, Users, MapPin, Menu, X, Globe2 } from "lucide-react";

interface NavigationPanelProps {
  isAuthenticated: boolean;
  userRole: string | null;
  onLoginClick: () => void;
  onResponderClick: () => void;
  onDashboardClick: () => void;
  onLogout: () => void;
  onCenterMap: (location: string) => void; // 🆕 Added prop
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  isAuthenticated,
  userRole,
  onLoginClick,
  onResponderClick,
  onDashboardClick,
  onLogout,
  onCenterMap,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const buttonBaseClass =
    "flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm w-full";

  const buttonVariants = {
    info: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
    warning:
      "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700",
    success:
      "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700",
    secondary:
      "bg-white/95 text-gray-800 hover:bg-white border-2 border-gray-200",
  };

  const handleAuthAction = () => {
    if (!isAuthenticated) {
      onLoginClick();
    } else if (userRole === "admin") {
      onDashboardClick();
    } else {
      onLogout();
    }
    setIsMenuOpen(false);
  };

  const getAuthButtonText = () => {
    if (!isAuthenticated) return "Login";
    if (userRole === "admin") return "Dashboard";
    return "Logout";
  };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-5 right-4 z-50 flex items-center justify-center w-12 h-12 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-gray-200"
      >
        {isMenuOpen ? (
          <X className="w-5 h-5 text-gray-800" />
        ) : (
          <Menu className="w-5 h-5 text-gray-800" />
        )}
      </button>

      {/* Side Menu */}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto p-6 pt-24">
          {/* Account Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Account
            </h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAuthAction}
                className={`${buttonBaseClass} ${buttonVariants.info} text-sm`}
              >
                <LogIn className="w-5 h-5" />
                {getAuthButtonText()}
              </button>
              {(!isAuthenticated || userRole !== "respondent") && (
                <button
                  onClick={() => {
                    onResponderClick();
                    setIsMenuOpen(false);
                  }}
                  className={`${buttonBaseClass} ${buttonVariants.warning} text-sm`}
                >
                  <Users className="w-5 h-5" />
                  Become a Responder
                </button>
              )}
            </div>
          </div>

          {/* Quick Map Actions */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Map Locations
            </h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  onCenterMap("cebu");
                  setIsMenuOpen(false);
                }}
                className={`${buttonBaseClass} ${buttonVariants.secondary} text-sm`}
              >
                <Globe2 className="w-5 h-5 text-blue-600" />
                Center on Cebu
              </button>

              <button
                onClick={() => {
                  onCenterMap("davao");
                  setIsMenuOpen(false);
                }}
                className={`${buttonBaseClass} ${buttonVariants.secondary} text-sm`}
              >
                <Globe2 className="w-5 h-5 text-red-600" />
                Center on Davao Oriental
              </button>
            </div>
          </div>

          {/* External Links */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Quick Actions
            </h3>
            <div className="flex flex-col gap-3">
              <a
                href="https://services.cebu.gov.ph/aidmap/rdm"
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonBaseClass} ${buttonVariants.success} text-sm no-underline`}
                onClick={() => setIsMenuOpen(false)}
              >
                <MapPin className="w-5 h-5" />
                Response Tracker
              </a>
            </div>
          </div>

          {/* Info */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Cebu Calamity Response App
            </p>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};
