import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderGit2,
  ExternalLink,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  X,
  Check,
} from 'lucide-react';
import {
  subscribeToProjects,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectStatus,
} from '../../services/projectsService';
import type { ProjectItem, StaffRole } from '../../types';

interface ProjectsManagementPanelProps {
  currentRole: StaffRole;
  currentEmail?: string;
}

const DEFAULT_CATEGORIES = ['Corporate', 'Web Apps', 'E-commerce', 'Portfolio', 'Portals'];

export const ProjectsManagementPanel: React.FC<ProjectsManagementPanelProps> = ({
  currentRole,
  currentEmail,
}) => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    shortDescription: string;
    fullDescription: string;
    image: string;
    technologies: string;
    liveUrl: string;
    client: string;
    year: string;
    results: string;
    status: 'PUBLISHED' | 'DRAFT';
  }>({
    title: '',
    category: 'Corporate',
    shortDescription: '',
    fullDescription: '',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    technologies: 'React, TypeScript, Tailwind CSS',
    liveUrl: '',
    client: 'Darex Client Portfolio',
    year: new Date().getFullYear().toString(),
    results: 'High-performance delivery, Sub-second paint, Fluid responsive UX',
    status: 'PUBLISHED',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deletingProject, setDeletingProject] = useState<ProjectItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification Banner
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const canManage = ['SUPER_ADMIN', 'MANAGER', 'DEVELOPER', 'EDITOR'].includes(currentRole);

  // Real-time Firestore synchronization
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToProjects(
      (latest) => {
        setProjects(latest);
        setIsLoading(false);
        setSyncError(null);
      },
      (err) => {
        console.error('[ProjectsManagementPanel] Real-time sync error:', err);
        setIsLoading(false);
        setSyncError(err.message || 'Error subscribing to projects collection.');
      }
    );

    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category));
    DEFAULT_CATEGORIES.forEach((c) => cats.add(c));
    return ['all', ...Array.from(cats)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.technologies.some((t) => t.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === 'all' || p.category === selectedCategory;

      const isDraft = p.status === 'DRAFT';
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && !isDraft) ||
        (statusFilter === 'draft' && isDraft);

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [projects, searchQuery, selectedCategory, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      category: 'Corporate',
      shortDescription: '',
      fullDescription: '',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      technologies: 'React, TypeScript, Tailwind CSS',
      liveUrl: '',
      client: 'Client Showcase',
      year: new Date().getFullYear().toString(),
      results: 'Fast First Contentful Paint, Clean architecture, Responsive across all devices',
      status: 'PUBLISHED',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: ProjectItem) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      category: project.category,
      shortDescription: project.shortDescription,
      fullDescription: project.fullDescription || project.shortDescription,
      image: project.image,
      technologies: project.technologies.join(', '),
      liveUrl: project.liveUrl || '',
      client: project.client || '',
      year: project.year,
      results: project.results.join(', '),
      status: project.status || 'PUBLISHED',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      setFormError('Project title is required.');
      return;
    }

    const techArray = formData.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const resultsArray = formData.results
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      if (editingProject) {
        const res = await updateProject(
          editingProject.id,
          {
            title: trimmedTitle,
            category: formData.category,
            shortDescription: formData.shortDescription.trim(),
            fullDescription: formData.fullDescription.trim(),
            image: formData.image.trim(),
            technologies: techArray,
            liveUrl: formData.liveUrl.trim(),
            client: formData.client.trim(),
            year: formData.year.trim(),
            results: resultsArray,
            status: formData.status,
          },
          currentEmail
        );

        if (res.success) {
          setNotification({
            type: 'success',
            text: `Project "${trimmedTitle}" updated successfully in Firestore.`,
          });
          setIsModalOpen(false);
        } else {
          setFormError(res.error || 'Failed to update project in Firestore.');
        }
      } else {
        const res = await createProject(
          {
            title: trimmedTitle,
            category: formData.category,
            shortDescription: formData.shortDescription.trim(),
            fullDescription: formData.fullDescription.trim(),
            image: formData.image.trim(),
            technologies: techArray,
            liveUrl: formData.liveUrl.trim(),
            client: formData.client.trim(),
            year: formData.year.trim(),
            results: resultsArray,
            status: formData.status,
            order: projects.length + 1,
          },
          currentEmail
        );

        if (res.success) {
          setNotification({
            type: 'success',
            text: `Project "${trimmedTitle}" created and synchronized in Firestore.`,
          });
          setIsModalOpen(false);
        } else {
          setFormError(res.error || 'Failed to save project to Firestore.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (project: ProjectItem) => {
    if (!canManage) return;
    const current = project.status || 'PUBLISHED';
    const res = await toggleProjectStatus(project.id, current, currentEmail);
    if (res.success) {
      setNotification({
        type: 'success',
        text: `Project "${project.title}" status changed to ${res.newStatus}.`,
      });
    } else {
      setNotification({
        type: 'error',
        text: res.error || 'Failed to toggle project status.',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      const res = await deleteProject(deletingProject.id);
      if (res.success) {
        setNotification({
          type: 'success',
          text: `Project "${deletingProject.title}" removed permanently from Firestore.`,
        });
        setDeletingProject(null);
      } else {
        setNotification({
          type: 'error',
          text: res.error || 'Failed to delete project from Firestore.',
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

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
            Firestore Single Source of Truth: <strong className="text-emerald-400">projects</strong> collection
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
            <FolderGit2 className="w-4 h-4 text-blue-400" />
            <span>Darex Portfolio Engine &bull; Firestore Synchronized</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Projects & Architecture Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage showcase case studies, client deliveries, live links, and categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono text-xs font-semibold">
            {projects.length} Total Projects
          </div>

          {canManage && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0e121a] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by title, stack, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <div className="flex items-center gap-1 border-r border-slate-800 pr-2 mr-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                statusFilter === 'all' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                statusFilter === 'published' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                statusFilter === 'draft' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Draft
            </button>
          </div>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 bg-[#0e121a] rounded-2xl border border-slate-800">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
          <p className="text-xs font-mono">Synchronizing projects from Firestore...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-[#0e121a] rounded-2xl border border-slate-800">
          <p className="text-sm font-semibold text-white">No projects found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const isDraft = project.status === 'DRAFT';

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group bg-[#0e121a] border rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col ${
                  isDraft
                    ? 'border-amber-900/40 opacity-80'
                    : 'border-slate-800/90 hover:border-blue-500/40'
                }`}
              >
                {/* Image Preview */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <img
                    src={project.image}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e121a] via-transparent to-black/30" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-[#090a0f]/90 text-blue-400 border border-blue-500/30 backdrop-blur-md">
                      {project.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase backdrop-blur-md ${
                        isDraft
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-600/40'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'
                      }`}
                    >
                      {isDraft ? 'Draft' : 'Live'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded-lg text-[10px] font-mono text-slate-300 bg-black/60 backdrop-blur-md">
                      {project.year}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {project.shortDescription}
                    </p>

                    {/* Technologies Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {project.technologies.slice(0, 4).map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                          +{project.technologies.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-mono font-semibold"
                    >
                      View Specs &rarr;
                    </button>

                    {canManage && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(project)}
                          title={isDraft ? 'Publish Project' : 'Move to Draft'}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isDraft
                              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800 hover:bg-emerald-900/50'
                              : 'bg-amber-950/50 text-amber-300 border-amber-800 hover:bg-amber-900/50'
                          }`}
                        >
                          {isDraft ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(project)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
                          title="Edit Project"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingProject(project)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/50 transition-all"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Project Modal */}
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
                    {editingProject ? 'Edit Portfolio Project' : 'Add New Portfolio Project'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Saved directly to shared Firestore database.
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
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Global Logistics"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      {DEFAULT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Short Card Summary *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Short summary displayed on public cards..."
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, shortDescription: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Full Architecture & Case Study Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detailed breakdown of system architecture, client specifications, challenges overcome..."
                    value={formData.fullDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, fullDescription: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Technologies (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="React, TypeScript, Tailwind CSS, Vite"
                      value={formData.technologies}
                      onChange={(e) =>
                        setFormData({ ...formData, technologies: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Live URL / Demo Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://demo.darex.internal"
                      value={formData.liveUrl}
                      onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Client Name / Prototype
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Prototype Demonstration"
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Delivery Year
                    </label>
                    <input
                      type="text"
                      placeholder="2025"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
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
                        setFormData({
                          ...formData,
                          status: e.target.value as 'PUBLISHED' | 'DRAFT',
                        })
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="PUBLISHED">Published (Public)</option>
                      <option value="DRAFT">Draft (Hidden)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Key Results & Metrics (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Sub-0.9s FCP, Responsive across all devices, Instant inquiry routing"
                    value={formData.results}
                    onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500"
                  />
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
                    <span>{editingProject ? 'Save Changes' : 'Create Project'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e121a] border border-red-900/60 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">Delete Portfolio Project</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-white font-semibold">"{deletingProject.title}"</strong> from
                Firestore? This change will immediately remove it from all browsers and devices.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingProject(null)}
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

      {/* Project Specs Inspection Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e121a] border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-blue-950 text-blue-400 border border-blue-500/30">
                    {selectedProject.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{selectedProject.year}</span>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-xl font-bold text-white tracking-tight">
                {selectedProject.title}
              </h3>

              <div className="h-48 w-full rounded-xl overflow-hidden bg-slate-950">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedProject.fullDescription || selectedProject.shortDescription}
              </p>

              <div>
                <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                  Technologies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-blue-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                  Delivery Results
                </h4>
                <div className="space-y-1.5">
                  {selectedProject.results.map((res, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{res}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedProject.liveUrl && (
                <div className="pt-2">
                  <a
                    href={selectedProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-mono text-blue-400 hover:text-blue-300"
                  >
                    <span>Visit Live URL ({selectedProject.liveUrl})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-slate-800">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold border border-slate-800"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
