import React from 'react';
import { motion } from 'motion/react';
import { Home, Shirt, PlusCircle, Sparkles, User } from 'lucide-react';

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  readyCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentRoute,
  onNavigate,
  readyCount = 0,
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'wardrobe', label: 'Wardrobe', icon: Shirt },
    { id: 'submit', label: 'Submit', icon: PlusCircle, isSubmit: true },
    { id: 'collect', label: 'Collect', icon: Sparkles, badge: readyCount },
    { id: 'account', label: 'Account', icon: User },
  ];

  const activeIndex = navItems.findIndex((item) => item.id === currentRoute);
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;

  // 5 columns in 400px SVG space => each is 80px wide. Center of active column = 40 + i * 80
  const activeCx = 40 + safeActiveIndex * 80;
  const activeItem = navItems[safeActiveIndex];
  const isSubmitActive = activeItem?.id === 'submit';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-[440px] relative pointer-events-auto px-2 pb-2">
        {/* Container for SVG curve & icons */}
        <div className="relative w-full h-[68px] flex items-center">
          
          {/* Animated SVG White Background with U-Curved Notch Cutout */}
          <svg
            className="absolute inset-0 w-full h-full drop-shadow-xl overflow-visible pointer-events-none"
            viewBox="0 0 400 70"
            preserveAspectRatio="none"
          >
            <motion.path
              fill="#FFFFFF"
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="1.2"
              animate={{
                d: `M 0 16 Q 0 0 16 0 L ${activeCx - 42} 0 C ${activeCx - 25} 0, ${activeCx - 22} 32, ${activeCx} 32 C ${activeCx + 22} 32, ${activeCx + 26} 0, ${activeCx + 42} 0 L 384 0 Q 400 0 400 16 L 400 70 L 0 70 Z`,
              }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 28,
              }}
            />
          </svg>

          {/* Animated Floating Circle Button with ACTIVE BADGE rendering on top */}
          <motion.div
            className="absolute top-[4px] w-[20%] flex items-center justify-center pointer-events-none z-20"
            initial={false}
            animate={{
              left: `${(safeActiveIndex * 100) / navItems.length}%`,
            }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 28,
            }}
          >
            <div
              style={{ backgroundColor: isSubmitActive ? '#F4796F' : '#000000' }}
              className={`w-13 h-13 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 relative ${
                isSubmitActive
                  ? 'text-black border-2 border-black ring-4 ring-[#F4796F]/30'
                  : 'text-white border-2 border-black ring-4 ring-black/10'
              }`}
            >
              {React.createElement(activeItem.icon, {
                className: `w-6 h-6 stroke-[2.5] ${isSubmitActive ? 'text-black' : 'text-white'}`,
              })}

              {/* Active Badge visible directly on top of active floating circle */}
              {activeItem.badge && activeItem.badge > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 rounded-full bg-[#00BFA5] text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-md border-2 border-white z-30 animate-pulse">
                  {activeItem.badge}
                </span>
              ) : null}
            </div>
          </motion.div>

          {/* Clickable Icons Grid */}
          <div className="relative z-10 w-full h-full flex items-center justify-between">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="flex-1 h-full flex items-center justify-center touch-manipulation focus:outline-none relative group"
                >
                  {/* Non-active Icon */}
                  {!isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col items-center justify-center text-neutral-400 group-hover:text-black"
                    >
                      {item.isSubmit ? (
                        <div className="w-8 h-8 rounded-full bg-[#F4796F]/20 text-[#F4796F] flex items-center justify-center border border-[#F4796F]/30">
                          <Icon className="w-4.5 h-4.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <Icon className="w-5 h-5 stroke-[1.8]" />
                      )}
                    </motion.div>
                  )}

                  {/* Notification Badge for inactive items */}
                  {!isActive && item.badge && item.badge > 0 ? (
                    <span className="absolute top-2 right-4 min-w-[16px] h-4 px-1 rounded-full bg-[#00BFA5] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-xs border border-white/40">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
