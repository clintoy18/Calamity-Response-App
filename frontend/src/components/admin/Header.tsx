import React from "react";
import { LogOut, Home } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import logoSrc from '../../assets/logo.png'

interface HeaderProps {
  logout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  logout,
}) => {
  const navigate = useNavigate();
  // Enhanced emergency level configuration
  return (
    <TooltipProvider>
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        {/* Left section: Home + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:bg-gray-100 transition-colors"
                onClick={() => navigate("/")}
              >
                <Home size={20} className="text-gray-700" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Go to Map</p>
            </TooltipContent>
          </Tooltip>

         <div className="flex items-center justify-center overflow-hidden rounded h-8">
           <img 
              src={logoSrc} 
              alt={'App logo'} 
              className="h-8 w-auto max-w-full object-contain"
              decoding="async"
            />
          </div>
        </div>

        {/* Right section: Notifications + Profile + Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Logout button - hidden on mobile, available in dropdown */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex items-center gap-2 hover:bg-red-50 hover:text-red-700 transition-colors"
                onClick={logout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign out of your account</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
};