import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Plus,
  CheckCircle2,
  Code2,
  Palette,
  Layout,
  Smartphone,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Briefcase,
  ShoppingBag,
  Wrench,
  Loader2,
  AlertTriangle,
  Radio,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import {
  subscribeToServices,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
} from '../../services/servicesService';
import type { ServiceItem, StaffRole } from '../../types';

interface ServicesManagementPanelProps {
  currentRole: StaffRole;
  currentEmail?: string;
}

const AVAILABLE_ICONS = [
  { name: 'Code2', label: 'Code / Web Dev', icon: Code2 },
  { name: 'Palette', label: 'Palette / Design', icon: Palette },
  { name: 'Layout', label: 'Layout / UI-UX', icon: Layout },
  { name: 'Briefcase', label: 'Briefcase / Corporate', icon: Briefcase },
  { name: 'ShoppingBag', label: 'Bag / E-commerce', icon: ShoppingBag },
  { name: 'Wrench', label: 'Wrench / Maintenance', icon: Wrench },
  { name: 'Layers', label: 'Layers / Solutions', icon: Layers },
  { name: 'Smartphone', label: 'Phone / Mobile', icon: Smartphone },
];

export const ServicesManagementPanel: React.FC<ServicesManagementPanelProps> = ({
  currentRole,
  currentEmail,
}) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    iconName: string;
    tag: string;
    features: string[];
    pricing: string;
    status: 'ACTIVE' | 'DRAFT';
  }>({
    title: '',
    description: '',
    iconName: 'Code2',
    tag: 'Core Engineering',
    features: [''],
    pricing: 'Custom Scoped',
    status: 'ACTIVE',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm State
  const [deletingService, setDeletingService] = useState<ServiceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status Notification
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const canManage = ['SUPER_ADMIN', 'MANAGER', 'DEVELOPER', 'EDITOR'].includes(currentRole);

  // Real-time Firestore synchronization
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToServices(
      (latest) => {
        setServices(latest);
        setIsLoading(false);
        setSyncError(null);
      },
      (err) => {
        console.error('[ServicesManagementPanel] Real-time sync error:', err);
        setIsLoading(false);
        setSyncError(err.message || 'Error subscribing to services collection.');
      }
    );

    return () => unsubscribe();
  }, []);

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      iconName: 'Code2',
      tag: 'Core Engineering',
      features: ['Modern Architecture', 'High-Performance Delivery'],
      pricing: 'Custom Scoped',
      status: 'ACTIVE',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      iconName: service.iconName || 'Code2',
      tag: service.tag || 'Core Engineering',
      features: service.features.length > 0 ? [...service.features] : [''],
      pricing: service.pricing || 'Custom Scoped',
      status: service.status || 'ACTIVE',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleAddFeatureField = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const handleFeatureChange = (index: number, val: string) => {
    setFormData((prev) => {
      const updated = [...prev.features];
      updated[index] = val;
      return { ...prev, features: updated };
    });
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      setFormError('Please enter a service title.');
      return;
    }

    const cleanedFeatures = formData.features.map((f) => f.trim()).filter(Boolean);

    setIsSubmitting(true);
    try {
      if (editingService) {
        const res = await updateService(
          editingService.id,
          {
            title: trimmedTitle,
            description: formData.description.trim(),
            iconName: formData.iconName,
            tag: formData.tag.trim() || 'Capability',
            features: cleanedFeatures,
            pricing: formData.pricing.trim() || 'Custom Scoped',
            status: formData.status,
          },
          currentEmail
        );

        if (res.success) {
          setNotification({
            type: 'success',
            text: `Service "${trimmedTitle}" updated successfully in Firestore.`,
          });
          setIsModalOpen(false);
        } else {
          setFormError(res.error || 'Failed to update service.');
        }
      } else {
        const res = await createService(
          {
            title: trimmedTitle,
            description: formData.description.trim(),
            iconName: formData.iconName,
            tag: formData.tag.trim() || 'Capability',
            features: cleanedFeatures,
            pricing: formData.pricing.trim() || 'Custom Scoped',
            status: formData.status,
            order: services.length + 1,
          },
          currentEmail
        );

        if (res.success) {
          setNotification({
            type: 'success',
            text: `Service "${trimmedTitle}" created and saved to Firestore.`,
          });
          setIsModalOpen(false);
        } else {
          setFormError(res.error || 'Failed to create service in Firestore.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (service: ServiceItem) => {
    if (!canManage) return;
    const current = service.status || 'ACTIVE';
    const res = await toggleServiceStatus(service.id, current, currentEmail);
    if (res.success) {
      setNotification({
        type: 'success',
        text: `Service "${service.title}" status changed to ${res.newStatus}.`,
      });
    } else {
      setNotification({
        type: 'error',
        text: res.error || 'Failed to change service status.',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingService) return;
    setIsDeleting(true);
    try {
      const res = await deleteService(deletingService.id);
      if (res.success) {
        setNotification({
          type: 'success',
          text: `Service "${deletingService.title}" removed permanently from Firestore.`,
        });
        setDeletingService(null);
      } else {
        setNotification({
          type: 'error',
          text: res.error || 'Failed to delete service from Firestore.',
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredServices = services.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tag.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && s.status !== 'DRAFT') ||
      (statusFilter === 'draft' && s.status === 'DRAFT');

    return matchesQuery && matchesStatus;
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
            Firestore Single Source of Truth: <strong className="text-emerald-400">services</strong> collection
          </span>
        </div>
        <span className="font-mono text-slate-400 text-[11px]">
          Edits on this device immediately synchronize to Chrome, Opera Mini & all browsers
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
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header card */}
      <div className="bg-[#0e121a] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Darex Service Catalog &bull; Firestore Synchronized</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Services & Deliverables Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage public agency capabilities, deliverables checklist, status, and cloud catalog.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono text-xs font-semibold">
            {services.length} Total Services
          </div>

          {canManage && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0e121a] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service offerings, deliverables, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All ({services.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Active ({services.filter((s) => s.status !== 'DRAFT').length})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              statusFilter === 'draft'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Draft ({services.filter((s) => s.status === 'DRAFT').length})
          </button>
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-[#0e121a] rounded-2xl border border-slate-800">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
          <p className="text-xs font-mono">Synchronizing services from Firestore...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-[#0e121a] rounded-2xl border border-slate-800">
          <p className="text-sm font-semibold text-white">No services found</p>
          <p className="text-xs text-slate-500 mt-1">Try changing your search query or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredServices.map((service) => {
            const isDraft = service.status === 'DRAFT';

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-[#0e121a] border rounded-2xl p-6 shadow-lg space-y-4 flex flex-col justify-between transition-all ${
                  isDraft
                    ? 'border-amber-900/40 opacity-80'
                    : 'border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-blue-950/80 text-blue-400 border border-blue-500/30">
                      {service.tag}
                    </span>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase ${
                          isDraft
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-600/40'
                            : 'bg-emerald-950/80 text-emerald-400 border border-emerald-600/40'
                        }`}
                      >
                        {isDraft ? 'Draft (Hidden)' : 'Active (Public)'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {service.id.substring(0, 12)}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center justify-between">
                    <span>{service.title}</span>
                    {service.pricing && (
                      <span className="text-xs font-mono font-normal text-slate-400">
                        {service.pricing}
                      </span>
                    )}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="pt-2">
                    <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                      Key Scope Deliverables ({service.features?.length || 0})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {service.features?.map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="truncate">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-500">
                    Icon: <span className="text-blue-400">{service.iconName || 'Code2'}</span>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(service)}
                        title={isDraft ? 'Publish Service' : 'Unpublish to Draft'}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all flex items-center gap-1.5 ${
                          isDraft
                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800 hover:bg-emerald-900/50'
                            : 'bg-amber-950/50 text-amber-300 border-amber-800 hover:bg-amber-900/50'
                        }`}
                      >
                        {isDraft ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{isDraft ? 'Activate' : 'Draft'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(service)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
                        title="Edit Service"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingService(service)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/50 transition-all"
                        title="Delete Service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e121a] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {editingService ? 'Edit Service Offering' : 'Add New Service Offering'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Changes are saved directly to the shared Firestore database.
                  </p>
                </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Service Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Website Development"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Category Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Core Engineering"
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the scope, modern stack, and business value of this service..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Icon
                    </label>
                    <select
                      value={formData.iconName}
                      onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      {AVAILABLE_ICONS.map((ic) => (
                        <option key={ic.name} value={ic.name}>
                          {ic.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Pricing / Scope Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Custom Scoped"
                      value={formData.pricing}
                      onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Publish Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'DRAFT' })
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="ACTIVE">Active (Visible)</option>
                      <option value="DRAFT">Draft (Hidden)</option>
                    </select>
                  </div>
                </div>

                {/* Scope Deliverables */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono uppercase text-slate-400">
                      Key Scope Deliverables
                    </label>
                    <button
                      type="button"
                      onClick={handleAddFeatureField}
                      className="text-[11px] font-mono text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      + Add Deliverable
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Deliverable #${idx + 1}`}
                          value={feature}
                          onChange={(e) => handleFeatureChange(idx, e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(idx)}
                            className="p-2 text-slate-500 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold border border-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingService ? 'Save Changes' : 'Create Service'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e121a] border border-red-900/60 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">Delete Service</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-white font-semibold">"{deletingService.title}"</strong> from
                Firestore? This change will immediately remove it from all browsers and the public
                site.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingService(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold border border-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
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
