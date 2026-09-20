import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  hideBottomBanner?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ hideBottomBanner = false }) => {
  const isOnline = useOnlineStatus();
  const [showRestored, setShowRestored] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showRestored) {
    return null;
  }

  if (showRestored) {
    return (
      <div
        id="pwa-connection-restored"
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-950/90 border border-emerald-600/50 text-emerald-300 text-xs font-medium shadow-2xl backdrop-blur-md transition-all animate-bounce"
      >
        <Wifi className="w-4 h-4 text-emerald-400" />
        <span>Connection restored — Live sync active</span>
      </div>
    );
  }

  if (hideBottomBanner) {
    return null;
  }

  return (
    <div
      id="pwa-offline-indicator"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0e131d]/95 border border-amber-500/40 text-slate-200 text-xs shadow-2xl shadow-black/90 backdrop-blur-md"
    >
      <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-600/40 flex items-center justify-center shrink-0">
        <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-amber-400 flex items-center gap-1">
          <span>Offline Mode</span>
          <span className="text-[10px] font-normal text-slate-400">• Cached Content</span>
        </div>
        <div className="text-[11px] text-slate-300 truncate">
          Viewing saved portfolio. Inquiries & Admin require internet.
        </div>
      </div>
    </div>
  );
};
