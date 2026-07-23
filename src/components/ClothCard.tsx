import React from 'react';
import { motion } from 'motion/react';
import { Check, Clock, X } from 'lucide-react';
import { WardrobeItem } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { useApp } from '../context/AppContext';

interface ClothCardProps {
  item: WardrobeItem;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
  onDelete?: () => void;
}

export const ClothCard: React.FC<ClothCardProps> = ({
  item,
  selectable,
  selected,
  onSelect,
  onClick,
  onDelete,
}) => {
  const { categories } = useApp();
  const category = categories.find((c) => c.id === item.categoryId);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        if (selectable && onSelect) {
          onSelect();
        } else if (onClick) {
          onClick();
        }
      }}
      className={`relative group rounded-3xl bg-white overflow-hidden shadow-sm hover:shadow-xl border transition-all duration-300 cursor-pointer ${
        selected
          ? 'border-2 border-black ring-4 ring-black/10'
          : 'border-neutral-200/80 hover:border-neutral-400'
      }`}
    >
      {/* Photo Container */}
      <div className="relative aspect-[4/5] w-full bg-neutral-100 overflow-hidden">
        <img
          src={item.photoUrl}
          alt={item.label}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400';
          }}
        />

        {/* Gradient Overlay at bottom of image */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

        {/* Category Badge on Image */}
        {category && (
          <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/20 shadow-sm">
            <span>{category.icon || '👕'}</span>
            <span className="truncate max-w-[90px]">{category.name}</span>
          </div>
        )}

        {/* Delete (X) button at top-right */}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 hover:bg-red-600 text-white backdrop-blur-md shadow-md flex items-center justify-center transition-all z-10 active:scale-90 border border-white/20"
            title="Delete cloth"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        )}

        {/* Status Pills */}
        {item.inWash ? (
          <div className="absolute top-2.5 left-2.5 bg-amber-400 text-black px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold flex items-center gap-1 shadow-md border border-amber-300">
            <Clock className="w-3 h-3 stroke-[2.5]" />
            <span>IN WASH</span>
          </div>
        ) : (
          !selectable && (
            <div className="absolute top-2.5 left-2.5 bg-emerald-500/90 text-white backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider shadow-xs border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
              READY
            </div>
          )
        )}

        {/* Selection Checkmark */}
        {selectable && !item.inWash && (
          <div
            className={`absolute top-2.5 left-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
              selected
                ? 'bg-black text-white shadow-md border border-black'
                : 'bg-black/40 backdrop-blur-md border border-white text-transparent'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        )}
      </div>

      {/* Label under photo */}
      <div className="p-3 bg-white flex items-center justify-between gap-1">
        <div className="min-w-0 flex-1">
          <h4 className="font-extrabold text-xs text-black truncate tracking-tight" title={item.label}>
            {item.label}
          </h4>
          {item.color && (
            <p className="text-[10px] text-neutral-400 font-medium truncate mt-0.5">
              Color: {item.color}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
