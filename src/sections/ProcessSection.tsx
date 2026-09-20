import React from 'react';
import { motion } from 'motion/react';
import { Compass, PenTool, Code, Rocket, Check, type LucideIcon } from 'lucide-react';
import { WORK_PROCESS_STEPS } from '../data/company';
import { ClassicIcon, type ClassicIconVariant } from '../components/ClassicIcon';

export const ProcessSection: React.FC = () => {
  const getStepIconData = (index: number): { icon: LucideIcon; variant: ClassicIconVariant } => {
    switch (index) {
      case 0:
        return { icon: Compass, variant: 'sapphire' };
      case 1:
        return { icon: PenTool, variant: 'platinum' };
      case 2:
        return { icon: Code, variant: 'sapphire' };
      case 3:
      default:
        return { icon: Rocket, variant: 'emerald' };
    }
  };

  return (
    <section id="process" className="py-24 bg-[#07090e] border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-xs font-mono text-blue-400 mb-4">
            <span>METHODOLOGY & EXECUTION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Our 4-Step Engineering & Delivery Lifecycle.
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            A battle-tested workflow ensuring transparency, predictable delivery milestones, and flawless technical execution from kickoff to launch.
          </p>
        </motion.div>

        {/* 4 Step Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {WORK_PROCESS_STEPS.map((step, idx) => {
            const { icon, variant } = getStepIconData(idx);
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group bg-[#0d1017] border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg hover:shadow-2xl hover:shadow-black/60"
              >
                <div>
                  {/* Step number badge & icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-mono font-extrabold text-slate-700 group-hover:text-blue-500 transition-colors">
                      {step.stepNumber}
                    </span>
                    <ClassicIcon
                      icon={icon}
                      size="md"
                      variant={variant}
                      strokeWidth={1.35}
                    />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {step.title}
                  </h3>
                  <div className="text-xs font-mono text-blue-400 mb-3">
                    {step.subtitle}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                {/* Deliverables List */}
                <div className="pt-4 border-t border-slate-800/80">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    Key Deliverables:
                  </div>
                  <ul className="space-y-1.5">
                    {step.deliverables.map((d, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" strokeWidth={1.5} />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
