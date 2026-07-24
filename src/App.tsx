import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Wardrobe } from './pages/Wardrobe';
import { SubmitWash } from './pages/SubmitWash';
import { Collect } from './pages/Collect';
import { ActivityLog } from './pages/ActivityLog';
import { Account } from './pages/Account';
import { Support } from './pages/Support';
import { NotificationManager } from './components/NotificationManager';

function MainApp() {
  const { firebaseUser, authLoading, isOnboarded, getReadyBatchesCount } = useApp();
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [forceOnboarding, setForceOnboarding] = useState(false);

  // Tracks whether the user explicitly logged in during this session.
  const [sessionLoggedIn, setSessionLoggedIn] = useState(false);

  // Auto-pass returning users who are fully onboarded
  React.useEffect(() => {
    if (!authLoading && firebaseUser && isOnboarded) {
      setSessionLoggedIn(true);
    }
  }, [authLoading, firebaseUser, isOnboarded]);

  const handleOpenOnboarding = () => {
    setForceOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    setForceOnboarding(false);
    setCurrentRoute('home');
  };

  // 1. Show Premium Loading Screen with Brand Image while checking Firebase Auth state
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-[#09090B] via-[#18181B] to-[#000000] flex flex-col items-center justify-between p-6 relative overflow-hidden text-white font-sans">
        {/* Ambient Top & Bottom Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-black/40 blur-3xl pointer-events-none" />

        {/* Top Empty Spacer */}
        <div className="h-4" />

        {/* Center Hero Brand Card & Spinner */}
        <div className="w-full max-w-[420px] flex flex-col items-center text-center space-y-6 z-10 my-auto">
          {/* Glowing Brand Image Emblem */}
          <div className="relative group flex items-center justify-center mb-6">
            <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center animate-pulse">
              <img 
                src="https://res.cloudinary.com/ju7wkm1y/image/upload/v1784836807/ChatGPT_Image_Jul_24_2026_01_28_20_AM_1_mqcgeb.png" 
                alt="Brand Logo" 
                className="w-full h-full object-contain drop-shadow-2xl scale-125"
              />
            </div>
          </div>

          {/* Brand Name & Tagline */}
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              Laundrify
            </h1>
            <p className="text-neutral-400 text-xs font-medium tracking-wide">
              Smart Hostel Laundry & Wardrobe Manager
            </p>
          </div>

          {/* Spinner & Loading Bar */}
          <div className="flex flex-col items-center space-y-3 pt-2">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-inner">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-xs font-mono font-semibold text-neutral-200 tracking-wider">
                Initializing Laundrify Cloud...
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[11px] font-mono text-neutral-500 text-center pb-2 z-10">
          Laundrify v2.4
        </div>
      </div>
    );
  }

  // 2. STEP 1: Google / Email Login Page
  if (!firebaseUser || !sessionLoggedIn) {
    return <Login onLogin={() => setSessionLoggedIn(true)} />;
  }

  // 3. STEP 2: Onboarding Setup Page (For new users or when re-opened from Account)
  if (!isOnboarded || forceOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // 4. STEP 3: Main Website Application
  return (
    <div className="min-h-screen bg-[#F4F4F5] text-black font-sans flex flex-col selection:bg-black selection:text-white">
      <NotificationManager />
      {/* Header Bar */}
      <Header onNavigate={(r) => setCurrentRoute(r)} />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-[440px] w-full mx-auto p-4 pt-3 pb-24 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoute}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {currentRoute === 'home' && <Home onNavigate={(r) => setCurrentRoute(r)} />}
            {currentRoute === 'wardrobe' && <Wardrobe onNavigate={(r) => setCurrentRoute(r)} />}
            {currentRoute === 'submit' && <SubmitWash onNavigate={(r) => setCurrentRoute(r)} />}
            {currentRoute === 'collect' && <Collect onNavigate={(r) => setCurrentRoute(r)} />}
            {currentRoute === 'activity' && <ActivityLog onNavigate={(r) => setCurrentRoute(r)} />}
            {currentRoute === 'account' && (
              <Account onNavigate={(r) => setCurrentRoute(r)} onOpenOnboarding={handleOpenOnboarding} />
            )}
            {currentRoute === 'support' && <Support onNavigate={(r) => setCurrentRoute(r)} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Floating Navigation Bar */}
      <BottomNav
        currentRoute={currentRoute}
        onNavigate={(r) => setCurrentRoute(r)}
        readyCount={getReadyBatchesCount()}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
