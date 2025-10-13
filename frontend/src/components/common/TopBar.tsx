import React from 'react';
import { Menu, MapPin } from 'lucide-react';
import type { EmergencyRecord } from '../../types';

interface TopBarProps {
  logoSrc: string;
  subtitle?: string;
  emergencies?: EmergencyRecord[];
  showMenuButton?: boolean;
  onMenu?: () => void;
  active?: boolean;
  onToggleUpdates?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  logoSrc,
  subtitle,
  emergencies = [],
  showMenuButton = false,
  onMenu,
  active = false,
  onToggleUpdates,
}) => {
  const activeRespondents = emergencies.length;

  return (
    <div
      className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between px-3 py-2 bg-surface/90 rounded-lg shadow-md border border-border text-xs font-sans animate-slideDown"
      style={{ 
        animationDuration: '0.2s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'both'
      }}
    >
      {/* Left: Logo + subtitle/status */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 relative">
          <div className="flex items-center justify-center overflow-hidden rounded h-8">
            <img 
              src={logoSrc} 
              alt={subtitle || 'App logo'} 
              className="h-8 w-auto max-w-full object-contain" 
              loading="lazy"
              decoding="async"
            />
          </div>
          {active && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand rounded-full border-2 border-surface" />
          )}
        </div>

        <div className="flex flex-col justify-center min-w-0">
          {subtitle && <p className="text-[10px] text-text-muted truncate font-heading">{subtitle}</p>}
          <p className="text-[10px] font-medium text-text truncate font-heading">
            {activeRespondents} active emergency cases
          </p>
        </div>
      </div>

      {/* Right: Menu + Update buttons */}
      <div className="flex items-center gap-2">
        {onToggleUpdates && (
          <button
            onClick={onToggleUpdates}
            className="w-7 h-7 flex items-center justify-center hover:bg-background/60 rounded transition-colors duration-150"
            title="Show Earthquake Updates"
            aria-label="Show Earthquake Updates"
          >
            <MapPin className="w-4 h-4 text-text" />
          </button>
        )}

        {showMenuButton && onMenu && (
          <button
            onClick={onMenu}
            className="w-7 h-7 flex items-center justify-center hover:bg-background/60 rounded transition-colors duration-150"
            title="Menu"
            aria-label="Open Menu"
          >
            <Menu className="w-4 h-4 text-text" />
          </button>
        )}
      </div>

      {/* CSS Animation Definition */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDown {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideDown {
          animation-name: slideDown;
        }
      `}} />
    </div>
  );
};