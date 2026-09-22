import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Award, ShieldCheck, UserCheck, Key, CheckCircle, Info } from 'lucide-react';
import { COMMITMENTS_DATA, TESTIMONIALS_DATA } from '../../data/testimonials';
import type { CommitmentItem, StaffRole, TestimonialItem } from '../../types';

interface TestimonialsManagementPanelProps {
  currentRole: StaffRole;
}

export const TestimonialsManagementPanel: React.FC<TestimonialsManagementPanelProps> = ({
  currentRole,
}) => {
  const [commitments] = useState<CommitmentItem[]>(COMMITMENTS_DATA);
  const [testimonials] = useState<TestimonialItem[]>(TESTIMONIALS_DATA);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-[#0e121a] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4 text-blue-400" />
            <span>Darex Client Trust & Endorsements</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Testimonials & Engineering Guarantees
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage genuine client reviews, verified testimonials, and binding client guarantees.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-semibold">
            {commitments.length} Core Commitments
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono text-xs font-semibold">
            {testimonials.length} Published Testimonials
          </div>
        </div>
      </div>

      {/* Honesty Policy Banner */}
      <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Strict Verified Testimonial Policy:</span>
          <p className="text-slate-300 mt-0.5 leading-relaxed">
            In compliance with our integrity guarantee, placeholder or simulated testimonials are strictly prohibited across the Darex public website. Only verified reviews from completed client engagements are accepted.
          </p>
        </div>
      </div>

      {/* Core Commitments Grid */}
      <div>
        <h3 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wider mb-3">
          Guaranteed Engineering Commitments
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
    </div>
  );
};
