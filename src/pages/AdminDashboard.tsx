import React, { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import {
  Shield,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  Mail,
  MailOpen,
  Trash2,
  ExternalLink,
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
} from 'lucide-react';
import { AdminLogin } from './AdminLogin';
import { getFirebaseInstance, checkFirebaseConfig } from '../firebase/config';
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
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
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

  // Monitor Admin Authentication (Firebase Auth + Verified Owner Session)
  useEffect(() => {
    // 1. Check local owner session
    const localSession = sessionStorage.getItem('darex_admin_session');
    if (localSession) {
      try {
        const parsed = JSON.parse(localSession);
        if (parsed.email) {
          setCurrentUser({ email: parsed.email } as User);
          setIsAuthLoading(false);
          loadSubmissions();
          return;
        }
      } catch (e) {
        sessionStorage.removeItem('darex_admin_session');
      }
    }

    // 2. Check Firebase Auth if available
    const firebase = getFirebaseInstance();
    if (!firebase) {
      setIsAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (user) {
        loadSubmissions();
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
    sessionStorage.removeItem('darex_admin_session');
    const firebase = getFirebaseInstance();
    if (firebase) {
      await signOut(firebase.auth);
    }
    setCurrentUser(null);
  };

  const handleToggleRead = async (submission: ContactSubmission) => {
    if (!submission.id) return;
    try {
      await toggleSubmissionRead(submission.id, submission.read);
      // Update local state immediately
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
      // 1. Text search
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.company && item.company.toLowerCase().includes(q)) ||
        item.projectType.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q);

      // 2. Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'unread' && !item.read) ||
        (statusFilter === 'read' && item.read);

      // 3. Project type filter
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

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-sm font-mono">Authenticating Darex Security Layer...</span>
        </div>
      </div>
    );
  }

  // If user is not signed in, show AdminLogin
  if (!currentUser) {
    return (
      <AdminLogin
        onReturnToHome={onReturnToHome}
        onLoginSuccess={(loggedEmail) => {
          setCurrentUser({ email: loggedEmail || 'fatiufaruk7@gmail.com' } as User);
          loadSubmissions();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-blue-600 selection:text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-1">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>DAREX MANAGEMENT CONSOLE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Contact Form Inquiries
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Logged in as <span className="text-white font-medium">{currentUser.email || 'Admin'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadSubmissions}
              disabled={isLoadingData}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={submissions.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
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
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          <div className="bg-[#0e121a] border border-slate-800 rounded-2xl p-5">
            <div className="text-xs font-mono text-slate-400 font-medium uppercase">
              Total Inquiries
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1">
              {submissions.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Stored in Firestore</div>
          </div>

          <div className="bg-[#0e121a] border border-slate-800 rounded-2xl p-5">
            <div className="text-xs font-mono text-slate-400 font-medium uppercase">
              Unread Messages
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono mt-1">
              {unreadCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Requiring review</div>
          </div>

          <div className="bg-[#0e121a] border border-slate-800 rounded-2xl p-5">
            <div className="text-xs font-mono text-slate-400 font-medium uppercase">
              Handled Inquiries
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono mt-1">
              {submissions.length - unreadCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Marked as reviewed</div>
          </div>

          <div className="bg-[#0e121a] border border-slate-800 rounded-2xl p-5">
            <div className="text-xs font-mono text-slate-400 font-medium uppercase">
              Active Filters
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-400 font-mono mt-1">
              {filteredSubmissions.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Current view matches</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#0e121a] border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client name, email, company, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Read/Unread Filter */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('unread')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'unread'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setStatusFilter('read')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === 'read'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Read
              </button>
            </div>

            {/* Project Type Filter */}
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
        </div>

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
        <div className="bg-[#0e121a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {isLoadingData ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              <p className="text-xs font-mono text-slate-400">Loading submissions from Firestore...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Mail className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-semibold text-white">No submissions found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try clearing your search or filter criteria.'
                  : 'Contact form submissions from visitors will appear here automatically.'}
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
                        !sub.read ? 'bg-blue-950/10 font-medium' : ''
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
                              sub.read ? 'bg-slate-500' : 'bg-amber-400'
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
                            <Building className="w-3 h-3" />
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
                          className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleToggleRead(sub)}
                          title={sub.read ? 'Mark as Unread' : 'Mark as Read'}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                          {sub.read ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setDeletingId(sub.id!)}
                          title="Delete submission"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* View Individual Message Detail Modal */}
      {activeMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl bg-[#0e121a] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
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
                <X className="w-5 h-5" />
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
            <div>
              <div className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2">
                Full Inquiry Message
              </div>
              <div className="p-4 rounded-xl bg-[#07090e] border border-slate-800/90 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {activeMessage.message}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${activeMessage.email}?subject=Darex%20Inquiry%20Response%20-%20${encodeURIComponent(activeMessage.projectType)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>

                <button
                  onClick={() => handleToggleRead(activeMessage)}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800"
                >
                  {activeMessage.read ? 'Mark as Unread' : 'Mark as Read'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeletingId(activeMessage.id!)}
                  className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition-colors"
                  title="Delete submission"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveMessage(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[#0e121a] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Delete Submission?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete this contact inquiry from your Firestore database? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
