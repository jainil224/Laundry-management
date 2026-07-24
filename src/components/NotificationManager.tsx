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

    if (result === 'granted') {
      sendNotification('🧺 Laundry Reminders Active!', {
        body: 'You will receive reminders on Mondays and Thursdays at 5:00 PM.',
        icon: 'https://res.cloudinary.com/ju7wkm1y/image/upload/v1784828543/ChatGPT_Image_Jul_23_2026_11_11_54_PM_axvdkp.png',
      });
    }
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
            icon: 'https://res.cloudinary.com/ju7wkm1y/image/upload/v1784828543/ChatGPT_Image_Jul_23_2026_11_11_54_PM_axvdkp.png',
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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-50 bg-black text-white rounded-2xl p-4 shadow-2xl border border-white/20 flex flex-col space-y-3"
        >
          <button 
            onClick={() => setShowPrompt(false)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start space-x-3 pr-6">
            <div className="w-10 h-10 rounded-full bg-[#6C7BFF] flex-shrink-0 flex items-center justify-center shadow-lg">
              <BellRing className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm">Laundry Reminders</h4>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                Get notified on Mondays and Thursdays at 5 PM to collect & submit your laundry.
              </p>
            </div>
          </div>
          
          <button
            onClick={requestPermission}
            className="w-full py-2.5 bg-white text-black font-bold text-xs rounded-xl shadow-md active:scale-95 transition-transform"
          >
            Allow Notifications
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
