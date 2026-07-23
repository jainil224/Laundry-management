import React from 'react';
import { Bell, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onNavigate?: (route: string) => void;
}

const BRAND_LOGO_URL = 'https://res.cloudinary.com/ju7wkm1y/image/upload/v1784828543/ChatGPT_Image_Jul_23_2026_11_11_54_PM_axvdkp.png';

export const Header: React.FC<HeaderProps> = ({ title, showBack, onBack, onNavigate }) => {
  const { user, getReadyBatchesCount } = useApp();
  const readyCount = getReadyBatchesCount();

  return (
    <header className="sticky top-0 z-30 bg-black text-white px-4 py-3.5 border-b border-neutral-800 backdrop-blur-md">
      <div className="max-w-[480px] mx-auto flex items-center justify-between">
        {/* Left: App Logo / Back Button */}
        <div className="flex items-center space-x-2">
          {showBack ? (
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95 transition-all flex items-center justify-center border border-neutral-800"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div 
              onClick={() => onNavigate && onNavigate('home')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              {/* Perfect Circle Logo Emblem (Zoomed to show only the central hanger logo) */}
              <div className="w-9 h-9 rounded-full bg-white shadow-md group-hover:scale-105 transition-transform overflow-hidden ring-2 ring-white/60 flex items-center justify-center shrink-0">
                <img
                  src={BRAND_LOGO_URL}
                  alt="Laundrify Logo"
                  className="w-full h-full object-cover scale-[2.7] translate-y-0.5"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-base tracking-tight text-white leading-none">
                  Laundrify
                </span>
                <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase mt-0.5">
                  LAUNDRY LOG
                </span>
              </div>
            </div>
          )}

          {title && showBack && (
            <h1 className="font-heading font-bold text-lg text-white ml-2">{title}</h1>
          )}
        </div>

        {/* Right: Room Tag Chip & Notifications */}
        <div className="flex items-center space-x-2">
          {user && (
            <button
              onClick={() => onNavigate && onNavigate('account')}
              className="bg-white text-black hover:bg-neutral-200 px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wider flex items-center space-x-1 shadow-sm active:scale-95 transition-all border border-neutral-300"
            >
              <span className="text-[10px] text-neutral-600">RM</span>
              <span>{user.roomNumber || '---'}</span>
            </button>
          )}

          <button
            onClick={() => onNavigate && onNavigate('activity')}
            className="relative p-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-800 active:scale-95 transition-all"
            aria-label="Activity Log"
          >
            <Bell className="w-4 h-4" />
            {readyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black rounded-full text-[10px] font-mono font-bold flex items-center justify-center animate-pulse border border-neutral-300">
                {readyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
