import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Image as ImageIcon, X, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClothCard } from '../components/ClothCard';
import { WardrobeItem } from '../types';
import { uploadClothingImage } from '../lib/firebase';

interface WardrobeProps {
  onNavigate: (route: string) => void;
}

// Detect mobile/tablet so we can use native camera capture only on those devices
const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : ''
);


export const Wardrobe: React.FC<WardrobeProps> = ({ onNavigate }) => {
  const {
    wardrobe,
    categories,
    addWardrobeItem,
    deleteWardrobeItem,
    user,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);

  // Form State for Add Item
  const [newLabel, setNewLabel] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);


  const handlePhotoFileSelect = async (file: File | undefined) => {
    if (!file || !user) return;

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setNewPhotoUrl(localPreview);

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const downloadUrl = await uploadClothingImage(file, user.uid, (pct) => {
        setUploadProgress(pct);
      });
      setNewPhotoUrl(downloadUrl);
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl || isUploading) return;

    const categoryObj = categories.find((c) => c.id === newCategoryId);
    const label = newLabel.trim() || categoryObj?.name || 'Garment';

    await addWardrobeItem({
      categoryId: newCategoryId || 'shirt',
      photoUrl: newPhotoUrl,
      color: null,
      label: label,
    });

    // Reset & close
    stopLiveCamera();
    setNewLabel('');
    setNewCategoryId('');
    setNewPhotoUrl('');
    setUploadProgress(null);
    setIsUploading(false);
    setIsAddModalOpen(false);
  };

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredWardrobe = wardrobe.filter((item) => {
    const matchesCategory = selectedCategoryId === 'all' || item.categoryId === selectedCategoryId;
    const matchesSearch = searchQuery.trim() === '' || 
      item.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('home')}
            className="p-2 rounded-full hover:bg-black/5 active:scale-95 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          <div>
            <h1 className="font-extrabold text-xl text-black tracking-tight flex items-center gap-2">
              <span>Wardrobe</span>
              <span className="text-xs bg-black text-white px-2.5 py-0.5 rounded-full font-mono">
                {wardrobe.length}
              </span>
            </h1>
          </div>
        </div>

        {/* Black Upload Pill Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-black text-white font-bold text-xs px-4 py-2 rounded-full shadow-md hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 fill-white" />
          <span>Upload</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      {wardrobe.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategoryId === 'all'
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            All ({wardrobe.length})
          </button>

          {categories.map((cat) => {
            const count = wardrobe.filter((w) => w.categoryId === cat.id).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  selectedCategoryId === cat.id
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Wardrobe 2-Column Grid */}
      {filteredWardrobe.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-neutral-200 shadow-xs space-y-3 mt-4">
          <div className="w-12 h-12 rounded-2xl bg-black text-white mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-black">
            {wardrobe.length === 0 ? 'No Clothes Yet' : 'No Items Found'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            {wardrobe.length === 0 
              ? 'Tap the Upload button at the top to snap or pick your clothes!' 
              : 'Try selecting a different category filter above.'}
          </p>
          {wardrobe.length === 0 && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 inline-flex items-center gap-2 bg-black text-white font-bold text-xs px-5 py-2.5 rounded-full active:scale-95 transition-transform shadow-md"
            >
              <span>Upload First Cloth</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {filteredWardrobe.map((item) => (
            <ClothCard
              key={item.id}
              item={item}
              onClick={() => setSelectedItem(item)}
              onDelete={() => deleteWardrobeItem(item.id)}
            />
          ))}
        </div>
      )}

      {/* Add New Cloth Modal Sheet */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 pb-12 sm:pb-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-[420px] max-h-[85vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4 relative border border-neutral-200"
            >
              <div className="text-left border-b border-neutral-200 pb-3 flex items-center justify-between">
                <h3 className="font-extrabold text-xl text-black">
                  Add New Cloth
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    stopLiveCamera();
                    setIsAddModalOpen(false);
                  }}
                  className="w-7 h-7 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddItemSubmit} className="space-y-4">
                {/* 50/50 Split Box / Photo Preview */}
                <div className="bg-neutral-100 border border-neutral-300 rounded-2xl p-2 relative overflow-hidden">
                  {newPhotoUrl ? (
                    <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-neutral-200">
                      <img
                        src={newPhotoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white space-y-2">
                          <Loader2 className="w-7 h-7 animate-spin" />
                          <span className="text-xs font-mono font-bold">
                            Uploading {uploadProgress !== null ? `${uploadProgress}%` : ''}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setNewPhotoUrl('')}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 divide-x divide-neutral-300">
                      {/* Camera Button — opens native phone camera */}
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-4 hover:bg-black/5 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-xs">
                          <Camera className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-black">Camera</span>
                      </button>

                      {/* Gallery Button */}
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="flex flex-col items-center justify-center p-4 hover:bg-black/5 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-xs">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-black">Gallery</span>
                      </button>
                    </div>
                  )}

                  {/* Hidden file inputs */}
                  {/* On mobile: capture="environment" opens native camera directly */}
                  {/* On desktop: no capture attribute → opens normal file picker */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    {...(isMobile ? { capture: 'environment' } : {})}
                    onChange={(e) => handlePhotoFileSelect(e.target.files?.[0])}
                    className="hidden"
                  />
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoFileSelect(e.target.files?.[0])}
                    className="hidden"
                  />
                </div>

                {/* Category Dropdown */}
                <div>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 rounded-xl text-sm font-medium text-black focus:outline-none focus:border-black appearance-none cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Cloth Name Input */}
                <div>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Cloth Name (optional, e.g. T-SHIRT)"
                    className="w-full px-4 py-2.5 bg-neutral-100 border border-neutral-300 rounded-xl text-xs font-medium text-black focus:outline-none focus:border-black"
                  />
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!newPhotoUrl || isUploading}
                    className="w-full py-3.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-neutral-800 active:scale-98 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </form>

              {/* Close Button */}
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Item Detail View Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-[400px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-200"
            >
              <div className="relative aspect-4/5 w-full bg-neutral-200">
                <img
                  src={selectedItem.photoUrl}
                  alt={selectedItem.label}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-black uppercase tracking-wider">
                    ROOM #{selectedItem.roomNumber || user?.roomNumber}
                  </span>
                  <h3 className="font-extrabold text-lg text-black mt-0.5">
                    {selectedItem.label}
                  </h3>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={async () => {
                      await deleteWardrobeItem(selectedItem.id);
                      setSelectedItem(null);
                    }}
                    className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 py-2.5 bg-black text-white rounded-xl font-bold text-xs hover:bg-neutral-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
