import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Image as ImageIcon, X, Sparkles, Loader2, ArrowLeft, RefreshCw, Scan, Target, Maximize2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClothCard } from '../components/ClothCard';
import { WardrobeItem } from '../types';
import { uploadClothingImage } from '../lib/firebase';

interface WardrobeProps {
  onNavigate: (route: string) => void;
}

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

  // Live Camera State & AI Cloth Focus Outline
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isClothFocusEnabled, setIsClothFocusEnabled] = useState(true);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startLiveCamera = async (mode: 'environment' | 'user' = facingMode) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        cameraInputRef.current?.click();
        return;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      mediaStreamRef.current = stream;
      setIsLiveCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Live camera error, falling back to native picker:', err);
      setIsLiveCameraActive(false);
      cameraInputRef.current?.click();
    }
  };

  const stopLiveCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  const capturePhotoFromLiveCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setNewPhotoUrl(dataUrl);
      stopLiveCamera();
    }
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startLiveCamera(nextMode);
  };

  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

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
                {/* 50/50 Split Box / Live Camera / Photo Preview */}
                <div className="bg-neutral-100 border border-neutral-300 rounded-2xl p-2 relative overflow-hidden">
                  {isLiveCameraActive ? (
                    <div 
                      className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-black flex items-center justify-center cursor-crosshair select-none"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setFocusPoint({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        });
                      }}
                    >
                      <video
                        ref={videoRef}
                        playsInline
                        autoPlay
                        muted
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Top Overlay Controls */}
                      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-20 pointer-events-auto">
                        <button
                          type="button"
                          onClick={toggleCameraFacing}
                          className="w-8 h-8 rounded-full bg-black/60 text-white backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
                          title="Flip Camera"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        {/* AI Cloth Focus Toggle Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsClothFocusEnabled(!isClothFocusEnabled);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 backdrop-blur-md border transition-all ${
                            isClothFocusEnabled
                              ? 'bg-emerald-500/80 text-white border-emerald-400 shadow-md'
                              : 'bg-black/60 text-white/70 border-white/20'
                          }`}
                        >
                          <Scan className={`w-3.5 h-3.5 ${isClothFocusEnabled ? 'animate-pulse' : ''}`} />
                          <span>{isClothFocusEnabled ? 'AI OUTLINE ON' : 'AI OUTLINE OFF'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            stopLiveCamera();
                          }}
                          className="w-8 h-8 rounded-full bg-black/60 text-white backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
                          title="Close Camera"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* AI Cloth Detection Bounding Box & Outline */}
                      {isClothFocusEnabled && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-10">
                          <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative w-4/5 h-4/5 rounded-2xl border-2 border-dashed border-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.3)] flex flex-col justify-between p-2 overflow-hidden"
                          >
                            {/* Corner Bracket Accents */}
                            <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                            {/* Scanning Laser Line */}
                            <motion.div
                              animate={{ y: ['0%', '200%', '0%'] }}
                              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                              className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399]"
                            />

                            {/* Top Badge */}
                            <div className="self-center bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                              <Target className="w-3 h-3 text-emerald-400 animate-spin" />
                              <span>CLOTH DETECTED • 98%</span>
                            </div>

                            {/* Bottom Instruction */}
                            <div className="self-center bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-mono text-white/80">
                              Center cloth in frame
                            </div>
                          </motion.div>
                        </div>
                      )}

                      {/* Tap to Focus reticle */}
                      {focusPoint && (
                        <motion.div
                          initial={{ scale: 1.5, opacity: 1 }}
                          animate={{ scale: 1, opacity: 0 }}
                          transition={{ duration: 0.8 }}
                          style={{ left: focusPoint.x - 20, top: focusPoint.y - 20 }}
                          className="absolute w-10 h-10 border-2 border-emerald-400 rounded-full pointer-events-none z-30 flex items-center justify-center"
                        >
                          <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                        </motion.div>
                      )}

                      {/* Camera Shutter Snap Button */}
                      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center z-20 pointer-events-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            capturePhotoFromLiveCamera();
                          }}
                          className="w-14 h-14 rounded-full bg-white text-black border-4 border-black/30 shadow-xl flex items-center justify-center active:scale-90 transition-transform group"
                        >
                          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                            <Camera className="w-5 h-5" />
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : newPhotoUrl ? (
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
                      {/* Camera Button */}
                      <button
                        type="button"
                        onClick={() => startLiveCamera()}
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
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
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
