import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, CheckCircle2, Code2, Palette, Layout, Smartphone, Search } from 'lucide-react';
import { SERVICES_DATA } from '../../data/services';
import type { ServiceItem, StaffRole } from '../../types';

interface ServicesManagementPanelProps {
  currentRole: StaffRole;
}

export const ServicesManagementPanel: React.FC<ServicesManagementPanelProps> = ({
  currentRole,
}) => {
  const [services] = useState<ServiceItem[]>(SERVICES_DATA);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = services.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tag.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-[#0e121a] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Darex Service Catalog</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Services & Deliverables Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage public agency services, deliverables checklist, and technical scopes.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono text-xs font-semibold">
          {services.length} Active Services
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0e121a] border border-slate-800 rounded-2xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service offerings, tags, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredServices.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0e121a] border border-slate-800/90 rounded-2xl p-6 shadow-lg space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-blue-950/80 text-blue-400 border border-blue-500/30">
                  {service.tag}
                </span>
                <span className="text-[11px] font-mono text-slate-500">ID: {service.id}</span>
              </div>

              <h3 className="text-lg font-bold text-white tracking-tight">
                {service.title}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                {service.description}
              </p>

              <div className="pt-2">
                <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                  Key Scope Deliverables
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {service.features.map((feature, i) => (
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

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Status: Active & Published</span>
              <span className="text-emerald-400 font-semibold">&bull; Visible in Contact Form</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
