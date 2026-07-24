import React from 'react';
import { motion } from 'motion/react';
import { Shirt, Clock, User, ArrowRight, Send, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HomeProps {
  onNavigate: (route: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { user, wardrobe, batches, getReadyBatchesCount } = useApp();

  const readyCount = getReadyBatchesCount();
  const roomNum = user?.roomNumber || '---';
  const floorNumber = user?.floorNumber || '';

  const activeBatch = batches.find((b) => b.status === 'submitted' || b.status === 'in_wash');
  const firstName = user?.name?.split(' ')[0] || 'Student';
  const avatarLetter = firstName[0]?.toUpperCase() || 'S';
  const avatarUrl = user?.profilePhotoUrl;

  return (
    <div className="space-y-6 pb-24">

      {/* ── Hero Banner (Black & White Theme) ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-black rounded-3xl overflow-hidden text-white border border-neutral-800 shadow-xl"
      >
        <div className="relative p-5 flex items-center justify-between">
          <div>
            {/* Room pill */}
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 mb-3 border border-white/15">
              <div className="flex items-center space-x-1 font-mono">
                <span className="text-[10px] font-bold text-neutral-300 uppercase">
                  {floorNumber ? `Floor Number - ${floorNumber}` : 'Floor Number - 1'}
                </span>
                <span className="text-[10px] font-bold text-white px-2 py-0.5 bg-black/30 rounded uppercase tracking-wider">
                  Room Number - {roomNum}
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Hi, {firstName} 👋
            </h2>
            <p className="text-sm text-neutral-400 mt-1 font-medium">
              {wardrobe.length} items in wardrobe &nbsp;·&nbsp;
              <span className="text-white font-bold">
                {wardrobe.filter((w) => w.inWash).length} in wash
              </span>
            </p>
          </div>

          {/* Avatar */}
          <button
            onClick={() => onNavigate('account')}
            className="flex-shrink-0 w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-lg active:scale-95 transition-transform"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-neutral-800 text-white flex items-center justify-center font-bold text-lg">
                {avatarLetter}
              </div>
            )}
          </button>
        </div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <section>
        <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-neutral-400 mb-3 px-1">
          Laundry Actions
        </p>
        <div className="grid grid-cols-2 gap-3">

          {/* Submit Card */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onNavigate('submit')}
            className="relative bg-white rounded-3xl p-4 text-left overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center mb-3">
              <Send className="w-4 h-4 stroke-[2.5]" />
            </div>
            <p className="font-extrabold text-black text-sm leading-tight">Submit Wash</p>
            <p className="text-neutral-500 text-[11px] mt-0.5 font-medium truncate">
              {activeBatch ? `${activeBatch.itemCount} items in wash` : 'Drop off for laundry'}
            </p>
            <div className="mt-3 inline-flex items-center gap-1 bg-neutral-100 group-hover:bg-black group-hover:text-white transition-colors rounded-lg px-2.5 py-1">
              <span className="text-black group-hover:text-white text-[10px] font-bold font-mono">SUBMIT</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </motion.button>

          {/* In Wash Tracker Card */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onNavigate('collect')}
            className="relative bg-white rounded-3xl p-4 text-left overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center mb-3">
              <Package className="w-4 h-4 stroke-[2.5]" />
            </div>
            <p className="font-extrabold text-black text-sm leading-tight">In Wash Tracker</p>
            <p className="text-neutral-500 text-[11px] mt-0.5 font-medium truncate">
              {wardrobe.filter((w) => w.inWash).length} garments processing
            </p>
            <div className="mt-3 inline-flex items-center gap-1 bg-neutral-100 group-hover:bg-black group-hover:text-white transition-colors rounded-lg px-2.5 py-1">
              <span className="text-black group-hover:text-white text-[10px] font-bold font-mono">VIEW STATUS</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </motion.button>
        </div>
      </section>

      {/* ── My Wardrobe Preview ── */}
      <section className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shirt className="w-5 h-5 text-black stroke-[2.2]" />
            <h3 className="font-extrabold text-base text-black">My Wardrobe</h3>
          </div>
          <button
            onClick={() => onNavigate('wardrobe')}
            className="text-xs font-mono font-bold text-black hover:underline"
          >
            Manage ({wardrobe.length}) →
          </button>
        </div>

        {wardrobe.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-xs font-semibold text-neutral-500">Your wardrobe is empty.</p>
            <button
              onClick={() => onNavigate('wardrobe')}
              className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl active:scale-95 transition-transform"
            >
              Add First Cloth
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 pt-1">
            {wardrobe.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('wardrobe')}
                className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 relative cursor-pointer"
              >
                <img
                  src={item.photoUrl}
                  alt={item.label}
                  className="w-full h-full object-cover"
                />
                {item.inWash && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                    <span className="text-[9px] font-mono font-bold text-white bg-black px-1.5 py-0.5 rounded-md">
                      WASH
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
