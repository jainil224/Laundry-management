import React, { useState } from 'react';
import { Edit3, Save, RotateCcw, Check, LogOut, LogIn, Cloud, UserCheck, Sparkles, Building, Hash, User as UserIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BorderGlow from '../components/BorderGlow';

interface AccountProps {
  onNavigate: (route: string) => void;
  onOpenOnboarding?: () => void;
}

export const Account: React.FC<AccountProps> = ({ onNavigate, onOpenOnboarding }) => {
  const {
    user,
    firebaseUser,
    authLoading,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signOutUser,
    updateUser,
    resetDemoData,
    wardrobe,
    batches,
  } = useApp();

  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [roomNumber, setRoomNumber] = useState(user?.roomNumber || '207');
  const [floorNumber, setFloorNumber] = useState(user?.floorNumber || '1');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser({
      name: name.trim(),
      roomNumber: roomNumber.trim().toUpperCase(),
      floorNumber: floorNumber.trim(),
    });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReopenOnboarding = async () => {
    if (onOpenOnboarding) {
      onOpenOnboarding();
    } else {
      await updateUser({ roomNumber: '' });
    }
  };

  const displayName = user?.name || firebaseUser?.displayName || 'Hostel Student';
  const firstInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="space-y-4 pb-24">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 space-y-4">
        <div className="flex items-center space-x-4">
          {/* Avatar emblem */}
          <div className="flex-shrink-0">
            <BorderGlow
              borderRadius={16}
              glowRadius={12}
              glowIntensity={1.2}
              coneSpread={25}
              animated={true}
              backgroundColor="#000000"
              glowColor="270 100 60"
              colors={['#a855f7', '#d946ef', '#c084fc']}
              className="w-16 h-16 flex items-center justify-center p-0 shadow-2xl"
            >
              {user?.profilePhotoUrl || firebaseUser?.photoURL ? (
                <img
                  src={user?.profilePhotoUrl || firebaseUser?.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span className="text-white text-2xl font-extrabold w-full h-full flex items-center justify-center rounded-2xl">
                  {firstInitial}
                </span>
              )}
            </BorderGlow>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-black text-white px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-mono font-bold whitespace-nowrap shadow-md border border-neutral-800 tracking-wide">
                ROOM NUMBER - {user?.roomNumber || '207'}
              </span>
              <span className="bg-neutral-100 text-black px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-mono font-extrabold uppercase whitespace-nowrap shadow-sm border border-neutral-200 tracking-wide">
                {user?.floorNumber ? `FLOOR NUMBER - ${user.floorNumber}` : 'FLOOR NUMBER - 1'}
              </span>
            </div>

            <h2 className="font-extrabold text-xl text-black mt-1.5 tracking-tight truncate">
              {displayName}
            </h2>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-black text-white text-xs font-semibold rounded-2xl flex items-center justify-center space-x-2 shadow-sm">
            <Check className="w-4 h-4 text-white" />
            <span>Room details updated in Firestore!</span>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200">
          <div className="bg-neutral-50 p-3.5 rounded-2xl text-center border border-neutral-200">
            <span className="block font-extrabold text-2xl text-black">
              {wardrobe.length}
            </span>
            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
              Wardrobe Clothes
            </span>
          </div>

          <div className="bg-neutral-50 p-3.5 rounded-2xl text-center border border-neutral-200">
            <span className="block font-extrabold text-2xl text-black">
              {batches.length}
            </span>
            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
              Laundry Batches
            </span>
          </div>
        </div>
      </div>

      {/* Profile Edit Form / View */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
          <h3 className="font-extrabold text-base text-black">
            Room Details
          </h3>
          <button
            onClick={() => {
              setName(user?.name || firebaseUser?.displayName || '');
              setRoomNumber(user?.roomNumber || '207');
              setFloorNumber(user?.floorNumber || '1');
              setIsEditing(!isEditing);
            }}
            className="text-xs font-mono font-bold text-black hover:underline flex items-center space-x-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel' : 'Edit Details'}</span>
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-mono font-bold text-neutral-600 mb-1">
                FULL NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-2xl border border-neutral-300 text-sm font-bold focus:outline-none focus:border-black text-black"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-600 mb-1">
                  ROOM NUMBER
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-2xl border border-neutral-300 text-sm font-mono font-bold focus:outline-none focus:border-black text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-600 mb-1">
                  FLOOR NUMBER
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-300 text-xs font-medium text-black focus:outline-none focus:border-black transition-all"
                    placeholder="e.g., 2"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-black text-white rounded-2xl font-extrabold text-xs hover:bg-neutral-900 active:scale-98 transition-all flex items-center justify-center space-x-1.5 mt-2 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>SAVE CHANGES</span>
            </button>
          </form>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="font-mono font-bold text-neutral-500">ROOM TAG:</span>
              <span className="font-mono font-extrabold text-black">{user?.roomNumber || '207'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="font-mono font-bold text-neutral-500">FLOOR NUMBER:</span>
              <span className="font-bold text-black uppercase">{user?.floorNumber || '1'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-mono font-bold text-neutral-500">NAME:</span>
              <span className="font-bold text-black">{displayName}</span>
            </div>
          </div>
        )}
      </div>

      {/* 🚀 QUICK ACTION: RE-OPEN ONBOARDING SETUP SCREEN */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 space-y-3.5">
        <h3 className="font-extrabold text-base text-black flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-black" />
          <span>Hostel Setup & Reset</span>
        </h3>
        <p className="text-xs text-neutral-500 leading-relaxed font-medium">
          Re-open the initial setup form to change your Room Number or Floor Number from scratch.
        </p>

        <button
          onClick={handleReopenOnboarding}
          className="w-full py-3.5 bg-black text-white hover:bg-neutral-900 font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-xl active:scale-98"
        >
          <Sparkles className="w-4 h-4" />
          <span>RE-OPEN ONBOARDING SETUP SCREEN</span>
        </button>

        <button
          onClick={resetDemoData}
          className="w-full py-3 bg-neutral-100 text-neutral-800 hover:bg-neutral-200 font-mono font-bold text-xs rounded-2xl transition-all flex items-center justify-center space-x-2 border border-neutral-300 mt-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET DEMO DATA</span>
        </button>

        {authLoading ? (
          <div className="py-3 text-center text-xs font-mono text-neutral-500">
            Checking auth...
          </div>
        ) : firebaseUser ? (
          <button
            onClick={signOutUser}
            className="w-full py-3 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-2xl transition-all flex items-center justify-center space-x-2 border border-red-200 mt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>SIGN OUT</span>
          </button>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="w-full py-3 bg-black text-white hover:bg-neutral-800 font-bold text-xs rounded-2xl transition-all flex items-center justify-center space-x-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>CONTINUE WITH GOOGLE</span>
          </button>
        )}
      </div>
    </div>
  );
};
