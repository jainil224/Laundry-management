import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, X } from 'lucide-react';

export const NotificationManager: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) return;
    
    // Register Service Worker for mobile notification support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration failed: ', err);
      });
    }

    setPermission(Notification.permission);
    if (Notification.permission === 'default') {
      // Delay prompt slightly so it's not too aggressive
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const sendNotification = async (title: string, options: NotificationOptions) => {
    if (Notification.permission !== 'granted') return;
    
    // Try service worker first for mobile support
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg) {
        reg.showNotification(title, options);
        return;
      }
    }
    // Fallback to standard web notification
    new Notification(title, options);
  };

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    setShowPrompt(false);
  };

  // Schedule Logic
  useEffect(() => {
    if (permission !== 'granted') return;

    // Check every minute if it's Mon/Thu 5:00 PM
    const interval = setInterval(() => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sun, 1 = Mon, 4 = Thu
      const hour = now.getHours();
      const minute = now.getMinutes();

      // Fire only at exactly 17:00 (5:00 PM) on Mon and Thu
      if ((day === 1 || day === 4) && hour === 17 && minute === 0) {
        // Prevent firing multiple times within the same minute
        const lastSentDate = localStorage.getItem('lastReminderDate');
        const todayStr = now.toDateString();

        if (lastSentDate !== todayStr) {
          sendNotification('🧺 Laundry Collection Reminder', {
            body: 'Laundry collection is now open.\nPlease collect your clean clothes and submit your dirty laundry for the next washing cycle.\n\nThank you for your cooperation.',
            icon: 'https://res.cloudinary.com/ju7wkm1y/image/upload/v1784829453/ChatGPT_Image_Jul_23_2026_11_27_17_PM_x1k4uv.png',
            requireInteraction: true,
          });
          localStorage.setItem('lastReminderDate', todayStr);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [permission]);

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[420px] z-[60] bg-black/95 text-white rounded-3xl p-5 shadow-2xl border border-white/20 flex flex-col space-y-3.5 backdrop-blur-xl"
        >
          <button 
            onClick={() => setShowPrompt(false)}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            aria-label="Close notification prompt"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start space-x-3.5 pr-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6C7BFF] to-[#4F5DFF] flex-shrink-0 flex items-center justify-center shadow-lg border border-white/20">
              <BellRing className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                <span>Laundry Reminders</span>
                <span className="text-[9px] bg-white/15 px-2 py-0.5 rounded-full font-mono text-white/80">MON & THU</span>
              </h4>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Get notified on Mondays & Thursdays at 5:00 PM to collect & submit your laundry on time.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={requestPermission}
              className="flex-1 py-3 bg-white hover:bg-neutral-100 text-black font-extrabold text-xs rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <BellRing className="w-4 h-4 text-black fill-black" />
              <span>Allow Notifications</span>
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-2xl active:scale-98 transition-all"
            >
              Later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
