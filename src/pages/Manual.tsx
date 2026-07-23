import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryIcon } from '../components/CategoryIcon';

interface ManualProps {
  onNavigate: (route: string) => void;
}

export const Manual: React.FC<ManualProps> = ({ onNavigate }) => {
  const { categories, wardrobe, setSelectedCategoryFilter } = useApp();

  const handleCategoryClick = (catId: string) => {
    setSelectedCategoryFilter(catId);
    onNavigate('wardrobe');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Subheader */}
      <div className="px-1">
        <p className="text-xs text-[#23241F]/60 font-medium">
          12 standard garment categories & fabric washing rules
        </p>
      </div>

      {/* Category List / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((cat) => {
          const itemCount = wardrobe.filter((i) => i.categoryId === cat.id).length;

          return (
            <motion.div
              key={cat.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryClick(cat.id)}
              className="bg-white rounded-3xl p-4 shadow-xs border border-[#23241F]/8 cursor-pointer flex flex-col justify-between hover:border-[#FFC93C] transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#23241F]/5 flex items-center justify-center">
                    <CategoryIcon name={cat.name} className="w-5 h-5 text-[#2FBF9F]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#23241F]">
                      {cat.name}
                    </h3>
                    {cat.tempWashType && (
                      <span className="text-[10px] font-mono text-[#23241F]/50 block">
                        {cat.tempWashType}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-[#23241F]/70 bg-[#23241F]/5 px-2.5 py-1 rounded-full">
                  {itemCount} tagged
                </span>
              </div>

              <div className="bg-[#23241F]/4 rounded-2xl p-3 border border-[#23241F]/5">
                <p className="text-xs text-[#23241F]/70 leading-relaxed font-medium">
                  {cat.careNote}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-[#2FBF9F] font-bold">
                <span>View items in wardrobe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
