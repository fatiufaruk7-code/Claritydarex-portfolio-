import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OfflineFallback } from './components/OfflineFallback';
import { useOnlineStatus } from './hooks/useOnlineStatus';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'admin'>('home');
  const isOnline = useOnlineStatus();
  const [dismissedOfflineFallback, setDismissedOfflineFallback] = useState(false);

  // Automatically reset dismissal flag when network connectivity returns
  useEffect(() => {
    if (isOnline) {
      setDismissedOfflineFallback(false);
    }
  }, [isOnline]);

  useEffect(() => {
    // Check initial URL pathname or hash
    const syncViewFromUrl = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#/admin' || hash === '#admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('home');
      }
    };

    syncViewFromUrl();
    window.addEventListener('popstate', syncViewFromUrl);
    return () => window.removeEventListener('popstate', syncViewFromUrl);
  }, []);

  const handleNavigateToView = (view: 'home' | 'admin') => {
    setCurrentView(view);
    if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.history.pushState({}, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    if (currentView !== 'home') {
      handleNavigateToView('home');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const isShowingOfflineFallback = !isOnline && !dismissedOfflineFallback;

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {/* Network offline/online status indicator */}
      <OfflineIndicator hideBottomBanner={isShowingOfflineFallback} />

      {/* Sticky Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigateToView={handleNavigateToView}
      />

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
          ) : currentView === 'home' ? (
            <motion.div
              key="home-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <HomePage />
            </motion.div>
          ) : (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <AdminDashboard onReturnToHome={() => handleNavigateToView('home')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Footer (shown on public site when not in offline fallback mode) */}
      {!isShowingOfflineFallback && currentView === 'home' && (
        <Footer
          onNavigateToView={handleNavigateToView}
          onScrollToSection={handleScrollToSection}
        />
      )}
    </div>
  );
}
