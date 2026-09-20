import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { authenticateAdmin } from '../services/adminAuthService';
import { getFirebaseInstance } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface AdminLoginProps {
  onReturnToHome: () => void;
  onLoginSuccess: (email?: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onReturnToHome, onLoginSuccess }) => {
  const [email, setEmail] = useState('fatiufaruk7@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setAuthError('Please enter your administrator email address.');
      return;
    }

    if (!password) {
      setAuthError('Please enter your administrator password.');
      return;
    }

    setIsLoading(true);

    // 1. Try local verified admin credential authentication (configured for fatiufaruk7@gmail.com + 12345)
    const localResult = authenticateAdmin(trimmedEmail, password);
    if (localResult.success) {
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(trimmedEmail);
      }, 350);
      return;
    }

    // 2. Also attempt Firebase Auth if configured
    const firebase = getFirebaseInstance();
    if (firebase) {
      try {
        await signInWithEmailAndPassword(firebase.auth, trimmedEmail, password);
        setIsLoading(false);
        onLoginSuccess(trimmedEmail);
        return;
      } catch {
        // Fall back to local error
      }
    }

    setIsLoading(false);
    setAuthError(localResult.error || 'Authentication failed. Please verify your credentials.');
  };

  const handleUseDefaultCredentials = () => {
    setEmail('fatiufaruk7@gmail.com');
    setPassword('12345');
    setAuthError(null);
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* Dynamic Animated Ambient Glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none"
      />

      {/* Top Back link */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4"
      >
        <button
          onClick={onReturnToHome}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" strokeWidth={1.5} />
          <span>Return to Darex Public Website</span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10"
      >
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-[1px] shadow-xl shadow-blue-500/20 mb-2">
            <div className="w-full h-full bg-[#090a0f] rounded-[15px] flex items-center justify-center font-bold text-xl text-white font-mono shadow-inner">
              <span className="text-blue-500">D</span>X
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-blue-400 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
            <span>Administrator Access</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Darex Management Portal
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Authorized administrator console for Faruk Fatiu.
          </p>
        </div>

        {/* Card Frame */}
        <div className="bg-[#0e121a] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative backdrop-blur">
          
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-start gap-2.5 text-rose-200 text-xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="flex-1 leading-relaxed">
                <span className="font-semibold text-white">Verification Notice:</span> {authError}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="admin-email">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="fatiufaruk7@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300" htmlFor="admin-password">
                  Password
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  Initial: <span className="text-blue-400">12345</span>
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                id="admin-submit-login-btn"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_6px_20px_rgba(37,99,235,0.4)]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                    <span>Verifying Administrator Privileges...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" strokeWidth={1.5} />
                    <span>Sign In to Admin Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick-fill helper pill */}
          <div className="mt-5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" strokeWidth={1.5} />
              <span className="text-[11px]">Default passcode is <strong className="text-slate-200">12345</strong></span>
            </div>
            <button
              type="button"
              onClick={handleUseDefaultCredentials}
              className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Auto-fill
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/60 text-center text-[11px] text-slate-400">
            Assigned Administrator: <span className="text-slate-200 font-mono">fatiufaruk7@gmail.com</span>
            <div className="mt-1 text-slate-400">
              You can change this password anytime in the dashboard settings.
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
