import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  ShieldCheck,
  UserCheck,
  Key,
  CheckCircle,
  Info,
  Plus,
  Star,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Search,
  AlertTriangle,
  Loader2,
  X,
  MessageSquareQuote,
} from 'lucide-react';
import {
  subscribeToTestimonials,
  subscribeToCommitments,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialPublish,
} from '../../services/testimonialsService';
import type { CommitmentItem, StaffRole, TestimonialItem } from '../../types';

interface TestimonialsManagementPanelProps {
  currentRole: StaffRole;
  currentEmail?: string;
}

export const TestimonialsManagementPanel: React.FC<TestimonialsManagementPanelProps> = ({
  currentRole,
  currentEmail,
}) => {
  const [commitments, setCommitments] = useState<CommitmentItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'unpublished'>('all');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [formData, setFormData] = useState<{
    clientName: string;
    clientRole: string;
    company: string;
    avatarText: string;
    quote: string;
    rating: number;
    projectDelivered: string;
    published: boolean;
  }>({
    clientName: '',
    clientRole: 'CEO / Founder',
    company: '',
    avatarText: '',
    quote: '',
    rating: 5,
    projectDelivered: 'Enterprise Web Application',
    published: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deletingTestimonial, setDeletingTestimonial] = useState<TestimonialItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification Banner
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const canManage = ['SUPER_ADMIN', 'MANAGER', 'DEVELOPER', 'EDITOR'].includes(currentRole);

  useEffect(() => {
    setIsLoading(true);

    const unsubTestimonials = subscribeToTestimonials(
      (latest) => {
        setTestimonials(latest);
        setIsLoading(false);
        setSyncError(null);
      },
      (err) => {
        console.error('[TestimonialsPanel] Real-time testimonials error:', err);
        setIsLoading(false);
        setSyncError(err.message || 'Error subscribing to testimonials.');
      }
    );

    const unsubCommitments = subscribeToCommitments(
      (latest) => {
        setCommitments(latest);
      },
      (err) => {
        console.error('[TestimonialsPanel] Commitments error:', err);
      }
    );

    return () => {
      unsubTestimonials();
      unsubCommitments();
    };
  }, []);

  const handleOpenAddModal = () => {
    setEditingTestimonial(null);
    setFormData({
      clientName: '',
      clientRole: 'Managing Director',
      company: '',
      avatarText: '',
      quote: '',
      rating: 5,
      projectDelivered: 'Custom Web Platform',
      published: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TestimonialItem) => {
    setEditingTestimonial(item);
    setFormData({
      clientName: item.clientName,
      clientRole: item.clientRole,
      company: item.company,
      avatarText: item.avatarText,
      quote: item.quote,
      rating: item.rating,
      projectDelivered: item.projectDelivered,
      published: item.published !== false,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formData.clientName.trim();
    const trimmedQuote = formData.quote.trim();

    if (!trimmedName || !trimmedQuote) {
      setFormError('Client name and review quote are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTestimonial) {
        const res = await updateTestimonial(
          editingTestimonial.id,
          {
            clientName: trimmedName,
            clientRole: formData.clientRole.trim(),
            company: formData.company.trim(),
            avatarText:
              formData.avatarText.trim() ||
              trimmedName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
            quote: trimmedQuote,
            rating: Number(formData.rating) || 5,
            projectDelivered: formData.projectDelivered.trim(),
            published: formData.published,
          },
          currentEmail
        );

        if (res.success) {
          setNotification({
            type: 'success',
            text: `Testimonial from "${trimmedName}" updated in Firestore.`,
          });
          setIsModalOpen(false);
        } else {
          setFormError(res.error || 'Failed to update testimonial.');
        }
      } else {
        const res = await createTestimonial(
          {
            clientName: trimmedName,
            clientRole: formData.clientRole.trim(),
            company: formData.company.trim(),
            avatarText:
              formData.avatarText.trim() ||
              trimmedName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
            quote: trimmedQuote,
            rating: Number(formData.rating) || 5,
            projectDelivered: formData.projectDelivered.trim(),
            published: formData.published,
            order: testimonials.length + 1,
          },
          currentEmail
        );

        if (res.success) {
          setNotification({
            type: 'success',
            text: `Testimonial from "${trimmedName}" saved to Firestore.`,
          });
          setIsModalOpen(false);
        } else {
          setFormError(res.error || 'Failed to create testimonial.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (item: TestimonialItem) => {
    if (!canManage) return;
    const current = item.published !== false;
    const res = await toggleTestimonialPublish(item.id, current, currentEmail);
    if (res.success) {
      setNotification({
        type: 'success',
        text: `Testimonial from "${item.clientName}" is now ${
          res.newPublished ? 'Published' : 'Unpublished'
        }.`,
      });
    } else {
      setNotification({
        type: 'error',
        text: res.error || 'Failed to update publish state.',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTestimonial) return;
    setIsDeleting(true);
    try {
      const res = await deleteTestimonial(deletingTestimonial.id);
      if (res.success) {
        setNotification({
          type: 'success',
          text: `Testimonial deleted permanently from Firestore.`,
        });
        setDeletingTestimonial(null);
      } else {
        setNotification({
          type: 'error',
          text: res.error || 'Failed to delete testimonial.',
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTestimonials = testimonials.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      t.clientName.toLowerCase().includes(q) ||
      t.company.toLowerCase().includes(q) ||
      t.quote.toLowerCase().includes(q) ||
      t.projectDelivered.toLowerCase().includes(q);

    const matchesPublish =
      publishFilter === 'all' ||
      (publishFilter === 'published' && t.published !== false) ||
      (publishFilter === 'unpublished' && t.published === false);

    return matchesSearch && matchesPublish;
  });

  return (
    <div className="space-y-6">
      {/* Real-time Cloud Sync Banner */}
      <div className="p-3.5 rounded-2xl bg-[#0e131f] border border-blue-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-slate-300">
            Firestore Single Source of Truth: <strong className="text-emerald-400">testimonials & commitments</strong>
          </span>
        </div>
        <span className="font-mono text-slate-400 text-[11px]">
          Synchronized in real-time across all browser sessions and devices
        </span>
      </div>

      {syncError && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{syncError}</span>
        </div>
      )}

      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-200'
              : 'bg-red-950/40 border border-red-800/60 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold">{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header card */}
      <div className="bg-[#0e121a] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4 text-blue-400" />
            <span>Darex Client Trust &bull; Firestore Synchronized</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Testimonials & Engineering Guarantees
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage authentic client reviews, publish toggles, and binding architectural warranties.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-semibold">
            {commitments.length} Core Commitments
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono text-xs font-semibold">
            {testimonials.length} Testimonials
          </div>

          {canManage && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Testimonial</span>
            </button>
          )}
        </div>
      </div>

      {/* Verified Policy Banner */}
      <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Genuine Testimonials Standard:</span>
          <p className="text-slate-300 mt-0.5 leading-relaxed">
            Reviews added here are saved directly to Firestore. Published reviews become immediately visible on the public Darex website across all connected browsers and devices.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0e121a] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, company, quote keywords, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPublishFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              publishFilter === 'all'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All ({testimonials.length})
          </button>
          <button
            onClick={() => setPublishFilter('published')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              publishFilter === 'published'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Published ({testimonials.filter((t) => t.published !== false).length})
          </button>
          <button
            onClick={() => setPublishFilter('unpublished')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              publishFilter === 'unpublished'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Unpublished ({testimonials.filter((t) => t.published === false).length})
          </button>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wider">
            Verified Client Reviews ({filteredTestimonials.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 bg-[#0e121a] rounded-2xl border border-slate-800">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
            <p className="text-xs font-mono">Synchronizing client reviews from Firestore...</p>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="p-10 text-center text-slate-400 bg-[#0e121a] rounded-2xl border border-slate-800 space-y-2">
            <MessageSquareQuote className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-white">No testimonials recorded yet</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click "Add Testimonial" above to log a verified client review. It will be stored in Firestore and published to all visitors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTestimonials.map((item) => {
              const isPublished = item.published !== false;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-[#0e121a] border rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between ${
                    isPublished
                      ? 'border-slate-800/90 hover:border-slate-700'
                      : 'border-amber-900/40 opacity-80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300">
                          {item.avatarText}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">
                            {item.clientName}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {item.clientRole} {item.company && `&bull; ${item.company}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                            isPublished
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-600/40'
                              : 'bg-amber-950/80 text-amber-400 border border-amber-600/40'
                          }`}
                        >
                          {isPublished ? 'Published' : 'Hidden'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      "{item.quote}"
                    </p>

                    <div className="text-[11px] font-mono text-blue-400/80">
                      Project Delivered: <span className="text-slate-300">{item.projectDelivered}</span>
                    </div>
                  </div>

                  {canManage && (
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">
                        ID: {item.id.substring(0, 14)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleTogglePublish(item)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all flex items-center gap-1 ${
                            isPublished
                              ? 'bg-amber-950/50 text-amber-300 border-amber-800 hover:bg-amber-900/50'
                              : 'bg-emerald-950/50 text-emerald-300 border-emerald-800 hover:bg-emerald-900/50'
                          }`}
                        >
                          {isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{isPublished ? 'Unpublish' : 'Publish'}</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingTestimonial(item)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Core Engineering Commitments Grid */}
      <div className="pt-6">
        <h3 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wider mb-3">
          Guaranteed Engineering Commitments (Firestore Synced)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commitments.map((commit) => (
            <motion.div
              key={commit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0e121a] border border-slate-800/90 rounded-2xl p-5 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-semibold text-blue-400 px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-500/30">
                  {commit.subtitle}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Enforced</span>
                </span>
              </div>

              <h4 className="text-base font-bold text-white tracking-tight">
                {commit.title}
              </h4>

              <p className="text-xs text-slate-400 leading-relaxed">
                {commit.description}
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-blue-300 font-mono">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{commit.guarantee}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e121a] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {editingTestimonial ? 'Edit Testimonial' : 'Add Verified Testimonial'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Client Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Adeleke"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Managing Director"
                      value={formData.clientRole}
                      onChange={(e) => setFormData({ ...formData, clientRole: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Global Logistics"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Project Delivered
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Enterprise Portal"
                      value={formData.projectDelivered}
                      onChange={(e) =>
                        setFormData({ ...formData, projectDelivered: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Client Review Quote *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter the client's verified statement regarding delivery quality, performance, and collaboration..."
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Rating (1 to 5 Stars)
                    </label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                      <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                      <option value={3}>⭐⭐⭐ 3 Stars</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Publish to Website
                    </label>
                    <select
                      value={formData.published ? 'true' : 'false'}
                      onChange={(e) =>
                        setFormData({ ...formData, published: e.target.value === 'true' })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="true">Published (Visible on site)</option>
                      <option value="false">Unpublished (Hidden)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingTestimonial ? 'Save Changes' : 'Save Testimonial'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingTestimonial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e121a] border border-red-900/60 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">Delete Testimonial</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete the testimonial from{' '}
                <strong className="text-white font-semibold">"{deletingTestimonial.clientName}"</strong>{' '}
                from Firestore?
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingTestimonial(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30 disabled:opacity-50"
                >
                  {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
