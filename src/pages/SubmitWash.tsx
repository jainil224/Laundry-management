import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, Check, Send, Sparkles, X, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LaundryBatch } from '../types';

interface SubmitWashProps {
  onNavigate: (route: string) => void;
}

export const SubmitWash: React.FC<SubmitWashProps> = ({ onNavigate }) => {
  const { wardrobe, user, submitLaundryBatch } = useApp();

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [submittedBatch, setSubmittedBatch] = useState<LaundryBatch | null>(null);

  // Show all clothes uploaded in user's wardrobe
  const availableClothes = wardrobe;

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItemIds.length === availableClothes.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(availableClothes.map((i) => i.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedItemIds.length === 0) return;
    const batch = await submitLaundryBatch(selectedItemIds, '');
    setSubmittedBatch(batch);
    setIsSelectModalOpen(false);
  };

  const roomNum = user?.roomNumber || '---';

  const formatSubmittedTime = (isoString?: string) => {
    if (!isoString) return new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Ticket Success View
  if (submittedBatch) {
    return (
      <div className="py-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 shadow-xl border border-neutral-200 text-center space-y-4 max-w-[400px] mx-auto"
        >
          <div className="w-14 h-14 rounded-2xl bg-black text-white mx-auto flex items-center justify-center">
            <Check className="w-7 h-7 stroke-[3]" />
          </div>

          <div>
            <h2 className="font-extrabold text-2xl text-black mt-1">
              Submitted for Wash!
            </h2>
            <p className="text-xs text-neutral-500 mt-1 font-medium">
              {submittedBatch.itemCount} garments tagged to Room #{roomNum}.
            </p>
          </div>

          <div className="bg-neutral-100 rounded-2xl p-4 text-left font-mono text-xs text-neutral-800 space-y-2 border border-neutral-200">
            <p className="flex justify-between"><strong>Room:</strong> <span>#{roomNum}</span></p>
            <p className="flex justify-between"><strong>Total Garments:</strong> <span>{submittedBatch.itemCount} items</span></p>
            <div className="border-t border-neutral-200 pt-2 flex items-center justify-between">
              <strong className="flex items-center gap-1 text-neutral-600">
                <Calendar className="w-3.5 h-3.5 text-black" /> Submitted Date & Time:
              </strong>
            </div>
            <p className="text-right font-bold text-black">
              {formatSubmittedTime(submittedBatch.submittedAt)}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onNavigate('home')}
              className="flex-1 py-3 bg-neutral-100 text-black rounded-2xl font-bold text-xs hover:bg-neutral-200 transition-all border border-neutral-200"
            >
              Go to Home
            </button>
            <button
              onClick={() => onNavigate('collect')}
              className="flex-1 py-3 bg-black text-white rounded-2xl font-bold text-xs hover:bg-neutral-800 transition-all shadow-md"
            >
              Track Status
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] max-h-[620px] flex flex-col justify-between overflow-hidden">
      {/* Sub-Title */}
      <div className="px-1 pt-1 pb-2">
        <h1 className="font-extrabold text-xl text-black tracking-tight">
          Clothes for washing
        </h1>
      </div>

      {/* Fixed Center Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto overflow-hidden">
        {selectedItemIds.length > 0 ? (
          <div className="w-full space-y-4 max-h-full overflow-y-auto px-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-neutral-600 uppercase">
                {selectedItemIds.length} CLOTHES SELECTED
              </span>
              <button
                onClick={() => setIsSelectModalOpen(true)}
                className="text-xs font-bold text-black hover:underline"
              >
                Edit Selection
              </button>
            </div>

            {/* Selected clothes preview grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {availableClothes
                .filter((item) => selectedItemIds.includes(item.id))
                .map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-3/4 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-xs"
                  >
                    <img
                      src={item.photoUrl}
                      alt={item.label}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 w-5 h-5 rounded-xs bg-black text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-2">
              <button
                onClick={handleSubmit}
                className="w-full py-3.5 bg-black text-white rounded-2xl font-bold text-sm hover:bg-neutral-800 active:scale-98 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit {selectedItemIds.length} Clothes for Wash</span>
              </button>
            </div>
          </div>
        ) : (
          /* Center "+ Select Clothes" Button */
          <div className="text-center space-y-4 my-auto">
            <button
              onClick={() => setIsSelectModalOpen(true)}
              className="inline-flex items-center gap-2 bg-black text-white font-bold text-base px-6 py-3.5 rounded-2xl border border-neutral-800 hover:bg-neutral-900 active:scale-95 transition-all shadow-md"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Select Clothes</span>
            </button>
          </div>
        )}
      </div>

      {/* Select Clothes Modal Sheet (z-[100] renders ABOVE bottom navigation bar) */}
      <AnimatePresence>
        {isSelectModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-[460px] bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col border border-neutral-200 pb-6 sm:pb-6"
            >
              {/* Modal Header */}
              <div className="pb-3 border-b border-neutral-200 flex items-center justify-between">
                <h3 className="font-extrabold text-xl text-black">
                  Select Clothes
                </h3>

                <div className="flex items-center gap-3">
                  {availableClothes.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs font-bold text-black hover:underline"
                    >
                      {selectedItemIds.length === availableClothes.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                  <button
                    onClick={() => setIsSelectModalOpen(false)}
                    className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3-Column Photo Grid with Top-Left Square Checkboxes */}
              {availableClothes.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-24 h-24 mx-auto flex items-center justify-center">
                    <img 
                      src="https://res.cloudinary.com/ju7wkm1y/image/upload/v1784869572/hangers-cut-out-Photoroom_yx8pn4.png" 
                      alt="No clothes available" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-black">
                    No Clothes Available
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                    Add clothes to your wardrobe first to select them for wash.
                  </p>
                  <button
                    onClick={() => {
                      setIsSelectModalOpen(false);
                      onNavigate('wardrobe');
                    }}
                    className="mt-2 inline-flex items-center gap-2 bg-black text-white font-bold text-xs px-5 py-2.5 rounded-xl active:scale-95 transition-transform"
                  >
                    <span>Add Clothes to Wardrobe</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1 py-4 scrollbar-none">
                  <div className="grid grid-cols-3 gap-2.5">
                    {availableClothes.map((item) => {
                      const isSelected = selectedItemIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleSelectItem(item.id)}
                          className={`relative aspect-3/4 rounded-2xl overflow-hidden cursor-pointer transition-all border ${
                            isSelected
                              ? 'border-2 border-black ring-2 ring-black/10'
                              : 'border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {/* Image */}
                          <img
                            src={item.photoUrl}
                            alt={item.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400';
                            }}
                          />

                          {/* Square Checkbox [ ] at Top-Left */}
                          <div
                            className={`absolute top-2.5 left-2.5 w-5 h-5 rounded-xs transition-all shadow-xs flex items-center justify-center ${
                              isSelected
                                ? 'bg-black text-white border border-black'
                                : 'bg-white border border-neutral-400'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Confirm / Submit Action Button (Always 100% visible on top) */}
              {availableClothes.length > 0 && (
                <div className="pt-3 border-t border-neutral-200 mt-auto bg-white">
                  <button
                    onClick={() => setIsSelectModalOpen(false)}
                    className="w-full py-3.5 bg-black text-white rounded-2xl font-bold text-sm hover:bg-neutral-900 active:scale-98 transition-all shadow-xl flex items-center justify-center space-x-2"
                  >
                    <span>Confirm Selection ({selectedItemIds.length} Selected)</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
