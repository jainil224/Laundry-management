import React from 'react';
import { CategoryIcon } from './CategoryIcon';

interface CategoryChipProps {
  id: string | null;
  name: string;
  icon?: string;
  isSelected: boolean;
  onClick: () => void;
  count?: number;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  name,
  icon,
  isSelected,
  onClick,
  count,
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all whitespace-nowrap shadow-xs active:scale-95 ${
        isSelected
          ? 'bg-[#23241F] text-[#FFC93C] font-bold border-2 border-[#FFC93C]'
          : 'bg-white/80 text-[#23241F] hover:bg-white border border-[#23241F]/10'
      }`}
    >
      {icon && <CategoryIcon name={icon} className="w-3.5 h-3.5" />}
      <span>{name}</span>
      {count !== undefined && (
        <span
          className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            isSelected ? 'bg-[#FFC93C] text-[#23241F]' : 'bg-[#23241F]/10 text-[#23241F]/80'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
