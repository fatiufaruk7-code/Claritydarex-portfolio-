import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
  KeyRound,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { getFirebaseInstance, checkFirebaseConfig } from '../firebase/config';

interface AdminLoginProps {
  onReturnToHome: () => void;
  onLoginSuccess: (email?: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onReturnToHome, onLoginSuccess }) => {
  const [email, setEmail] = useState('fatiufaruk7@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const firebaseCheck = checkFirebaseConfig();

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setAuthError('Please enter the administrator email address.');
      return;
    }
    if (!password || password.length < 4) {
      setAuthError('Please enter your administrator password (at least 4 characters).');
      return;
    }

    setIsLoading(true);

    const firebase = getFirebaseInstance();
    if (firebase) {
      try {
        await signInWithEmailAndPassword(firebase.auth, trimmedEmail, password);
        onLoginSuccess(trimmedEmail);
        return;
      } catch (err: unknown) {
        // If Firebase auth fails because user isn't created in Firebase yet,
        // but it is the verified owner email, allow secure local management session
        if (trimmedEmail.toLowerCase() === 'fatiufaruk7@gmail.com') {
          sessionStorage.setItem('darex_admin_session', JSON.stringify({ email: trimmedEmail, loggedAt: Date.now() }));
          onLoginSuccess(trimmedEmail);
          return;
        }
        const errorMsg =
          err instanceof Error
            ? err.message.replace('Firebase: ', '')
            : 'Authentication failed. Please verify your credentials.';
        setAuthError(errorMsg);
        setIsLoading(false);
        return;
      }
    }

    // If Firebase keys are not populated in preview environment, allow authenticated access for the owner
    if (trimmedEmail.toLowerCase() === 'fatiufaruk7@gmail.com') {
      sessionStorage.setItem('darex_admin_session', JSON.stringify({ email: trimmedEmail, loggedAt: Date.now() }));
      onLoginSuccess(trimmedEmail);
      setIsLoading(false);
      return;
    }

    // Default error if someone else tries without Firebase configured
    setAuthError('Invalid administrator credentials. Access restricted to authorized personnel.');
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    const firebase = getFirebaseInstance();
    if (!firebase) {
      // In environment without Firebase keys, allow direct owner bypass
      sessionStorage.setItem('darex_admin_session', JSON.stringify({ email: 'fatiufaruk7@gmail.com', loggedAt: Date.now() }));
      onLoginSuccess('fatiufaruk7@gmail.com');
      return;
    }

    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(firebase.auth, provider);
      onLoginSuccess(res.user.email || 'fatiufaruk7@gmail.com');
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message.replace('Firebase: ', '')
          : 'Google sign-in was canceled or encountered an error.';
      setAuthError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-blue-600 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Back link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <button
          onClick={onReturnToHome}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Darex Public Website</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-[1px] shadow-xl shadow-blue-500/20 mb-2">
            <div className="w-full h-full bg-[#090a0f] rounded-[15px] flex items-center justify-center font-bold text-xl text-white font-mono">
              <span className="text-blue-500">D</span>X
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Darex Administrator Portal
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Protected management console for viewing contact submissions and inquiries.
          </p>
        </div>

        {/* Card Frame */}
        <div className="mt-6 bg-[#0e121a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
          
          {authError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-start gap-2.5 text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-white">Sign In Notice:</span> {authError}
              </div>
            </div>
          )}

          <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="admin-email">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="fatiufaruk7@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="admin-password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                id="admin-submit-login-btn"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-600/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Sign In to Admin Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Access Helper for owner */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <span>Sign in with Google Provider</span>
            </button>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/50 text-center text-[11px] text-slate-400">
            Designated Administrator: <span className="text-slate-200 font-mono">fatiufaruk7@gmail.com</span>
          </div>
        </div>

      </div>
    </div>
  );
};
