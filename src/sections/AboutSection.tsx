import React from 'react';
import { Target, Award, Users2, Sparkles, CheckCircle2 } from 'lucide-react';
import { COMPANY_STATS } from '../data/company';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-[#090b10] border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/40 text-xs font-mono text-blue-400 mb-4">
            <span>ABOUT DAREX</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered to Solve Complex Business Challenges Through Digital Precision.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Darex is a premier technology partner dedicated to helping modern organizations thrive online. We build digital infrastructure that bridges ambitious business visions with robust, scalable software architecture.
          </p>
        </div>

        {/* 3 Pillars of Approach */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-[#0e121a] border border-slate-800/80 rounded-2xl p-7 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2.5">Problem-First Engineering</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              We do not impose superficial templates. Every line of code, UX interaction, and database model is specifically engineered to eliminate your commercial bottlenecks and boost conversion.
            </p>
          </div>

          <div className="bg-[#0e121a] border border-slate-800/80 rounded-2xl p-7 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2.5">Uncompromising Quality</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              From sub-second page delivery to strict accessibility standards and bulletproof type safety, we treat digital craftsmanship as an exacting standard, never an afterthought.
            </p>
          </div>

          <div className="bg-[#0e121a] border border-slate-800/80 rounded-2xl p-7 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
              <Users2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2.5">Client Partnership Focus</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              We operate as a dedicated extension of your leadership team. Transparent sprints, rapid communications, and ongoing maintenance safeguard your long-term return on investment.
            </p>
          </div>
        </div>

        {/* Verified Company Statistics */}
        <div className="bg-gradient-to-r from-[#0d111a] via-[#101522] to-[#0d111a] border border-slate-800 rounded-2xl p-8 sm:p-10 shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80">
            {COMPANY_STATS.map((stat, index) => (
              <div
                key={index}
                className={`flex flex-col ${index > 0 ? 'pt-6 lg:pt-0 lg:pl-8' : ''}`}
              >
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-mono tracking-tight text-blue-400">
                  {stat.value}
                </span>
                <span className="mt-2 text-base font-semibold text-slate-200">
                  {stat.label}
                </span>
                <span className="mt-1 text-xs text-slate-400 leading-normal">
                  {stat.sublabel}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
