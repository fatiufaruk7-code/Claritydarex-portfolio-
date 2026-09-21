import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  HelpCircle,
  X,
} from 'lucide-react';
import {
  loginAdminWithCredentials,
  sendAdminPasswordReset,
  DESIGNATED_ADMIN_EMAIL,
} from '../services/adminAuthService';

interface AdminLoginProps {
  onReturnToHome: () => void;
  onLoginSuccess: (email?: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onReturnToHome, onLoginSuccess }) => {
  const [email, setEmail] = useState(DESIGNATED_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Forgot password modal / state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState(DESIGNATED_ADMIN_EMAIL);
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

    try {
      const result = await loginAdminWithCredentials(trimmedEmail, password);
      if (result.success) {
        onLoginSuccess(trimmedEmail);
      } else {
        setAuthError(
          result.error ||
            'Authentication failed. Please verify your credentials and administrator privileges.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during login.';
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);
    setIsResetting(true);

    try {
      const res = await sendAdminPasswordReset(resetEmail);
      if (res.success) {
        setResetStatus({
          type: 'success',
          text: 'Password recovery email dispatched. Please check your inbox to configure your private password.',
        });
      } else {
        setResetStatus({
          type: 'error',
          text: res.error || 'Failed to send recovery email. Please check the email address.',
        });
      }
    } catch (err: unknown) {
      setResetStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to dispatch reset email.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* Animated Ambient Glow */}
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

      {/* Top Return link */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4"
      >
        <button
          onClick={onReturnToHome}
          id="admin-return-home-link"
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
              id="admin-auth-error-alert"
              className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-start gap-2.5 text-rose-200 text-xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="flex-1 leading-relaxed">
                <span className="font-semibold text-white">Access Notice:</span> {authError}
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
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300" htmlFor="admin-password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetModalOpen(true);
                    setResetStatus(null);
                  }}
                  className="text-[11px] font-mono text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
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
                  autoComplete="current-password"
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

          <div className="mt-6 pt-4 border-t border-slate-800/60 text-center text-[11px] text-slate-400">
            Designated Administrator: <span className="text-slate-200 font-mono">fatiufaruk7@gmail.com</span>
            <div className="mt-1 text-slate-500">
              Only authorized administrator accounts are permitted access.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0e121a] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                    <HelpCircle className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Reset Admin Password</h3>
                    <p className="text-[11px] text-slate-400">Send a recovery link via Firebase Authentication</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {resetStatus && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    resetStatus.type === 'success'
                      ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-200'
                      : 'bg-rose-950/60 border border-rose-800/60 text-rose-200'
                  }`}
                >
                  {resetStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                  )}
                  <span>{resetStatus.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordResetSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="reset-email">
                    Administrator Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="fatiufaruk7@gmail.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md shadow-blue-600/30"
                  >
                    {isResetting && <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />}
                    <span>Send Reset Email</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
