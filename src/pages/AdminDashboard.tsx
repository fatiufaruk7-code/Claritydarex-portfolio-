import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  Shield,
  Search,
  RefreshCw,
  LogOut,
  Mail,
  MailOpen,
  Trash2,
  Calendar,
  Building,
  User as UserIcon,
  Phone,
  CheckCircle2,
  Clock,
  Download,
  AlertTriangle,
  ChevronRight,
  X,
  Send,
  Loader2,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Instagram,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { AdminLogin } from './AdminLogin';
import { getFirebaseInstance } from '../firebase/config';
import { COMPANY_INFO } from '../data/company';
import {
  checkUserIsAdmin,
  logoutAdmin,
  updateAdminFirebasePassword,
  getLocalAdminSession,
  DESIGNATED_ADMIN_EMAIL,
} from '../services/adminAuthService';
import {
  getContactSubmissions,
  toggleSubmissionRead,
  deleteSubmissionRecord,
} from '../services/submissionService';
import type { ContactSubmission } from '../types';

interface AdminDashboardProps {
  onReturnToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onReturnToHome }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<
    'loading' | 'authorized' | 'unauthorized' | 'unauthenticated'
  >('loading');
  
  // Data states
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Active detail modal
  const [activeMessage, setActiveMessage] = useState<ContactSubmission | null>(null);
  
  // Delete confirm modal
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Change password modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSiteSettingsOpen, setIsSiteSettingsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatusMsg, setPasswordStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPasswordText, setShowPasswordText] = useState(false);

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Monitor Admin Authentication
  useEffect(() => {
    const firebase = getFirebaseInstance();
    if (!firebase) {
      const localAdmin = getLocalAdminSession();
      if (localAdmin && localAdmin.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()) {
        setAuthStatus('authorized');
        loadSubmissions();
      } else {
        setAuthStatus('unauthenticated');
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(firebase.auth, async (user) => {
      if (!user) {
        const localAdmin = getLocalAdminSession();
        if (localAdmin && localAdmin.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()) {
          setAuthStatus('authorized');
          loadSubmissions();
          return;
        }
        setCurrentUser(null);
        setAuthStatus('unauthenticated');
        return;
      }

      setCurrentUser(user);
      try {
        const isAuthorized = await checkUserIsAdmin(user);
        if (isAuthorized) {
          setAuthStatus('authorized');
          loadSubmissions();
        } else {
          setAuthStatus('unauthorized');
        }
      } catch (err) {
        console.error('Error checking admin authorization:', err);
        setAuthStatus('unauthorized');
      }
    });

    return () => unsubscribe();
  }, []);

  const loadSubmissions = async () => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const data = await getContactSubmissions();
      setSubmissions(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading Firestore submissions.';
      setDataError(msg);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSignOut = async () => {
    await logoutAdmin();
    setCurrentUser(null);
    setAuthStatus('unauthenticated');
  };

  const handleToggleRead = async (submission: ContactSubmission) => {
    if (!submission.id) return;
    try {
      await toggleSubmissionRead(submission.id, submission.read);
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === submission.id ? { ...item, read: !item.read } : item
        )
      );
      if (activeMessage && activeMessage.id === submission.id) {
        setActiveMessage({ ...activeMessage, read: !activeMessage.read });
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update message status.');
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteSubmissionRecord(deletingId);
      setSubmissions((prev) => prev.filter((item) => item.id !== deletingId));
      if (activeMessage && activeMessage.id === deletingId) {
        setActiveMessage(null);
      }
      setDeletingId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete submission.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatusMsg(null);

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordStatusMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (newPasswordInput.length < 6) {
      setPasswordStatusMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await updateAdminFirebasePassword(currentPasswordInput, newPasswordInput);
      if (res.success) {
        setPasswordStatusMsg({
          type: 'success',
          text: 'Administrator password successfully updated in Firebase Authentication!',
        });
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPasswordStatusMsg(null);
        }, 2000);
      } else {
        setPasswordStatusMsg({ type: 'error', text: res.error || 'Failed to update password.' });
      }
    } catch (err: unknown) {
      setPasswordStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update password.',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Export submissions to CSV
  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    const headers = ['ID', 'Date', 'Name', 'Email', 'Phone', 'Company', 'ProjectType', 'Status', 'Message'];
    const rows = submissions.map((s) => [
      s.id || '',
      s.createdAt,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `"${(s.company || '').replace(/"/g, '""')}"`,
      `"${(s.projectType || '').replace(/"/g, '""')}"`,
      s.read ? 'Read' : 'Unread',
      `"${(s.message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `darex-inquiries-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered submissions list
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.company && item.company.toLowerCase().includes(q)) ||
        item.projectType.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'unread' && !item.read) ||
        (statusFilter === 'read' && item.read);

      const matchesType =
        typeFilter === 'all' || item.projectType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [submissions, searchQuery, statusFilter, typeFilter]);

  // Distinct project types for dropdown filter
  const distinctProjectTypes = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => {
      if (s.projectType) set.add(s.projectType);
    });
    return Array.from(set);
  }, [submissions]);

  // Counts
  const unreadCount = useMemo(
    () => submissions.filter((s) => !s.read).length,
    [submissions]
  );

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4">
        <motion.div
          animate={{ scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-3 text-slate-400 text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-white">Authenticating Darex Security Layer...</span>
          <span className="text-xs text-slate-500">Verifying administrator credentials and permissions</span>
        </motion.div>
      </div>
    );
  }

  // If user is not signed in, show AdminLogin
  if (authStatus === 'unauthenticated' || !currentUser) {
    return (
      <AdminLogin
        onReturnToHome={onReturnToHome}
        onLoginSuccess={async () => {
          const firebase = getFirebaseInstance();
          if (firebase?.auth.currentUser) {
            const isAuth = await checkUserIsAdmin(firebase.auth.currentUser);
            if (isAuth) {
              setCurrentUser(firebase.auth.currentUser);
              setAuthStatus('authorized');
              loadSubmissions();
            } else {
              setAuthStatus('unauthorized');
            }
          }
        }}
      />
    );
  }

  // If user is signed in but not an authorized administrator:
  if (authStatus === 'unauthorized') {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-4 selection:bg-rose-600 selection:text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md bg-[#0e121a] border border-rose-900/50 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-5"
        >
          <div className="inline-flex p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldAlert className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-800/60 text-[11px] font-mono text-rose-300">
              <span>Security Restriction</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Access Denied</h2>
            <p className="text-sm font-medium text-rose-300 leading-snug">
              Access denied. You are not authorized to access the Darex Admin Portal.
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed pt-1">
              Signed in as <span className="text-slate-200 font-mono font-medium">{currentUser?.email || 'authenticated user'}</span>. This account does not possess administrator privileges or custom claims required for the Darex Management Console.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={handleSignOut}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              Sign Out
            </button>
            <button
              onClick={onReturnToHome}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-md shadow-blue-600/30"
            >
              Return to Public Website
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-blue-600 selection:text-white pt-24 pb-16 relative overflow-hidden">
      {/* Dynamic Animated Ambient Backdrop */}
      <motion.div
        animate={{
          opacity: [0.08, 0.16, 0.08],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 right-1/4 w-[650px] h-[450px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Admin Dashboard Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/90"
        >
          {/* Admin Identity Card */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-[1px] shadow-lg shadow-blue-500/20 shrink-0">
              <div className="w-full h-full bg-[#0d121c] rounded-[15px] flex items-center justify-center font-bold text-lg text-white font-mono shadow-inner">
                FF
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  AUTHENTICATED ADMINISTRATOR
                </span>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">•</span>
                <span className="text-xs font-mono text-blue-400 hidden sm:inline">Role: Super Admin</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Faruk Fatiu
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {currentUser?.email || DESIGNATED_ADMIN_EMAIL}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsSiteSettingsOpen(true)}
              id="admin-site-settings-btn"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-emerald-400 hover:text-white transition-all shadow-sm active:scale-[0.98]"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
              <span>Site Settings</span>
            </button>

            <button
              onClick={() => {
                setIsPasswordModalOpen(true);
                setPasswordStatusMsg(null);
              }}
              id="admin-change-password-btn"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-blue-300 hover:text-white transition-all shadow-sm active:scale-[0.98]"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
              <span>Change Password</span>
            </button>

            <button
              onClick={loadSubmissions}
              disabled={isLoadingData}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} strokeWidth={1.5} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={submissions.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onReturnToHome}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <span>Public Website</span>
            </button>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Sign Out</span>
            </button>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8"
        >
          <div className="bg-gradient-to-b from-[#111724] to-[#0c1018] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
            <div className="text-xs font-mono text-slate-400 font-medium uppercase">
              Total Inquiries
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1">
              {submissions.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Client leads received</div>
          </div>

          <div className="bg-gradient-to-b from-[#111724] to-[#0c1018] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
            <div className="text-xs font-mono text-slate-400 font-medium uppercase">
              Unread Messages
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono mt-1">
              {unreadCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Requiring your review</div>
          </div>

          <div className="bg-gradient-to-b from-[#111724] to-[#0c1018] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
            <div className="text-xs font-mono text-slate-400 font-medium uppercase">
              Reviewed Leads
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono mt-1">
              {submissions.length - unreadCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Marked as handled</div>
          </div>

          <div className="bg-gradient-to-b from-[#111724] to-[#0c1018] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
            <div className="text-xs font-mono text-slate-400 font-medium uppercase">
              Active Filter Results
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-400 font-mono mt-1">
              {filteredSubmissions.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Visible in table</div>
          </div>
        </motion.div>

        {/* Filter & Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-[#0e121a] border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
        >
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search inquiries by client name, email, company, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('unread')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'unread'
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setStatusFilter('read')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'read'
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Reviewed
              </button>
            </div>

            {distinctProjectTypes.length > 0 && (
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Service Categories</option>
                {distinctProjectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}
          </div>
        </motion.div>

        {/* Data Error Notification */}
        {dataError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Firestore Query Failed</div>
              <p className="text-xs text-rose-300 mt-1">{dataError}</p>
            </div>
          </div>
        )}

        {/* Submissions List Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-[#0e121a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          {isLoadingData ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              <p className="text-xs font-mono text-slate-400">Loading submissions from Firestore database...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Mail className="w-10 h-10 text-slate-600 mx-auto" strokeWidth={1.5} />
              <h3 className="text-base font-semibold text-white">No submissions found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try clearing your search or filter criteria.'
                  : 'Contact form submissions submitted by potential clients will appear here in real time.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
                <thead className="bg-[#07090e] text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5">Sender</th>
                    <th scope="col" className="px-6 py-3.5">Service Type</th>
                    <th scope="col" className="px-6 py-3.5">Message Snippet</th>
                    <th scope="col" className="px-6 py-3.5">Received</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredSubmissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className={`hover:bg-slate-900/60 transition-colors ${
                        !sub.read ? 'bg-blue-950/20 font-medium' : ''
                      }`}
                    >
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                            sub.read
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              sub.read ? 'bg-slate-500' : 'bg-amber-400 animate-pulse'
                            }`}
                          />
                          {sub.read ? 'REVIEWED' : 'UNREAD'}
                        </span>
                      </td>

                      {/* Sender */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-sm">{sub.name}</div>
                        <div className="text-slate-400 text-xs">{sub.email}</div>
                        {sub.company && (
                          <div className="text-[11px] text-blue-400 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3" strokeWidth={1.5} />
                            <span>{sub.company}</span>
                          </div>
                        )}
                      </td>

                      {/* Service Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-300">
                          {sub.projectType}
                        </span>
                      </td>

                      {/* Message Snippet */}
                      <td className="px-6 py-4 max-w-xs">
                        <p className="line-clamp-2 text-slate-300 leading-relaxed">
                          {sub.message}
                        </p>
                      </td>

                      {/* Received Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {new Date(sub.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => setActiveMessage(sub)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold transition-colors shadow-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleToggleRead(sub)}
                          title={sub.read ? 'Mark as Unread' : 'Mark as Read'}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                          {sub.read ? <Mail className="w-3.5 h-3.5" strokeWidth={1.5} /> : <MailOpen className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />}
                        </button>
                        <button
                          onClick={() => setDeletingId(sub.id!)}
                          title="Delete submission"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-[#0e121a] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <KeyRound className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Administrator Security</h3>
                    <p className="text-xs text-slate-400">Change password for Faruk Fatiu</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {passwordStatusMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    passwordStatusMsg.type === 'success'
                      ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-200'
                      : 'bg-rose-950/60 border border-rose-800/60 text-rose-200'
                  }`}
                >
                  {passwordStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                  )}
                  <span>{passwordStatusMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="curr-pass">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="curr-pass"
                      type={showPasswordText ? 'text' : 'password'}
                      required
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="new-pass">
                    New Password
                  </label>
                  <input
                    id="new-pass"
                    type={showPasswordText ? 'text' : 'password'}
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="confirm-pass">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-pass"
                    type={showPasswordText ? 'text' : 'password'}
                    required
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPasswordText}
                      onChange={(e) => setShowPasswordText(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0"
                    />
                    <span>Show password text</span>
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-60 shadow-md shadow-blue-600/30"
                  >
                    {isUpdatingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Site Settings & Online Presence Modal */}
      <AnimatePresence>
        {isSiteSettingsOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-[#0e121a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-semibold">
                    <Globe className="w-3 h-3" />
                    <span>SYSTEM SETTINGS</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1.5">
                    Site Settings & Online Presence
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Active domains, official production platform, and corporate social channels.
                  </p>
                </div>
                <button
                  onClick={() => setIsSiteSettingsOpen(false)}
                  className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Official Website */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                      <Globe className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                      <span>Darex Website</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                      Primary Platform
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 font-mono text-slate-300 break-all text-xs">
                    <span>{COMPANY_INFO.officialWebsite}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopyText('website', COMPANY_INFO.officialWebsite)}
                        className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Copy URL"
                      >
                        {copiedKey === 'website' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={COMPANY_INFO.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all text-[11px]"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Instagram Profile */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                      <Instagram className="w-4 h-4 text-pink-400" strokeWidth={1.5} />
                      <span>Instagram Profile</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono text-[10px]">
                      @farukfatiu
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 font-mono text-slate-300 break-all text-xs">
                    <span>{COMPANY_INFO.socialLinks.instagram}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopyText('instagram', COMPANY_INFO.socialLinks.instagram)}
                        className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Copy URL"
                      >
                        {copiedKey === 'instagram' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={COMPANY_INFO.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-pink-600/20 hover:bg-pink-600 text-pink-300 hover:text-white border border-pink-500/30 transition-all text-[11px]"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Corporate Meta */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-mono block">Support & Inquiries</span>
                    <a href={`mailto:${COMPANY_INFO.email}`} className="text-slate-300 hover:text-blue-400 font-medium">
                      {COMPANY_INFO.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-mono block">Direct Phone</span>
                    <span className="text-slate-300 font-mono">
                      {COMPANY_INFO.phoneFormatted}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  Linked across Public Site Header, Footer, and Contact sections.
                </span>
                <button
                  onClick={() => setIsSiteSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Individual Message Detail Modal */}
      <AnimatePresence>
        {activeMessage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#0e121a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-mono uppercase text-blue-400 font-semibold">
                    Inquiry Details
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {activeMessage.name}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveMessage(null)}
                  className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Sender Meta Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">Email</span>
                  <a
                    href={`mailto:${activeMessage.email}`}
                    className="text-blue-400 hover:underline font-medium break-all"
                  >
                    {activeMessage.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">Phone</span>
                  <span className="text-white font-mono">{activeMessage.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">Company</span>
                  <span className="text-white">{activeMessage.company || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">Project Type</span>
                  <span className="text-blue-300 font-medium">{activeMessage.projectType}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">Timestamp</span>
                  <span className="text-slate-300 font-mono">
                    {new Date(activeMessage.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <span className="text-slate-400 block font-mono text-[10px] uppercase">Client Message</span>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {activeMessage.message}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRead(activeMessage)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                  >
                    {activeMessage.read ? <Mail className="w-4 h-4" strokeWidth={1.5} /> : <MailOpen className="w-4 h-4 text-blue-400" strokeWidth={1.5} />}
                    <span>{activeMessage.read ? 'Mark as Unread' : 'Mark as Read'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setDeletingId(activeMessage.id!);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-rose-950/40 text-rose-400 border border-slate-800 hover:border-rose-900/60 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    <span>Delete</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${activeMessage.email}?subject=RE: Darex Inquiry - ${encodeURIComponent(activeMessage.projectType)}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md shadow-blue-600/30"
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Reply to Client</span>
                  </a>
                  <button
                    onClick={() => setActiveMessage(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e121a] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60">
                  <AlertTriangle className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete Inquiry Record?</h3>
                  <p className="text-xs text-slate-400">This action will remove this lead record permanently.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setDeletingId(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30"
                >
                  {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
