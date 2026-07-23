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

  // 1. Show Spinner while checking Firebase Auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-3 font-sans">
        <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
        <span className="text-xs font-mono text-neutral-400">Initializing Laundrify Cloud...</span>
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
      {/* Header Bar */}
      <Header onNavigate={(r) => setCurrentRoute(r)} />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-[480px] w-full mx-auto p-4 pt-3 pb-24 relative">
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

      {/* Made with love footer */}
      <div className="text-center pb-1 pt-0">
        <span style={{
          fontSize: '11px',
          color: '#a1a1aa',
          fontFamily: 'inherit',
          letterSpacing: '0.02em',
          userSelect: 'none',
        }}>
          Made with{' '}
          <span style={{ color: '#e11d48', fontSize: '13px' }}>♥</span>
          {' '}by{' '}
          <span style={{ fontWeight: 600, color: '#3f3f46' }}>Jainil Patel</span>
        </span>
      </div>

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
