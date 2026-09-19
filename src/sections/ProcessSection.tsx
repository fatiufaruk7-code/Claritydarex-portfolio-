import React from 'react';
import { Compass, PenTool, Code, Rocket, Check } from 'lucide-react';
import { WORK_PROCESS_STEPS } from '../data/company';

export const ProcessSection: React.FC = () => {
  const getStepIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Compass className="w-5 h-5 text-blue-400" />;
      case 1:
        return <PenTool className="w-5 h-5 text-indigo-400" />;
      case 2:
        return <Code className="w-5 h-5 text-blue-400" />;
      case 3:
      default:
        return <Rocket className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <section id="process" className="py-24 bg-[#07090e] border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-xs font-mono text-blue-400 mb-4">
            <span>METHODOLOGY & EXECUTION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Our 4-Step Engineering & Delivery Lifecycle.
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            A battle-tested workflow ensuring transparency, predictable delivery milestones, and flawless technical execution from kickoff to launch.
          </p>
        </div>

        {/* 4 Step Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {WORK_PROCESS_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="bg-[#0d1017] border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Step number badge & icon */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-2xl font-mono font-extrabold text-slate-700 group-hover:text-blue-500 transition-colors">
                    {step.stepNumber}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    {getStepIcon(idx)}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">
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
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
