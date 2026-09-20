import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { X, ExternalLink, Calendar, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import type { ProjectItem } from '../types';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onStartSimilarProject: (projectType: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onStartSimilarProject,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-3xl bg-[#0e121a] border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Project Modal"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gradient-to-b from-slate-800/90 to-slate-900/90 hover:from-slate-700 hover:to-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.5)] transition-all active:scale-95"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Project Header Image */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e121a] via-[#0e121a]/40 to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-center justify-between gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-blue-600/90 text-white shadow-lg border border-blue-400/30 backdrop-blur">
              {project.category}
            </span>
            <div className="flex items-center gap-4 text-xs text-slate-300 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-700/70 backdrop-blur shadow-md">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
                {project.client}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
                {project.year}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 id="project-modal-title" className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {project.title}
            </h3>
            <p className="mt-3 text-slate-300 text-base leading-relaxed">
              {project.fullDescription}
            </p>
          </div>

          {/* Results / Highlights */}
          {project.results && project.results.length > 0 && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-inner">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
                Technical Highlights & Key Features
              </h4>
              <ul className="space-y-2.5">
                {project.results.map((res, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technologies Used */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
              Technologies & Architecture Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-mono font-medium bg-slate-800/80 text-blue-300 border border-slate-700/60 shadow-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => {
                onClose();
                onStartSimilarProject(project.title);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_6px_20px_rgba(37,99,235,0.35)] active:scale-[0.98]"
            >
              <span>Inquire About Similar Project</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
