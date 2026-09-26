import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OfflineFallback } from './components/OfflineFallback';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { SiteSettingsProvider } from './context/SiteSettingsContext';

export default function App() {
  const isOnline = useOnlineStatus();
  const [dismissedOfflineFallback, setDismissedOfflineFallback] = useState(false);

  // Automatically reset dismissal flag when network connectivity returns
  useEffect(() => {
    if (isOnline) {
      setDismissedOfflineFallback(false);
    }
  }, [isOnline]);

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isShowingOfflineFallback = !isOnline && !dismissedOfflineFallback;

  return (
    <SiteSettingsProvider>
      <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {/* Network offline/online status indicator */}
        <OfflineIndicator hideBottomBanner={isShowingOfflineFallback} />

        {/* Sticky Top Navigation */}
        <Navbar />

        {/* Main View Router with Motion Transitions */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {isShowingOfflineFallback ? (
              <motion.div
                key="offline-fallback-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <OfflineFallback
                  onRetry={() => {
                    if (typeof navigator !== 'undefined' && navigator.onLine) {
                      setDismissedOfflineFallback(false);
                    }
                  }}
                  onBrowseCachedAnyway={() => setDismissedOfflineFallback(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="home-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <HomePage />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Footer (shown when not in offline fallback mode) */}
        {!isShowingOfflineFallback && (
          <Footer onScrollToSection={handleScrollToSection} />
        )}
      </div>
    </SiteSettingsProvider>
  );
}
