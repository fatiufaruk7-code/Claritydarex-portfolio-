import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  MessageSquare,
  UserCheck,
  History,
  Trash2,
  ExternalLink,
  MessageCircle,
  PhoneCall,
  Loader2,
  Tag,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import {
  updateEnquiryStatus,
  assignEnquiry,
  addInternalNote,
} from '../../services/submissionService';
import type {
  ContactSubmission,
  EnquiryStatus,
  StaffMember,
  InternalNote,
  EnquiryActivity,
  StaffRole,
} from '../../types';

interface EnquiryDetailModalProps {
  enquiry: ContactSubmission;
  staffList: StaffMember[];
  currentStaff: {
    name: string;
    email: string;
    role: StaffRole | string;
  };
  onClose: () => void;
  onUpdate: (updated: ContactSubmission) => void;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}

export const EnquiryDetailModal: React.FC<EnquiryDetailModalProps> = ({
  enquiry,
  staffList,
  currentStaff,
  onClose,
  onUpdate,
  onDelete,
  canDelete = false,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'history'>('details');
  const [status, setStatus] = useState<EnquiryStatus>(enquiry.status || 'NEW');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: EnquiryStatus) => {
    if (!enquiry.id || newStatus === status) return;
    setIsUpdatingStatus(true);
    setErrorMsg(null);
    try {
      const updated = await updateEnquiryStatus(
        enquiry.id,
        newStatus,
        {
          name: currentStaff.name,
          email: currentStaff.email,
          role: String(currentStaff.role),
        }
      );
      setStatus(newStatus);
      onUpdate(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      setErrorMsg(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignStaff = async (staffId: string) => {
    if (!enquiry.id) return;
    const targetStaff = staffList.find((s) => s.id === staffId);
    if (!targetStaff) return;

    setIsAssigning(true);
    setErrorMsg(null);
    try {
      const updated = await assignEnquiry(
        enquiry.id,
        targetStaff,
        {
          name: currentStaff.name,
          email: currentStaff.email,
          role: String(currentStaff.role),
        }
      );
      setStatus('ASSIGNED');
      onUpdate(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to assign staff';
      setErrorMsg(msg);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry.id || !noteText.trim()) return;

    setIsAddingNote(true);
    setErrorMsg(null);
    try {
      const updated = await addInternalNote(
        enquiry.id,
        noteText.trim(),
        {
          name: currentStaff.name,
          email: currentStaff.email,
          role: String(currentStaff.role),
        }
      );
      setNoteText('');
      onUpdate(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add internal note';
      setErrorMsg(msg);
    } finally {
      setIsAddingNote(false);
    }
  };

  // Quick Communication Links
  const mailToUrl = `mailto:${enquiry.email}?subject=${encodeURIComponent(
    `Re: Darex Inquiry - ${enquiry.projectType || 'Project Discussion'}`
  )}&body=${encodeURIComponent(`Hello ${enquiry.name},\n\nThank you for reaching out to Darex regarding your project.\n\n`)}`;

  const cleanPhone = enquiry.phone?.replace(/[^0-9+]/g, '') || '';
  const callUrl = cleanPhone ? `tel:${cleanPhone}` : null;
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(
        `Hello ${enquiry.name}, this is ${currentStaff.name} from Darex regarding your project inquiry.`
      )}`
    : null;

  const statusColors: Record<EnquiryStatus, string> = {
    NEW: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    ASSIGNED: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    IN_PROGRESS: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    RESOLVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    CLOSED: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-4xl bg-[#0e121a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#090c12]">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1px] shrink-0">
              <div className="w-full h-full bg-[#0d121c] rounded-[15px] flex items-center justify-center font-bold text-white font-mono text-base">
                {enquiry.name.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                    statusColors[status]
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status === 'NEW' ? 'bg-blue-400 animate-pulse' : 'bg-current'
                    }`}
                  />
                  {status}
                </span>

                {enquiry.assignedStaffName && (
                  <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    <span>{enquiry.assignedStaffName}</span>
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                {enquiry.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                <span>{enquiry.email}</span>
                {enquiry.company && (
                  <>
                    <span>&bull;</span>
                    <span className="text-blue-400">{enquiry.company}</span>
                  </>
                )}
                <span>&bull;</span>
                <span>
                  {new Date(enquiry.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {canDelete && onDelete && enquiry.id && (
              <button
                onClick={() => onDelete(enquiry.id!)}
                title="Delete ticket"
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Communication & Status Bar */}
        <div className="px-5 py-3 bg-[#111622] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Action buttons: Email, Call, WhatsApp */}
          <div className="flex items-center gap-2">
            <a
              href={mailToUrl}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-blue-600/20"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Client</span>
            </a>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}

            {callUrl && (
              <a
                href={callUrl}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Client</span>
              </a>
            )}
          </div>

          {/* Quick Status & Assignment */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-400">Status:</span>
              <select
                value={status}
                disabled={isUpdatingStatus}
                onChange={(e) => handleStatusChange(e.target.value as EnquiryStatus)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="NEW">New</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-400">Assign:</span>
              <select
                value={enquiry.assignedStaffId || ''}
                disabled={isAssigning}
                onChange={(e) => handleAssignStaff(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="" disabled>
                  Assign to staff...
                </option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-5 border-b border-slate-800 flex items-center gap-4 bg-[#0d111a]">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Inquiry Details</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Internal Notes (Staff Only)</span>
            {enquiry.internalNotes && enquiry.internalNotes.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {enquiry.internalNotes.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 mx-5 mt-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: INQUIRY DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Project Meta Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                    Service Requested
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {enquiry.projectType || 'General Consultation'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                    Budget Range
                  </div>
                  <div className="text-sm font-bold text-blue-400 mt-1">
                    {enquiry.budget || 'Flexible / Discussion'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                    Target Timeline
                  </div>
                  <div className="text-sm font-bold text-slate-300 mt-1">
                    {enquiry.timeline || 'Standard (3-4 weeks)'}
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <div className="text-xs font-mono uppercase text-slate-400 font-semibold mb-2">
                  Client Message / Scope Description
                </div>
                <div className="p-4 rounded-xl bg-[#080b11] border border-slate-800/90 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {enquiry.message}
                </div>
              </div>

              {/* Contact Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-mono uppercase text-slate-500">
                      Email Address
                    </div>
                    <div className="text-xs font-mono text-white mt-0.5">
                      {enquiry.email}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-mono uppercase text-slate-500">
                      Phone / Mobile
                    </div>
                    <div className="text-xs font-mono text-white mt-0.5">
                      {enquiry.phone || 'None provided'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERNAL NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                Internal notes are private to authorized Darex staff and are never visible to
                the client.
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2.5">
                <textarea
                  rows={3}
                  required
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add internal progress note, follow-up call outcome, or quotation discussion..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAddingNote || !noteText.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                  >
                    {isAddingNote && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Post Internal Note</span>
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-2.5 pt-2">
                {(!enquiry.internalNotes || enquiry.internalNotes.length === 0) ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No internal notes yet. Use the form above to record staff notes.
                  </div>
                ) : (
                  enquiry.internalNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{note.authorName}</span>
                          <span className="text-slate-500">&bull;</span>
                          <span className="text-blue-400">{note.authorRole}</span>
                        </div>
                        <span className="text-slate-500">
                          {new Date(note.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {note.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TRAIL / ACTIVITY HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {(!enquiry.activityHistory || enquiry.activityHistory.length === 0) ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No activity history recorded.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800">
                  {enquiry.activityHistory.map((act) => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#0e121a]" />
                      <div className="text-xs font-semibold text-white">
                        {act.action}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        By {act.user} {act.role ? `(${act.role})` : ''} &bull;{' '}
                        {new Date(act.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {act.details && (
                        <p className="text-xs text-slate-300 mt-1 bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
                          {act.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
