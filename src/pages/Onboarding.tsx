import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Hash, User, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface OnboardingProps {
  onComplete: () => void;
}

const ONBOARDING_HEADER_IMAGE = 'https://res.cloudinary.com/ju7wkm1y/image/upload/v1784828543/ChatGPT_Image_Jul_23_2026_11_12_00_PM_baamyk.png';

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { completeOnboarding, user, firebaseUser } = useApp();

  // Pre-fill from Google account data
  const [name, setName] = useState(user?.name || firebaseUser?.displayName || '');
  const [roomNumber, setRoomNumber] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomNumber.trim() || !floorNumber.trim()) {
      setError('Please fill in your name, floor number and room number.');
      return;
    }

    setLoading(true);
    setError('');
    const cleanRoom = roomNumber.trim().toUpperCase();

    try {
      await completeOnboarding({
        name: name.trim(),
        email: user?.email || firebaseUser?.email || '',
        phone: '',
        roomNumber: cleanRoom,
        floorNumber: floorNumber.trim(),
        profilePhotoUrl: user?.profilePhotoUrl || firebaseUser?.photoURL || '',
      });
      onComplete();
    } catch (err: any) {
      console.error('Onboarding save failed:', err);
      setError('Failed to save. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#09090B] via-[#1F1F23] via-[#E4E4E7] to-[#FFFFFF] flex flex-col items-center justify-center p-6 py-12 relative overflow-hidden text-black space-y-6">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-black/5 blur-3xl pointer-events-none" />

      {/* Header Section (Black High-Contrast Text) */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] pt-4 flex flex-col items-center text-center space-y-3 z-10"
      >
        {/* Custom Cloudinary Image Emblem */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white p-2 shadow-2xl border-4 border-white/60 ring-4 ring-black/20 flex items-center justify-center overflow-hidden">
          <img
            src={ONBOARDING_HEADER_IMAGE}
            alt="Room Setup Tag"
            className="w-full h-full object-cover scale-110"
          />
        </div>

        <div>
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest bg-black px-3 py-1 rounded-full border border-neutral-700 shadow-sm">
            ROOM LAUNDRY TAGGING
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight leading-tight mt-2.5">
            Tag your clothes<br />to your room.
          </h1>
          <p className="text-xs sm:text-sm text-neutral-800 font-semibold max-w-xs mx-auto mt-1.5">
            A quick setup so every wash comes back to the right door.
          </p>
        </div>
      </motion.div>

      {/* Main Form Card Container (Black & White Theme) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full max-w-[440px] bg-white rounded-3xl p-6 shadow-2xl border border-neutral-200 z-10 space-y-4"
      >
        {error && (
          <div className="p-3 rounded-2xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-mono font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
              FULL NAME
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Janil"
                className="w-full pl-10 pr-4 py-3.5 bg-neutral-50 rounded-2xl border border-neutral-300 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 text-sm font-bold text-black placeholder-neutral-400 shadow-xs"
                required
              />
            </div>
          </div>

          {/* Floor Number + Room Number side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                FLOOR NUMBER
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="number"
                  min="0"
                  value={floorNumber}
                  onChange={(e) => setFloorNumber(e.target.value)}
                  placeholder="e.g. 3"
                  className="w-full pl-10 pr-3 py-3.5 bg-neutral-50 rounded-2xl border border-neutral-300 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 text-sm font-bold text-black placeholder-neutral-400 shadow-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-black mb-1.5 uppercase tracking-wider">
                ROOM NUMBER
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black" />
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. 207"
                  className="w-full pl-10 pr-3 py-3.5 bg-neutral-50 rounded-2xl border-2 border-black focus:outline-none focus:ring-2 focus:ring-black/20 text-sm font-mono font-extrabold text-black placeholder-neutral-400 shadow-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              id="btn-enter-room"
              className="w-full py-4 px-5 bg-black text-white rounded-2xl font-extrabold text-sm hover:bg-neutral-900 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 group"
            >
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>
                  <span>Enter my laundry room</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-xs text-neutral-500 font-medium text-center max-w-[200px] leading-relaxed mx-auto">
          This will be used for your laundry orders.
        </p>
      </motion.div>
    </div>
  );
};
