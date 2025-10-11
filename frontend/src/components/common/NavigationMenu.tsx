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

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
  onCenterMap?: (location: string) => void;
  loggedIn: boolean;
  isAuthenticated?: boolean;
  userRole?: string | null;
  onLoginClick?: () => void;
  onResponderClick?: () => void;
  onDashboardClick?: () => void;
  onLogout?: () => void;
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
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["account", "map_locations"])
  );

  // ✅ Dynamic menu logic based on role & authentication
  const menuItems = useMemo(() => {
    const isAdmin = userRole === "admin";
    const isRespondent = userRole === "respondent";

    let accountItems = [];

    if (isRespondent) {
      // ✅ Respondents only see logout
      accountItems = [{ id: "logout", label: "Logout", icon: Shield }];
    } else if (isAdmin) {
      // ✅ Admins see dashboard + logout
      accountItems = [
        { id: "dashboard", label: "Go to Dashboard", icon: Activity },
        { id: "logout", label: "Logout", icon: Shield },
      ];
    } else if (isAuthenticated) {
      // ✅ Other logged-in users
      accountItems = [
        { id: "dashboard", label: "Go to Dashboard", icon: Activity },
        { id: "logout", label: "Logout", icon: Shield },
      ];
    } else {
      // ✅ Not logged in
      accountItems = [
        { id: "login", label: "Login", icon: Activity },
        { id: "become_responder", label: "Become a Responder", icon: Shield },
      ];
    }

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
        items: [
          { id: "cebu", label: "Center on Cebu", icon: Map },
          { id: "davao", label: "Center on Davao Oriental", icon: Map },
        ],
      },
    ];
  }, [isAuthenticated, userRole]);

  // ✅ Toggle expand
  const toggleSection = (id: string) => {
    setExpanded((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // ✅ Click handler with page refresh for logout
  const handleClick = (id: string) => {
    switch (id) {
      case "login":
        onLoginClick?.();
        break;
      case "become_responder":
        onResponderClick?.();
        break;
      case "dashboard":
        onDashboardClick?.();
        break;
      case "logout":
        onLogout?.();
        window.location.reload();
        break;
      case "cebu":
      case "davao":
        onCenterMap?.(id);
        break;
      default:
        onNavigate(id);
        break;
    }
    onClose();
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Slide-in Menu */}
          <motion.div
            className="fixed top-0 right-0 w-72 h-full bg-white z-50 shadow-xl flex flex-col border-l border-gray-200"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
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
                      <motion.div
                        animate={{
                          rotate: expanded.has(section.id) ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </motion.div>
                    )}
                  </button>

                  {/* Nested items */}
                  <AnimatePresence>
                    {section.items.length > 0 && expanded.has(section.id) && (
                      <motion.div
                        className="ml-3 border-l-2 border-gray-200 pl-3 space-y-1 overflow-hidden"
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ transformOrigin: "top" }}
                      >
                        {section.items.map((item) => (
                          <motion.button
                            key={item.id}
                            onClick={() => handleClick(item.id)}
                            className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-blue-50 text-xs"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.15 }}
                          >
                            <item.icon className="w-3 h-3 text-blue-600" />
                            <span>{item.label}</span>
                          </motion.button>
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