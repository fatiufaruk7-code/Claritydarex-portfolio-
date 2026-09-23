import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, ArrowRight, Layers } from 'lucide-react';
import { subscribeToProjects } from '../services/projectsService';
import { PROJECTS_DATA } from '../data/projects';
import type { ProjectItem } from '../types';

interface ProjectsSectionProps {
  onSelectProject: (project: ProjectItem) => void;
}

const DEFAULT_CATEGORIES = ['All', 'Corporate', 'Web Apps', 'E-commerce', 'Portfolio', 'Portals'];

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<ProjectItem[]>(PROJECTS_DATA);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Real-time synchronization from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToProjects(
      (realtimeProjects) => {
        const published = realtimeProjects.filter((p) => p.status !== 'DRAFT');
        setProjects(published.length > 0 ? published : realtimeProjects);
      },
      (err) => {
        console.warn('[ProjectsSection] Using fallback project data:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    DEFAULT_CATEGORIES.forEach((c) => set.add(c));
    return Array.from(set);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
  }, [projects, activeCategory]);

  return (
    <section id="projects" className="py-24 bg-[#07090e] border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-xs font-mono text-blue-400 mb-4 shadow-sm">
              <Layers className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
              <span>FEATURED WORK & PROTOTYPES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered Solutions & Interactive Demonstrations.
            </h2>
            <p className="mt-4 text-slate-300 text-base sm:text-lg">
              Explore the modern web platforms, e-commerce storefronts, and digital portals we design and build with clean code, sub-second performance, and responsive interfaces.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid with Smooth Layout Animation */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group bg-[#0d1017] border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60"
              >
                <div>
                  {/* Project Image Preview with Overlay */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1017] via-transparent to-transparent opacity-80" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-[#0d1017]/90 text-blue-400 border border-slate-700/60 backdrop-blur">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* Project Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
                      <span>{project.client || 'Client Showcase'}</span>
                      <span>{project.year}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {project.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-300 line-clamp-2 leading-relaxed">
                      {project.shortDescription}
                    </p>

                    {/* Technologies Tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 3).map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md text-[11px] font-mono text-slate-500">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-800/60 mt-4">
                  <button
                    onClick={() => onSelectProject(project)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors pt-4 cursor-pointer"
                  >
                    <span>View Architecture Specs</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 mt-4 transition-colors"
                      title="Launch live demonstration"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
