import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Shield,
  Key,
  UserX,
  Trash2,
  Edit2,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  Search,
  Check,
  X,
  UserCheck,
} from 'lucide-react';
import {
  getStaffMembers,
  createStaffMember,
  updateStaffMember,
  toggleStaffStatus,
  deleteStaffMember,
} from '../../services/staffService';
import { DESIGNATED_ADMIN_EMAIL } from '../../services/adminAuthService';
import type { StaffMember, StaffRole, StaffStatus } from '../../types';

interface StaffManagementPanelProps {
  currentRole: StaffRole;
  currentEmail?: string;
}

export const StaffManagementPanel: React.FC<StaffManagementPanelProps> = ({
  currentRole,
  currentEmail,
}) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    phone: string;
    role: StaffRole;
    status: StaffStatus;
  }>({
    fullName: '',
    email: '',
    phone: '',
    role: 'SUPPORT',
    status: 'ACTIVE',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm State
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification Banner
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const canManage = currentRole === 'SUPER_ADMIN' || currentRole === 'MANAGER';
  const isSuperAdmin = currentRole === 'SUPER_ADMIN';

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const list = await getStaffMembers();
      setStaffList(list);
    } catch (err: unknown) {
      console.error('Failed to load staff list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      role: 'SUPPORT',
      status: 'ACTIVE',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormData({
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone || '',
      role: staff.role,
      status: staff.status,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      setFormError('Full name and email address are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingStaff) {
        // Prevent editing super admin email or role if not super admin
        if (
          editingStaff.email.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase() &&
          formData.role !== 'SUPER_ADMIN'
        ) {
          setFormError('The primary administrator account role cannot be downgraded.');
          setIsSubmitting(false);
          return;
        }

        const res = await updateStaffMember(editingStaff.id, {
          fullName: trimmedName,
          email: trimmedEmail,
          phone: formData.phone.trim(),
          role: formData.role,
          status: formData.status,
        });

        if (res.success) {
          setNotification({
            type: 'success',
            text: `Staff member "${trimmedName}" successfully updated in Firestore.`,
          });
          setIsModalOpen(false);
          loadStaff();
        } else {
          setFormError(res.error || 'Failed to update staff member.');
        }
      } else {
        // Check if email already exists
        const exists = staffList.some(
          (s) => s.email.toLowerCase() === trimmedEmail
        );
        if (exists) {
          setFormError('A staff member with this email address already exists.');
          setIsSubmitting(false);
          return;
        }

        const res = await createStaffMember({
          fullName: trimmedName,
          email: trimmedEmail,
          phone: formData.phone.trim(),
          role: formData.role,
          status: formData.status,
        });

        if (res.success) {
          setNotification({
            type: 'success',
            text: `Staff member "${trimmedName}" successfully created in Firestore.`,
          });
          setIsModalOpen(false);
          loadStaff();
        } else {
          setFormError(res.error || 'Failed to create staff member.');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (staff: StaffMember) => {
    if (staff.email.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()) {
      alert('The primary Super Admin account cannot be deactivated.');
      return;
    }

    try {
      const newStatus = staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const res = await toggleStaffStatus(staff.id, staff.status);
      if (res.success) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === staff.id ? { ...s, status: newStatus } : s))
        );
        setNotification({
          type: 'success',
          text: `Staff member ${staff.fullName} is now ${newStatus}.`,
        });
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to toggle staff status.');
    }
  };

  const handleDeleteStaff = async () => {
    if (!deletingStaff) return;
    if (deletingStaff.email.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase()) {
      alert('The primary Super Admin account cannot be deleted.');
      setDeletingStaff(null);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteStaffMember(deletingStaff.id);
      if (res.success) {
        setStaffList((prev) => prev.filter((s) => s.id !== deletingStaff.id));
        setNotification({
          type: 'success',
          text: `Staff member ${deletingStaff.fullName} removed successfully.`,
        });
      } else {
        alert(res.error || 'Failed to remove staff member.');
      }
      setDeletingStaff(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error removing staff record.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.phone && s.phone.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const roleBadgeConfig: Record<StaffRole, string> = {
    SUPER_ADMIN: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    MANAGER: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    SUPPORT: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    DEVELOPER: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    EDITOR: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  };

  return (
    <div className="bg-[#0e121a] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-[10px] font-semibold">
              RBAC: Role-Based Access Control
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Total Staff: {staffList.length}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Staff &amp; Team Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Provision staff accounts, assign specific privileges, and delegate client inquiries.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2.5 ${
            notification.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-200'
              : 'bg-rose-950/60 border border-rose-800/60 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="SUPPORT">Support</option>
            <option value="DEVELOPER">Developer</option>
            <option value="EDITOR">Editor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden shadow-inner">
        {isLoading ? (
          <div className="py-16 text-center space-y-2">
            <Loader2 className="w-7 h-7 animate-spin text-blue-500 mx-auto" />
            <p className="text-xs font-mono text-slate-400">Loading staff directory...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-white">No staff members found</h4>
            <p className="text-xs text-slate-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
              <thead className="bg-[#07090e] text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3">Member</th>
                  <th scope="col" className="px-5 py-3">Assigned Role</th>
                  <th scope="col" className="px-5 py-3">Contact</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-[#0d121c]">
                {filteredStaff.map((staff) => {
                  const isPrimaryAdmin =
                    staff.email.toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase();

                  return (
                    <tr
                      key={staff.id}
                      className="hover:bg-slate-900/60 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 p-[1px] shrink-0">
                            <div className="w-full h-full bg-[#111726] rounded-[11px] flex items-center justify-center font-bold text-white font-mono text-xs">
                              {staff.fullName.slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{staff.fullName}</span>
                              {isPrimaryAdmin && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                  OWNER
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px] font-mono">
                              {staff.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${
                            roleBadgeConfig[staff.role]
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          <span>{staff.role}</span>
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {staff.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{staff.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">No phone</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                            staff.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              staff.status === 'ACTIVE'
                                ? 'bg-emerald-400 animate-pulse'
                                : 'bg-slate-500'
                            }`}
                          />
                          {staff.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-2">
                        {canManage && (
                          <button
                            onClick={() => handleOpenEditModal(staff)}
                            title="Edit staff member"
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canManage && !isPrimaryAdmin && (
                          <button
                            onClick={() => handleToggleStatus(staff)}
                            title={
                              staff.status === 'ACTIVE'
                                ? 'Deactivate staff account'
                                : 'Activate staff account'
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              staff.status === 'ACTIVE'
                                ? 'bg-slate-900 hover:bg-amber-950/40 text-slate-400 hover:text-amber-400'
                                : 'bg-slate-900 hover:bg-emerald-950/40 text-slate-400 hover:text-emerald-400'
                            }`}
                          >
                            {staff.status === 'ACTIVE' ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {isSuperAdmin && !isPrimaryAdmin && (
                          <button
                            onClick={() => setDeletingStaff(staff)}
                            title="Delete staff member"
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Samuel Adewale"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                    placeholder="staff@darex.com"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                    placeholder="08012345678"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Assigned Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as StaffRole,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="SUPPORT">Support</option>
                      <option value="MANAGER">Manager</option>
                      <option value="DEVELOPER">Developer</option>
                      <option value="EDITOR">Editor</option>
                      {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      Account Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as StaffStatus,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingStaff ? 'Save Changes' : 'Create Staff Member'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Staff Modal */}
      <AnimatePresence>
        {deletingStaff && (
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
                  <h3 className="text-base font-bold text-white">
                    Remove Staff Member?
                  </h3>
                  <p className="text-xs text-slate-400">
                    Are you sure you want to remove {deletingStaff.fullName}?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setDeletingStaff(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStaff}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30"
                >
                  {isDeleting && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                  )}
                  <span>Confirm Removal</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
