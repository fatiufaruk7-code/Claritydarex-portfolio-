import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Monitor, Share2, PlusSquare, ArrowRight, CheckCircle2, Download } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  onTriggerInstall: () => Promise<boolean>;
  initialTab?: 'ios' | 'android' | 'desktop';
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  onTriggerInstall,
  initialTab = 'android',
}) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>(initialTab);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-[#0e121a] border border-slate-800 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800/80 bg-slate-900/40 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-[#090a0f] flex items-center justify-center">
                  <span className="text-blue-400 font-extrabold text-lg">D</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Install Darex App</h3>
                <p className="text-xs text-slate-400">Install directly to your home screen or desktop</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick 1-Click prompt if native install prompt is available */}
          {isInstallable && (
            <div className="mx-6 mt-6 p-4 rounded-2xl bg-blue-950/40 border border-blue-600/40 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-blue-300">Ready for Instant Installation</div>
                <div className="text-xs text-blue-200/70">Click below to open your device's install prompt.</div>
              </div>
              <button
                onClick={async () => {
                  const success = await onTriggerInstall();
                  if (success) onClose();
                }}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/40 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install Now</span>
              </button>
            </div>
          )}

          {/* Platform Guide Tabs */}
          <div className="p-6">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              Installation Instructions by Device
            </div>

            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900/80 border border-slate-800 rounded-xl mb-6">
              <button
                onClick={() => setActiveTab('android')}
                className={`py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'android'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'ios'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>
              <button
                onClick={() => setActiveTab('desktop')}
                className={`py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'desktop'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'ios' && (
              <div className="space-y-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-300 font-mono font-bold shrink-0 text-[11px]">
                    1
                  </div>
                  <div>
                    In Apple Safari, tap the <strong className="text-white">Share</strong> icon (
                    <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" />) located in the bottom navigation bar.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-300 font-mono font-bold shrink-0 text-[11px]">
                    2
                  </div>
                  <div>
                    Scroll down the action sheet and tap <strong className="text-white">Add to Home Screen</strong> (
                    <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" />).
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-300 font-mono font-bold shrink-0 text-[11px]">
                    3
                  </div>
                  <div>
                    Confirm by tapping <strong className="text-white">Add</strong> in the top right. Darex will now appear as a dedicated app icon on your home screen!
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'android' && (
              <div className="space-y-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-300 font-mono font-bold shrink-0 text-[11px]">
                    1
                  </div>
                  <div>
                    In Chrome or your Android browser, tap the <strong className="text-white">Install App</strong> button or the three-dot menu (<strong className="text-white">⋮</strong>) at the top right.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-300 font-mono font-bold shrink-0 text-[11px]">
                    2
                  </div>
                  <div>
                    Select <strong className="text-white">Install app</strong> or <strong className="text-white">Add to Home screen</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-300 font-mono font-bold shrink-0 text-[11px]">
                    3
                  </div>
                  <div>
                    Tap <strong className="text-white">Install</strong> when prompted. The app launches in full-screen standalone mode with offline portfolio caching.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'desktop' && (
              <div className="space-y-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-300 font-mono font-bold shrink-0 text-[11px]">
                    1
                  </div>
                  <div>
                    In Chrome, Edge, or Brave, look for the <strong className="text-white">Install icon</strong> (computer monitor with downward arrow) in the right side of the address bar.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-300 font-mono font-bold shrink-0 text-[11px]">
                    2
                  </div>
                  <div>
                    Click <strong className="text-white">Install Darex</strong> to launch it in a distraction-free standalone desktop window.
                  </div>
                </div>
              </div>
            )}

            {/* Feature Highlights of PWA */}
            <div className="mt-5 pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Fast Offline Caching</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero App Store Downloads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>No Browser Clutter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Automatic Updates</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
