  import { LogOut } from 'lucide-react';
  import React from 'react';

  interface HeaderProps {
    logout: () => void;
  }

  export const Header: React.FC<HeaderProps> = ({ logout }) => {
    return (
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200">
        {/* Left section: Title */}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
          <h1 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
            <span className="hidden sm:inline">Emergency Response Dashboard</span>
            <span className="sm:hidden">ER Dashboard</span>
          </h1>
        </div>

        {/* Right section: Logout button */}
        <button
          onClick={() => logout()}
          className="group flex items-center gap-2 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md transition-all duration-150"
        >
          <LogOut size={18} className="flex-shrink-0" />
          <span className="hidden group-hover:inline transition-all duration-150">
            Logout
          </span>
        </button>
      </header>
    );
  };
