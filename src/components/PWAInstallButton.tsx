import React, { useState } from 'react';
import { Download, Smartphone, Monitor, ArrowDownToLine } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'mobile-nav' | 'hero' | 'footer' | 'floating';
  className?: string;
  onInstalled?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
  onInstalled,
}) => {
  const { isInstallable, isInstalled, isStandalone, isIOS, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already installed and running in standalone mode, hide the button
  if (isInstalled || isStandalone) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        if (onInstalled) onInstalled();
        return;
      }
    }
    // If not directly triggerable via beforeinstallprompt (e.g., iOS Safari or browser requires manual install), open guided instructions
    setIsModalOpen(true);
  };

  const initialTab = isIOS ? 'ios' : 'android';

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          id="pwa-install-header-btn"
          title="Install Darex App on your device"
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-400 hover:text-white bg-blue-950/50 hover:bg-blue-900/60 border border-blue-800/40 hover:border-blue-700/60 transition-all shadow-sm active:scale-95 ${className}`}
        >
          <ArrowDownToLine className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Install App</span>
        </button>
      )}

      {variant === 'mobile-nav' && (
        <button
          onClick={handleClick}
          id="pwa-install-mobile-btn"
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-blue-300 hover:text-white bg-blue-950/60 border border-blue-800/60 hover:bg-blue-900/70 transition-colors shadow-md shadow-blue-950/50 ${className}`}
        >
          <ArrowDownToLine className="w-4 h-4 text-blue-400" strokeWidth={2} />
          <span>Install Darex App</span>
        </button>
      )}

      {variant === 'hero' && (
        <button
          onClick={handleClick}
          id="pwa-install-hero-btn"
          className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 backdrop-blur-sm transition-all shadow-lg active:scale-95 ${className}`}
        >
          <ArrowDownToLine className="w-4 h-4 text-blue-400" strokeWidth={2} />
          <span>Install App</span>
        </button>
      )}

      {variant === 'footer' && (
        <button
          onClick={handleClick}
          id="pwa-install-footer-btn"
          className={`inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install Progressive Web App</span>
        </button>
      )}

      {variant === 'floating' && (
        <button
          onClick={handleClick}
          id="pwa-install-floating-btn"
          className={`fixed bottom-24 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-xl shadow-blue-600/30 border border-blue-400/30 active:scale-95 transition-all ${className}`}
        >
          <ArrowDownToLine className="w-4 h-4" />
          <span>Install App</span>
        </button>
      )}

      {/* Guided installation instructions modal */}
      <PWAInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isInstallable={isInstallable}
        onTriggerInstall={install}
        initialTab={initialTab}
      />
    </>
  );
};
