import React, { useState, useEffect } from 'react';
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
  Settings,
  Database,
  Copy,
  ExternalLink,
} from 'lucide-react';
import {
  loginAdminWithCredentials,
  sendAdminPasswordReset,
  DESIGNATED_ADMIN_EMAIL,
} from '../services/adminAuthService';
import {
  checkFirebaseConfig,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
  getCustomFirebaseConfig,
} from '../firebase/config';

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

  // Firebase Config modal & status
  const [firebaseStatus, setFirebaseStatus] = useState(checkFirebaseConfig());
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configJsonInput, setConfigJsonInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [authDomainInput, setAuthDomainInput] = useState('');
  const [projectIdInput, setProjectIdInput] = useState('');
  const [appIdInput, setAppIdInput] = useState('');
  const [configSaveMsg, setConfigSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);

  useEffect(() => {
    const existing = getCustomFirebaseConfig();
    if (existing) {
      setApiKeyInput(existing.apiKey || '');
      setAuthDomainInput(existing.authDomain || '');
      setProjectIdInput(existing.projectId || '');
      setAppIdInput(existing.appId || '');
    }
  }, []);

  const refreshFirebaseStatus = () => {
    setFirebaseStatus(checkFirebaseConfig());
  };

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
          text: 'Password recovery processed. If using Firebase, check your inbox. If using device credentials, your password key has been reset.',
        });
      } else {
        setResetStatus({
          type: 'error',
          text: res.error || 'Failed to process password recovery. Please verify the email address.',
        });
      }
    } catch (err: unknown) {
      setResetStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to process password recovery.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaveMsg(null);

    // If user pasted a JSON config object
    if (configJsonInput.trim()) {
      try {
        let text = configJsonInput.trim();
        if (text.includes('{') && text.includes('}')) {
          text = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        }
        // Handle JS object literal without quoted keys
        const cleaned = text
          .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')
          .replace(/'/g, '"')
          .replace(/,\s*}/g, '}');

        const parsed = JSON.parse(cleaned);
        if (!parsed.apiKey || !parsed.projectId) {
          throw new Error('Pasted config is missing required apiKey or projectId.');
        }

        saveCustomFirebaseConfig({
          apiKey: parsed.apiKey,
          authDomain: parsed.authDomain || `${parsed.projectId}.firebaseapp.com`,
          projectId: parsed.projectId,
          storageBucket: parsed.storageBucket || `${parsed.projectId}.appspot.com`,
          messagingSenderId: parsed.messagingSenderId || '',
          appId: parsed.appId || '',
          measurementId: parsed.measurementId,
        });

        refreshFirebaseStatus();
        setConfigSaveMsg({ type: 'success', text: 'Firebase configuration saved and activated successfully!' });
        return;
      } catch (err: any) {
        setConfigSaveMsg({
          type: 'error',
          text: `Invalid config format: ${err.message || 'Please verify the pasted JSON snippet.'}`,
        });
        return;
      }
    }

    // Otherwise use manual inputs
    if (!apiKeyInput.trim() || !projectIdInput.trim()) {
      setConfigSaveMsg({
        type: 'error',
        text: 'Please provide at least the Firebase API Key and Project ID.',
      });
      return;
    }

    saveCustomFirebaseConfig({
      apiKey: apiKeyInput.trim(),
      authDomain: authDomainInput.trim() || `${projectIdInput.trim()}.firebaseapp.com`,
      projectId: projectIdInput.trim(),
      storageBucket: `${projectIdInput.trim()}.appspot.com`,
      appId: appIdInput.trim() || '',
    });

    refreshFirebaseStatus();
    setConfigSaveMsg({ type: 'success', text: 'Firebase configuration saved and activated successfully!' });
  };

  const handleCopyVercelEnv = () => {
    const text = `# Darex Production Environment Variables (Vercel Project Settings)
VITE_FIREBASE_API_KEY=${apiKeyInput || 'YOUR_API_KEY'}
VITE_FIREBASE_AUTH_DOMAIN=${authDomainInput || (projectIdInput ? `${projectIdInput}.firebaseapp.com` : 'YOUR_PROJECT_ID.firebaseapp.com')}
VITE_FIREBASE_PROJECT_ID=${projectIdInput || 'YOUR_PROJECT_ID'}
VITE_FIREBASE_STORAGE_BUCKET=${projectIdInput ? `${projectIdInput}.appspot.com` : 'YOUR_PROJECT_ID.appspot.com'}
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=${appIdInput || 'YOUR_APP_ID'}
`;
    navigator.clipboard.writeText(text);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
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
          {/* Cloud Sync Status Indicator */}
          <div className="mb-4 px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  firebaseStatus.isConfigured ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-amber-400'
                }`}
              />
              <span className="text-[11px] font-mono text-slate-300">
                {firebaseStatus.isConfigured
                  ? firebaseStatus.source === 'env'
                    ? 'Cloud Sync: Active (Production Env)'
                    : 'Cloud Sync: Active (Custom Web App)'
                  : 'Cloud Sync: Pending • Local Admin Mode'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsConfigModalOpen(true);
                setConfigSaveMsg(null);
              }}
              className={`text-[11px] font-mono font-medium hover:underline ${
                firebaseStatus.isConfigured ? 'text-blue-400 hover:text-blue-300' : 'text-emerald-400 hover:text-emerald-300 font-semibold'
              }`}
            >
              {firebaseStatus.isConfigured ? 'Manage' : 'Connect Firebase'}
            </button>
          </div>

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

      {/* Firebase Cloud Connection & Configuration Modal */}
      <AnimatePresence>
        {isConfigModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0e121a] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400">
                    <Database className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Firebase Project Connection</h3>
                    <p className="text-[11px] text-slate-400">
                      Configure Firebase Authentication & Firestore real-time cloud sync.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Status banner */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      firebaseStatus.isConfigured ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-white text-[11px]">
                      {firebaseStatus.isConfigured ? 'Firebase Connected' : 'Local Administrator Mode'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {firebaseStatus.isConfigured
                        ? firebaseStatus.source === 'env'
                          ? 'Active via environment variables.'
                          : 'Active via saved custom web config.'
                        : 'Submissions and admin logins operate securely on device.'}
                    </div>
                  </div>
                </div>

                {firebaseStatus.source === 'custom' && (
                  <button
                    type="button"
                    onClick={() => {
                      clearCustomFirebaseConfig();
                      refreshFirebaseStatus();
                      setConfigSaveMsg({ type: 'success', text: 'Custom Firebase configuration cleared.' });
                    }}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-mono underline"
                  >
                    Clear Custom
                  </button>
                )}
              </div>

              {/* Console Tip */}
              <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-300 leading-relaxed">
                <span className="font-semibold text-white">Firebase Console Tip:</span> If you see{' '}
                <code className="font-mono bg-blue-900/50 px-1 py-0.5 rounded text-white text-[10px]">
                  auth/configuration-not-found
                </code>
                , visit your Firebase Console → <strong>Authentication</strong> → <strong>Sign-in method</strong>, enable{' '}
                <strong>Email/Password</strong>, and click <strong>Save</strong>. In the meantime, Local Administrator Mode keeps your portal accessible.
              </div>

              {configSaveMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    configSaveMsg.type === 'success'
                      ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-200'
                      : 'bg-rose-950/60 border border-rose-800/60 text-rose-200'
                  }`}
                >
                  {configSaveMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                  )}
                  <span>{configSaveMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveFirebaseConfig} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Option 1: Paste Firebase Web App Config Object
                  </label>
                  <textarea
                    rows={3}
                    value={configJsonInput}
                    onChange={(e) => setConfigJsonInput(e.target.value)}
                    placeholder={`const firebaseConfig = {\n  apiKey: "...",\n  authDomain: "...",\n  projectId: "..."\n};`}
                    className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Copy from Firebase Console → Project Settings → General → Web App.
                  </span>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-2 text-slate-500 font-mono text-[10px] uppercase">
                    or enter keys manually
                  </span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">API Key</label>
                    <input
                      type="text"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Project ID</label>
                    <input
                      type="text"
                      value={projectIdInput}
                      onChange={(e) => setProjectIdInput(e.target.value)}
                      placeholder="darex-digital-..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Auth Domain (Optional)</label>
                    <input
                      type="text"
                      value={authDomainInput}
                      onChange={(e) => setAuthDomainInput(e.target.value)}
                      placeholder="project.firebaseapp.com"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">App ID (Optional)</label>
                    <input
                      type="text"
                      value={appIdInput}
                      onChange={(e) => setAppIdInput(e.target.value)}
                      placeholder="1:123456789:web:..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleCopyVercelEnv}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-slate-300 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
                  >
                    {copiedEnv ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEnv ? 'Copied Vercel Env!' : 'Copy Vercel Env Snippet'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsConfigModalOpen(false)}
                      className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 text-xs"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/30"
                    >
                      Save & Connect
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
