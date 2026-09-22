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
  Users,
  MessageSquare,
  Filter,
  Check,
  UserCheck,
  FileText,
} from 'lucide-react';
import { AdminLogin } from './AdminLogin';
import { getFirebaseInstance } from '../firebase/config';
import {
  checkUserIsAdmin,
  checkUserStaffRole,
  logoutAdmin,
  updateAdminFirebasePassword,
  updateLocalAdminPassword,
  getLocalAdminSession,
  DESIGNATED_ADMIN_EMAIL,
} from '../services/adminAuthService';
import {
  getContactSubmissions,
  toggleSubmissionRead,
  deleteSubmissionRecord,
} from '../services/submissionService';
import { getStaffMembers } from '../services/staffService';
import { SiteSettingsPanel } from '../components/admin/SiteSettingsPanel';
import { StaffManagementPanel } from '../components/admin/StaffManagementPanel';
import { EnquiryDetailModal } from '../components/admin/EnquiryDetailModal';
import type {
  ContactSubmission,
  EnquiryStatus,
  StaffMember,
  StaffRole,
} from '../types';

interface AdminDashboardProps {
  onReturnToHome: () => void;
}

type DashboardTab = 'enquiries' | 'settings' | 'staff';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onReturnToHome }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<
    'loading' | 'authorized' | 'unauthorized' | 'unauthenticated'
  >('loading');
  const [userRole, setUserRole] = useState<StaffRole>('SUPER_ADMIN');
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('enquiries');

  // Data states
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Active detail modal
  const [activeMessage, setActiveMessage] = useState<ContactSubmission | null>(null);

  // Delete confirm modal
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Change password modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatusMsg, setPasswordStatusMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [showPasswordText, setShowPasswordText] = useState(false);

  // Monitor Admin & Staff Authentication
  useEffect(() => {
    const firebase = getFirebaseInstance();

    const verifySession = async (user: User | null) => {
      const localAdmin = getLocalAdminSession();
      const email = user?.email || localAdmin || '';

      if (!user && !localAdmin) {
        setCurrentUser(null);
        setAuthStatus('unauthenticated');
        return;
      }

      try {
        const staffAuth = await checkUserStaffRole(user, email);
        if (staffAuth.isAuthorized && staffAuth.isActive) {
          setUserRole(staffAuth.role);
          if (staffAuth.staffMember) {
            setCurrentStaff(staffAuth.staffMember);
          }
          setAuthStatus('authorized');
          loadData();
        } else {
          setAuthStatus('unauthorized');
        }
      } catch (err) {
        console.warn('Admin authorization error:', err);
        setAuthStatus('unauthorized');
      }
    };

    if (!firebase) {
      verifySession(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebase.auth, async (user) => {
      setCurrentUser(user);
      verifySession(user);
    });

    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const [submissionsData, staffData] = await Promise.allSettled([
        getContactSubmissions(),
        getStaffMembers(),
      ]);

      if (submissionsData.status === 'fulfilled') {
        setSubmissions(submissionsData.value);
      } else {
        setDataError(submissionsData.reason?.message || 'Error querying enquiries.');
      }

      if (staffData.status === 'fulfilled') {
        setStaffList(staffData.value);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading Firestore data.';
      setDataError(msg);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSignOut = async () => {
    await logoutAdmin();
    setCurrentUser(null);
    setCurrentStaff(null);
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

  const handleEnquiryUpdate = (updated: ContactSubmission) => {
    setSubmissions((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    setActiveMessage(updated);
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
      setPasswordStatusMsg({
        type: 'error',
        text: 'New password and confirmation do not match.',
      });
      return;
    }

    if (newPasswordInput.length < 6) {
      setPasswordStatusMsg({
        type: 'error',
        text: 'New password must be at least 6 characters.',
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const firebase = getFirebaseInstance();
      if (firebase?.auth.currentUser) {
        const res = await updateAdminFirebasePassword(
          currentPasswordInput,
          newPasswordInput
        );
        if (res.success) {
          setPasswordStatusMsg({
            type: 'success',
            text: 'Administrator password successfully updated in Firebase Authentication!',
          });
          resetPasswordForm();
        } else {
          // Fallback to local password update if Firebase Auth password provider isn't enabled
          const localRes = await updateLocalAdminPassword(
            currentPasswordInput,
            newPasswordInput
          );
          if (localRes.success) {
            setPasswordStatusMsg({
              type: 'success',
              text: 'Master administrator password successfully updated and synchronized!',
            });
            resetPasswordForm();
          } else {
            setPasswordStatusMsg({
              type: 'error',
              text: res.error || localRes.error || 'Failed to update password.',
            });
          }
        }
      } else {
        const localRes = await updateLocalAdminPassword(
          currentPasswordInput,
          newPasswordInput
        );
        if (localRes.success) {
          setPasswordStatusMsg({
            type: 'success',
            text: 'Master administrator password successfully updated and synchronized!',
          });
          resetPasswordForm();
        } else {
          setPasswordStatusMsg({
            type: 'error',
            text: localRes.error || 'Failed to update password.',
          });
        }
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

  const resetPasswordForm = () => {
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setTimeout(() => {
      setIsPasswordModalOpen(false);
      setPasswordStatusMsg(null);
    }, 2000);
  };

  // Export submissions to CSV
  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    const headers = [
      'ID',
      'Date',
      'Status',
      'Name',
      'Email',
      'Phone',
      'Company',
      'ProjectType',
      'AssignedStaff',
      'Message',
    ];
    const rows = submissions.map((s) => [
      s.id || '',
      s.createdAt || '',
      s.status || (s.read ? 'RESOLVED' : 'NEW'),
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `"${(s.company || '').replace(/"/g, '""')}"`,
      `"${(s.projectType || '').replace(/"/g, '""')}"`,
      `"${(s.assignedStaffName || 'Unassigned').replace(/"/g, '""')}"`,
      `"${(s.message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `darex-customer-enquiries-${new Date().toISOString().split('T')[0]}.csv`
    );
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
        (item.projectType && item.projectType.toLowerCase().includes(q)) ||
        (item.message && item.message.toLowerCase().includes(q));

      const itemStatus = item.status || (item.read ? 'IN_PROGRESS' : 'NEW');
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'unread' && !item.read) ||
        itemStatus === statusFilter;

      const matchesStaff =
        staffFilter === 'all' ||
        (staffFilter === 'unassigned' && !item.assignedStaffId) ||
        item.assignedStaffId === staffFilter;

      const matchesType =
        typeFilter === 'all' || item.projectType === typeFilter;

      return matchesSearch && matchesStatus && matchesStaff && matchesType;
    });
  }, [submissions, searchQuery, statusFilter, staffFilter, typeFilter]);

  // Distinct project types for dropdown filter
  const distinctProjectTypes = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => {
      if (s.projectType) set.add(s.projectType);
    });
    return Array.from(set);
  }, [submissions]);

  // Metrics
  const stats = useMemo(() => {
    const total = submissions.length;
    const newCount = submissions.filter(
      (s) => s.status === 'NEW' || (!s.status && !s.read)
    ).length;
    const inProgressCount = submissions.filter(
      (s) => s.status === 'IN_PROGRESS' || s.status === 'ASSIGNED'
    ).length;
    const resolvedCount = submissions.filter(
      (s) => s.status === 'RESOLVED' || s.status === 'CLOSED'
    ).length;
    const activeStaffCount = staffList.filter((s) => s.status === 'ACTIVE').length;

    return { total, newCount, inProgressCount, resolvedCount, activeStaffCount };
  }, [submissions, staffList]);

  const canManageStaff = userRole === 'SUPER_ADMIN' || userRole === 'MANAGER';
  const canEditSettings =
    userRole === 'SUPER_ADMIN' || userRole === 'EDITOR' || userRole === 'DEVELOPER';
  const canDelete = userRole === 'SUPER_ADMIN';

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4">
        <motion.div
          animate={{ scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-3 text-slate-400 text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-white">
            Authenticating Darex Security Layer...
          </span>
          <span className="text-xs text-slate-500">
            Verifying staff credentials and access permissions
          </span>
        </motion.div>
      </div>
    );
  }

  // If user is not signed in, show AdminLogin
  if (authStatus === 'unauthenticated' || (!currentUser && !getLocalAdminSession())) {
    return (
      <AdminLogin
        onReturnToHome={onReturnToHome}
        onLoginSuccess={async (email) => {
          const firebase = getFirebaseInstance();
          const activeEmail = email || getLocalAdminSession() || DESIGNATED_ADMIN_EMAIL;
          const staffAuth = await checkUserStaffRole(
            firebase?.auth.currentUser || null,
            activeEmail
          );

          if (staffAuth.isAuthorized && staffAuth.isActive) {
            setUserRole(staffAuth.role);
            if (staffAuth.staffMember) {
              setCurrentStaff(staffAuth.staffMember);
            }
            if (firebase?.auth.currentUser) {
              setCurrentUser(firebase.auth.currentUser);
            }
            setAuthStatus('authorized');
            loadData();
          } else {
            setAuthStatus('unauthorized');
          }
        }}
      />
    );
  }

  // If user is signed in but not authorized:
  if (authStatus === 'unauthorized') {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-4">
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
              Access denied. You are not authorized to access the Darex Portal.
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed pt-1">
              Signed in as{' '}
              <span className="text-slate-200 font-mono font-medium">
                {currentUser?.email || getLocalAdminSession() || 'authenticated user'}
              </span>
              . This account is inactive or lacks the necessary staff role.
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

  const staffDisplayName =
    currentStaff?.fullName ||
    (currentUser?.email?.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase() ||
    getLocalAdminSession()?.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()
      ? 'Faruk Fatiu'
      : currentUser?.displayName || 'Darex Staff');

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
        {/* Top Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/90"
        >
          {/* Identity Card */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-[1px] shadow-lg shadow-blue-500/20 shrink-0">
              <div className="w-full h-full bg-[#0d121c] rounded-[15px] flex items-center justify-center font-bold text-lg text-white font-mono shadow-inner">
                {staffDisplayName.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE &bull; AUTHORIZED
                </span>
                <span className="text-xs font-mono text-slate-500 hidden sm:inline">&bull;</span>
                <span className="text-xs font-mono text-blue-400 font-semibold hidden sm:inline">
                  Role: {userRole}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                {staffDisplayName}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {currentUser?.email || getLocalAdminSession() || DESIGNATED_ADMIN_EMAIL}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setIsPasswordModalOpen(true);
                setPasswordStatusMsg(null);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-blue-300 hover:text-white transition-all shadow-sm active:scale-[0.98]"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
              <span>Change Password</span>
            </button>

            <button
              onClick={loadData}
              disabled={isLoadingData}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`}
                strokeWidth={1.5}
              />
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
              <span>Public Site</span>
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

        {/* Primary Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 mt-6 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'enquiries'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Customer Enquiries</span>
            {stats.newCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-400 text-slate-950 font-bold">
                {stats.newCount}
              </span>
            )}
          </button>

          {canEditSettings && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Site Settings</span>
            </button>
          )}

          {canManageStaff && (
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'staff'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Staff Management</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                {stats.activeStaffCount}
              </span>
            </button>
          )}
        </div>

        {/* Tab 1: Customer Enquiries View */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6 pt-6">
            {/* Metrics Grid */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div className="bg-gradient-to-b from-[#111724] to-[#0c1018] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
                <div className="text-xs font-mono text-slate-400 font-medium uppercase">
                  Total Enquiries
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1">
                  {stats.total}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Direct client requests</div>
              </div>

              <div className="bg-gradient-to-b from-[#111724] to-[#0c1018] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
                <div className="text-xs font-mono text-slate-400 font-medium uppercase">
                  New / Unreviewed
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono mt-1">
                  {stats.newCount}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Pending initial review</div>
              </div>

              <div className="bg-gradient-to-b from-[#111724] to-[#0c1018] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
                <div className="text-xs font-mono text-slate-400 font-medium uppercase">
                  In Progress
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-400 font-mono mt-1">
                  {stats.inProgressCount}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Under active discussion</div>
              </div>

              <div className="bg-gradient-to-b from-[#111724] to-[#0c1018] border border-slate-800/90 rounded-2xl p-5 shadow-lg">
                <div className="text-xs font-mono text-slate-400 font-medium uppercase">
                  Resolved / Closed
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono mt-1">
                  {stats.resolvedCount}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Successfully handled</div>
              </div>
            </motion.div>

            {/* Filter & Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-[#0e121a] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
            >
              {/* Search Input */}
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2"
                  strokeWidth={1.5}
                />
                <input
                  type="text"
                  placeholder="Search inquiries by client name, email, company, or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Status & Staff Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="NEW">New Inquiries</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>

                <select
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Assignees</option>
                  <option value="unassigned">Unassigned Only</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.role})
                    </option>
                  ))}
                </select>

                {distinctProjectTypes.length > 0 && (
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
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

            {/* Error banner */}
            {dataError && (
              <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Firestore Query Notice</div>
                  <p className="text-rose-300 mt-0.5">{dataError}</p>
                </div>
              </div>
            )}

            {/* Submissions List Table */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-[#0e121a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            >
              {isLoadingData ? (
                <div className="py-20 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                  <p className="text-xs font-mono text-slate-400">
                    Loading inquiries from Firestore database...
                  </p>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <Mail className="w-10 h-10 text-slate-600 mx-auto" strokeWidth={1.5} />
                  <h3 className="text-base font-semibold text-white">No submissions found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {searchQuery || statusFilter !== 'all' || staffFilter !== 'all'
                      ? 'Try clearing your search or filter criteria.'
                      : 'Client enquiries submitted through the Darex contact form will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
                    <thead className="bg-[#07090e] text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th scope="col" className="px-6 py-3.5">Status</th>
                        <th scope="col" className="px-6 py-3.5">Client</th>
                        <th scope="col" className="px-6 py-3.5">Assigned Staff</th>
                        <th scope="col" className="px-6 py-3.5">Service Category</th>
                        <th scope="col" className="px-6 py-3.5">Inquiry Snippet</th>
                        <th scope="col" className="px-6 py-3.5">Received</th>
                        <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredSubmissions.map((sub) => {
                        const status = sub.status || (sub.read ? 'RESOLVED' : 'NEW');
                        const statusConfig = {
                          NEW: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
                          ASSIGNED: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
                          IN_PROGRESS: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                          RESOLVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                          CLOSED: 'bg-slate-800 text-slate-400 border-slate-700',
                        }[status];

                        return (
                          <tr
                            key={sub.id}
                            className={`hover:bg-slate-900/60 transition-colors ${
                              status === 'NEW' ? 'bg-blue-950/15 font-medium' : ''
                            }`}
                          >
                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${statusConfig}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    status === 'NEW' ? 'bg-blue-400 animate-pulse' : 'bg-current'
                                  }`}
                                />
                                {status}
                              </span>
                            </td>

                            {/* Client */}
                            <td className="px-6 py-4">
                              <div className="font-bold text-white text-sm">{sub.name}</div>
                              <div className="text-slate-400 text-xs font-mono">{sub.email}</div>
                              {sub.company && (
                                <div className="text-[11px] text-blue-400 flex items-center gap-1 mt-0.5">
                                  <Building className="w-3 h-3" strokeWidth={1.5} />
                                  <span>{sub.company}</span>
                                </div>
                              )}
                            </td>

                            {/* Assigned Staff */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {sub.assignedStaffName ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-mono">
                                  <UserCheck className="w-3 h-3" />
                                  <span>{sub.assignedStaffName}</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[11px] font-mono italic">
                                  Unassigned
                                </span>
                              )}
                            </td>

                            {/* Service Category */}
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
                              {sub.internalNotes && sub.internalNotes.length > 0 && (
                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-amber-400/80 font-mono">
                                  <FileText className="w-2.5 h-2.5" />
                                  <span>{sub.internalNotes.length} internal notes</span>
                                </span>
                              )}
                            </td>

                            {/* Received */}
                            <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                              {new Date(sub.createdAt || Date.now()).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                              <button
                                onClick={() => setActiveMessage(sub)}
                                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold transition-colors shadow-sm"
                              >
                                View Ticket
                              </button>
                              <button
                                onClick={() => handleToggleRead(sub)}
                                title={sub.read ? 'Mark as Unread' : 'Mark as Read'}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                              >
                                {sub.read ? (
                                  <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                                ) : (
                                  <MailOpen className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
                                )}
                              </button>
                              {canDelete && (
                                <button
                                  onClick={() => setDeletingId(sub.id!)}
                                  title="Delete submission"
                                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Tab 2: Site Settings View */}
        {activeTab === 'settings' && canEditSettings && (
          <div className="pt-6">
            <SiteSettingsPanel />
          </div>
        )}

        {/* Tab 3: Staff Management View */}
        {activeTab === 'staff' && canManageStaff && (
          <div className="pt-6">
            <StaffManagementPanel
              currentRole={userRole}
              currentEmail={currentUser?.email || undefined}
            />
          </div>
        )}
      </div>

      {/* Enquiry Detail Modal */}
      {activeMessage && (
        <EnquiryDetailModal
          enquiry={activeMessage}
          staffList={staffList}
          currentStaff={{
            name: staffDisplayName,
            role: userRole,
            email: currentUser?.email || getLocalAdminSession() || DESIGNATED_ADMIN_EMAIL,
          }}
          onClose={() => setActiveMessage(null)}
          onUpdate={handleEnquiryUpdate}
          onDelete={(id) => {
            setDeletingId(id);
            setActiveMessage(null);
          }}
          canDelete={canDelete}
        />
      )}

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
              animate={{ opacity: 1, scale: 1 }}
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
                    <p className="text-xs text-slate-400">Update account password</p>
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
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <AlertTriangle
                      className="w-4 h-4 text-rose-400 shrink-0 mt-0.5"
                      strokeWidth={1.5}
                    />
                  )}
                  <span>{passwordStatusMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      required
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPasswordText ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    New Password
                  </label>
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="Min. 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    required
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="Re-enter new password"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md shadow-blue-600/30"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Save Password</span>
                    )}
                  </button>
                </div>
              </form>
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
                  <p className="text-xs text-slate-400">
                    This action will remove this lead record permanently.
                  </p>
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
                  {isDeleting && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                  )}
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
