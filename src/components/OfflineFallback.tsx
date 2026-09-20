import React, { useState } from 'react';
import { motion } from 'motion/react';
import { WifiOff, RefreshCw, AlertCircle, CheckCircle2, Phone, Mail, ArrowRight, ShieldAlert, Database, Globe } from 'lucide-react';
import { COMPANY_INFO } from '../data/company';

interface OfflineFallbackProps {
  onRetry?: () => Promise<boolean> | void;
  onBrowseCachedAnyway?: () => void;
}

export const OfflineFallback: React.FC<OfflineFallbackProps> = ({
  onRetry,
  onBrowseCachedAnyway,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<'idle' | 'failed' | 'restored'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRetry = async () => {
    setIsChecking(true);
    setCheckResult('idle');
    setErrorMessage(null);

    try {
      // First check browser's navigator.onLine flag
      const browserOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;

      if (!browserOnline) {
        // Brief simulated check delay for natural feedback
        await new Promise((resolve) => setTimeout(resolve, 800));
        setCheckResult('failed');
        setErrorMessage('Device indicates no network connection. Please check your Wi-Fi, Ethernet, or mobile data.');
        setIsChecking(false);
        return;
      }

      // If navigator says online, verify with a lightweight fetch attempt
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      try {
        await fetch(`/favicon.ico?_t=${Date.now()}`, {
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        setCheckResult('restored');
        if (onRetry) {
          await onRetry();
        } else {
          // If no custom handler, reload to re-mount live session
          setTimeout(() => {
            window.location.reload();
          }, 600);
        }
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        setCheckResult('failed');
        setErrorMessage('Network probe timed out. Internet connection appears unstable or unreachable.');
      }
    } catch (err) {
      setCheckResult('failed');
      setErrorMessage('Unable to re-establish connection. Please try again in a moment.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-10 right-1/4 w-[380px] h-[260px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Main Card Container */}
        <div className="bg-[#0e121a] border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/80">
          
          {/* Status Badge */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-6 border-b border-slate-800/80">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/50 border border-amber-600/40 text-xs font-mono text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>OFFLINE MODE • NETWORK DISCONNECTED</span>
            </div>

            <div className="text-xs font-mono text-slate-400">
              App Status: Standalone Local
            </div>
          </div>

          {/* Icon & Title Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-blue-600/20 to-slate-900 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <WifiOff className="w-8 h-8 text-amber-400" strokeWidth={1.75} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-amber-500/60 flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-amber-400" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                You are currently offline
              </h1>
              <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                Darex cannot reach the internet right now. Real-time inquiry submissions and cloud dashboard sync require an active connection.
              </p>
            </div>
          </div>

          {/* System Diagnostics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Network Link</span>
              </div>
              <p className="text-xs text-amber-300 font-mono">Offline / Unreachable</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>PWA Local Shell</span>
              </div>
              <p className="text-xs text-emerald-400 font-mono">Cached & Intact</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span>Cloud Sync</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Standby</p>
            </div>
          </div>

          {/* Feedback message banner (if retry attempted) */}
          {checkResult === 'failed' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 mb-6 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <strong className="font-semibold block text-rose-200">Connection probe failed</strong>
                {errorMessage || 'Still offline. Please check your network connection and try again.'}
              </div>
            </motion.div>
          )}

          {checkResult === 'restored' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 mb-6 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-emerald-300 text-xs flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Connection re-established! Restoring live application...</span>
            </motion.div>
          )}

          {/* Primary Actions: Retry & Secondary options */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={handleRetry}
              disabled={isChecking}
              id="offline-retry-btn"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-60 transition-all shadow-lg shadow-blue-600/30"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking Connection...' : 'Retry Connection'}</span>
            </button>

            <button
              onClick={handleReload}
              id="offline-reload-btn"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition-all"
            >
              <span>Reload Page</span>
            </button>

            {onBrowseCachedAnyway && (
              <button
                onClick={onBrowseCachedAnyway}
                id="offline-browse-cached-btn"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl font-medium text-xs text-blue-400 hover:text-blue-300 bg-blue-950/30 hover:bg-blue-950/60 border border-blue-900/40 transition-all"
              >
                <span>View Cached Portfolio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Emergency Direct Contact Details */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              Need Direct Assistance While Offline?
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <a
                href={`tel:${COMPANY_INFO.phone}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800/40 flex items-center justify-center text-blue-400 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] text-slate-400">Direct Telephone Call</div>
                  <div className="font-semibold text-slate-200">{COMPANY_INFO.phoneFormatted}</div>
                </div>
              </a>

              <a
                href={`mailto:${COMPANY_INFO.email}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800/40 flex items-center justify-center text-blue-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] text-slate-400">Direct Email</div>
                  <div className="font-semibold text-slate-200 truncate">{COMPANY_INFO.email}</div>
                </div>
              </a>
            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
};
