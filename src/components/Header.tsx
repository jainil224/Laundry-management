import React from 'react';
import { Bell, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onNavigate?: (route: string) => void;
}

const BRAND_LOGO_URL = 'https://res.cloudinary.com/ju7wkm1y/image/upload/v1784836807/ChatGPT_Image_Jul_24_2026_01_28_20_AM_1_mqcgeb.png';

export const Header: React.FC<HeaderProps> = ({ title, showBack, onBack, onNavigate }) => {
  const { user, getReadyBatchesCount } = useApp();
  const readyCount = getReadyBatchesCount();

  return (
    <header className="sticky top-0 z-40 bg-black/90 text-white px-4 py-3 border-b border-white/10 backdrop-blur-xl shadow-lg">
      <div className="max-w-[440px] mx-auto flex items-center justify-between">
        {/* Left: App Logo / Back Button */}
        <div className="flex items-center space-x-3">
          {showBack ? (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center border border-white/15"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div 
              onClick={() => onNavigate && onNavigate('home')}
              className="flex items-center space-x-3 cursor-pointer group select-none"
            >
              {/* Raw Logo Emblem (No white circle background) */}
              <div className="w-14 h-14 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
                <img
                  src={BRAND_LOGO_URL}
                  alt="Laundrify Logo"
                  className="w-full h-full object-contain drop-shadow-md scale-125"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white leading-none">
                  Laundrify
                </span>
                <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase mt-1">
                  LAUNDRY LOG
                </span>
              </div>
            </div>
          )}

          {title && showBack && (
            <h1 className="font-extrabold text-base text-white tracking-tight">{title}</h1>
          )}
        </div>

        {/* Right: Room Tag Chip & Activity Notifications */}
        <div className="flex items-center space-x-2">
          {user && (
            <button
              onClick={() => onNavigate && onNavigate('account')}
              className="bg-white text-black hover:bg-neutral-100 px-3 py-1.5 rounded-full text-xs font-mono font-extrabold tracking-wider flex items-center space-x-1 shadow-md active:scale-95 transition-all border border-white/20"
            >
              <span className="text-[10px] font-bold text-neutral-500">Room Number -</span>
              <span>{user.roomNumber || '207'}</span>
            </button>
          )}

          <button
            onClick={() => onNavigate && onNavigate('activity')}
            className="relative w-9 h-9 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/15 active:scale-95 transition-all flex items-center justify-center shadow-sm"
            aria-label="Activity Log"
          >
            <Bell className="w-4 h-4 text-white" />
            {readyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#00BFA5] text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center border-2 border-black animate-pulse">
                {readyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
